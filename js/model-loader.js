import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { showLoader, hideLoader, updateLoaderText, showError } from './loader.js';
import { setupCameraControls, hideCameraControls } from './camera-controller.js';
import { applyMaterialsToModel } from './material-library.js';

let currentModel = null;
let currentObjectUrl = null;
const gltfLoader = new GLTFLoader();

/**
 * Eski modelin bellekten (GPU) temizlenmesi
 */
function disposeModel(scene, model) {
    if (!model) return;
    
    scene.remove(model);
    
    model.traverse((child) => {
        if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            // Not: Yeni sistemde materyaller ortak (library) olduğu için 
            // eski modelin silinmesi sırasında library materyallerini dispose etmemeliyiz.
            // Bu nedenle sadece geometrileri siliyoruz.
        }
    });
}

/**
 * URL'den veya Dosyadan (Blob) GLB modeli yükler.
 */
export async function loadModel(url, scene, camera, controls, removeTempGeoCallback) {
    showLoader();
    updateLoaderText("Model yükleniyor... %0");
    hideCameraControls();

    try {
        const gltf = await new Promise((resolve, reject) => {
            gltfLoader.load(
                url,
                (loadedGltf) => resolve(loadedGltf),
                (xhr) => {
                    if (xhr.lengthComputable) {
                        const percentComplete = Math.round((xhr.loaded / xhr.total) * 100);
                        updateLoaderText(`Model yükleniyor... %${percentComplete}`);
                    } else {
                        updateLoaderText(`Model yükleniyor... ${(xhr.loaded / (1024 * 1024)).toFixed(1)} MB`);
                    }
                },
                (error) => reject(error)
            );
        });

        // Eskisini temizle
        if (currentModel) {
            disposeModel(scene, currentModel);
            currentModel = null;
        }

        // Geçici objeleri sil
        if (removeTempGeoCallback) {
            removeTempGeoCallback();
        }

        currentModel = gltf.scene;

        // Transformu güncelle ki ham (raw) BoundingBox hesabı doğru yapılsın
        currentModel.updateMatrixWorld(true);
        const rawBox = new THREE.Box3().setFromObject(currentModel);
        const rawSize = rawBox.getSize(new THREE.Vector3());
        const maxRawDim = Math.max(rawSize.x, rawSize.y, rawSize.z);

        // Ölçek Normalizasyonu (Auto-Scale Logic)
        // ADEKO/Babylon GLB çıktıları genelde 0.1 ölçeklidir (örn: 2.3m tavan 0.23 birim, 6m tezgâh 0.6 birim gelir).
        // Eğer modelin en büyük ölçüsü 2.0'dan, yüksekliği (Y) ise 0.5'ten küçükse, bunun 0.1 ölçekli
        // bir model olduğunu varsayarak x10 ile metre standardına (1 birim = 1 metre) getiriyoruz.
        // Diğer durumlarda (örn: Y > 2.0 ise metre ölçeğindedir) hiçbir düzeltme (x1) yapmıyoruz.
        if (maxRawDim > 0.1 && maxRawDim < 2.0 && rawSize.y < 0.5) {
            console.log(`[ModelLoader] ADEKO/Babylon (0.1) ölçeği tespit edildi. Normalizasyon için x10 uygulanıyor. Ham Max: ${maxRawDim.toFixed(2)}, Y: ${rawSize.y.toFixed(2)}`);
            currentModel.scale.set(10, 10, 10);
            currentModel.updateMatrixWorld(true);
        } else {
            console.log(`[ModelLoader] Model zaten metre ölçeğinde veya belirsiz. Normalizasyon atlanıyor. Ham Max: ${maxRawDim.toFixed(2)}, Y: ${rawSize.y.toFixed(2)}`);
            // x1 kalır
        }

        // Dinamik Materyal Eşlemesini Uygula
        applyMaterialsToModel(currentModel);

        // Duvar geometrisini analiz et ve güvenli şekilde çift katmanları / Z-fighting yapan yüzleri temizle
        cleanWallGeometry(currentModel);

        scene.add(currentModel);

        // Kamerayı ve modeli ayarla
        const modelBoxData = adjustCameraToModel(currentModel, camera, controls);
        
        // Kamera kontrollerini başlat
        setupCameraControls(camera, controls, modelBoxData);

        hideLoader();
        return modelBoxData;

    } catch (error) {
        showError("Model yüklenemedi. Lütfen geçerli ve tek parça bir .glb dosyası olduğundan emin olun.");
        console.error("Yükleme Hatası:", error);
        return false;
    } finally {
        // Blob URL temizliği (sızıntıyı önle)
        if (currentObjectUrl === url) {
            URL.revokeObjectURL(currentObjectUrl);
            currentObjectUrl = null;
        }
    }
}

/**
 * Dosya seçiciden gelen Blob için URL oluşturup kaydeder (ileride silmek için).
 */
export function setBlobUrl(url) {
    currentObjectUrl = url;
}

/**
 * Duvar geometrisindeki çakışan (Z-fighting) yüzleri analiz eder ve güvenle temizler.
 */
