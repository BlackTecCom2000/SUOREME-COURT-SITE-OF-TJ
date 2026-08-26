import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ThemisGLBProps {
  isInsightMode?: boolean;
  isDark?: boolean;
  modelPath: string;
}

export const ThemisGLB: React.FC<ThemisGLBProps> = ({
  isInsightMode = false,
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

    // Apply corrective rotation so Themis stands vertically upright on its round pedestal (Z-up to Y-up)
    clonedScene.rotation.x = -Math.PI / 2;
    clonedScene.updateMatrixWorld(true);

    // Compute bounding box after upright orientation
    const box = new THREE.Box3().setFromObject(clonedScene);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Normalize vertical height to ~4.4 units so she occupies 70-75% of viewport
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetSize = 4.4;
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
          if (isInsightMode) {
            mat.wireframe = true;
            mat.color.set(0x38bdf8);
            mat.emissive.set(0x0284c7);
            mat.emissiveIntensity = 0.45;
          } else {
            mat.wireframe = false;
            mat.roughness = 0.38;
            mat.metalness = 0.75;
            mat.emissive.set(isDark ? 0xdfbe7e : 0xc5a059);
            mat.emissiveIntensity = 0.05;
          }
          mesh.material = mat;
        }
      }
    });
  }, [clonedScene, isInsightMode, isDark]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Subtle continuous natural breathing
      const t = state.clock.elapsedTime;
      groupRef.current.rotation.y = Math.sin(t * 0.35) * 0.06;

      const targetY = -0.15 + Math.sin(t * 0.7) * 0.02;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, Math.min(delta * 3.5, 0.1));
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, -0.15, 0]}
      scale={[1.0, 1.0, 1.0]}
    >
      <primitive object={clonedScene} />
    </group>
  );
};
