import { levels, foundationLessons, llmLessons, finalChallenge, achievements } from './curriculum.js';
import { loadState, saveState, completeLesson, unlockAchievements, getLevelProgress, isLevelUnlocked, markLevelCompleted, unlockLevel } from './state.js';

let state = loadState();
let activeLesson = null;
let selectedAnswer = null;
let generationIndex = 0;

const $ = (selector) => document.querySelector(selector);
const allLessons = [...foundationLessons, ...llmLessons, finalChallenge];
const levelTwoLessons = [...llmLessons, finalChallenge];

function render() {
  renderStats(); renderRoadmap(); renderFoundationLessons(); renderLlmLessons(); renderAchievements();
}

function renderStats() {
  const progress = getLevelProgress(state.xp);
  const title = ['Beginner Explorer', 'AI Learner', 'AI Builder', 'AI Engineer'][Math.min(state.level - 1, 3)];
  const totalMissionCount = foundationLessons.length + levelTwoLessons.length;
  const completedMissionCount = allLessons.filter((lesson) => state.completedLessons.includes(lesson.id)).length;
  const llmCompleted = levelTwoLessons.filter((lesson) => state.completedLessons.includes(lesson.id)).length;
  $('#header-xp').textContent = `${state.xp} XP`;
  $('#level-value').textContent = state.level;
  $('#rank-value').textContent = title;
  $('#title-value').textContent = title;
  $('#streak-value').textContent = state.streak;
  $('#completed-value').textContent = completedMissionCount;
  $('#xp-progress').textContent = `${progress.current} / ${progress.total} XP`;
  $('#xp-bar').style.width = `${progress.percent}%`;
  $('#hero-progress').textContent = `${Math.round((completedMissionCount / totalMissionCount) * 100)}%`;
  $('#foundation-count').textContent = `${foundationLessons.filter((lesson) => state.completedLessons.includes(lesson.id)).length} / ${foundationLessons.length}`;
  $('#llm-count').textContent = `${llmCompleted} / ${levelTwoLessons.length}`;
}

function renderRoadmap() {
  $('#roadmap-list').innerHTML = levels.map((level) => {
    const unlocked = isLevelUnlocked(state, level.id);
    const completed = state.completedLevels.includes(level.id);
    return `<article class="roadmap-node ${unlocked ? 'unlocked' : ''} ${completed ? 'completed' : ''}"><span class="roadmap-number">LEVEL ${level.id}</span><span class="roadmap-status" aria-label="${completed ? 'Completed' : unlocked ? 'Unlocked' : 'Locked'}">${completed ? '✓' : unlocked ? '●' : '⌑'}</span><h3>${level.title.toUpperCase()}</h3><p>${level.description}</p></article>`;
  }).join('');
}

function lessonCard(lesson, index, locked = false) {
  const completed = state.completedLessons.includes(lesson.id);
  const label = completed ? 'Review' : locked ? 'Locked' : lesson.type === 'final' ? 'Start Challenge' : 'Start Mission';
  return `<article class="lesson-card ${completed ? 'completed' : ''} ${locked ? 'locked' : ''}"><div class="lesson-index">${completed ? '✓' : String(index + 1).padStart(2, '0')}</div><div><h3>${lesson.title}</h3><p>${lesson.description}</p><div class="lesson-tags"><span class="tag">${lesson.difficulty}</span><span class="tag xp">+${lesson.xp} XP</span>${lesson.type === 'final' ? '<span class="tag challenge">FINAL</span>' : ''}</div></div><button class="lesson-button" data-lesson="${lesson.id}" ${locked ? 'disabled' : ''}>${label}</button></article>`;
}

function renderFoundationLessons() {
  $('#foundation-list').innerHTML = foundationLessons.map((lesson, index) => lessonCard(lesson, index)).join('');
}

