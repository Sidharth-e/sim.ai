import { NextResponse } from "next/server";
import { runAgentCycle } from "@/lib/ai/agent";
import { buildMemoryContext, saveExperience, appendKnowledge } from "@/lib/ai/memory-manager";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, worldState, tickNumber, previousOutcomes } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    let memoryContext = buildMemoryContext();
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

    for (const action of result.actions) {
      if (action.tool === 'save_learning') {
        const learning = typeof action.args === 'string'
          ? action.args.replace(/^['"]|['"]$/g, '')
          : JSON.stringify(action.args);
        appendKnowledge(learning);
        console.log(`[Agent API] Learning saved: ${learning}`);
      }
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

/**
 * Optional GET handler for quick testing.
 */
export async function GET() {
  return NextResponse.json({ 
    message: "Agent tick endpoint is active. Use POST to trigger the agent." 
  });
}
