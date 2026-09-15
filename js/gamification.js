import { loadState } from "./state.js";

export const DAILY_XP_GOAL = 100;

export const MILESTONES = [
  { id: "milestone-first-mission", label: "First Mission", description: "Complete your first learning mission." },
  { id: "milestone-ten-missions", label: "10 Missions", description: "Complete 10 learning missions." },
  { id: "milestone-fifty-missions", label: "50 Missions", description: "Complete 50 learning missions." },
  { id: "milestone-hundred-missions", label: "100 Missions", description: "Complete 100 learning missions." },
  { id: "milestone-1000-xp", label: "1,000 XP", description: "Earn 1,000 lifetime XP." },
  { id: "milestone-5000-xp", label: "5,000 XP", description: "Earn 5,000 lifetime XP." },
  { id: "milestone-7-day-streak", label: "7 Day Streak", description: "Learn for seven consecutive days." },
  { id: "milestone-30-day-streak", label: "30 Day Streak", description: "Learn for thirty consecutive days." },
];

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDateKey(dateKey, days) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

export function normalizeGamification(state) {
  const today = localDateKey();
  const daily = state.dailyProgress && typeof state.dailyProgress === "object" ? state.dailyProgress : {};
  if (daily.date !== today) {
    state.dailyProgress = { date: today, xp: 0, goalCompleted: false };
  } else {
    state.dailyProgress = {
      date: today,
      xp: Number.isFinite(Number(daily.xp)) ? Math.max(0, Number(daily.xp)) : 0,
      goalCompleted: Boolean(daily.goalCompleted),
    };
  }
  state.lastActivityDate = typeof state.lastActivityDate === "string" ? state.lastActivityDate : null;
  state.streak = Number.isFinite(Number(state.streak)) ? Math.max(0, Number(state.streak)) : 0;
  return state;
}

export function recordLearningActivity(state, today = localDateKey()) {
  normalizeGamification(state);
  const previous = state.lastActivityDate;
  if (previous === today) return { changed: false, streak: state.streak };
  if (!previous) state.streak = 1;
  else if (previous === shiftDateKey(today, -1)) state.streak += 1;
  else state.streak = 1;
  state.lastActivityDate = today;
  return { changed: true, streak: state.streak };
}

export function addDailyXP(state, amount) {
  normalizeGamification(state);
  state.dailyProgress.xp += Math.max(0, Number(amount) || 0);
  if (state.dailyProgress.xp >= DAILY_XP_GOAL) state.dailyProgress.goalCompleted = true;
}

export function checkMilestones(state) {
  normalizeGamification(state);
  const completed = state.completedLessons.length;
  const conditions = {
    "milestone-first-mission": completed >= 1,
    "milestone-ten-missions": completed >= 10,
    "milestone-fifty-missions": completed >= 50,
    "milestone-hundred-missions": completed >= 100,
    "milestone-1000-xp": state.xp >= 1000,
    "milestone-5000-xp": state.xp >= 5000,
    "milestone-7-day-streak": state.streak >= 7,
    "milestone-30-day-streak": state.streak >= 30,
  };
  const unlocked = [];
  Object.entries(conditions).forEach(([id, meetsRequirement]) => {
    if (meetsRequirement && !state.achievements.includes(id)) {
      state.achievements.push(id);
      const milestone = MILESTONES.find((item) => item.id === id);
      if (milestone) unlocked.push(milestone);
    }
  });
  return unlocked;
}

export function completeMissionProgress(state, xp) {
  normalizeGamification(state);
  addDailyXP(state, xp);
  const streak = recordLearningActivity(state);
  const milestones = checkMilestones(state);
  return { dailyProgress: { ...state.dailyProgress }, streak: streak.streak, milestones };
}

export function getLevelRewardSummary(state, previousLevel) {
  return { level: state.level, leveledUp: state.level > previousLevel };
}
