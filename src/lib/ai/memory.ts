import { saveMemoryEntry, searchSemanticMemories, MemoryDocument } from '../db/persistence';

export const EMBEDDING_DIMENSION = 64;

export function generateEmbedding(text: string): number[] {
  const vector = new Array(EMBEDDING_DIMENSION).fill(0);
  const normalized = text.toLowerCase().trim();
  const tokens = normalized.split(/\W+/).filter(Boolean);

  if (tokens.length === 0) {
    return vector;
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let hash = 0;
    for (let j = 0; j < token.length; j++) {
      hash = (hash << 5) - hash + token.charCodeAt(j);
      hash |= 0;
    }
    const index = Math.abs(hash) % EMBEDDING_DIMENSION;
    vector[index] += 1;

    if (i < tokens.length - 1) {
      const bigram = `${token}_${tokens[i + 1]}`;
      let bHash = 0;
      for (let j = 0; j < bigram.length; j++) {
        bHash = (bHash << 5) - bHash + bigram.charCodeAt(j);
        bHash |= 0;
      }
      const bIndex = Math.abs(bHash) % EMBEDDING_DIMENSION;
      vector[bIndex] += 0.5;
    }
  }

  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}

export async function saveMemory(content: string, customEmbedding?: number[]): Promise<void> {
  const embedding = customEmbedding || generateEmbedding(content);
  await saveMemoryEntry(content, embedding);
}

export async function searchMemories(
  query: string | number[],
  limit = 5
): Promise<MemoryDocument[]> {
  const queryVector = typeof query === 'string' ? generateEmbedding(query) : query;
  return searchSemanticMemories(queryVector, limit);
}

export async function getSemanticContext(query: string, limit = 4): Promise<string> {
  const results = await searchMemories(query, limit);
  if (results.length === 0) return '';
  return results.map((r) => `- [${new Date(r.timestamp).toLocaleDateString()}] ${r.content}`).join('\n');
}
