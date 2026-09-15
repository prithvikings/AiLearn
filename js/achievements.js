export const MEANINGFUL_ACHIEVEMENTS = [
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

export const MILESTONE_DEFINITIONS = [
  ["milestone-first-mission", "First mission"],
  ["milestone-ten-missions", "10 missions"],
  ["milestone-fifty-missions", "50 missions"],
  ["milestone-hundred-missions", "100 missions"],
  ["milestone-1000-xp", "1,000 XP"],
  ["milestone-5000-xp", "5,000 XP"],
  ["milestone-7-day-streak", "7-day streak"],
  ["milestone-30-day-streak", "30-day streak"],
];

export function getMeaningfulAchievements(state, masteryLevels) {
  const completedPaths = masteryLevels.filter((level) => level.complete).length;
  const perfectChallenges = Object.values(state.challengeScores || {}).filter((score) => Number(score) === 100).length;
  const eligible = new Set();

  masteryLevels.forEach((level) => {
    if (level.complete) eligible.add(MEANINGFUL_ACHIEVEMENTS[level.id - 1]?.[0]);
  });

  if (completedPaths >= 5) eligible.add("ai-explorer");
  if (completedPaths >= 8) eligible.add("breadth-builder");
  if (perfectChallenges >= 1) eligible.add("perfect-challenge");
  if (perfectChallenges >= 3) eligible.add("challenge-specialist");
  if (completedPaths === masteryLevels.length) eligible.add("full-journey");

  return [...eligible].filter(Boolean);
}
