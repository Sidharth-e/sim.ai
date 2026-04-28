import { ModelFactory } from "./model-factory";
import { createTools } from "./tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

/**
 * Runs a single cycle of the LangChain agent.
 * This takes a user input, invokes the agent, and returns the agent's response.
 */
export async function runAgentCycle(input: string) {
  try {
    const model = ModelFactory.createModel();
    const tools = createTools();

    // In LangGraph, createReactAgent creates a compiled graph that acts as the agent executor
    const agent = createReactAgent({
      llm: model,
      tools,
    });

    // Invoke the agent with a message list
    const result = await agent.invoke({
      messages: [{ role: "user", content: input }],
    });

    // The result contains the full message history; the last message is the agent's response
    const lastMessage = result.messages[result.messages.length - 1];
    return lastMessage.content;
  } catch (error) {
    console.error("Error in runAgentCycle:", error);
    return `Agent error: ${error instanceof Error ? error.message : String(error)}`;
  }
}
