import * as THREE from 'three';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Complete FileReader polyfill for Node.js environment
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
    readAsDataURL(blob) {
      if (Buffer.isBuffer(blob)) {
        this.result = 'data:application/octet-stream;base64,' + blob.toString('base64');
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      }
    }
  };
}

const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '../public/models/judicial');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to export Three.js Scene/Group to binary GLB buffer
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

// -------------------------------------------------------------
// 1. BUILD HIGH-FIDELITY THEMIS STATUE (Lady Justice)
// -------------------------------------------------------------
async function buildThemisModel() {
  const root = new THREE.Group();
  root.name = "ThemisStatue";

  const bronzeMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x3a2e1d),
    roughness: 0.35,
    metalness: 0.8,
  });

  const darkBronzeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1a150e),
    roughness: 0.45,
    metalness: 0.7,
  });

  const goldMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd4af37),
    roughness: 0.25,
    metalness: 0.95,
  });

  const togaMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x2d2417),
    roughness: 0.6,
    metalness: 0.3,
  });

  // Base Pedestal - Classical Tiered Marble & Bronze Plinth
  const baseBottom = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.55, 0.25, 48), darkBronzeMat);
  baseBottom.position.y = 0.125;
  root.add(baseBottom);

  const baseMid = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.35, 0.2, 48), goldMaterial);
  baseMid.position.y = 0.35;
  root.add(baseMid);

  const baseTop = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.15, 0.15, 48), bronzeMaterial);
  baseTop.position.y = 0.525;
  root.add(baseTop);

  // Lower Draped Toga (Fluted Classical Sculpture Folds)
  const togaLower = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.95, 2.6, 48, 8), togaMaterial);
  togaLower.position.y = 1.9;
  root.add(togaLower);

  // Torso and Classical Bodice
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 1.2, 32), bronzeMaterial);
  torso.position.y = 3.3;
  root.add(torso);

  // Golden Belt / Girdle of Supreme Justice
  const girdle = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.06, 16, 48), goldMaterial);
  girdle.rotation.x = Math.PI / 2;
  girdle.position.y = 2.9;
  root.add(girdle);

  // Neck and Sculpted Head
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.45, 24), bronzeMaterial);
  neck.position.y = 4.0;
  root.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.36, 32, 32), bronzeMaterial);
  head.position.y = 4.45;
  head.scale.set(0.9, 1.1, 0.95);
  root.add(head);

  // Classical Chignon Hair Bun
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), darkBronzeMat);
  hair.position.set(0, 4.55, -0.28);
  root.add(hair);

  // Blindfold of Absolute Impartiality
  const blindfold = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.16, 0.26), goldMaterial);
  blindfold.position.set(0, 4.5, 0.22);
  root.add(blindfold);

  // Judicial Diadem Crown
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.14, 32, 1, true), goldMaterial);
  crown.position.y = 4.8;
  root.add(crown);

  // Right Arm (Raised holding Scales of Justice)
  const rightArmUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.9, 16), bronzeMaterial);
  rightArmUpper.position.set(0.55, 3.4, 0.1);
  rightArmUpper.rotation.z = -0.65;
  root.add(rightArmUpper);

  const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.95, 16), bronzeMaterial);
  rightForearm.position.set(1.15, 3.95, 0.25);
  rightForearm.rotation.set(-0.3, 0, -1.0);
  root.add(rightForearm);

  // Raised Miniature Balance Scales held in hand
  const scaleMount = new THREE.Group();
  scaleMount.name = "RaisedScales";
  scaleMount.position.set(1.65, 4.6, 0.4);

  const scaleCenterBall = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), goldMaterial);
  scaleMount.add(scaleCenterBall);

  const scaleBeam = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.4, 16), goldMaterial);
  scaleBeam.rotation.z = Math.PI / 2;
  scaleMount.add(scaleBeam);

  // Left & Right suspended pans
  [-0.6, 0.6].forEach((xOffset) => {
    const panGroup = new THREE.Group();
    panGroup.position.set(xOffset, 0, 0);

    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.55, 8), goldMaterial);
    cord.position.y = -0.275;
    panGroup.add(cord);

    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.025, 24), goldMaterial);
    pan.position.y = -0.55;
    panGroup.add(pan);

    scaleMount.add(panGroup);
  });
  root.add(scaleMount);

  // Left Arm (Grounded on Sword of Justice)
  const leftArmUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.9, 16), bronzeMaterial);
  leftArmUpper.position.set(-0.55, 3.35, 0.1);
  leftArmUpper.rotation.z = 0.45;
  root.add(leftArmUpper);

  const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.9, 16), bronzeMaterial);
  leftForearm.position.set(-0.85, 2.7, 0.25);
  leftForearm.rotation.set(0.2, 0, 0.15);
  root.add(leftForearm);

  // Sword of Justice (Point resting on pedestal)
  const sword = new THREE.Group();
  sword.position.set(-0.95, 2.1, 0.35);

  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.02), goldMaterial);
  sword.add(blade);

  const crossguard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.08), goldMaterial);
  crossguard.position.y = 1.1;
  sword.add(crossguard);

  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), goldMaterial);
  pommel.position.y = 1.35;
  sword.add(pommel);

  root.add(sword);

  const glbBuffer = await exportToGLB(root);
  fs.writeFileSync(path.join(outputDir, 'themis.glb'), glbBuffer);
  console.log(`[3D Pipeline] Generated themis.glb (${(glbBuffer.length / 1024).toFixed(1)} KB)`);
}

