import {
  levels,
  foundationLessons,
  llmLessons,
  promptLessons,
  finalChallenge,
  achievements,
} from "./curriculum.js";
import {
  loadState,
  saveState,
  completeLesson,
  unlockAchievements,
  getLevelProgress,
  isLevelUnlocked,
  markLevelCompleted,
  unlockLevel,
  recordChallengeScore,
} from "./state.js";

let state = loadState();
let activeLesson = null;
let selectedAnswer = null;
let interactionPassed = false;
let generationIndex = 0;
let promptChallengeScore = null;
let promptFinalScore = null;

const $ = (selector) => document.querySelector(selector);
const allLessons = [
  ...foundationLessons,
  ...llmLessons,
  ...promptLessons,
  finalChallenge,
];
const levelTwoLessons = [...llmLessons, finalChallenge];
const levelThreeLessons = promptLessons;
const interactiveTypes = new Set([
  "use-case-match",
  "tokenizer",
  "embeddings",
  "attention",
  "generation",
  "sampling",
  "prompt-compare",
  "prompt-anatomy",
  "specificity-builder",
  "role-match",
  "few-shot",
  "output-format",
  "prompt-decompose",
  "refinement",
  "prompt-challenge",
]);

function render() {
  renderStats();
  renderRoadmap();
  renderFoundationLessons();
  renderLlmLessons();
  renderPromptLessons();
  renderAchievements();
}
function renderStats() {
  const progress = getLevelProgress(state.xp);
  const title = [
    "Beginner Explorer",
    "AI Learner",
    "AI Builder",
    "AI Engineer",
  ][Math.min(state.level - 1, 3)];
  const totalMissionCount =
    foundationLessons.length +
    levelTwoLessons.length +
    levelThreeLessons.length;
  const completedMissionCount = allLessons.filter((lesson) =>
    state.completedLessons.includes(lesson.id),
  ).length;
  const llmCompleted = levelTwoLessons.filter((lesson) =>
    state.completedLessons.includes(lesson.id),
  ).length;
  const promptCompleted = levelThreeLessons.filter((lesson) =>
    state.completedLessons.includes(lesson.id),
  ).length;
  $("#header-xp").textContent = `${state.xp} XP`;
  $("#level-value").textContent = state.level;
  $("#rank-value").textContent = title;
  $("#title-value").textContent = title;
  $("#streak-value").textContent = state.streak;
  $("#completed-value").textContent = completedMissionCount;
  $("#xp-progress").textContent = `${progress.current} / ${progress.total} XP`;
  $("#xp-bar").style.width = `${progress.percent}%`;
  $("#hero-progress").textContent =
    `${Math.round((completedMissionCount / totalMissionCount) * 100)}%`;
  $("#foundation-count").textContent =
    `${foundationLessons.filter((lesson) => state.completedLessons.includes(lesson.id)).length} / ${foundationLessons.length}`;
  $("#llm-count").textContent = `${llmCompleted} / ${levelTwoLessons.length}`;
  $("#prompt-count").textContent =
    `${promptCompleted} / ${levelThreeLessons.length}`;
  const promptPercent = Math.round(
    (promptCompleted / levelThreeLessons.length) * 100,
  );
  $("#prompt-progress-percent").textContent = `${promptPercent}%`;
  $("#prompt-progress-bar").style.width = `${promptPercent}%`;
}
function renderRoadmap() {
  $("#roadmap-list").innerHTML = levels
    .map((level) => {
      const unlocked = isLevelUnlocked(state, level.id);
      const completed = state.completedLevels.includes(level.id);
      return `<article class="roadmap-node ${unlocked ? "unlocked" : ""} ${completed ? "completed" : ""}"><span class="roadmap-number">LEVEL ${level.id}</span><span class="roadmap-status" aria-label="${completed ? "Completed" : unlocked ? "Unlocked" : "Locked"}">${completed ? "✓" : unlocked ? "●" : "⌑"}</span><h3>${level.title.toUpperCase()}</h3><p>${level.description}</p></article>`;
    })
    .join("");
}
function lessonCard(lesson, index, locked = false) {
  const completed = state.completedLessons.includes(lesson.id);
  const label = completed
    ? "Review"
    : locked
      ? "Locked"
      : lesson.type === "final"
        ? "Start Challenge"
        : lesson.type === "prompt-final"
          ? "Start Final Boss"
          : "Start Mission";
  return `<article class="lesson-card ${completed ? "completed" : ""} ${locked ? "locked" : ""}"><div class="lesson-index">${completed ? "✓" : String(index + 1).padStart(2, "0")}</div><div><h3>${lesson.title}</h3><p>${lesson.description}</p><div class="lesson-tags"><span class="tag">${lesson.difficulty}</span><span class="tag xp">+${lesson.xp} XP</span>${lesson.type === "final" || lesson.type === "prompt-final" ? '<span class="tag challenge">FINAL</span>' : ""}</div></div><button class="lesson-button" data-lesson="${lesson.id}" ${locked ? "disabled" : ""}>${label}</button></article>`;
}
function renderFoundationLessons() {
  $("#foundation-list").innerHTML = foundationLessons
    .map((lesson, index) => lessonCard(lesson, index))
    .join("");
}
function renderLlmLessons() {
  const unlocked = isLevelUnlocked(state, 2);
  const completed = levelTwoLessons.filter((lesson) =>
    state.completedLessons.includes(lesson.id),
  ).length;
  const percent = Math.round((completed / levelTwoLessons.length) * 100);
  const previousMissionsComplete = llmLessons.every((lesson) =>
    state.completedLessons.includes(lesson.id),
  );
  $("#llm-progress-bar").style.width = `${percent}%`;
  $("#llm-progress-percent").textContent = `${percent}%`;
  $("#llm-list").innerHTML = levelTwoLessons
    .map((lesson, index) =>
      lessonCard(
        lesson,
        index,
        !unlocked || (lesson.type === "final" && !previousMissionsComplete),
      ),
    )
    .join("");
  $("#llm-locked-note").hidden = unlocked;
  $(".llm-section").classList.toggle("is-locked", !unlocked);
}
function renderPromptLessons() {
  const unlocked = isLevelUnlocked(state, 3);
  const completed = levelThreeLessons.filter((lesson) =>
    state.completedLessons.includes(lesson.id),
  ).length;
  const previousMissionsComplete = levelThreeLessons
    .slice(0, -1)
    .every((lesson) => state.completedLessons.includes(lesson.id));
  const percent = Math.round((completed / levelThreeLessons.length) * 100);
  $("#prompt-progress-bar").style.width = `${percent}%`;
  $("#prompt-progress-percent").textContent = `${percent}%`;
  $("#prompt-locked-note").hidden = unlocked;
  $(".prompt-section").classList.toggle("is-locked", !unlocked);
  $("#prompt-list").innerHTML = levelThreeLessons
    .map((lesson, index) =>
      lessonCard(
        lesson,
        index,
        !unlocked ||
          (lesson.type === "prompt-final" && !previousMissionsComplete),
      ),
    )
    .join("");
  const labNote = $("#prompt-lab-score-note");
  const finalNote = $("#prompt-score-note");
  if (labNote && state.challengeScores["prompt-challenge"] !== undefined)
    labNote.textContent = `Latest challenge score: ${state.challengeScores["prompt-challenge"]}%`;
  if (finalNote && state.challengeScores["prompt-final"] !== undefined)
    finalNote.textContent = `Best final score: ${state.challengeScores["prompt-final"]}%`;
}
function renderAchievements() {
  $("#achievement-list").innerHTML = achievements
    .map((item) => {
      const unlocked = state.achievements.includes(item.id);
      return `<article class="achievement ${unlocked ? "unlocked" : ""}"><div class="achievement-icon">${item.icon}</div><div><h3>${item.title} ${unlocked ? "✓" : ""}</h3><p>${item.description}</p></div></article>`;
    })
    .join("");
}

