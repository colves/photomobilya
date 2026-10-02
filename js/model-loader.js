import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { showLoader, hideLoader, updateLoaderText, showError } from './loader.js';
import { setupCameraControls, hideCameraControls } from './camera-controller.js';
import { applyMaterialsToModel, safeUpper } from './material-library.js';

let currentModel = null;
let currentObjectUrl = null;
const gltfLoader = new GLTFLoader();

/**
 * Eski modelin bellekten (GPU) temizlenmesi
 */
function disposeModel(scene, model) {
    if (!model) return;
    
    scene.remove(model);
    
    model.traverse((child) => {
        if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material && child.material.userData && child.material.userData.isProcedural) {
                child.material.dispose();
            }
        }
    });
}

/**
 * URL'den veya dosyadan (Blob) GLB modeli yükler.
 */
export async function loadModel(url, scene, camera, controls, removeTempGeoCallback) {
    showLoader();
    updateLoaderText("Model yükleniyor... %0");
    hideCameraControls();

    try {
        const gltf = await new Promise((resolve, reject) => {
            gltfLoader.load(
                url,
                (loadedGltf) => resolve(loadedGltf),
                (xhr) => {
                    if (xhr.lengthComputable) {
                        const percentComplete = Math.round((xhr.loaded / xhr.total) * 100);
                        updateLoaderText(`Model yükleniyor... %${percentComplete}`);
                    } else {
                        updateLoaderText(`Model yükleniyor... ${(xhr.loaded / (1024 * 1024)).toFixed(1)} MB`);
                    }
                },
                (error) => reject(error)
            );
        });

        // Eskisini temizle
        if (currentModel) {
            disposeModel(scene, currentModel);
            currentModel = null;
        }

        // GeÃ§ici objeleri sil
        if (removeTempGeoCallback) {
            removeTempGeoCallback();
        }

        currentModel = gltf.scene;

        // Transformu gÃ¼ncelle ki ham (raw) BoundingBox hesabÄ± doÄŸru yapÄ±lsÄ±n
        currentModel.updateMatrixWorld(true);
        const rawBox = new THREE.Box3().setFromObject(currentModel);
        const rawSize = rawBox.getSize(new THREE.Vector3());
        const maxRawDim = Math.max(rawSize.x, rawSize.y, rawSize.z);

        // Ã–lÃ§ek Normalizasyonu (Auto-Scale Logic)
        // ADEKO/Babylon GLB Ã§Ä±ktÄ±larÄ± genelde 0.1 Ã¶lÃ§eklidir (Ã¶rn: 2.3m tavan 0.23 birim, 6m tezgÃ¢h 0.6 birim gelir).
        // EÄŸer modelin en bÃ¼yÃ¼k Ã¶lÃ§Ã¼sÃ¼ 2.0'dan, yÃ¼ksekliÄŸi (Y) ise 0.5'ten kÃ¼Ã§Ã¼kse, bunun 0.1 Ã¶lÃ§ekli
        // bir model olduÄŸunu varsayarak x10 ile metre standardÄ±na (1 birim = 1 metre) getiriyoruz.
        // DiÄŸer durumlarda (Ã¶rn: Y > 2.0 ise metre Ã¶lÃ§eÄŸindedir) hiÃ§bir dÃ¼zeltme (x1) yapmÄ±yoruz.
        if (maxRawDim > 0.1 && maxRawDim < 2.0 && rawSize.y < 0.5) {
            console.log(`[ModelLoader] ADEKO/Babylon (0.1) Ã¶lÃ§eÄŸi tespit edildi. Normalizasyon iÃ§in x10 uygulanÄ±yor. Ham Max: ${maxRawDim.toFixed(2)}, Y: ${rawSize.y.toFixed(2)}`);
            currentModel.scale.set(10, 10, 10);
            currentModel.updateMatrixWorld(true);
        } else {
            console.log(`[ModelLoader] Model zaten metre Ã¶lÃ§eÄŸinde veya belirsiz. Normalizasyon atlanÄ±yor. Ham Max: ${maxRawDim.toFixed(2)}, Y: ${rawSize.y.toFixed(2)}`);
            // x1 kalÄ±r
        }

        // Dinamik Materyal EÅŸlemesini Uygula
        applyMaterialsToModel(currentModel);

        // Duvar geometrisini analiz et ve gÃ¼venli ÅŸekilde Ã§ift katmanlarÄ± / Z-fighting yapan yÃ¼zleri temizle
        cleanWallGeometry(currentModel);
        
        // Hedefli cutaway iÃ§in duvarlarÄ± baÄŸÄ±msÄ±z mesh'lere ayÄ±r
        processWallsForCutaway(currentModel);
        
        // Ekstra geometri dÃ¼zeltmeleri:
        // 1. KapÄ±/Pencere gibi mutfak dÄ±ÅŸÄ± yapÄ± elemanlarÄ±nÄ± gizle (bÃ¼yÃ¼k gri paneller dahil)
        // 2. Adeko yazÄ±sÄ±nÄ± gizle
        // 3. ArkalÄ±ÄŸÄ± olmayan Ã¼st modÃ¼llere (CAB_BODY_WALL) arka panel ekle
                            const newBackPanels = [];
          const newProceduralDetails = [];
          const newSinkDetails = [];
          const modelBoundingBox = new THREE.Box3().setFromObject(currentModel);
          const roomCenter = modelBoundingBox.getCenter(new THREE.Vector3());
          const roomSize = modelBoundingBox.getSize(new THREE.Vector3());
          
          

          currentModel.traverse((child) => {
              if (child.isMesh) {
                  const name = safeUpper(child.name);
                  
                  if (name.includes('APP_BODY_BASE')) {
                      const box = new THREE.Box3().setFromObject(child);
                      const size = box.getSize(new THREE.Vector3());
                      if (size.y < 0.02 && size.z < 0.01) {
                          child.visible = false;
                          child.userData.isForceHidden = true;
                      }
                  }
                  
                  if (name.includes('CAB_BODY_WALL')) {
                      const box = new THREE.Box3().setFromObject(child);
                      const size = box.getSize(new THREE.Vector3());
                      const center = box.getCenter(new THREE.Vector3());
                      const isDepthZ = size.z < size.x;
                      
                      const posAttr = child.geometry.attributes.position;
                      const index = child.geometry.index;
                      if (posAttr) {
                          let rearWorldZ = isDepthZ ? (center.z > roomCenter.z ? box.max.z : box.min.z) : center.z;
                          let rearWorldX = !isDepthZ ? (center.x > roomCenter.x ? box.max.x : box.min.x) : center.x;
                          let triCountAtRear = 0;
                          
                          const v0 = new THREE.Vector3(); const v1 = new THREE.Vector3(); const v2 = new THREE.Vector3();
                          
                          const checkTri = (a, b, c) => {
                              v0.fromBufferAttribute(posAttr, a); v1.fromBufferAttribute(posAttr, b); v2.fromBufferAttribute(posAttr, c);
                              child.localToWorld(v0); child.localToWorld(v1); child.localToWorld(v2);
                              const tolerance = 0.05;
                              if (isDepthZ) {
                                  if (Math.abs(v0.z - rearWorldZ) < tolerance && Math.abs(v1.z - rearWorldZ) < tolerance && Math.abs(v2.z - rearWorldZ) < tolerance) triCountAtRear++;
                              } else {
                                  if (Math.abs(v0.x - rearWorldX) < tolerance && Math.abs(v1.x - rearWorldX) < tolerance && Math.abs(v2.x - rearWorldX) < tolerance) triCountAtRear++;
                              }
                          };
                          
                          if (index) {
                              for (let i = 0; i < index.count; i += 3) checkTri(index.getX(i), index.getX(i+1), index.getX(i+2));
                          } else {
                              for (let i = 0; i < posAttr.count; i += 3) checkTri(i, i+1, i+2);
                          }
                          
                          if (triCountAtRear < 2) {
                              const panelThickness = 0.005;
                              let pWidth = size.x; let pHeight = size.y; let pDepth = size.z;
                              let px = center.x; let py = center.y; let pz = center.z;
                              
                              if (isDepthZ) {
                                  pDepth = panelThickness;
                                  if (center.z < roomCenter.z) pz = box.min.z + panelThickness/2;
                                  else pz = box.max.z - panelThickness/2;
                              } else {
                                  pWidth = panelThickness;
                                  if (center.x < roomCenter.x) px = box.min.x + panelThickness/2;
                                  else px = box.max.x - panelThickness/2;
                              }
                              
                              const panelGeo = new THREE.BoxGeometry(pWidth, pHeight, pDepth);
                              const panelMesh = new THREE.Mesh(panelGeo, child.material);
                              
                              panelMesh.position.set(px, py, pz);
                              currentModel.worldToLocal(panelMesh.position);
                              const parentWorldScale = new THREE.Vector3();
                              currentModel.getWorldScale(parentWorldScale);
                              panelMesh.scale.set(1 / parentWorldScale.x, 1 / parentWorldScale.y, 1 / parentWorldScale.z);
                              
                              panelMesh.name = child.name + '_BACK_PANEL';
                              panelMesh.userData.isForceHidden = false;
                              newBackPanels.push(panelMesh);
                          }
                      }
                  }
                  
                  // Procedural Appliances
                  let current = child.parent;
                  let deviceType = null;
                  while (current && current.type !== 'Scene') {
                      let pName = safeUpper(current.name);
                      if (pName.includes('OVEN') || pName.includes('FIRIN')) deviceType = 'OVEN';
                      else if (pName.includes('HOB') || pName.includes('OCAK')) deviceType = 'HOB';
                      else if (pName.includes('BULSK') || pName.includes('WASHER')) deviceType = 'WASHER';
                      else if (pName.includes('FRIDGE') || pName.includes('REFRIG') || pName.includes('BUZDOLABI')) deviceType = 'FRIDGE';
                      else if (pName.includes('HOOD') || pName.includes('DAVLUMBAZ')) deviceType = 'HOOD';
                      current = current.parent;
                  }
                  
                  if (!deviceType) {
                      if (name.includes('OVEN') || name.includes('FIRIN')) deviceType = 'OVEN';
                      else if (name.includes('HOB') || name.includes('OCAK')) deviceType = 'HOB';
                  }

                  if (deviceType) {
                      const box = new THREE.Box3().setFromObject(child);
                      const size = box.getSize(new THREE.Vector3());
                      const center = box.getCenter(new THREE.Vector3());
                      const isDepthZ = size.z < size.x;
                      
                      const parentWorldScale = new THREE.Vector3();
                      currentModel.getWorldScale(parentWorldScale);
                      
                      if (deviceType === 'OVEN') {
                          // Check if we haven't already added details for this block
                          if (size.x > 0.4 && size.y > 0.4 && !child.userData.hasProceduralDetails) {
                              child.userData.hasProceduralDetails = true;
                              const glassGeo = new THREE.BoxGeometry(isDepthZ ? size.x * 0.8 : size.x + 0.004, size.y * 0.7, isDepthZ ? size.z + 0.004 : size.z * 0.8);
                              const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x050505, metalness: 0.2, roughness: 0.1, clearcoat: 1.0 });
                              glassMat.userData.isProcedural = true;
                              const glass = new THREE.Mesh(glassGeo, glassMat);
                              glass.position.copy(center);
                              currentModel.worldToLocal(glass.position);
                              glass.scale.set(1 / parentWorldScale.x, 1 / parentWorldScale.y, 1 / parentWorldScale.z);
                              glass.name = 'PROC_OVEN_GLASS';
                              newProceduralDetails.push(glass);
                          }
                      } else if (deviceType === 'HOB') {
                          if (size.x > 0.3 && !child.userData.hasProceduralDetails) {
                              child.userData.hasProceduralDetails = true;
                              const burnerGeo = new THREE.CylinderGeometry(Math.min(size.x, size.z) * 0.15, Math.min(size.x, size.z) * 0.15, 0.01, 16);
                              const burnerMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
                              burnerMat.userData.isProcedural = true;
                              const pos = [[size.x * 0.25, size.z * 0.25], [-size.x * 0.25, size.z * 0.25], [size.x * 0.25, -size.z * 0.25], [-size.x * 0.25, -size.z * 0.25]];
                              pos.forEach((p, idx) => {
                                  const burner = new THREE.Mesh(burnerGeo, burnerMat);
                                  burner.position.copy(center);
                                  burner.position.y = box.max.y + 0.005;
                                  burner.position.x += p[0];
                                  burner.position.z += p[1];
                                  currentModel.worldToLocal(burner.position);
                                  burner.scale.set(1 / parentWorldScale.x, 1 / parentWorldScale.y, 1 / parentWorldScale.z);
                                  burner.name = 'PROC_HOB_BURNER_' + idx;
                                  newProceduralDetails.push(burner);
                              });
                          }
                      } else if (deviceType === 'WASHER') {
                          if (size.x > 0.4 && size.y > 0.4 && !child.userData.hasProceduralDetails) {
                              child.userData.hasProceduralDetails = true;
                              const panelGeo = new THREE.BoxGeometry(isDepthZ ? size.x * 0.9 : size.x + 0.004, size.y * 0.15, isDepthZ ? size.z + 0.004 : size.z * 0.9);
                              const panelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
                              panelMat.userData.isProcedural = true;
                              const panel = new THREE.Mesh(panelGeo, panelMat);
                              panel.position.copy(center);
                              panel.position.y = box.max.y - size.y * 0.1;
                              currentModel.worldToLocal(panel.position);
                              panel.scale.set(1 / parentWorldScale.x, 1 / parentWorldScale.y, 1 / parentWorldScale.z);
                              panel.name = 'PROC_WASHER_PANEL';
                              newProceduralDetails.push(panel);
                          }
                      } else if (deviceType === 'FRIDGE') {
                          if (size.y > 1.0 && size.x > 0.4 && !child.userData.hasProceduralDetails) {
                              child.userData.hasProceduralDetails = true;
                              const splitGeo = new THREE.BoxGeometry(isDepthZ ? size.x + 0.006 : 0.01, 0.02, isDepthZ ? 0.01 : size.z + 0.006);
                              const splitMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });
                              splitMat.userData.isProcedural = true;
                              const split = new THREE.Mesh(splitGeo, splitMat);
                              split.position.copy(center);
                              currentModel.worldToLocal(split.position);
                              split.scale.set(1 / parentWorldScale.x, 1 / parentWorldScale.y, 1 / parentWorldScale.z);
                              split.name = 'PROC_FRIDGE_SPLIT';
                              newProceduralDetails.push(split);
                          }
                      }
                  }

                  // Some ADEKO SINKS layers export the rim and sides but not
                  // the bowl floor. Add only that missing interior surface so
                  // the cabinet behind it can never look like the sink fill.
                  if (name.includes('SINKS') && !child.userData.hasSinkBowl) {
                      child.userData.hasSinkBowl = true;
                      const box = new THREE.Box3().setFromObject(child);
                      const size = box.getSize(new THREE.Vector3());
                      const innerWidth = Math.max(0.05, size.x * 0.82);
                      const innerDepth = Math.max(0.05, size.z * 0.82);
                      const bowlFloor = new THREE.Mesh(
                          new THREE.BoxGeometry(innerWidth, 0.012, innerDepth),
                          new THREE.MeshStandardMaterial({ color: 0xaeb7ba, roughness: 0.22, metalness: 0.95, side: THREE.DoubleSide })
                      );
                      bowlFloor.material.userData.isProcedural = true;
                      bowlFloor.position.set((box.min.x + box.max.x) / 2, box.min.y + 0.014, (box.min.z + box.max.z) / 2);
                      currentModel.worldToLocal(bowlFloor.position);
                      const parentWorldScale = new THREE.Vector3();
                      currentModel.getWorldScale(parentWorldScale);
                      bowlFloor.scale.set(1 / parentWorldScale.x, 1 / parentWorldScale.y, 1 / parentWorldScale.z);
                      bowlFloor.name = 'PROC_SINK_BOWL';
                      newSinkDetails.push(bowlFloor);
                  }
              }
          });
          
          newProceduralDetails.forEach(p => currentModel.add(p));
          newBackPanels.forEach(p => currentModel.add(p));
          newSinkDetails.forEach(p => currentModel.add(p));

        scene.add(currentModel);

        // KamerayÄ± ve modeli ayarla
        const modelBoxData = adjustCameraToModel(currentModel, camera, controls);
        
        // Kamera kontrollerini baÅŸlat
        setupCameraControls(camera, controls, modelBoxData);

        hideLoader();
        return modelBoxData;

    } catch (error) {
        showError("Model yüklenemedi. Lütfen geçerli ve tek parça bir .glb dosyası olduğundan emin olun.");
        console.error("Model yükleme hatası:", error);
        return false;
    } finally {
        // Blob URL temizliÄŸi (sÄ±zÄ±ntÄ±yÄ± Ã¶nle)
        if (currentObjectUrl === url) {
            URL.revokeObjectURL(currentObjectUrl);
            currentObjectUrl = null;
        }
    }
}

