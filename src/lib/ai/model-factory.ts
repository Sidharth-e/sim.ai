import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export class ModelFactory {
  static createModel(provider?: string): BaseChatModel {
    const selectedProvider = provider || process.env.MODEL_PROVIDER || 'ollama';

    switch (selectedProvider) {
      case 'openai':
        return new ChatOpenAI({
          modelName: "gpt-4-turbo-preview",
          apiKey: process.env.OPENAI_API_KEY,
        });
      case 'gemini':
        return new ChatGoogleGenerativeAI({
          modelName: "gemini-pro",
          apiKey: process.env.GOOGLE_API_KEY,
        });
      case 'ollama':
        return new ChatOllama({
          baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
          model: "llama3",
        });
      default:
        throw new Error(`Unsupported provider: ${selectedProvider}`);
    }
  }
}
