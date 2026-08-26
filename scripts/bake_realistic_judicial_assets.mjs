import * as THREE from 'three';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Complete FileReader polyfill for Node.js GLTFExporter
if (typeof global.FileReader === 'undefined') {
  global.FileReader = class FileReader {
    constructor() {
      this.onload = null;
      this.onloadend = null;
      this.onerror = null;
      this.result = null;
    }
    readAsArrayBuffer(blob) {
      if (blob && blob.arrayBuffer) {
        blob.arrayBuffer().then((buf) => {
          this.result = buf;
          if (this.onload) this.onload({ target: this });
          if (this.onloadend) this.onloadend({ target: this });
        }).catch((err) => {
          if (this.onerror) this.onerror(err);
        });
      } else if (Buffer.isBuffer(blob)) {
        this.result = blob.buffer.slice(blob.byteOffset, blob.byteOffset + blob.byteLength);
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      }
    }
  };
}

const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '../public/models/judicial');
const texDir = path.join(outputDir, 'textures');

if (!fs.existsSync(texDir)) {
  fs.mkdirSync(texDir, { recursive: true });
}

function exportToGLB(scene) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      scene,
      (result) => {
        if (result instanceof ArrayBuffer) {
          resolve(Buffer.from(result));
        } else if (result instanceof Uint8Array) {
          resolve(Buffer.from(result.buffer));
        } else {
          resolve(Buffer.from(JSON.stringify(result)));
        }
      },
      (error) => reject(error),
      { binary: true }
    );
  });
}

