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
});
