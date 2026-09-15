import { loadState, getLevelProgress } from "./state.js";
import { roadmapLevels } from "./phase5-roadmap.js";

const $ = (selector, root = document) => root.querySelector(selector);
const REDUCED = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
const MILESTONE_COPY = {
  "milestone-first-mission": ["First Mission", "You completed your first mission."],
  "milestone-ten-missions": ["10 Missions", "Ten missions completed. Keep building."],
  "milestone-fifty-missions": ["50 Missions", "Fifty missions completed. Serious momentum."],
  "milestone-hundred-missions": ["100 Missions", "One hundred missions completed."],
  "milestone-1000-xp": ["1,000 XP", "You've earned your first thousand XP."],
  "milestone-5000-xp": ["5,000 XP", "Five thousand XP earned."],
  "milestone-7-day-streak": ["7 Day Streak", "One week of consistent learning."],
  "milestone-30-day-streak": ["30 Day Streak", "A full month of consistent learning."],
};

let previousState = null;
let overlay = null;
let restoreFocus = null;
let animationTimers = new Set();

function ensureStyles() {
  if (document.querySelector("#celebration-styles")) return;
  const style = document.createElement("style");
  style.id = "celebration-styles";
  style.textContent = `
    .celebration-overlay{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:24px;background:rgba(35,29,24,.34);backdrop-filter:blur(4px);animation:celebration-fade .2s ease both}
    .celebration-dialog{position:relative;width:min(100%,430px);padding:32px 30px 28px;border:1px solid #dfc4b4;border-radius:24px;background:#fffaf6;color:var(--text);box-shadow:0 28px 70px rgba(35,29,24,.22);text-align:center;animation:celebration-enter .34s cubic-bezier(.2,.8,.2,1) both}
    .celebration-icon{width:68px;height:68px;margin:0 auto 16px;display:grid;place-items:center;border-radius:20px;background:#f3dccd;color:#a85031;font-size:1.8rem;font-weight:900}
    .celebration-eyebrow{display:block;margin-bottom:7px;font:800 .62rem/1.2 'DM Mono',monospace;letter-spacing:.16em;color:var(--accent);text-transform:uppercase}
    .celebration-dialog h2{margin:0;font-size:clamp(1.65rem,5vw,2.15rem);line-height:1.04;letter-spacing:-.045em}
    .celebration-message{max-width:340px;margin:10px auto 0;color:var(--muted);line-height:1.55;font-size:.84rem}
    .celebration-rewards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:20px 0;text-align:left}
    .celebration-reward{padding:11px 12px;border:1px solid var(--border);border-radius:13px;background:var(--surface)}
    .celebration-reward span{display:block;color:var(--muted);font:700 .55rem 'DM Mono',monospace;letter-spacing:.1em;text-transform:uppercase}
    .celebration-reward strong{display:block;margin-top:4px;font-size:.82rem}
    .celebration-secondary{display:grid;gap:7px;margin:12px 0 20px;text-align:left}
    .celebration-secondary-item{padding:9px 11px;border-left:3px solid var(--accent-2);border-radius:9px;background:#fff4df;font-size:.72rem}
    .celebration-primary{width:100%;min-height:46px;border:0;border-radius:12px;background:var(--accent);color:#fff;font:800 .86rem inherit;cursor:pointer;transition:transform .15s ease,background .15s ease}
    .celebration-primary:hover{background:#b95837;transform:translateY(-1px)}
    .celebration-primary:focus-visible{outline:3px solid rgba(180,89,55,.25);outline-offset:3px}
    .celebration-dismiss{position:absolute;top:14px;right:14px;width:32px;height:32px;border:1px solid var(--border);border-radius:50%;background:var(--surface);color:var(--muted);cursor:pointer;font-size:1rem}
    .celebration-dismiss:focus-visible{outline:3px solid rgba(180,89,55,.25);outline-offset:2px}
    .celebration-pulse{animation:celebration-pulse .45s ease both}
    .celebration-xp-pop{animation:celebration-xp .45s cubic-bezier(.2,.8,.2,1) both}
    .celebration-success-mark{animation:celebration-check .38s cubic-bezier(.2,.9,.2,1) both}
    .celebration-progress-fill{transition:width .42s cubic-bezier(.2,.8,.2,1)!important}
    .celebration-confetti{position:fixed;top:-14px;z-index:1001;width:7px;height:12px;pointer-events:none;border-radius:2px;animation:celebration-confetti 900ms cubic-bezier(.12,.7,.25,1) forwards}
    @keyframes celebration-fade{from{opacity:0}to{opacity:1}}
    @keyframes celebration-enter{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}
    @keyframes celebration-pulse{50%{transform:scale(1.045)}to{transform:none}}
    @keyframes celebration-xp{from{opacity:.45;transform:translateY(6px) scale(.92)}to{opacity:1;transform:none}}
    @keyframes celebration-check{from{opacity:0;transform:scale(.55) rotate(-8deg)}to{opacity:1;transform:none}}
    @keyframes celebration-confetti{to{transform:translate3d(var(--dx),var(--dy),0) rotate(var(--rot));opacity:0}}
    @media(max-width:520px){.celebration-overlay{padding:14px}.celebration-dialog{padding:28px 20px 20px;border-radius:20px}.celebration-rewards{grid-template-columns:1fr}.celebration-icon{width:60px;height:60px}}
    @media(prefers-reduced-motion:reduce){.celebration-overlay,.celebration-dialog,.celebration-pulse,.celebration-xp-pop,.celebration-success-mark,.celebration-confetti{animation:none!important}.celebration-progress-fill{transition:none!important}.celebration-primary:hover{transform:none}}
  `;
  document.head.appendChild(style);
}

