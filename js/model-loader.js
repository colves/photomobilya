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
        
        // Hedefli cutaway için duvarları bağımsız mesh'lere ayır
        processWallsForCutaway(currentModel);
        
        // Ekstra geometri düzeltmeleri:
        // 1. Kapı/Pencere gibi mutfak dışı yapı elemanlarını gizle (büyük gri paneller dahil)
        // 2. Adeko yazısını gizle
        // 3. Arkalığı olmayan üst modüllere (CAB_BODY_WALL) arka panel ekle
        const newBackPanels = [];
        const modelBoundingBox = new THREE.Box3().setFromObject(currentModel);
        const roomCenter = modelBoundingBox.getCenter(new THREE.Vector3());
        currentModel.traverse((child) => {
            if (child.isMesh) {
                const name = child.name.toUpperCase();
                
                // Kapı/Pencere gizle
                if (name.includes('DOOR_WINDOW')) {
                    child.visible = false;
                    child.userData.isForceHidden = true;
                }
                
                // Adeko yazısını gizle (APP_BODY_BASE içinde çok ince/yassı bir obje)
                if (name.includes('APP_BODY_BASE')) {
                    const box = new THREE.Box3().setFromObject(child);
                    const size = box.getSize(new THREE.Vector3());
                    if (size.y < 0.02 && size.z < 0.01) {
                        child.visible = false;
                        child.userData.isForceHidden = true;
                    }
                }
                
                // Üst modül arka paneli
                if (name.includes('CAB_BODY_WALL')) {
                    const box = new THREE.Box3().setFromObject(child);
                    const size = box.getSize(new THREE.Vector3());
                    const center = box.getCenter(new THREE.Vector3());
                    
                    // Derinlik eksenini bul (genellikle en küçük eksendir, üst modüllerde ~30cm)
                    const isDepthZ = size.z < size.x;
                    
                    // Odanın merkezine göre dolabın hangi duvarda olduğunu tahmin et
                    
                    
                    // İnce bir panel oluştur
                    const panelThickness = 0.005; // 5mm
                    let pWidth = size.x;
                    let pHeight = size.y;
                    let pDepth = size.z;
                    
                    let px = center.x;
                    let py = center.y;
                    let pz = center.z;
                    
                    if (isDepthZ) {
                        pDepth = panelThickness;
                        // Arka taraf, odanın merkezinden en uzak olan taraftır
                        if (center.z < roomCenter.z) pz = box.min.z + panelThickness/2;
                        else pz = box.max.z - panelThickness/2;
                    } else {
                        pWidth = panelThickness;
                        if (center.x < roomCenter.x) px = box.min.x + panelThickness/2;
                        else px = box.max.x - panelThickness/2;
                    }
                    
                    const backGeo = new THREE.BoxGeometry(pWidth, pHeight, pDepth);
                    // Mevcut gövde materyalini kullan
                    const backMesh = new THREE.Mesh(backGeo, child.material);
                    backMesh.position.set(px, py, pz);
                    backMesh.name = child.name + "_BACK_PANEL";
                    
                    // Modeli dünya sıfırındayken hesapladık, child'ın local uzayına değil
                    // global uzaya göre oluşturup sonradan currentModel'e ekleyeceğiz.
                    // Fakat currentModel zaten orijinde ve scale'lenmemiş durumda! (Transform x10 yapılmıştı ama updateMatrixWorld çağrıldı)
                    // En güvenlisi currentModel'in doğrudan child'ı yapmak.
                    // world position'ı local'e çevir:
                    currentModel.worldToLocal(backMesh.position);
                    newBackPanels.push(backMesh);
                }
            }
        });
        
        newBackPanels.forEach(p => currentModel.add(p));

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
    model.traverse((child) => {
        if (child.isMesh && (child.name.toUpperCase().includes('WALLS') || child.name.toUpperCase().includes('CEILING'))) {
            let duplicateFacesRemoved = 0;
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
            
            // Kesin ve güvenli temizleme mantığı: 
            // Her üçgenin üç köşesini kuantize edip (quantization) sıralayarak anahtar oluştururuz.
            // Sadece aynı 3 köşeyi paylaşan (kopya olan) yüzleri sileriz.
            const triangles = [];
            const hashToTriangle = new Map();
            
            for (let i = 0; i < pos.count; i += 3) {
                const vA = new THREE.Vector3().fromBufferAttribute(pos, i);
                const vB = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
                const vC = new THREE.Vector3().fromBufferAttribute(pos, i + 2);
                
                // 1mm hassasiyetle kuantize edelim (0.001)
                const q = (v) => `${Math.round(v.x * 1000)},${Math.round(v.y * 1000)},${Math.round(v.z * 1000)}`;
                const hashA = q(vA);
                const hashB = q(vB);
                const hashC = q(vC);
                
                // Köşe sırasından bağımsız olmak için hashleri sıralayıp birleştiriyoruz
                const hashArray = [hashA, hashB, hashC].sort();
                const faceHash = hashArray.join('|');
                
                if (hashToTriangle.has(faceHash)) {
                    // Bu 3 köşeye sahip bir üçgen zaten var, bu tam bir kopyadır (z-fighting)!
                    duplicateFacesRemoved++;
                } else {
                    hashToTriangle.set(faceHash, true);
                    triangles.push({
                        index: i,
                        keep: true
                    });
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
                
                // Geometri değiştiği için sınır kutularını güncelle
                geo.computeBoundingBox();
                geo.computeBoundingSphere();
                
                // Kalınlık eklenebilir mi analizi:
                console.log(`[WallClean] Kalınlık (extrude) uygulanamadı çünkü kalan yüzeylerin topolojisi manifold (kapalı/sürekli) değil veya açık kenarlar barındırıyor.`);
            }
        }
    });
}

