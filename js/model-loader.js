import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { showLoader, hideLoader, updateLoaderText, showError } from './loader.js';
import { setupCameraControls, hideCameraControls } from './camera-controller.js';
import { updateWalkBoundingBox, generateColliders } from './walkthrough-controller.js';
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

        // ADEKO Çıktısı Ölçek Düzeltmesi (x10)
        currentModel.scale.set(10, 10, 10);
        // Transformu güncelle ki BoundingBox hesabı doğru yapılsın
        currentModel.updateMatrixWorld(true);

        // Dinamik Materyal Eşlemesini Uygula
        applyMaterialsToModel(currentModel);

        scene.add(currentModel);

        // Kamerayı ve modeli ayarla
        const modelBoxData = adjustCameraToModel(currentModel, camera, controls);
        
        // Çarpışma kutularını (Collider) üret (Model pozisyonlandıktan sonra)
        currentModel.updateMatrixWorld(true);
        generateColliders(currentModel);

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

    // Gezinme modu için sınırları (box) gönder
    updateWalkBoundingBox(newBox);

    return { center: newCenter, maxDim, initialCameraZ: cameraZ };
}
