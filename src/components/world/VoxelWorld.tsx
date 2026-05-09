'use client';
import { Canvas } from '@react-three/fiber';
import { Sky, OrbitControls } from '@react-three/drei';
import { useWorldStore } from '@/store/useWorldStore';
import { useSimStore } from '@/store/useSimStore';
import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BLOCK_COLORS: Record<string, string> = {
  grass: '#5d9b37',
  dirt: '#8b6914',
  stone: '#808080',
  sand: '#d4bc60',
  wood: '#6b4226',
  leaves: '#2d8c1e',
  snow: '#f0f0ff',
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

  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const smoothPos = useRef(new THREE.Vector3(...position));
  const prevSmoothPos = useRef(new THREE.Vector3(...position));
  const movePhase = useRef(0);
  const velocity = useRef(0);
  const facingAngle = useRef(0);

  useFrame((_, delta) => {
    const target = new THREE.Vector3(...position);

    // Slower lerp so character visibly walks to destination
    smoothPos.current.lerp(target, Math.min(1, delta * 2));

    if (groupRef.current) {
      groupRef.current.position.copy(smoothPos.current);
    }

    // Measure how far smooth position moved this frame
    const dx = smoothPos.current.x - prevSmoothPos.current.x;
    const dz = smoothPos.current.z - prevSmoothPos.current.z;
    const frameDist = Math.sqrt(dx * dx + dz * dz);

    // Remaining distance to target drives animation intensity
    const distToTarget = smoothPos.current.distanceTo(target);
    const isMoving = distToTarget > 0.05;
    const isRunning = distToTarget > 5;
    const animSpeed = isRunning ? 12 : 6;
    const swingAmp = isRunning ? 1.1 : 0.6;

    if (isMoving) {
      movePhase.current += delta * animSpeed;
      if (frameDist > 0.001) {
        const targetAngle = Math.atan2(dx, dz);
        let angleDiff = targetAngle - facingAngle.current;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        facingAngle.current += angleDiff * Math.min(1, delta * 8);
      }
    } else {
      movePhase.current *= 0.92;
    }

    const phase = movePhase.current;
    const t = Date.now() * 0.001;

    // Idle breathing when not moving
    const breathe = Math.sin(t * 1.5) * 0.015;

    const legSwing = isMoving ? Math.sin(phase) * swingAmp : 0;
    const armSwing = isMoving ? Math.sin(phase) * swingAmp * 0.8 : Math.sin(t * 0.6) * 0.06;
    const bodyBob = isMoving
      ? Math.abs(Math.sin(phase * 2)) * 0.06
      : breathe;
    const bodySway = isMoving ? Math.sin(phase) * 0.03 : 0;

    if (leftLegRef.current) leftLegRef.current.rotation.x = legSwing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -legSwing;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -armSwing;
    if (rightArmRef.current) rightArmRef.current.rotation.x = armSwing;

    if (bodyRef.current) {
      bodyRef.current.position.y = 1.125 + bodyBob;
      bodyRef.current.rotation.z = bodySway;
      bodyRef.current.rotation.y = facingAngle.current;
    }

    if (headRef.current) {
      if (isMoving) {
        headRef.current.rotation.x = Math.sin(phase * 2) * 0.05;
        headRef.current.rotation.y = 0;
      } else if (isThinking) {
        headRef.current.rotation.y = Math.sin(t * 0.8) * 0.3;
        headRef.current.rotation.x = Math.sin(t * 0.5) * 0.1 - 0.1;
      } else {
        headRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
        headRef.current.rotation.x = Math.sin(t * 0.2) * 0.05;
      }
    }

    prevSmoothPos.current.copy(smoothPos.current);
  });

  return (
    <group ref={groupRef}>
      {/* Beacon pillar */}
      <mesh position={[0, 6, 0]}>
        <boxGeometry args={[0.15, 8, 0.15]} />
        <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.4} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 10.5, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.6} />
      </mesh>

      <group ref={bodyRef} position={[0, 1.125, 0]} scale={1.4}>
        {/* Head — pivot at neck */}
        <group ref={headRef} position={[0, 0.625, 0]}>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#d4a574" />
          </mesh>
          <mesh position={[0, 0.27, 0]} castShadow>
            <boxGeometry args={[0.52, 0.06, 0.52]} />
            <meshStandardMaterial color="#4a2c0a" />
          </mesh>
        </group>

        {/* Torso */}
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.75, 0.3]} />
          <meshStandardMaterial color="#0ea5e9" />
        </mesh>

        {/* Left Arm — pivot at shoulder */}
        <group ref={leftArmRef} position={[-0.4, 0.25, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <boxGeometry args={[0.25, 0.75, 0.25]} />
            <meshStandardMaterial color="#0ea5e9" />
          </mesh>
        </group>

        {/* Right Arm — pivot at shoulder */}
        <group ref={rightArmRef} position={[0.4, 0.25, 0]}>
          <mesh position={[0, -0.25, 0]} castShadow>
            <boxGeometry args={[0.25, 0.75, 0.25]} />
            <meshStandardMaterial color="#0ea5e9" />
          </mesh>
        </group>

        {/* Left Leg — pivot at hip */}
        <group ref={leftLegRef} position={[-0.13, -0.375, 0]}>
          <mesh position={[0, -0.375, 0]} castShadow>
            <boxGeometry args={[0.25, 0.75, 0.25]} />
            <meshStandardMaterial color="#1e3a5f" />
          </mesh>
        </group>

        {/* Right Leg — pivot at hip */}
        <group ref={rightLegRef} position={[0.13, -0.375, 0]}>
          <mesh position={[0, -0.375, 0]} castShadow>
            <boxGeometry args={[0.25, 0.75, 0.25]} />
            <meshStandardMaterial color="#1e3a5f" />
          </mesh>
        </group>
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
      <planeGeometry args={[500, 500]} />
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
      camera={{ position: [80, 60, 80], fov: 55 }}
      gl={{ antialias: true }}
    >
      <Sky
        sunPosition={[200, 100, 150]}
        turbidity={6}
        rayleigh={1.5}
        mieCoefficient={0.005}
        mieDirectionalG={0.8}
      />

      <fog attach="fog" args={['#a7d3f5', 200, 500]} />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[80, 100, 60]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={400}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
      />
      <hemisphereLight args={['#87ceeb', '#4a7a3d', 0.25]} />

      <OrbitControls
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={500}
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
