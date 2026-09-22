import * as THREE from 'three';

// Temel PBR Materyalleri
const materials = {
    floor: new THREE.MeshStandardMaterial({
        color: 0xe0e0e0,
        roughness: 0.8,
        metalness: 0.1,
        name: 'Mat Seramik Zemin'
    }),
    wallCeiling: new THREE.MeshStandardMaterial({
        color: 0xf4f1ea, // Sıcak kırık beyaz
        roughness: 0.9,
        metalness: 0.0,
        name: 'Sıcak Kırık Beyaz Duvar'
    }),
    worktop: new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.4,
        metalness: 0.2,
        name: 'Tezgâh'
    }),
    cabinetBody: new THREE.MeshStandardMaterial({
        color: 0xdcdcdc,
        roughness: 0.6,
        metalness: 0.1,
        name: 'Açık Mat Gövde'
    }),
    cabinetDoor: new THREE.MeshStandardMaterial({
        color: 0xeaeaea,
        roughness: 0.3,
        metalness: 0.05,
        name: 'Kapak'
    }),
    plinth: new THREE.MeshStandardMaterial({
        color: 0x222222,
        roughness: 0.8,
        metalness: 0.1,
        name: 'Koyu Mat Baza'
    }),
    handle: new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        roughness: 0.4,
        metalness: 0.8,
        name: 'Fırçalanmış Metal Kulp'
    }),
    appliance: new THREE.MeshStandardMaterial({
        color: 0x1c1c1c,
        roughness: 0.3,
        metalness: 0.7,
        name: 'Koyu Metal Beyaz Eşya'
    }),
    sinkArmature: new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        roughness: 0.2,
        metalness: 0.9,
        name: 'Metal Eviye Batarya'
    }),
    glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.9, // Cam saydamlığı
        ior: 1.5,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        name: 'Saydam Cam'
    }),
    doorWindowFrame: new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.6,
        metalness: 0.1,
        name: 'Nötr Kapı/Pencere Çerçevesi'
    }),
    default: new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.7,
        metalness: 0.1,
        name: 'Varsayılan Açık Gri'
    })
};

// --- Özelleştirme Seçenekleri ---

const variants = {
    door: {
        'white': { color: 0xeaeaea, roughness: 0.3, metalness: 0.05 },
        'wood': { color: 0xa47c54, roughness: 0.6, metalness: 0.0 },
        'anthracite': { color: 0x2b2b2b, roughness: 0.2, metalness: 0.1 }
    },
    worktop: {
        'dark-stone': { color: 0x222222, roughness: 0.4, metalness: 0.2 },
        'light-stone': { color: 0xcccccc, roughness: 0.5, metalness: 0.1 },
        'white-marble': { color: 0xfafafa, roughness: 0.1, metalness: 0.0 }
    }
};

/**
 * Belirtilen hedefteki materyal özelliklerini günceller
 */
export function updateMaterialVariant(type, variantKey) {
    if (!variants[type] || !variants[type][variantKey]) return;
    
    const props = variants[type][variantKey];
    let mat = null;
    
    if (type === 'door') mat = materials.cabinetDoor;
    if (type === 'worktop') mat = materials.worktop;
    
    if (mat) {
        if (props.color !== undefined) mat.color.setHex(props.color);
        if (props.roughness !== undefined) mat.roughness = props.roughness;
        if (props.metalness !== undefined) mat.metalness = props.metalness;
        
        // Eğer gelecekte texture eklenecekse buraya eklenebilir:
        // if (props.map) mat.map = loadTexture(props.map); else mat.map = null;
        mat.needsUpdate = true;
    }
}

/**
 * Katman (Mesh) ismine göre ilgili materyali döndürür.
 */
export function getMaterialForMeshName(meshName) {
    if (!meshName) return materials.default;
    
    const name = meshName.toUpperCase();

    if (name.includes('FLOOR')) return materials.floor;
    if (name.includes('CEILING') || name.includes('WALLS')) return materials.wallCeiling;
    if (name.includes('WORKTOP')) return materials.worktop;
    
    if (name.includes('CAB_BODY') || name.includes('CORNICE')) return materials.cabinetBody;
    if (name.includes('CAB_DOOR') && !name.includes('GLASS')) return materials.cabinetDoor;
    
    if (name.includes('PLINTH')) return materials.plinth;
    if (name.includes('HANDLE') || name.includes('KNOB')) return materials.handle;
    
    if (name.includes('APP_BODY') || name.includes('APPLIANCE')) return materials.appliance;
    if (name.includes('SINK') || name.includes('ARMATURE')) return materials.sinkArmature;
    
    if (name.includes('GLASS')) return materials.glass;
    if (name.includes('DOOR_WINDOW')) return materials.doorWindowFrame;

    return materials.default;
}

/**
 * Sahnedeki tüm meshleri dolaşarak isimlerine göre materyal atar.
 */
export function applyMaterialsToModel(model) {
    model.traverse((child) => {
        if (child.isMesh) {
            child.material = getMaterialForMeshName(child.name);
            
            if (child.material !== materials.glass) {
                child.material.side = THREE.FrontSide;
            }
            
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
}
