import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { showLoader, hideLoader, updateLoaderText, showError } from './loader.js';

let currentModel = null;
const gltfLoader = new GLTFLoader();

/**
 * URL'den veya Dosyadan (Blob) GLB/GLTF modeli yükler.
 * @param {string} url - Modelin yolu veya Blob URL'i
 * @param {THREE.Scene} scene - Three.js sahnesi
 * @param {THREE.Camera} camera - Sahne kamerası
 * @param {OrbitControls} controls - Kamera kontrolleri
 * @param {Function} removeTempGeoCallback - Geçici objeleri silme fonksiyonu
 */
export async function loadModel(url, scene, camera, controls, removeTempGeoCallback) {
    showLoader();
    updateLoaderText("Model yükleniyor... %0");

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
            scene.remove(currentModel);
            // İdeal dünyada materyalleri ve geometrileri dispose etmek gerekir 
            // ama prototip aşamasında basit tutuyoruz.
        }

        // Geçici objeleri sil
        if (removeTempGeoCallback) {
            removeTempGeoCallback();
        }

        currentModel = gltf.scene;
        scene.add(currentModel);

        // Kamerayı modele göre ayarla
        adjustCameraToModel(currentModel, camera, controls);

        hideLoader();

    } catch (error) {
        showError("Model yüklenemedi. Lütfen geçerli bir .glb/.gltf dosyası olduğundan emin olun.");
        console.error(error);
    }
}

/**
 * Modeli merkeze alır ve kamerayı modele göre ölçekler.
 */
function adjustCameraToModel(model, camera, controls) {
    // Modelin bounding box'ını (sınır kutusunu) hesapla
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // Modeli Orijine (0,0,0) taşı
    model.position.x += (model.position.x - center.x);
    model.position.y += (model.position.y - center.y) + (size.y / 2); // Zemine oturt
    model.position.z += (model.position.z - center.z);

    // Yeni merkezi hesapla
    const newBox = new THREE.Box3().setFromObject(model);
    const newCenter = newBox.getCenter(new THREE.Vector3());

    // En büyük boyutu bul (kamerayı ne kadar uzaklaştıracağımızı belirlemek için)
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    
    // Güvenlik payı ekle
    cameraZ *= 1.5; 

    // Kamerayı yeni pozisyona al
    camera.position.set(newCenter.x, newCenter.y + (size.y / 2), newCenter.z + cameraZ);

    // OrbitControls hedefini modelin merkezine ayarla
    controls.target.set(newCenter.x, newCenter.y, newCenter.z);

    // OrbitControls sınırlarını modele göre güncelle
    controls.minDistance = maxDim * 0.1; // Çok fazla içine girmeyi engelle
    controls.maxDistance = maxDim * 3;   // Çok fazla uzaklaşmayı engelle
    
    controls.update();
}
