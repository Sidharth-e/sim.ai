import { ModelFactory } from '../model-factory';

describe('ModelFactory', () => {
  it('should return an Ollama model when provider is ollama', () => {
    const model = ModelFactory.createModel('ollama');
    expect(model._modelType()).toBe('base_chat_model');
  });
});
