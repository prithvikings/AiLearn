import { foundationLessons, llmLessons, promptLessons, finalChallenge } from "./curriculum.js";
import { phase4Lessons } from "./phase4.js";
import { phase5Lessons } from "./phase5.js";
import { phase6Lessons } from "./phase6.js";
import { phase7Lessons } from "./phase7.js";
import { phase8Lessons } from "./phase8.js";
import { phase9Lessons } from "./phase9.js";
import { phase10Lessons } from "./phase10.js";
import { phase11Lessons } from "./phase11.js";
import { phase12Lessons } from "./phase12.js";
import { loadState, isLevelUnlocked } from "./state.js";
import { roadmapLevels } from "./phase5-roadmap.js";

const LEVELS = [
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

const $ = (selector, root = document) => root.querySelector(selector);
const esc = (value = "") =>
  String(value).replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);

function lessonIsComplete(state, lesson) {
  return state.completedLessons.includes(lesson.id);
}

function lessonIsAvailable(state, levelIndex, lessonIndex) {
  if (!isLevelUnlocked(state, levelIndex + 1)) return false;
  const lessons = LEVELS[levelIndex];
  const lesson = lessons[lessonIndex];
  if (!lesson) return false;
  if (lesson.type !== "final" && lesson.type !== "prompt-final") return true;
  return lessons
    .slice(0, lessonIndex)
    .every((item) => lessonIsComplete(state, item));
}

function findCurrentMission(state) {
  for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex += 1) {
    const lessons = LEVELS[levelIndex];
    for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex += 1) {
      const lesson = lessons[lessonIndex];
      if (!lessonIsComplete(state, lesson) && lessonIsAvailable(state, levelIndex, lessonIndex)) {
        return { lesson, levelIndex, lessonIndex };
      }
    }
  }
  return null;
}

function levelProgress(state, levelIndex) {
  const lessons = LEVELS[levelIndex];
  const completed = lessons.filter((lesson) => lessonIsComplete(state, lesson)).length;
  return { completed, total: lessons.length, percent: lessons.length ? Math.round((completed / lessons.length) * 100) : 0 };
}

function aggregateProgress(state) {
  const lessons = LEVELS.flat();
  const completed = lessons.filter((lesson) => lessonIsComplete(state)).length;
  const totalXp = lessons.reduce((sum, lesson) => sum + (Number(lesson.xp) || 0), 0);
  return {
    completed,
    total: lessons.length,
    percent: lessons.length ? Math.round((completed / lessons.length) * 100) : 0,
    totalXp,
  };
}

function stateLabel(state, levelIndex, lessonIndex, current) {
  const lesson = LEVELS[levelIndex][lessonIndex];
  if (lessonIsComplete(state, lesson)) return "Completed";
  if (current) return "Current";
  if (lessonIsAvailable(state, levelIndex, lessonIndex)) return "Available";
  return "Locked";
}

function lessonNode(state, levelIndex, lessonIndex, current) {
  const lesson = LEVELS[levelIndex][lessonIndex];
  const status = stateLabel(state, levelIndex, lessonIndex, current);
  const completed = status === "Completed";
  const available = status !== "Locked";
  const final = lesson.type === "final" || lesson.type === "prompt-final";
  const icon = completed ? "✓" : status === "Current" ? "●" : status === "Available" ? "○" : "🔒";
  const action = completed ? "Review" : status === "Current" ? "Continue" : status === "Available" ? "Start" : "Locked";

  return `<li class="journey-node journey-node--${status.toLowerCase()} ${final ? "journey-node--final" : ""}">
    <button class="journey-node-button" type="button" data-journey-lesson="${esc(lesson.id)}" ${available ? "" : "disabled"} aria-label="${esc(`${action}: ${lesson.title}`)}">
      <span class="journey-node-icon" aria-hidden="true">${icon}</span>
      <span class="journey-node-copy"><strong>${esc(lesson.title)}</strong><small>${esc(action)} · +${Number(lesson.xp) || 0} XP</small></span>
      <span class="journey-node-state">${esc(status)}</span>
    </button>
  </li>`;
}

