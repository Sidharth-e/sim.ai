import { NextResponse } from "next/server";
import { runAgentCycle } from "@/lib/ai/agent";

/**
 * API route to trigger the AI agent.
 * 
 * POST /api/agent/tick
 * Body: { "prompt": "build a small house" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, worldState } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    console.log(`[Agent API] Triggering agent with prompt: "${prompt}"`);
    const output = await runAgentCycle(prompt, worldState);
    
    return NextResponse.json({ 
      success: true,
      output 
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
