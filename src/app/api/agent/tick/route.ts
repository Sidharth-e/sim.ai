import { NextResponse } from "next/server";
import { runAgentCycle } from "@/lib/ai/agent";
import { buildMemoryContext, saveExperience, appendKnowledge } from "@/lib/ai/memory-manager";
import { getSemanticContext, saveMemory } from "@/lib/ai/memory";
import { saveSim, saveWorldBlock, removeWorldBlock } from "@/lib/db/persistence";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, worldState, tickNumber, previousOutcomes } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    let memoryContext = buildMemoryContext();
    const semanticMemories = await getSemanticContext(prompt);
    if (semanticMemories) {
      memoryContext += `\n### Retrieved Long-Term Memories (Vector Search)\n${semanticMemories}\n`;
    }

    if (previousOutcomes) {
      memoryContext += `\n### Last Tick Results\n${previousOutcomes}\n`;
    }

    console.log(`[Agent API] Tick ${tickNumber ?? '?'} — triggering agent`);
    const result = await runAgentCycle(prompt, worldState, memoryContext);

    saveExperience({
      tick: tickNumber ?? 0,
      hunger: worldState?.stats?.hunger ?? 100,
      energy: worldState?.stats?.energy ?? 100,
      happiness: worldState?.stats?.happiness ?? 100,
      position: worldState?.position ?? [0, 0, 0],
      actions: result.actions,
      thought: result.thought,
      inventory: worldState?.inventory ?? {},
      previousOutcomes,
    });

    await saveSim({
      _id: "sim_001",
      name: "Main Sim",
      stats: {
        hunger: worldState?.stats?.hunger ?? 100,
        energy: worldState?.stats?.energy ?? 100,
        happiness: worldState?.stats?.happiness ?? 100,
      },
      position: {
        x: worldState?.position?.[0] ?? 0,
        y: worldState?.position?.[1] ?? 0,
        z: worldState?.position?.[2] ?? 0,
      },
      inventory: worldState?.inventory ?? {},
      last_thought: result.thought,
    });

    for (const action of result.actions) {
      if (action.tool === 'save_learning') {
        const learning = typeof action.args === 'string'
          ? action.args.replace(/^['"]|['"]$/g, '')
          : JSON.stringify(action.args);
        appendKnowledge(learning);
        await saveMemory(learning);
        console.log(`[Agent API] Learning saved: ${learning}`);
      } else if (action.tool === 'place_block') {
        const parts = action.args.replace(/[\[\]]/g, '').split(',').map((s) => s.trim().replace(/['"]/g, ''));
        const x = Number(parts[0]);
        const y = Number(parts[1]);
        const z = Number(parts[2]);
        const type = parts[3] || 'wood';
        if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
          await saveWorldBlock({
            pos: [x, y, z],
            type,
            owner: 'sim_001',
          });
        }
      } else if (action.tool === 'remove_block') {
        const parts = action.args.replace(/[\[\]]/g, '').split(',').map((s) => Number(s.trim()));
        if (parts.length >= 3 && parts.every((n) => !isNaN(n))) {
          await removeWorldBlock([parts[0], parts[1], parts[2]]);
        }
      }
    }

    if (result.thought && !result.thought.startsWith('Agent error')) {
      await saveMemory(`Sim thought at tick ${tickNumber ?? 0}: ${result.thought}`);
    }

    return NextResponse.json({
      success: true,
      thought: result.thought,
      actions: result.actions,
    });
  } catch (error) {
    console.error("[Agent API] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error"
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Agent tick endpoint is active. Use POST to trigger the agent." 
  });
}