/**
 * Dosya seÃ§iciden gelen Blob iÃ§in URL oluÅŸturup kaydeder (ileride silmek iÃ§in).
 */
export function setBlobUrl(url) {
    currentObjectUrl = url;
}

/**
 * Duvar geometrisindeki Ã§akÄ±ÅŸan (Z-fighting) yÃ¼zleri analiz eder ve gÃ¼venle temizler.
 */
function cleanWallGeometry(model) {
    model.traverse((child) => {
        if (child.isMesh && (child.name.toUpperCase().includes('WALLS') || child.name.toUpperCase().includes('CEILING'))) {
            let duplicateFacesRemoved = 0;
            let geo = child.geometry;
            if (!geo || !geo.attributes.position) return;
            
            // Non-indexed ise iÅŸlemek daha kolay (her 3 vertex 1 Ã¼Ã§gen)
            if (geo.index !== null) {
                console.log(`[WallClean] ${child.name} indexed geometriye sahip. Non-indexed formata Ã§evriliyor...`);
                geo = geo.toNonIndexed();
                child.geometry = geo; // Yeni geometriyi ata
            }
            
            const pos = geo.attributes.position;
            console.log(`[WallClean] ${child.name} analiz ediliyor... Toplam Ã¼Ã§gen: ${pos.count / 3}`);
            
            // Kesin ve gÃ¼venli temizleme mantÄ±ÄŸÄ±: 
            // Her Ã¼Ã§genin Ã¼Ã§ kÃ¶ÅŸesini kuantize edip (quantization) sÄ±ralayarak anahtar oluÅŸtururuz.
            // Sadece aynÄ± 3 kÃ¶ÅŸeyi paylaÅŸan (kopya olan) yÃ¼zleri sileriz.
            const triangles = [];
            const hashToTriangle = new Map();
            
            for (let i = 0; i < pos.count; i += 3) {
                const vA = new THREE.Vector3().fromBufferAttribute(pos, i);
                const vB = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
                const vC = new THREE.Vector3().fromBufferAttribute(pos, i + 2);
                
                // 1mm hassasiyetle kuantize edelim (0.001)
                const q = (v) => `${Math.round(v.x * 1000)},${Math.round(v.y * 1000)},${Math.round(v.z * 1000)}`;
                const hashA = q(vA);
                const hashB = q(vB);
                const hashC = q(vC);
                
                // KÃ¶ÅŸe sÄ±rasÄ±ndan baÄŸÄ±msÄ±z olmak iÃ§in hashleri sÄ±ralayÄ±p birleÅŸtiriyoruz
                const hashArray = [hashA, hashB, hashC].sort();
                const faceHash = hashArray.join('|');
                
                if (hashToTriangle.has(faceHash)) {
                    // Bu 3 kÃ¶ÅŸeye sahip bir Ã¼Ã§gen zaten var, bu tam bir kopyadÄ±r (z-fighting)!
                    duplicateFacesRemoved++;
                } else {
                    hashToTriangle.set(faceHash, true);
                    triangles.push({
                        index: i,
                        keep: true
                    });
                }
            }
            
            // Yeni geometriyi oluÅŸtur
            if (duplicateFacesRemoved > 0) {
                const keptCount = triangles.filter(t => t.keep).length;
                console.log(`[WallClean] ${child.name} Z-fighting tespiti: ${duplicateFacesRemoved} Ã§akÄ±ÅŸan yÃ¼zey silindi. Kalan Ã¼Ã§gen: ${keptCount}`);
                
                const newPosArray = new Float32Array(keptCount * 3 * 3); // 3 vertex * 3 (x,y,z)
                const newNormalArray = geo.attributes.normal ? new Float32Array(keptCount * 3 * 3) : null;
                const newUvArray = geo.attributes.uv ? new Float32Array(keptCount * 3 * 2) : null;
                
                let offsetPos = 0;
                let offsetUv = 0;
                
                triangles.forEach(t => {
                    if (t.keep) {
                        for (let k = 0; k < 3; k++) {
                            const origIdx = t.index + k;
                            newPosArray[offsetPos] = pos.getX(origIdx);
                            newPosArray[offsetPos + 1] = pos.getY(origIdx);
                            newPosArray[offsetPos + 2] = pos.getZ(origIdx);
                            
                            if (newNormalArray) {
                                newNormalArray[offsetPos] = geo.attributes.normal.getX(origIdx);
                                newNormalArray[offsetPos + 1] = geo.attributes.normal.getY(origIdx);
                                newNormalArray[offsetPos + 2] = geo.attributes.normal.getZ(origIdx);
                            }
                            
                            if (newUvArray) {
                                newUvArray[offsetUv] = geo.attributes.uv.getX(origIdx);
                                newUvArray[offsetUv + 1] = geo.attributes.uv.getY(origIdx);
                                offsetUv += 2;
                            }
                            
                            offsetPos += 3;
                        }
                    }
                });
                
                geo.setAttribute('position', new THREE.BufferAttribute(newPosArray, 3));
                if (newNormalArray) geo.setAttribute('normal', new THREE.BufferAttribute(newNormalArray, 3));
                if (newUvArray) geo.setAttribute('uv', new THREE.BufferAttribute(newUvArray, 2));
                
                // Geometri deÄŸiÅŸtiÄŸi iÃ§in sÄ±nÄ±r kutularÄ±nÄ± gÃ¼ncelle
                geo.computeBoundingBox();
                geo.computeBoundingSphere();
                
                // KalÄ±nlÄ±k eklenebilir mi analizi:
                console.log(`[WallClean] KalÄ±nlÄ±k (extrude) uygulanamadÄ± Ã§Ã¼nkÃ¼ kalan yÃ¼zeylerin topolojisi manifold (kapalÄ±/sÃ¼rekli) deÄŸil veya aÃ§Ä±k kenarlar barÄ±ndÄ±rÄ±yor.`);
            }
        }
    });
}

