import { evaluateMeaningfulAchievements, getCurriculumMastery } from "./progression.js";
import { loadState, saveState, unlockAchievements } from "./state.js";

export const MEANINGFUL_ACHIEVEMENT_DEFINITIONS = [
  ["foundations-complete", "AI Foundations", "Complete the AI Foundations path.", "mastery", 1],
  ["llm-fundamentals-complete", "Model Thinker", "Complete the LLM Fundamentals path, including its final challenge.", "mastery", 2],
  ["prompt-architect", "Prompt Architect", "Complete the Prompt Engineering path.", "mastery", 3],
  ["application-architect", "Application Architect", "Complete the LLM Applications path.", "mastery", 4],
  ["local-ai-builder", "Local AI Builder", "Complete the Open Source & Local AI path.", "mastery", 5],
  ["vector-search-architect", "Vector Search Architect", "Complete the Embeddings & Vector Search path.", "mastery", 6],
  ["rag-builder", "RAG Builder", "Complete the Retrieval-Augmented Generation path.", "mastery", 7],
  ["agent-engineer", "Agent Engineer", "Complete the AI Agents & Tools path.", "mastery", 8],
  ["memory-planning-architect", "Memory & Planning Architect", "Complete the Agent Memory & Planning path.", "mastery", 9],
  ["mcp-architect", "MCP Architect", "Complete the MCP path.", "mastery", 10],
  ["orchestration-architect", "Orchestration Architect", "Complete the Agent Orchestration path.", "mastery", 11],
  ["advanced-agentic-architect", "Advanced Agentic Architect", "Complete the Advanced Agentic AI path.", "mastery", 12],
  ["ai-explorer", "AI Explorer", "Complete at least 5 curriculum paths.", "exploration", 5],
  ["breadth-builder", "Breadth Builder", "Complete at least 8 curriculum paths.", "exploration", 8],
  ["perfect-challenge", "Perfect Challenge", "Earn a 100% score on a recorded challenge.", "excellence", "perfect"],
  ["challenge-specialist", "Challenge Specialist", "Earn 100% on three recorded challenges.", "excellence", "three-perfect"],
  ["full-journey", "Full Journey", "Complete every curriculum path in the learning journey.", "mastery", "all"],
];

export function getMeaningfulAchievements(state = loadState(), mastery = getCurriculumMastery(state)) {
  return MEANINGFUL_ACHIEVEMENT_DEFINITIONS.map(([id, title, description, category]) => ({
    id,
    title,
    description,
    category,
    unlocked: evaluateMeaningfulAchievements(state, mastery).includes(id) || state.achievements.includes(id),
  }));
}

export function syncAchievements(state = loadState()) {
  const mastery = getCurriculumMastery(state);
  const meaningful = evaluateMeaningfulAchievements(state, mastery);
  const newlyUnlocked = meaningful.filter((id) => !state.achievements.includes(id));
  const legacyUnlocked = unlockAchievements(state, mastery.allLessons);
  const combined = [...new Set([...newlyUnlocked, ...legacyUnlocked])];
  if (combined.length) saveState(state);
  return { state, mastery, newlyUnlocked: combined };
}
