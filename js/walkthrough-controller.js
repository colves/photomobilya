import * as THREE from 'three';

let isWalkMode = false;
let camera, renderer, orbitControls, boundingBox;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Mobil D-Pad durumları
let touchUp = false, touchDown = false, touchLeft = false, touchRight = false;

// Bakış kontrolleri
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let euler = new THREE.Euler(0, 0, 0, 'YXZ');
const lookSpeed = 0.004;

// Zemin seviyesi (göz hizası yüksekliği)
const EYE_HEIGHT = 1.6;

export function initWalkthrough(cam, rend, orbControls) {
    camera = cam;
    renderer = rend;
    orbitControls = orbControls;
    
    // Klavye dinleyicileri
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    
    // Bakış dinleyicileri
    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    domElement.addEventListener('mousemove', onMouseMove);
    domElement.addEventListener('mouseup', onMouseUp);
    domElement.addEventListener('mouseleave', onMouseUp);

    domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    domElement.addEventListener('touchmove', onTouchMove, { passive: false });
    domElement.addEventListener('touchend', onTouchEnd);

    // D-Pad dinleyicileri
    setupDPad();

    // Varsayılan Sınırlar (Model gelene kadar geçici oda)
    updateWalkBoundingBox(null);
}

export function updateWalkBoundingBox(box) {
    if (box) {
        boundingBox = box.clone();
        // Sınırları içeri doğru biraz daralt ki duvarın içine girmesin
        boundingBox.min.addScalar(0.5);
        boundingBox.max.subScalar(0.5);
    } else {
        // Geçici sahne için makul sınırlar (-5 to 5 floor)
        boundingBox = new THREE.Box3(
            new THREE.Vector3(-4.5, 0, -4.5),
            new THREE.Vector3(4.5, 5, 4.5)
        );
    }
}

export function setWalkMode(active) {
    isWalkMode = active;
    
    const dpadEl = document.getElementById('mobile-walk-controls');
    
    if (isWalkMode) {
        orbitControls.enabled = false;
        
        // Kamerayı yere hizala ve düz bakmasını sağla
        euler.setFromQuaternion(camera.quaternion, 'YXZ');
        euler.x = 0; // Ufka bak
        camera.quaternion.setFromEuler(euler);
        
        // Göz hizasına getir, X ve Z'yi koru
        camera.position.y = Math.max(EYE_HEIGHT, boundingBox ? boundingBox.min.y + EYE_HEIGHT : EYE_HEIGHT);
        
        if (dpadEl) dpadEl.classList.remove('hidden');
    } else {
        orbitControls.enabled = true;
        // Orbit controls'ün hedefinin şaşmaması için ileriye bir target belirle
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        orbitControls.target.copy(camera.position).add(forward.multiplyScalar(2));
        orbitControls.update();
        
        if (dpadEl) dpadEl.classList.add('hidden');
    }
    
    // Hareket verilerini sıfırla
    velocity.set(0, 0, 0);
    moveForward = moveBackward = moveLeft = moveRight = false;
    touchUp = touchDown = touchLeft = touchRight = false;
    isDragging = false;
    prevTime = performance.now();
}

export function updateWalkthrough() {
    if (!isWalkMode) return;

    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    prevTime = time;

    // Sürtünme (yavaşlama)
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    direction.z = Number(moveForward || touchUp) - Number(moveBackward || touchDown);
    direction.x = Number(moveRight || touchRight) - Number(moveLeft || touchLeft);
    direction.normalize(); // Çapraz gitme hızını eşitle

    // Hız ivmesi
    const speed = 20.0;
    if (moveForward || moveBackward || touchUp || touchDown) velocity.z -= direction.z * speed * delta;
    if (moveLeft || moveRight || touchLeft || touchRight) velocity.x -= direction.x * speed * delta;

    // Hareketi kameranın baktığı yöne (lokal eksene) göre uygula
    camera.translateX(velocity.x * delta);
    camera.translateZ(velocity.z * delta);

    // Y eksenini sabitle (göz hizası)
    const baseHeight = boundingBox ? boundingBox.min.y : 0;
    camera.position.y = baseHeight + EYE_HEIGHT;

    // Sınır kontrolü (Bounding Box)
    if (boundingBox) {
        camera.position.x = Math.max(boundingBox.min.x, Math.min(boundingBox.max.x, camera.position.x));
        camera.position.z = Math.max(boundingBox.min.z, Math.min(boundingBox.max.z, camera.position.z));
    }
}

