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
  renderRoadmap();
}

function renderRoadmap() {
  const list = $('#roadmap-list');
  if (!list) return;
  const descriptions = [
    ['AI Foundations', 'Build your mental model of AI.'], ['LLM Fundamentals', 'Tokens, embeddings, attention & prediction.'], ['Prompt Engineering', 'Learn to communicate with models effectively.'], ['LLM Applications', 'Learn API basics and build with language models.'], ['Open Source & Local AI', 'Explore model weights, local inference and hardware.'], ['Embeddings & Vector Search', 'Turn information into vectors for semantic search.'], ['Agents', 'Models that reason and use tools.'], ['MCP', 'Connect AI to tools and data.'], ['Orchestration', 'Design reliable multi-step AI systems.']
  ];
  list.querySelectorAll('.roadmap-node').forEach((node, index) => {
    if (!descriptions[index]) return;
    const id = index + 1;
    const complete = state.completedLevels.includes(id);
    const open = isLevelUnlocked(state, id);
    node.classList.toggle('unlocked', open);
    node.classList.toggle('completed', complete);
    const status = node.querySelector('.roadmap-status');
    if (status) { status.textContent = complete ? '✓' : open ? '●' : '⌑'; status.setAttribute('aria-label', complete ? 'Completed' : open ? 'Unlocked' : 'Locked'); }
    const title = node.querySelector('h3'); if (title) title.textContent = descriptions[index][0].toUpperCase();
    const copy = node.querySelector('p'); if (copy) copy.textContent = descriptions[index][1];
  });
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
  const list = $('#achievement-list');
  if (!list) return;
  list.querySelectorAll('[data-phase5-achievement]').forEach((node) => node.remove());
  phase5Achievements.forEach((item) => {
    const open = state.achievements.includes(item.id);
    const article = document.createElement('article');
    article.className = `achievement ${open ? 'unlocked' : ''}`;
    article.dataset.phase5Achievement = item.id;
    article.innerHTML = `<div class="achievement-icon">${item.icon}</div><div><h3>${esc(item.title)} ${open ? '✓' : ''}</h3><p>${esc(item.description)}</p></div>`;
    list.appendChild(article);
  });
}

function openLesson(id) {
  refreshState();
  active = phase5Lessons.find((lesson) => lesson.id === id);
  if (!active || !unlocked()) return;
  if (active.type === 'local-final' && !phase5Lessons.slice(0, -1).every((lesson) => state.completedLessons.includes(lesson.id))) return;
  interactionPassed = active.type === 'local-final' ? false : !['lifecycle','open-classify','model-hub','inference','cloud-local','hardware','quantization','ollama','setup-builder'].includes(active.type);
  quizPassed = active.type === 'local-final';
  lifecycleVisited = new Set(); classified = new Set(); hubInspected = new Set(); scenarioAnswers = {}; ollamaStep = 0; setupConfig = {}; finalConfig = {}; finalReasons = new Set();
  $('#modal-title').textContent = active.title;
  $('#modal-description').textContent = active.description;
  $('#modal-difficulty').textContent = active.difficulty;
  $('#modal-xp').textContent = `+${active.xp} XP`;
  $('#modal-objective').innerHTML = `<strong>Learning objective</strong><span>${esc(active.objective)}</span>`;
  $('#modal-visual').innerHTML = buildVisual(active);
  $('#modal-content').innerHTML = active.content;
  $('#modal-interaction').innerHTML = buildInteraction(active);
  $('#modal-quiz').innerHTML = active.type === 'local-final' ? buildFinal(active) : buildQuiz(active);
  $('#complete-button').hidden = active.type === 'local-final';
  $('#complete-button').disabled = state.completedLessons.includes(id);
  $('#complete-button').textContent = state.completedLessons.includes(id) ? 'Mission completed ✓' : `Complete mission · +${active.xp} XP`;
  $('#lesson-modal').hidden = false;
  $('#modal-close').focus();
  bind();
}

