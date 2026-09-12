import { connectDB } from './mongodb';

export interface SimDocument {
  _id: string;
  name: string;
  stats: {
    hunger: number;
    energy: number;
    happiness: number;
  };
  position: { x: number; y: number; z: number };
  inventory: { item: string; count: number }[] | Record<string, number>;
  last_thought: string;
  updated_at?: Date;
}

export interface WorldBlockDocument {
  pos: [number, number, number];
  type: string;
  owner?: string;
  timestamp?: Date;
}

export interface MemoryDocument {
  _id?: string;
  content: string;
  embedding: number[];
  timestamp: Date;
}

const memoryStore = {
  sim: null as SimDocument | null,
  blocks: new Map<string, WorldBlockDocument>(),
  memories: [] as MemoryDocument[],
};

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function saveSim(sim: SimDocument): Promise<void> {
  memoryStore.sim = { ...sim, updated_at: new Date() };
  try {
    const db = await connectDB();
    await db.collection<SimDocument>('sims').updateOne(
      { _id: sim._id },
      { $set: { ...sim, updated_at: new Date() } },
      { upsert: true }
    );
  } catch (error) {
    console.warn('[DB Persistence] MongoDB saveSim failed, using in-memory store:', error instanceof Error ? error.message : error);
  }
}

export async function loadSim(id = 'sim_001'): Promise<SimDocument | null> {
  try {
    const db = await connectDB();
    const doc = await db.collection<SimDocument>('sims').findOne({ _id: id });
    if (doc) {
      memoryStore.sim = doc;
      return doc;
    }
  } catch (error) {
    console.warn('[DB Persistence] MongoDB loadSim failed, using in-memory store:', error instanceof Error ? error.message : error);
  }
  return memoryStore.sim;
}

export async function saveWorldBlock(block: WorldBlockDocument): Promise<void> {
  const key = `${block.pos[0]},${block.pos[1]},${block.pos[2]}`;
  memoryStore.blocks.set(key, { ...block, timestamp: new Date() });
  try {
    const db = await connectDB();
    await db.collection<WorldBlockDocument>('blocks').updateOne(
      { pos: block.pos },
      { $set: { ...block, timestamp: new Date() } },
      { upsert: true }
    );
  } catch (error) {
    console.warn('[DB Persistence] MongoDB saveWorldBlock failed, using in-memory store:', error instanceof Error ? error.message : error);
  }
}

export async function removeWorldBlock(pos: [number, number, number]): Promise<void> {
  const key = `${pos[0]},${pos[1]},${pos[2]}`;
  memoryStore.blocks.delete(key);
  try {
    const db = await connectDB();
    await db.collection('blocks').deleteOne({ pos });
  } catch (error) {
    console.warn('[DB Persistence] MongoDB removeWorldBlock failed, using in-memory store:', error instanceof Error ? error.message : error);
  }
}

export async function loadWorldBlocks(): Promise<WorldBlockDocument[]> {
  try {
    const db = await connectDB();
    const docs = await db.collection<WorldBlockDocument>('blocks').find({}).toArray();
    if (docs.length > 0) {
      docs.forEach((d) => {
        memoryStore.blocks.set(`${d.pos[0]},${d.pos[1]},${d.pos[2]}`, d);
      });
      return docs;
    }
  } catch (error) {
    console.warn('[DB Persistence] MongoDB loadWorldBlocks failed, using in-memory store:', error instanceof Error ? error.message : error);
  }
  return Array.from(memoryStore.blocks.values());
}

export async function saveMemoryEntry(content: string, embedding: number[]): Promise<void> {
  const doc: MemoryDocument = {
    content,
    embedding,
    timestamp: new Date(),
  };
  memoryStore.memories.push(doc);
  try {
    const db = await connectDB();
    await db.collection<MemoryDocument>('memories').insertOne(doc);
  } catch (error) {
    console.warn('[DB Persistence] MongoDB saveMemoryEntry failed, using in-memory store:', error instanceof Error ? error.message : error);
  }
}

export async function searchSemanticMemories(
  embedding: number[],
  limit = 5
): Promise<MemoryDocument[]> {
  try {
    const db = await connectDB();
    const results = await db
      .collection<MemoryDocument>('memories')
      .aggregate<MemoryDocument>([
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: embedding,
            numCandidates: limit * 10,
            limit: limit,
          },
        },
      ])
      .toArray();
    if (results.length > 0) return results;
  } catch {
    try {
      const db = await connectDB();
      const all = await db.collection<MemoryDocument>('memories').find({}).toArray();
      if (all.length > 0) {
        return all
          .map((m) => ({ item: m, score: cosineSimilarity(embedding, m.embedding) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map((r) => r.item);
      }
    } catch {
      // fallback to memoryStore
    }
  }

  return memoryStore.memories
    .map((m) => ({ item: m, score: cosineSimilarity(embedding, m.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item);
}