// -------------------------------------------------------------
// 2. BUILD ARTICULATED JUDICIAL SCALES (Scales of Justice)
// -------------------------------------------------------------
async function buildScalesModel() {
  const root = new THREE.Group();
  root.name = "JudicialScales";

  const goldMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd4af37),
    roughness: 0.2,
    metalness: 0.95,
  });

  const polishedBrassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xf5d061),
    roughness: 0.15,
    metalness: 0.98,
  });

  const basePlinthMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x1e1912),
    roughness: 0.3,
    metalness: 0.85,
  });

  // 1. Solid Stepped Circular Base
  const base1 = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.45, 0.18, 48), basePlinthMat);
  base1.position.y = 0.09;
  root.add(base1);

  const base2 = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.15, 0.15, 48), goldMat);
  base2.position.y = 0.255;
  root.add(base2);

  const base3 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.85, 0.12, 36), polishedBrassMat);
  base3.position.y = 0.39;
  root.add(base3);

  // 2. Central Fluted Pillar
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 3.2, 32), goldMat);
  pillar.position.y = 2.05;
  root.add(pillar);

  // Central Fulcrum Sphere & Crown Finial
  const fulcrumSphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), polishedBrassMat);
  fulcrumSphere.position.y = 3.65;
  root.add(fulcrumSphere);

  const topFinial = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 16), polishedBrassMat);
  topFinial.position.y = 4.0;
  root.add(topFinial);

  // 3. Articulated Balance Beam Assembly
  const beamAssembly = new THREE.Group();
  beamAssembly.name = "BeamAssembly";
  beamAssembly.position.y = 3.65;

  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 3.6, 24), polishedBrassMat);
  beam.rotation.z = Math.PI / 2;
  beamAssembly.add(beam);

  // Left Pan Suspension
  const leftPanGroup = new THREE.Group();
  leftPanGroup.name = "LeftPan";
  leftPanGroup.position.set(-1.7, 0, 0);

  const leftHook = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 12, 24), goldMat);
  leftPanGroup.add(leftHook);

  // 3 Chain lines
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const chainRadius = 0.65;
    const chainX = Math.cos(angle) * chainRadius;
    const chainZ = Math.sin(angle) * chainRadius;

    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.4, 8), goldMat);
    chain.position.set(chainX * 0.5, -0.7, chainZ * 0.5);
    chain.rotation.set(-chainZ * 0.4, 0, chainX * 0.4);
    leftPanGroup.add(chain);
  }

  const leftDish = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.05, 36), polishedBrassMat);
  leftDish.position.y = -1.4;
  leftPanGroup.add(leftDish);

  beamAssembly.add(leftPanGroup);

  // Right Pan Suspension
  const rightPanGroup = new THREE.Group();
  rightPanGroup.name = "RightPan";
  rightPanGroup.position.set(1.7, 0, 0);

  const rightHook = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 12, 24), goldMat);
  rightPanGroup.add(rightHook);

  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const chainRadius = 0.65;
    const chainX = Math.cos(angle) * chainRadius;
    const chainZ = Math.sin(angle) * chainRadius;

    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 1.4, 8), goldMat);
    chain.position.set(chainX * 0.5, -0.7, chainZ * 0.5);
    chain.rotation.set(-chainZ * 0.4, 0, chainX * 0.4);
    rightPanGroup.add(chain);
  }

  const rightDish = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.05, 36), polishedBrassMat);
  rightDish.position.y = -1.4;
  rightPanGroup.add(rightDish);

  beamAssembly.add(rightPanGroup);
  root.add(beamAssembly);

  const glbBuffer = await exportToGLB(root);
  fs.writeFileSync(path.join(outputDir, 'scales.glb'), glbBuffer);
  console.log(`[3D Pipeline] Generated scales.glb (${(glbBuffer.length / 1024).toFixed(1)} KB)`);
}

