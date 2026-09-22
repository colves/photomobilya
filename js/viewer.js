import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { hideLoader, updateLoaderText, showError } from './loader.js';

let scene, camera, renderer, controls;

export async function initViewer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        showError("Görüntüleyici kapsayıcısı (container) bulunamadı.");
        return;
    }

    try {
        // 1. Sahne (Scene)
        scene = new THREE.Scene();
        scene.background = new THREE.Color('#f5f5f5');

        // 2. Kamera (Camera)
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        // Kamerayı odaya tepeden/çaprazdan bakacak şekilde yerleştir
        camera.position.set(4, 3, 5);

        // 3. Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        container.appendChild(renderer.domElement);

        // 4. Kontroller (OrbitControls)
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 1;
        controls.maxDistance = 15;
        // Kameranın zeminin altına geçmesini engelle (Polar açı sınırı)
        controls.maxPolarAngle = Math.PI / 2 - 0.05; 
        controls.target.set(0, 1, 0); // Sahnenin merkezine (biraz yukarı) odaklan

        // 5. HDRI Ortam Işığı Yükleme
        updateLoaderText("Ortam ışığı yükleniyor...");
        await loadHDRI('assets/hdr/photo_studio_01_1k.hdr');

        // 6. Geçici Sahne Geometrisi (Zemin, Duvarlar ve Örnek Objeler)
        createTemporaryGeometry();

        // İleride gerçek ADEKO GLB/GLTF modelini yükleyeceğimiz fonksiyon buraya gelecek
        // await loadAdekoModel('path/to/model.glb');

        // 7. Event Listeners
        window.addEventListener('resize', onWindowResize);

        // Yükleme tamamlandı
        hideLoader();

        // 8. Animasyon Döngüsü
        renderer.setAnimationLoop(animate);

    } catch (error) {
        showError("3D Sahne başlatılırken hata oluştu: " + error.message);
    }
}

async function loadHDRI(path) {
    return new Promise((resolve, reject) => {
        new RGBELoader().load(path, 
            (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture;
                // scene.background = texture; // Arka plan olarak kullanmak isterseniz açabilirsiniz
                resolve();
            },
            (xhr) => {
                // İlerleme durumu (opsiyonel)
            },
            (error) => {
                reject(new Error("HDRI yüklenemedi. Lütfen dosya yolunu kontrol edin."));
            }
        );
    });
}

function createTemporaryGeometry() {
    // Bu bölüm ileride ADEKO modeli yüklendiğinde silinecektir.

    // Zemin
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8, metalness: 0.2 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Grid (Zemini daha iyi algılamak için)
    const grid = new THREE.GridHelper(10, 10, 0x888888, 0xdddddd);
    scene.add(grid);

    // Geçici Mutfak Tezgahı / Dolap Temsili Kutu
    const boxGeo = new THREE.BoxGeometry(2, 0.9, 0.6);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.5, metalness: 0.1 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 0.45, -1);
    scene.add(box);

    // Geçici Yüksek Dolap
    const tallBoxGeo = new THREE.BoxGeometry(0.6, 2.2, 0.6);
    const tallBoxMat = new THREE.MeshStandardMaterial({ color: 0xd0d0d0, roughness: 0.5, metalness: 0.1 });
    const tallBox = new THREE.Mesh(tallBoxGeo, tallBoxMat);
    tallBox.position.set(-1.3, 1.1, -1);
    scene.add(tallBox);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    controls.update();
    renderer.render(scene, camera);
}
