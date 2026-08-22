import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, PresentationControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Models
const ProceduralThemis = ({ isInsightMode, isNightMode }: { isInsightMode: boolean, isNightMode: boolean }) => {
  const group = useRef<THREE.Group>(null);
  const color = isInsightMode ? '#00e5ff' : (isNightMode ? '#5c4e33' : '#3d3422');
  const wireframe = isInsightMode;
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 3, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.7} wireframe={wireframe} />
      </mesh>
      <mesh position={[0, 3.3, 0]}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.7} wireframe={wireframe} />
      </mesh>
      {/* Basic arms */}
      <mesh position={[-0.6, 2.3, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.7} wireframe={wireframe} />
      </mesh>
      <mesh position={[0.6, 2.3, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.08, 0.08, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.7} wireframe={wireframe} />
      </mesh>
    </group>
  );
};

const ProceduralHammer = ({ isNightMode, triggerStrike }: { isNightMode: boolean, triggerStrike: boolean }) => {
  const group = useRef<THREE.Group>(null);
  const handleColor = isNightMode ? '#3e2723' : '#4e342e';
  const headColor = isNightMode ? '#3e2723' : '#4e342e';
  
  // Strike animation
  useFrame(() => {
    if (group.current) {
      if (triggerStrike) {
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, Math.PI / 4, 0.2);
        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, -0.5, 0.2);
      } else {
        group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -Math.PI / 8, 0.1);
        group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, 0.5, 0.1);
      }
    }
  });

  return (
    <group ref={group}>
      {/* Handle */}
      <mesh position={[0, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 2.5, 32]} />
        <meshStandardMaterial color={handleColor} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 1.2, 32]} />
        <meshStandardMaterial color={headColor} roughness={0.5} />
      </mesh>
      {/* Base/Sound block */}
      <mesh position={[0, -1, 0.5]}>
        <cylinderGeometry args={[0.8, 0.9, 0.2, 32]} />
        <meshStandardMaterial color={handleColor} roughness={0.6} />
      </mesh>
    </group>
  );
};

const ProceduralScales = ({ isNightMode, balanceState }: { isNightMode: boolean, balanceState: string | null }) => {
  const group = useRef<THREE.Group>(null);
  const color = isNightMode ? '#ffd54f' : '#ffc107'; // Brass/gold
  
  const [leftY, setLeftY] = useState(0);
  const [rightY, setRightY] = useState(0);
  const [beamRot, setBeamRot] = useState(0);

  useEffect(() => {
    if (balanceState === 'LAW') {
      setLeftY(-0.5); setRightY(0.5); setBeamRot(-0.15);
    } else if (balanceState === 'JUSTICE') {
      setLeftY(0.5); setRightY(-0.5); setBeamRot(0.15);
    } else {
      setLeftY(0); setRightY(0); setBeamRot(0);
    }
  }, [balanceState]);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      
      const beam = group.current.children[2]; // Index 2 is beam
      beam.rotation.z = THREE.MathUtils.lerp(beam.rotation.z, beamRot, 0.1);
      
      const leftPlate = group.current.children[3]; // Index 3 is left plate
      const rightPlate = group.current.children[4]; // Index 4 is right plate
      
      leftPlate.position.y = THREE.MathUtils.lerp(leftPlate.position.y, 2 + leftY, 0.1);
      rightPlate.position.y = THREE.MathUtils.lerp(rightPlate.position.y, 2 + rightY, 0.1);
    }
  });

  return (
    <group ref={group}>
      {/* Stand Base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 1, 0.2, 32]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Stand Pillar */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 3]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Beam */}
      <mesh position={[0, 3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 3.5]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Left Plate (visual parented to world for lerp) */}
      <group position={[-1.75, 2, 0]}>
        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.05, 32]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.75, 0]}>
           <cylinderGeometry args={[0.02, 0.02, 1.5]} />
           <meshStandardMaterial color={color} />
        </mesh>
      </group>
      
      {/* Right Plate */}
      <group position={[1.75, 2, 0]}>
        <mesh position={[0, -1.5, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.05, 32]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, -0.75, 0]}>
           <cylinderGeometry args={[0.02, 0.02, 1.5]} />
           <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
};

export const JusticeScene3D = ({
  activeStage,
  isInsightMode,
  balanceState,
  triggerStrike
}: {
  activeStage: 'themis' | 'hammer' | 'scales';
  isInsightMode: boolean;
  balanceState: string | null;
  triggerStrike: boolean;
}) => {
  const isNightMode = true; // Hardcoded for simplicity if theme context isn't passed

  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 45 }}
      style={{ width: '100%', height: '100%', minHeight: '500px', background: 'transparent' }}
    >
      <ambientLight intensity={isNightMode ? 0.3 : 0.8} />
      <directionalLight position={[5, 10, 5]} intensity={isNightMode ? 0.6 : 1.2} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={isNightMode ? 0.3 : 0.6} color="#00e5ff" />
      
      <Environment preset={isNightMode ? "night" : "city"} />
      
      <PresentationControls
        global={true}
        cursor={true}
        snap={true}
        speed={1}
        zoom={1}
        rotation={[0, 0, 0]}
        polar={[-0.1, 0.1]} // Vertical limits
        azimuth={[-Math.PI / 4, Math.PI / 4]} // Horizontal limits
      >
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.1}>
          {activeStage === 'themis' && (
            <ProceduralThemis isInsightMode={isInsightMode} isNightMode={isNightMode} />
          )}
          {activeStage === 'hammer' && (
            <ProceduralHammer isNightMode={isNightMode} triggerStrike={triggerStrike} />
          )}
          {activeStage === 'scales' && (
            <ProceduralScales isNightMode={isNightMode} balanceState={balanceState} />
          )}
        </Float>
      </PresentationControls>

      <ContactShadows position={[0, -1.2, 0]} opacity={0.5} scale={10} blur={2} far={4} color={isNightMode ? "#000" : "#444"} />
    </Canvas>
  );
};
