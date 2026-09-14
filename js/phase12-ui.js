import { phase12Lessons, phase12Achievements } from './phase12.js';
import { loadState, saveState, completeLesson, unlockAchievements, isLevelUnlocked, unlockLevel, markLevelCompleted, recordChallengeScore } from './state.js';

let state = loadState();
let active = null;
let activity = false;
let quizPassed = false;
let finalScore = null;
const $ = (s) => document.querySelector(s);
const esc = (v) => String(v).replace(/[&<>\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));

function render() {
  state = loadState();
  const open = isLevelUnlocked(state, 12);
  const done = phase12Lessons.filter((x) => state.completedLessons.includes(x.id)).length;
  const percent = Math.round(done / phase12Lessons.length * 100);
  const count = $('#advanced-count');
  if (count) count.textContent = `${done} / 10`;
  const pct = $('#advanced-progress-percent');
  if (pct) pct.textContent = `${percent}%`;
  const bar = $('#advanced-progress-bar');
  if (bar) bar.style.width = `${percent}%`;
  const note = $('#advanced-locked-note');
  if (note) note.hidden = open;
  document.querySelector('.advanced-agentic-section')?.classList.toggle('is-locked', !open);
  const list = $('#advanced-list');
  if (list) {
    list.innerHTML = phase12Lessons.map((lesson, i) => {
      const completed = state.completedLessons.includes(lesson.id);
      const locked = !open || (lesson.type === 'final' && !phase12Lessons.slice(0, -1).every((m) => state.completedLessons.includes(m.id)));
      return `<article class="lesson-card advanced-card ${completed ? 'completed' : ''} ${locked ? 'locked' : ''}">
        <div class="lesson-index">${completed ? '✓' : String(i + 1).padStart(2, '0')}</div>
        <div><h3>${esc(lesson.title)}</h3><p>${esc(lesson.description)}</p><div class="lesson-tags"><span class="tag">${lesson.difficulty}</span><span class="tag xp">+${lesson.xp} XP</span>${lesson.type === 'final' ? '<span class="tag challenge">FINAL</span>' : ''}</div></div>
        <button class="lesson-button" data-agentic-lesson="${lesson.id}" ${locked ? 'disabled' : ''}>${completed ? 'Review' : locked ? 'Locked' : lesson.type === 'final' ? 'Start Final Boss' : 'Start Mission'}</button>
      </article>`;
    }).join('');
  }
  renderAchievements();
  renderFinalPreview();
  updateHero();
}

function updateHero() {
  const heroCopy = document.querySelector('.hero-progress .muted.small');
  if (heroCopy) heroCopy.textContent = '114 missions · 7,270 XP available';
  const heroTitle = document.querySelector('.hero-progress strong');
  if (heroTitle) heroTitle.textContent = state.completedLessons.includes('agentic-10') ? 'Final Boss unlocked — build a real AI system next' : 'Design reliable, observable, safe, and efficient agentic systems';
}

function renderFinalPreview() {
  const card = $('#final-boss-preview');
  if (!card) return;
  const unlocked = state.completedLessons.includes('agentic-10');
  card.classList.toggle('unlocked', unlocked);
  const status = card.querySelector('[data-final-status]');
  if (status) status.textContent = unlocked ? 'UNLOCKED · COMING NEXT' : 'LOCKED · COMPLETE LEVEL 12';
  const action = card.querySelector('[data-final-action]');
  if (action) action.textContent = unlocked ? 'Coming next' : 'Locked';
}

function renderAchievements() {
  const list = $('#achievement-list');
  if (!list) return;
  list.querySelectorAll('[data-phase12]').forEach((node) => node.remove());
  phase12Achievements.forEach((achievement) => {
    const unlocked = state.achievements.includes(achievement.id);
    const node = document.createElement('article');
    node.className = `achievement ${unlocked ? 'unlocked' : ''}`;
    node.dataset.phase12 = achievement.id;
    node.innerHTML = `<div class="achievement-icon">${achievement.icon}</div><div><h3>${achievement.title} ${unlocked ? '✓' : ''}</h3><p>${achievement.description}</p></div>`;
    list.appendChild(node);
  });
}