function buildVisual(lesson) {
  if (lesson.type === 'lifecycle') return `<div class="lifecycle-visual" id="lifecycle-visual">${lesson.stages.map(([title, text], i) => `<button class="lifecycle-stage" data-stage="${i}"><span>${title}</span><small>${esc(text)}</small></button>${i < lesson.stages.length - 1 ? '<span class="lifecycle-arrow">↓</span>' : ''}`).join('')}<div class="simulation-note">Click each stage to reveal its role.</div></div>`;
  if (lesson.type === 'open-classify') return `<div class="classification-visual"><span class="visual-label">CONCEPT CLASSIFIER</span><div id="classification-card"></div><div class="classification-progress" id="classification-progress">0 / ${lesson.statements.length} classified</div></div>`;
  if (lesson.type === 'model-hub') return `<div class="model-hub"><div class="hub-toolbar"><span>🤗 FICTIONAL MODEL HUB</span><span>Search models...</span></div><div class="hub-grid">${lesson.models.map((model, i) => `<button class="hub-card" data-hub-model="${i}"><strong>${esc(model.name)}</strong><span>${esc(model.task)}</span><small>Community model · click to inspect</small></button>`).join('')}</div><div id="hub-details" class="hub-details">Select a model to inspect its metadata.</div></div>`;
  if (lesson.type === 'inference') return `<div class="inference-visual"><div class="model-file"><span>📦</span><strong>example-model.weights</strong></div><div class="inference-track"><span>MODEL FILE</span><i>↓</i><span>RUNTIME</span><i>↓</i><span>COMPUTE</span><i>↓</i><span>INFERENCE</span></div><div class="inference-console" id="inference-console">Waiting to load the fictional model.</div><div class="inference-actions"><button class="secondary-action" id="load-model">Load model</button><button class="secondary-action" id="run-inference" disabled>Run</button></div><div class="simulation-note">Educational simulation — no model is downloaded or executed.</div></div>`;
  if (lesson.type === 'cloud-local') return `<div class="cloud-local-visual"><div class="path-card cloud"><strong>☁️ CLOUD</strong><span>USER → INTERNET → REMOTE MODEL → RESPONSE</span></div><div class="path-card local"><strong>💻 LOCAL</strong><span>USER → LOCAL APP → LOCAL MODEL → RESPONSE</span></div><div class="path-card hybrid"><strong>🔄 HYBRID</strong><span>USER → APP → ROUTE → CLOUD / LOCAL</span></div><div class="scenario-prompt" id="scenario-prompt">Choose an architecture below.</div></div>`;
  if (lesson.type === 'hardware') return `<div class="hardware-visual"><div class="hardware-bars"><div><span>CPU</span><i id="hw-cpu"></i></div><div><span>RAM</span><i id="hw-ram"></i></div><div><span>GPU</span><i id="hw-gpu"></i></div><div><span>VRAM</span><i id="hw-vram"></i></div></div><div class="hardware-result" id="hardware-result">Choose a machine profile and a conceptual model size.</div></div>`;
  if (lesson.type === 'quantization') return `<div class="quant-visual"><div class="precision-card"><span>HIGHER PRECISION</span><div class="memory-block large"></div><strong>More memory</strong><small>FP32 / FP16 are example precision formats</small></div><div class="quant-arrow">→</div><div class="precision-card"><span>QUANTIZED</span><div class="memory-block smaller"></div><strong>Lower memory footprint</strong><small>INT8 / 4-bit are example lower-precision formats</small></div><div class="quant-caption" id="quant-caption">Select a representation to compare the tradeoff.</div></div>`;
  if (lesson.type === 'ollama') return `<div class="terminal"><span class="terminal-badge">SIMULATED TERMINAL</span><pre id="terminal-output">$ ready</pre><button class="secondary-action" id="terminal-next">Run next step</button><div class="simulation-note">Simulated only — no Ollama command is executed.</div></div>`;
  if (lesson.type === 'setup-builder') return `<div class="setup-architecture"><span class="visual-label">YOUR LOCAL AI STACK</span><div id="setup-flow">Configure the builder below.</div></div>`;
  if (lesson.type === 'local-final') return `<div class="final-local-architecture"><span class="visual-label">OPEN SOURCE AI ARCHITECT</span><div id="final-local-flow">Choose the system components below.</div><div class="score-meter"><strong id="final-local-score">0%</strong><span>logical consistency</span></div></div>`;
  return `<div class="flow">${lesson.visual?.map((step, i) => `<span class="flow-step">${esc(step)}</span>${i < lesson.visual.length - 1 ? '<span class="flow-arrow">→</span>' : ''}`).join('') || ''}</div>`;
}

