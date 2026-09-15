import { phase4Lessons, phase4Achievements } from "./phase4.js";
import {
  foundationLessons,
  llmLessons,
  promptLessons,
  finalChallenge,
  achievements as baseAchievements,
} from "./curriculum.js";
import {
  loadState,
  saveState,
  completeLesson,
  unlockAchievements,
  isLevelUnlocked,
  unlockLevel,
  markLevelCompleted,
  recordChallengeScore,
} from "./state.js";

let state = loadState();
let active = null;
let passed = false;
let selectedQuiz = null;

const $ = (selector) => document.querySelector(selector);
const allKnownLessons = [
  ...foundationLessons,
  ...llmLessons,
  ...promptLessons,
  finalChallenge,
  ...phase4Lessons,
];
const phase4MissionIds = phase4Lessons.map((lesson) => lesson.id);

function esc(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[c],
  );
}
function isPhase4Unlocked() {
  return isLevelUnlocked(state, 4);
}
function completedCount() {
  return phase4Lessons.filter((lesson) =>
    state.completedLessons.includes(lesson.id),
  ).length;
}

function refreshGlobalShell() {
  const xp = $("#header-xp");
  if (xp) xp.textContent = `${state.xp} XP`;
  const completed = allKnownLessons.filter((lesson) =>
    state.completedLessons.includes(lesson.id),
  ).length;
  const total = allKnownLessons.length;
  const hero = $("#hero-progress");
  if (hero) hero.textContent = `${Math.round((completed / total) * 100)}%`;
  const levelValue = $("#level-value");
  if (levelValue) levelValue.textContent = state.level;
  const rank = ["Beginner Explorer", "AI Learner", "AI Builder", "AI Engineer"][
    Math.min(state.level - 1, 3)
  ];
  if ($("#rank-value")) $("#rank-value").textContent = rank;
  if ($("#title-value")) $("#title-value").textContent = rank;
  if ($("#completed-value")) $("#completed-value").textContent = completed;
  renderRoadmapShell();
}

function renderRoadmapShell() {
  const list = $("#roadmap-list");
  if (!list) return;
  const descriptions = [
    ["AI Foundations", "Build your mental model of AI."],
    ["LLM Fundamentals", "Tokens, embeddings, attention & prediction."],
    ["Prompt Engineering", "Learn to communicate with models effectively."],
    ["LLM Applications", "Learn API basics and build with language models."],
    ["RAG", "Connect models to your own knowledge."],
    ["Agents", "Models that reason and use tools."],
    ["MCP", "A standard way to connect AI to tools and data."],
    ["Orchestration", "Design reliable multi-step AI systems."],
  ];
  list.querySelectorAll(".roadmap-node").forEach((node, index) => {
    const id = index + 1;
    node.classList.toggle("unlocked", isLevelUnlocked(state, id));
    node.classList.toggle("completed", state.completedLevels.includes(id));
    const status = node.querySelector(".roadmap-status");
    if (status) {
      const complete = state.completedLevels.includes(id);
      const unlocked = isLevelUnlocked(state, id);
      status.textContent = complete ? "✓" : unlocked ? "●" : "⌑";
      status.setAttribute(
        "aria-label",
        complete ? "Completed" : unlocked ? "Unlocked" : "Locked",
      );
    }
    const title = node.querySelector("h3");
    if (title) title.textContent = descriptions[index][0].toUpperCase();
    const copy = node.querySelector("p");
    if (copy) copy.textContent = descriptions[index][1];
  });
}

