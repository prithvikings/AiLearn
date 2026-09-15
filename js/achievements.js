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

export function evaluateMeaningfulAchievements(state, masteryLevels) {
  const completedPaths = masteryLevels.filter((level) => level.complete).length;
  const perfectChallenges = Object.values(state.challengeScores || {}).filter((score) => Number(score) === 100).length;
  const pathAchievements = MEANINGFUL_ACHIEVEMENTS.slice(0, 12);
  const eligible = pathAchievements.filter((achievement) => masteryLevels[achievement[4] - 1]?.complete).map(([id]) => id);
  if (completedPaths >= 5) eligible.push("ai-explorer");
  if (completedPaths >= 8) eligible.push("breadth-builder");
  if (perfectChallenges >= 1) eligible.push("perfect-challenge");
  if (perfectChallenges >= 3) eligible.push("challenge-specialist");
  if (completedPaths === masteryLevels.length) eligible.push("full-journey");
  return [...new Set(eligible)];
}

export function evaluateLegacyAchievements(state, lessons = []) {
  const unlocked = [];
  const foundation = lessons.filter((lesson) => ["ai", "genai", "llm", "apps", "usecases"].includes(lesson.id));
  const llm = lessons.filter((lesson) => lesson.id.startsWith("llm-") && lesson.type !== "final");
  const prompt = lessons.filter((lesson) => lesson.id.startsWith("prompt-"));
  const application = lessons.filter((lesson) => lesson.id.startsWith("app-"));
  const completed = (id) => state.completedLessons.includes(id);
  const checks = [
    ["first-step", state.completedLessons.length >= 1],
    ["curious-mind", state.completedLessons.length >= 3],
    ["ai-explorer", foundation.every((lesson) => completed(lesson.id))],
    ["token-tamer", completed("llm-03")],
    ["attention-seeker", completed("llm-05")],
    ["model-thinker", completed("llm-07")],
    ["llm-initiate", llm.every((lesson) => completed(lesson.id)) && completed("llm-final")],
    ["prompt-apprentice", prompt.filter((lesson) => completed(lesson.id)).length >= 3],
    ["context-master", completed("prompt-07")],
    ["example-builder", completed("prompt-05")],
    ["prompt-refiner", completed("prompt-08")],
    ["prompt-engineer", prompt.every((lesson) => completed(lesson.id))],
    ["api-explorer", completed("app-01")],
    ["message-architect", completed("app-02")],
    ["json-navigator", completed("app-04")],
    ["context-keeper", completed("app-05")],
    ["stream-rider", completed("app-06")],
    ["llm-builder", completed("app-08")],
    ["request-debugger", completed("app-09")],
    ["llm-application-architect", application.every((lesson) => completed(lesson.id))],
    ["model-explorer", completed("local-01")], ["open-weight-detective", completed("local-02")], ["model-hub-navigator", completed("local-03")], ["inference-initiate", completed("local-04")], ["cloud-local-strategist", completed("local-05")], ["hardware-scout", completed("local-06")], ["quantization-explorer", completed("local-07")], ["local-ai-explorer", completed("local-08")], ["local-ai-builder", completed("local-09")], ["open-source-ai-architect", completed("local-10")],
    ["embedding-explorer", completed("embed-01")], ["vector-thinker", completed("embed-02")], ["dimension-explorer", completed("embed-03")], ["similarity-seeker", completed("embed-04")], ["cosine-navigator", completed("embed-05")], ["semantic-searcher", completed("embed-06")], ["chunk-master", completed("embed-07")], ["vector-vault", completed("embed-08")], ["search-engine-builder", completed("embed-09")], ["vector-search-architect", completed("embed-10")],
    ["rag-rookie", completed("rag-01")], ["retrieval-thinker", completed("rag-02")], ["pipeline-mapper", completed("rag-03")], ["knowledge-ingestor", completed("rag-04")], ["retrieval-specialist", completed("rag-05")], ["grounding-guardian", completed("rag-06")], ["rag-debugger", completed("rag-07")], ["rag-builder", completed("rag-08")], ["mini-rag-engineer", completed("rag-09")], ["rag-architect", completed("rag-10")],
    ["agent-initiate", completed("agent-01")], ["architecture-detective", completed("agent-02")], ["tool-collector", completed("agent-03")], ["tool-caller", completed("agent-04")], ["agent-loop-master", completed("agent-05")], ["planning-apprentice", completed("agent-06")], ["tool-selector", completed("agent-07")], ["memory-explorer", completed("agent-08")], ["agent-builder", completed("agent-09")], ["agent-architect", completed("agent-10")],
    ["agent9-state", completed("agent9-01")], ["agent9-context", completed("agent9-02")], ["agent9-memory", completed("agent9-03")], ["agent9-manager", completed("agent9-04")], ["agent9-decomposer", completed("agent9-05")], ["agent9-checkpoint", completed("agent9-06")], ["agent9-recovery", completed("agent9-07")], ["agent9-strategist", completed("agent9-08")], ["agent9-builder", completed("agent9-09")], ["agent9-architect", completed("agent9-10")],
    ["mcp-curious", completed("mcp-01")], ["protocol-detective", completed("mcp-02")], ["architecture-explorer", completed("mcp-03")], ["capability-classifier", completed("mcp-04")], ["discovery-scout", completed("mcp-05")], ["schema-builder", completed("mcp-06")], ["flow-navigator", completed("mcp-07")], ["permission-guardian", completed("mcp-08")], ["ecosystem-builder", completed("mcp-09")], ["mcp-architect", completed("mcp-10")],
    ["orch-curious", completed("orch-01")], ["multi-agent-explorer", completed("orch-02")], ["role-strategist", completed("orch-03")], ["supervisor-scout", completed("orch-04")], ["routing-navigator", completed("orch-05")], ["workflow-strategist", completed("orch-06")], ["state-coordinator", completed("orch-07")], ["review-guardian", completed("orch-08")], ["mission-controller", completed("orch-09")], ["orchestration-architect", completed("orch-10")],
    ["reliability-engineer", completed("agentic-01")], ["planning-strategist", completed("agentic-02")], ["verification-specialist", completed("agentic-03")], ["contract-architect", completed("agentic-04")], ["guardrail-guardian", completed("agentic-05")], ["agent-evaluator", completed("agentic-06")], ["trace-detective", completed("agentic-07")], ["recovery-engineer", completed("agentic-08")], ["system-optimizer", completed("agentic-09")], ["agentic-system-architect", completed("agentic-10")],
  ];
  checks.forEach(([id, eligible]) => { if (eligible && !state.achievements.includes(id)) { state.achievements.push(id); unlocked.push(id); } });
  return unlocked;
}
