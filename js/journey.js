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
const esc = (value = "") => String(value).replace(/[&<>\"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const complete = (state, lesson) => state.completedLessons.includes(lesson.id);

function available(state, levelIndex, lessonIndex) {
  if (!isLevelUnlocked(state, levelIndex + 1)) return false;
  const lessons = LEVELS[levelIndex];
  const lesson = lessons[lessonIndex];
  if (!lesson || (lesson.type !== "final" && lesson.type !== "prompt-final")) return true;
  return lessons.slice(0, lessonIndex).every((item) => complete(state, item));
}

function currentMission(state) {
  for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex += 1) {
    for (let lessonIndex = 0; lessonIndex < LEVELS[levelIndex].length; lessonIndex += 1) {
      const lesson = LEVELS[levelIndex][lessonIndex];
      if (!complete(state, lesson) && available(state, levelIndex, lessonIndex)) {
        return { lesson, levelIndex, lessonIndex };
      }
    }
  }
  return null;
}

function progress(state, levelIndex) {
  const lessons = LEVELS[levelIndex];
  const completed = lessons.filter((lesson) => complete(state, lesson)).length;
  return { completed, total: lessons.length, percent: lessons.length ? Math.round((completed / lessons.length) * 100) : 0 };
}

function aggregate(state) {
  const lessons = LEVELS.flat();
  const completed = lessons.filter((lesson) => complete(state, lesson)).length;
  return { completed, total: lessons.length, percent: lessons.length ? Math.round((completed / lessons.length) * 100) : 0 };
}

function node(state, levelIndex, lessonIndex, isCurrent) {
  const lesson = LEVELS[levelIndex][lessonIndex];
  const done = complete(state, lesson);
  const open = available(state, levelIndex, lessonIndex);
  const status = done ? "Completed" : isCurrent ? "Current" : open ? "Available" : "Locked";
  const icon = done ? "✓" : isCurrent ? "●" : open ? "○" : "🔒";
  const action = done ? "Review" : isCurrent ? "Continue" : open ? "Start" : "Locked";
  return `<li class="journey-node journey-node--${status.toLowerCase()}"><button class="journey-node-button" type="button" data-journey-lesson="${esc(lesson.id)}" ${open ? "" : "disabled"} aria-label="${esc(`${action}: ${lesson.title}`)}"><span class="journey-node-icon" aria-hidden="true">${icon}</span><span class="journey-node-copy"><strong>${esc(lesson.title)}</strong><small>${action} · +${Number(lesson.xp) || 0} XP</small></span><span class="journey-node-state">${status}</span></button></li>`;
}

function levelCard(state, levelIndex, currentLevel) {
  const [title, description] = roadmapLevels[levelIndex] || [`Level ${levelIndex + 1}`, ""];
  const p = progress(state, levelIndex);
  const unlocked = isLevelUnlocked(state, levelIndex + 1);
  const done = p.completed === p.total;
  const kind = levelIndex === currentLevel ? "current" : done ? "completed" : unlocked ? "available" : "locked";
  return `<article class="journey-level-card journey-level-card--${kind}"><span class="journey-level-icon" aria-hidden="true">${done ? "✓" : unlocked ? "→" : "🔒"}</span><div class="journey-level-copy"><span>LEVEL ${levelIndex + 1}</span><strong>${esc(title)}</strong><small>${esc(description)}</small></div><div class="journey-level-progress"><strong>${p.completed}/${p.total}</strong><small>${kind === "locked" ? "Locked" : `${p.percent}%`}</small></div></article>`;
}

function render() {
  const mount = $("#learning-journey");
  if (!mount) return;
  const state = loadState();
  const current = currentMission(state);
  const total = aggregate(state);
  const currentLevel = current ? current.levelIndex : LEVELS.length - 1;
  const levelProgress = progress(state, currentLevel);
  const meta = roadmapLevels[currentLevel] || [`Level ${currentLevel + 1}`, ""];

  if (!current) {
    mount.innerHTML = `<section class="journey-complete"><span class="journey-kicker">JOURNEY COMPLETE</span><h1>You cleared every available mission.</h1><p>${total.completed} / ${total.total} missions completed · ${state.xp.toLocaleString()} XP earned.</p></section>`;
    return;
  }

  const finalMission = current.lesson.type === "final" || current.lesson.type === "prompt-final";
  const nearbyStart = Math.max(0, currentLevel - 1);
  const nearbyEnd = Math.min(LEVELS.length, currentLevel + 2);
  const nearby = Array.from({ length: nearbyEnd - nearbyStart }, (_, i) => levelCard(state, nearbyStart + i, currentLevel)).join("");
  const all = LEVELS.map((_, i) => levelCard(state, i, currentLevel)).join("");

  mount.innerHTML = `
    <section class="journey-status" aria-label="Learning progress"><div><span class="journey-kicker">YOUR JOURNEY</span><h1>Keep going.</h1><p>Level ${currentLevel + 1} · ${esc(meta[0])}</p></div><div class="journey-metrics"><span><strong>${state.xp.toLocaleString()}</strong> XP</span><span><strong>${state.streak}</strong> day streak</span><span><strong>${total.percent}%</strong> overall</span></div></section>
    <section class="current-mission" aria-labelledby="current-mission-title"><div class="current-mission-main"><div class="current-mission-meta"><span>CONTINUE LEARNING</span><span>LEVEL ${currentLevel + 1} · MISSION ${current.lessonIndex + 1} OF ${levelProgress.total}</span></div><div class="current-mission-heading"><div><span>${esc(meta[0])}</span><h2 id="current-mission-title">${esc(current.lesson.title)}</h2></div><strong>+${Number(current.lesson.xp) || 0} XP</strong></div><p>${esc(current.lesson.description)}</p><div class="current-mission-progress"><div><span>Level progress</span><strong>${levelProgress.completed} / ${levelProgress.total}</strong></div><div class="journey-progress-track"><span style="width:${levelProgress.percent}%"></span></div></div><button class="journey-primary-action" type="button" data-journey-lesson="${esc(current.lesson.id)}">${finalMission ? "Continue to Final Boss" : levelProgress.completed ? "Continue Mission" : "Start First Mission"}<span aria-hidden="true">→</span></button></div><aside class="current-mission-side"><b>${String(current.lessonIndex + 1).padStart(2, "0")}</b><span>${esc(current.lesson.difficulty || "Mission")}</span><small>${finalMission ? "Final challenge" : "Next step"}</small></aside></section>
    <section class="current-level" aria-labelledby="current-level-title"><div class="journey-heading"><div><span class="journey-kicker">CURRENT LEVEL</span><h2 id="current-level-title">${esc(meta[0])}</h2><p>${esc(meta[1])}</p></div><strong>${levelProgress.completed} / ${levelProgress.total}</strong></div><div class="journey-path"><ol>${LEVELS[currentLevel].map((_, i) => node(state, currentLevel, i, i === current.lessonIndex)).join("")}</ol></div></section>
    <section class="nearby-levels"><div class="journey-heading"><div><span class="journey-kicker">YOUR JOURNEY</span><h2>Nearby levels</h2></div></div><div class="journey-level-grid">${nearby}</div><details class="journey-explorer"><summary><span>Explore full journey</span><small>${total.completed}/${total.total} missions completed</small></summary><div class="journey-level-grid journey-level-grid--all">${all}</div></details></section>`;

  document.querySelectorAll("[data-journey-lesson]").forEach((button) => button.addEventListener("click", () => openLesson(button.dataset.journeyLesson)));
}

function openLesson(id, attempt = 0) {
  const button = [...document.querySelectorAll(".lesson-button")].find((item) => Object.values(item.dataset).includes(id));
  if (button && !button.disabled) return button.click();
  if (attempt < 20) setTimeout(() => openLesson(id, attempt + 1), 100);
}

function addStyles() {
  if ($("#journey-styles")) return;
  const style = document.createElement("style");
  style.id = "journey-styles";
  style.textContent = `
    body.journey-mode .hero,body.journey-mode .stats-grid,body.journey-mode #roadmap,body.journey-mode .lessons-section{display:none!important}
    body.journey-mode main{max-width:1180px;margin:0 auto;padding:0 24px}#learning-journey{display:grid;gap:18px;padding:28px 0 40px}
    .journey-status{display:flex;justify-content:space-between;align-items:end;gap:20px}.journey-kicker{display:block;font:700 .64rem 'DM Mono',monospace;letter-spacing:.14em;color:var(--accent)}.journey-status h1{margin:.3rem 0;font-size:clamp(2rem,4vw,3rem);letter-spacing:-.05em}.journey-status p{margin:0;color:var(--muted)}.journey-metrics{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.journey-metrics span{padding:8px 11px;border:1px solid var(--border);border-radius:999px;background:var(--surface);font-size:.72rem;color:var(--muted)}.journey-metrics strong{color:var(--text)}
    .current-mission{display:grid;grid-template-columns:1fr 125px;overflow:hidden;border:1px solid #e0c9ba;border-radius:22px;background:linear-gradient(135deg,#fffaf6,#fffdf9);box-shadow:0 14px 34px rgba(53,45,35,.07)}.current-mission-main{padding:28px 30px}.current-mission-meta,.current-mission-heading{display:flex;justify-content:space-between;gap:14px}.current-mission-meta{font:700 .63rem 'DM Mono',monospace;letter-spacing:.1em;color:var(--accent)}.current-mission-heading{margin-top:16px;align-items:flex-start}.current-mission-heading>div>span{font-size:.78rem;color:var(--muted)}.current-mission h2{margin:.3rem 0 0;font-size:clamp(1.5rem,3vw,2.3rem);line-height:1.08;letter-spacing:-.045em}.current-mission-heading>strong{padding:7px 10px;border:1px solid #e3c7a8;border-radius:999px;background:#fff7e9;color:#8c622f;font-size:.78rem;white-space:nowrap}.current-mission-main>p{max-width:700px;color:var(--muted);line-height:1.6;margin:12px 0 20px}.current-mission-progress{max-width:700px;margin-bottom:20px}.current-mission-progress>div:first-child{display:flex;justify-content:space-between;font-size:.7rem;color:var(--muted);margin-bottom:6px}.current-mission-progress strong{color:var(--text)}.journey-progress-track{height:8px;border-radius:999px;background:#eee6dc;overflow:hidden}.journey-progress-track span{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent-2));border-radius:inherit;transition:width .3s ease}.journey-primary-action{display:inline-flex;align-items:center;gap:10px;padding:12px 16px;border:0;border-radius:11px;background:var(--accent);color:#fff;font:700 .86rem inherit;cursor:pointer}.journey-primary-action:hover{background:#b95837}.current-mission-side{display:grid;place-content:center;justify-items:center;gap:5px;background:#f8eee6;border-left:1px solid #eadbd0;text-align:center;color:var(--muted)}.current-mission-side b{font-size:3.2rem;line-height:1;color:#c8643f;letter-spacing:-.08em}.current-mission-side span{font:700 .62rem 'DM Mono',monospace;text-transform:uppercase}.current-mission-side small{font-size:.7rem}
    .current-level,.nearby-levels{padding:23px;border:1px solid var(--border);border-radius:19px;background:var(--surface);box-shadow:0 6px 20px rgba(53,45,35,.04)}.journey-heading{display:flex;justify-content:space-between;align-items:end;gap:18px;margin-bottom:18px}.journey-heading h2{margin:.3rem 0 .2rem;font-size:1.45rem;letter-spacing:-.035em}.journey-heading p{margin:0;color:var(--muted);font-size:.82rem;line-height:1.5}.journey-heading>strong{white-space:nowrap;font-size:.8rem}.journey-path{max-width:780px;margin:auto;position:relative}.journey-path:before{content:"";position:absolute;top:20px;bottom:20px;left:50%;width:2px;background:#e5d7ca;z-index:0}.journey-path ol{display:grid;gap:9px;list-style:none;padding:0;margin:0}.journey-node{position:relative;z-index:1;display:flex;justify-content:center}.journey-node:nth-child(odd){transform:translateX(-12%)}.journey-node:nth-child(even){transform:translateX(12%)}.journey-node-button{width:min(100%,430px);display:grid;grid-template-columns:40px 1fr auto;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:15px;background:var(--surface);font:inherit;text-align:left;cursor:pointer;transition:.18s ease;box-shadow:0 4px 12px rgba(53,45,35,.035)}.journey-node-button:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 9px 18px rgba(53,45,35,.07)}.journey-node-button:focus-visible,.journey-primary-action:focus-visible,.journey-explorer summary:focus-visible{outline:3px solid rgba(154,107,47,.28);outline-offset:3px}.journey-node-icon{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#eee8df;color:var(--muted);font-weight:800}.journey-node-copy{display:grid;gap:2px;min-width:0}.journey-node-copy strong{font-size:.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.journey-node-copy small{font-size:.68rem;color:var(--muted)}.journey-node-state{font:700 .58rem 'DM Mono',monospace;color:var(--muted);text-transform:uppercase}.journey-node--current .journey-node-button{border-color:#d99f83;background:#fff8f2;box-shadow:0 9px 20px rgba(200,100,63,.12)}.journey-node--current .journey-node-icon{background:#f5d9cb;color:#a85031}.journey-node--completed .journey-node-button{background:#f8fbf9;border-color:#d5e4da}.journey-node--completed .journey-node-icon{background:#e0efe5;color:var(--success)}.journey-node--locked .journey-node-button{opacity:.55;cursor:not-allowed;background:#f7f4ef}
    .journey-level-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.journey-level-card{display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:9px;padding:11px;border:1px solid var(--border);border-radius:14px;background:var(--surface-2);min-width:0}.journey-level-card--current{border-color:#d7ad97;background:#fff8f3}.journey-level-card--completed{border-color:#cfdfd4;background:#f7fbf8}.journey-level-card--locked{opacity:.6}.journey-level-icon{width:32px;height:32px;display:grid;place-items:center;border-radius:50%;background:#eee8df;font-size:.75rem}.journey-level-card--current .journey-level-icon{background:#f4d9cb;color:#a85031}.journey-level-card--completed .journey-level-icon{background:#dfeee4;color:var(--success)}.journey-level-copy{min-width:0;display:grid;gap:2px}.journey-level-copy span{font:700 .55rem 'DM Mono',monospace;color:var(--muted)}.journey-level-copy strong,.journey-level-copy small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.journey-level-copy strong{font-size:.76rem}.journey-level-copy small{font-size:.65rem;color:var(--muted)}.journey-level-progress{display:grid;justify-items:end}.journey-level-progress strong{font-size:.7rem}.journey-level-progress small{font-size:.6rem;color:var(--muted)}.journey-explorer{margin-top:10px;border-top:1px solid var(--border);padding-top:9px}.journey-explorer summary{display:flex;justify-content:space-between;gap:10px;cursor:pointer;padding:8px 2px;font-weight:800;list-style:none}.journey-explorer summary::-webkit-details-marker{display:none}.journey-explorer summary small{color:var(--muted);font-weight:500;margin-left:auto}.journey-level-grid--all{margin-top:10px;grid-template-columns:repeat(2,minmax(0,1fr))}.journey-complete{padding:45px 25px;text-align:center;border:1px solid #d9c8bb;border-radius:22px;background:#fffaf5}.journey-complete h1{margin:.4rem 0 .5rem;letter-spacing:-.045em}.journey-complete p{margin:0;color:var(--muted)}
    @media(prefers-reduced-motion:reduce){.journey-node-button,.journey-progress-track span{transition:none}.journey-node-button:hover:not(:disabled){transform:none}}
    @media(max-width:760px){body.journey-mode main{padding:0 16px}.journey-status{align-items:flex-start;flex-direction:column}.journey-metrics{justify-content:flex-start}.current-mission{grid-template-columns:1fr}.current-mission-side{grid-row:1;grid-template-columns:auto 1fr auto;justify-items:start;place-content:initial;padding:12px 17px;border-left:0;border-bottom:1px solid #eadbd0;text-align:left}.current-mission-side b{font-size:2rem}.current-mission-main{padding:21px}.current-mission-meta,.current-mission-heading{flex-direction:column;align-items:flex-start}.current-mission h2{font-size:1.7rem}.journey-level-grid,.journey-level-grid--all{grid-template-columns:1fr}.journey-path:before{left:18px}.journey-node:nth-child(odd),.journey-node:nth-child(even){transform:none;justify-content:flex-start}.journey-node-button{grid-template-columns:36px 1fr;width:100%}.journey-node-state{display:none}.journey-node-copy strong{white-space:normal}.journey-heading{align-items:flex-start}.journey-heading>strong{margin-top:4px}}
  `;
  document.head.appendChild(style);
}

function initJourney() {
  document.body.classList.add("journey-mode");
  addStyles();
  const main = $("main");
  if (!main) return;
  let mount = $("#learning-journey");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "learning-journey";
    main.insertBefore(mount, main.firstElementChild);
  }
  render();
  window.addEventListener("ailearn-state-updated", render);
}

setTimeout(initJourney, 0);
