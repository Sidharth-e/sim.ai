import { connectDB } from '../db/mongodb';

export async function saveMemory(content: string, embedding: number[]) {
  const db = await connectDB();
  await db.collection('memories').insertOne({
    content,
    embedding,
    timestamp: new Date(),
  });
}

/**
 * Basic semantic search using MongoDB Vector Search
 * (Assumes a vector index is created on the 'embedding' field)
 */
export async function searchMemories(embedding: number[], limit = 5) {
  const db = await connectDB();
  const results = await db.collection('memories').aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: embedding,
        numCandidates: limit * 10,
        limit: limit,
      }
    }
  ]).toArray();
  
  return results;
}
