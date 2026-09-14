const STORAGE_KEY = 'ai-learn-player-state-v1';

export const DEFAULT_STATE = { xp: 0, level: 1, streak: 0, completedLessons: [], achievements: [] };

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return { ...DEFAULT_STATE };
    return {
      ...DEFAULT_STATE,
      ...saved,
      completedLessons: Array.isArray(saved.completedLessons) ? saved.completedLessons : [],
      achievements: Array.isArray(saved.achievements) ? saved.achievements : []
    };
  } catch { return { ...DEFAULT_STATE }; }
}

export function saveState(state) { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

export function calculateLevel(xp) {
  if (xp >= 500) return 4;
  if (xp >= 250) return 3;
  if (xp >= 100) return 2;
  return 1;
}

export function getLevelProgress(xp) {
  const thresholds = [0, 100, 250, 500];
  const level = calculateLevel(xp);
  const start = thresholds[level - 1];
  const end = thresholds[level] ?? 750;
  return { current: xp - start, total: end - start, percent: Math.min(100, ((xp - start) / (end - start)) * 100) };
}

export function addXP(state, amount) {
  state.xp += amount;
  state.level = calculateLevel(state.xp);
}

export function completeLesson(state, lessonId, xp = 25) {
  if (state.completedLessons.includes(lessonId)) return false;
  state.completedLessons.push(lessonId);
  addXP(state, xp);
  return true;
}

export function unlockAchievements(state, lessons) {
  const unlocked = [];
  const completed = state.completedLessons.length;
  const checks = [
    ['first-step', completed >= 1],
    ['curious-mind', completed >= 3],
    ['ai-explorer', lessons.every((lesson) => state.completedLessons.includes(lesson.id))]
  ];
  checks.forEach(([id, condition]) => {
    if (condition && !state.achievements.includes(id)) { state.achievements.push(id); unlocked.push(id); }
  });
  return unlocked;
}