function quizMarkup(lesson) {
  return `<h3>🧠 Knowledge check</h3><p>${esc(lesson.quiz.question)}</p><div class="quiz-options">${lesson.quiz.options.map((option, i) => `<button class="quiz-option" data-answer="${i}">${esc(option)}</button>`).join('')}</div><div class="quiz-feedback" id="advanced-quiz-feedback" aria-live="polite"></div>`;
}

function visual(lesson) {
  if (lesson.type === 'reliability') return `<div class="advanced-panel reliability-panel"><div class="reliability-flow"><span>USER</span><i>↓</i><span>AGENT</span><i>↓</i><span>TOOL</span><i>↓</i><span>RESULT</span></div><p class="simulation-label">ADD RELIABILITY CONTROLS</p><div class="control-grid">${lesson.components.map((c) => `<button class="control-toggle" data-reliability="${esc(c)}">＋ ${esc(c)}</button>`).join('')}</div><div class="tradeoff-grid"><div><small>RELIABILITY</small><strong id="rel-reliability">Low</strong></div><div><small>COST</small><strong id="rel-cost">Low</strong></div><div><small>LATENCY</small><strong id="rel-latency">Low</strong></div><div><small>COMPLEXITY</small><strong id="rel-complexity">Low</strong></div></div><div id="reliability-architecture" class="architecture-strip">Fragile path: Agent → Tool → Final Result</div><p class="simulation-note">Qualitative simulation only. Safeguards can help, but no architecture guarantees correctness.</p></div>`;
  if (lesson.type === 'planning') return `<div class="advanced-panel planning-panel"><div class="strategy-grid">${lesson.strategies.map((s, i) => `<button class="strategy-card" data-strategy="${i}"><strong>${s[0]}</strong><span>${s[1]}</span><small>＋ ${s[2]}<br>− ${s[3]}</small></button>`).join('')}</div><div class="scenario-card"><span class="simulation-label">CHOOSE A STRATEGY</span>${lesson.scenarios.map((s, i) => `<div class="planning-scenario"><strong>${esc(s[0])}</strong><div>${lesson.strategies.map((strategy) => `<button class="strategy-choice" data-planning="${i}" data-choice="${strategy[0]}">${strategy[0]}</button>`).join('')}</div><p id="planning-${i}" class="advanced-feedback"></p></div>`).join('')}</div></div>`;
  if (lesson.type === 'verification') return `<div class="advanced-panel verification-panel"><div class="verification-loop"><span>GENERATE</span><i>↓</i><span>CHECK</span><i>↓</i><span>PASS?</span><i>→</i><span>CONTINUE</span></div><div class="evidence-card"><strong>Agent output</strong><p>“Database migration completed successfully.”</p></div><div class="evidence-card error"><strong>Observed evidence</strong><p>2 migration checks failed.</p></div><div class="verification-actions"><button class="secondary-action" data-verify="trust">Trust agent</button><button class="primary-button" data-verify="verify">Verify claim</button><button class="secondary-action" data-verify="retry">Retry blindly</button></div><div id="verification-feedback" class="advanced-feedback"></div><div class="observable-list"><span>Generated output</span><span>Evaluation result</span><span>Detected issue</span><span>Revision action</span></div></div>`;
  if (lesson.type === 'contracts') return `<div class="advanced-panel contract-panel"><div class="contract-builder"><div><span class="simulation-label">AGENT CONTRACT BUILDER</span><div id="contract-fields">${lesson.fields.map((f, i) => `<button class="contract-field ${i < 3 ? 'selected' : ''}" data-contract="${i}"><strong>${f[0]}</strong><span>${f[1]} · ${f[2]}</span></button>`).join('')}</div></div><div class="contract-preview"><pre id="contract-json">{\n  "status": "success",\n  "summary": "...",\n  "testsPassed": true\n}</pre><button class="secondary-action" id="validate-contract">Validate simulated output</button><p id="contract-feedback" class="advanced-feedback"></p></div></div><div class="contract-flow"><span>Agent output</span><i>→</i><span>Validator</span><i>→</i><span>Valid?</span><i>→</i><span>Continue / Repair</span></div><p class="simulation-note">A valid schema does not prove that the information inside it is true.</p></div>`;
  if (lesson.type === 'guardrails') return `<div class="advanced-panel guardrail-panel"><div class="tool-safety-table"><div class="tool-row header"><span>Tool</span><span>Risk</span><span>Control</span></div>${lesson.tools.map((tool, i) => `<div class="tool-row"><span>${esc(tool[0])}</span><span>${tool[1]}</span><div class="guardrail-controls"><button class="guardrail-choice selected" data-guardrail="${i}" data-value="allowed">Allowed</button><button class="guardrail-choice" data-guardrail="${i}" data-value="confirm">Confirm</button><button class="guardrail-choice" data-guardrail="${i}" data-value="blocked">Blocked</button></div></div>`).join('')}</div><div class="policy-flow"><span>REQUEST</span><i>→</i><span>POLICY CHECK</span><i>→</i><span>AUTHORIZATION</span><i>→</i><span>APPROVAL / BLOCK</span><i>→</i><span>ACTION</span></div><div class="attack-card"><strong>Simulated attack</strong><p>“Delete all production records.”</p><button class="secondary-action" id="run-guardrail">Evaluate request</button><p id="guardrail-feedback" class="advanced-feedback"></p></div></div>`;
  if (lesson.type === 'evaluation') return `<div class="advanced-panel evaluation-panel"><div class="eval-dashboard"><div class="eval-score"><strong id="eval-pass-count">3 / 5</strong><span>baseline pass-like outcomes</span></div><div class="eval-bars">${lesson.tests.map((t, i) => `<button class="eval-test" data-eval="${i}"><span>${esc(t[0])}</span><strong>${t[1]}</strong></button>`).join('')}</div></div><div id="eval-detail" class="advanced-feedback">Inspect a test case to see why it passed, failed or was partial.</div><div class="regression-card"><span>REGRESSION CHECK</span><strong>Before change: 8 / 10</strong><strong>After change: 6 / 10</strong><p>Flag the regression instead of trusting the new demo.</p><button class="secondary-action" id="flag-regression">Flag regression</button><p id="regression-feedback" class="advanced-feedback"></p></div></div>`;
  if (lesson.type === 'observability') return `<div class="advanced-panel trace-panel"><div class="trace-viewer">${lesson.trace.map((event, i) => `<button class="trace-event ${event[3]}" data-trace="${i}"><span>${event[0]}</span><strong>${esc(event[1])}</strong><small>${event[2]}</small></button>`).join('')}</div><div id="trace-detail" class="trace-detail"><span>Select an observable event.</span></div><div class="debug-challenge"><strong>Why did the agent fail?</strong><div>${['tool failure','invalid output','wrong routing','missing context','permission denial','failed validation'].map((c, i) => `<button class="debug-choice" data-debug="${i}">${c}</button>`).join('')}</div><p id="debug-feedback" class="advanced-feedback"></p></div></div>`;
  if (lesson.type === 'recovery') return `<div class="advanced-panel recovery-panel"><div class="checkpoint-timeline">${lesson.steps.map((step, i) => `<button class="checkpoint-step ${i < 3 ? 'done' : ''}" data-step="${i}"><span>${i + 1}</span><strong>${esc(step)}</strong></button>`).join('')}</div><div class="failure-banner"><strong>Simulated failure after Step 4</strong><span>Current state saved at Checkpoint 2.</span></div><div class="recovery-actions">${['Retry','Fallback','Resume','Escalate','Abort'].map((a) => `<button class="recovery-choice" data-recovery="${a}">${a}</button>`).join('')}</div><div id="recovery-feedback" class="advanced-feedback"></div><div class="recovery-note"><strong>Retry ≠ Recovery</strong><span>Retry repeats an operation; recovery restores useful progress or changes the path.</span></div></div>`;
  if (lesson.type === 'optimizer') return `<div class="advanced-panel optimizer-panel"><div class="model-grid">${lesson.models.map((m, i) => `<button class="model-card" data-model="${i}"><strong>${m[0]}</strong><span>${m[1]}</span><span>${m[2]}</span><span>${m[3]}</span><small>${m[4]}</small></button>`).join('')}</div><div class="optimizer-scenarios">${lesson.scenarios.map((s, i) => `<div class="optimizer-scenario"><strong>${esc(s[0])}</strong><div>${lesson.models.map((m) => `<button class="model-choice" data-model-scenario="${i}" data-choice="${m[0]}">${m[0]}</button>`).join('')}</div><p id="model-scenario-${i}" class="advanced-feedback"></p></div>`).join('')}</div><div class="optimization-tips"><span>Remove unnecessary steps</span><span>Parallelize independent work when appropriate</span><span>Reuse/cache repeated work when appropriate</span></div></div>`;
  return finalBossVisual(lesson);
}