function cleanWallGeometry(model) {
    let duplicateFacesRemoved = 0;
    
    model.traverse((child) => {
        if (child.isMesh && (child.name.toUpperCase().includes('WALLS') || child.name.toUpperCase().includes('CEILING'))) {
            let geo = child.geometry;
            if (!geo || !geo.attributes.position) return;
            
            // Non-indexed ise işlemek daha kolay (her 3 vertex 1 üçgen)
            if (geo.index !== null) {
                console.log(`[WallClean] ${child.name} indexed geometriye sahip. Non-indexed formata çevriliyor...`);
                geo = geo.toNonIndexed();
                child.geometry = geo; // Yeni geometriyi ata
            }
            
            const pos = geo.attributes.position;
            console.log(`[WallClean] ${child.name} analiz ediliyor... Toplam üçgen: ${pos.count / 3}`);
            
            // Basit temizleme mantığı: 
            // Aynı normal'e sahip ve merkez noktaları birbirine çok yakın (0.01 birimden az) olan üçgenleri bul
            const triangles = [];
            for (let i = 0; i < pos.count; i += 3) {
                const vA = new THREE.Vector3().fromBufferAttribute(pos, i);
                const vB = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
                const vC = new THREE.Vector3().fromBufferAttribute(pos, i + 2);
                
                const center = new THREE.Vector3().add(vA).add(vB).add(vC).divideScalar(3);
                
                const cb = new THREE.Vector3().subVectors(vC, vB);
                const ab = new THREE.Vector3().subVectors(vA, vB);
                const normal = new THREE.Vector3().crossVectors(cb, ab).normalize();
                
                triangles.push({
                    index: i,
                    center: center,
                    normal: normal,
                    keep: true
                });
            }
            
            // Çakışan üçgenleri bul
            for (let i = 0; i < triangles.length; i++) {
                if (!triangles[i].keep) continue;
                
                for (let j = i + 1; j < triangles.length; j++) {
                    if (!triangles[j].keep) continue;
                    
                    const dist = triangles[i].center.distanceTo(triangles[j].center);
                    if (dist < 0.05) { // 5 cm içinde
                        const dot = triangles[i].normal.dot(triangles[j].normal);
                        if (dot > 0.95 || dot < -0.95) { // Aynı veya zıt yöne bakıyorlar
                            triangles[j].keep = false;
                            duplicateFacesRemoved++;
                        }
                    }
                }
            }
            
            // Yeni geometriyi oluştur
            if (duplicateFacesRemoved > 0) {
                const keptCount = triangles.filter(t => t.keep).length;
                console.log(`[WallClean] ${child.name} Z-fighting tespiti: ${duplicateFacesRemoved} çakışan yüzey silindi. Kalan üçgen: ${keptCount}`);
                
                const newPosArray = new Float32Array(keptCount * 3 * 3); // 3 vertex * 3 (x,y,z)
                const newNormalArray = geo.attributes.normal ? new Float32Array(keptCount * 3 * 3) : null;
                const newUvArray = geo.attributes.uv ? new Float32Array(keptCount * 3 * 2) : null;
                
                let offsetPos = 0;
                let offsetUv = 0;
                
                triangles.forEach(t => {
                    if (t.keep) {
                        for (let k = 0; k < 3; k++) {
                            const origIdx = t.index + k;
                            newPosArray[offsetPos] = pos.getX(origIdx);
                            newPosArray[offsetPos + 1] = pos.getY(origIdx);
                            newPosArray[offsetPos + 2] = pos.getZ(origIdx);
                            
                            if (newNormalArray) {
                                newNormalArray[offsetPos] = geo.attributes.normal.getX(origIdx);
                                newNormalArray[offsetPos + 1] = geo.attributes.normal.getY(origIdx);
                                newNormalArray[offsetPos + 2] = geo.attributes.normal.getZ(origIdx);
                            }
                            
                            if (newUvArray) {
                                newUvArray[offsetUv] = geo.attributes.uv.getX(origIdx);
                                newUvArray[offsetUv + 1] = geo.attributes.uv.getY(origIdx);
                                offsetUv += 2;
                            }
                            
                            offsetPos += 3;
                        }
                    }
                });
                
                geo.setAttribute('position', new THREE.BufferAttribute(newPosArray, 3));
                if (newNormalArray) geo.setAttribute('normal', new THREE.BufferAttribute(newNormalArray, 3));
                if (newUvArray) geo.setAttribute('uv', new THREE.BufferAttribute(newUvArray, 2));
                
                // Kalınlık eklenebilir mi analizi:
                console.log(`[WallClean] Kalınlık (extrude) uygulanamadı çünkü kalan yüzeylerin topolojisi manifold (kapalı/sürekli) değil veya açık kenarlar barındırıyor.`);
            }
        }
    });
}

/**
 * Modeli merkeze ve zemine alır, kamerayı ölçekler.
 */
function adjustCameraToModel(model, camera, controls) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const minY = box.min.y;

    // Modeli X ve Z ekseninde orijine, Y ekseninde zemine (0) oturt
    model.position.x -= center.x;
    model.position.y -= minY;
    model.position.z -= center.z;

    // Yeni durumun merkezini bul
    const newBox = new THREE.Box3().setFromObject(model);
    const newCenter = newBox.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    
    // Güvenlik payı ekle
    cameraZ *= 1.5; 

    // Kamerayı varsayılan ana pozisyona al (biraz yüksekten)
    camera.position.set(newCenter.x, newCenter.y + (maxDim * 0.5), newCenter.z + cameraZ);
    controls.target.set(newCenter.x, newCenter.y, newCenter.z);

    controls.minDistance = maxDim * 0.1;
    controls.maxDistance = maxDim * 3;
    
    controls.update();

    return { center: newCenter, maxDim, initialCameraZ: cameraZ, boundingBox: newBox };
}
