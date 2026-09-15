import { loadState } from "./state.js";
import { MEANINGFUL_ACHIEVEMENTS } from "./achievements.js";

let previousIds = new Set();
let previousLevel = 1;
let previousCompletedLevels = new Set();
let initialized = false;
let hideTimer = null;

function titleFor(id) {
  return MEANINGFUL_ACHIEVEMENTS.find(([achievementId]) => achievementId === id)?.[1] || id;
}

function showAchievementToast(ids) {
  const toast = document.querySelector("#reward-toast");
  const title = document.querySelector("#reward-title");
  const copy = document.querySelector("#reward-copy");
  if (!toast || !title || !copy) return;
  const names = ids.map(titleFor);
  title.textContent = ids.length === 1 ? "Achievement Unlocked" : "Achievements Unlocked";
  copy.textContent = ids.length === 1 ? `◇ ${names[0]}` : `+${ids.length} achievements · ${names.slice(0, 2).join(" · ")}${names.length > 2 ? " · …" : ""}`;
  toast.hidden = false;
  if (hideTimer) window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => { toast.hidden = true; hideTimer = null; }, 2800);
}

function sync() {
  const state = loadState();
  const currentIds = new Set(MEANINGFUL_ACHIEVEMENTS.map(([id]) => id).filter((id) => state.achievements.includes(id)));
  const currentCompletedLevels = new Set(state.completedLevels || []);
  const newlyUnlocked = [...currentIds].filter((id) => !previousIds.has(id));
  const majorProgress = state.level > previousLevel || [...currentCompletedLevels].some((id) => !previousCompletedLevels.has(id));
  previousIds = currentIds;
  previousLevel = state.level;
  previousCompletedLevels = currentCompletedLevels;
  if (initialized && newlyUnlocked.length && !majorProgress) showAchievementToast(newlyUnlocked);
  initialized = true;
}

sync();
window.addEventListener("ailearn-state-updated", sync);
window.addEventListener("ailearn-gamification-updated", sync);
