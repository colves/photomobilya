import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { hideLoader, updateLoaderText, showError } from './loader.js';
import { loadModel, setBlobUrl } from './model-loader.js';
import { initWalkthrough, setWalkMode, updateWalkthrough } from './walkthrough-controller.js';
import { updateMaterialVariant } from './material-library.js';

let scene, camera, renderer, controls, mainLight;
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
        
        // Gölge ayarları (Performans dostu PCFSoft)
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
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

        // 6. HDRI Ortam Işığı Yükleme ve Stüdyo Işıkları
        updateLoaderText("Ortam ışığı yükleniyor...");
        await loadHDRI('assets/hdr/photo_studio_01_1k.hdr');
        setupLighting();

        // 7. Geçici Sahne Geometrisi
        createTemporaryGeometry();

        // 8. Event Listeners
        window.addEventListener('resize', onWindowResize);
        setupFileInput();
        setupConfigPanel();

        // 9. URL'den Model Yükleme Kontrolü
        const urlParams = new URLSearchParams(window.location.search);
        const modelUrl = urlParams.get('model');
        
        if (modelUrl) {
            const success = await loadModel(modelUrl, scene, camera, controls, removeTemporaryGeometry);
            if (success) {
                updateDynamicLighting(success.center, success.maxDim);
                showConfigPanel();
            }
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
            const success = await loadModel(fileUrl, scene, camera, controls, removeTemporaryGeometry);
            if (success) {
                updateDynamicLighting(success.center, success.maxDim);
                showConfigPanel();
            }
            
            // Aynı dosyayı tekrar seçebilmek için input'u sıfırla
            event.target.value = '';
        });
    }
}

function setupConfigPanel() {
    const configBtns = document.querySelectorAll('.config-btn');
    
    configBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target;
            const type = target.dataset.type;
            const val = target.dataset.val;
            
            // UI güncellemesi
            const siblings = target.parentElement.querySelectorAll('.config-btn');
            siblings.forEach(s => s.classList.remove('active'));
            target.classList.add('active');
            
            // Materyal kütüphanesi güncellemesi
            updateMaterialVariant(type, val);
        });
    });
}

function showConfigPanel() {
    const panel = document.getElementById('config-panel');
    if (panel) {
        panel.classList.remove('hidden');
        // Zorlayıcı (fallback) stiller ekleyelim (CSS çakışmalarını önler)
        panel.style.display = 'block';
        panel.style.opacity = '1';
        panel.style.visibility = 'visible';
        panel.style.pointerEvents = 'auto';
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

function setupLighting() {
    // 1. Ana Işık (Key Light)
    mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(5, 8, 5); // Varsayılan geçici konum
    mainLight.castShadow = true;

    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.bias = -0.0005;

    // Geçici sınırlar (Model yüklenince updateDynamicLighting ile değişecek)
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 25;
    mainLight.shadow.camera.left = -6;
    mainLight.shadow.camera.right = 6;
    mainLight.shadow.camera.top = 6;
    mainLight.shadow.camera.bottom = -6;
    scene.add(mainLight);

    // 2. Dolgu Işığı (Fill Light)
    const fillLight = new THREE.DirectionalLight(0xe4eaf5, 0.5); 
    fillLight.position.set(-5, 4, -5);
    fillLight.castShadow = false;
    scene.add(fillLight);

    // 3. Genel Ambiyans Işığı
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
}

/**
 * Yüklenen modelin boyutlarına göre ana ışığın pozisyonunu ve gölge alanını ayarlar.
 */
export function updateDynamicLighting(center, maxDim) {
    if (!mainLight) return;
    
    // Işığı modelin merkezine göre çapraz üst köşeye yerleştir
    const lightDistance = maxDim * 1.2;
    mainLight.position.set(
        center.x + lightDistance, 
        center.y + lightDistance, 
        center.z + lightDistance
    );
    mainLight.target.position.copy(center);
    scene.add(mainLight.target); // Hedefin sahnede güncellenmesi için eklenmesi gerekir

    // Gölge kamera sınırlarını modelin tamamını güvenle kaplayacak şekilde dinamik yap
    const shadowArea = maxDim * 0.8;
    mainLight.shadow.camera.left = -shadowArea;
    mainLight.shadow.camera.right = shadowArea;
    mainLight.shadow.camera.top = shadowArea;
    mainLight.shadow.camera.bottom = -shadowArea;
    
    // Near/Far sınırları
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = maxDim * 3;
    
    mainLight.shadow.camera.updateProjectionMatrix();
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