function buildInteraction(lesson) {
  if (lesson.type === 'lifecycle') return `<div class="activity-card"><strong>Trace the lifecycle</strong><p class="muted small">Open every stage. The full lifecycle is Data → Training → Model → Weights → Inference → Response.</p><div id="lifecycle-feedback" class="visual-feedback" aria-live="polite">0 / ${lesson.stages.length} stages explored.</div></div>`;
  if (lesson.type === 'open-classify') return `<div class="activity-card"><strong>Classify each statement</strong><p class="muted small">Decide what the statement primarily tells you.</p><div id="classification-controls" class="classification-controls"></div><div id="classification-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === 'model-hub') return `<div class="activity-card"><strong>Inspect the hub</strong><p class="muted small">Inspect at least two fictional models and notice the metadata.</p><div id="hub-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === 'inference') return `<div class="activity-card"><strong>Run local inference</strong><p class="muted small">Load the fictional weights, then run the prompt.</p><label class="sim-input">Prompt<input id="inference-prompt" value="Explain recursion."></label><div id="inference-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === 'cloud-local') return `<div class="activity-card"><strong>Scenario game</strong><div class="scenario-options"><button data-arch="cloud">☁️ Cloud</button><button data-arch="local">💻 Local</button><button data-arch="hybrid">🔄 Hybrid</button></div><div id="scenario-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === 'hardware') return `<div class="activity-card"><strong>Can my machine run this?</strong><div class="choice-row">${lesson.profiles.map((p) => `<button data-hardware="${p.id}">${p.label}</button>`).join('')}</div><div class="choice-row"><button data-model-size="Small">Small</button><button data-model-size="Medium">Medium</button><button data-model-size="Large">Large</button></div><div id="hardware-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === 'quantization') return `<div class="activity-card"><strong>Compare representations</strong><div class="precision-options"><button data-precision="higher">Higher precision</button><button data-precision="quantized">Quantized</button></div><div id="quant-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === 'ollama') return `<div class="activity-card"><strong>Follow the local runtime workflow</strong><div id="terminal-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === 'setup-builder') return `<div class="activity-card"><strong>Build your setup</strong><div class="setup-grid"><label>Goal<select id="setup-goal">${lesson.goals.map((x) => `<option>${x}</option>`).join('')}</select></label><label>Machine<select id="setup-machine">${lesson.machines.map((x) => `<option>${x}</option>`).join('')}</select></label><label>Model size<select id="setup-size">${lesson.sizes.map((x) => `<option>${x}</option>`).join('')}</select></label><label>Runtime<select id="setup-runtime">${lesson.runtimes.map((x) => `<option>${x}</option>`).join('')}</select></label><label>Deployment<select id="setup-deployment">${lesson.deployments.map((x) => `<option>${x}</option>`).join('')}</select></label></div><button class="secondary-action" id="build-setup">Generate architecture</button><div id="setup-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  return '';
}

function buildQuiz(lesson) {
  return `<h3>🧠 Quick check</h3><p>${esc(lesson.quiz.question)}</p><div class="quiz-options">${lesson.quiz.options.map((option, i) => `<button class="quiz-option" data-local-answer="${i}">${esc(option)}</button>`).join('')}</div><div class="quiz-feedback" id="local-quiz-feedback" aria-live="polite"></div>`;
}