function finalBossVisual(lesson) {
  return `<div class="advanced-panel final-boss-panel"><div class="architecture-builder"><div class="component-palette"><span class="simulation-label">SELECT COMPONENTS</span>${lesson.components.map((c) => `<button class="architecture-component" data-component="${esc(c)}">＋ ${esc(c)}</button>`).join('')}</div><div class="architecture-canvas"><div class="canvas-header"><strong>ARCHITECTURE CANVAS</strong><span id="architecture-count">0 selected</span></div><div id="architecture-built" class="architecture-built"><span class="architecture-node root">USER</span></div><p class="simulation-note">Click components to add them. Build a conceptually valid system; do not use every component by default.</p></div></div><div class="boss-section"><h3>Architecture questions</h3><div id="boss-questions"></div></div><div class="boss-section"><h3>Debug the failure</h3><div class="boss-debug-grid">${lesson.debugging.map((d, i) => `<button class="boss-debug-case" data-boss-debug="${i}"><strong>${esc(d[0])}</strong><span>${esc(d[1])}</span></button>`).join('')}</div><p id="boss-debug-feedback" class="advanced-feedback"></p></div><div class="boss-section"><h3>Cost / latency tradeoff</h3><p>For fast autocomplete, choose the model tier that meets requirements without unnecessary capability.</p><div class="boss-model-choice">${['MODEL A','MODEL B','MODEL C'].map((m) => `<button data-boss-model="${m}">${m}</button>`).join('')}</div><p id="boss-model-feedback" class="advanced-feedback"></p></div><button class="primary-button" id="score-advanced-boss">Evaluate system</button><div id="advanced-boss-score" class="final-score">—</div><div id="advanced-boss-feedback" class="visual-feedback"></div></div>`;
}

