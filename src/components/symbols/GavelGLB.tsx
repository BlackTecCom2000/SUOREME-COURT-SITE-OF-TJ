import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface GavelGLBProps {
  triggerStrike?: boolean;
  isDark?: boolean;
  onDecision?: () => void;
  modelPath: string;
}

export const GavelGLB: React.FC<GavelGLBProps> = ({
  triggerStrike = false,
  isDark = true,
  onDecision,
  modelPath,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const gavelRef = useRef<THREE.Object3D | null>(null);
  const rippleRef = useRef<THREE.Mesh>(null);
  const sparksRef = useRef<THREE.Points>(null);

  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene, modelPath]);

  // Clean up cloned materials/geometries when component unmounts
  useEffect(() => {
    return () => {
      clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry) mesh.geometry.dispose();
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach(m => m.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        }
      });
    };
  }, [clonedScene]);

  // Strike state machine: 'ready' -> 'lift' -> 'apex' -> 'slam' -> 'impact' -> 'settle'
  const [strikePhase, setStrikePhase] = useState<'ready' | 'lift' | 'apex' | 'slam' | 'impact' | 'settle'>('ready');
  const animProgress = useRef(0);
  const [showRipple, setShowRipple] = useState(false);
  const rippleScale = useRef(0.1);
  const rippleOpacity = useRef(0.9);

  // Subtle sparks particle geometry
  const sparksGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 36;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 0.8 + Math.random() * 1.6;
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0.55;
      positions[i * 3 + 2] = 0;

      velocities[i * 3] = Math.cos(angle) * speed;
      velocities[i * 3 + 1] = Math.random() * 1.2 + 0.3;
      velocities[i * 3 + 2] = Math.sin(angle) * speed;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    return geo;
  }, []);

  useEffect(() => {
    gavelRef.current = clonedScene.getObjectByName('GavelAssembly') || clonedScene.getObjectByName('gavel') || clonedScene.getObjectByName('Hammer') || null;

    // Calculate bounding box for perfect center and prominent judicial presence
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Compute uniform scale so gavel takes ~65-72% viewport width/height (target dimension: ~4.2 units)
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 4.2;
    const normalizedScale = maxDim > 0 ? targetSize / maxDim : 1;
    clonedScene.scale.set(normalizedScale, normalizedScale, normalizedScale);

    // Center model at origin precisely
    const scaledBox = new THREE.Box3().setFromObject(clonedScene);
    const scaledCenter = new THREE.Vector3();
    scaledBox.getCenter(scaledCenter);

    clonedScene.position.x = -scaledCenter.x;
    clonedScene.position.y = -scaledCenter.y;
    clonedScene.position.z = -scaledCenter.z;
  }, [clonedScene]);

  // Apply materials without mutating geometry
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.emissive.set(isDark ? 0xdfbe7e : 0xc5a059);
          mat.emissiveIntensity = 0.05;
          mesh.material = mat;
        }
      }
    });
  }, [clonedScene, isDark]);

  // Handle external trigger
  useEffect(() => {
    if (triggerStrike && strikePhase === 'ready') {
      setStrikePhase('lift');
      animProgress.current = 0;
    }
  }, [triggerStrike]);

  useFrame((state, delta) => {
    const gavel = gavelRef.current;
    if (!gavel) return;

    if (strikePhase === 'lift') {
      // Smooth cinematic lift & anticipation
      animProgress.current += delta * 3.8;
      const p = Math.min(animProgress.current, 1);
      const easeP = Math.sin(p * Math.PI * 0.5);

      gavel.position.y = 0.85 + easeP * 1.95;
      gavel.rotation.z = -easeP * 0.88;

      if (animProgress.current >= 1) {
        setStrikePhase('apex');
        animProgress.current = 0;
      }
    } else if (strikePhase === 'apex') {
      // Short dramatic pause at the top
      animProgress.current += delta * 12.0;
      if (animProgress.current >= 1) {
        setStrikePhase('slam');
        animProgress.current = 0;
      }
    } else if (strikePhase === 'slam') {
      // Rapid downward acceleration
      animProgress.current += delta * 8.5;
      const p = Math.min(animProgress.current, 1);
      const accelP = p * p; // Quadratic acceleration

      gavel.position.y = 2.8 - accelP * 1.95;
      gavel.rotation.z = -0.88 + accelP * 0.88;

      if (animProgress.current >= 1) {
        // Physical contact moment!
        gavel.position.y = 0.85;
        gavel.rotation.z = 0;
        setStrikePhase('impact');
        animProgress.current = 0;
        setShowRipple(true);
        rippleScale.current = 0.2;
        rippleOpacity.current = 0.95;
        onDecision?.();
      }
    } else if (strikePhase === 'impact' || strikePhase === 'settle') {
      // Physical micro-rebound oscillation
      animProgress.current += delta * 4.2;
      const decay = Math.exp(-animProgress.current * 3.5);
      gavel.position.y = 0.85 + Math.sin(animProgress.current * Math.PI * 5) * decay * 0.09;

      if (animProgress.current >= 1) {
        setStrikePhase('ready');
        animProgress.current = 0;
      }
    } else {
      // Idle resting state with subtle natural breathing
      const t = state.clock.elapsedTime;
      gavel.position.y = 0.85 + Math.sin(t * 1.8) * 0.015;
    }

    // Shockwave ripple animation
    if (showRipple && rippleRef.current) {
      rippleScale.current += delta * 4.8;
      rippleOpacity.current -= delta * 1.6;
      rippleRef.current.scale.set(rippleScale.current, rippleScale.current, rippleScale.current);

      const mat = rippleRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.max(0, rippleOpacity.current);
      }

      if (rippleOpacity.current <= 0) {
        setShowRipple(false);
      }
    }

    // Sparks particle physics
    if (showRipple && sparksRef.current) {
      const posAttr = sparksGeometry.getAttribute('position') as THREE.BufferAttribute;
      const velAttr = sparksGeometry.getAttribute('velocity') as THREE.BufferAttribute;
      if (posAttr && velAttr) {
        const pArr = posAttr.array as Float32Array;
        const vArr = velAttr.array as Float32Array;
        for (let i = 0; i < posAttr.count; i++) {
          pArr[i * 3] += vArr[i * 3] * delta;
          pArr[i * 3 + 1] += vArr[i * 3 + 1] * delta;
          pArr[i * 3 + 2] += vArr[i * 3 + 2] * delta;
          vArr[i * 3 + 1] -= delta * 3.0; // Gravity
        }
        posAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, -0.2, 0]}
      scale={[1.0, 1.0, 1.0]}
    >
      <primitive object={clonedScene} />

      {/* Expanding Golden Shockwave Light Ring */}
      <mesh
        ref={rippleRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.56, 0]}
        visible={showRipple}
      >
        <ringGeometry args={[0.75, 1.1, 48]} />
        <meshBasicMaterial
          color={isDark ? '#dfbe7e' : '#c5a059'}
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Sparkle Impact Particle Points */}
      {showRipple && (
        <points ref={sparksRef} geometry={sparksGeometry}>
          <pointsMaterial
            size={0.06}
            color={isDark ? '#ffe082' : '#dfbe7e'}
            transparent
            opacity={0.85}
          />
        </points>
      )}
    </group>
  );
};
