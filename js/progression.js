import { finalChallenge, foundationLessons, llmLessons, promptLessons } from "./curriculum.js";
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

export const curriculumLevels = [
  { id: 1, lessons: foundationLessons },
  { id: 2, lessons: [...llmLessons, finalChallenge] },
  { id: 3, lessons: promptLessons },
  { id: 4, lessons: phase4Lessons },
  { id: 5, lessons: phase5Lessons },
  { id: 6, lessons: phase6Lessons },
  { id: 7, lessons: phase7Lessons },
  { id: 8, lessons: phase8Lessons },
  { id: 9, lessons: phase9Lessons },
  { id: 10, lessons: phase10Lessons },
  { id: 11, lessons: phase11Lessons },
  { id: 12, lessons: phase12Lessons },
];

export const allLessons = curriculumLevels.flatMap(({ lessons }) => lessons);

export const curriculumLevelById = Object.fromEntries(curriculumLevels.map((level) => [level.id, level]));

export function getPlayerLevel(state) {
  return state.level ?? calculateLevel(state.xp);
}

export function getXpProgress(state) {
  return getLevelProgress(state.xp);
}

export function getCompletedMissionCount(state) {
  return allLessons.reduce(
    (count, lesson) => count + Number(state.completedLessons.includes(lesson.id)),
    0,
  );
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
  const unlockedLevels = curriculumLevels.filter((level) => isLevelUnlocked(state, level.id));
  for (const level of unlockedLevels) {
    const mission = level.lessons.find((lesson) => !state.completedLessons.includes(lesson.id));
    if (mission) return mission;
  }
  return null;
}

export function getDailyProgress(state, goal = 100) {
  const xp = Math.max(0, Number(state.dailyProgress?.xp) || 0);
  return {
    xp,
    goal,
    percent: Math.min(100, (xp / goal) * 100),
    complete: Boolean(state.dailyProgress?.goalCompleted) || xp >= goal,
  };
}

export function getStreakStatus(state) {
  return {
    days: Math.max(0, Number(state.streak) || 0),
    active: Boolean(state.lastActivityDate),
  };
}

export function getUnlockedLevels(state) {
  return curriculumLevels.filter((level) => isLevelUnlocked(state, level.id)).map((level) => level.id);
}

export function getCompletedLevels(state) {
  return curriculumLevels.filter((level) => getLevelProgressById(state, level.id).complete).map((level) => level.id);
}

export function getMastery(state, levelId) {
  const progress = getLevelProgressById(state, levelId);
  const level = curriculumLevelById[levelId];
  return {
    levelId,
    title: level?.title ?? `Level ${levelId}`,
    ...progress,
  };
}
