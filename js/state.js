const STORAGE_KEY = 'ai-learn-player-state-v1';

export const DEFAULT_STATE = {
  xp: 0,
  level: 1,
  streak: 0,
  completedLessons: [],
  achievements: [],
  unlockedLevels: [1],
  completedLevels: [],
  challengeScores: {}
};

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return { ...DEFAULT_STATE };
    const state = {
      ...DEFAULT_STATE,
      ...saved,
      completedLessons: Array.isArray(saved.completedLessons) ? saved.completedLessons : [],
      achievements: Array.isArray(saved.achievements) ? saved.achievements : [],
      unlockedLevels: Array.isArray(saved.unlockedLevels) ? saved.unlockedLevels : [1],
      completedLevels: Array.isArray(saved.completedLevels) ? saved.completedLevels : [],
      challengeScores: saved.challengeScores && typeof saved.challengeScores === 'object' ? saved.challengeScores : {}
    };
    if (!state.unlockedLevels.includes(1)) state.unlockedLevels.unshift(1);
    const foundationIds = ['ai', 'genai', 'llm', 'apps', 'usecases'];
    const llmMissionIds = ['llm-01', 'llm-02', 'llm-03', 'llm-04', 'llm-05', 'llm-06', 'llm-07', 'llm-08'];
    const promptMissionIds = ['prompt-01', 'prompt-02', 'prompt-03', 'prompt-04', 'prompt-05', 'prompt-06', 'prompt-07', 'prompt-08', 'prompt-09', 'prompt-10'];
    if (foundationIds.every((id) => state.completedLessons.includes(id))) {
      unlockLevel(state, 2);
      markLevelCompleted(state, 1);
    }
    if (llmMissionIds.every((id) => state.completedLessons.includes(id)) && state.completedLessons.includes('llm-final')) {
      unlockLevel(state, 3);
      markLevelCompleted(state, 2);
    }
    if (promptMissionIds.every((id) => state.completedLessons.includes(id))) {
      unlockLevel(state, 4);
      markLevelCompleted(state, 3);
    }
    return state;
  } catch {
    return { ...DEFAULT_STATE };
  }
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

export function isLevelUnlocked(state, levelId) {
  return state.unlockedLevels.includes(levelId) || levelId === 1;
}

export function unlockLevel(state, levelId) {
  if (!state.unlockedLevels.includes(levelId)) state.unlockedLevels.push(levelId);
}

export function markLevelCompleted(state, levelId) {
  if (!state.completedLevels.includes(levelId)) state.completedLevels.push(levelId);
}

export function recordChallengeScore(state, challengeId, score) {
  state.challengeScores[challengeId] = score;
}

export function unlockAchievements(state, lessons) {
  const unlocked = [];
  const foundation = lessons.filter((lesson) => ['ai', 'genai', 'llm', 'apps', 'usecases'].includes(lesson.id));
  const llm = lessons.filter((lesson) => lesson.id.startsWith('llm-') && lesson.type !== 'final');
  const prompt = lessons.filter((lesson) => lesson.id.startsWith('prompt-'));
  const promptCompleted = prompt.filter((lesson) => state.completedLessons.includes(lesson.id)).length;
  const checks = [
    ['first-step', state.completedLessons.length >= 1],
    ['curious-mind', state.completedLessons.length >= 3],
    ['ai-explorer', foundation.every((lesson) => state.completedLessons.includes(lesson.id))],
    ['token-tamer', state.completedLessons.includes('llm-03')],
    ['attention-seeker', state.completedLessons.includes('llm-05')],
    ['model-thinker', state.completedLessons.includes('llm-07')],
    ['llm-initiate', llm.every((lesson) => state.completedLessons.includes(lesson.id)) && state.completedLessons.includes('llm-final')],
    ['prompt-apprentice', promptCompleted >= 3],
    ['context-master', state.completedLessons.includes('prompt-07')],
    ['example-builder', state.completedLessons.includes('prompt-05')],
    ['prompt-refiner', state.completedLessons.includes('prompt-08')],
    ['prompt-engineer', prompt.every((lesson) => state.completedLessons.includes(lesson.id))]
  ];
  checks.forEach(([id, condition]) => {
    if (condition && !state.achievements.includes(id)) {
      state.achievements.push(id);
      unlocked.push(id);
    }
  });
  return unlocked;
}
