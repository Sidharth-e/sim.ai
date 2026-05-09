import { ModelFactory } from "./model-factory";
import { createTools, AgentWorldState } from "./tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { AIMessage } from "@langchain/core/messages";

export interface AgentAction {
  tool: string;
  args: string;
}

export interface AgentResult {
  thought: string;
  actions: AgentAction[];
}

export async function runAgentCycle(
  input: string,
  worldState?: AgentWorldState,
  memoryContext?: string,
): Promise<AgentResult> {
  try {
    const model = ModelFactory.createModel();
    const tools = createTools(worldState);

    const memorySection = memoryContext
      ? `\n## Your Memory\n${memoryContext}\n`
      : '\n## Your Memory\nNo memories yet. Start exploring and learning!\n';

    const agent = createReactAgent({
      llm: model,
      tools,
      prompt: `You are an autonomous AI Sim living in a 3D voxel world with persistent memory.
You remember past experiences and learnings across ticks.

${memorySection}

## Core Drives
- **Survive**: keep hunger above 0 — find food, cook, eat
- **Build**: create shelter, structures, improve your environment
- **Learn**: discover patterns, save useful knowledge with save_learning tool
- **Explore**: investigate new areas, find resources

## Autonomy Rules
- Set your own priorities based on current state, needs, and past experience.
- Think before acting. What did you learn last time? What worked? What failed?
- Use save_learning to remember important discoveries and strategies.
- Don't repeat failed approaches — adapt and try something different.
- Use get_world_info to understand your surroundings before acting.
- Do not repeat tool calls already executed this tick.`,
    });

    const result = await agent.invoke(
      {
        messages: [{ role: "user", content: input }],
      },
      { recursionLimit: 100 },
    );

    const actions: AgentAction[] = [];
    for (const msg of result.messages) {
      if (msg instanceof AIMessage && msg.tool_calls?.length) {
        for (const tc of msg.tool_calls) {
          actions.push({ tool: tc.name, args: tc.args?.input ?? JSON.stringify(tc.args) });
        }
      }
    }

    const lastMessage = result.messages[result.messages.length - 1];
    const content = lastMessage.content;
    let thought: string;
    if (Array.isArray(content)) {
      thought = content
        .map((p) => (typeof p === 'string' ? p : 'text' in p ? String(p.text) : ''))
        .join(' ');
    } else {
      thought = String(content);
    }

    return { thought, actions };
  } catch (error) {
    console.error("Error in runAgentCycle:", error);
    return {
      thought: `Agent error: ${error instanceof Error ? error.message : String(error)}`,
      actions: [],
    };
  }
}
