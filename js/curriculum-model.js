import { finalChallenge, foundationLessons, levels as curriculumLevelMeta, llmLessons, promptLessons } from "./curriculum.js";
import { phase4Lessons } from "./phase4.js";
import { phase5Lessons } from "./phase5.js";
import { phase6Lessons } from "./phase6.js";
import { phase7Lessons } from "./phase7.js";
import { phase8Lessons } from "./phase8.js";
import { phase9Lessons } from "./phase9.js";
import { phase10Lessons } from "./phase10.js";
import { phase11Lessons } from "./phase11.js";
import { phase12Lessons } from "./phase12.js";

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

export const curriculumLevels = curriculumLevelMeta.map((level, index) => ({
  ...level,
  lessons: lessonGroups[index] || [],
}));

export const curriculumLevelById = Object.fromEntries(
  curriculumLevels.map((level) => [level.id, level]),
);

export const allCurriculumLessons = curriculumLevels.flatMap((level) => level.lessons);

export function getCurriculumLevel(levelId) {
  return curriculumLevelById[levelId] || null;
}