function openLesson(id) {
  state = loadState();
  active = phase12Lessons.find((x) => x.id === id);
  if (!active || !isLevelUnlocked(state, 12)) return;
  if (active.type === 'final' && !phase12Lessons.slice(0, -1).every((x) => state.completedLessons.includes(x.id))) return;
  activity = false;
  quizPassed = false;
  finalScore = null;
  $('#modal-title').textContent = active.title;
  $('#modal-description').textContent = active.description;
  $('#modal-difficulty').textContent = active.difficulty;
  $('#modal-xp').textContent = `+${active.xp} XP`;
  $('#modal-objective').innerHTML = `<strong>Learning objective</strong><span>${esc(active.objective)}</span>`;
  $('#modal-visual').innerHTML = visual(active);
  $('#modal-content').innerHTML = `<p>${esc(active.objective)}</p><p class="advanced-note">Simulation only — no real agents, AI APIs, MCP servers, external tools, files, network requests or side effects are used.</p>`;
  $('#modal-interaction').innerHTML = '';
  $('#modal-quiz').innerHTML = active.type === 'final' ? '' : quizMarkup(active);
  $('#complete-button').hidden = active.type === 'final';
  $('#complete-button').disabled = state.completedLessons.includes(id);
  $('#complete-button').textContent = state.completedLessons.includes(id) ? 'Mission completed ✓' : `Complete mission · +${active.xp} XP`;
  $('#lesson-modal').hidden = false;
  bindInteractions();
  $('#modal-close').focus();
}

function markActivity() { activity = true; }

