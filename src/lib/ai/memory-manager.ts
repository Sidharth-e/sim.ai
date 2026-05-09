import fs from 'fs';
import path from 'path';

const MEMORIES_DIR = path.join(process.cwd(), 'memories');
const EXPERIENCES_DIR = path.join(MEMORIES_DIR, 'experiences');
const KNOWLEDGE_FILE = path.join(MEMORIES_DIR, 'knowledge.md');

const MAX_EXPERIENCES = 50;
const RECENT_COUNT = 5;

function ensureDirs() {
  if (!fs.existsSync(MEMORIES_DIR)) fs.mkdirSync(MEMORIES_DIR, { recursive: true });
  if (!fs.existsSync(EXPERIENCES_DIR)) fs.mkdirSync(EXPERIENCES_DIR, { recursive: true });
  if (!fs.existsSync(KNOWLEDGE_FILE)) {
    fs.writeFileSync(KNOWLEDGE_FILE, '# Agent Knowledge\n\n_No learnings yet._\n');
  }
}

export interface ExperienceData {
  tick: number;
  hunger: number;
  energy: number;
  happiness: number;
  position: number[];
  actions: { tool: string; args: string }[];
  thought: string;
  inventory: Record<string, number>;
  previousOutcomes?: string;
}

export function saveExperience(data: ExperienceData) {
  ensureDirs();
  const timestamp = new Date().toISOString();
  const filename = `tick-${String(data.tick).padStart(5, '0')}_${timestamp.replace(/[:.]/g, '-')}.md`;

  const invStr = Object.entries(data.inventory)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ') || 'empty';

  const actionsStr = data.actions.length > 0
    ? data.actions.map(a => `- \`${a.tool}(${a.args})\``).join('\n')
    : '_None_';

  const content = `# Tick ${data.tick} | ${timestamp}

**State:** Hunger ${data.hunger}% | Energy ${data.energy}% | Happiness ${data.happiness}%
**Position:** [${data.position.join(', ')}]
**Inventory:** ${invStr}

## Thought
${data.thought}

## Actions
${actionsStr}
${data.previousOutcomes ? `\n## Previous Tick Outcomes\n${data.previousOutcomes}` : ''}
`;

  fs.writeFileSync(path.join(EXPERIENCES_DIR, filename), content);
  pruneOld();
}

export function loadRecentExperiences(count = RECENT_COUNT): string[] {
  ensureDirs();
  const files = fs.readdirSync(EXPERIENCES_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse()
    .slice(0, count);

  return files.map(f => fs.readFileSync(path.join(EXPERIENCES_DIR, f), 'utf-8'));
}

export function loadKnowledge(): string {
  ensureDirs();
  return fs.readFileSync(KNOWLEDGE_FILE, 'utf-8');
}

export function appendKnowledge(learning: string) {
  ensureDirs();
  const current = fs.readFileSync(KNOWLEDGE_FILE, 'utf-8');
  const date = new Date().toISOString().split('T')[0];
  const cleaned = current.replace(/\n_No learnings yet\._\n?/, '\n');
  const updated = cleaned.trimEnd() + `\n- [${date}] ${learning}\n`;
  fs.writeFileSync(KNOWLEDGE_FILE, updated);
}

function pruneOld() {
  const files = fs.readdirSync(EXPERIENCES_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  while (files.length > MAX_EXPERIENCES) {
    const oldest = files.shift()!;
    fs.unlinkSync(path.join(EXPERIENCES_DIR, oldest));
  }
}

export function buildMemoryContext(): string {
  const knowledge = loadKnowledge();
  const experiences = loadRecentExperiences();

  let ctx = '### Knowledge Base\n' + knowledge + '\n';

  if (experiences.length > 0) {
    ctx += `### Recent Experiences (last ${experiences.length} ticks)\n`;
    ctx += experiences.join('\n---\n');
  } else {
    ctx += '### Recent Experiences\n_No experiences yet. Start exploring!_\n';
  }

  return ctx;
}