function renderLlmLessons() {
  const unlocked = isLevelUnlocked(state, 2);
  const completed = levelTwoLessons.filter((lesson) => state.completedLessons.includes(lesson.id)).length;
  const percent = Math.round((completed / levelTwoLessons.length) * 100);
  const previousMissionsComplete = llmLessons.every((lesson) => state.completedLessons.includes(lesson.id));
  $('#llm-progress-bar').style.width = `${percent}%`;
  $('#llm-progress-percent').textContent = `${percent}%`;
  $('#llm-list').innerHTML = levelTwoLessons.map((lesson, index) => lessonCard(lesson, index, !unlocked || (lesson.type === 'final' && !previousMissionsComplete))).join('');
  $('#llm-locked-note').hidden = unlocked;
  document.querySelector('.llm-section').classList.toggle('is-locked', !unlocked);
}

function renderAchievements() {
  $('#achievement-list').innerHTML = achievements.map((item) => {
    const unlocked = state.achievements.includes(item.id);
    return `<article class="achievement ${unlocked ? 'unlocked' : ''}"><div class="achievement-icon">${item.icon}</div><div><h3>${item.title} ${unlocked ? '✓' : ''}</h3><p>${item.description}</p></div></article>`;
  }).join('');
}

function openLesson(id) {
  activeLesson = allLessons.find((lesson) => lesson.id === id);
  if (!activeLesson || (activeLesson.id.startsWith('llm-') && !isLevelUnlocked(state, 2)) || (activeLesson.type === 'final' && (!isLevelUnlocked(state, 2) || !llmLessons.every((lesson) => state.completedLessons.includes(lesson.id))))) return;
  selectedAnswer = null; generationIndex = 0;
  $('#modal-title').textContent = activeLesson.title;
  $('#modal-description').textContent = activeLesson.description;
  $('#modal-difficulty').textContent = activeLesson.difficulty;
  $('#modal-xp').textContent = `+${activeLesson.xp} XP`;
  $('#modal-objective').innerHTML = `<strong>Learning objective</strong><span>${activeLesson.objective}</span>`;
  $('#modal-content').innerHTML = activeLesson.content;
  $('#modal-visual').innerHTML = buildVisual(activeLesson);
  $('#modal-interaction').innerHTML = buildInteraction(activeLesson);
  $('#modal-quiz').innerHTML = activeLesson.type === 'final' ? buildFinalChallenge(activeLesson) : buildQuiz(activeLesson);
  $('#complete-button').hidden = activeLesson.type === 'final';
  $('#complete-button').disabled = state.completedLessons.includes(id);
  $('#complete-button').textContent = state.completedLessons.includes(id) ? 'Mission completed ✓' : `Complete mission · +${activeLesson.xp} XP`;
  $('#lesson-modal').hidden = false;
  $('#modal-close').focus();
  bindLessonInteractions();
}