function bindInteractions() {
  document.querySelectorAll('[data-answer]').forEach((button) => button.onclick = () => {
    const correct = Number(button.dataset.answer) === active.quiz.answer;
    document.querySelectorAll('[data-answer]').forEach((b) => b.disabled = true);
    quizPassed = correct;
    markActivity();
    $('#advanced-quiz-feedback').textContent = correct ? 'Correct — concept understood.' : 'Not quite. Reopen the mission after reviewing the explanation and try again.';
    $('#advanced-quiz-feedback').classList.toggle('correct', correct);
  });

  document.querySelectorAll('[data-reliability]').forEach((button) => button.onclick = () => {
    button.classList.toggle('selected');
    const count = document.querySelectorAll('[data-reliability].selected').length;
    const levels = ['Low','Low','Medium','Medium','High','High'];
    $('#rel-reliability').textContent = levels[Math.min(count, 5)];
    $('#rel-cost').textContent = count >= 4 ? 'High' : count >= 2 ? 'Medium' : 'Low';
    $('#rel-latency').textContent = count >= 4 ? 'High' : count >= 2 ? 'Medium' : 'Low';
    $('#rel-complexity').textContent = count >= 5 ? 'High' : count >= 3 ? 'Medium' : 'Low';
    $('#reliability-architecture').textContent = count ? `Robustness layer: ${[...document.querySelectorAll('[data-reliability].selected')].map((b) => b.textContent.replace('＋ ','')).join(' · ')}` : 'Fragile path: Agent → Tool → Final Result';
    markActivity();
  });

  document.querySelectorAll('[data-strategy]').forEach((button) => button.onclick = () => {
    document.querySelectorAll('[data-strategy]').forEach((b) => b.classList.remove('selected'));
    button.classList.add('selected');
    markActivity();
  });
  document.querySelectorAll('[data-planning]').forEach((button) => button.onclick = () => {
    const i = Number(button.dataset.planning);
    const correct = button.dataset.choice === active.scenarios[i][1];
    $(`#planning-${i}`).textContent = correct ? 'Good fit — the task shape supports this strategy.' : 'Try again: consider predictability, uncertainty and dependencies.';
    markActivity();
  });

  document.querySelectorAll('[data-verify]').forEach((button) => button.onclick = () => {
    markActivity();
    const value = button.dataset.verify;
    $('#verification-feedback').textContent = value === 'verify' ? 'Correct: verify the claim against observable checks, then revise or escalate if needed.' : value === 'retry' ? 'Retrying without understanding the failed checks does not establish correctness.' : 'The evidence contradicts the claim, so trusting it would be unsafe.';
    if (value === 'verify') $('#verification-feedback').classList.add('correct');
  });

  document.querySelectorAll('[data-contract]').forEach((button) => button.onclick = () => { button.classList.toggle('selected'); markActivity(); });
  $('#validate-contract')?.addEventListener('click', () => { markActivity(); const selected = document.querySelectorAll('[data-contract].selected').length; $('#contract-feedback').textContent = selected >= 3 ? 'Structure accepted in the simulation. Remember: valid structure does not prove factual correctness.' : 'Contract incomplete — select the required fields before validation.'; });

  document.querySelectorAll('[data-guardrail]').forEach((button) => button.onclick = () => {
    const group = button.parentElement; group.querySelectorAll('button').forEach((b) => b.classList.remove('selected')); button.classList.add('selected'); markActivity();
  });
  $('#run-guardrail')?.addEventListener('click', () => { markActivity(); $('#guardrail-feedback').textContent = 'Policy check: destructive production deletion is restricted. Authorization and appropriate human approval are required before any simulated action.'; });

  document.querySelectorAll('[data-eval]').forEach((button) => button.onclick = () => { markActivity(); const t = active.tests[Number(button.dataset.eval)]; $('#eval-detail').textContent = `${t[0]} · ${t[1]} — ${t[2]}`; });
  $('#flag-regression')?.addEventListener('click', () => { markActivity(); $('#regression-feedback').textContent = 'Regression flagged: the changed system fell from 8/10 to 6/10 simulated passes.'; });

  document.querySelectorAll('[data-trace]').forEach((button) => button.onclick = () => { markActivity(); const e = active.trace[Number(button.dataset.trace)]; $('#trace-detail').innerHTML = `<strong>${esc(e[1])}</strong><span>Component: ${esc(e[2])}</span><span>Status: ${esc(e[3])}</span><span>Summary: ${esc(e[4])}</span>`; });
  document.querySelectorAll('[data-debug]').forEach((button) => button.onclick = () => { markActivity(); const correct = Number(button.dataset.debug) === 5; $('#debug-feedback').textContent = correct ? 'Correct: the trace shows the validator rejecting the output.' : 'Inspect the trace: the visible failure occurs at output validation.'; });

  document.querySelectorAll('[data-step]').forEach((button) => button.onclick = () => { markActivity(); const i = Number(button.dataset.step); $('#recovery-feedback').textContent = i < 4 ? `Checkpoint ${i < 3 ? 'available' : 'boundary'}: progress is observable and resumable.` : 'Later steps depend on the failed migration state.'; });
  document.querySelectorAll('[data-recovery]').forEach((button) => button.onclick = () => { markActivity(); const value = button.dataset.recovery; const good = value === 'Resume'; $('#recovery-feedback').textContent = good ? 'Strong recovery choice: resume from the saved checkpoint when the state is safe and the operation is resumable.' : value === 'Retry' ? 'Retry can help transient failures, but it is not the broad recovery strategy here.' : `${value} may be appropriate in other conditions; inspect the failure before choosing it.`; });

  document.querySelectorAll('[data-model]').forEach((button) => button.onclick = () => { document.querySelectorAll('[data-model]').forEach((b) => b.classList.remove('selected')); button.classList.add('selected'); markActivity(); });
  document.querySelectorAll('[data-model-scenario]').forEach((button) => button.onclick = () => { const i = Number(button.dataset.modelScenario); const correct = button.dataset.choice === active.scenarios[i][1]; $(`#model-scenario-${i}`).textContent = correct ? 'Good fit for the simulated requirement.' : 'Consider task complexity, latency, cost and quality requirements.'; markActivity(); });

  bindFinalBoss();
}