function renderLevel4() {
  const unlocked = isPhase4Unlocked();
  const done = completedCount();
  const percent = Math.round((done / phase4Lessons.length) * 100);
  const list = $("#app-list");
  if (!list) return;
  $("#app-count").textContent = `${done} / ${phase4Lessons.length}`;
  $("#app-progress-percent").textContent = `${percent}%`;
  $("#app-progress-bar").style.width = `${percent}%`;
  $("#app-locked-note").hidden = unlocked;
  $(".applications-section")?.classList.toggle("is-locked", !unlocked);
  const firstNineDone = phase4Lessons
    .slice(0, -1)
    .every((lesson) => state.completedLessons.includes(lesson.id));
  list.innerHTML = phase4Lessons
    .map((lesson, index) => {
      const completed = state.completedLessons.includes(lesson.id);
      const locked =
        !unlocked || (lesson.type === "app-final" && !firstNineDone);
      const label = completed
        ? "Review"
        : locked
          ? "Locked"
          : lesson.type === "app-final"
            ? "Start Final Boss"
            : "Start Mission";
      return `<article class="lesson-card ${completed ? "completed" : ""} ${locked ? "locked" : ""}"><div class="lesson-index">${completed ? "✓" : String(index + 1).padStart(2, "0")}</div><div><h3>${esc(lesson.title)}</h3><p>${esc(lesson.description)}</p><div class="lesson-tags"><span class="tag">${lesson.difficulty}</span><span class="tag xp">+${lesson.xp} XP</span>${lesson.type === "app-final" ? '<span class="tag challenge">FINAL</span>' : ""}</div></div><button class="lesson-button" data-app-lesson="${lesson.id}" ${locked ? "disabled" : ""}>${label}</button></article>`;
    })
    .join("");
}

function renderPhase4Achievements() {
  const list = $("#achievement-list");
  if (!list) return;
  list
    .querySelectorAll("[data-phase4-achievement]")
    .forEach((node) => node.remove());
  phase4Achievements.forEach((item) => {
    const unlocked = state.achievements.includes(item.id);
    const article = document.createElement("article");
    article.className = `achievement ${unlocked ? "unlocked" : ""}`;
    article.dataset.phase4Achievement = item.id;
    article.innerHTML = `<div class="achievement-icon">${item.icon}</div><div><h3>${esc(item.title)} ${unlocked ? "✓" : ""}</h3><p>${esc(item.description)}</p></div>`;
    list.appendChild(article);
  });
}

function openPhase4(id) {
  active = phase4Lessons.find((lesson) => lesson.id === id);
  if (!active || !isPhase4Unlocked()) return;
  const finalLocked =
    active.type === "app-final" &&
    !phase4Lessons
      .slice(0, -1)
      .every((lesson) => state.completedLessons.includes(lesson.id));
  if (finalLocked) return;
  passed =
    active.type === "app-final" ? false : !interactiveTypes.has(active.type);
  selectedQuiz = null;
  $("#modal-title").textContent = active.title;
  $("#modal-description").textContent = active.description;
  $("#modal-difficulty").textContent = active.difficulty;
  $("#modal-xp").textContent = `+${active.xp} XP`;
  $("#modal-objective").innerHTML =
    `<strong>Learning objective</strong><span>${active.objective}</span>`;
  $("#modal-visual").innerHTML = buildVisual(active);
  $("#modal-content").innerHTML = active.content;
  $("#modal-interaction").innerHTML = buildInteraction(active);
  $("#modal-quiz").innerHTML =
    active.type === "app-final" ? buildFinal(active) : buildQuiz(active);
  $("#complete-button").hidden = active.type === "app-final";
  $("#complete-button").disabled = state.completedLessons.includes(id);
  $("#complete-button").textContent = state.completedLessons.includes(id)
    ? "Mission completed ✓"
    : `Complete mission · +${active.xp} XP`;
  $("#lesson-modal").hidden = false;
  $("#modal-close").focus();
  bind(active);
}

const interactiveTypes = new Set([
  "api-request",
  "messages",
  "request-builder",
  "json-explorer",
  "context-window",
  "streaming",
  "model-picker",
  "app-builder",
  "request-debug",
]);

