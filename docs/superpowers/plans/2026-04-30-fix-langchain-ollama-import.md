# Fix LangChain Ollama Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the `ChatOllama` import error by migrating to the `@langchain/ollama` package and ensuring all LangChain core imports are correct.

**Architecture:** Replace the deprecated `@langchain/community` import with the dedicated `@langchain/ollama` package. Update `package.json` to include the new dependency and ensure `BaseChatModel` uses the correct `@langchain/core` path.

**Tech Stack:** LangChain.js, TypeScript, pnpm, Jest.

---

### Task 1: Update Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install `@langchain/ollama`**

Run: `pnpm add @langchain/ollama`
Expected: Package added to `dependencies` in `package.json`.

- [ ] **Step 2: Commit dependency change**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add @langchain/ollama dependency"
```

### Task 2: Update Model Factory Implementation

**Files:**
- Modify: `src/lib/ai/model-factory.ts`

- [ ] **Step 1: Update imports in `model-factory.ts`**

Update `ChatOllama` and `BaseChatModel` imports.

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

// ... rest of file
```

- [ ] **Step 2: Commit implementation fix**

```bash
git add src/lib/ai/model-factory.ts
git commit -m "fix(ai): update ChatOllama import path"
```

### Task 3: Verification

**Files:**
- Test: `src/lib/ai/__tests__/model-factory.test.ts`

- [ ] **Step 1: Run the model factory tests**

Run: `pnpm test src/lib/ai/__tests__/model-factory.test.ts`
Expected: PASS

- [ ] **Step 2: Final commit if any adjustments were needed**

```bash
# (Optional)
git add .
git commit -m "test: verify model factory fix"
```