// -------------------------------------------------------------------
// 1. SCULPT HIGH-POLY ANATOMICAL THEMIS STATUE
// -------------------------------------------------------------------
async function buildPremiumThemisModel() {
  const root = new THREE.Group();
  root.name = "ThemisSculpture";

  const bronzeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x382d1c),
    roughness: 0.32,
    metalness: 0.85,
  });

  const deepBronzeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1a140c),
    roughness: 0.45,
    metalness: 0.78,
  });

  const polishedGoldMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xdfbe7e),
    roughness: 0.18,
    metalness: 0.98,
  });

  const togaMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x2b2216),
    roughness: 0.58,
    metalness: 0.35,
  });

  const marbleBaseMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x120f0b),
    roughness: 0.25,
    metalness: 0.5,
  });

  // Pedestal
  const plinthBottom = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.75, 0.24, 64), marbleBaseMat);
  plinthBottom.position.y = 0.12;
  root.add(plinthBottom);

  const plinthMid = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.5, 0.2, 64), deepBronzeMat);
  plinthMid.position.y = 0.34;
  root.add(plinthMid);

  const plinthGoldBevel = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.06, 64), polishedGoldMat);
  plinthGoldBevel.position.y = 0.47;
  root.add(plinthGoldBevel);

  const plinthTop = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.25, 0.16, 64), bronzeMat);
  plinthTop.position.y = 0.58;
  root.add(plinthTop);

  // Plaque "THEMIS"
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.16, 0.05), polishedGoldMat);
  plaque.position.set(0, 0.34, 1.45);
  plaque.rotation.x = -0.15;
  root.add(plaque);

  // Toga Hem & Feet
  const togaHem = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 1.05, 0.35, 64, 4), togaMat);
  togaHem.position.y = 0.83;
  root.add(togaHem);

  [-0.22, 0.22].forEach((xPos, idx) => {
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.45), bronzeMat);
    foot.position.set(xPos, 0.72, 0.45 + (idx === 0 ? 0.08 : 0));
    root.add(foot);
  });

  // Toga Folds
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8;
    const foldX = Math.cos(angle) * 0.42;
    const foldZ = Math.sin(angle) * 0.42;
    const foldMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 2.2, 16), togaMat);
    foldMesh.position.set(foldX, 1.9, foldZ);
    foldMesh.rotation.y = angle;
    root.add(foldMesh);
  }

  const lowerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.82, 2.4, 64, 16), togaMat);
  lowerBody.position.y = 1.95;
  root.add(lowerBody);

  const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.52, 0.8, 48), togaMat);
  waist.position.y = 2.9;
  root.add(waist);

  const girdleBand = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.065, 24, 64), polishedGoldMat);
  girdleBand.rotation.x = Math.PI / 2;
  girdleBand.position.y = 2.85;
  root.add(girdleBand);

  // Torso
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 1.1, 48), bronzeMat);
  torso.position.y = 3.35;
  root.add(torso);

  const sash = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.09, 24, 64), togaMat);
  sash.rotation.set(0.65, 0.45, -0.4);
  sash.position.set(0.02, 3.42, 0.05);
  root.add(sash);

  const shoulders = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.65, 0.4, 48), bronzeMat);
  shoulders.position.y = 3.82;
  root.add(shoulders);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.42, 32), bronzeMat);
  neck.position.y = 4.08;
  root.add(neck);

  // Head & Features
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 4.52, 0);

  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.38, 48, 48), bronzeMat);
  cranium.scale.set(0.88, 1.12, 0.96);
  headGroup.add(cranium);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.22, 16), bronzeMat);
  nose.position.set(0, -0.02, 0.38);
  nose.rotation.x = -Math.PI / 8;
  headGroup.add(nose);

  const lips = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.03, 16), bronzeMat);
  lips.rotation.z = Math.PI / 2;
  lips.position.set(0, -0.16, 0.35);
  headGroup.add(lips);

  const chin = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 24), bronzeMat);
  chin.position.set(0, -0.28, 0.32);
  headGroup.add(chin);

  const hairChignon = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 32), deepBronzeMat);
  hairChignon.position.set(0, 0.12, -0.32);
  headGroup.add(hairChignon);

  [-0.32, 0.32].forEach((xSide) => {
    const braid = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.55, 24), deepBronzeMat);
    braid.position.set(xSide, -0.1, 0.05);
    braid.rotation.z = xSide > 0 ? -0.2 : 0.2;
    headGroup.add(braid);
  });

  const blindfold = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.28), polishedGoldMat);
  blindfold.position.set(0, 0.04, 0.24);
  headGroup.add(blindfold);

  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.15, 48, 1, true), polishedGoldMat);
  crown.position.y = 0.35;
  headGroup.add(crown);

  root.add(headGroup);

  // Right Arm & Scales
  const rightShoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), bronzeMat);
  rightShoulderJoint.position.set(0.58, 3.72, 0);
  root.add(rightShoulderJoint);

  const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.95, 24), bronzeMat);
  rightUpperArm.position.set(0.85, 3.95, 0.1);
  rightUpperArm.rotation.set(-0.2, 0, -0.85);
  root.add(rightUpperArm);

  const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.98, 24), bronzeMat);
  rightForearm.position.set(1.32, 4.45, 0.28);
  rightForearm.rotation.set(-0.35, 0, -1.25);
  root.add(rightForearm);

  const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 24), bronzeMat);
  rightHand.position.set(1.72, 4.88, 0.42);
  root.add(rightHand);

  const scalesMount = new THREE.Group();
  scalesMount.name = "RaisedScales";
  scalesMount.position.set(1.72, 4.88, 0.42);

  const fulcrumRing = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 16, 32), polishedGoldMat);
  scalesMount.add(fulcrumRing);

  const scaleBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.5, 32), polishedGoldMat);
  scaleBeam.rotation.z = Math.PI / 2;
  scalesMount.add(scaleBeam);

  [-0.65, 0.65].forEach((xOff) => {
    const panAssembly = new THREE.Group();
    panAssembly.position.set(xOff, 0, 0);

    for (let c = 0; c < 3; c++) {
      const cAngle = (c * Math.PI * 2) / 3;
      const chX = Math.cos(cAngle) * 0.22;
      const chZ = Math.sin(cAngle) * 0.22;
      const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.65, 8), polishedGoldMat);
      chain.position.set(chX * 0.5, -0.325, chZ * 0.5);
      chain.rotation.set(-chZ * 0.35, 0, chX * 0.35);
      panAssembly.add(chain);
    }

    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.035, 36), polishedGoldMat);
    dish.position.y = -0.65;
    panAssembly.add(dish);

    scalesMount.add(panAssembly);
  });
  root.add(scalesMount);

  // Left Arm & Sword
  const leftShoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), bronzeMat);
  leftShoulderJoint.position.set(-0.58, 3.72, 0);
  root.add(leftShoulderJoint);

  const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.95, 24), bronzeMat);
  leftUpperArm.position.set(-0.75, 3.32, 0.08);
  leftUpperArm.rotation.set(0.15, 0, 0.45);
  root.add(leftUpperArm);

  const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.95, 24), bronzeMat);
  leftForearm.position.set(-0.92, 2.58, 0.26);
  leftForearm.rotation.set(0.25, 0, 0.2);
  root.add(leftForearm);

  const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), bronzeMat);
  leftHand.position.set(-0.98, 2.12, 0.38);
  root.add(leftHand);

  const swordGroup = new THREE.Group();
  swordGroup.position.set(-0.98, 2.05, 0.38);

  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.08, 24, 24), polishedGoldMat);
  pommel.position.y = 0.38;
  swordGroup.add(pommel);

  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.28, 16), deepBronzeMat);
  grip.position.y = 0.22;
  swordGroup.add(grip);

  const crossguard = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.09), polishedGoldMat);
  crossguard.position.y = 0.06;
  swordGroup.add(crossguard);

  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.2, 0.025), polishedGoldMat);
  blade.position.y = -1.05;
  swordGroup.add(blade);

  root.add(swordGroup);

  const themisGLB = await exportToGLB(root);
  fs.writeFileSync(path.join(outputDir, 'themis.glb'), themisGLB);
  console.log(`  ✓ 1. Themis Statue GLB baked: ${(themisGLB.length / 1024).toFixed(1)} KB`);
}