/**
 * Tek parÃ§a halindeki mesh'i (baÄŸlantÄ±sÄ±z Ã¼Ã§gen adalarÄ±na gÃ¶re) baÄŸÄ±msÄ±z mesh'lere ayÄ±rÄ±r.
 * GÃ¼venli ayrÄ±ÅŸma olmazsa (tek parÃ§a kalÄ±rsa) false dÃ¶ner.
 */
function splitMeshIntoComponents(mesh) {
    const geo = mesh.geometry;
    const pos = geo.attributes.position;
    if (!pos) return [mesh];

    const vertexToTriangles = new Map();
    const q = (x, y, z) => `${Math.round(x*100)},${Math.round(y*100)},${Math.round(z*100)}`;
    
    for (let i = 0; i < pos.count; i += 3) {
        const h1 = q(pos.getX(i), pos.getY(i), pos.getZ(i));
        const h2 = q(pos.getX(i+1), pos.getY(i+1), pos.getZ(i+1));
        const h3 = q(pos.getX(i+2), pos.getY(i+2), pos.getZ(i+2));
        
        [h1, h2, h3].forEach(h => {
            if (!vertexToTriangles.has(h)) vertexToTriangles.set(h, []);
            vertexToTriangles.get(h).push(i);
        });
    }
    
    const visited = new Set();
    const components = [];
    
    for (let i = 0; i < pos.count; i += 3) {
        if (visited.has(i)) continue;
        const component = [];
        const queue = [i];
        visited.add(i);
        
        while(queue.length > 0) {
            const tri = queue.shift();
            component.push(tri);
            
            const h1 = q(pos.getX(tri), pos.getY(tri), pos.getZ(tri));
            const h2 = q(pos.getX(tri+1), pos.getY(tri+1), pos.getZ(tri+1));
            const h3 = q(pos.getX(tri+2), pos.getY(tri+2), pos.getZ(tri+2));
            
            [h1, h2, h3].forEach(h => {
                const neighbors = vertexToTriangles.get(h);
                if (neighbors) {
                    neighbors.forEach(n => {
                        if (!visited.has(n)) {
                            visited.add(n);
                            queue.push(n);
                        }
                    });
                }
            });
        }
        components.push(component);
    }

    if (components.length <= 1) {
        return [mesh]; // AyrÄ±lamadÄ± veya tek parÃ§a
    }

    const newMeshes = [];
    components.forEach((comp, idx) => {
        const newGeo = new THREE.BufferGeometry();
        const newPos = new Float32Array(comp.length * 9);
        const newNorm = geo.attributes.normal ? new Float32Array(comp.length * 9) : null;
        const newUv = geo.attributes.uv ? new Float32Array(comp.length * 6) : null;
        
        let pOffset = 0, uOffset = 0;
        comp.forEach(origIdx => {
            for (let k = 0; k < 3; k++) {
                const vIdx = origIdx + k;
                newPos[pOffset] = pos.getX(vIdx);
                newPos[pOffset+1] = pos.getY(vIdx);
                newPos[pOffset+2] = pos.getZ(vIdx);
                if (newNorm) {
                    newNorm[pOffset] = geo.attributes.normal.getX(vIdx);
                    newNorm[pOffset+1] = geo.attributes.normal.getY(vIdx);
                    newNorm[pOffset+2] = geo.attributes.normal.getZ(vIdx);
                }
                if (newUv) {
                    newUv[uOffset] = geo.attributes.uv.getX(vIdx);
                    newUv[uOffset+1] = geo.attributes.uv.getY(vIdx);
                    uOffset += 2;
                }
                pOffset += 3;
            }
        });
        
        newGeo.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
        if (newNorm) newGeo.setAttribute('normal', new THREE.BufferAttribute(newNorm, 3));
        if (newUv) newGeo.setAttribute('uv', new THREE.BufferAttribute(newUv, 2));
        newGeo.computeBoundingBox();
        newGeo.computeBoundingSphere();
        
        const newMesh = new THREE.Mesh(newGeo, mesh.material);
        newMesh.name = mesh.name + '_part_' + idx;
        newMesh.userData = mesh.userData || {};
        newMeshes.push(newMesh);
    });
    
    return newMeshes;
}

