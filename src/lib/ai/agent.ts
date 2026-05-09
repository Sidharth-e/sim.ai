import { ModelFactory } from "./model-factory";
import { createTools, AgentWorldState } from "./tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

/**
 * Runs a single cycle of the LangChain agent.
 * This takes a user input, invokes the agent, and returns the agent's response.
 */
export async function runAgentCycle(
  input: string,
  worldState?: AgentWorldState,
) {
  try {
    const model = ModelFactory.createModel();
    const tools = createTools(worldState);

    // In LangGraph, createReactAgent creates a compiled graph that acts as the agent executor
    const agent = createReactAgent({
      llm: model,
      tools,
      prompt: `You are an AI Sim in a 3D voxel world. 
Your goal is to survive and thrive. 
When you decide to take an action, use the appropriate tool. 
Once you have called a tool, you should summarize your action in your final response using the format ACTION: tool_name(args). 
Example: if you call cut_tree(10, 0, 5), your final response should be "I am cutting the tree. ACTION: cut_tree(10, 0, 5)".
Do not repeat tool calls if they have already been executed. 
Current world state is provided in the tools or as context.`,
    });

    // Invoke the agent with a message list
    const result = await agent.invoke(
      {
        messages: [{ role: "user", content: input }],
      },
      { recursionLimit: 100 },
    );

    // The result contains the full message history; the last message is the agent's response
    const lastMessage = result.messages[result.messages.length - 1];
    return lastMessage.content;
  } catch (error) {
    console.error("Error in runAgentCycle:", error);
    return `Agent error: ${error instanceof Error ? error.message : String(error)}`;
  }
}
