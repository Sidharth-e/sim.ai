'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Grid, Sphere } from '@react-three/drei';
import { useWorldStore } from '@/store/useWorldStore';
import { useSimStore } from '@/store/useSimStore';

const getBlockColor = (type: string) => {
  switch (type) {
    case 'grass': return 'green';
    case 'tree': return 'saddlebrown';
    case 'wood': return 'peru';
    case 'campfire': return 'orange';
    default: return 'gray';
  }
};

export default function VoxelWorld() {
  const blocks = useWorldStore((state) => state.blocks);
  const entities = useWorldStore((state) => state.entities);
  const simPosition = useSimStore((state) => state.position);

  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />
      <Grid infiniteGrid fadeDistance={50} cellColor="#222" sectionColor="#444" />
      
      {/* The Sim */}
      <Box position={simPosition}>
        <meshStandardMaterial color="red" />
      </Box>

      {/* Entities (Animals) */}
      {entities.map((entity) => (
        <Sphere key={entity.id} position={entity.pos} args={[0.4, 16, 16]}>
          <meshStandardMaterial color="pink" />
        </Sphere>
      ))}

      {/* Blocks */}
      {blocks.map((block, i) => (
        <Box key={i} position={block.pos}>
          <meshStandardMaterial color={getBlockColor(block.type)} />
        </Box>
      ))}
    </Canvas>
  );
}