function buildVisual(lesson) {
  if (lesson.type === 'attention') return `<div class="attention-visual"><p class="visual-label">CONCEPTUAL ATTENTION VIEW</p><div class="attention-tokens">${lesson.visual.map((token) => `<button class="attention-token" data-focus-token="${token}">${token}</button>`).join('')}</div><p class="visual-hint">Select a token to explore its relationships.</p><div id="attention-feedback" class="visual-feedback" aria-live="polite">Try selecting <strong>cheese</strong>.</div></div>`;
  if (lesson.type === 'generation') return `<div class="generation-visual"><p class="visual-label">NEXT-TOKEN PREDICTION</p><div class="generation-context" id="generation-context">${lesson.generation.prompt}</div><div class="generation-probs" id="generation-probs"></div><button class="secondary-action" id="generate-token">Generate next token</button><p class="simulation-note">Illustrative probabilities · not real model inference</p></div>`;
  if (lesson.type === 'sampling') return `<div class="sampling-visual"><p class="visual-label">GENERATION PARAMETER SIMULATION</p><div class="sampling-prompt">The robot walked into the...</div><div class="sampling-controls"><label>Temperature <output id="temperature-value">0.7</output><input id="temperature-slider" type="range" min="0.1" max="1.2" value="0.7" step="0.1"></label><label>Top-k <output id="top-k-value">3</output><input id="top-k-slider" type="range" min="1" max="6" value="3" step="1"></label><label>Top-p <output id="top-p-value">0.70</output><input id="top-p-slider" type="range" min="0.3" max="1" value="0.7" step="0.05"></label></div><div id="sampling-bars"></div><div class="sampling-explanation" id="sampling-explanation"></div><p class="simulation-note">Generation parameter simulation · illustrative probabilities</p></div>`;
  if (lesson.type === 'tokenizer') return `<div class="token-visual"><p class="visual-label">EDUCATIONAL TOKENIZATION SIMULATION</p><div class="token-input-row"><input id="token-input" value="I love building AI apps" aria-label="Text to tokenize"><button class="secondary-action" id="tokenize-button">Tokenize</button></div><div id="token-output" class="token-output"></div><p class="simulation-note">Educational simulation — real tokenizers can split the same text differently.</p></div>`;
  if (lesson.type === 'embeddings') return `<div class="embedding-visual"><p class="visual-label">CONCEPTUAL VECTOR SPACE</p><div class="vector-space"><span class="axis-label axis-y">sweet ↑</span><span class="axis-label axis-x">savory →</span><button class="vector-point apple" data-point="Apple">🍎 <small>apple</small></button><button class="vector-point cheese" data-point="Cheese">🧀 <small>cheese</small></button><button class="vector-point milk" data-point="Milk">🥛 <small>milk</small></button></div><div id="embedding-feedback" class="visual-feedback">Click a point to see its illustrative relationship.</div></div>`;
  if (lesson.type === 'parameters') return `<div class="parameter-visual"><p class="visual-label">MODEL PARAMETERS · CONCEPTUAL</p><div class="parameter-stack">${Array.from({ length: 12 }, (_, i) => `<span style="--i:${i}">weight</span>`).join('')}</div><div class="model-size-row"><div><strong>Small</strong><span>████</span></div><div><strong>Medium</strong><span>████████</span></div><div><strong>Large</strong><span>████████████████</span></div></div></div>`;
  return `<div class="flow">${lesson.visual.map((step, i) => `<span class="flow-step">${step}</span>${i < lesson.visual.length - 1 ? '<span class="flow-arrow">→</span>' : ''}`).join('')}</div>`;
}

function buildInteraction(lesson) {
  if (lesson.type === 'llm-intro') return `<div class="concept-card"><span class="concept-kicker">MENTAL MODEL</span><strong>Advanced autocomplete</strong><p>Useful analogy: an LLM uses learned language patterns and context to generate a continuation.</p></div>`;
  if (lesson.type === 'use-case-match') return `<div class="activity-card"><div class="activity-heading"><strong>Match the use case</strong><span>Pick the best category for each task.</span></div><div id="match-activity" class="match-list"></div><div id="match-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === 'attention') return `<div class="activity-card"><div class="activity-heading"><strong>Attention challenge</strong><span>Select the words that help answer the question.</span></div><div class="attention-challenge">${['Most','famous','cheese','France','banana','car'].map((word) => `<button class="challenge-token" data-challenge-token="${word}">${word}</button>`).join('')}</div><button class="secondary-action" id="check-attention">Check selection</button><div id="attention-challenge-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  return '';
}

function buildQuiz(lesson) { return `<h3>🧠 Quick check</h3><p>${lesson.quiz.question}</p><div class="quiz-options">${lesson.quiz.options.map((option, i) => `<button class="quiz-option" data-answer="${i}">${option}</button>`).join('')}</div><div class="quiz-feedback" id="quiz-feedback" aria-live="polite"></div>`; }
function buildFinalChallenge(challenge) { return `<div class="final-challenge"><div class="challenge-header"><span>FINAL BOSS</span><strong>70% to pass</strong></div><p class="challenge-intro">10 questions across tokens, embeddings, attention, prediction, parameters and sampling.</p><div id="final-questions">${challenge.questions.map((question, index) => buildFinalQuestion(question, index)).join('')}</div><button class="primary-button" id="submit-final">Submit challenge</button><div id="final-result" class="final-result" aria-live="polite"></div></div>`; }
function buildFinalQuestion(question, index) {
  if (question.type === 'short') return `<fieldset class="final-question" data-final-index="${index}"><legend>${index + 1}. ${question.question}</legend><input class="short-answer" data-final-short type="text" placeholder="Example: It predicts the next token..." aria-label="Short answer"></fieldset>`;
  if (question.type === 'order') return `<fieldset class="final-question" data-final-index="${index}"><legend>${index + 1}. ${question.question}</legend><p class="question-note">Use the controls to move each step into order.</p><div class="order-list">${question.order.map((item, i) => `<button type="button" class="order-item" data-order-item="${i}">${i + 1}. ${item}</button>`).join('')}</div></fieldset>`;
  return `<fieldset class="final-question" data-final-index="${index}"><legend>${index + 1}. ${question.question}</legend><div class="quiz-options">${question.options.map((option, i) => `<button type="button" class="quiz-option final-option" data-final-answer="${i}">${option}</button>`).join('')}</div></fieldset>`;
}