function buildVisual(lesson) {
  if (lesson.type === "api-request")
    return `<div class="app-pipeline"><div class="app-request-input"><label for="app-input">User input</label><input id="app-input" value="${esc(lesson.sampleInput)}"></div><div class="pipeline-track"><span>APP</span><i>↓</i><span>REQUEST</span><i>↓</i><span>MODEL</span><i>↓</i><span>RESPONSE</span><i>↓</i><span>UI</span></div><pre id="api-request-preview" class="code-panel">Click Build Request.</pre></div>`;
  if (lesson.type === "messages")
    return `<div class="message-stack" id="message-preview"></div>`;
  if (lesson.type === "request-builder")
    return `<div class="request-builder"><div class="builder-field"><label for="req-model">Model</label><select id="req-model"><option>example-model</option><option>fast-example</option><option>reasoning-example</option></select></div><div class="builder-field"><label for="req-temp">Temperature <output id="req-temp-value">0.7</output></label><input id="req-temp" type="range" min="0" max="1.2" step="0.1" value="0.7"></div><div class="builder-field"><label for="req-max">Max output tokens <output id="req-max-value">500</output></label><input id="req-max" type="range" min="100" max="1000" step="100" value="500"></div><pre id="request-builder-preview" class="code-panel">Send a simulated request.</pre></div>`;
  if (lesson.type === "json-explorer")
    return `<div class="json-explorer"><pre id="json-viewer" class="json-code">${renderJson(lesson.json)}</pre><div id="json-inspector" class="json-inspector">Click a JSON part to inspect it.</div></div>`;
  if (lesson.type === "context-window")
    return `<div class="context-visual"><div class="context-meter"><span id="context-fill"></span></div><div id="context-items" class="context-items"></div><strong id="context-status">Context has room.</strong></div>`;
  if (lesson.type === "streaming")
    return `<div class="stream-visual"><div><span class="visual-label">NON-STREAMING</span><div class="stream-bar"><i id="nonstream-bar"></i></div><small id="nonstream-status">Waiting for complete response</small></div><div><span class="visual-label">STREAMING</span><div class="stream-chunks" id="stream-chunks"></div></div></div>`;
  if (lesson.type === "model-picker")
    return `<div class="model-table"><div class="model-table-head"><span>MODEL</span><span>SPEED</span><span>CAPABILITY</span><span>COST</span></div>${lesson.models.map((model) => `<div><strong>${model.name}</strong><span>${model.speed}</span><span>${model.capability}</span><span>${model.cost}</span></div>`).join("")}</div>`;
  if (lesson.type === "app-builder")
    return `<div class="mini-app"><span class="visual-label">SIMULATED LLM APP</span><div class="mini-app-screen"><strong id="mini-app-title">Study Assistant</strong><label for="mini-app-input">User input</label><input id="mini-app-input" placeholder="Ask something..."><div class="mini-app-response" id="mini-app-response">Response will appear here.</div></div></div>`;
  if (lesson.type === "request-debug")
    return `<div class="debug-code"><span class="visual-label">BROKEN REQUEST</span><pre id="debug-request" class="code-panel"></pre></div>`;
  if (lesson.type === "app-final")
    return `<div class="architecture-preview"><span class="visual-label">YOUR APPLICATION ARCHITECTURE</span><div id="final-architecture" class="architecture-flow">Choose the components below.</div></div>`;
  return `<div class="flow">${lesson.visual.map((step, i) => `<span class="flow-step">${esc(step)}</span>${i < lesson.visual.length - 1 ? '<span class="flow-arrow">→</span>' : ""}`).join("")}</div>`;
}