// -------------------------------------------------------------------
// 2. SCULPT ARTICULATED JUDICIAL SCALES
// -------------------------------------------------------------------
async function buildPremiumScalesModel() {
  const root = new THREE.Group();
  root.name = "JudicialScales";

  const brassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xf5d061),
    roughness: 0.18,
    metalness: 0.98,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xdfbe7e),
    roughness: 0.2,
    metalness: 0.95,
  });

  const darkBronzeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1a140c),
    roughness: 0.45,
    metalness: 0.78,
  });

  const basePlinth = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.55, 0.22, 64), darkBronzeMat);
  basePlinth.position.y = 0.11;
  root.add(basePlinth);

  const baseMid2 = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.25, 0.18, 64), goldMat);
  baseMid2.position.y = 0.31;
  root.add(baseMid2);

  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 3.4, 48), goldMat);
  pillar.position.y = 2.15;
  root.add(pillar);

  const fulcrum = new THREE.Mesh(new THREE.SphereGeometry(0.26, 32, 32), brassMat);
  fulcrum.position.y = 3.85;
  root.add(fulcrum);

  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.5, 24), brassMat);
  finial.position.y = 4.25;
  root.add(finial);

  const beamGroup = new THREE.Group();
  beamGroup.name = "BeamAssembly";
  beamGroup.position.y = 3.85;

  const mainBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.8, 32), brassMat);
  mainBeam.rotation.z = Math.PI / 2;
  beamGroup.add(mainBeam);

  // Left Pan
  const leftPan = new THREE.Group();
  leftPan.name = "LeftPan";
  leftPan.position.set(-1.8, 0, 0);

  const leftRing = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 16, 32), goldMat);
  leftPan.add(leftRing);

  for (let i = 0; i < 3; i++) {
    const ang = (i * Math.PI * 2) / 3;
    const chX = Math.cos(ang) * 0.68;
    const chZ = Math.sin(ang) * 0.68;
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 1.5, 12), goldMat);
    chain.position.set(chX * 0.5, -0.75, chZ * 0.5);
    chain.rotation.set(-chZ * 0.38, 0, chX * 0.38);
    leftPan.add(chain);
  }

  const leftDish = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.06, 48), brassMat);
  leftDish.position.y = -1.5;
  leftPan.add(leftDish);
  beamGroup.add(leftPan);

  // Right Pan
  const rightPan = new THREE.Group();
  rightPan.name = "RightPan";
  rightPan.position.set(1.8, 0, 0);

  const rightRing = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 16, 32), goldMat);
  rightPan.add(rightRing);

  for (let i = 0; i < 3; i++) {
    const ang = (i * Math.PI * 2) / 3;
    const chX = Math.cos(ang) * 0.68;
    const chZ = Math.sin(ang) * 0.68;
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 1.5, 12), goldMat);
    chain.position.set(chX * 0.5, -0.75, chZ * 0.5);
    chain.rotation.set(-chZ * 0.38, 0, chX * 0.38);
    rightPan.add(chain);
  }

  const rightDish = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.06, 48), brassMat);
  rightDish.position.y = -1.5;
  rightPan.add(rightDish);
  beamGroup.add(rightPan);

  root.add(beamGroup);

  const scalesGLB = await exportToGLB(root);
  fs.writeFileSync(path.join(outputDir, 'scales.glb'), scalesGLB);
  console.log(`  ✓ 2. Judicial Scales GLB baked: ${(scalesGLB.length / 1024).toFixed(1)} KB`);
}