function openLesson(id) {
  activeLesson = allLessons.find((lesson) => lesson.id === id);
  if (!activeLesson) return;
  if (activeLesson.id.startsWith("llm-") && !isLevelUnlocked(state, 2)) return;
  if (activeLesson.id.startsWith("prompt-") && !isLevelUnlocked(state, 3))
    return;
  if (
    activeLesson.type === "final" &&
    (!isLevelUnlocked(state, 2) ||
      !llmLessons.every((lesson) => state.completedLessons.includes(lesson.id)))
  )
    return;
  if (
    activeLesson.type === "prompt-final" &&
    (!isLevelUnlocked(state, 3) ||
      !levelThreeLessons
        .slice(0, -1)
        .every((lesson) => state.completedLessons.includes(lesson.id)))
  )
    return;
  selectedAnswer = null;
  interactionPassed = !interactiveTypes.has(activeLesson.type);
  generationIndex = 0;
  promptChallengeScore = null;
  promptFinalScore = null;
  $("#modal-title").textContent = activeLesson.title;
  $("#modal-description").textContent = activeLesson.description;
  $("#modal-difficulty").textContent = activeLesson.difficulty;
  $("#modal-xp").textContent = `+${activeLesson.xp} XP`;
  $("#modal-objective").innerHTML =
    `<strong>Learning objective</strong><span>${activeLesson.objective}</span>`;
  $("#modal-content").innerHTML = activeLesson.content;
  $("#modal-visual").innerHTML = buildVisual(activeLesson);
  $("#modal-interaction").innerHTML = buildInteraction(activeLesson);
  $("#modal-quiz").innerHTML =
    activeLesson.type === "final"
      ? buildFinalChallenge(activeLesson)
      : activeLesson.type === "prompt-final"
        ? buildPromptFinal(activeLesson)
        : buildQuiz(activeLesson);
  $("#complete-button").hidden =
    activeLesson.type === "final" || activeLesson.type === "prompt-final";
  $("#complete-button").disabled = state.completedLessons.includes(id);
  $("#complete-button").textContent = state.completedLessons.includes(id)
    ? "Mission completed ✓"
    : `Complete mission · +${activeLesson.xp} XP`;
  $("#lesson-modal").hidden = false;
  $("#modal-close").focus();
  bindLessonInteractions();
}