function buildInteraction(lesson) {
  if (lesson.type === "api-request")
    return `<div class="activity-card"><strong>Transform the prompt</strong><p class="muted small">Edit the input, then build the simulated request.</p><button class="secondary-action" id="build-request">Build Request</button><div id="api-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "messages")
    return `<div class="activity-card"><strong>Conversation builder</strong><div class="message-controls"><label>System<input id="system-message" value="${esc(lesson.defaults.system)}"></label><label>User<input id="user-message" value="${esc(lesson.defaults.user)}"></label><label>Assistant<input id="assistant-message" value="${esc(lesson.defaults.assistant)}"></label></div><button class="secondary-action" id="preview-messages">Update conversation</button><div id="message-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "request-builder")
    return `<div class="activity-card"><strong>Request builder</strong><p class="muted small">Configure the request, then inspect the generic JSON object.</p><button class="secondary-action" id="send-request">Send simulated request</button><div id="request-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "json-explorer")
    return `<div class="activity-card"><strong>JSON explorer</strong><p class="muted small">Select a property or type.</p><div class="json-choices"><button data-json-part="key">Key</button><button data-json-part="value">Value</button><button data-json-part="object">Object</button><button data-json-part="array">Array</button><button data-json-part="string">String</button><button data-json-part="number">Number</button></div><div id="json-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "context-window")
    return `<div class="activity-card"><strong>Fill the context window</strong><p class="muted small">Add pieces of information to see why applications manage context.</p><div class="context-buttons"><button data-context-size="12">System</button><button data-context-size="18">User message</button><button data-context-size="22">History</button><button data-context-size="25">Document</button><button data-context-size="20">Current request</button></div><div id="context-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "streaming")
    return `<div class="activity-card"><strong>Watch the response arrive</strong><button class="secondary-action" id="start-stream">Start simulation</button><div id="stream-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "model-picker")
    return `<div class="activity-card"><strong>Choose for the task</strong><div class="task-options">${lesson.tasks.map((task) => `<button data-task-id="${task.id}">${task.label}</button>`).join("")}</div><div id="model-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "app-builder")
    return `<div class="activity-card"><strong>Configure your app</strong><div class="app-builder-grid"><label>App type<select id="app-type">${lesson.appTypes.map((item) => `<option>${item}</option>`).join("")}</select></label><label>System instruction<textarea id="app-system">You are a helpful ${lesson.appTypes[0].toLowerCase()}.</textarea></label><label>Output format<select id="app-output">${lesson.outputFormats.map((item) => `<option>${item}</option>`).join("")}</select></label></div><button class="secondary-action" id="run-app">Run simulated app</button><div id="app-builder-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  if (lesson.type === "request-debug")
    return `<div class="activity-card"><strong>Debug challenge</strong><div class="debug-controls"><div id="debug-bugs" class="scenario-tabs"></div><div id="debug-choices"></div></div><button class="secondary-action" id="check-debug">Check fix</button><div id="debug-feedback" class="visual-feedback" aria-live="polite"></div></div>`;
  return "";
}

function buildQuiz(lesson) {
  return `<h3>🧠 Quick check</h3><p>${esc(lesson.quiz.question)}</p><div class="quiz-options">${lesson.quiz.options.map((option, i) => `<button class="quiz-option" data-app-answer="${i}">${esc(option)}</button>`).join("")}</div><div class="quiz-feedback" id="app-quiz-feedback" aria-live="polite"></div>`;
}

function buildFinal(lesson) {
  return `<div class="final-challenge app-final"><div class="challenge-header"><span>LLM APPLICATION ARCHITECT</span><strong>70% to pass</strong></div><div class="app-final-grid"><label>1. Application type<select id="final-app-type">${lesson.appTypes.map((item) => `<option>${item}</option>`).join("")}</select></label><label>2. System instruction<textarea id="final-system">You are a patient study mentor.</textarea></label><label>3. User message<textarea id="final-user">Explain photosynthesis to me as a beginner.</textarea></label><label>4. Request settings<select id="final-settings"><option>Temperature 0.4 · concise output</option><option>Temperature 0.7 · balanced output</option><option>Temperature 1.0 · varied output</option></select></label><label>5. Model<select id="final-model">${lesson.models.map((item) => `<option>${item}</option>`).join("")}</select></label><label>6. Delivery<select id="final-delivery">${lesson.deliveries.map((item) => `<option>${item}</option>`).join("")}</select></label><label>7. Response flow<select id="final-flow"><option>Response → validate/handle → render in UI</option><option>Response → discard → reload page</option><option>Response → store secret key in browser</option></select></label></div><button class="primary-button" id="submit-app-final">Submit architecture</button><div id="app-final-result" class="final-result" aria-live="polite"></div></div>`;
}

function renderJson(value, depth = 0) {
  if (Array.isArray(value))
    return `<span class="json-bracket">[</span>${value.map((item) => renderJson(item, depth + 1)).join(", ")}<span class="json-bracket">]</span>`;
  if (value && typeof value === "object")
    return `<span class="json-bracket">{</span>${Object.entries(value)
      .map(
        ([key, item]) =>
          `<span class="json-key">&quot;${esc(key)}&quot;</span>: ${renderJson(item, depth + 1)}`,
      )
      .join(", ")}<span class="json-bracket">}</span>`;
  if (typeof value === "string")
    return `<span class="json-string">&quot;${esc(value)}&quot;</span>`;
  return `<span class="json-number">${value}</span>`;
}