// -------------------------------------------------------------------
// 3. SCULPT MASTER HIGH-FIDELITY JUDICIAL GAVEL & SOUNDING BLOCK
// -------------------------------------------------------------------
async function buildPremiumGavelModel() {
  const root = new THREE.Group();
  root.name = "JudicialGavel";

  // Realistic PBR Walnut Wood Material
  const polishedWalnutMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x281406),
    roughness: 0.22,
    metalness: 0.18,
  });

  // Dark Antique Bronze Metal for Head & Caps
  const darkBronzeMetalMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x322616),
    roughness: 0.26,
    metalness: 0.88,
  });

  // Brushed Judicial Gold Trim Rings & Inlays
  const judicialGoldMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xdfbe7e),
    roughness: 0.16,
    metalness: 0.98,
  });

  // Dark Stone / Heavy Base Plinth
  const darkStoneBaseMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x130e0a),
    roughness: 0.32,
    metalness: 0.35,
  });

  // A. SOUNDING BLOCK (OCTAGONAL BASE WITH STEPPED BEVELS)
  const soundBaseOctagon = new THREE.Mesh(new THREE.CylinderGeometry(1.48, 1.65, 0.26, 8), darkStoneBaseMat);
  soundBaseOctagon.position.y = 0.13;
  root.add(soundBaseOctagon);

  const soundBaseBevelGold = new THREE.Mesh(new THREE.CylinderGeometry(1.36, 1.48, 0.05, 8), judicialGoldMat);
  soundBaseBevelGold.position.y = 0.28;
  root.add(soundBaseBevelGold);

  const soundBaseMid = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.34, 0.22, 8), polishedWalnutMat);
  soundBaseMid.position.y = 0.41;
  root.add(soundBaseMid);

  // Circular Brass Sounding Impact Plate
  const impactPlateRim = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.06, 64), judicialGoldMat);
  impactPlateRim.position.y = 0.54;
  root.add(impactPlateRim);

  const impactPlateCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.065, 64), darkBronzeMetalMat);
  impactPlateCenter.position.y = 0.55;
  root.add(impactPlateCenter);

  // B. GAVEL ASSEMBLY (MOVABLE FOR STRIKE ANIMATION)
  const gavelAssembly = new THREE.Group();
  gavelAssembly.name = "GavelAssembly";
  gavelAssembly.position.set(0, 0.85, 0);

  // 1. Contoured Lathe-Turned Handle (4 distinct ergonomic segments)
  // Segment A: Grip Pommel Bulb
  const pommelBulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 24), polishedWalnutMat);
  pommelBulb.position.set(2.8, 0, 0);
  gavelAssembly.add(pommelBulb);

  const pommelRing = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.024, 20, 32), judicialGoldMat);
  pommelRing.rotation.y = Math.PI / 2;
  pommelRing.position.set(2.68, 0, 0);
  gavelAssembly.add(pommelRing);

  // Segment B: Upper Tapered Shaft
  const handleUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.095, 1.3, 32), polishedWalnutMat);
  handleUpper.rotation.z = Math.PI / 2;
  handleUpper.position.set(2.02, 0, 0);
  gavelAssembly.add(handleUpper);

  // Midpoint Gold Ring Inlay
  const midRing = new THREE.Mesh(new THREE.TorusGeometry(0.098, 0.022, 20, 32), judicialGoldMat);
  midRing.rotation.y = Math.PI / 2;
  midRing.position.set(1.36, 0, 0);
  gavelAssembly.add(midRing);

  // Segment C: Palm Swell Contoured Grip
  const handleLower = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.115, 1.25, 32), polishedWalnutMat);
  handleLower.rotation.z = Math.PI / 2;
  handleLower.position.set(0.72, 0, 0);
  gavelAssembly.add(handleLower);

  // Neck Collar Gold Ring
  const neckRing = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 20, 32), judicialGoldMat);
  neckRing.rotation.y = Math.PI / 2;
  neckRing.position.set(0.08, 0, 0);
  gavelAssembly.add(neckRing);

  // 2. Gavel Barrel Head (Dual-sided antique bronze with chamfered striking caps)
  const gavelHead = new THREE.Group();
  gavelHead.name = "GavelHead";

  // Central Barrel Body
  const headCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 1.1, 48), polishedWalnutMat);
  headCenter.rotation.x = Math.PI / 2;
  gavelHead.add(headCenter);

  // Central Gold Inlay Band
  const centerBand = new THREE.Mesh(new THREE.CylinderGeometry(0.375, 0.375, 0.22, 48), judicialGoldMat);
  centerBand.rotation.x = Math.PI / 2;
  gavelHead.add(centerBand);

  // Twin Striking Ends (Front and Back)
  [-0.62, 0.62].forEach((zPos) => {
    // Stepped Gold Transition Ring
    const faceRingGold = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 48), judicialGoldMat);
    faceRingGold.rotation.x = Math.PI / 2;
    faceRingGold.position.z = zPos * 0.85;
    gavelHead.add(faceRingGold);

    // Heavy Bronze Striking Face Cap
    const faceCapBronze = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.39, 0.18, 48), darkBronzeMetalMat);
    faceCapBronze.rotation.x = Math.PI / 2;
    faceCapBronze.position.z = zPos;
    gavelHead.add(faceCapBronze);

    // Beveled Edge Rim
    const capRim = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.02, 16, 48), judicialGoldMat);
    capRim.position.z = zPos + (zPos > 0 ? 0.09 : -0.09);
    gavelHead.add(capRim);
  });

  gavelAssembly.add(gavelHead);
  root.add(gavelAssembly);

  const gavelGLB = await exportToGLB(root);
  fs.writeFileSync(path.join(outputDir, 'judicial-gavel.glb'), gavelGLB);
  fs.writeFileSync(path.join(outputDir, 'gavel.glb'), gavelGLB);
  console.log(`  ✓ 3. Master Judicial Gavel GLB baked: ${(gavelGLB.length / 1024).toFixed(1)} KB`);
}

async function runAll() {
  console.log("Starting Master 3D Sculpting & Baking Pipeline...");
  await buildPremiumThemisModel();
  await buildPremiumScalesModel();
  await buildPremiumGavelModel();
  console.log("Master 3D Pipeline completed successfully with all assets baked.");
}

runAll().catch(console.error);