function diff(before, after) {
  const added = (key) => (after[key] || []).filter((value) => !(before?.[key] || []).includes(value));
  return {
    mission: Number(after.xp) > Number(before?.xp ?? after.xp) && added("completedLessons").length > 0,
    completedLessons: added("completedLessons"),
    achievements: added("achievements").filter((id) => id.startsWith("milestone-")),
    unlockedLevels: added("unlockedLevels"),
    completedLevels: added("completedLevels"),
    xpGain: Math.max(0, Number(after.xp) - Number(before?.xp ?? after.xp)),
    levelUp: Number(after.level) > Number(before?.level ?? after.level),
    streakIncrease: Number(after.streak) > Number(before?.streak ?? after.streak),
    streakMilestone: Number(after.streak) > Number(before?.streak ?? after.streak) && [3, 7, 14, 30, 60, 100].includes(Number(after.streak)),
    dailyGoal: Boolean(after.dailyProgress?.goalCompleted) && !Boolean(before?.dailyProgress?.goalCompleted),
  };
}

function levelTitle(levelNumber) {
  return roadmapLevels[levelNumber - 1]?.[0] || `Level ${levelNumber}`;
}

function animateXp(detail) {
  if (!detail.xpGain) return;
  const metric = [...document.querySelectorAll(".journey-metrics span")].find((item) => /\bXP$/i.test(item.textContent?.trim() || ""));
  const strong = metric?.querySelector("strong");
  if (!metric || !strong) return;
  metric.classList.remove("celebration-xp-pop");
  void metric.offsetWidth;
  metric.classList.add("celebration-xp-pop");
}

function pulseStreak(detail) {
  if (!detail.streakIncrease) return;
  const streak = [...document.querySelectorAll(".journey-metrics span")].find((item) => /streak/i.test(item.textContent || ""));
  if (!streak) return;
  streak.classList.remove("celebration-pulse");
  void streak.offsetWidth;
  streak.classList.add("celebration-pulse");
}

function animateProgress() {
  const progress = document.querySelector(".gamification-track span");
  const levelProgress = document.querySelector(".player-level-progress span");
  [progress, levelProgress].filter(Boolean).forEach((bar) => {
    bar.classList.remove("celebration-progress-fill");
    void bar.offsetWidth;
    bar.classList.add("celebration-progress-fill");
  });
}

function createConfetti(intensity = "small") {
  if (REDUCED()) return;
  const count = intensity === "major" ? 34 : 20;
  const fragment = document.createDocumentFragment();
  const pieces = [];
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("i");
    piece.className = "celebration-confetti";
    piece.setAttribute("aria-hidden", "true");
    piece.style.left = `${45 + Math.random() * 10}vw`;
    piece.style.setProperty("--dx", `${(Math.random() - .5) * (intensity === "major" ? 70 : 48)}vw`);
    piece.style.setProperty("--dy", `${48 + Math.random() * 50}vh`);
    piece.style.setProperty("--rot", `${(Math.random() - .5) * 900}deg`);
    piece.style.animationDelay = `${Math.random() * 100}ms`;
    fragment.appendChild(piece);
    pieces.push(piece);
  }
  document.body.appendChild(fragment);
  const timer = window.setTimeout(() => pieces.forEach((piece) => piece.remove()), 1250);
  animationTimers.add(timer);
}

function closeOverlay({ restore = true } = {}) {
  if (!overlay) return;
  const current = overlay;
  overlay = null;
  document.removeEventListener("keydown", onOverlayKeydown, true);
  current.remove();
  if (restore && restoreFocus instanceof HTMLElement && document.contains(restoreFocus)) {
    restoreFocus.focus({ preventScroll: true });
  }
  restoreFocus = null;
}

