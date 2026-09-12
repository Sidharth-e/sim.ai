import { NextResponse } from 'next/server';
import { loadSim, saveSim, SimDocument } from '@/lib/db/persistence';

export async function GET() {
  try {
    const sim = await loadSim('sim_001');
    if (!sim) {
      const defaultSim: SimDocument = {
        _id: 'sim_001',
        name: 'Main Sim',
        stats: {
          hunger: 100,
          energy: 100,
          happiness: 100,
        },
        position: { x: 0, y: 1, z: 0 },
        inventory: [],
        last_thought: 'I should explore this voxel world.',
      };
      await saveSim(defaultSim);
      return NextResponse.json(defaultSim);
    }
    return NextResponse.json(sim);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch sim state' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const simDoc: SimDocument = {
      _id: body._id || 'sim_001',
      name: body.name || 'Main Sim',
      stats: {
        hunger: body.stats?.hunger ?? 100,
        energy: body.stats?.energy ?? 100,
        happiness: body.stats?.happiness ?? 100,
      },
      position: {
        x: body.position?.x ?? 0,
        y: body.position?.y ?? 1,
        z: body.position?.z ?? 0,
      },
      inventory: body.inventory ?? [],
      last_thought: body.last_thought || '',
    };
    await saveSim(simDoc);
    return NextResponse.json({ success: true, sim: simDoc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save sim state' },
      { status: 500 }
    );
  }
}
