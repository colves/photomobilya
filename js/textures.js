import * as THREE from 'three';

let cachedLakeTexture = null;

// Basit deterministik PRNG
function lcg(seed) {
    return function() {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
    };
}

export function lakeNoiseDokusuOlustur() {
    if (cachedLakeTexture) {
        return cachedLakeTexture;
    }

    const size = 256;
    const data = new Uint8Array(size * size * 4);
    const rand = lcg(123456); // Sabit seed ile deterministik noise

    for (let i = 0; i < data.length; i += 4) {
        const val = 200 + Math.floor(rand() * 55);
        data[i] = val;     // R
        data[i+1] = val;   // G
        data[i+2] = val;   // B
        data[i+3] = 255;   // A
    }

    const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    
    // Eski davranisi korumak adina filter ayarlari
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter; 
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    
    cachedLakeTexture = texture;
    return texture;
}