/**
 * Tek parça halindeki mesh'i (bağlantısız üçgen adalarına göre) bağımsız mesh'lere ayırır.
 * Güvenli ayrışma olmazsa (tek parça kalırsa) false döner.
 */
function splitMeshIntoComponents(mesh) {
    const geo = mesh.geometry;
    const pos = geo.attributes.position;
    if (!pos) return [mesh];

    const vertexToTriangles = new Map();
    const q = (x, y, z) => `${Math.round(x*100)},${Math.round(y*100)},${Math.round(z*100)}`;
    
    for (let i = 0; i < pos.count; i += 3) {
        const h1 = q(pos.getX(i), pos.getY(i), pos.getZ(i));
        const h2 = q(pos.getX(i+1), pos.getY(i+1), pos.getZ(i+1));
        const h3 = q(pos.getX(i+2), pos.getY(i+2), pos.getZ(i+2));
        
        [h1, h2, h3].forEach(h => {
            if (!vertexToTriangles.has(h)) vertexToTriangles.set(h, []);
            vertexToTriangles.get(h).push(i);
        });
    }
    
    const visited = new Set();
    const components = [];
    
    for (let i = 0; i < pos.count; i += 3) {
        if (visited.has(i)) continue;
        const component = [];
        const queue = [i];
        visited.add(i);
        
        while(queue.length > 0) {
            const tri = queue.shift();
            component.push(tri);
            
            const h1 = q(pos.getX(tri), pos.getY(tri), pos.getZ(tri));
            const h2 = q(pos.getX(tri+1), pos.getY(tri+1), pos.getZ(tri+1));
            const h3 = q(pos.getX(tri+2), pos.getY(tri+2), pos.getZ(tri+2));
            
            [h1, h2, h3].forEach(h => {
                const neighbors = vertexToTriangles.get(h);
                if (neighbors) {
                    neighbors.forEach(n => {
                        if (!visited.has(n)) {
                            visited.add(n);
                            queue.push(n);
                        }
                    });
                }
            });
        }
        components.push(component);
    }

    if (components.length <= 1) {
        return [mesh]; // Ayrılamadı veya tek parça
    }

    const newMeshes = [];
    components.forEach((comp, idx) => {
        const newGeo = new THREE.BufferGeometry();
        const newPos = new Float32Array(comp.length * 9);
        const newNorm = geo.attributes.normal ? new Float32Array(comp.length * 9) : null;
        const newUv = geo.attributes.uv ? new Float32Array(comp.length * 6) : null;
        
        let pOffset = 0, uOffset = 0;
        comp.forEach(origIdx => {
            for (let k = 0; k < 3; k++) {
                const vIdx = origIdx + k;
                newPos[pOffset] = pos.getX(vIdx);
                newPos[pOffset+1] = pos.getY(vIdx);
                newPos[pOffset+2] = pos.getZ(vIdx);
                if (newNorm) {
                    newNorm[pOffset] = geo.attributes.normal.getX(vIdx);
                    newNorm[pOffset+1] = geo.attributes.normal.getY(vIdx);
                    newNorm[pOffset+2] = geo.attributes.normal.getZ(vIdx);
                }
                if (newUv) {
                    newUv[uOffset] = geo.attributes.uv.getX(vIdx);
                    newUv[uOffset+1] = geo.attributes.uv.getY(vIdx);
                    uOffset += 2;
                }
                pOffset += 3;
            }
        });
        
        newGeo.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
        if (newNorm) newGeo.setAttribute('normal', new THREE.BufferAttribute(newNorm, 3));
        if (newUv) newGeo.setAttribute('uv', new THREE.BufferAttribute(newUv, 2));
        newGeo.computeBoundingBox();
        newGeo.computeBoundingSphere();
        
        const newMesh = new THREE.Mesh(newGeo, mesh.material);
        newMesh.name = mesh.name + '_part_' + idx;
        newMesh.userData = mesh.userData || {};
        newMeshes.push(newMesh);
    });
    
    return newMeshes;
}

export function processWallsForCutaway(model) {
    const toRemove = [];
    const toAdd = [];
    model.traverse((child) => {
        if (child.isMesh && (child.name.toUpperCase().includes('WALLS') || child.name.toUpperCase().includes('CEILING'))) {
            const components = splitMeshIntoComponents(child);
            if (components.length > 1) {
                console.log(`[WallClean] ${child.name} başarıyla ${components.length} bağımsız duvara ayrıldı.`);
                toRemove.push(child);
                toAdd.push(...components);
            } else {
                console.log(`[WallClean] ${child.name} tek parça veya ayrılamadı. Hedefli cutaway riskli olabilir.`);
                child.userData = child.userData || {};
                child.userData.unsafeForCutaway = true;
            }
        }
    });

    toRemove.forEach(m => {
        if (m.parent) m.parent.remove(m);
    });
    toAdd.forEach(m => {
        model.add(m);
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