function buildVisual(lesson) {
  if (lesson.type === "llm-intro")
    return `<div class="concept-card"><span class="concept-kicker">MENTAL MODEL</span><strong>Advanced autocomplete</strong><p>Learned patterns + context → generated continuation.</p></div>`;
  if (lesson.type === "attention")
    return `<div class="attention-visual"><p class="visual-label">CONCEPTUAL ATTENTION VIEW</p><div class="attention-tokens">${lesson.visual.map((token) => `<button class="attention-token" data-focus-token="${token}">${token}</button>`).join("")}</div><p class="visual-hint">Select a token to explore relationships.</p><div id="attention-feedback" class="visual-feedback" aria-live="polite">Try selecting <strong>cheese</strong>.</div></div>`;
  if (lesson.type === "generation")
    return `<div class="generation-visual"><p class="visual-label">NEXT-TOKEN PREDICTION</p><div class="generation-context" id="generation-context">${lesson.generation.prompt}</div><div class="generation-probs" id="generation-probs"></div><button class="secondary-action" id="generate-token">Generate next token</button><p class="simulation-note">Illustrative probabilities · not real model inference</p></div>`;
  if (lesson.type === "sampling")
    return `<div class="sampling-visual"><p class="visual-label">GENERATION PARAMETER SIMULATION</p><div class="sampling-prompt">The robot walked into the...</div><div class="sampling-controls"><label>Temperature <output id="temperature-value">0.7</output><input id="temperature-slider" type="range" min="0.1" max="1.2" value="0.7" step="0.1"></label><label>Top-k <output id="top-k-value">3</output><input id="top-k-slider" type="range" min="1" max="6" value="3" step="1"></label><label>Top-p <output id="top-p-value">0.70</output><input id="top-p-slider" type="range" min="0.3" max="1" value="0.7" step="0.05"></label></div><div id="sampling-bars"></div><div class="sampling-explanation" id="sampling-explanation"></div><p class="simulation-note">Illustrative probabilities · not real inference</p></div>`;
  if (lesson.type === "tokenizer")
    return `<div class="token-visual"><p class="visual-label">EDUCATIONAL TOKENIZATION SIMULATION</p><div class="token-input-row"><input id="token-input" value="I love building AI apps" aria-label="Text to tokenize"><button class="secondary-action" id="tokenize-button">Tokenize</button></div><div id="token-output" class="token-output"></div><p class="simulation-note">Educational simulation — real tokenizers can split text differently.</p></div>`;
  if (lesson.type === "embeddings")
    return `<div class="embedding-visual"><p class="visual-label">CONCEPTUAL VECTOR SPACE</p><div class="vector-space"><span class="axis-label axis-y">sweet ↑</span><span class="axis-label axis-x">savory →</span><button class="vector-point apple" data-point="Apple">🍎 <small>apple</small></button><button class="vector-point cheese" data-point="Cheese">🧀 <small>cheese</small></button><button class="vector-point milk" data-point="Milk">🥛 <small>milk</small></button></div><div id="embedding-feedback" class="visual-feedback">Click a point to see its illustrative relationship.</div></div>`;
  if (lesson.type === "parameters")
    return `<div class="parameter-visual"><p class="visual-label">MODEL PARAMETERS · CONCEPTUAL</p><div class="parameter-stack">${Array.from({ length: 12 }, (_, i) => `<span style="--i:${i}">weight</span>`).join("")}</div><div class="model-size-row"><div><strong>Small</strong><span>████</span></div><div><strong>Medium</strong><span>████████</span></div><div><strong>Large</strong><span>████████████████</span></div></div></div>`;
  if (lesson.type === "prompt-compare")
    return `<div class="prompt-compare-visual"><p class="visual-label">BEFORE → AFTER</p><div class="prompt-compare-grid"><div><span>VAGUE</span><p>${lesson.pairs[0].weak}</p></div><div class="compare-arrow">→</div><div class="strong-prompt"><span>CLEARER</span><p>${lesson.pairs[0].strong}</p></div></div></div>`;
  if (lesson.type === "prompt-anatomy")
    return `<div class="prompt-anatomy-visual">${lesson.anatomy.map((part) => `<button class="anatomy-block" data-anatomy="${part.answer}"><strong>${part.label}</strong><span>${part.text}</span></button>`).join('<span class="anatomy-arrow">↓</span>')}<div id="anatomy-feedback" class="visual-feedback" aria-live="polite">Click a component.</div></div>`;
  if (lesson.type === "specificity-builder")
    return `<div class="prompt-preview"><span class="visual-label">LIVE PROMPT</span><p id="specificity-preview">Explain databases.</p></div>`;
  if (lesson.type === "role-match")
    return `<div class="role-visual"><span class="visual-label">TASK</span><strong>${lesson.task}</strong><div class="role-prompt-preview" id="role-preview">Choose a role below.</div></div>`;
  if (lesson.type === "few-shot")
    return `<div class="few-shot-visual"><span class="visual-label">FEW-SHOT PATTERN</span><div class="example-stack">${lesson.examples.map(([input, output]) => `<div><span>${input}</span><strong>→ ${output}</strong></div>`).join("")}</div><div class="zero-vs-few"><span>ZERO-SHOT: task only</span><span>FEW-SHOT: task + examples</span></div></div>`;
  if (lesson.type === "output-format")
    return `<div class="output-preview"><span class="visual-label">REQUESTED STRUCTURE</span><pre id="output-preview-code">${escapeHtml(lesson.json)}</pre><div class="simulation-note">Format request shown conceptually — validate structured output in real applications.</div></div>`;
  if (lesson.type === "prompt-decompose")
    return `<div class="decompose-visual">${Object.entries(lesson.prompt)
      .map(
        ([key, value]) =>
          `<button class="decompose-block" data-decompose="${key}"><strong>${key.toUpperCase()}</strong><span>${value}</span></button>`,
      )
      .join("")}</div>`;
  if (lesson.type === "refinement")
    return `<div class="refinement-visual"><div class="refinement-meter"><span id="refinement-percent">20%</span><div><i id="refinement-bar"></i></div></div><div id="refinement-prompt" class="refinement-prompt">${lesson.refinement[0].text}</div><div id="coverage-list" class="coverage-list"></div></div>`;
  if (lesson.type === "prompt-challenge")
    return `<div class="challenge-overview"><span class="visual-label">COMPONENT-BASED EVALUATION</span><p>Requirements are checked per scenario. Character count does not decide the score.</p><div class="coverage-chip-row"><span>ROLE</span><span>GOAL</span><span>CONTEXT</span><span>INPUT</span><span>CONSTRAINTS</span><span>OUTPUT</span><span>EXAMPLES</span></div></div>`;
  if (lesson.type === "prompt-final")
    return `<div class="final-prompt-preview"><span class="visual-label">YOUR FINAL PROMPT</span><pre id="prompt-final-preview">Select components to assemble your prompt.</pre></div>`;
  return `<div class="flow">${lesson.visual.map((step, i) => `<span class="flow-step">${step}</span>${i < lesson.visual.length - 1 ? '<span class="flow-arrow">→</span>' : ""}`).join("")}</div>`;
}