function buildFinal(lesson) {
  return `<div class="final-boss"><span class="visual-label">SCENARIO</span><p>Choose a design that helps a developer experiment locally, keeps data on the machine when possible, and avoids sending every request to a cloud service.</p><div class="final-step"><strong>1. Deployment</strong><div class="choice-row">${lesson.deployments.map((x) => `<button data-final-field="deployment" data-final-value="${x}">${x}</button>`).join('')}</div></div><div class="final-step"><strong>2. Model category</strong><div class="choice-row">${lesson.modelSizes.map((x) => `<button data-final-field="modelSize" data-final-value="${x}">${x}</button>`).join('')}</div></div><div class="final-step"><strong>3. Runtime</strong><div class="choice-row">${lesson.runtimes.map((x) => `<button data-final-field="runtime" data-final-value="${x}">${x}</button>`).join('')}</div></div><div class="final-step"><strong>4. Hardware</strong><div class="choice-row">${lesson.hardware.map((x) => `<button data-final-field="hardware" data-final-value="${x}">${x}</button>`).join('')}</div></div><div class="final-step"><strong>5. Precision</strong><div class="choice-row">${lesson.precision.map((x) => `<button data-final-field="precision" data-final-value="${x}">${x}</button>`).join('')}</div></div><div class="final-step"><strong>6. Architecture</strong><button class="secondary-action" id="build-final-architecture">Construct architecture</button></div><div class="final-step"><strong>7. Why?</strong><div class="reason-grid">${lesson.reasons.map((x) => `<label><input type="checkbox" data-final-reason="${x}"> ${x}</label>`).join('')}</div></div><button class="primary-button" id="score-final">Evaluate architecture</button><div id="final-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
}

function bind() {
  const modal = $('#lesson-modal');
  modal.querySelectorAll('[data-stage]').forEach((button) => button.addEventListener('click', () => {
    lifecycleVisited.add(Number(button.dataset.stage));
    button.classList.add('selected');
    const stage = active.stages[Number(button.dataset.stage)];
    $('#lifecycle-feedback').textContent = `${lifecycleVisited.size} / ${active.stages.length} stages explored. ${stage[0]}: ${stage[1]}`;
    interactionPassed = lifecycleVisited.size === active.stages.length;
  }));

  if (active.type === 'open-classify') {
    const controls = $('#classification-controls');
    active.statements.forEach((item, index) => {
      const card = document.createElement('div'); card.className = 'classification-item';
      card.innerHTML = `<p>${esc(item.text)}</p>${active.choices.map(([value, label]) => `<button data-classify-index="${index}" data-classify-value="${value}">${label}</button>`).join('')}`;
      controls.appendChild(card);
    });
    controls.querySelectorAll('[data-classify-index]').forEach((button) => button.addEventListener('click', () => {
      const index = Number(button.dataset.classifyIndex); classified.add(index); const item = active.statements[index];
      controls.querySelectorAll(`[data-classify-index="${index}"]`).forEach((b) => b.classList.remove('selected'));
      button.classList.add('selected');
      $('#classification-feedback').textContent = button.dataset.classifyValue === item.answer ? `Correct. ${item.reason}` : `Not quite. ${item.reason}`;
      if (classified.size === active.statements.length) interactionPassed = true;
      $('#classification-progress').textContent = `${classified.size} / ${active.statements.length} classified`;
    }));
  }

  modal.querySelectorAll('[data-hub-model]').forEach((button) => button.addEventListener('click', () => {
    const model = active.models[Number(button.dataset.hubModel)]; hubInspected.add(Number(button.dataset.hubModel));
    $('#hub-details').innerHTML = `<strong>${esc(model.name)}</strong><p>${esc(model.description)}</p><div class="metadata-grid"><span>Task <b>${esc(model.task)}</b></span><span>Size <b>${esc(model.size)}</b></span><span>License <b>${esc(model.license)}</b></span><span>Context <b>${esc(model.context)}</b></span><span>Quantization <b>${esc(model.quantization)}</b></span><span>Hardware <b>${esc(model.hardware)}</b></span></div>`;
    $('#hub-feedback').textContent = `${hubInspected.size} model(s) inspected. Notice how task, size, license and hardware details all matter.`;
    if (hubInspected.size >= 2) interactionPassed = true;
  }));

  $('#load-model')?.addEventListener('click', () => { $('#inference-console').textContent = 'Loading model… → Allocating memory… → Preparing runtime… → Model ready.'; $('#load-model').disabled = true; $('#run-inference').disabled = false; });
  $('#run-inference')?.addEventListener('click', () => { $('#inference-console').textContent = `Processing “${$('#inference-prompt').value}”… → Inference complete → “Recursion solves a problem by defining a smaller version of the same problem.”`; $('#run-inference').disabled = true; interactionPassed = true; $('#inference-feedback').textContent = 'Inference simulated locally. Nothing was downloaded or executed.'; });

  modal.querySelectorAll('[data-arch]').forEach((button) => button.addEventListener('click', () => {
    const scenario = active.scenarios[Object.keys(scenarioAnswers).length]; if (!scenario) return;
    const choice = button.dataset.arch; scenarioAnswers[Object.keys(scenarioAnswers).length] = choice;
    $('#scenario-prompt').textContent = scenario.reason;
    $('#scenario-feedback').textContent = `${Object.keys(scenarioAnswers).length} / ${active.scenarios.length} scenarios answered. ${choice === scenario.answer ? 'Good fit.' : 'Consider the tradeoff.'}`;
    if (Object.keys(scenarioAnswers).length === active.scenarios.length) interactionPassed = true;
  }));
  if (active.type === 'cloud-local') {
    let current = 0;
    modal.querySelectorAll('[data-arch]').forEach((button) => button.addEventListener('click', () => { current += 1; if (current < active.scenarios.length) $('#scenario-prompt').textContent = active.scenarios[current].text; }));
    $('#scenario-prompt').textContent = active.scenarios[0].text;
  }

  let selectedHardware = null; let selectedSize = null;
  modal.querySelectorAll('[data-hardware]').forEach((button) => button.addEventListener('click', () => { selectedHardware = button.dataset.hardware; updateHardware(); }));
  modal.querySelectorAll('[data-model-size]').forEach((button) => button.addEventListener('click', () => { selectedSize = button.dataset.modelSize; updateHardware(); }));
  function updateHardware() {
    const profile = active.profiles.find((p) => p.id === selectedHardware); if (!profile) return;
    ['cpu','ram','gpu','vram'].forEach((key) => { const bar = $(`#hw-${key}`); if (bar) bar.style.width = `${profile[key]}%`; });
    if (selectedSize) { const fit = selectedSize === 'Small' ? '🟢 More likely to run on modest hardware' : selectedSize === 'Medium' ? (selectedHardware === 'basic' ? '🟡 May be impractical on this profile' : '🟡 May require stronger resources') : (selectedHardware === 'powerful' ? '🟡 Substantial resources are still needed' : '🔴 Usually requires substantial resources'); $('#hardware-result').textContent = `${profile.label}: ${fit}. ${profile.summary}`; $('#hardware-feedback').textContent = 'Actual requirements depend on architecture, precision, quantization, runtime, context length and workload.'; interactionPassed = true; }
  }

  modal.querySelectorAll('[data-precision]').forEach((button) => button.addEventListener('click', () => {
    modal.querySelectorAll('[data-precision]').forEach((b) => b.classList.remove('selected')); button.classList.add('selected');
    $('#quant-caption').textContent = button.dataset.precision === 'quantized' ? 'Quantization can reduce memory requirements, with quality/performance tradeoffs that depend on the model, hardware and runtime.' : 'Higher precision can preserve more numerical fidelity but generally requires more memory.';
    $('#quant-feedback').textContent = button.dataset.precision === 'quantized' ? 'Selected quantized representation.' : 'Selected higher precision.'; interactionPassed = true;
  }));

  $('#terminal-next')?.addEventListener('click', () => {
    if (ollamaStep >= active.commands.length) return;
    const [line, output] = active.commands[ollamaStep++]; $('#terminal-output').textContent = `${$('#terminal-output').textContent === '$ ready' ? '' : `${$('#terminal-output').textContent}\n`}\n${line}\n${output}`.trim();
    if (ollamaStep === active.commands.length) { interactionPassed = true; $('#terminal-feedback').textContent = 'Workflow complete: a runtime can help obtain/manage a model and run it locally. This was simulated.'; $('#terminal-next').disabled = true; }
  });

  $('#build-setup')?.addEventListener('click', () => {
    setupConfig = { goal: $('#setup-goal').value, machine: $('#setup-machine').value, size: $('#setup-size').value, runtime: $('#setup-runtime').value, deployment: $('#setup-deployment').value };
    $('#setup-flow').innerHTML = `<div class="stack-node">USER</div><i>↓</i><div class="stack-node">APPLICATION</div><i>↓</i><div class="stack-node">${esc(setupConfig.runtime.toUpperCase())}</div><i>↓</i><div class="stack-node">${esc(setupConfig.size.toUpperCase())} MODEL</div><i>↓</i><div class="stack-node">CPU / GPU</div><i>↓</i><div class="stack-node">OUTPUT</div>`;
    const note = setupConfig.deployment === 'Local' ? 'Local deployment keeps inference on the selected machine or local infrastructure.' : setupConfig.deployment === 'Hybrid' ? 'Hybrid deployment can route different workloads between local and cloud environments.' : 'Cloud deployment moves inference to remote infrastructure; this may simplify scaling and setup.';
    $('#setup-feedback').textContent = `${note} Goal: ${setupConfig.goal}. Machine: ${setupConfig.machine}. Model: ${setupConfig.size}. Runtime: ${setupConfig.runtime}.`;
    interactionPassed = true;
  });

  modal.querySelectorAll('[data-local-answer]').forEach((button) => button.addEventListener('click', () => {
    modal.querySelectorAll('[data-local-answer]').forEach((b) => b.classList.remove('selected')); button.classList.add('selected');
    quizPassed = Number(button.dataset.localAnswer) === active.quiz.answer;
    $('#local-quiz-feedback').textContent = quizPassed ? 'Correct ✓' : `Not quite. Try again.`;
    $('#local-quiz-feedback').className = `quiz-feedback ${quizPassed ? 'correct' : 'incorrect'}`;
  }));

  modal.querySelectorAll('[data-final-field]').forEach((button) => button.addEventListener('click', () => {
    finalConfig[button.dataset.finalField] = button.dataset.finalValue;
    modal.querySelectorAll(`[data-final-field="${button.dataset.finalField}"]`).forEach((b) => b.classList.remove('selected')); button.classList.add('selected');
    updateFinalPreview();
  }));
  modal.querySelectorAll('[data-final-reason]').forEach((input) => input.addEventListener('change', () => { if (input.checked) finalReasons.add(input.dataset.finalReason); else finalReasons.delete(input.dataset.finalReason); updateFinalScorePreview(); }));
  $('#build-final-architecture')?.addEventListener('click', () => { finalConfig.architecture = true; updateFinalPreview(); updateFinalScorePreview(); });
  $('#score-final')?.addEventListener('click', evaluateFinal);
  $('#complete-button')?.addEventListener('click', completeActive);
}

