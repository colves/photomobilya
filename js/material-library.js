import * as THREE from 'three';

let lakeNoiseDokusu = null;

function lakeNoiseDokusuOlustur() {
    if (lakeNoiseDokusu) return lakeNoiseDokusu;

    const boyut = 64;
    const veri = new Uint8Array(boyut * boyut * 4);
    let tohum = 0x51a7e;
    for (let i = 0; i < boyut * boyut; i += 1) {
        tohum = (tohum * 1664525 + 1013904223) >>> 0;
        const ton = 132 + ((tohum >>> 24) % 124);
        veri[i * 4] = ton;
        veri[i * 4 + 1] = ton;
        veri[i * 4 + 2] = ton;
        veri[i * 4 + 3] = 255;
    }

    // Yumu$atma
    for (let tur = 0; tur < 2; tur += 1) {
        const onceki = veri.slice();
        for (let y = 0; y < boyut; y += 1) {
            for (let x = 0; x < boyut; x += 1) {
                let toplam = 0;
                for (let dy = -1; dy <= 1; dy += 1) {
                    for (let dx = -1; dx <= 1; dx += 1) {
                        const px = (x + dx + boyut) % boyut;
                        const py = (y + dy + boyut) % boyut;
                        toplam += onceki[(py * boyut + px) * 4];
                    }
                }
                const ton = Math.round(toplam / 9);
                const i = (y * boyut + x) * 4;
                veri[i] = ton;
                veri[i + 1] = ton;
                veri[i + 2] = ton;
            }
        }
    }

    lakeNoiseDokusu = new THREE.DataTexture(veri, boyut, boyut, THREE.RGBAFormat);
    lakeNoiseDokusu.wrapS = THREE.RepeatWrapping;
    lakeNoiseDokusu.wrapT = THREE.RepeatWrapping;
    lakeNoiseDokusu.repeat.set(5, 8);
    lakeNoiseDokusu.minFilter = THREE.LinearMipmapLinearFilter;
    lakeNoiseDokusu.magFilter = THREE.LinearFilter;
    lakeNoiseDokusu.colorSpace = THREE.NoColorSpace;
    lakeNoiseDokusu.needsUpdate = true;
    return lakeNoiseDokusu;
}

const materials = {
    floor: new THREE.MeshStandardMaterial({
        color: 0xe0e0e0,
        roughness: 0.8,
        metalness: 0.1,
        name: 'Mat Seramik Zemin'
    }),
    wallCeiling: new THREE.MeshStandardMaterial({
        color: 0xf4f1ea,
        roughness: 0.9,
        metalness: 0.0,
        name: 'Sicak Kirik Beyaz Duvar'
    }),
    worktop: new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.4,
        metalness: 0.2,
        name: 'Tezgah'
    }),
    cabinetBody: new THREE.MeshStandardMaterial({
        color: 0xdcdcdc,
        roughness: 0.6,
        metalness: 0.1,
        name: 'Acik Mat Govde'
    }),
    cabinetDoor: new THREE.MeshPhysicalMaterial({
        color: 0xeaeaea,
        roughness: 0.3,
        metalness: 0.05,
        clearcoat: 0,
        bumpMap: null,
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
        name: 'Fircalanmis Metal Kulp'
    }),
    appliance: new THREE.MeshStandardMaterial({
        color: 0x999999,
        roughness: 0.35,
        metalness: 0.85,
        envMapIntensity: 1.2,
        name: 'Paslanmaz Celik Beyaz Esya'
    }),
    applianceGlass: new THREE.MeshPhysicalMaterial({
        color: 0x111111,
        roughness: 0.1,
        metalness: 0.9,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        envMapIntensity: 2.0,
        name: 'Firin Cami / Siyah Cam'
    }),
    sinkArmature: new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.2,
        metalness: 1.0,
        envMapIntensity: 1.5,
        name: 'Paslanmaz Celik Eviye'
    }),
    glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 0.9,
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
        name: 'Notr Kapi/Pencere Cercevesi'
    }),
    default: new THREE.MeshStandardMaterial({
        color: 0x888888,
        roughness: 0.7,
        metalness: 0.1,
        name: 'Varsayilan Acik Gri'
    })
};

