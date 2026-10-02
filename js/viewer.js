import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { hideLoader, updateLoaderText, showError } from './loader.js';
import { loadModel, setBlobUrl } from './model-loader.js';
import { updateMaterialVariant, setOnlyDoorsMode, safeUpper } from './material-library.js';
import { reapplyMaterials } from './model-loader.js';

let scene, camera, renderer, controls, mainLight;

let tempGeometries = [];

export async function initViewer(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        showError("GÃ¶rÃ¼ntÃ¼leyici kapsayÄ±cÄ±sÄ± (container) bulunamadÄ±.");
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
        
        // GÃ¶lge ayarlarÄ± (Performans dostu PCFSoft)
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
        controls.addEventListener('change', requestRenderIfNotRequested);
        controls.addEventListener('start', requestRenderIfNotRequested);
        controls.addEventListener('end', requestRenderIfNotRequested); 

        // 6. HDRI Ortam IÅŸÄ±ÄŸÄ± YÃ¼kleme ve StÃ¼dyo IÅŸÄ±klarÄ±
        loadHDRIAsync('assets/hdr/photo_studio_01_1k.hdr');
        setupLighting();

        // 7. GeÃ§ici Sahne Geometrisi
        createTemporaryGeometry();

        // 8. Event Listeners
        window.addEventListener('resize', () => { onWindowResize(); requestRenderIfNotRequested(); });
        setupFileInput();
        setupConfigPanel();

        // 9. URL'den Model YÃ¼kleme KontrolÃ¼
        const urlParams = new URLSearchParams(window.location.search);
        const modelUrl = urlParams.get('model');
        
        if (modelUrl) {
            const success = await loadModel(modelUrl, scene, camera, controls, removeTemporaryGeometry);
            if (success) {
                updateDynamicLighting(success.center, success.maxDim);
                roomBoundingBox = success.boundingBox;
                buildRaycastLists(scene);
                showConfigPanel(); requestRenderIfNotRequested();
            }
        } else {
            hideLoader();
        }

        // 10. Animasyon DÃ¶ngÃ¼sÃ¼
        

    } catch (error) {
        showError("3D Sahne baÅŸlatÄ±lÄ±rken hata oluÅŸtu: " + error.message);
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
                roomBoundingBox = success.boundingBox;
                buildRaycastLists(scene);
                showConfigPanel(); requestRenderIfNotRequested();
            }
            
            // AynÄ± dosyayÄ± tekrar seÃ§ebilmek iÃ§in input'u sÄ±fÄ±rla
            event.target.value = '';
        });
    }
}

function setupConfigPanel() {
    const configBtns = document.querySelectorAll('.renk-btn');
    
    configBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            const type = target.dataset.type;
            const val = target.dataset.val;
            
            // Eger kapak ('door') seï¿½ildiyse, tï¿½m kapak butonlarindaki active sinifini kaldir
            if (type === 'door') {
                const allDoorBtns = document.querySelectorAll('.renk-btn[data-type="door"]');
                allDoorBtns.forEach(b => b.classList.remove('active'));
            } else {
                const siblings = target.parentElement.querySelectorAll('.renk-btn');
                siblings.forEach(s => s.classList.remove('active'));
            }
            
            target.classList.add('active');
            updateMaterialVariant(type, val); requestRenderIfNotRequested();
        });
    });
    const toggle = document.getElementById('only-doors-toggle');
    if (toggle) {
        toggle.addEventListener('change', (e) => {
            setOnlyDoorsMode(e.target.checked);
            reapplyMaterials(); requestRenderIfNotRequested();
        });
    }
}

function showConfigPanel() {
    const panel = document.getElementById('config-panel');
    if (panel) {
        panel.classList.remove('hidden');
        // ZorlayÄ±cÄ± (fallback) stiller ekleyelim (CSS Ã§akÄ±ÅŸmalarÄ±nÄ± Ã¶nler)
        panel.style.display = 'block';
        panel.style.opacity = '1';
        panel.style.visibility = 'visible';
        panel.style.pointerEvents = 'auto';
    }
}

function loadHDRIAsync(path) {
    new RGBELoader().load(path, 
        (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
            requestRenderIfNotRequested();
        },
        undefined,
        (error) => {
            console.warn('HDRI yüklenemedi veya gecikti, temel ışıklarla devam ediliyor.', error);
        }
    );
} else if (!name.includes('FILLER')) {
            if (objectToHide) hasFurnitureBehind = true;
            break;
        }
    }

    if (objectToHide && hasFurnitureBehind) {
        const hideName = safeUpper(objectToHide.name);
        const hideList = [];
        
        if (hideName.includes('CEILING')) {
            wallAndCeilingMeshes.forEach(m => {
                if (safeUpper(m.name).includes('CEILING')) hideList.push(m);
            });
        } else if (hideName.includes('DOOR_WINDOW') || hideName.includes('WINDOW_GLASSES') || hideName.includes('PORAL')) {
            const hideBox = new THREE.Box3().setFromObject(objectToHide);
            hideBox.expandByScalar(0.2); 
            wallAndCeilingMeshes.forEach(m => {
                const n = safeUpper(m.name);
                if (n.includes('DOOR_WINDOW') || n.includes('WINDOW_GLASSES') || n.includes('PORAL')) {
                    const mBox = new THREE.Box3().setFromObject(m);
                    if (hideBox.intersectsBox(mBox)) {
                        hideList.push(m);
                    }
                }
            });
        } else {
            hideList.push(objectToHide);
        }

        hideList.forEach(m => {
            m.visible = false;
            lastHiddenMeshes.add(m);
        });
    }
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let renderRequested = false;
export function requestRenderIfNotRequested() {
    if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(render);
    }
}
function render() {
    renderRequested = false;
    if (controls) controls.update();
    if (camera && controls) updateCutaway();
    if (renderer && scene && camera) renderer.render(scene, camera);
}














export function buildRaycastLists(scene) {
    wallAndCeilingMeshes = [];
    raycastMeshes = [];
    
    scene.traverse((child) => {
        if (child.isMesh) {
            const name = safeUpper(child.name);
            
            // Yapisal adaylar (Gizlenebilecek olanlar)
            const isStructure = (
                name.includes('WALLS') || 
                name.includes('WALL_BEAM') || 
                name.includes('CEILING') || 
                name.includes('DOOR_WINDOW') || 
                name.includes('WINDOW_GLASSES') ||
                name.includes('PORAL')
            ) && !name.includes('CAB_BODY') && !name.includes('BACK_PANEL');

            // Mobilya engelleyicileri (Arkasinda kalinca gizlenmeyi tetikleyenler)
            const isStrictFurniture = (
                name.includes('CAB_') || 
                name.includes('PANEL') || 
                name.includes('SHELV') || 
                name.includes('HANDLE') || 
                name.includes('KNOB') || 
                name.includes('APP') || 
                name.includes('BULSK') || 
                name.includes('REFRIG') || 
                name.includes('FRIDGE') ||
                name.includes('OVEN') || 
                name.includes('SINK') || 
                name.includes('ARMATURE') || 
                name.includes('SANITARY') || 
                name.includes('WORKTOP') ||
                name.includes('PLINTH') ||
                name.includes('CORNICE')
            ) && !name.includes('FLOOR');

            if (isStructure) {
                wallAndCeilingMeshes.push(child);
                raycastMeshes.push(child);
            } else if (isStrictFurniture) {
                raycastMeshes.push(child);
            }
        }
    });
}



