function updateFinalPreview() {
  const flow = $('#final-local-flow'); if (!flow) return;
  const c = finalConfig;
  flow.innerHTML = c.architecture ? '<div class="stack-node">USER</div><i>↓</i><div class="stack-node">APPLICATION</div><i>↓</i><div class="stack-node">LOCAL RUNTIME</div><i>↓</i><div class="stack-node">MODEL</div><i>↓</i><div class="stack-node">CPU / GPU</div><i>↓</i><div class="stack-node">INFERENCE → RESPONSE</div>' : 'Choose the components and construct the architecture.';
}
function calculateFinalScore() {
  const c = finalConfig; let score = 0;
  if (c.deployment === 'Local' || c.deployment === 'Hybrid') score += 15;
  if ((c.deployment === 'Local' || c.deployment === 'Hybrid') && c.runtime === 'Local runtime') score += 15;
  if (c.deployment === 'Cloud' && c.runtime === 'Cloud API') score += 15;
  if (c.deployment === 'Cloud' && c.runtime === 'Local runtime') score += 4;
  if (c.modelSize && ((c.hardware === 'Basic' && c.modelSize === 'Small') || (c.hardware === 'Moderate' && c.modelSize !== 'Large') || c.hardware === 'Powerful')) score += 15;
  if (c.hardware) score += 10;
  if (c.precision === 'Quantized') score += 10; else if (c.precision === 'Higher precision') score += 5;
  if (c.architecture) score += 20;
  const alignedReasons = new Set(['Privacy', 'Offline capability', 'Lower infrastructure dependency', 'Hardware constraints', 'Cost considerations']);
  const reasonFit = [...finalReasons].filter((reason) => alignedReasons.has(reason)).length;
  if (reasonFit >= 2) score += 15; else if (reasonFit === 1) score += 8;
  return Math.min(100, score);
}
function updateFinalScorePreview() { const score = calculateFinalScore(); if ($('#final-local-score')) $('#final-local-score').textContent = `${score}%`; }
function evaluateFinal() {
  const required = ['deployment','modelSize','runtime','hardware','precision'];
  if (!required.every((key) => finalConfig[key]) || !finalConfig.architecture || finalReasons.size === 0) { $('#final-feedback').textContent = 'Complete all seven design steps and choose at least one reason before evaluating.'; return; }
  const score = calculateFinalScore(); recordChallengeScore(state, 'local-final', score); saveState(state); updateFinalScorePreview();
  if (score >= 70) {
    interactionPassed = true; quizPassed = true; $('#final-feedback').className = 'visual-feedback success'; $('#final-feedback').textContent = `Architecture accepted at ${score}%. You made a logically consistent design.`;
    $('#score-final').disabled = true;
    completeLesson(state, active.id, active.xp); unlockLevel(state, 6); markLevelCompleted(state, 5); unlockAchievements(state, allKnownLessons); saveState(state); refreshShell(); renderLevel5(); renderAchievements();
  } else {
    $('#final-feedback').className = 'visual-feedback warning'; $('#final-feedback').textContent = `Score: ${score}%. Review the tradeoffs and retry. No XP was awarded.`;
  }
}

