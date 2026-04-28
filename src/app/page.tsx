import VoxelWorld from '@/components/world/VoxelWorld';

export default function Home() {
  return (
    <main className="h-screen w-screen bg-black relative">
      <VoxelWorld />
      <div className="absolute top-4 left-4 text-white p-4 bg-black/50 rounded pointer-events-none">
        AI Sim Sandbox
      </div>
    </main>
  );
}
