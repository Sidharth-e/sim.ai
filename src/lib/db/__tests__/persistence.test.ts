import { saveSim, loadSim, saveWorldBlock, removeWorldBlock, loadWorldBlocks, saveMemoryEntry, searchSemanticMemories } from '../persistence';

describe('persistence', () => {
  it('should save and load Sim state matching spec schema', async () => {
    const simData = {
      _id: 'sim_001',
      name: 'Main Sim',
      stats: {
        hunger: 85,
        energy: 90,
        happiness: 95,
      },
      position: { x: 5, y: 1, z: 10 },
      inventory: [{ item: 'wood', count: 4 }],
      last_thought: 'I should build a house.',
    };

    await saveSim(simData);
    const loaded = await loadSim('sim_001');
    expect(loaded).toBeDefined();
    expect(loaded?._id).toBe('sim_001');
    expect(loaded?.stats.hunger).toBe(85);
    expect(loaded?.last_thought).toBe('I should build a house.');
  });

  it('should save and load world blocks matching spec schema', async () => {
    await saveWorldBlock({
      pos: [10, 0, 5],
      type: 'wood_plank',
      owner: 'sim_001',
    });

    const blocks = await loadWorldBlocks();
    const found = blocks.find(
      (b) => b.pos[0] === 10 && b.pos[1] === 0 && b.pos[2] === 5
    );
    expect(found).toBeDefined();
    expect(found?.type).toBe('wood_plank');
    expect(found?.owner).toBe('sim_001');

    await removeWorldBlock([10, 0, 5]);
    const afterRemoval = await loadWorldBlocks();
    const removed = afterRemoval.find(
      (b) => b.pos[0] === 10 && b.pos[1] === 0 && b.pos[2] === 5
    );
    expect(removed).toBeUndefined();
  });

  it('should save and search memory entries', async () => {
    const embedding = new Array(64).fill(0.1);
    await saveMemoryEntry('Built a small wooden hut near the tree.', embedding);

    const memories = await searchSemanticMemories(embedding, 1);
    expect(memories.length).toBeGreaterThan(0);
    expect(memories[0].content).toContain('wooden hut');
  });
});
