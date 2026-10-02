import * as THREE from 'three';

export function lakeNoiseDokusuOlustur() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    // Arka plani beyaza boya
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, size, size);
    
    // Ince prtkl/portakal kabugu gorunumu icin gurultu (noise) uret
    const imgData = context.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
        // Hafif koyuluklar atarak noise olustur
        const val = 200 + Math.random() * 55; 
        data[i] = val;     // R
        data[i+1] = val;   // G
        data[i+2] = val;   // B
        data[i+3] = 255;   // A
    }
    context.putImageData(imgData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    
    return texture;
}
