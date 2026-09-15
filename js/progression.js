import { curriculumLevels, curriculumLevelById, allCurriculumLessons, getCurriculumLevel } from "./curriculum-model.js";
import { evaluateMeaningfulAchievements } from "./achievements.js";
import { calculateLevel, getLevelProgress, isLevelUnlocked } from "./state.js";

export { curriculumLevels, curriculumLevelById, allCurriculumLessons };
export const allLessons = allCurriculumLessons;

export function getPlayerLevel(state) { return state.level ?? calculateLevel(state.xp); }
export function getXpProgress(state) { return getLevelProgress(state.xp); }
export function getCompletedMissionCount(state) { return allLessons.filter((lesson) => state.completedLessons.includes(lesson.id)).length; }
export function getMissionProgress(state, lessons) { const completed = lessons.filter((lesson) => state.completedLessons.includes(lesson.id)).length; const total = lessons.length; return { completed, total, percent: total ? Math.round((completed / total) * 100) : 0, complete: total > 0 && completed === total }; }
export function getLevelProgressById(state, levelId) { const level = curriculumLevelById[levelId]; return level ? getMissionProgress(state, level.lessons) : { completed: 0, total: 0, percent: 0, complete: false }; }
export function getCurrentMission(state) { for (const level of curriculumLevels) { if (!isLevelUnlocked(state, level.id)) break; const mission = level.lessons.find((lesson) => !state.completedLessons.includes(lesson.id)); if (mission) return mission; } return null; }
export function getDailyProgress(state, goal = 100) { const xp = Math.max(0, Number(state.dailyProgress?.xp) || 0); return { xp, goal, percent: Math.min(100, (xp / goal) * 100), complete: Boolean(state.dailyProgress?.goalCompleted) || xp >= goal }; }
export function getStreakStatus(state) { return { days: Math.max(0, Number(state.streak) || 0), active: Boolean(state.lastActivityDate) }; }
export function getUnlockedLevels(state) { return curriculumLevels.filter((level) => isLevelUnlocked(state, level.id)).map((level) => level.id); }
export function getCompletedLevels(state) { return curriculumLevels.filter((level) => getLevelProgressById(state, level.id).complete).map((level) => level.id); }
export function getMastery(state, levelId) { const level = curriculumLevelById[levelId]; return { levelId, title: level?.title ?? `Level ${levelId}`, ...getLevelProgressById(state, levelId) }; }
export function getCurriculumMastery(state) { return { levels: curriculumLevels.map((level) => getMastery(state, level.id)), allLessons }; }
export function getMeaningfulAchievementIds(state) { return evaluateMeaningfulAchievements(state, getCurriculumMastery(state).levels); }
