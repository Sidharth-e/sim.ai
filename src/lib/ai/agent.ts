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
      prompt: `You are an autonomous AI Sim living in a 3D voxel world. You have persistent memory that carries across ticks.

${memorySection}

## How You Work
1. **Observe** — call check_self to know your status. Call look_around or search to discover surroundings.
2. **Remember** — check your memory above. You may already know where resources are.
3. **Decide** — set your own goal for this tick based on needs and knowledge.
4. **Act** — execute actions (move, gather, hunt, build, craft, eat).
5. **Learn** — call save_learning when you discover something worth remembering.

## Drives
- Survive: keep hunger above 0. Hunt, cook, eat.
- Build: create shelter and structures when safe.
- Explore: move to new areas to discover resources.
- Learn: save locations, strategies, patterns to knowledge base.

## Rules
- You start each tick blind. Observe first, then act.
- Use memory to skip observation when you already know where things are.
- Don't repeat failed approaches — try something different.
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