function buildInteraction(lesson) {
  if (lesson.type === "use-case-match")
    return `<div class="activity-card"><div class="activity-heading"><strong>Match the use case</strong><span>Pick the best category.</span></div><div id="match-activity" class="match-list"></div><div id="match-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "attention")
    return `<div class="activity-card"><div class="activity-heading"><strong>Attention challenge</strong><span>Select useful context words.</span></div><div class="attention-challenge">${["Most", "famous", "cheese", "France", "banana", "car"].map((word) => `<button class="challenge-token" data-challenge-token="${word}">${word}</button>`).join("")}</div><button class="secondary-action" id="check-attention">Check selection</button><div id="attention-challenge-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "prompt-compare")
    return `<div class="activity-card"><strong>Which prompt is stronger?</strong><p class="muted small">Choose the stronger prompt in each pair.</p><div id="compare-choices" class="compare-choice-list"></div><div id="compare-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "prompt-anatomy")
    return `<div class="activity-card"><strong>Mini challenge</strong><p class="muted small">Identify each part of a LinkedIn bio prompt.</p><div id="anatomy-quiz" class="anatomy-quiz"></div><button class="secondary-action" id="check-anatomy">Check anatomy</button><div id="anatomy-quiz-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "specificity-builder")
    return `<div class="activity-card"><strong>Add useful guidance</strong><div id="specificity-fields" class="builder-grid"></div><button class="secondary-action" id="check-specificity">Build prompt</button><div id="specificity-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "role-match")
    return `<div class="activity-card"><strong>Pick the role that best fits the task.</strong><div class="role-options">${lesson.roles.map((role) => `<button class="role-option" data-role="${role}">${role}</button>`).join("")}</div><div id="role-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "few-shot")
    return `<div class="activity-card"><strong>Classify the new examples</strong><div class="few-shot-tests">${lesson.tests.map((text, index) => `<fieldset><legend>${text}</legend><div class="label-options">${lesson.labels.map((label) => `<button class="label-option" data-test-index="${index}" data-label="${label}">${label}</button>`).join("")}</div></fieldset>`).join("")}</div><button class="secondary-action" id="check-few-shot">Check classifications</button><div id="few-shot-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "output-format")
    return `<div class="activity-card"><strong>Select the most useful output format for extraction.</strong><div class="format-options">${lesson.formats.map((format) => `<button class="format-option" data-format="${format.id}">${format.label}</button>`).join("")}</div><div id="format-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "prompt-decompose")
    return `<div class="activity-card"><strong>Identify each component</strong><p class="muted small">Match the prompt blocks to their job.</p><div id="decompose-quiz" class="decompose-quiz"></div><button class="secondary-action" id="check-decompose">Check decomposition</button><div id="decompose-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "refinement")
    return `<div class="activity-card"><strong>Refine the prompt</strong><p class="muted small">Advance through the improvements and inspect the guidance coverage.</p><div class="refinement-controls"><button class="secondary-action" id="refine-back">Previous</button><strong id="refinement-step">Step 1 / ${lesson.refinement.length}</strong><button class="secondary-action" id="refine-next">Improve prompt</button></div><div id="refinement-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "prompt-challenge")
    return `<div class="activity-card"><div class="scenario-tabs" id="scenario-tabs"></div><div id="scenario-panel"></div><button class="secondary-action" id="check-prompt-challenge">Check scenario</button><div id="prompt-challenge-feedback" class="visual-feedback" aria-live="polite"></div><div id="prompt-lab-score-note" class="challenge-score-note"></div></div>`;
  return "";
}
function buildQuiz(lesson) {
  return `<h3>🧠 Quick check</h3><p>${lesson.quiz.question}</p><div class="quiz-options">${lesson.quiz.options.map((option, i) => `<button class="quiz-option" data-answer="${i}">${option}</button>`).join("")}</div><div class="quiz-feedback" id="quiz-feedback" aria-live="polite"></div>`;
}
function buildFinalChallenge(challenge) {
  return `<div class="final-challenge"><div class="challenge-header"><span>FINAL BOSS</span><strong>70% to pass</strong></div><p class="challenge-intro">10 questions across tokens, embeddings, attention, prediction, parameters and sampling.</p><div id="final-questions">${challenge.questions.map((question, index) => buildFinalQuestion(question, index)).join("")}</div><button class="primary-button" id="submit-final">Submit challenge</button><div id="final-result" class="final-result" aria-live="polite"></div></div>`;
}
function buildFinalQuestion(question, index) {
  if (question.type === "short")
    return `<fieldset class="final-question" data-final-index="${index}"><legend>${index + 1}. ${question.question}</legend><input class="short-answer" data-final-short type="text" placeholder="Example: It predicts the next token..." aria-label="Short answer"></fieldset>`;
  if (question.type === "order")
    return `<fieldset class="final-question" data-final-index="${index}"><legend>${index + 1}. ${question.question}</legend><p class="question-note">Click an item to move it one position upward.</p><div class="order-list">${question.order.map((item, i) => `<button type="button" class="order-item" data-order-item="${i}">${i + 1}. ${item}</button>`).join("")}</div></fieldset>`;
  return `<fieldset class="final-question" data-final-index="${index}"><legend>${index + 1}. ${question.question}</legend><div class="quiz-options">${question.options.map((option, i) => `<button type="button" class="quiz-option final-option" data-final-answer="${i}">${option}</button>`).join("")}</div></fieldset>`;
}
function buildPromptFinal(lesson) {
  return `<div class="prompt-final-builder"><div class="final-stage"><span class="stage-number">1</span><div><strong>Choose components</strong><p>Select the guidance that belongs in the final prompt.</p></div></div><div class="final-component-grid" id="final-component-grid">${lesson.finalComponents.map((component) => `<button class="final-component" data-final-component="${component.id}"><span>${component.label}</span><strong>${component.text}</strong></button>`).join("")}</div><div class="final-stage"><span class="stage-number">2</span><div><strong>Review your prompt</strong><p>Make sure the assembled instructions are coherent.</p></div></div><pre id="prompt-final-review" class="prompt-review">Select components to build your prompt.</pre><button class="primary-button" id="submit-prompt-final">Submit Final Boss</button><div id="prompt-final-result" class="final-result" aria-live="polite"></div><div id="prompt-score-note" class="challenge-score-note"></div></div>`;
}

