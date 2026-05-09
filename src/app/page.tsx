import VoxelWorld from '@/components/world/VoxelWorld';
import SimLoop from '@/components/sim/SimLoop';
import SimOverlay from '@/components/ui/SimOverlay';

export default function Home() {
  return (
    <main className="h-screen w-screen bg-black relative">
      <SimLoop />
      <VoxelWorld />
      <SimOverlay />
      <div className="absolute top-4 left-4 pointer-events-none z-50">
        <h1
          className="text-xl font-black tracking-widest text-white/90 uppercase"
          style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8)' }}
        >
          SIM.AI
        </h1>
      </div>
    </main>
  );
}