function bindLessonInteractions() {
  document.querySelectorAll('[data-answer]').forEach((button) => button.addEventListener('click', () => answerQuiz(Number(button.dataset.answer))));
  if (activeLesson.type === 'tokenizer') { tokenize(); $('#tokenize-button').addEventListener('click', tokenize); }
  if (activeLesson.type === 'embeddings') document.querySelectorAll('[data-point]').forEach((button) => button.addEventListener('click', () => { $('#embedding-feedback').textContent = `${button.dataset.point} is shown in an illustrative position. Real embedding spaces are learned from data and are not this simple 2D map.`; }));
  if (activeLesson.type === 'attention') {
    document.querySelectorAll('[data-focus-token]').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('.attention-token').forEach((item) => item.classList.remove('related')); const relatedWords = button.textContent === 'cheese' ? ['cheese', 'famous', 'France'] : [button.textContent]; document.querySelectorAll('[data-focus-token]').forEach((item) => { if (relatedWords.includes(item.textContent)) item.classList.add('related'); }); const related = relatedWords.join(', '); $('#attention-feedback').innerHTML = `Conceptually, the model can give different importance to relationships involving <strong>${related}</strong>.`; }));
    document.querySelectorAll('[data-challenge-token]').forEach((button) => button.addEventListener('click', () => button.classList.toggle('selected')));
    $('#check-attention').addEventListener('click', checkAttention);
  }
  if (activeLesson.type === 'use-case-match') buildMatchActivity();
  if (activeLesson.type === 'generation') renderGeneration();
  if (activeLesson.type === 'sampling') renderSampling();
  document.querySelectorAll('[data-final-answer]').forEach((button) => button.addEventListener('click', () => { const question = button.closest('.final-question'); question.querySelectorAll('[data-final-answer]').forEach((item) => item.classList.remove('selected')); button.classList.add('selected'); }));
  document.querySelectorAll('[data-order-item]').forEach((button) => button.addEventListener('click', () => { const list = button.parentElement; const buttons = [...list.children]; const current = buttons.indexOf(button); if (current > 0) list.insertBefore(button, buttons[current - 1]); updateOrderLabels(list); }));
  if (activeLesson.type === 'final') $('#submit-final').addEventListener('click', submitFinal);
  $('#complete-button').addEventListener('click', finishLesson);
}

