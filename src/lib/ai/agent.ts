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
): Promise<AgentResult> {
  try {
    const model = ModelFactory.createModel();
    const tools = createTools(worldState);

    const agent = createReactAgent({
      llm: model,
      tools,
      prompt: `You are an AI Sim in a 3D voxel world.
Your goal is to survive and thrive.
When you decide to take an action, use the appropriate tool.
Do not repeat tool calls if they have already been executed.
Current world state is provided in the tools or as context.`,
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