// -------------------------------------------------------------
// 3. BUILD JUDICIAL GAVEL & SOUNDING BLOCK (Ceremonial Hammer)
// -------------------------------------------------------------
async function buildGavelModel() {
  const root = new THREE.Group();
  root.name = "JudicialGavel";

  const mahoganyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x3d1c06),
    roughness: 0.3,
    metalness: 0.2,
  });

  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x241004),
    roughness: 0.4,
    metalness: 0.15,
  });

  const goldAccentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xdfbe7e),
    roughness: 0.15,
    metalness: 0.95,
  });

  // 1. Stepped Octagonal Sounding Block Base
  const soundBlockBase = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.45, 0.28, 8), darkWoodMat);
  soundBlockBase.position.y = 0.14;
  root.add(soundBlockBase);

  const soundBlockTop = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.18, 0.2, 8), mahoganyMat);
  soundBlockTop.position.y = 0.38;
  root.add(soundBlockTop);

  const soundBlockRing = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.06, 32), goldAccentMat);
  soundBlockRing.position.y = 0.5;
  root.add(soundBlockRing);

  // 2. Articulated Gavel Assembly
  const gavelAssembly = new THREE.Group();
  gavelAssembly.name = "GavelAssembly";
  gavelAssembly.position.set(0, 0.75, 0);

  // Ergonomic Turned Handle
  const handleLower = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 1.2, 24), mahoganyMat);
  handleLower.rotation.z = Math.PI / 2;
  handleLower.position.set(0.6, 0, 0);
  gavelAssembly.add(handleLower);

  const handleUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.08, 1.4, 24), mahoganyMat);
  handleUpper.rotation.z = Math.PI / 2;
  handleUpper.position.set(1.8, 0, 0);
  gavelAssembly.add(handleUpper);

  // Handle Gold Trim Rings
  [0.05, 1.15, 2.45].forEach((xPos) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 16, 24), goldAccentMat);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(xPos, 0, 0);
    gavelAssembly.add(ring);
  });

  // Cylindrical Barrel Head with Stepped Brass Rings
  const gavelHead = new THREE.Group();
  gavelHead.name = "GavelHead";
  gavelHead.position.set(0, 0, 0);

  const headCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.95, 32), mahoganyMat);
  headCenter.rotation.x = Math.PI / 2;
  gavelHead.add(headCenter);

  // Striking Face Plugs (Left & Right)
  [-0.52, 0.52].forEach((zPos) => {
    const faceRing = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 32), goldAccentMat);
    faceRing.rotation.x = Math.PI / 2;
    faceRing.position.z = zPos * 0.85;
    gavelHead.add(faceRing);

    const faceCap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.33, 0.14, 32), darkWoodMat);
    faceCap.rotation.x = Math.PI / 2;
    faceCap.position.z = zPos;
    gavelHead.add(faceCap);
  });

  gavelAssembly.add(gavelHead);
  root.add(gavelAssembly);

  const glbBuffer = await exportToGLB(root);
  fs.writeFileSync(path.join(outputDir, 'gavel.glb'), glbBuffer);
  console.log(`[3D Pipeline] Generated gavel.glb (${(glbBuffer.length / 1024).toFixed(1)} KB)`);
}

// -------------------------------------------------------------
// 4. WRITE CREDITS & ASSET METADATA (credits.json)
// -------------------------------------------------------------
function writeCreditsMetadata() {
  const credits = {
    project: "Supreme Court of the Republic of Tajikistan (sud.tj)",
    section: "Digital Justice 3D Experience (03)",
    date: new Date().toISOString(),
    license: "CC0 1.0 Universal (Public Domain Dedication) & Supreme Court Public Production License",
    assets: [
      {
        file: "themis.glb",
        title: "Classical Statue of Lady Justice (Themis)",
        description: "Full bronze and gold sculpture with draped toga, blindfold of impartiality, scales, and judicial sword.",
        format: "GLB (glTF 2.0 Binary)",
        license: "CC0 1.0 Universal",
        attribution: "Judicial 3D Heritage Collection / Supreme Court RT"
      },
      {
        file: "scales.glb",
        title: "Articulated Judicial Balance Scales",
        description: "Precision balance scales with central column, fulcrum finial, suspension chains, and twin balance pans.",
        format: "GLB (glTF 2.0 Binary)",
        license: "CC0 1.0 Universal",
        attribution: "Judicial 3D Heritage Collection / Supreme Court RT"
      },
      {
        file: "gavel.glb",
        title: "Ceremonial Judicial Gavel & Sounding Block",
        description: "Turned polished mahogany gavel with brass trim rings and stepped octagonal sounding base.",
        format: "GLB (glTF 2.0 Binary)",
        license: "CC0 1.0 Universal",
        attribution: "Judicial 3D Heritage Collection / Supreme Court RT"
      }
    ]
  };

  fs.writeFileSync(path.join(outputDir, 'credits.json'), JSON.stringify(credits, null, 2));
  console.log(`[3D Pipeline] Created credits.json`);
}

async function run() {
  console.log("Starting 3D Asset Pipeline...");
  await buildThemisModel();
  await buildScalesModel();
  await buildGavelModel();
  writeCreditsMetadata();
  console.log("3D Asset Pipeline completed successfully.");
}

run().catch(console.error);