function bindLessonInteractions() {
  document
    .querySelectorAll("[data-answer]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        answerQuiz(Number(button.dataset.answer)),
      ),
    );
  if (activeLesson.type === "tokenizer") {
    tokenize();
    $("#tokenize-button").addEventListener("click", tokenize);
  }
  if (activeLesson.type === "embeddings")
    document.querySelectorAll("[data-point]").forEach((button) =>
      button.addEventListener("click", () => {
        $("#embedding-feedback").textContent =
          `${button.dataset.point} is shown in an illustrative position. Real embedding spaces are learned from data and are not this simple 2D map.`;
        interactionPassed = true;
      }),
    );
  if (activeLesson.type === "attention") bindAttention();
  if (activeLesson.type === "use-case-match") buildMatchActivity();
  if (activeLesson.type === "generation") renderGeneration();
  if (activeLesson.type === "sampling") renderSampling();
  if (activeLesson.type === "prompt-compare") bindPromptCompare();
  if (activeLesson.type === "prompt-anatomy") bindPromptAnatomy();
  if (activeLesson.type === "specificity-builder") bindSpecificityBuilder();
  if (activeLesson.type === "role-match") bindRoleMatch();
  if (activeLesson.type === "few-shot") bindFewShot();
  if (activeLesson.type === "output-format") bindOutputFormat();
  if (activeLesson.type === "prompt-decompose") bindPromptDecompose();
  if (activeLesson.type === "refinement") bindRefinement();
  if (activeLesson.type === "prompt-challenge") bindPromptChallenge();
  if (activeLesson.type === "prompt-final") bindPromptFinal();
  document.querySelectorAll("[data-final-answer]").forEach((button) =>
    button.addEventListener("click", () => {
      const question = button.closest(".final-question");
      question
        .querySelectorAll("[data-final-answer]")
        .forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
    }),
  );
  document.querySelectorAll("[data-order-item]").forEach((button) =>
    button.addEventListener("click", () => {
      const list = button.parentElement;
      const buttons = [...list.children];
      const current = buttons.indexOf(button);
      if (current > 0) list.insertBefore(button, buttons[current - 1]);
      updateOrderLabels(list);
    }),
  );
  if (activeLesson.type === "final")
    $("#submit-final").addEventListener("click", submitFinal);
  $("#complete-button").addEventListener("click", finishLesson);
}
function updateOrderLabels(list) {
  [...list.children].forEach((button, index) => {
    button.textContent = `${index + 1}. ${button.textContent.replace(/^\d+\.\s*/, "")}`;
  });
}
function answerQuiz(answer) {
  selectedAnswer = answer;
  document
    .querySelectorAll("[data-answer]")
    .forEach((button, index) =>
      button.classList.toggle("selected", index === answer),
    );
  const correct = answer === activeLesson.quiz.answer;
  $("#quiz-feedback").textContent = correct
    ? "Correct — nice work."
    : "Not quite. Try again.";
}
function markInteractionPassed(message, selector) {
  interactionPassed = true;
  if (selector && $(selector)) $(selector).textContent = message;
}
function finishLesson() {
  if (
    !activeLesson ||
    activeLesson.type === "final" ||
    activeLesson.type === "prompt-final" ||
    state.completedLessons.includes(activeLesson.id)
  )
    return;
  if (activeLesson.quiz && selectedAnswer !== activeLesson.quiz.answer) {
    $("#quiz-feedback").textContent =
      "Answer the quick check correctly before completing the mission.";
    return;
  }
  if (!interactionPassed) {
    const target = $("#quiz-feedback") || $("#modal-content");
    target.textContent =
      "Complete the interactive task before finishing this mission.";
    return;
  }
  const previousLevel = state.level;
  completeLesson(state, activeLesson.id, activeLesson.xp);
  if (
    foundationLessons.every((lesson) =>
      state.completedLessons.includes(lesson.id),
    )
  ) {
    unlockLevel(state, 2);
    markLevelCompleted(state, 1);
  }
  if (
    llmLessons.every((lesson) => state.completedLessons.includes(lesson.id)) &&
    state.completedLessons.includes("llm-final")
  ) {
    unlockLevel(state, 3);
    markLevelCompleted(state, 2);
  }
  if (
    promptLessons.every((lesson) => state.completedLessons.includes(lesson.id))
  ) {
    unlockLevel(state, 4);
    markLevelCompleted(state, 3);
  }
  const newAchievements = unlockAchievements(state, allLessons);
  saveState(state);
  render();
  const achievementText = newAchievements.length
    ? ` · ${newAchievements
        .map((id) => achievements.find((item) => item.id === id)?.title)
        .filter(Boolean)
        .join(" · ")}`
    : "";
  showReward(
    `+${activeLesson.xp} XP${achievementText}`,
    previousLevel !== state.level
      ? `Level ${state.level} reached!`
      : "Mission Complete!",
  );
  closeLesson();
}
function bindAttention() {
  document.querySelectorAll("[data-focus-token]").forEach((button) =>
    button.addEventListener("click", () => {
      document
        .querySelectorAll(".attention-token")
        .forEach((item) => item.classList.remove("related"));
      const relatedWords =
        button.textContent === "cheese"
          ? ["cheese", "famous", "France"]
          : [button.textContent];
      document.querySelectorAll("[data-focus-token]").forEach((item) => {
        if (relatedWords.includes(item.textContent))
          item.classList.add("related");
      });
      $("#attention-feedback").innerHTML =
        `Conceptually, the model can give different importance to relationships involving <strong>${relatedWords.join(", ")}</strong>.`;
    }),
  );
  document
    .querySelectorAll("[data-challenge-token]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        button.classList.toggle("selected"),
      ),
    );
  $("#check-attention").addEventListener("click", () => {
    const selected = [
      ...document.querySelectorAll("[data-challenge-token].selected"),
    ].map((button) => button.dataset.challengeToken);
    const expected = ["famous", "cheese", "France"];
    const correct =
      selected.length === expected.length &&
      expected.every((word) => selected.includes(word));
    markInteractionPassed(
      correct
        ? "Strong selection. Those tokens provide useful context."
        : "Try again — focus on subject and context words.",
      "#attention-challenge-feedback",
    );
  });
}
function tokenize() {
  const input = $("#token-input").value.trim();
  const words = input
    ? input.match(/[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu) || []
    : [];
  $("#token-output").innerHTML = words.length
    ? words
        .map(
          (token, index) =>
            `<span class="sim-token" style="--delay:${index * 70}ms">${escapeHtml(token)}</span>`,
        )
        .join("")
    : '<span class="muted">Type something to see the simulation.</span>';
  if (words.length) interactionPassed = true;
}
function buildMatchActivity() {
  const container = $("#match-activity");
  const categories = [
    ...new Set(activeLesson.matches.map((match) => match[1])),
  ];
  container.innerHTML =
    activeLesson.matches
      .map(
        ([task], index) =>
          `<div class="match-row"><span>${task}</span><select data-match="${index}" aria-label="Match ${task}"><option value="">Choose…</option>${categories.map((category) => `<option>${category}</option>`).join("")}</select></div>`,
      )
      .join("") +
    '<button class="secondary-action" id="check-matches">Check matches</button>';
  $("#check-matches").addEventListener("click", () => {
    const correct = activeLesson.matches.every(
      ([, answer], index) =>
        document.querySelector(`[data-match="${index}"]`).value === answer,
    );
    markInteractionPassed(
      correct
        ? "All matched. You can now explain where LLMs fit."
        : "A few are off. Think about the task each description performs.",
      "#match-feedback",
    );
  });
}
function renderGeneration() {
  const step = activeLesson.generation.steps[generationIndex];
  const candidates = [[step.token, step.probability], ...step.alternatives];
  $("#generation-probs").innerHTML = candidates
    .map(
      ([token, probability]) =>
        `<div class="prob-row"><span>${token}</span><div><i style="width:${probability}%"></i></div><strong>${probability}%</strong></div>`,
    )
    .join("");
  $("#generate-token").textContent =
    generationIndex < activeLesson.generation.steps.length - 1
      ? "Generate next token"
      : "Start again";
  interactionPassed = true;
}
function advanceGeneration() {
  const step = activeLesson.generation.steps[generationIndex];
  $("#generation-context").textContent += ` ${step.token}`;
  generationIndex += 1;
  if (generationIndex >= activeLesson.generation.steps.length)
    generationIndex = 0;
  renderGeneration();
}
function renderSampling() {
  const temperature = Number($("#temperature-slider").value),
    k = Number($("#top-k-slider").value),
    p = Number($("#top-p-slider").value);
  $("#temperature-value").textContent = temperature.toFixed(1);
  $("#top-k-value").textContent = k;
  $("#top-p-value").textContent = p.toFixed(2);
  const candidates = activeLesson.sampling.candidates.map(
    ([token, probability]) => [token, Math.pow(probability, 1 / temperature)],
  );
  const sum = candidates.reduce((total, [, value]) => total + value, 0);
  const normalized = candidates
    .map(([token, value]) => [token, value / sum])
    .sort((a, b) => b[1] - a[1]);
  const topK = normalized.slice(0, k);
  let cumulative = 0;
  const topP = [];
  for (const candidate of normalized) {
    if (cumulative < p) {
      topP.push(candidate);
      cumulative += candidate[1];
    }
  }
  const allowed = new Set(topP.slice(0, topK.length).map(([token]) => token));
  $("#sampling-bars").innerHTML = normalized
    .map(
      ([token, probability]) =>
        `<div class="prob-row ${allowed.has(token) ? "candidate-active" : ""}"><span>${token}</span><div><i style="width:${Math.max(2, probability * 100)}%"></i></div><strong>${Math.round(probability * 100)}%</strong></div>`,
    )
    .join("");
  $("#sampling-explanation").innerHTML =
    `<strong>What changes?</strong> ${temperature < 0.5 ? "Low temperature concentrates the distribution." : temperature > 0.9 ? "High temperature spreads probability more broadly." : "Medium temperature keeps a balance."} Top-k keeps <strong>${k}</strong> candidates. Top-p keeps candidates until their cumulative probability reaches about <strong>${Math.round(p * 100)}%</strong>.`;
  interactionPassed = true;
}
function bindPromptCompare() {
  const container = $("#compare-choices");
  container.innerHTML =
    activeLesson.pairs
      .map(
        (pair, index) =>
          `<fieldset class="compare-pair"><legend>Example ${index + 1}</legend><label><input type="radio" name="pair-${index}" value="weak"> ${pair.weak}</label><label><input type="radio" name="pair-${index}" value="strong"> ${pair.strong}</label></fieldset>`,
      )
      .join("") +
    '<button class="secondary-action" id="check-compare">Check choices</button>';
  $("#check-compare").addEventListener("click", () => {
    const answers = activeLesson.pairs.map(
      (_, index) =>
        document.querySelector(`input[name="pair-${index}"]:checked`)?.value,
    );
    const correct = answers.every((answer) => answer === "strong");
    markInteractionPassed(
      correct
        ? "Great. The stronger prompts add relevant guidance, not filler."
        : "Look for the prompt that gives useful task, audience, format, or context information.",
      "#compare-feedback",
    );
  });
}
function bindPromptAnatomy() {
  $("#anatomy-quiz").innerHTML = activeLesson.anatomy
    .map(
      (part, index) =>
        `<label class="builder-row"><span>${part.text}</span><select data-anatomy-answer="${index}" aria-label="Identify prompt component"><option value="">Choose…</option><option value="system">System</option><option value="instruction">Instruction</option><option value="input">Input / Examples</option></select></label>`,
    )
    .join("");
  $("#check-anatomy").addEventListener("click", () => {
    const correct = activeLesson.anatomy.every(
      (part, index) =>
        document.querySelector(`[data-anatomy-answer="${index}"]`).value ===
        part.answer,
    );
    markInteractionPassed(
      correct
        ? "Anatomy complete. You can now see the prompt as components."
        : "Check the job of each component: who/how, what to do, and task data/examples.",
      "#anatomy-quiz-feedback",
    );
  });
}
function bindSpecificityBuilder() {
  $("#specificity-fields").innerHTML = activeLesson.fields
    .map(
      (field) =>
        `<label class="builder-field"><span>${field.label}</span><select data-specificity="${field.id}">${field.options.map((option, index) => `<option ${index === 0 ? "selected" : ""}>${option}</option>`).join("")}</select></label>`,
    )
    .join("");
  $("#check-specificity").addEventListener("click", () => {
    const correct = activeLesson.fields.every(
      (field) =>
        document.querySelector(`[data-specificity="${field.id}"]`).value ===
        field.answer,
    );
    const values = activeLesson.fields.map(
      (field) =>
        document.querySelector(`[data-specificity="${field.id}"]`).value,
    );
    $("#specificity-preview").textContent =
      `Write a ${values[2]} ${values[3].toLowerCase()} explanation of ${values[0]} for ${values[1].toLowerCase()}, using ${values[4].toLowerCase()} to ${values[5].toLowerCase()}.`;
    markInteractionPassed(
      correct
        ? "Prompt upgraded. Every selected detail is relevant to the target outcome."
        : "Use the relevant details: topic, audience, length, tone, format and goal.",
      "#specificity-feedback",
    );
  });
}
function bindRoleMatch() {
  document.querySelectorAll("[data-role]").forEach((button) =>
    button.addEventListener("click", () => {
      document
        .querySelectorAll("[data-role]")
        .forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      const correct = button.dataset.role === activeLesson.answer;
      $("#role-preview").textContent = correct
        ? activeLesson.example
        : `${button.dataset.role} can change the framing, but another role fits this teaching task better.`;
      if (correct)
        markInteractionPassed(
          "Good fit. The role gives the desired teaching perspective.",
          "#role-feedback",
        );
      else
        $("#role-feedback").textContent =
          "Try again. Pick the role that naturally matches the learner-facing task.";
    }),
  );
}
function bindFewShot() {
  document.querySelectorAll(".label-option").forEach((button) =>
    button.addEventListener("click", () => {
      const index = button.dataset.testIndex;
      document
        .querySelectorAll(`[data-test-index="${index}"]`)
        .forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
    }),
  );
  $("#check-few-shot").addEventListener("click", () => {
    const expected = ["Positive", "Positive"];
    const correct = expected.every(
      (answer, index) =>
        document.querySelector(`[data-test-index="${index}"].selected`)?.dataset
          .label === answer,
    );
    markInteractionPassed(
      correct
        ? "Nice. The examples demonstrated a simple sentiment pattern."
        : "Use the examples as a pattern: both test statements express positive sentiment.",
      "#few-shot-feedback",
    );
  });
}
function bindOutputFormat() {
  document.querySelectorAll("[data-format]").forEach((button) =>
    button.addEventListener("click", () => {
      document
        .querySelectorAll("[data-format]")
        .forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      const correct = button.dataset.format === "json";
      $("#output-preview-code").textContent = correct
        ? activeLesson.json
        : button.textContent === "Table"
          ? "name | company | year | role"
          : button.textContent === "Bullet list"
            ? "• name\n• company\n• year\n• role"
            : "John joined Acme in 2024...";
      if (correct)
        markInteractionPassed(
          "Good choice for machine-readable extraction. Remember to validate it in an application.",
          "#format-feedback",
        );
      else
        $("#format-feedback").textContent =
          "For structured extraction, JSON is a useful machine-readable target.";
    }),
  );
}
function bindPromptDecompose() {
  const keys = Object.keys(activeLesson.prompt);
  $("#decompose-quiz").innerHTML = keys
    .map(
      (key, index) =>
        `<label class="builder-row"><span>${activeLesson.prompt[key]}</span><select data-decompose-answer="${index}" aria-label="Identify component"><option value="">Choose…</option>${keys.map((option) => `<option value="${option}">${option.toUpperCase()}</option>`).join("")}</select></label>`,
    )
    .join("");
  $("#check-decompose").addEventListener("click", () => {
    const correct = keys.every(
      (key, index) =>
        document.querySelector(`[data-decompose-answer="${index}"]`).value ===
        key,
    );
    markInteractionPassed(
      correct
        ? "Excellent decomposition. The prompt is specific because each part has a job."
        : "Look for role, task, situation details, boundaries, and desired output.",
      "#decompose-feedback",
    );
  });
}
function bindRefinement() {
  let step = 0;
  const renderStep = () => {
    const current = activeLesson.refinement[step];
    $("#refinement-step").textContent =
      `Step ${step + 1} / ${activeLesson.refinement.length}`;
    $("#refinement-prompt").textContent = current.text;
    const percent = Math.round((current.coverage.length / 5) * 100);
    $("#refinement-percent").textContent = `${percent}%`;
    $("#refinement-bar").style.width = `${percent}%`;
    $("#coverage-list").innerHTML = [
      "task",
      "context",
      "audience",
      "constraints",
      "format",
    ]
      .map(
        (item) =>
          `<span class="coverage-item ${current.coverage.includes(item) ? "covered" : ""}">${current.coverage.includes(item) ? "✓" : "○"} ${item.toUpperCase()}</span>`,
      )
      .join("");
  };
  renderStep();
  $("#refine-back").addEventListener("click", () => {
    step = Math.max(0, step - 1);
    renderStep();
  });
  $("#refine-next").addEventListener("click", () => {
    step = Math.min(activeLesson.refinement.length - 1, step + 1);
    renderStep();
    if (step === activeLesson.refinement.length - 1)
      markInteractionPassed(
        "Refinement complete. The final version covers the useful guidance needed for the task.",
        "#refinement-feedback",
      );
  });
}
function bindPromptChallenge() {
  let current = 0;
  const selections = new Map();
  const renderScenario = () => {
    const scenario = activeLesson.scenarios[current];
    $("#scenario-tabs").innerHTML = activeLesson.scenarios
      .map(
        (item, index) =>
          `<button class="scenario-tab ${index === current ? "active" : ""}" data-scenario="${index}">${index + 1}. ${item.task}</button>`,
      )
      .join("");
    $("#scenario-panel").innerHTML =
      `<p class="challenge-task"><strong>Weak prompt:</strong> “${scenario.task}”</p><div class="component-grid">${scenario.components.map((component) => `<button class="component-toggle ${selections.get(current)?.has(component) ? "selected" : ""}" data-component="${component}">${component}</button>`).join("")}</div><p class="muted small">Required components: ${scenario.requiredComponents.join(" · ")}</p>`;
    document.querySelectorAll("[data-scenario]").forEach((button) =>
      button.addEventListener("click", () => {
        current = Number(button.dataset.scenario);
        renderScenario();
      }),
    );
    document.querySelectorAll("[data-component]").forEach((button) =>
      button.addEventListener("click", () => {
        const set = selections.get(current) || new Set();
        button.classList.toggle("selected");
        if (button.classList.contains("selected"))
          set.add(button.dataset.component);
        else set.delete(button.dataset.component);
        selections.set(current, set);
      }),
    );
  };
  renderScenario();
  $("#check-prompt-challenge").addEventListener("click", () => {
    const scenario = activeLesson.scenarios[current];
    const selected = selections.get(current) || new Set();
    const score =
      scenario.requiredComponents.filter((component) => selected.has(component))
        .length / scenario.requiredComponents.length;
    const passed = score >= 1;
    $("#prompt-challenge-feedback").textContent = passed
      ? `Scenario passed: ${scenario.requiredComponents.length}/${scenario.requiredComponents.length} required components.`
      : `Not yet. You have ${Math.round(score * 100)}% of the required guidance. Add the missing components.`;
    const allPassed = activeLesson.scenarios.every((item, index) => {
      const set = selections.get(index) || new Set();
      return item.requiredComponents.every((component) => set.has(component));
    });
    if (allPassed) {
      promptChallengeScore = 100;
      recordChallengeScore(state, "prompt-challenge", 100);
      markInteractionPassed(
        "All six scenarios satisfy their required components.",
        "#prompt-challenge-feedback",
      );
      saveState(state);
    }
  });
}
function bindPromptFinal() {
  const selected = new Set();
  const render = () => {
    document
      .querySelectorAll("[data-final-component]")
      .forEach((button) =>
        button.classList.toggle(
          "selected",
          selected.has(button.dataset.finalComponent),
        ),
      );
    const parts = activeLesson.finalComponents.filter((component) =>
      selected.has(component.id),
    );
    const assembled = parts.length
      ? parts.map((part) => `${part.label}:\n${part.text}`).join("\n\n")
      : "Select components to build your prompt.";
    $("#prompt-final-preview").textContent = assembled;
    $("#prompt-final-review").textContent = assembled;
  };
  render();
  document.querySelectorAll("[data-final-component]").forEach((button) =>
    button.addEventListener("click", () => {
      const id = button.dataset.finalComponent;
      if (selected.has(id)) selected.delete(id);
      else selected.add(id);
      render();
    }),
  );
  $("#submit-prompt-final").addEventListener("click", () => {
    const required = activeLesson.requiredComponents;
    const covered = required.filter((id) => selected.has(id)).length;
    const score = Math.round((covered / required.length) * 100);
    promptFinalScore = score;
    recordChallengeScore(state, "prompt-final", score);
    const result = $("#prompt-final-result");
    if (score >= 70) {
      result.className = "final-result pass";
      result.innerHTML = `<strong>Passed — ${score}% coverage.</strong><span>Your prompt includes the core guidance a study assistant needs. You can now refine it further in a real application.</span>`;
      if (!state.completedLessons.includes(activeLesson.id)) {
        const previousLevel = state.level;
        completeLesson(state, activeLesson.id, activeLesson.xp);
        unlockLevel(state, 4);
        markLevelCompleted(state, 3);
        const newAchievements = unlockAchievements(state, allLessons);
        saveState(state);
        render();
        const achievementText = newAchievements.length
          ? ` · ${newAchievements
              .map((id) => achievements.find((item) => item.id === id)?.title)
              .filter(Boolean)
              .join(" · ")}`
          : "";
        showReward(
          `+${activeLesson.xp} XP${achievementText}`,
          previousLevel !== state.level
            ? `Level ${state.level} reached!`
            : "Prompt Engineering Complete!",
        );
        setTimeout(closeLesson, 1100);
      }
    } else {
      result.className = "final-result fail";
      const missing = required.filter((id) => !selected.has(id));
      result.innerHTML = `<strong>Not yet — ${score}% coverage.</strong><span>Add the missing components: ${missing.join(" · ")}. Retry without losing XP.</span>`;
      saveState(state);
    }
  });
}
function submitFinal() {
  let score = 0;
  finalChallenge.questions.forEach((question, index) => {
    const card = document.querySelector(`[data-final-index="${index}"]`);
    if (question.type === "short") {
      const answer = card
        .querySelector("[data-final-short]")
        .value.trim()
        .toLowerCase();
      if (
        answer.includes("predict") &&
        (answer.includes("token") || answer.includes("next"))
      )
        score += 1;
      return;
    }
    if (question.type === "order") {
      const order = [...card.querySelectorAll("[data-order-item]")].map(
        (button) => Number(button.dataset.orderItem),
      );
      if (order.every((value, i) => value === i)) score += 1;
      return;
    }
    const selected = card.querySelector(".final-option.selected");
    if (selected && Number(selected.dataset.finalAnswer) === question.answer)
      score += 1;
  });
  const percent = Math.round((score / finalChallenge.questions.length) * 100);
  recordChallengeScore(state, "llm-final", percent);
  const result = $("#final-result");
  if (percent >= 70) {
    result.className = "final-result pass";
    result.innerHTML = `<strong>Passed — ${score}/${finalChallenge.questions.length} (${percent}%).</strong><span>You have the mental model. Level 3 is now unlocked.</span>`;
    if (!state.completedLessons.includes(finalChallenge.id)) {
      const previousLevel = state.level;
      completeLesson(state, finalChallenge.id, finalChallenge.xp);
      unlockLevel(state, 3);
      markLevelCompleted(state, 2);
      const newAchievements = unlockAchievements(state, allLessons);
      saveState(state);
      render();
      const achievementText = newAchievements.length
        ? ` · ${newAchievements
            .map((id) => achievements.find((item) => item.id === id)?.title)
            .filter(Boolean)
            .join(" · ")}`
        : "";
      showReward(
        `+${finalChallenge.xp} XP${achievementText}`,
        previousLevel !== state.level
          ? `Level ${state.level} reached!`
          : "LLM Fundamentals Complete!",
      );
      setTimeout(closeLesson, 900);
    } else {
      unlockLevel(state, 3);
      markLevelCompleted(state, 2);
      saveState(state);
      render();
    }
  } else {
    result.className = "final-result fail";
    const weak = finalChallenge.questions
      .filter((question, index) => {
        const card = document.querySelector(`[data-final-index="${index}"]`);
        if (question.type === "short") {
          const answer = card
            .querySelector("[data-final-short]")
            .value.trim()
            .toLowerCase();
          return !(
            answer.includes("predict") &&
            (answer.includes("token") || answer.includes("next"))
          );
        }
        if (question.type === "order") {
          const order = [...card.querySelectorAll("[data-order-item]")].map(
            (button) => Number(button.dataset.orderItem),
          );
          return !order.every((value, i) => value === i);
        }
        const selected = card.querySelector(".final-option.selected");
        return (
          !selected || Number(selected.dataset.finalAnswer) !== question.answer
        );
      })
      .map((question) => question.question);
    result.innerHTML = `<strong>Not quite — ${score}/${finalChallenge.questions.length} (${percent}%).</strong><span>Pass at 70%. Review the concepts and retry. ${weak.slice(0, 3).join(" · ")}</span>`;
    saveState(state);
  }
}

function closeLesson() {
  $("#lesson-modal").hidden = true;
  activeLesson = null;
}
function showReward(copy, title) {
  $("#reward-title").textContent = title;
  $("#reward-copy").textContent = copy;
  $("#reward-toast").hidden = false;
  setTimeout(() => {
    $("#reward-toast").hidden = true;
  }, 3400);
}
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );
}

$("#modal-close").addEventListener("click", closeLesson);
$("#lesson-modal").addEventListener("click", (event) => {
  if (event.target === $("#lesson-modal")) closeLesson();
});
document.addEventListener("click", (event) => {
  const lessonButton = event.target.closest("[data-lesson]");
  if (lessonButton && !lessonButton.disabled)
    openLesson(lessonButton.dataset.lesson);
  if (event.target.id === "generate-token") advanceGeneration();
});
document.addEventListener("input", (event) => {
  if (event.target.matches("#temperature-slider, #top-k-slider, #top-p-slider"))
    renderSampling();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && activeLesson) closeLesson();
});
render();
