import { initViewer } from './viewer.js';
import { showError } from './loader.js';

// WebGL Desteği Kontrolü
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!checkWebGLSupport()) {
        showError("Tarayıcınız WebGL teknolojisini desteklemiyor. Lütfen donanım hızlandırmanın açık olduğundan emin olun veya güncel bir tarayıcı kullanın.");
        return;
    }

    // Uygulamayı Başlat
    initViewer('viewer-container');
});
