import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ScalesGLBProps {
  balanceState?: 'neutral' | 'law' | 'justice' | 'restored';
  isDark?: boolean;
  modelPath: string;
}

export const ScalesGLB: React.FC<ScalesGLBProps> = ({
  balanceState: _balanceState = 'neutral',
  isDark = true,
  modelPath
}) => {
  const groupRef = useRef<THREE.Group>(null);
  
  const { scene } = useGLTF(modelPath);
  
  // Clone scene so multiple instances don't clash
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

  // 1. Compute geometry & upright orientation ONCE on mount / scene load
  useEffect(() => {
    clonedScene.rotation.set(0, 0, 0);
    clonedScene.scale.set(1, 1, 1);
    clonedScene.position.set(0, 0, 0);
    clonedScene.updateMatrixWorld(true);

    // Compute bounding box (model is already Y-up: base at Y=0, top at Y≈0.986)
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Normalize vertical height to ~4.5 units so it fits the viewport
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 4.5;
    const normalizedScale = maxDim > 0 ? targetSize / maxDim : 1;
    
    clonedScene.scale.set(normalizedScale, normalizedScale, normalizedScale);
    clonedScene.updateMatrixWorld(true);

    // Center on X, Y and Z precisely
    const scaledBox = new THREE.Box3().setFromObject(clonedScene);
    const scaledCenter = new THREE.Vector3();
    scaledBox.getCenter(scaledCenter);

    clonedScene.position.x = -scaledCenter.x;
    clonedScene.position.y = -scaledCenter.y;
    clonedScene.position.z = -scaledCenter.z;
  }, [clonedScene]);

  // 2. Apply materials safely without touching transforms
  useEffect(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          mat.wireframe = false;
          mat.roughness = 0.25;
          mat.metalness = 0.85;
          mat.emissive.set(isDark ? 0xdfbe7e : 0xc5a059);
          mat.emissiveIntensity = 0.1;
          mesh.material = mat;
        }
      }
    });
  }, [clonedScene, isDark]);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(elapsed * 0.25) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.5, 0]} scale={[1.0, 1.0, 1.0]}>
      <primitive object={clonedScene} />
    </group>
  );
};
