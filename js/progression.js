import { finalChallenge, foundationLessons, levels as curriculumLevelsMeta, llmLessons, promptLessons } from "./curriculum.js";
import { phase4Lessons } from "./phase4.js";
import { phase5Lessons } from "./phase5.js";
import { phase6Lessons } from "./phase6.js";
import { phase7Lessons } from "./phase7.js";
import { phase8Lessons } from "./phase8.js";
import { phase9Lessons } from "./phase9.js";
import { phase10Lessons } from "./phase10.js";
import { phase11Lessons } from "./phase11.js";
import { phase12Lessons } from "./phase12.js";
import { calculateLevel, getLevelProgress, isLevelUnlocked } from "./state.js";

const lessonGroups = [
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

export const curriculumLevels = curriculumLevelsMeta.map((meta, index) => ({
  ...meta,
  lessons: lessonGroups[index] || [],
}));

export const allLessons = curriculumLevels.flatMap(({ lessons }) => lessons);
export const curriculumLevelById = Object.fromEntries(curriculumLevels.map((level) => [level.id, level]));

export function getPlayerLevel(state) {
  return state.level ?? calculateLevel(state.xp);
}

export function getXpProgress(state) {
  return getLevelProgress(state.xp);
}

export function getCompletedMissionCount(state) {
  return allLessons.filter((lesson) => state.completedLessons.includes(lesson.id)).length;
}

export function getMissionProgress(state, lessons) {
  const completed = lessons.filter((lesson) => state.completedLessons.includes(lesson.id)).length;
  const total = lessons.length;
  return {
    completed,
    total,
    percent: total ? Math.round((completed / total) * 100) : 0,
    complete: total > 0 && completed === total,
  };
}

export function getLevelProgressById(state, levelId) {
  const level = curriculumLevelById[levelId];
  return level ? getMissionProgress(state, level.lessons) : { completed: 0, total: 0, percent: 0, complete: false };
}

export function getCurrentMission(state) {
  for (const level of curriculumLevels) {
    if (!isLevelUnlocked(state, level.id)) break;
    const mission = level.lessons.find((lesson) => !state.completedLessons.includes(lesson.id));
    if (mission) return mission;
  }
  return null;
}

export function getDailyProgress(state, goal = 100) {
  const xp = Math.max(0, Number(state.dailyProgress?.xp) || 0);
  return { xp, goal, percent: Math.min(100, (xp / goal) * 100), complete: Boolean(state.dailyProgress?.goalCompleted) || xp >= goal };
}

export function getStreakStatus(state) {
  return { days: Math.max(0, Number(state.streak) || 0), active: Boolean(state.lastActivityDate) };
}

export function getUnlockedLevels(state) {
  return curriculumLevels.filter((level) => isLevelUnlocked(state, level.id)).map((level) => level.id);
}

export function getCompletedLevels(state) {
  return curriculumLevels.filter((level) => getLevelProgressById(state, level.id).complete).map((level) => level.id);
}

export function getMastery(state, levelId) {
  const level = curriculumLevelById[levelId];
  return { levelId, title: level?.title ?? `Level ${levelId}`, ...getLevelProgressById(state, levelId) };
}

export function getCurriculumMastery(state) {
  return { levels: curriculumLevels.map((level) => getMastery(state, level.id)), allLessons };
}

export function evaluateMeaningfulAchievements(state, mastery = getCurriculumMastery(state)) {
  const completedPaths = mastery.levels.filter((item) => item.complete).length;
  const perfectChallenges = Object.values(state.challengeScores || {}).filter((score) => Number(score) === 100).length;
  const conditions = {
    "foundations-complete": mastery.levels[0]?.complete,
    "llm-fundamentals-complete": mastery.levels[1]?.complete,
    "prompt-architect": mastery.levels[2]?.complete,
    "application-architect": mastery.levels[3]?.complete,
    "local-ai-builder": mastery.levels[4]?.complete,
    "vector-search-architect": mastery.levels[5]?.complete,
    "rag-builder": mastery.levels[6]?.complete,
    "agent-engineer": mastery.levels[7]?.complete,
    "memory-planning-architect": mastery.levels[8]?.complete,
    "mcp-architect": mastery.levels[9]?.complete,
    "orchestration-architect": mastery.levels[10]?.complete,
    "advanced-agentic-architect": mastery.levels[11]?.complete,
    "ai-explorer": completedPaths >= 5,
    "breadth-builder": completedPaths >= 8,
    "perfect-challenge": perfectChallenges >= 1,
    "challenge-specialist": perfectChallenges >= 3,
    "full-journey": completedPaths === curriculumLevels.length,
  };
  return Object.entries(conditions).filter(([, eligible]) => eligible).map(([id]) => id);
}
