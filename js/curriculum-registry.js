import { foundationLessons, llmLessons, promptLessons, finalChallenge } from "./curriculum.js";
import { phase4Lessons } from "./phase4.js";
import { phase5Lessons } from "./phase5.js";
import { phase6Lessons } from "./phase6.js";
import { phase7Lessons } from "./phase7.js";
import { phase8Lessons } from "./phase8.js";
import { phase9Lessons } from "./phase9.js";
import { phase10Lessons } from "./phase10.js";
import { phase11Lessons } from "./phase11.js";
import { phase12Lessons } from "./phase12.js";

const LEVEL_METADATA = [
  [1, "AI Foundations", "Build your mental model of AI."],
  [2, "LLM Fundamentals", "Tokens, embeddings, attention & prediction."],
  [3, "Prompt Engineering", "Learn to communicate with models effectively."],
  [4, "LLM Applications", "Learn API basics and build with language models."],
  [5, "Open Source & Local AI", "Explore model weights, local inference and hardware."],
  [6, "Embeddings & Vector Search", "Turn text into numerical representations for semantic search."],
  [7, "Retrieval-Augmented Generation", "Connect generation to selected external knowledge."],
  [8, "AI Agents & Tools", "Learn systems that can choose actions and use tools."],
  [9, "Agent Memory & Planning", "Explore state, memory, planning, retries and longer-horizon tasks."],
  [10, "MCP", "Standardize how AI applications discover and interact with capabilities."],
  [11, "Agent Orchestration", "Coordinate multiple agents, tools, workflows, and AI components."],
  [12, "Advanced Agentic AI", "Explore evaluation, reliability, guardrails, observability and production AI systems."],
];

const LESSON_GROUPS = [
  foundationLessons,
  [...llmLessons, finalChallenge],
  promptLessons,
  phase4Lessons,
  phase5Lessons,
  phase6Lessons,
  phase7Lessons,
  phase8Lessons,
  phase9Lessons,
  phase10Lessons,
  phase11Lessons,
  phase12Lessons,
];

export const curriculumLevels = LEVEL_METADATA.map(([id, title, description], index) => ({
  id,
  title,
  description,
  unlocked: id === 1,
  lessons: LESSON_GROUPS[index] || [],
}));

export const curriculumLevelById = Object.fromEntries(
  curriculumLevels.map((level) => [level.id, level]),
);
export const allLessons = curriculumLevels.flatMap((level) => level.lessons);
export const getCurriculumLevel = (levelId) => curriculumLevelById[levelId] || null;
