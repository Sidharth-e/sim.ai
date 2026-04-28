# Update LangChain Agent Implementation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix failing LangChain imports by migrating from deprecated `AgentExecutor` and `createReactAgent` (from `langchain/agents`) to modern `@langchain/langgraph/prebuilt`.

**Architecture:** Use `createReactAgent` from `@langchain/langgraph/prebuilt` which returns a compiled graph that implements the Runnable interface.

**Tech Stack:** `@langchain/langgraph`, LangChain v1 core.

---

### Task 1: Update Imports and Implementation

**Files:**
- Modify: `src/lib/ai/agent.ts`

- [ ] **Step 1: Update imports**

```typescript
import { ModelFactory } from "./model-factory";
import { createTools } from "./tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
// PromptTemplate might still be needed if we want to pass a custom prompt,
// but LangGraph's createReactAgent handles it differently or has defaults.
```

- [ ] **Step 2: Update `runAgentCycle` implementation**

```typescript
export async function runAgentCycle(input: string) {
  try {
    const model = ModelFactory.createModel();
    const tools = createTools();

    // In LangGraph, createReactAgent creates the executor/agent combo
    const agent = createReactAgent({
      llm: model,
      tools,
      // Default prompt is often sufficient, but custom ones can be passed via state modifier or messages
    });

    // Invoke the agent. LangGraph agents return the full state, 
    // the last message is usually the output.
    const result = await agent.invoke({
      messages: [{ role: "user", content: input }],
    });

    const lastMessage = result.messages[result.messages.length - 1];
    return lastMessage.content;
  } catch (error) {
    console.error("Error in runAgentCycle:", error);
    return `Agent error: ${error instanceof Error ? error.message : String(error)}`;
  }
}
```

- [ ] **Step 3: Verify with Type Check**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit the changes**

```bash
git add src/lib/ai/agent.ts package.json pnpm-lock.yaml
git commit -m "fix(ai): migrate agent to @langchain/langgraph/prebuilt"
```
