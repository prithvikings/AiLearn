import { getLevelProgress, loadState } from "./state.js";

const DAILY_XP_GOAL = 100;
let lastLevel = null;
let lastAchievements = new Set();
let rewardTimer = null;
const $ = (selector, root = document) => root.querySelector(selector);

function ensureStyles() {
  if ($("#gamification-styles")) return;
  const style = document.createElement("style");
  style.id = "gamification-styles";
  style.textContent = `
    .gamification-goal{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;padding:17px 19px;border:1px solid var(--border);border-radius:17px;background:var(--surface);box-shadow:0 5px 18px rgba(53,45,35,.04)}
    .gamification-goal-copy{display:grid;gap:4px}.gamification-goal-kicker{font:700 .58rem 'DM Mono',monospace;letter-spacing:.14em;color:var(--accent);text-transform:uppercase}.gamification-goal-copy strong{font-size:.92rem}.gamification-goal-copy small{color:var(--muted);font-size:.68rem}.gamification-goal-value{font:800 .75rem 'DM Mono',monospace;color:var(--text)}.gamification-track{height:8px;margin-top:8px;border-radius:999px;background:#eee6dc;overflow:hidden}.gamification-track span{display:block;height:100%;max-width:100%;border-radius:inherit;background:linear-gradient(90deg,var(--accent),var(--accent-2));transition:width .35s ease}.gamification-goal.is-complete{border-color:#cfe0d5;background:#f8fbf9}.gamification-goal.is-complete .gamification-goal-kicker{color:var(--success)}
    .player-level-card{display:grid;grid-template-columns:auto minmax(0,1fr);gap:13px;align-items:center;padding:15px 17px;border:1px solid #dec9bb;border-radius:17px;background:#fff9f4}.player-level-number{width:45px;height:45px;display:grid;place-items:center;border-radius:13px;background:#f2d5c6;color:#a85031;font-size:1.35rem;font-weight:900}.player-level-copy{display:grid;gap:3px}.player-level-copy span{font:700 .57rem 'DM Mono',monospace;letter-spacing:.12em;color:var(--muted);text-transform:uppercase}.player-level-copy strong{font-size:.9rem}.player-level-copy small{color:var(--muted);font-size:.68rem}.player-level-progress{height:6px;margin-top:3px;border-radius:999px;background:#eee6dc;overflow:hidden}.player-level-progress span{display:block;height:100%;background:var(--accent);border-radius:inherit;transition:width .35s ease}
    .gamification-reward{display:grid;gap:12px;margin-top:16px;padding:16px;border:1px solid #dfc9ba;border-radius:16px;background:#fffaf5;text-align:left}.gamification-reward-head{display:flex;justify-content:space-between;gap:10px;align-items:baseline}.gamification-reward-head strong{font-size:.78rem;letter-spacing:.08em;text-transform:uppercase}.gamification-xp-earned{font:900 1.15rem 'DM Mono',monospace;color:#9a5d32}.gamification-reward-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.gamification-reward-stat{padding:9px 10px;border:1px solid var(--border);border-radius:11px;background:var(--surface)}.gamification-reward-stat span{display:block;color:var(--muted);font-size:.59rem;text-transform:uppercase;letter-spacing:.08em}.gamification-reward-stat strong{display:block;margin-top:3px;font-size:.76rem}.gamification-milestone{padding:10px 11px;border-left:3px solid var(--accent-2);background:#fff4df;border-radius:9px;font-size:.72rem}
    @media(max-width:760px){.gamification-goal{grid-template-columns:1fr}.player-level-card{grid-template-columns:auto 1fr}.gamification-reward-grid{grid-template-columns:1fr}}
    @media(prefers-reduced-motion:reduce){.gamification-track span,.player-level-progress span{transition:none}}
  `;
  document.head.appendChild(style);
}