function updateOrderLabels(list) { [...list.children].forEach((button, index) => { button.textContent = `${index + 1}. ${button.textContent.replace(/^\d+\.\s*/, '')}`; }); }
function answerQuiz(answer) { selectedAnswer = answer; document.querySelectorAll('[data-answer]').forEach((button, index) => button.classList.toggle('selected', index === answer)); $('#quiz-feedback').textContent = answer === activeLesson.quiz.answer ? 'Correct — nice work.' : 'Not quite. Try again.'; }
function finishLesson() {
  if (!activeLesson || activeLesson.type === 'final' || state.completedLessons.includes(activeLesson.id)) return;
  if (selectedAnswer !== activeLesson.quiz.answer) { $('#quiz-feedback').textContent = 'Answer the quick check correctly before completing the mission.'; return; }
  const previousLevel = state.level;
  completeLesson(state, activeLesson.id, activeLesson.xp);
  if (foundationLessons.every((lesson) => state.completedLessons.includes(lesson.id))) { unlockLevel(state, 2); markLevelCompleted(state, 1); }
  const newAchievements = unlockAchievements(state, allLessons);
  saveState(state); render();
  const achievementText = newAchievements.length ? ` · ${newAchievements.map((id) => achievements.find((item) => item.id === id)?.title).filter(Boolean).join(' · ')}` : '';
  showReward(`+${activeLesson.xp} XP${achievementText}`, previousLevel !== state.level ? `Level ${state.level} unlocked!` : 'Mission Complete!');
  closeLesson();
}
function checkAttention() { const selected = [...document.querySelectorAll('[data-challenge-token].selected')].map((button) => button.dataset.challengeToken); const expected = ['famous', 'cheese', 'France']; const correct = selected.length === expected.length && expected.every((word) => selected.includes(word)); $('#attention-challenge-feedback').textContent = correct ? 'Strong selection. Those tokens provide useful context for the question.' : 'Try again — focus on the words that identify the subject and context of the question.'; }
function tokenize() { const input = $('#token-input').value.trim(); const words = input ? input.match(/[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu) || [] : []; $('#token-output').innerHTML = words.length ? words.map((token, index) => `<span class="sim-token" style="--delay:${index * 70}ms">${token}</span>`).join('') : '<span class="muted">Type something to see the simulation.</span>'; }
function buildMatchActivity() { const container = $('#match-activity'); const categories = [...new Set(activeLesson.matches.map((match) => match[1]))]; container.innerHTML = activeLesson.matches.map(([task], index) => `<div class="match-row"><span>${task}</span><select data-match="${index}" aria-label="Match ${task}"><option value="">Choose…</option>${categories.map((category) => `<option>${category}</option>`).join('')}</select></div>`).join('') + '<button class="secondary-action" id="check-matches">Check matches</button>'; $('#check-matches').addEventListener('click', () => { const correct = activeLesson.matches.every(([, answer], index) => document.querySelector(`[data-match="${index}"]`).value === answer); $('#match-feedback').textContent = correct ? 'All matched. You can now explain where LLMs fit.' : 'A few are off. Think about the main task each description performs.'; }); }
function renderGeneration() { const step = activeLesson.generation.steps[generationIndex]; const candidates = [[step.token, step.probability], ...step.alternatives]; $('#generation-probs').innerHTML = candidates.map(([token, probability]) => `<div class="prob-row"><span>${token}</span><div><i style="width:${probability}%"></i></div><strong>${probability}%</strong></div>`).join(''); $('#generate-token').textContent = generationIndex < activeLesson.generation.steps.length - 1 ? 'Generate next token' : 'Start again'; }
function advanceGeneration() { const step = activeLesson.generation.steps[generationIndex]; $('#generation-context').textContent += ` ${step.token}`; generationIndex += 1; if (generationIndex >= activeLesson.generation.steps.length) generationIndex = 0; renderGeneration(); }
function renderSampling() {
  const temperature = Number($('#temperature-slider').value), k = Number($('#top-k-slider').value), p = Number($('#top-p-slider').value);
  $('#temperature-value').textContent = temperature.toFixed(1); $('#top-k-value').textContent = k; $('#top-p-value').textContent = p.toFixed(2);
  const candidates = activeLesson.sampling.candidates.map(([token, probability]) => [token, Math.pow(probability, 1 / temperature)]);
  const sum = candidates.reduce((total, [, value]) => total + value, 0);
  const normalized = candidates.map(([token, value]) => [token, value / sum]).sort((a, b) => b[1] - a[1]);
  const topK = normalized.slice(0, k); let cumulative = 0; const topP = [];
  for (const candidate of normalized) { if (cumulative < p) { topP.push(candidate); cumulative += candidate[1]; } }
  const allowed = new Set(topP.map(([token]) => token).filter((_, index) => index < topK.length));
  $('#sampling-bars').innerHTML = normalized.map(([token, probability]) => `<div class="prob-row ${allowed.has(token) ? 'candidate-active' : ''}"><span>${token}</span><div><i style="width:${Math.max(2, probability * 100)}%"></i></div><strong>${Math.round(probability * 100)}%</strong></div>`).join('');
  $('#sampling-explanation').innerHTML = `<strong>What changes?</strong> ${temperature < 0.5 ? 'Low temperature concentrates the distribution.' : temperature > 0.9 ? 'High temperature spreads probability more broadly.' : 'Medium temperature keeps a balance.'} Top-k keeps <strong>${k}</strong> candidates. Top-p keeps candidates until their cumulative probability reaches about <strong>${Math.round(p * 100)}%</strong>.`;
}
function submitFinal() {
  let score = 0;
  finalChallenge.questions.forEach((question, index) => {
    const card = document.querySelector(`[data-final-index="${index}"]`);
    if (question.type === 'short') { const answer = card.querySelector('[data-final-short]').value.trim().toLowerCase(); if (answer.includes('predict') && (answer.includes('token') || answer.includes('next'))) score += 1; return; }
    if (question.type === 'order') { const order = [...card.querySelectorAll('[data-order-item]')].map((button) => Number(button.dataset.orderItem)); if (order.every((value, i) => value === i)) score += 1; return; }
    const selected = card.querySelector('.final-option.selected'); if (selected && Number(selected.dataset.finalAnswer) === question.answer) score += 1;
  });
  const percent = Math.round((score / finalChallenge.questions.length) * 100), result = $('#final-result');
  if (percent >= 70) {
    result.className = 'final-result pass'; result.innerHTML = `<strong>Passed — ${score}/${finalChallenge.questions.length} (${percent}%).</strong><span>You have the mental model. Level 3 is now unlocked.</span>`;
    if (!state.completedLessons.includes(finalChallenge.id)) {
      const previousLevel = state.level; completeLesson(state, finalChallenge.id, finalChallenge.xp); unlockLevel(state, 3); markLevelCompleted(state, 2); const newAchievements = unlockAchievements(state, allLessons); saveState(state); render();
      const achievementText = newAchievements.length ? ` · ${newAchievements.map((id) => achievements.find((item) => item.id === id)?.title).filter(Boolean).join(' · ')}` : '';
      showReward(`+${finalChallenge.xp} XP${achievementText}`, previousLevel !== state.level ? `Level ${state.level} unlocked!` : 'LLM Fundamentals Complete!'); setTimeout(closeLesson, 900);
    } else { unlockLevel(state, 3); markLevelCompleted(state, 2); saveState(state); render(); }
  } else {
    result.className = 'final-result fail';
    const weak = finalChallenge.questions.filter((question, index) => {
      const card = document.querySelector(`[data-final-index="${index}"]`);
      if (question.type === 'short') { const answer = card.querySelector('[data-final-short]').value.trim().toLowerCase(); return !(answer.includes('predict') && (answer.includes('token') || answer.includes('next'))); }
      if (question.type === 'order') { const order = [...card.querySelectorAll('[data-order-item]')].map((button) => Number(button.dataset.orderItem)); return !order.every((value, i) => value === i); }
      const selected = card.querySelector('.final-option.selected'); return !selected || Number(selected.dataset.finalAnswer) !== question.answer;
    }).map((question) => question.question);
    result.innerHTML = `<strong>Not quite — ${score}/${finalChallenge.questions.length} (${percent}%).</strong><span>Pass at 70%. Review the concepts and retry. ${weak.slice(0, 3).join(' · ')}</span>`;
  }
}
function closeLesson() { $('#lesson-modal').hidden = true; activeLesson = null; }
function showReward(copy, title) { $('#reward-title').textContent = title; $('#reward-copy').textContent = copy; $('#reward-toast').hidden = false; setTimeout(() => { $('#reward-toast').hidden = true; }, 3400); }

$('#modal-close').addEventListener('click', closeLesson);
$('#lesson-modal').addEventListener('click', (event) => { if (event.target === $('#lesson-modal')) closeLesson(); });
document.addEventListener('click', (event) => { const lessonButton = event.target.closest('[data-lesson]'); if (lessonButton && !lessonButton.disabled) openLesson(lessonButton.dataset.lesson); if (event.target.id === 'generate-token') advanceGeneration(); });
document.addEventListener('input', (event) => { if (event.target.matches('#temperature-slider, #top-k-slider, #top-p-slider')) renderSampling(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && activeLesson) closeLesson(); });
render();
