import { loadState, isLevelUnlocked } from "./state.js";
import { curriculumLevels, getCurrentMission, getMissionProgress } from "./progression.js";
import "./mission-experience.js";

const LEVELS = curriculumLevels;
const $ = (selector, root = document) => root.querySelector(selector);
const esc = (value = "") => String(value).replace(/[&<>\"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const complete = (state, lesson) => state.completedLessons.includes(lesson.id);
const isFinal = (lesson) => lesson.type === "final" || lesson.type === "prompt-final";

function available(state, levelId, lessonIndex) {
  if (!isLevelUnlocked(state, levelId)) return false;
  const lessons = LEVELS[levelId - 1]?.lessons || [];
  const lesson = lessons[lessonIndex];
  if (!lesson || !isFinal(lesson)) return true;
  return lessons.slice(0, lessonIndex).every((item) => complete(state, item));
}

function currentMissionView(state) {
  const current = getCurrentMission(state);
  if (!current) return null;
  for (let levelIndex = 0; levelIndex < LEVELS.length; levelIndex += 1) {
    const lessonIndex = LEVELS[levelIndex].lessons.findIndex((lesson) => lesson.id === current.id);
    if (lessonIndex >= 0) return { lesson: current, levelIndex, lessonIndex };
  }
  return null;
}

function node(state, level, lessonIndex, currentIndex) {
  const lesson = level.lessons[lessonIndex];
  const done = complete(state, lesson);
  const open = available(state, level.id, lessonIndex);
  const current = lessonIndex === currentIndex && !done;
  const status = done ? "completed" : current ? "current" : open ? "available" : "locked";
  const icon = done ? "✓" : current ? "●" : open ? "○" : "🔒";
  const action = done ? "Review" : current ? "Continue" : open ? "Start" : "Locked";
  const final = isFinal(lesson);
  return `<li class="journey-node journey-node--${status}${final ? " journey-node--final" : ""}">${lessonIndex ? `<span class="journey-connector ${complete(state, level.lessons[lessonIndex - 1]) ? "journey-connector--complete" : ""}" aria-hidden="true"></span>` : ""}<button class="journey-node-button" type="button" data-journey-lesson="${esc(lesson.id)}" ${open ? "" : "disabled"} ${current ? "aria-current=\"step\"" : ""} aria-label="${esc(`Mission ${lessonIndex + 1}: ${lesson.title} — ${status} — ${Number(lesson.xp) || 0} XP`)}"><span class="journey-node-icon" aria-hidden="true">${icon}</span><span class="journey-node-copy"><strong>${esc(lesson.title)}</strong><small>${action} · +${Number(lesson.xp) || 0} XP</small></span><span class="journey-node-state">${status}${final ? " · Final" : ""}</span></button></li>`;
}

function levelCard(state, level, currentLevel) {
  const p = getMissionProgress(state, level.lessons);
  const unlocked = isLevelUnlocked(state, level.id);
  const done = p.complete;
  const kind = level.id === currentLevel ? "current" : done ? "completed" : unlocked ? "available" : "locked";
  const icon = done ? "✓" : unlocked ? "→" : "🔒";
  return `<article class="journey-level-card journey-level-card--${kind}"><span class="journey-level-icon" aria-hidden="true">${icon}</span><div class="journey-level-copy"><span>LEVEL ${level.id}</span><strong>${esc(level.title)}</strong><small>${esc(level.description)}</small></div><div class="journey-level-progress"><strong>${p.completed}/${p.total}</strong><small>${kind === "locked" ? "Locked" : `${p.percent}%`}</small></div></article>`;
}

function render() {
  const mount = $("#learning-journey");
  if (!mount) return;
  const state = loadState();
  const current = currentMissionView(state);
  const total = getMissionProgress(state, LEVELS.flatMap((level) => level.lessons));
  const currentLevel = current ? current.levelIndex + 1 : LEVELS.length;
  const level = LEVELS[currentLevel - 1];
  const p = current ? getMissionProgress(state, level.lessons) : { completed: level?.lessons.length || 0, total: level?.lessons.length || 0, percent: 100 };
  if (!current) {
    mount.innerHTML = `<section class="journey-complete" aria-labelledby="journey-complete-title"><span class="journey-kicker">JOURNEY COMPLETE</span><h1 id="journey-complete-title">You cleared every available mission.</h1><p>${total.completed} / ${total.total} missions completed · ${state.xp.toLocaleString()} XP earned.</p></section>`;
    return;
  }
  const finalMission = isFinal(current.lesson);
  const nearby = LEVELS.slice(Math.max(0, current.levelIndex - 1), Math.min(LEVELS.length, current.levelIndex + 2)).map((item) => levelCard(state, item, currentLevel)).join("");
  const all = LEVELS.map((item) => levelCard(state, item, currentLevel)).join("");
  mount.innerHTML = `<section class="journey-status" aria-label="Learning progress"><div><span class="journey-kicker">YOUR JOURNEY</span><h1>Keep going.</h1><p>Level ${currentLevel} · ${esc(level.title)}</p></div><div class="journey-metrics"><span><strong>${state.xp.toLocaleString()}</strong> XP</span><span><strong>${state.streak}</strong> day streak</span><span><strong>${total.percent}%</strong> overall</span></div></section><section class="current-mission" aria-labelledby="current-mission-title"><div class="current-mission-main"><div class="current-mission-meta"><span>CONTINUE LEARNING</span><span>LEVEL ${currentLevel} · MISSION ${current.lessonIndex + 1} OF ${p.total}</span></div><div class="current-mission-heading"><div><span>${esc(level.title)}</span><h2 id="current-mission-title">${esc(current.lesson.title)}</h2></div><strong>+${Number(current.lesson.xp) || 0} XP</strong></div><p>${esc(current.lesson.description)}</p><div class="current-mission-progress"><div><span>Level progress</span><strong>${p.completed} / ${p.total}</strong></div><div class="journey-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.percent}" aria-label="Current level progress"><span style="width:${p.percent}%"></span></div></div><button class="journey-primary-action" type="button" data-journey-lesson="${esc(current.lesson.id)}">${finalMission ? "Continue to Final Boss" : p.completed ? "Continue Mission" : "Start First Mission"}<span aria-hidden="true">→</span></button></div><aside class="current-mission-side" aria-label="Current mission details"><b>${String(current.lessonIndex + 1).padStart(2, "0")}</b><span>${esc(current.lesson.difficulty || "Mission")}</span><small>${finalMission ? "Final challenge" : "Next step"}</small></aside></section><section class="current-level" aria-labelledby="current-level-title"><div class="journey-heading"><div><span class="journey-kicker">CURRENT LEVEL</span><h2 id="current-level-title">${esc(level.title)}</h2><p>${esc(level.description)}</p></div><strong>${p.completed} / ${p.total}</strong></div><div class="journey-path"><ol>${level.lessons.map((_, i) => node(state, level, i, current.lessonIndex)).join("")}</ol></div></section><section class="nearby-levels" aria-labelledby="nearby-levels-title"><div class="journey-heading"><div><span class="journey-kicker">YOUR JOURNEY</span><h2 id="nearby-levels-title">Nearby levels</h2></div></div><div class="journey-level-grid">${nearby}</div><details class="journey-explorer"><summary><span>Explore full journey</span><small>${total.completed}/${total.total} missions completed</small></summary><div class="journey-level-grid journey-level-grid--all">${all}</div></details></section>`;
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
  style.textContent = `@media(prefers-reduced-motion:reduce){.journey-node-button,.journey-primary-action,.journey-progress-track span{transition:none}.journey-node-button:hover:not(:disabled),.journey-primary-action:hover{transform:none}}@media(max-width:760px){body.journey-mode main{padding:0 16px}.journey-status{align-items:flex-start;flex-direction:column}.journey-metrics{justify-content:flex-start}.current-mission{grid-template-columns:1fr}.current-mission-side{grid-row:1;grid-template-columns:auto 1fr auto;justify-items:start;place-content:initial;padding:12px 17px;border-left:0;border-bottom:1px solid #eadbd0;text-align:left}.current-mission-side b{font-size:2rem}.current-mission-main{padding:21px}.current-mission-meta,.current-mission-heading{flex-direction:column;align-items:flex-start}.current-mission h2{font-size:1.7rem}.journey-level-grid,.journey-level-grid--all{grid-template-columns:1fr}.journey-node{justify-content:flex-start}.journey-node:nth-child(odd) .journey-node-button,.journey-node:nth-child(even) .journey-node-button{transform:none;width:calc(100% - 28px);margin-left:28px}.journey-node:nth-child(odd) .journey-node-button:hover:not(:disabled),.journey-node:nth-child(even) .journey-node-button:hover:not(:disabled){transform:translateY(-2px)}.journey-connector{left:14px}.journey-level-grid--all{grid-template-columns:1fr}}`;
  document.head.appendChild(style);
}

function init() {
  addStyles();
  render();
  document.body.classList.add("journey-mode");
  document.addEventListener("click", (event) => { const button = event.target.closest("[data-journey-lesson]"); if (button && !button.disabled) openLesson(button.dataset.journeyLesson); });
  window.addEventListener("ailearn-state-updated", render);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