function renderHome() {
  const mount = $("#learning-journey");
  if (!mount) return;
  const state = loadState();
  const progress = getLevelProgress(state.xp);
  const daily = state.dailyProgress || { xp: 0, goalCompleted: false };
  const existingGoal = $(".gamification-goal", mount);
  const goal = existingGoal || document.createElement("section");
  goal.className = `gamification-goal${daily.goalCompleted ? " is-complete" : ""}`;
  goal.setAttribute("aria-label", "Today's learning goal");
  goal.innerHTML = `<div class="gamification-goal-copy"><span class="gamification-goal-kicker">TODAY'S GOAL</span><strong>${daily.goalCompleted ? "Daily goal complete" : "Keep the momentum going"}</strong><small>${daily.goalCompleted ? `${daily.xp} / ${DAILY_XP_GOAL} XP earned · You can keep learning.` : `${Math.max(0, DAILY_XP_GOAL - daily.xp)} XP to go`}</small><div class="gamification-track" role="progressbar" aria-valuemin="0" aria-valuemax="${DAILY_XP_GOAL}" aria-valuenow="${Math.min(daily.xp, DAILY_XP_GOAL)}" aria-label="Today's XP goal"><span style="width:${Math.min(100, (daily.xp / DAILY_XP_GOAL) * 100)}%"></span></div></div><span class="gamification-goal-value">${daily.xp} / ${DAILY_XP_GOAL} XP</span>`;
  if (!existingGoal) {
    const status = $(".journey-status", mount);
    if (status) status.after(goal);
  }

  const metrics = $(".journey-metrics", mount);
  if (metrics) {
    const levelMetric = $("[data-player-level]", metrics) || document.createElement("span");
    levelMetric.dataset.playerLevel = "true";
    levelMetric.innerHTML = `<strong>${state.level}</strong> player level`;
    if (!levelMetric.parentElement) metrics.prepend(levelMetric);
  }

  const existingLevel = $(".player-level-card", mount);
  const levelCard = existingLevel || document.createElement("section");
  levelCard.className = "player-level-card";
  levelCard.setAttribute("aria-label", `Player level ${state.level}`);
  levelCard.innerHTML = `<span class="player-level-number">${state.level}</span><div class="player-level-copy"><span>PLAYER LEVEL</span><strong>${progress.current.toLocaleString()} / ${progress.total.toLocaleString()} XP</strong><small>${Math.max(0, progress.total - progress.current)} XP to Level ${state.level + 1}</small><div class="player-level-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress.percent)}" aria-label="Progress to next player level"><span style="width:${progress.percent}%"></span></div></div>`;
  if (!existingLevel) {
    const goalSection = $(".gamification-goal", mount);
    if (goalSection) goalSection.after(levelCard);
  }

  lastLevel = state.level;
  lastAchievements = new Set(state.achievements);
}

function showRewardToast(state, reward, levelledUp, milestoneText) {
  const toast = $("#reward-toast");
  if (!toast) return;
  const title = $("#reward-title");
  const copy = $("#reward-copy");
  if (title) title.textContent = levelledUp ? `Level ${state.level} reached` : "Mission complete";
  if (copy) copy.textContent = `+${reward} XP · 🔥 ${state.streak} day streak${state.dailyProgress.goalCompleted ? " · Daily goal complete" : ""}${milestoneText.length ? ` · ${milestoneText[0]} unlocked` : ""}`;
  toast.hidden = false;
  clearTimeout(rewardTimer);
  rewardTimer = setTimeout(() => { toast.hidden = true; }, 2600);
}

function showMissionReward(detail) {
  const newlyCompleted = Number(detail?.newlyCompleted) || 0;
  if (!newlyCompleted) return;
  const modal = $("#lesson-modal");
  const state = loadState();
  const previousLevel = lastLevel ?? state.level;
  const levelledUp = state.level > previousLevel;
  const reward = Number(detail.rewardedXp) || 0;
  const daily = state.dailyProgress || { xp: 0, goalCompleted: false };
  const milestoneIds = state.achievements.filter((id) => !lastAchievements.has(id));
  const milestoneText = milestoneIds.filter((id) => id.startsWith("milestone-")).map((id) => id.replace(/^milestone-/, "").replace(/-/g, " ")).map((value) => value.replace(/\b\w/g, (c) => c.toUpperCase()));

  if (modal && !modal.hidden) {
    const card = $(".mission-completion-card", modal);
    if (card) {
      let summary = $(".gamification-reward", card);
      if (!summary) { summary = document.createElement("div"); summary.className = "gamification-reward"; card.appendChild(summary); }
      const levelProgress = getLevelProgress(state.xp);
      summary.innerHTML = `<div class="gamification-reward-head"><strong>REWARD SUMMARY</strong><span class="gamification-xp-earned">+${reward} XP</span></div><div class="gamification-reward-grid"><div class="gamification-reward-stat"><span>Daily goal</span><strong>${Math.min(daily.xp, DAILY_XP_GOAL)} / ${DAILY_XP_GOAL} XP${daily.goalCompleted ? " · Complete" : ""}</strong></div><div class="gamification-reward-stat"><span>Streak</span><strong>🔥 ${state.streak} day${state.streak === 1 ? "" : "s"}</strong></div><div class="gamification-reward-stat"><span>Player level</span><strong>Level ${state.level}${levelledUp ? " · Level up" : ""}</strong></div></div>${levelledUp ? `<div class="gamification-milestone" role="status">Level increased to ${state.level}. ${levelProgress.current} / ${levelProgress.total} XP toward the next level.</div>` : ""}${daily.goalCompleted ? `<div class="gamification-milestone" role="status">Daily goal complete — ${daily.xp} XP earned today. You can keep learning.</div>` : ""}${milestoneText.map((item) => `<div class="gamification-milestone" role="status">Milestone unlocked: ${item}</div>`).join("")}`;
    }
  } else {
    showRewardToast(state, reward, levelledUp, milestoneText);
  }
  lastLevel = state.level;
  lastAchievements = new Set(state.achievements);
}

function init() {
  ensureStyles();
  renderHome();
  setTimeout(renderHome, 0);
  window.addEventListener("ailearn-state-updated", renderHome);
  window.addEventListener("ailearn-gamification-updated", (event) => {
    showMissionReward(event.detail || {});
    renderHome();
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
