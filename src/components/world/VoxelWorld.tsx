'use client';
import { Canvas } from '@react-three/fiber';
import { Sky, OrbitControls } from '@react-three/drei';
import { useWorldStore } from '@/store/useWorldStore';
import { useSimStore } from '@/store/useSimStore';
import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

const BLOCK_COLORS: Record<string, string> = {
  grass: '#5d9b37',
  dirt: '#8b6914',
  stone: '#808080',
  sand: '#d4bc60',
  wood: '#6b4226',
  leaves: '#2d8c1e',
};

function BlockInstances({
  positions,
  color,
  roughness = 0.85,
  transparent = false,
  opacity = 1,
}: {
  positions: [number, number, number][];
  color: string;
  roughness?: number;
  transparent?: boolean;
  opacity?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    positions.forEach((pos, i) => {
      dummy.position.set(pos[0], pos[1], pos[2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [positions]);

  if (positions.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, positions.length]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        transparent={transparent}
        opacity={opacity}
        roughness={roughness}
      />
    </instancedMesh>
  );
}

function Terrain() {
  const blocks = useWorldStore((state) => state.blocks);

  const groups = useMemo(() => {
    const map: Record<string, [number, number, number][]> = {};
    for (const b of blocks) {
      (map[b.type] ??= []).push(b.pos);
    }
    return map;
  }, [blocks]);

  return (
    <>
      {Object.entries(groups).map(([type, positions]) => (
        <BlockInstances
          key={`${type}-${positions.length}`}
          positions={positions}
          color={BLOCK_COLORS[type] || '#888'}
          roughness={type === 'leaves' ? 0.95 : 0.85}
        />
      ))}
    </>
  );
}

function SimCharacter() {
  const position = useSimStore((state) => state.position);
  const isThinking = useSimStore((state) => state.isThinking);

  return (
    <group position={position}>
      {/* Beacon pillar so sim is visible from far away */}
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[0.15, 8, 0.15]} />
        <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.4} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 10.5, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.6} />
      </mesh>

      <group scale={1.4}>
        {/* Head */}
        <mesh position={[0, 1.75, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="#d4a574" />
        </mesh>
        {/* Hair */}
        <mesh position={[0, 2.02, 0]} castShadow>
          <boxGeometry args={[0.52, 0.06, 0.52]} />
          <meshStandardMaterial color="#4a2c0a" />
        </mesh>
        {/* Body */}
        <mesh position={[0, 1.125, 0]} castShadow>
          <boxGeometry args={[0.5, 0.75, 0.3]} />
          <meshStandardMaterial color="#0ea5e9" />
        </mesh>
        {/* Left Arm */}
        <mesh position={[-0.4, 1.125, 0]} castShadow>
          <boxGeometry args={[0.25, 0.75, 0.25]} />
          <meshStandardMaterial color="#0ea5e9" />
        </mesh>
        {/* Right Arm */}
        <mesh position={[0.4, 1.125, 0]} castShadow>
          <boxGeometry args={[0.25, 0.75, 0.25]} />
          <meshStandardMaterial color="#0ea5e9" />
        </mesh>
        {/* Left Leg */}
        <mesh position={[-0.13, 0.375, 0]} castShadow>
          <boxGeometry args={[0.25, 0.75, 0.25]} />
          <meshStandardMaterial color="#1e3a5f" />
        </mesh>
        {/* Right Leg */}
        <mesh position={[0.13, 0.375, 0]} castShadow>
          <boxGeometry args={[0.25, 0.75, 0.25]} />
          <meshStandardMaterial color="#1e3a5f" />
        </mesh>
      </group>

      {/* Thinking indicator */}
      {isThinking && (
        <group>
          <mesh position={[0.4, 3.2, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.65, 3.6, 0]}>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[0.8, 4.1, 0]}>
            <sphereGeometry args={[0.25, 12, 12]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.3} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function AnimalModel({
  entity,
}: {
  entity: { id: string; type: string; pos: [number, number, number] };
}) {
  const isChicken = entity.type === 'chicken';
  const scale = isChicken ? 0.6 : 1;

  const bodyColor =
    entity.type === 'cow'
      ? '#6b3a1f'
      : entity.type === 'sheep'
        ? '#e8e8e8'
        : '#f5f5f0';

  const headColor =
    entity.type === 'cow' ? '#8b5a3a' : entity.type === 'sheep' ? '#555' : '#cc3333';

  return (
    <group position={entity.pos} scale={scale}>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.5, 0.45, 0.8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.45, 0.5]} castShadow>
        <boxGeometry args={[0.35, 0.35, 0.3]} />
        <meshStandardMaterial color={headColor} />
      </mesh>
      {/* Legs */}
      {(
        [
          [-0.15, 0, -0.25],
          [0.15, 0, -0.25],
          [-0.15, 0, 0.25],
          [0.15, 0, 0.25],
        ] as [number, number, number][]
      ).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.12, 0.25, 0.12]} />
          <meshStandardMaterial color="#5c3a1e" />
        </mesh>
      ))}
      {/* Cow spots */}
      {entity.type === 'cow' && (
        <mesh position={[0.15, 0.4, -0.1]} castShadow>
          <boxGeometry args={[0.2, 0.2, 0.15]} />
          <meshStandardMaterial color="#f5f0e0" />
        </mesh>
      )}
    </group>
  );
}

function WaterSurface() {
  return (
    <mesh
      position={[0, 0.35, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[90, 90]} />
      <meshStandardMaterial
        color="#2d7dd2"
        transparent
        opacity={0.5}
        roughness={0.05}
        metalness={0.15}
      />
    </mesh>
  );
}

export default function VoxelWorld() {
  const entities = useWorldStore((state) => state.entities);

  return (
    <Canvas
      shadows
      camera={{ position: [40, 30, 40], fov: 55 }}
      gl={{ antialias: true }}
    >
      <Sky
        sunPosition={[100, 60, 80]}
        turbidity={6}
        rayleigh={1.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      <fog attach="fog" args={['#a7d3f5', 60, 150]} />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[30, 40, 20]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={120}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <hemisphereLight args={['#87ceeb', '#4a7a3d', 0.25]} />

      <OrbitControls
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={120}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.8}
        zoomSpeed={1.5}
        panSpeed={1.2}
        target={[0, 3, 0]}
      />

      <Terrain />
      <WaterSurface />
      <SimCharacter />

      {entities.map((entity) => (
        <AnimalModel key={entity.id} entity={entity} />
      ))}
    </Canvas>
  );
}