function bind(lesson) {
  document.querySelectorAll("[data-app-answer]").forEach((button) =>
    button.addEventListener("click", () => {
      selectedQuiz = Number(button.dataset.appAnswer);
      document
        .querySelectorAll("[data-app-answer]")
        .forEach((item) => item.classList.remove("selected"));
      button.classList.add("selected");
      const correct = selectedQuiz === lesson.quiz.answer;
      $("#app-quiz-feedback").textContent = correct
        ? "Correct — nice work."
        : "Not quite. Try again.";
    }),
  );
  if (lesson.type === "api-request") bindApiRequest(lesson);
  if (lesson.type === "messages") bindMessages(lesson);
  if (lesson.type === "request-builder") bindRequestBuilder(lesson);
  if (lesson.type === "json-explorer") bindJsonExplorer(lesson);
  if (lesson.type === "context-window") bindContext(lesson);
  if (lesson.type === "streaming") bindStreaming(lesson);
  if (lesson.type === "model-picker") bindModelPicker(lesson);
  if (lesson.type === "app-builder") bindAppBuilder(lesson);
  if (lesson.type === "request-debug") bindDebugger(lesson);
  if (lesson.type === "app-final") bindFinal(lesson);
  $("#complete-button").onclick = completeCurrent;
}

function bindApiRequest(lesson) {
  $("#build-request").onclick = () => {
    const input = $("#app-input").value.trim() || lesson.sampleInput;
    $("#api-request-preview").textContent = JSON.stringify(
      { model: "example-model", messages: [{ role: "user", content: input }] },
      null,
      2,
    );
    $("#api-feedback").textContent =
      "Request built locally. No external API was called.";
    passed = true;
  };
}
function renderMessages() {
  $("#message-preview").innerHTML = [
    ["SYSTEM", $("#system-message").value],
    ["USER", $("#user-message").value],
    ["ASSISTANT", $("#assistant-message").value],
  ]
    .map(
      ([role, text]) =>
        `<div class="message-card"><strong>${esc(role)}</strong><p>${esc(text)}</p></div>`,
    )
    .join("");
}
function bindMessages() {
  renderMessages();
  $("#preview-messages").onclick = () => {
    renderMessages();
    $("#message-feedback").textContent =
      "Conversation updated. The roles provide context for the model request.";
    passed = true;
  };
}
function renderRequest() {
  const model = $("#req-model").value;
  const temperature = Number($("#req-temp").value);
  const max = Number($("#req-max").value);
  $("#req-temp-value").textContent = temperature.toFixed(1);
  $("#req-max-value").textContent = max;
  $("#request-builder-preview").textContent = JSON.stringify(
    {
      model,
      messages: [{ role: "user", content: "Explain APIs simply." }],
      temperature,
      max_output_tokens: max,
    },
    null,
    2,
  );
}
function bindRequestBuilder() {
  ["#req-model", "#req-temp", "#req-max"].forEach((selector) =>
    $(selector).addEventListener("input", renderRequest),
  );
  renderRequest();
  $("#send-request").onclick = () => {
    renderRequest();
    $("#request-feedback").textContent =
      "Simulated response received. Provider-specific request syntax can differ.";
    passed = true;
  };
}
function bindJsonExplorer(lesson) {
  document.querySelectorAll("[data-json-part]").forEach((button) =>
    button.addEventListener("click", () => {
      const part = button.dataset.jsonPart;
      const explanations = {
        key: "A key names a property, such as response.",
        value: "A value is the data stored under a key.",
        object: "An object groups named properties inside braces.",
        array: "An array is an ordered collection inside brackets.",
        string: "A string is text surrounded by quotes.",
        number: "A number is numeric data such as 2024 or 0.8.",
      };
      $("#json-inspector").textContent = explanations[part];
      $("#json-feedback").textContent = `You selected ${part}.`;
      passed = true;
    }),
  );
}
function bindContext() {
  let used = 0;
  const update = () => {
    const percent = Math.min(100, used);
    $("#context-fill").style.width = `${percent}%`;
    $("#context-status").textContent =
      percent >= 90
        ? "Context limit reached — the application needs to manage the input."
        : percent >= 70
          ? "Context getting full."
          : "Context has room.";
    const names = [
      "System",
      "User message",
      "History",
      "Document",
      "Current request",
    ];
    $("#context-items").innerHTML = names
      .map(
        (name, index) =>
          `<span class="context-chip ${index * 20 < percent ? "active" : ""}">${name}</span>`,
      )
      .join("");
  };
  document.querySelectorAll("[data-context-size]").forEach((button) =>
    button.addEventListener("click", () => {
      used = Math.min(100, used + Number(button.dataset.contextSize));
      update();
      if (used >= 70) passed = true;
      $("#context-feedback").textContent =
        used >= 90
          ? "Good. Notice why applications may summarize, truncate or retrieve only relevant information."
          : "Add more context to see the capacity fill.";
    }),
  );
  update();
}
function bindStreaming(lesson) {
  $("#start-stream").onclick = () => {
    const words = lesson.streamText.split(" ");
    let index = 0;
    $("#stream-chunks").innerHTML = "";
    $("#nonstream-bar").style.width = "0%";
    $("#nonstream-status").textContent = "Waiting for complete response";
    const timer = setInterval(() => {
      const span = document.createElement("span");
      span.textContent = words[index];
      $("#stream-chunks").appendChild(span);
      index += 1;
      if (index >= words.length) {
        clearInterval(timer);
        $("#nonstream-bar").style.width = "100%";
        $("#nonstream-status").textContent = "Complete response available";
        $("#stream-feedback").textContent =
          "Streaming changes when output becomes visible, not the quality of the generated answer.";
        passed = true;
      }
    }, 120);
  };
}
function bindModelPicker(lesson) {
  document.querySelectorAll("[data-task-id]").forEach((button) =>
    button.addEventListener("click", () => {
      const task = lesson.tasks.find(
        (item) => item.id === button.dataset.taskId,
      );
      const model = lesson.models.find((item) => item.id === task.answer);
      $("#model-feedback").textContent = `${model.name}: ${task.reason}`;
      passed = true;
    }),
  );
}
function bindAppBuilder(lesson) {
  $("#run-app").onclick = () => {
    const type = $("#app-type").value;
    const input =
      $("#mini-app-input").value.trim() || "Help me understand this task.";
    $("#mini-app-title").textContent = type;
    $("#mini-app-response").textContent =
      `${type} (simulated): I received “${input}”. The application would send messages and settings to a model, then handle the response before rendering it here.`;
    $("#app-builder-feedback").textContent =
      "App pipeline completed locally: UI → logic → request → simulated model → response → UI.";
    passed = true;
  };
}
function bindDebugger(lesson) {
  let index = 0;
  const render = () => {
    const bug = lesson.bugs[index];
    $("#debug-request").textContent = bug.request;
    $("#debug-bugs").innerHTML = lesson.bugs
      .map(
        (item, i) =>
          `<button class="scenario-tab ${i === index ? "active" : ""}" data-debug-index="${i}">${i + 1}. ${item.label}</button>`,
      )
      .join("");
    $("#debug-choices").innerHTML = bug.choices
      .map(
        (choice, i) =>
          `<label class="debug-choice"><input type="radio" name="debug-choice" value="${i}"> ${esc(choice)}</label>`,
      )
      .join("");
    document.querySelectorAll("[data-debug-index]").forEach(
      (button) =>
        (button.onclick = () => {
          index = Number(button.dataset.debugIndex);
          render();
        }),
    );
  };
  render();
  $("#check-debug").onclick = () => {
    const bug = lesson.bugs[index];
    const choice = document.querySelector('input[name="debug-choice"]:checked');
    if (choice && Number(choice.value) === bug.answer) {
      $("#debug-feedback").textContent = `Correct. ${bug.fix}`;
      passed = true;
    } else
      $("#debug-feedback").textContent =
        "Inspect the field names, message collection and roles carefully.";
  };
}
function bindFinal(lesson) {
  const update = () => {
    const values = [
      $("#final-app-type").value,
      $("#final-system").value,
      $("#final-user").value,
      $("#final-settings").value,
      $("#final-model").value,
      $("#final-delivery").value,
      $("#final-flow").value,
    ];
    $("#final-architecture").textContent =
      `${values[0]} → UI → Application Logic → Messages → Request (${values[4]}) → Model → ${values[5]} → Response Handling → Student`;
  };
  document
    .querySelectorAll(
      "#modal-quiz input, #modal-quiz select, #modal-quiz textarea",
    )
    .forEach((control) => control.addEventListener("input", update));
  update();
  $("#submit-app-final").onclick = () => {
    const checks = [
      $("#final-app-type").value === "Study Assistant",
      $("#final-system").value.trim().length > 10,
      $("#final-user").value.trim().length > 5,
      $("#final-settings").value.length > 0,
      $("#final-model").value.length > 0,
      $("#final-delivery").value.length > 0,
      $("#final-flow").value.includes("validate/handle"),
    ];
    const score = Math.round(
      (checks.filter(Boolean).length / checks.length) * 100,
    );
    recordChallengeScore(state, "app-final", score);
    const result = $("#app-final-result");
    if (score >= 70) {
      result.className = "final-result pass";
      result.innerHTML = `<strong>Passed — ${score}%.</strong><span>Your application architecture covers the major pieces. Level 5 is now unlocked.</span>`;
      passed = true;
      completeFinal(lesson);
    } else {
      const missing = checks
        .map((ok, i) =>
          ok
            ? null
            : [
                "application type",
                "system instruction",
                "user message",
                "request settings",
                "model choice",
                "delivery mode",
                "response flow",
              ][i],
        )
        .filter(Boolean);
      result.className = "final-result fail";
      result.innerHTML = `<strong>Not yet — ${score}%.</strong><span>Review: ${missing.join(" · ")}. Retry without losing XP.</span>`;
      saveState(state);
    }
  };
}
function completeFinal(lesson) {
  if (state.completedLessons.includes(lesson.id)) {
    unlockLevel(state, 5);
    markLevelCompleted(state, 4);
    saveState(state);
    refreshGlobalShell();
    renderLevel4();
    return;
  }
  const previous = state.level;
  completeLesson(state, lesson.id, lesson.xp);
  unlockLevel(state, 5);
  markLevelCompleted(state, 4);
  const unlocked = unlockAchievements(state, allKnownLessons);
  saveState(state);
  refreshGlobalShell();
  renderLevel4();
  renderPhase4Achievements();
  showReward(
    `+${lesson.xp} XP${unlocked.length ? ` · ${unlocked.join(" · ")}` : ""}`,
    previous !== state.level
      ? `Level ${state.level} reached!`
      : "LLM Applications Complete!",
  );
  setTimeout(close, 1100);
}
function completeCurrent() {
  if (
    !active ||
    active.type === "app-final" ||
    state.completedLessons.includes(active.id)
  )
    return;
  if (active.quiz && selectedQuiz !== active.quiz.answer) {
    $("#app-quiz-feedback").textContent =
      "Answer the quick check correctly before completing the mission.";
    return;
  }
  if (!passed) {
    const target = $("#app-quiz-feedback") || $("#modal-content");
    target.textContent =
      "Complete the interactive task before finishing this mission.";
    return;
  }
  completeLesson(state, active.id, active.xp);
  const unlocked = unlockAchievements(state, allKnownLessons);
  saveState(state);
  refreshGlobalShell();
  renderLevel4();
  renderPhase4Achievements();
  showReward(
    `+${active.xp} XP${unlocked.length ? ` · ${unlocked.join(" · ")}` : ""}`,
    "Mission Complete!",
  );
  close();
}
function showReward(copy, title) {
  $("#reward-title").textContent = title;
  $("#reward-copy").textContent = copy;
  $("#reward-toast").hidden = false;
  setTimeout(() => {
    $("#reward-toast").hidden = true;
  }, 3400);
}
function close() {
  $("#lesson-modal").hidden = true;
  active = null;
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-app-lesson]");
  if (button && !button.disabled) openPhase4(button.dataset.appLesson);
});
window.addEventListener("ailearn-state-updated", () => {
  state = loadState();
  renderLevel4();
  renderPhase4Achievements();
  refreshGlobalShell();
});

state = loadState();
renderLevel4();
renderPhase4Achievements();
refreshGlobalShell();
