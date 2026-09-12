import { generateEmbedding, EMBEDDING_DIMENSION, saveMemory, searchMemories, getSemanticContext } from '../memory';

describe('semantic memory', () => {
  it('should generate normalized embedding vector of expected dimension', () => {
    const embedding = generateEmbedding('Sim is cutting trees and gathering wood');
    expect(embedding).toHaveLength(EMBEDDING_DIMENSION);

    const norm = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    expect(norm).toBeCloseTo(1, 4);
  });

  it('should generate higher similarity for related sentences than unrelated ones', () => {
    const v1 = generateEmbedding('gather wood from trees');
    const v2 = generateEmbedding('chopping trees to get wood');
    const v3 = generateEmbedding('swimming in the deep cold ocean');

    const dot12 = v1.reduce((sum, val, i) => sum + val * v2[i], 0);
    const dot13 = v1.reduce((sum, val, i) => sum + val * v3[i], 0);

    expect(dot12).toBeGreaterThan(dot13);
  });

  it('should save and retrieve semantic memories', async () => {
    await saveMemory('Found coal ore in the mountain biome');
    await saveMemory('Built a wooden cabin near the river');

    const results = await searchMemories('mountain ore mining', 2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].content).toContain('mountain');

    const context = await getSemanticContext('mountain coal');
    expect(context).toContain('coal');
  });
});