function levelOverview(state, levelIndex, currentLevelIndex) {
  const [title, description] = roadmapLevels[levelIndex] || [`Level ${levelIndex + 1}`, ""];
  const progress = levelProgress(state, levelIndex);
  const unlocked = isLevelUnlocked(state, levelIndex + 1);
  const completed = progress.total > 0 && progress.completed === progress.total;
  const relation = levelIndex === currentLevelIndex ? "current" : completed ? "completed" : unlocked ? "available" : "locked";
  const icon = completed ? "✓" : unlocked ? "→" : "🔒";
  return `<article class="journey-level-card journey-level-card--${relation}">
    <div class="journey-level-icon" aria-hidden="true">${icon}</div>
    <div class="journey-level-copy">
      <span>LEVEL ${levelIndex + 1}</span>
      <strong>${esc(title)}</strong>
      <small>${esc(description)}</small>
    </div>
    <div class="journey-level-progress"><strong>${progress.completed}/${progress.total}</strong><span>${relation === "locked" ? "Locked" : `${progress.percent}%`}</span></div>
  </article>`;
}

function render() {
  const mount = $("#learning-journey");
  if (!mount) return;
  const state = loadState();
  const current = findCurrentMission(state);
  const aggregate = aggregateProgress(state);
  const currentLevelIndex = current ? current.levelIndex : LEVELS.length - 1;
  const currentLevel = current ? levelProgress(state, current.levelIndex) : levelProgress(state, LEVELS.length - 1);
  const currentLevelMeta = roadmapLevels[currentLevelIndex] || [`Level ${currentLevelIndex + 1}`, ""];

  if (!current) {
    mount.innerHTML = `
      <section class="journey-complete" aria-labelledby="journey-complete-title">
        <span class="journey-kicker">JOURNEY COMPLETE</span>
        <h1 id="journey-complete-title">You cleared every available mission.</h1>
        <p>${aggregate.completed} / ${aggregate.total} missions completed · ${aggregate.totalXp.toLocaleString()} XP available across the curriculum.</p>
        <div class="journey-complete-actions"><a class="journey-secondary-action" href="#achievements">Review achievements</a></div>
      </section>`;
    return;
  }

  const missionNumber = current.lessonIndex + 1;
  const finalMission = current.lesson.type === "final" || current.lesson.type === "prompt-final";
  const nearbyStart = Math.max(0, current.levelIndex - 1);
  const nearbyEnd = Math.min(LEVELS.length, current.levelIndex + 2);
  const nearbyLevels = Array.from({ length: nearbyEnd - nearbyStart }, (_, offset) => nearbyStart + offset)
    .map((index) => levelOverview(state, index, currentLevelIndex)).join("");
  const allLevels = LEVELS.map((_, index) => levelOverview(state, index, currentLevelIndex)).join("");

  mount.innerHTML = `
    <section class="journey-status" aria-label="Learning progress">
      <div>
        <span class="journey-kicker">YOUR JOURNEY</span>
        <h1>Keep going.</h1>
        <p>Level ${currentLevelIndex + 1} · ${esc(currentLevelMeta[0])}</p>
      </div>
      <div class="journey-status-metrics">
        <span><strong>${state.xp.toLocaleString()}</strong> XP</span>
        <span><strong>${state.streak}</strong> day streak</span>
        <span><strong>${aggregate.percent}%</strong> overall</span>
      </div>
    </section>

    <section class="current-mission" aria-labelledby="current-mission-title">
      <div class="current-mission-main">
        <div class="current-mission-meta"><span>CONTINUE LEARNING</span><span>LEVEL ${current.levelIndex + 1} · MISSION ${missionNumber} OF ${currentLevel.total}</span></div>
        <div class="current-mission-heading">
          <div><span class="current-mission-level">${esc(currentLevelMeta[0])}</span><h2 id="current-mission-title">${esc(current.lesson.title)}</h2></div>
          <span class="current-mission-xp">+${Number(current.lesson.xp) || 0} XP</span>
        </div>
        <p class="current-mission-description">${esc(current.lesson.description)}</p>
        <div class="current-mission-progress" aria-label="Current level progress">
          <div><span>Level progress</span><strong>${currentLevel.completed} / ${currentLevel.total}</strong></div>
          <div class="journey-progress-track"><span style="width:${currentLevel.percent}%"></span></div>
        </div>
        <button class="journey-primary-action" type="button" data-journey-lesson="${esc(current.lesson.id)}">${finalMission ? "Continue to Final Boss" : currentLevel.completed > 0 ? "Continue Mission" : "Start First Mission"}<span aria-hidden="true">→</span></button>
      </div>
      <aside class="current-mission-side" aria-label="Next mission details">
        <span class="mission-side-number">${String(missionNumber).padStart(2, "0")}</span>
        <span>${esc(current.lesson.difficulty || "Mission")}</span>
        <small>${finalMission ? "Final challenge" : "Next step"}</small>
      </aside>
    </section>

    <section class="current-level" aria-labelledby="current-level-title">
      <div class="journey-section-heading">
        <div><span class="journey-kicker">CURRENT LEVEL</span><h2 id="current-level-title">${esc(currentLevelMeta[0])}</h2><p>${esc(currentLevelMeta[1])}</p></div>
        <strong>${currentLevel.completed} / ${currentLevel.total}</strong>
      </div>
      <div class="journey-path" aria-label="Mission path">
        <ol>${LEVELS[current.levelIndex].map((_, index) => lessonNode(state, current.levelIndex, index, index === current.lessonIndex)).join("")}</ol>
      </div>
    </section>

    <section class="nearby-levels" aria-labelledby="nearby-levels-title">
      <div class="journey-section-heading compact"><div><span class="journey-kicker">YOUR JOURNEY</span><h2 id="nearby-levels-title">Nearby levels</h2></div></div>
      <div class="journey-level-grid">${nearbyLevels}</div>
      <details class="journey-explorer">
        <summary><span>Explore full journey</span><small>${aggregate.completed}/${aggregate.total} missions completed</small></summary>
        <div class="journey-level-grid journey-level-grid--all">${allLevels}</div>
      </details>
    </section>`;

  bindJourneyActions();
}

