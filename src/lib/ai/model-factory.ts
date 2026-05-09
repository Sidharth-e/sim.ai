import { ChatOpenAI, AzureChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export class ModelFactory {
  static createModel(provider?: string): BaseChatModel {
    const selectedProvider = provider || process.env.MODEL_PROVIDER || 'ollama';

    switch (selectedProvider) {
      case 'openai':
        return new ChatOpenAI({
          model: "gpt-4-turbo-preview",
          apiKey: process.env.OPENAI_API_KEY,
        });
      case 'azure':
        return new AzureChatOpenAI({
          azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
          azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
          azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
          azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
        });
      case 'anthropic':
        return new ChatAnthropic({
          anthropicApiKey: process.env.ANTHROPIC_API_KEY,
          model: "claude-3-sonnet-20240229",
        });
      case 'gemini':
        return new ChatGoogleGenerativeAI({
          model: "gemini-pro",
          apiKey: process.env.GOOGLE_API_KEY,
        });
      case 'ollama':
        return new ChatOllama({
          baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
          model: process.env.OLLAMA_MODEL || "qwen2.5-coder:14b",
        });
      default:
        throw new Error(`Unsupported provider: ${selectedProvider}`);
    }
  }
}