const variants = {
    door: {
        'white': { color: 0xeaeaea, roughness: 0.3, metalness: 0.05, isLake: false },
        'light-grey': { color: 0xcccccc, roughness: 0.3, metalness: 0.05, isLake: false },
        'anthracite': { color: 0x2b2b2b, roughness: 0.2, metalness: 0.1, isLake: false },
        'wood': { color: 0xa47c54, roughness: 0.6, metalness: 0.0, isLake: false },
        
        'lake-white': { color: 0xf8f8f8, roughness: 0.35, metalness: 0.0, clearcoat: 0.15, isLake: true },
        'lake-cream': { color: 0xf1efe7, roughness: 0.35, metalness: 0.0, clearcoat: 0.15, isLake: true },
        'lake-anthracite': { color: 0x2d3235, roughness: 0.35, metalness: 0.0, clearcoat: 0.15, isLake: true },
        'lake-bordeaux': { color: 0x602020, roughness: 0.35, metalness: 0.0, clearcoat: 0.15, isLake: true },
        'lake-petrol': { color: 0x204050, roughness: 0.35, metalness: 0.0, clearcoat: 0.15, isLake: true }
    },
    worktop: {
        'dark-stone': { color: 0x222222, roughness: 0.4, metalness: 0.2 },
        'light-stone': { color: 0xcccccc, roughness: 0.5, metalness: 0.1 },
        'white-marble': { color: 0xfafafa, roughness: 0.1, metalness: 0.0 }
    }
};

export function updateMaterialVariant(type, variantKey) {
    if (!variants[type] || !variants[type][variantKey]) return;
    
    const props = variants[type][variantKey];
    let mat = null;
    
    if (type === 'door') mat = materials.cabinetDoor;
    if (type === 'worktop') mat = materials.worktop;
    
    if (mat) {
        if (props.color !== undefined) mat.color.setHex(props.color);
        if (props.metalness !== undefined) mat.metalness = props.metalness;
        
        if (type === 'door') {
            if (props.isLake) {
                const dokuOrani = 0.10;
                mat.clearcoat = props.clearcoat !== undefined ? props.clearcoat : 0.2;
                mat.clearcoatRoughness = 0.15;
                mat.bumpMap = lakeNoiseDokusuOlustur();
                mat.bumpScale = 1.1 * dokuOrani;
                mat.roughness = Math.min(0.72, props.roughness * (1 + (0.18 * dokuOrani)));
            } else {
                mat.roughness = props.roughness;
                mat.clearcoat = 0;
                mat.clearcoatRoughness = 0;
                mat.bumpMap = null;
                mat.bumpScale = 0;
            }
        } else {
            if (props.roughness !== undefined) mat.roughness = props.roughness;
        }
        
        mat.needsUpdate = true;
    }
}

export function getMaterialForMeshName(meshName) {
    if (!meshName) return materials.default;
    
    const name = meshName.toUpperCase();

    if (name.includes('FLOOR')) return materials.floor;
    if (name.includes('CEILING') || name.includes('WALLS')) return materials.wallCeiling;
    if (name.includes('WORKTOP')) return materials.worktop;
    
    if (name.includes('CAB_BODY') || name.includes('CORNICE') || name.includes('BACK_PANEL')) return materials.cabinetBody;
    if (name.includes('CAB_DOOR') && !name.includes('GLASS')) return materials.cabinetDoor;
    
    if (name.includes('PLINTH')) return materials.plinth;
    if (name.includes('HANDLE') || name.includes('KNOB')) return materials.handle;
    
    if (name.includes('APP_BODY') || name.includes('APPLIANCE') || name.includes('HOOD') || name.includes('FRIDGE') || name.includes('OVEN') || name.includes('HOB')) {
        if (name.includes('GLASS') || name.includes('SCREEN') || name.includes('OVEN') || name.includes('HOB')) {
            return materials.applianceGlass;
        }
        return materials.appliance;
    }
    if (name.includes('SINK') || name.includes('ARMATURE')) return materials.sinkArmature;
    
    if (name.includes('GLASS')) return materials.glass;
    if (name.includes('DOOR_WINDOW')) return materials.doorWindowFrame;

    return materials.default;
}

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


