import { levels, lessons, achievements } from './curriculum.js';
import { loadState, saveState, completeLesson, unlockAchievements, getLevelProgress } from './state.js';

let state = loadState();
let activeLesson = null;
let selectedAnswer = null;
const $ = (selector) => document.querySelector(selector);

function render() {
  renderStats(); renderRoadmap(); renderLessons(); renderAchievements();
}

function renderStats() {
  const progress = getLevelProgress(state.xp);
  const title = ['Beginner Explorer', 'AI Learner', 'AI Builder', 'AI Engineer'][Math.min(state.level - 1, 3)];
  $('#header-xp').textContent = `${state.xp} XP`;
  $('#level-value').textContent = state.level;
  $('#rank-value').textContent = title;
  $('#title-value').textContent = title;
  $('#streak-value').textContent = state.streak;
  $('#completed-value').textContent = state.completedLessons.length;
  $('#xp-progress').textContent = `${progress.current} / ${progress.total} XP`;
  $('#xp-bar').style.width = `${progress.percent}%`;
  $('#hero-progress').textContent = `${Math.round((state.completedLessons.length / lessons.length) * 100)}%`;
  $('#lesson-count').textContent = `${state.completedLessons.length} / ${lessons.length}`;
}

function renderRoadmap() {
  $('#roadmap-list').innerHTML = levels.map((level) => {
    const unlocked = level.id === 1 || state.level >= level.id;
    const completed = level.id === 1 && lessons.every((lesson) => state.completedLessons.includes(lesson.id));
    return `<article class="roadmap-node ${unlocked ? 'unlocked' : ''} ${completed ? 'completed' : ''}">
      <span class="roadmap-number">LEVEL ${level.id}</span><span class="roadmap-status">${completed ? '✓' : unlocked ? '●' : '⌑'}</span>
      <h3>${level.title.toUpperCase()}</h3><p>${level.description}</p>
    </article>`;
  }).join('');
}

function renderLessons() {
  $('#lesson-list').innerHTML = lessons.map((lesson, index) => {
    const completed = state.completedLessons.includes(lesson.id);
    return `<article class="lesson-card ${completed ? 'completed' : ''}">
      <div class="lesson-index">${completed ? '✓' : String(index + 1).padStart(2, '0')}</div>
      <div><h3>${lesson.title}</h3><p>${lesson.description}</p><div class="lesson-tags"><span class="tag">${lesson.difficulty}</span><span class="tag xp">+${lesson.xp} XP</span></div></div>
      <button class="lesson-button" data-lesson="${lesson.id}">${completed ? 'Review' : 'Start Lesson'}</button>
    </article>`;
  }).join('');
  document.querySelectorAll('[data-lesson]').forEach((button) => button.addEventListener('click', () => openLesson(button.dataset.lesson)));
}

function renderAchievements() {
  $('#achievement-list').innerHTML = achievements.map((item) => {
    const unlocked = state.achievements.includes(item.id);
    return `<article class="achievement ${unlocked ? 'unlocked' : ''}"><div class="achievement-icon">${item.icon}</div><div><h3>${item.title} ${unlocked ? '✓' : ''}</h3><p>${item.description}</p></div></article>`;
  }).join('');
}

function openLesson(id) {
  activeLesson = lessons.find((lesson) => lesson.id === id); selectedAnswer = null;
  $('#modal-title').textContent = activeLesson.title; $('#modal-description').textContent = activeLesson.description;
  $('#modal-difficulty').textContent = activeLesson.difficulty; $('#modal-xp').textContent = `+${activeLesson.xp} XP`;
  $('#modal-visual').innerHTML = `<div class="flow">${activeLesson.visual.map((step, i) => `<span class="flow-step">${step}</span>${i < activeLesson.visual.length - 1 ? '<span class="flow-arrow">→</span>' : ''}`).join('')}</div>`;
  $('#modal-content').innerHTML = activeLesson.content;
  $('#modal-quiz').innerHTML = `<h3>Quick check</h3><p>${activeLesson.quiz.question}</p><div class="quiz-options">${activeLesson.quiz.options.map((option, i) => `<button class="quiz-option" data-answer="${i}">${option}</button>`).join('')}</div><div class="quiz-feedback" id="quiz-feedback" aria-live="polite"></div>`;
  document.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', () => answerQuiz(Number(button.dataset.answer))));
  const done = state.completedLessons.includes(id); $('#complete-button').textContent = done ? 'Lesson completed ✓' : 'Complete lesson · +25 XP'; $('#complete-button').disabled = done;
  $('#lesson-modal').hidden = false; $('#modal-close').focus();
}

function answerQuiz(answer) {
  selectedAnswer = answer;
  document.querySelectorAll('.quiz-option').forEach((button, index) => button.classList.toggle('selected', index === answer));
  $('#quiz-feedback').textContent = answer === activeLesson.quiz.answer ? 'Correct — nice work.' : 'Not quite. Try again.';
}

function closeLesson() { $('#lesson-modal').hidden = true; activeLesson = null; }

function finishLesson() {
  if (!activeLesson || state.completedLessons.includes(activeLesson.id)) return;
  if (selectedAnswer !== activeLesson.quiz.answer) { $('#quiz-feedback').textContent = 'Answer the quick check correctly before completing the lesson.'; return; }
  const previousLevel = state.level;
  completeLesson(state, activeLesson.id, activeLesson.xp); const newAchievements = unlockAchievements(state, lessons); saveState(state); render();
  const achievementText = newAchievements.length ? ` · ${achievements.find((item) => item.id === newAchievements[0]).title}` : '';
  showReward(`+${activeLesson.xp} XP${achievementText}`, previousLevel !== state.level ? `Level ${state.level} unlocked!` : 'Lesson Complete!');
  closeLesson();
}

function showReward(copy, title) {
  $('#reward-title').textContent = title; $('#reward-copy').textContent = copy; $('#reward-toast').hidden = false;
  setTimeout(() => { $('#reward-toast').hidden = true; }, 3200);
}

$('#modal-close').addEventListener('click', closeLesson); $('#complete-button').addEventListener('click', finishLesson);
$('#lesson-modal').addEventListener('click', (event) => { if (event.target === $('#lesson-modal')) closeLesson(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && activeLesson) closeLesson(); });
render();