export function processWallsForCutaway(model) {
    const replacements = [];
    model.traverse((child) => {
        if (child.isMesh && (child.name.toUpperCase().includes('WALLS') || child.name.toUpperCase().includes('CEILING'))) {
            const isCeiling = child.name.toUpperCase().includes('CEILING');
            const components = splitMeshIntoComponents(child);
            if (components.length > 1) {
                console.log(`[WallClean] ${child.name} islendi`);
                
                // Eski mesh'in transformasyonlarini yeni parçalara kopyala
                components.forEach(comp => {
                    comp.position.copy(child.position);
                    comp.quaternion.copy(child.quaternion);
                    comp.scale.copy(child.scale);
                });
                
                replacements.push({ old: child, newComponents: components });
            } else if (!isCeiling) {
                console.log(`[WallClean] ${child.name} islendi`);
                child.userData = child.userData || {};
                child.userData.unsafeForCutaway = true;
            }
        }
    });

    replacements.forEach(r => {
        const parent = r.old.parent;
        if (parent) {
            parent.remove(r.old);
            if (r.old.geometry) r.old.geometry.dispose();
            r.newComponents.forEach(comp => parent.add(comp));
        }
    });
}

/**
 * Modeli merkeze ve zemine alÄ±r, kamerayÄ± Ã¶lÃ§ekler.
 */
function adjustCameraToModel(model, camera, controls) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const minY = box.min.y;

    // Modeli X ve Z ekseninde orijine, Y ekseninde zemine (0) oturt
    model.position.x -= center.x;
    model.position.y -= minY;
    model.position.z -= center.z;

    // Yeni durumun merkezini bul
    const newBox = new THREE.Box3().setFromObject(model);
    const newCenter = newBox.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    
    // GÃ¼venlik payÄ± ekle
    cameraZ *= 1.5; 

    // KamerayÄ± varsayÄ±lan ana pozisyona al (biraz yÃ¼ksekten)
    camera.position.set(newCenter.x, newCenter.y + (maxDim * 0.5), newCenter.z + cameraZ);
    controls.target.set(newCenter.x, newCenter.y, newCenter.z);

    controls.minDistance = maxDim * 0.1;
    controls.maxDistance = maxDim * 3;
    
    controls.update();

    return { center: newCenter, maxDim, initialCameraZ: cameraZ, boundingBox: newBox };
}













export function reapplyMaterials() {
    if (currentModel) {
        applyMaterialsToModel(currentModel);
    }
}