function findLessonButton(id) {
  return [...document.querySelectorAll(".lesson-button")].find((button) => Object.values(button.dataset).includes(id));
}

function openLesson(id, attempts = 0) {
  const button = findLessonButton(id);
  if (button && !button.disabled) {
    button.click();
    return;
  }
  if (attempts < 20) setTimeout(() => openLesson(id, attempts + 1), 100);
}

function bindJourneyActions() {
  document.querySelectorAll("[data-journey-lesson]").forEach((button) => {
    button.addEventListener("click", () => openLesson(button.dataset.journeyLesson));
  });
}

function injectJourneyStyles() {
  if $("#journey-styles")) return;
  const style = document.createElement("style");
  style.id = "journey-styles";
  style.textContent = `
    body.journey-mode .hero,body.journey-mode .stats-grid,body.journey-mode #roadmap,body.journey-mode .lessons-section{display:none!important}
    body.journey-mode main{max-width:1180px;margin:0 auto;padding:0 24px}
    #learning-journey{display:grid;gap:18px;padding:30px 0 42px}
    .journey-kicker{display:block;font:700 .66rem/1.2 'DM Mono',monospace;letter-spacing:.14em;color:var(--accent);text-transform:uppercase}
    .journey-status{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:6px 0 2px}
    .journey-status h1{margin:.28rem 0 .15rem;font-size:clamp(2rem,4vw,3rem);letter-spacing:-.05em;line-height:1}
    .journey-status p{margin:0;color:var(--muted)}
    .journey-status-metrics{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}
    .journey-status-metrics span{padding:9px 12px;border:1px solid var(--border);border-radius:999px;background:var(--surface);font-size:.75rem;color:var(--muted)}
    .journey-status-metrics strong{color:var(--text)}
    .current-mission{display:grid;grid-template-columns:1fr 130px;overflow:hidden;border:1px solid #e0c9ba;border-radius:24px;background:linear-gradient(135deg,#fffaf6,#fffdf9);box-shadow:0 16px 38px rgba(53,45,35,.07)}
    .current-mission-main{padding:30px 32px}
    .current-mission-meta,.current-mission-heading{display:flex;align-items:center;justify-content:space-between;gap:16px}
    .current-mission-meta{font:700 .66rem/1.2 'DM Mono',monospace;letter-spacing:.12em;color:var(--accent);text-transform:uppercase}
    .current-mission-heading{margin-top:18px;align-items:flex-start}
    .current-mission-level{font-size:.8rem;color:var(--muted)}
    .current-mission h2{margin:.35rem 0 0;max-width:760px;font-size:clamp(1.55rem,3vw,2.4rem);line-height:1.08;letter-spacing:-.045em}
    .current-mission-xp{flex:none;padding:8px 11px;border:1px solid #e3c7a8;border-radius:999px;background:#fff7e9;color:#8c622f;font-weight:800;font-size:.8rem}
    .current-mission-description{max-width:720px;margin:13px 0 22px;color:var(--muted);line-height:1.65}
    .current-mission-progress{max-width:720px;display:grid;gap:7px;margin-bottom:22px}
    .current-mission-progress>div:first-child{display:flex;justify-content:space-between;gap:10px;font-size:.72rem;color:var(--muted)}
    .current-mission-progress strong{color:var(--text)}
    .journey-progress-track{height:8px;overflow:hidden;border-radius:999px;background:#eee6dc}
    .journey-progress-track span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--accent),var(--accent-2));transition:width .35s ease}
    .journey-primary-action,.journey-secondary-action{display:inline-flex;align-items:center;justify-content:center;gap:12px;border:0;border-radius:12px;font:700 .88rem/1 inherit;cursor:pointer;text-decoration:none}
    .journey-primary-action{padding:12px 16px;background:var(--accent);color:#fff;box-shadow:0 7px 18px rgba(200,100,63,.18)}
    .journey-primary-action:hover{background:#b95837}
    .journey-primary-action span{font-size:1.05rem}
    .current-mission-side{display:grid;align-content:center;justify-items:center;gap:6px;padding:24px 16px;border-left:1px solid #eadbd0;background:#f8eee6;color:#9b6848;text-align:center}
    .mission-side-number{font-size:3.4rem;font-weight:800;letter-spacing:-.08em;color:#c8643f;line-height:1}
    .current-mission-side>span:not(.mission-side-number){font:700 .65rem/1.2 'DM Mono',monospace;letter-spacing:.1em;text-transform:uppercase}
    .current-mission-side small{color:var(--muted)}
    .current-level,.nearby-levels{padding:24px;border:1px solid var(--border);border-radius:20px;background:var(--surface);box-shadow:0 7px 22px rgba(53,45,35,.04)}
    .journey-section-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;margin-bottom:20px}
    .journey-section-heading h2{margin:.28rem 0 .2rem;font-size:1.5rem;letter-spacing:-.035em}
    .journey-section-heading p{margin:0;max-width:680px;color:var(--muted);font-size:.85rem;line-height:1.55}
    .journey-section-heading>strong{font-size:.85rem;white-space:nowrap}
    .journey-section-heading.compact{margin-bottom:12px}
    .journey-path{position:relative;max-width:780px;margin:0 auto;padding:4px 0}
    .journey-path:before{content:"";position:absolute;top:20px;bottom:20px;left:50%;width:2px;background:#e5d7ca;transform:translateX(-50%);z-index:0}
    .journey-path ol{display:grid;gap:10px;list-style:none;margin:0;padding:0}
    .journey-node{position:relative;z-index:1;display:flex;justify-content:center}
    .journey-node:nth-child(even){transform:translateX(13%)}
    .journey-node:nth-child(odd){transform:translateX(-13%)}
    .journey-node-button{width:min(100%,430px);display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:12px;padding:10px 13px;border:1px solid var(--border);border-radius:16px;background:var(--surface);font:inherit;text-align:left;cursor:pointer;box-shadow:0 4px 12px rgba(53,45,35,.035);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease,background .18s ease}
    .journey-node-button:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 20px rgba(53,45,35,.07)}
    .journey-node-button:focus-visible,.journey-primary-action:focus-visible,.journey-explorer summary:focus-visible{outline:3px solid rgba(154,107,47,.28);outline-offset:3px}
    .journey-node-icon{width:38px;height:38px;display:grid;place-items:center;border-radius:50%;background:#eee8df;color:var(--muted);font-weight:800}
    .journey-node-copy{display:grid;gap:2px;min-width:0}.journey-node-copy strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.82rem}.journey-node-copy small{color:var(--muted);font-size:.7rem}
    .journey-node-state{font:700 .62rem/1 'DM Mono',monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
    .journey-node--current .journey-node-button{border-color:#d99f83;background:#fff8f2;box-shadow:0 9px 22px rgba(200,100,63,.12)}
    .journey-node--current .journey-node-icon{background:#f5d9cb;color:#a85031}.journey-node--completed .journey-node-icon{background:#e0efe5;color:var(--success)}
    .journey-node--completed .journey-node-button{background:#f8fbf9;border-color:#d5e4da}.journey-node--locked .journey-node-button{cursor:not-allowed;opacity:.55;background:#f7f4ef}.journey-node--locked .journey-node-icon{font-size:.8rem}.journey-node--final .journey-node-button{border-style:dashed}
    .journey-level-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
    .journey-level-card{display:grid;grid-template-columns:36px 1fr auto;align-items:center;gap:10px;min-width:0;padding:12px;border:1px solid var(--border);border-radius:15px;background:var(--surface-2);transition:border-color .18s ease,transform .18s ease}
    .journey-level-card--current{border-color:#d7ad97;background:#fff8f3}.journey-level-card--completed{border-color:#cfdfd4;background:#f7fbf8}.journey-level-card--locked{opacity:.62}
    .journey-level-icon{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:#eee8df;font-size:.8rem}.journey-level-card--current .journey-level-icon{background:#f4d9cb;color:#a85031}.journey-level-card--completed .journey-level-icon{background:#dfeee4;color:var(--success)}
    .journey-level-copy{min-width:0;display:grid;gap:2px}.journey-level-copy span{font:700 .57rem/1 'DM Mono',monospace;letter-spacing:.1em;color:var(--muted)}.journey-level-copy strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.78rem}.journey-level-copy small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:.68rem}
    .journey-level-progress{display:grid;justify-items:end;gap:2px}.journey-level-progress strong{font-size:.74rem}.journey-level-progress span{font-size:.62rem;color:var(--muted)}
    .journey-explorer{margin-top:10px;border-top:1px solid var(--border);padding-top:10px}.journey-explorer summary{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 2px;cursor:pointer;font-weight:800;list-style:none}.journey-explorer summary::-webkit-details-marker{display:none}.journey-explorer summary:after{content:"↓";color:var(--muted)}.journey-explorer[open] summary:after{content:"↑"}.journey-explorer summary small{margin-left:auto;color:var(--muted);font-weight:500}.journey-level-grid--all{margin-top:12px;grid-template-columns:repeat(2,minmax(0,1fr))}
    .journey-complete{padding:48px 32px;border:1px solid #d9c8bb;border-radius:24px;background:linear-gradient(135deg,#fff8f1,#fffdf9);text-align:center}.journey-complete h1{margin:.45rem 0 .6rem;font-size:clamp(1.8rem,4vw,2.6rem);letter-spacing:-.05em}.journey-complete p{margin:0;color:var(--muted)}.journey-complete-actions{margin-top:20px}.journey-secondary-action{padding:10px 14px;background:#f5eee6;color:var(--text)}
    body.journey-mode .achievement-section{padding-top:12px}.achievement-section .section-heading h2{font-size:1.25rem}.achievement-section .section-heading p{font-size:.75rem}
    @media (prefers-reduced-motion:reduce){.journey-node-button,.journey-level-card,.journey-progress-track span{transition:none!important}.journey-node-button:hover:not(:disabled),.journey-level-card:hover{transform:none}}
    @media (max-width:760px){body.journey-mode main{padding:0 16px}.journey-status{align-items:flex-start;flex-direction:column}.journey-status h1{font-size:2rem}.journey-status-metrics{justify-content:flex-start}.current-mission{grid-template-columns:1fr}.current-mission-side{grid-row:1;border-left:0;border-bottom:1px solid #eadbd0;grid-template-columns:auto 1fr auto;justify-items:start;padding:13px 18px;text-align:left}.mission-side-number{font-size:2rem}.current-mission-main{padding:22px}.current-mission-meta,.current-mission-heading{align-items:flex-start;flex-direction:column}.current-mission h2{font-size:1.7rem}.journey-level-grid,.journey-level-grid--all{grid-template-columns:1fr}.journey-path:before{left:20px}.journey-node:nth-child(even),.journey-node:nth-child(odd){transform:none;justify-content:flex-start;padding-left:0}.journey-node-button{grid-template-columns:38px 1fr auto;width:calc(100% - 4px)}.journey-node-copy strong{white-space:normal}.journey-node-state{display:none}}
    @media (max-width:480px){#learning-journey{padding-top:20px}.journey-status-metrics{display:grid;grid-template-columns:1fr 1fr;width:100%}.journey-status-metrics span:last-child{grid-column:1/-1}.current-level,.nearby-levels{padding:18px}.journey-node-button{grid-template-columns:36px 1fr}.journey-node-icon{width:34px;height:34px}.journey-node-state{display:none}.current-mission-xp{align-self:flex-start}}
  `;
  document.head.appendChild(style);
}

function initJourney() {
  if (!document.body) return;
  document.body.classList.add("journey-mode");
  injectJourneyStyles();
  const main = $("main");
  if (!main) return;
  let mount = $("#learning-journey");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "learning-journey";
    mount.setAttribute("aria-label", "AI Learn learning journey");
    main.insertBefore(mount, main.firstElementChild);
  }
  render();
  window.addEventListener("ailearn-state-updated", render);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => setTimeout(initJourney, 0), { once: true });
} else {
  setTimeout(initJourney, 0);
}
