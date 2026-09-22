import * as THREE from 'three';

let isAnimating = false;

/**
 * Kamerayı yumuşak bir şekilde yeni pozisyona taşır.
 */
function animateCamera(camera, controls, targetPosition, targetLookAt, duration = 1000) {
    if (isAnimating) return;
    isAnimating = true;

    const startPos = camera.position.clone();
    const startLookAt = controls.target.clone();

    let startTime = null;

    function animationStep(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing (Yumuşatma): easeInOutCubic
        const ease = progress < 0.5 
            ? 4 * progress * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        camera.position.lerpVectors(startPos, targetPosition, ease);
        controls.target.lerpVectors(startLookAt, targetLookAt, ease);
        controls.update();

        if (progress < 1) {
            requestAnimationFrame(animationStep);
        } else {
            isAnimating = false;
        }
    }

    requestAnimationFrame(animationStep);
}

/**
 * Kamera kontrol UI'sını başlatır.
 */
export function setupCameraControls(camera, controls, modelBoxData) {
    const controlsPanel = document.getElementById('camera-controls');
    
    if (!controlsPanel || !modelBoxData) return;
    
    // Model yüklendiğinde kontrolleri göster
    controlsPanel.classList.remove('hidden');

    const btnReset = document.getElementById('btn-view-reset');
    const btnFront = document.getElementById('btn-view-front');
    const btnSide = document.getElementById('btn-view-side');
    const btnTop = document.getElementById('btn-view-top');

    const { center, maxDim, initialCameraZ } = modelBoxData;

    // Hedef merkez (biraz yukarıya bakması için y ekseni offsetli)
    const lookAtTarget = new THREE.Vector3(center.x, center.y, center.z);
    
    // Güvenlik mesafesi
    const distance = initialCameraZ;

    // Click handler'ları temizle ve yeniden bekle
    btnReset.onclick = () => {
        const targetPos = new THREE.Vector3(center.x, center.y + (maxDim * 0.5), center.z + distance);
        animateCamera(camera, controls, targetPos, lookAtTarget);
    };

    btnFront.onclick = () => {
        const targetPos = new THREE.Vector3(center.x, center.y, center.z + distance);
        animateCamera(camera, controls, targetPos, lookAtTarget);
    };

    btnSide.onclick = () => {
        const targetPos = new THREE.Vector3(center.x + distance, center.y, center.z);
        animateCamera(camera, controls, targetPos, lookAtTarget);
    };

    btnTop.onclick = () => {
        // Tam tepeden bakarken up vektörü sorunu yaşamamak için z'yi hafif ofsetliyoruz
        const targetPos = new THREE.Vector3(center.x, center.y + distance, center.z + 0.01);
        animateCamera(camera, controls, targetPos, lookAtTarget);
    };
}

export function hideCameraControls() {
    const controlsPanel = document.getElementById('camera-controls');
    if (controlsPanel) {
        controlsPanel.classList.add('hidden');
    }
}
