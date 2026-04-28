'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Grid } from '@react-three/drei';
import { useWorldStore } from '@/store/useWorldStore';

export default function VoxelWorld() {
  const blocks = useWorldStore((state) => state.blocks);

  return (
    <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />
      <Grid infiniteGrid fadeDistance={50} cellColor="#222" sectionColor="#444" />
      {blocks.map((block, i) => (
        <Box key={i} position={block.pos}>
          <meshStandardMaterial color={block.type === 'grass' ? 'green' : 'brown'} />
        </Box>
      ))}
    </Canvas>
  );
}
