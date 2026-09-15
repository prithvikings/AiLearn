import { phase5Lessons, phase5Achievements } from './phase5.js';
import { foundationLessons, llmLessons, promptLessons, finalChallenge } from './curriculum.js';
import { phase4Lessons } from './phase4.js';
import { loadState, saveState, completeLesson, unlockAchievements, isLevelUnlocked, unlockLevel, markLevelCompleted, recordChallengeScore } from './state.js';

let state = loadState();
let active = null;
let interactionPassed = false;
let quizPassed = false;
let lifecycleVisited = new Set();
let classified = new Set();
let hubInspected = new Set();
let scenarioAnswers = {};
let ollamaStep = 0;
let setupConfig = {};
let finalConfig = {};
let finalReasons = new Set();

const $ = (selector) => document.querySelector(selector);
const allKnownLessons = [...foundationLessons, ...llmLessons, ...promptLessons, finalChallenge, ...phase4Lessons, ...phase5Lessons];
const phase5MissionIds = phase5Lessons.map((lesson) => lesson.id);
const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

function refreshState() { state = loadState(); }
function unlocked() { return isLevelUnlocked(state, 5); }
function doneCount() { return phase5Lessons.filter((lesson) => state.completedLessons.includes(lesson.id)).length; }

function refreshShell() {
  const completed = allKnownLessons.filter((lesson) => state.completedLessons.includes(lesson.id)).length;
  const total = allKnownLessons.length;
  if ($('#header-xp')) $('#header-xp').textContent = `${state.xp} XP`;
  if ($('#completed-value')) $('#completed-value').textContent = completed;
  if ($('#hero-progress')) $('#hero-progress').textContent = `${Math.round((completed / total) * 100)}%`;
}

function renderLevel5() {
  const section = $('.local-ai-section');
  const list = $('#local-ai-list');
  if (!list) return;
  const open = unlocked();
  const done = doneCount();
  const percent = Math.round((done / phase5Lessons.length) * 100);
  $('#local-ai-count').textContent = `${done} / ${phase5Lessons.length}`;
  $('#local-ai-progress-percent').textContent = `${percent}%`;
  $('#local-ai-progress-bar').style.width = `${percent}%`;
  $('#local-ai-locked-note').hidden = open;
  section?.classList.toggle('is-locked', !open);
  const firstNine = phase5Lessons.slice(0, -1).every((lesson) => state.completedLessons.includes(lesson.id));
  list.innerHTML = phase5Lessons.map((lesson, index) => {
    const complete = state.completedLessons.includes(lesson.id);
    const locked = !open || (lesson.type === 'local-final' && !firstNine);
    const label = complete ? 'Review' : locked ? 'Locked' : lesson.type === 'local-final' ? 'Start Final Boss' : 'Start Mission';
    return `<article class="lesson-card local-ai-card ${complete ? 'completed' : ''} ${locked ? 'locked' : ''}"><div class="lesson-index">${complete ? '✓' : String(index + 1).padStart(2, '0')}</div><div><h3>${esc(lesson.title)}</h3><p>${esc(lesson.description)}</p><div class="lesson-tags"><span class="tag">${lesson.difficulty}</span><span class="tag xp">+${lesson.xp} XP</span>${lesson.type === 'local-final' ? '<span class="tag challenge">FINAL</span>' : ''}</div></div><button class="lesson-button" data-local-lesson="${lesson.id}" ${locked ? 'disabled' : ''}>${label}</button></article>`;
  }).join('');
}

function renderAchievements() {
  // Achievement collection is now owned by ui/progress.js.
}