function onOverlayKeydown(event) {
  if (!overlay) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeOverlay();
    return;
  }
  if (event.key !== "Tab") return;
  const focusables = [...overlay.querySelectorAll("button:not([disabled])")];
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function showCelebration({ type, title, message, icon, rewards = [], secondary = [], confetti = "none" }) {
  closeOverlay({ restore: false });
  restoreFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  overlay = document.createElement("div");
  overlay.className = "celebration-overlay";
  overlay.setAttribute("role", "presentation");
  overlay.innerHTML = `
    <section class="celebration-dialog" role="dialog" aria-modal="true" aria-labelledby="celebration-title" aria-describedby="celebration-message">
      <button class="celebration-dismiss" type="button" aria-label="Dismiss celebration">×</button>
      <div class="celebration-icon" aria-hidden="true">${icon}</div>
      <span class="celebration-eyebrow">${type}</span>
      <h2 id="celebration-title">${title}</h2>
      <p class="celebration-message" id="celebration-message">${message}</p>
      ${rewards.length ? `<div class="celebration-rewards">${rewards.map(([label, value]) => `<div class="celebration-reward"><span>${label}</span><strong>${value}</strong></div>`).join("")}</div>` : ""}
      ${secondary.length ? `<div class="celebration-secondary" aria-label="Additional rewards">${secondary.map((item) => `<div class="celebration-secondary-item">${item}</div>`).join("")}</div>` : ""}
      <button class="celebration-primary" type="button">Continue →</button>
    </section>`;
  document.body.appendChild(overlay);
  const dismiss = $(".celebration-dismiss", overlay);
  const primary = $(".celebration-primary", overlay);
  const dismissAll = () => closeOverlay();
  dismiss.addEventListener("click", dismissAll);
  primary.addEventListener("click", dismissAll);
  overlay.addEventListener("click", (event) => { if (event.target === overlay) closeOverlay(); });
  document.addEventListener("keydown", onOverlayKeydown, true);
  primary.focus({ preventScroll: true });
  if (confetti !== "none") createConfetti(confetti);
}

function enhanceMissionCompletion(detail) {
  const card = $(".mission-completion-card", $("#lesson-modal"));
  if (!card) return;
  const mark = $(".mission-completion-mark", card);
  if (mark) {
    mark.classList.remove("celebration-success-mark");
    void mark.offsetWidth;
    mark.classList.add("celebration-success-mark");
  }
  if (detail.xpGain) {
    const xp = $("#mission-completion-xp", card);
    if (xp) {
      xp.textContent = `+${detail.xpGain} XP`;
      xp.classList.add("celebration-xp-pop");
    }
  }
}

function celebrate(state, detail) {
  animateXp(detail);
  animateProgress();
  pulseStreak(detail);
  enhanceMissionCompletion(detail);

  const hasMajor = detail.levelUp || detail.completedLevels.length > 0;
  const milestoneItems = detail.achievements.map((id) => MILESTONE_COPY[id]?.[0] || id);
  const secondary = [];
  if (detail.xpGain && !hasMajor) secondary.push(`+${detail.xpGain} XP earned`);
  if (detail.streakIncrease) secondary.push(`🔥 ${state.streak} day streak`);
  if (detail.dailyGoal) secondary.push(`✓ Daily goal complete · ${state.dailyProgress.xp} / 100 XP`);
  milestoneItems.forEach((item) => secondary.push(`🏆 ${item} unlocked`));
  detail.unlockedLevels.forEach((level) => secondary.push(`New level unlocked · Level ${level}: ${levelTitle(level)}`));

  if (detail.levelUp) {
    showCelebration({
      type: "PLAYER LEVEL UP",
      title: `Level ${state.level}`,
      message: "You've reached a new player level. Keep going.",
      icon: "✦",
      rewards: [["XP earned", `+${detail.xpGain} XP`], ["Player level", `Level ${state.level}`]],
      secondary,
      confetti: "major",
    });
    return;
  }

  if (detail.completedLevels.length > 0) {
    const level = detail.completedLevels[detail.completedLevels.length - 1];
    showCelebration({
      type: "LEVEL COMPLETE",
      title: levelTitle(level),
      message: `${state.completedLessons.length} missions are now complete. The next chapter is ready when you are.`,
      icon: "✓",
      rewards: [["Chapter", `Level ${level}`], ["Streak", `🔥 ${state.streak} days`]],
      secondary,
      confetti: "major",
    });
    return;
  }

  if (detail.achievements.length > 0) {
    const [id] = detail.achievements;
    const [title, copy] = MILESTONE_COPY[id] || ["Milestone Unlocked", "You've reached a new milestone."];
    showCelebration({
      type: "MILESTONE UNLOCKED",
      title,
      message: copy,
      icon: "🏆",
      rewards: [["Milestone", title], ["Streak", `🔥 ${state.streak} days`]],
      secondary: secondary.filter((item) => !item.includes(title)),
      confetti: "small",
    });
    return;
  }

  if (detail.dailyGoal) {
    showCelebration({
      type: "DAILY GOAL",
      title: "Goal complete",
      message: "Nice work. You hit today's learning goal.",
      icon: "✓",
      rewards: [["Today", `${state.dailyProgress.xp} / 100 XP`], ["Streak", `🔥 ${state.streak} days`]],
      secondary,
      confetti: "small",
    });
  }
}

function onGamification(event) {
  const state = loadState();
  const detail = diff(previousState, state);
  previousState = structuredClone(state);
  if (!event.detail?.newlyCompleted || !detail.completedLessons.length) return;
  celebrate(state, detail);
}

function init() {
  ensureStyles();
  previousState = structuredClone(loadState());
  window.addEventListener("ailearn-gamification-updated", onGamification);
  window.addEventListener("beforeunload", () => animationTimers.forEach((timer) => clearTimeout(timer)), { once: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
