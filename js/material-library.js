import * as THREE from 'three';
import { lakeNoiseDokusuOlustur } from './textures.js';

export let onlyDoorsMode = false;
export function setOnlyDoorsMode(val) {
    onlyDoorsMode = val;
}

export function safeUpper(str) {
    if (!str) return '';
    return str.replace(/[i\u0131\u0130I]/g, 'I').toUpperCase();
}

const materials = {
    floor: new THREE.MeshStandardMaterial({ color: 0xe0e0e0, roughness: 0.8 }),
    wallCeiling: new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.9 }),
    worktop: new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.4 }),
    cabinetBody: new THREE.MeshStandardMaterial({ color: 0xdcdcdc, roughness: 0.6 }), 
    cabinetDoor: new THREE.MeshPhysicalMaterial({ color: 0xeaeaea, roughness: 0.3, metalness: 0.05 }),
    plinth: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.1 }),
    handle: new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.4, metalness: 0.8 }),
    appliance: new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.35, metalness: 0.85 }),
    applianceGlass: new THREE.MeshPhysicalMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9, clearcoat: 1.0 }),
    sinkArmature: new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 1.0 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0.1, roughness: 0.05, transmission: 0.9, transparent: true, opacity: 1.0, side: THREE.DoubleSide }),
    doorWindowFrame: new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.6 }),
    default: new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.7 })
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
    let mat = type === 'door' ? materials.cabinetDoor : (type === 'worktop' ? materials.worktop : null);
    
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
    const name = safeUpper(meshName);

    if (name.includes('GLASS')) return materials.glass;
    if (name.includes('HANDLE') || name.includes('KNOB')) return materials.handle;
    if (name.includes('PLINTH')) {
        // Only the visible toe-kick follows the selected front finish. The
        // legs remain construction hardware in both color modes.
        if (name.includes('PLINTH_LEGS')) return materials.plinth;
        return onlyDoorsMode ? materials.plinth : materials.cabinetDoor;
    }
    if (name.includes('WORKTOP')) return materials.worktop;
    if (name.includes('SINK') || name.includes('ARMATURE') || name.includes('SANITARY')) return materials.sinkArmature;
    
    if (name.includes('APP') || name.includes('APPLIANCE') || name.includes('HOOD') || name.includes('FRIDGE') || name.includes('REFRIG') || name.includes('BUZDOLABI') || name.includes('OVEN') || name.includes('FIRIN') || name.includes('HOB') || name.includes('OCAK') || name.includes('ACCESSORIES') || name.includes('ENTS_FOR_HIDE') || name.includes('BULSK') || name.includes('WASHER')) {
        if (name.includes('SCREEN')) return materials.applianceGlass;
        return materials.appliance;
    }

    if (name.includes('FLOOR')) return materials.floor;
    if (name.includes('CEILING') || name.includes('WALLS') || name.includes('WALL_BEAM')) return materials.wallCeiling;
    if (name.includes('DOOR_WINDOW') || name.includes('PORAL')) return materials.doorWindowFrame;

    const isExplicitDoor = name.includes('CAB_DOOR_FORCE') || name.includes('CAB_DOOR');
    const isSharedBody = name.includes('CAB_BODY') || name.includes('CORNICE') || name.includes('PANELS_SIDE');
    
    if (isExplicitDoor) return materials.cabinetDoor;
    if (isSharedBody) return onlyDoorsMode ? materials.cabinetBody : materials.cabinetDoor;
    if (name.includes('BACK_PANEL')) return materials.cabinetBody;

    return materials.default;
}

export function applyMaterialsToModel(model) {
    let matchedDoorsMeshCount = 0;
    
    model.traverse((child) => {
        if (child.isMesh) {
            let materialName = child.name;
            let current = child.parent;
            let isDoorBlock = false;
            
            while (current && current.type !== 'Scene') {
                let pName = safeUpper(current.name);
                if (pName.match(/_\d{4}X\d{4}/) || pName.includes('BULSK') || pName.includes('KAPAK')) {
                    isDoorBlock = true;
                    break;
                }
                current = current.parent;
            }
            
            if (isDoorBlock) {
                materialName += '_CAB_DOOR_FORCE';
            }
            
            child.material = getMaterialForMeshName(materialName);
            if (child.material === materials.cabinetDoor) {
                matchedDoorsMeshCount++;
            }
            
            if (child.material !== materials.glass && child.material !== materials.applianceGlass) {
                child.material.side = THREE.FrontSide;
            }
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    console.log('[Material Library] Yuzey modu: ' + (onlyDoorsMode ? 'Yalnizca Kapaklar' : 'Tum Govde+Kapak') + ', Eslesen kapak yuzeyi sayisi: ' + matchedDoorsMeshCount);
}
export function addProceduralApplianceDetails(mesh, name, box, size, center, materials) {
    const isDepthZ = size.z < size.x;
    
    // Determine the front face (usually max Z or min Z depending on orientation)
    // We can just use the mesh's material and add decals.
    // However, it's easier to just add a slightly larger box for the glass if it's an oven
    
    if (name.includes('OVEN') || name.includes('FIRIN')) {
        const glassGeo = new THREE.BoxGeometry(
            isDepthZ ? size.x * 0.8 : size.x + 0.002, 
            size.y * 0.7, 
            isDepthZ ? size.z + 0.002 : size.z * 0.8
        );
        const glass = new THREE.Mesh(glassGeo, materials.applianceGlass);
        glass.position.copy(center);
        mesh.parent.add(glass);
        glass.name = 'PROC_OVEN_GLASS';
    } else if (name.includes('HOB') || name.includes('OCAK')) {
        // Add 4 burners
        const burnerGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.01, 16);
        const burnerMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
        
        const positions = [
            [size.x * 0.2, size.z * 0.2],
            [-size.x * 0.2, size.z * 0.2],
            [size.x * 0.2, -size.z * 0.2],
            [-size.x * 0.2, -size.z * 0.2],
        ];
        
        positions.forEach(pos => {
            const burner = new THREE.Mesh(burnerGeo, burnerMat);
            burner.position.copy(center);
            burner.position.y = box.max.y + 0.005;
            burner.position.x += pos[0];
            burner.position.z += pos[1];
            mesh.parent.add(burner);
            burner.name = 'PROC_HOB_BURNER';
        });
    }
}






