import { ModelFactory } from '../model-factory';

describe('ModelFactory', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return an Ollama model when provider is ollama', () => {
    const model = ModelFactory.createModel('ollama');
    expect(model._modelType()).toBe('base_chat_model');
  });

  it('should return an Azure model when provider is azure', () => {
    process.env.AZURE_OPENAI_API_KEY = 'test-key';
    process.env.AZURE_OPENAI_INSTANCE_NAME = 'test-instance';
    process.env.AZURE_OPENAI_DEPLOYMENT_NAME = 'test-deployment';
    process.env.AZURE_OPENAI_API_VERSION = '2023-05-15';
    
    const model = ModelFactory.createModel('azure');
    expect(model.lc_namespace).toContain('azure_openai');
  });

  it('should return an Anthropic model when provider is anthropic', () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';
    
    const model = ModelFactory.createModel('anthropic');
    expect(model.lc_namespace).toContain('anthropic');
  });

  it('should return an Ollama model for ollama_cloud with configuration', () => {
    process.env.OLLAMA_BASE_URL = 'https://custom-ollama.cloud';
    process.env.OLLAMA_API_KEY = 'test-cloud-key';
    process.env.OLLAMA_MODEL = 'deepseek-r1:latest';

    const model = ModelFactory.createModel('ollama_cloud');
    expect(model._modelType()).toBe('base_chat_model');
    expect((model as unknown as { baseUrl: string }).baseUrl).toBe('https://custom-ollama.cloud');
    expect((model as unknown as { model: string }).model).toBe('deepseek-r1:latest');
  });

  it('should return an Ollama model with authorization header when OLLAMA_API_KEY is provided', () => {
    process.env.OLLAMA_API_KEY = 'test-ollama-key';

    const model = ModelFactory.createModel('ollama');
    expect(model._modelType()).toBe('base_chat_model');
  });
});