/* ================= Bakış (Sürükleme) ================= */

function handleLook(deltaX, deltaY) {
    if (!isWalkMode) return;
    
    euler.setFromQuaternion(camera.quaternion);
    
    euler.y -= deltaX * lookSpeed;
    euler.x -= deltaY * lookSpeed;
    
    // Yukarı/Aşağı bakış sınırı (tam tepeye veya tam yere bakmayı engelle)
    const PI_2 = Math.PI / 2;
    euler.x = Math.max(-PI_2 + 0.1, Math.min(PI_2 - 0.1, euler.x));
    
    camera.quaternion.setFromEuler(euler);
}

function onMouseDown(e) {
    if (!isWalkMode) return;
    isDragging = true;
    previousMousePosition.x = e.clientX;
    previousMousePosition.y = e.clientY;
}

function onMouseMove(e) {
    if (!isWalkMode || !isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;
    previousMousePosition.x = e.clientX;
    previousMousePosition.y = e.clientY;
    handleLook(deltaX, deltaY);
}

function onMouseUp() {
    isDragging = false;
}

function onTouchStart(e) {
    if (!isWalkMode || e.touches.length !== 1) return;
    // Eğer butona dokunuluyorsa bakış açısını değiştirme
    if (e.target.classList.contains('dpad-btn')) return;
    
    isDragging = true;
    previousMousePosition.x = e.touches[0].clientX;
    previousMousePosition.y = e.touches[0].clientY;
}

function onTouchMove(e) {
    if (!isWalkMode || !isDragging || e.touches.length !== 1) return;
    if (e.target.classList.contains('dpad-btn')) return;
    
    // Touch'ta varsayılan kaydırmayı engelle
    if (e.cancelable) e.preventDefault();

    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;
    previousMousePosition.x = e.touches[0].clientX;
    previousMousePosition.y = e.touches[0].clientY;
    
    // Mobilde hassasiyeti biraz düşür
    handleLook(deltaX * 0.8, deltaY * 0.8);
}

function onTouchEnd() {
    isDragging = false;
}

/* ================= Klavye ================= */

function onKeyDown(event) {
    if (!isWalkMode) return;
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
        case 'Escape':
            // Gezinme modundan çıkış kısa yolu
            const btnInspect = document.getElementById('btn-mode-inspect');
            if (btnInspect) btnInspect.click();
            break;
    }
}

function onKeyUp(event) {
    if (!isWalkMode) return;
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
}

/* ================= Mobil D-Pad ================= */

function setupDPad() {
    const attachBtn = (id, prop) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        
        const setVal = (val) => (e) => {
            if(e.cancelable) e.preventDefault();
            prop(val);
        };
        
        btn.addEventListener('mousedown', setVal(true));
        btn.addEventListener('mouseup', setVal(false));
        btn.addEventListener('mouseleave', setVal(false));
        
        btn.addEventListener('touchstart', setVal(true), { passive: false });
        btn.addEventListener('touchend', setVal(false));
        btn.addEventListener('touchcancel', setVal(false));
    };

    attachBtn('btn-walk-up', (v) => touchUp = v);
    attachBtn('btn-walk-down', (v) => touchDown = v);
    attachBtn('btn-walk-left', (v) => touchLeft = v);
    attachBtn('btn-walk-right', (v) => touchRight = v);
}
