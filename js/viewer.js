import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { hideLoader, updateLoaderText, showError } from './loader.js';
import { loadModel, setBlobUrl } from './model-loader.js';
import { initWalkthrough, setWalkMode, updateWalkthrough } from './walkthrough-controller.js';

let scene, camera, renderer, controls;
let tempGeometries = [];

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
        camera.position.set(4, 3, 5);

        // 3. Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(renderer.domElement);

        // 4. Kontroller (OrbitControls)
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 1;
        controls.maxDistance = 15;
        controls.maxPolarAngle = Math.PI / 2 - 0.05; 
        controls.target.set(0, 1, 0); 

        // 5. Gezinme Modu (Walkthrough) Başlatma
        initWalkthrough(camera, renderer, controls);
        setupModeToggles();

        // 6. HDRI Ortam Işığı Yükleme
        updateLoaderText("Ortam ışığı yükleniyor...");
        await loadHDRI('assets/hdr/photo_studio_01_1k.hdr');

        // 7. Geçici Sahne Geometrisi
        createTemporaryGeometry();

        // 8. Event Listeners
        window.addEventListener('resize', onWindowResize);
        setupFileInput();

        // 9. URL'den Model Yükleme Kontrolü
        const urlParams = new URLSearchParams(window.location.search);
        const modelUrl = urlParams.get('model');
        
        if (modelUrl) {
            await loadModel(modelUrl, scene, camera, controls, removeTemporaryGeometry);
        } else {
            hideLoader();
        }

        // 10. Animasyon Döngüsü
        renderer.setAnimationLoop(animate);

    } catch (error) {
        showError("3D Sahne başlatılırken hata oluştu: " + error.message);
    }
}

function setupModeToggles() {
    const btnInspect = document.getElementById('btn-mode-inspect');
    const btnWalk = document.getElementById('btn-mode-walk');
    
    if (btnInspect && btnWalk) {
        btnInspect.addEventListener('click', () => {
            btnInspect.classList.add('active');
            btnWalk.classList.remove('active');
            setWalkMode(false);
        });
        
        btnWalk.addEventListener('click', () => {
            btnWalk.classList.add('active');
            btnInspect.classList.remove('active');
            setWalkMode(true);
        });
    }
}

function setupFileInput() {
    const fileInput = document.getElementById('model-upload');
    if (fileInput) {
        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const fileUrl = URL.createObjectURL(file);
            setBlobUrl(fileUrl);
            await loadModel(fileUrl, scene, camera, controls, removeTemporaryGeometry);
            
            // Aynı dosyayı tekrar seçebilmek için input'u sıfırla
            event.target.value = '';
        });
    }
}

async function loadHDRI(path) {
    return new Promise((resolve, reject) => {
        new RGBELoader().load(path, 
            (texture) => {
                texture.mapping = THREE.EquirectangularReflectionMapping;
                scene.environment = texture;
                resolve();
            },
            undefined,
            (error) => {
                reject(new Error("HDRI yüklenemedi."));
            }
        );
    });
}

function createTemporaryGeometry() {
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8, metalness: 0.2 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    tempGeometries.push(floor);

    const grid = new THREE.GridHelper(10, 10, 0x888888, 0xdddddd);
    scene.add(grid);
    tempGeometries.push(grid);

    const boxGeo = new THREE.BoxGeometry(2, 0.9, 0.6);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.5, metalness: 0.1 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(0, 0.45, -1);
    scene.add(box);
    tempGeometries.push(box);
}

function removeTemporaryGeometry() {
    tempGeometries.forEach(obj => {
        scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    });
    tempGeometries = [];
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    controls.update();
    updateWalkthrough();
    renderer.render(scene, camera);
}
