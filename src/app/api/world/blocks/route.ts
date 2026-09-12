import { NextResponse } from 'next/server';
import { loadWorldBlocks, saveWorldBlock, removeWorldBlock, WorldBlockDocument } from '@/lib/db/persistence';

export async function GET() {
  try {
    const blocks = await loadWorldBlocks();
    return NextResponse.json({ success: true, blocks });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch world blocks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'remove' && body.pos) {
      await removeWorldBlock(body.pos);
      return NextResponse.json({ success: true });
    }

    const blockDoc: WorldBlockDocument = {
      pos: body.pos,
      type: body.type,
      owner: body.owner || 'sim_001',
    };
    await saveWorldBlock(blockDoc);
    return NextResponse.json({ success: true, block: blockDoc });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update block' },
      { status: 500 }
    );
  }
}