function completeActive() {
  if (!active || active.type === 'local-final' || state.completedLessons.includes(active.id)) return;
  if (!interactionPassed || !quizPassed) { const feedback = $('#modal-quiz'); feedback?.scrollIntoView({ behavior: 'smooth', block: 'center' }); if ($('#local-quiz-feedback')) $('#local-quiz-feedback').textContent = 'Finish the interactive activity and pass the quick check first.'; return; }
  completeLesson(state, active.id, active.xp); unlockAchievements(state, allKnownLessons); saveState(state); refreshState(); refreshShell(); renderLevel5(); renderAchievements(); $('#complete-button').disabled = true; $('#complete-button').textContent = 'Mission completed ✓';
  const reward = $('#reward-toast'); if (reward) { $('#reward-title').textContent = 'Mission Complete!'; $('#reward-copy').textContent = `+${active.xp} XP`; reward.hidden = false; setTimeout(() => { reward.hidden = true; }, 2200); }
}

function init() {
  renderLevel5(); renderAchievements(); refreshShell();
  document.addEventListener('click', (event) => { const button = event.target.closest('[data-local-lesson]'); if (button && !button.disabled) openLesson(button.dataset.localLesson); });
  window.addEventListener('ailearn-state-updated', () => { refreshState(); renderLevel5(); renderAchievements(); refreshShell(); });
  $('#modal-close')?.addEventListener('click', () => { $('#lesson-modal').hidden = true; });
}

init();