function bindFinalBoss() {
  if (active.type !== 'final') return;
  const selected = new Set();
  const architecture = $('#architecture-built');
  document.querySelectorAll('[data-component]').forEach((button) => button.onclick = () => {
    const component = button.dataset.component;
    if (selected.has(component)) return;
    selected.add(component); button.classList.add('selected'); button.disabled = true;
    const node = document.createElement('span'); node.className = 'architecture-node'; node.textContent = component;
    architecture.appendChild(node); $('#architecture-count').textContent = `${selected.size} selected`; markActivity();
  });

  const questions = $('#boss-questions');
  active.questions.forEach((q, i) => {
    const fieldset = document.createElement('fieldset');
    fieldset.className = 'boss-question';
    fieldset.innerHTML = `<legend>${i + 1}. ${esc(q[0])}</legend><div>${q[1].map((option, oi) => `<label><input type="radio" name="boss-q-${i}" value="${oi}"> ${esc(option)}</label>`).join('')}</div>`;
    questions.appendChild(fieldset);
  });
  questions.addEventListener('change', markActivity);

  document.querySelectorAll('[data-boss-debug]').forEach((button) => button.onclick = () => {
    markActivity();
    const d = active.debugging[Number(button.dataset.bossDebug)];
    $('#boss-debug-feedback').textContent = `${d[0]} → ${d[1]}. Mitigation: ${d[2]}.`;
    button.classList.add('selected');
  });
  document.querySelectorAll('[data-boss-model]').forEach((button) => button.onclick = () => {
    document.querySelectorAll('[data-boss-model]').forEach((b) => b.classList.remove('selected')); button.classList.add('selected'); markActivity();
    $('#boss-model-feedback').textContent = button.dataset.bossModel === active.modelScenario[1] ? 'Good tradeoff for the simulated fast-autocomplete requirement.' : 'This scenario is intentionally simple; avoid paying for unnecessary capability.';
  });
  $('#score-advanced-boss')?.addEventListener('click', () => scoreFinalBoss(selected));
}

function scoreFinalBoss(selected) {
  const answers = active.questions.map((_, i) => document.querySelector(`input[name="boss-q-${i}"]:checked`));
  const answered = answers.filter(Boolean).length;
  const correct = answers.reduce((sum, input, i) => sum + (input && Number(input.value) === active.questions[i][2] ? 1 : 0), 0);
  const questionScore = (correct / active.questions.length) * 60;
  const architectureCriteria = [
    ['Orchestrator', ['Orchestrator']],
    ['Planner', ['Planner']],
    ['Specialized agents', ['Research Agent','Code Agent','Test Agent','Review Agent']],
    ['Validator', ['Validator']],
    ['Guardrail', ['Guardrail']],
    ['Observability', ['Observability']],
    ['Recovery', ['Checkpoint','Retry / Recovery']],
    ['Human approval', ['Human Approval']]
  ];
  const architecturePoints = architectureCriteria.reduce((sum, [, options]) => sum + (options.some((c) => selected.has(c)) ? 2.5 : 0), 0);
  const debugSelected = document.querySelector('.boss-debug-case.selected');
  const debugPoints = debugSelected ? 10 : 0;
  const modelSelected = document.querySelector('[data-boss-model].selected');
  const modelPoints = modelSelected?.dataset.bossModel === active.modelScenario[1] ? 10 : 0;
  finalScore = Math.round(questionScore + architecturePoints + debugPoints + modelPoints);
  recordChallengeScore(state, 'agentic-system-final', finalScore);
  $('#advanced-boss-score').textContent = `${finalScore}%`;
  $('#advanced-boss-feedback').textContent = `${correct}/${active.questions.length} questions correct · ${answered}/${active.questions.length} answered · architecture ${Math.round(architecturePoints)}/20 · debugging ${debugPoints}/10 · model tradeoff ${modelPoints}/10.`;
  if (finalScore >= 70 && answered === active.questions.length && selected.size >= 4 && debugSelected && modelPoints === 10) {
    activity = true; quizPassed = true; completeFinalBoss();
  } else {
    quizPassed = false;
    $('#advanced-boss-feedback').textContent += ' Pass requires 70%, all questions answered, an architecture with core coordination/safety/reliability components, a debugging choice, and the appropriate model tradeoff.';
  }
}

function completeFinalBoss() {
  state = loadState();
  const completed = completeLesson(state, active.id, active.xp);
  unlockAchievements(state, phase12Lessons);
  if (phase12Lessons.every((lesson) => state.completedLessons.includes(lesson.id))) {
    unlockLevel(state, 13);
    markLevelCompleted(state, 12);
  }
  saveState(state);
  window.dispatchEvent(new CustomEvent('ailearn-state-updated'));
  $('#complete-button').hidden = true;
  $('#advanced-boss-feedback').textContent = `Passed at ${finalScore}%. Level 12 is complete. The Final Boss project is now unlocked as the next challenge.`;
  if (completed) showReward(`+${active.xp} XP`, 'AGENTIC SYSTEM ARCHITECT');
  render();
}

function completeMission() {
  if (!active || active.type === 'final') return;
  if (!activity || !quizPassed) {
    const feedback = $('#advanced-quiz-feedback');
    if (feedback) feedback.textContent = 'Complete the interactive simulation and answer the knowledge check correctly first.';
    return;
  }
  state = loadState();
  const completed = completeLesson(state, active.id, active.xp);
  if (!completed) return;
  unlockAchievements(state, phase12Lessons);
  saveState(state);
  window.dispatchEvent(new CustomEvent('ailearn-state-updated'));
  $('#complete-button').disabled = true;
  $('#complete-button').textContent = 'Mission completed ✓';
  showReward(`+${active.xp} XP`, active.title);
  render();
}

function showReward(copy, title) {
  const toast = $('#reward-toast');
  if (!toast) return;
  $('#reward-title').textContent = title;
  $('#reward-copy').textContent = copy;
  toast.hidden = false;
  window.clearTimeout(showReward.timer);
  showReward.timer = window.setTimeout(() => { toast.hidden = true; }, 2600);
}

document.addEventListener('click', (event) => {
  const lessonButton = event.target.closest('[data-agentic-lesson]');
  if (lessonButton) openLesson(lessonButton.dataset.agenticLesson);
  if (event.target.closest('#complete-button')) completeMission();
  if (event.target.closest('#modal-close')) $('#lesson-modal').hidden = true;
});
window.addEventListener('ailearn-state-updated', render);
render();