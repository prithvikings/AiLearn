import { loadState } from "./state.js";

const LEVEL_NAMES = [
  ["llm-", "LLM Fundamentals"],
  ["prompt-", "Prompt Engineering"],
  ["app-", "LLM Applications"],
  ["local-ai-", "Open Source & Local AI"],
  ["embedding-", "Embeddings & Vector Search"],
  ["rag-", "Retrieval-Augmented Generation"],
  ["agent-", "AI Agents & Tools"],
  ["agent9-", "Agent Memory & Planning"],
  ["mcp-", "MCP"],
  ["orch-", "Agent Orchestration"],
  ["advanced-", "Advanced Agentic AI"],
];

let trigger = null;
let activeId = null;
let steps = [];
let currentStep = 0;
let completionShown = false;

const $ = (selector, root = document) => root.querySelector(selector);

function lessonContext(id = "") {
  const match = LEVEL_NAMES.find(([prefix]) => id.startsWith(prefix));
  return match ? match[1] : "AI Foundations";
}

function hasContent(element) {
  if (!element) return false;
  return Boolean(
    element.textContent?.trim() ||
      element.querySelector("input,button,select,textarea,canvas,svg"),
  );
}

function isInteractiveVisual(element) {
  return Boolean(
    element?.querySelector(
      "input,button,select,textarea,[role=slider],[contenteditable=true]",
    ),
  );
}

function ensureLink() {
  if (
    document.querySelector("link[data-mission-experience]") ||
    !document.head
  )
    return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "css/mission-experience.css";
  link.dataset.missionExperience = "true";
  document.head.appendChild(link);
}

function ensureShell(modal) {
  if (modal.dataset.missionShell === "true") return;

  const close = $("#modal-close", modal);
  const meta = $(".lesson-meta", modal);
  const title = $("#modal-title", modal);
  const description = $("#modal-description", modal);
  const objective = $("#modal-objective", modal);
  const visual = $("#modal-visual", modal);
  const content = $("#modal-content", modal);
  const interaction = $("#modal-interaction", modal);
  const quiz = $("#modal-quiz", modal);
  const actions = $(".modal-actions", modal);

  const topbar = document.createElement("header");
  topbar.className = "mission-topbar";
  topbar.innerHTML = `
    <div class="mission-topbar-main">
      <span class="mission-level" id="mission-level"></span>
      <span class="mission-kicker">LEARNING MISSION</span>
    </div>
    <div class="mission-xp" id="mission-xp"></div>`;

  const progress = document.createElement("div");
  progress.className = "mission-progress";
  progress.setAttribute("aria-label", "Mission progress");
  progress.innerHTML = `<div class="mission-progress-head"><span id="mission-step-label">Learn</span><span id="mission-step-count"></span></div><ol class="mission-progress-dots" id="mission-progress-dots"></ol>`;

  const heading = document.createElement("div");
  heading.className = "mission-heading";
  heading.append(title, description);

  const host = document.createElement("div");
  host.className = "mission-stage-host";

  const footer = document.createElement("footer");
  footer.className = "mission-footer";
  const primary = document.createElement("button");
  primary.type = "button";
  primary.className = "mission-primary";
  primary.id = "mission-primary";
  footer.appendChild(primary);

  if (close) topbar.prepend(close);
  if (meta) meta.hidden = true;
  if (actions) footer.appendChild(actions);

  [objective, visual, content, interaction, quiz].forEach((element) => {
    if (element) host.appendChild(element);
  });

  modal.classList.add("mission-modal");
  modal.insertBefore(topbar, modal.firstChild);
  modal.insertBefore(progress, topbar.nextSibling);
  modal.insertBefore(heading, progress.nextSibling);
  modal.insertBefore(host, heading.nextSibling);
  modal.appendChild(footer);

  modal.dataset.missionShell = "true";
  primary.addEventListener("click", handlePrimary);
}

function buildSteps(modal) {
  const host = $(".mission-stage-host", modal);
  const objective = $("#modal-objective", modal);
  const visual = $("#modal-visual", modal);
  const content = $("#modal-content", modal);
  const interaction = $("#modal-interaction", modal);
  const quiz = $("#modal-quiz", modal);

  if (!host) return [];
  host.querySelectorAll(".mission-step").forEach((step) => step.remove());

  const next = [];
  const make = (key, label, className = "") => {
    const step = document.createElement("section");
    step.className = `mission-step ${className}`.trim();
    step.dataset.step = key;
    step.setAttribute("aria-labelledby", `mission-step-${key}-title`);
    const heading = document.createElement("div");
    heading.className = "mission-step-heading";
    heading.innerHTML = `<span>${label}</span><h3 id="mission-step-${key}-title">${
      label === "Learn"
        ? "Build the mental model"
        : label === "Explore"
          ? "See it in action"
          : label === "Try"
            ? "Put the idea to work"
            : label === "Check"
              ? "Check your understanding"
              : "Mission complete"
    }</h3>`;
    step.appendChild(heading);
    host.appendChild(step);
    next.push({ key, label, element: step });
    return step;
  };

  const learn = make("learn", "Learn");
  if (objective) learn.appendChild(objective);
  if (content && hasContent(content)) learn.appendChild(content);
  if (visual && hasContent(visual) && !isInteractiveVisual(visual))
    learn.appendChild(visual);

  if (visual && hasContent(visual) && isInteractiveVisual(visual)) {
    const explore = make("explore", "Explore");
    explore.appendChild(visual);
  }

  if (interaction && hasContent(interaction)) {
    const tryStep = make("try", "Try");
    tryStep.appendChild(interaction);
  }

  if (quiz && hasContent(quiz)) {
    const check = make("check", "Check");
    check.appendChild(quiz);
  }

  if (!next.length) {
    const fallback = make("learn", "Learn");
    fallback.innerHTML +=
      '<p class="mission-empty">This mission is ready. Continue when you are ready.</p>';
  }

  const complete = make("complete", "Complete", "mission-step--complete");
  complete.hidden = true;
  complete.innerHTML += `
    <div class="mission-completion-card">
      <span class="mission-completion-mark" aria-hidden="true">✓</span>
      <p class="mission-completion-copy">You completed this mission and the progress is saved.</p>
      <div class="mission-completion-xp" id="mission-completion-xp"></div>
    </div>`;
  next.push({ key: "complete", label: "Complete", element: complete });

  return next;
}

function renderProgress() {
  const dots = $("#mission-progress-dots");
  const label = $("#mission-step-label");
  const count = $("#mission-step-count");
  if (!dots) return;

  dots.innerHTML = steps
    .map(
      (step, index) => `
    <li class="mission-progress-item ${index < currentStep ? "is-complete" : ""} ${index === currentStep ? "is-current" : ""}">
      <span aria-hidden="true"></span><small>${step.label}</small>
    </li>`,
    )
    .join("");
  label.textContent = steps[currentStep]?.label || "Learn";
  count.textContent = `${Math.min(currentStep + 1, steps.length)} / ${steps.length}`;
}

function showStep(index, { focus = true } = {}) {
  currentStep = Math.max(0, Math.min(index, steps.length - 1));
  steps.forEach((step, stepIndex) => {
    step.element.hidden = stepIndex !== currentStep;
  });
  renderProgress();

  const modal = $("#lesson-modal");
  modal?.classList.remove("mission-step-changing");
  requestAnimationFrame(() => modal?.classList.add("mission-step-changing"));

  const primary = $("#mission-primary");
  const current = steps[currentStep];
  if (!primary || !current) return;

  if (current.key === "learn")
    primary.textContent =
      steps.length > 2 ? "Continue to Explore →" : "Continue to Check →";
  else if (current.key === "explore")
    primary.textContent = steps.some((step) => step.key === "try")
      ? "Continue to Try →"
      : "Continue to Check →";
  else if (current.key === "try")
    primary.textContent = $("#complete-button")?.hidden
      ? "Finish challenge"
      : "Continue to Check →";
  else if (current.key === "check")
    primary.textContent = $("#complete-button")?.hidden
      ? "Check completion"
      : "Complete mission →";
  else primary.textContent = "Return to Journey →";

  if (current.key === "complete") {
    primary.classList.add("is-completion");
  } else {
    primary.classList.remove("is-completion");
  }

  const finalChallenge = $("#complete-button")?.hidden;
  const state = activeId ? loadState() : null;
  primary.disabled = Boolean(
    finalChallenge &&
      (current.key === "try" || current.key === "check") &&
      !(state && state.completedLessons.includes(activeId)),
  );

  if (focus) {
    const focusTarget =
      current.element.querySelector(
        "input,button,select,textarea,[tabindex]:not([tabindex='-1'])",
      ) || primary;
    if (focusTarget instanceof HTMLElement)
      focusTarget.focus({ preventScroll: true });
  }
}

function openCompletion() {
  if (completionShown) return;
  completionShown = true;
  const completeIndex = steps.findIndex((step) => step.key === "complete");
  if (completeIndex < 0) return;
  const xp = $("#modal-xp")?.textContent || "";
  const xpTarget = $("#mission-completion-xp");
  if (xpTarget) xpTarget.textContent = xp;
  showStep(completeIndex);
}

function handlePrimary() {
  const current = steps[currentStep];
  if (!current) return;

  if (current.key === "complete") {
    $("#modal-close")?.click();
    return;
  }

  if (current.key === "check") {
    const completeButton = $("#complete-button");
    if (completeButton?.hidden) {
      checkCompletion();
      return;
    }
    completeButton.click();
    setTimeout(() => {
      if (!$("#lesson-modal")?.hidden && completeButton.disabled)
        openCompletion();
    }, 50);
    return;
  }

  showStep(currentStep + 1);
}

function captureTrigger(event) {
  const candidate = event.target.closest?.(
    ".lesson-button, [data-journey-lesson]",
  );
  if (!candidate || candidate.disabled) return;
  trigger = candidate;
  activeId = candidate.dataset.lesson || candidate.dataset.journeyLesson || null;
}

function focusTrap(event) {
  const modal = $("#lesson-modal");
  if (!modal || modal.hidden || event.key !== "Tab") return;
  const focusables = [
    ...modal.querySelectorAll(
      "button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex='-1'])",
    ),
  ].filter((element) => element.offsetParent !== null);
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function onKeydown(event) {
  const modal = $("#lesson-modal");
  if (!modal || modal.hidden) return;
  if (event.key === "Escape") {
    event.preventDefault();
    $("#modal-close")?.click();
    return;
  }
  focusTrap(event);
}

function onModalOpen() {
  const modal = $("#lesson-modal");
  if (!modal || modal.hidden) return;
  ensureShell(modal);
  const level = $("#mission-level");
  if (level) level.textContent = lessonContext(activeId || "");
  const xp = $("#modal-xp")?.textContent || "";
  const missionXp = $("#mission-xp");
  if (missionXp) missionXp.textContent = xp;
  completionShown = false;
  steps = buildSteps(modal);
  showStep(0, { focus: false });
  const close = $("#modal-close");
  if (close) close.setAttribute("aria-label", "Exit mission");
  modal.setAttribute("aria-describedby", "modal-description");
  document.body.classList.add("mission-open");
  requestAnimationFrame(() => close?.focus({ preventScroll: true }));
}

function onModalClose() {
  const modal = $("#lesson-modal");
  if (!modal || !modal.hidden) return;
  document.body.classList.remove("mission-open");
  if (trigger && document.contains(trigger)) {
    trigger.focus({ preventScroll: true });
  }
  trigger = null;
  activeId = null;
  completionShown = false;
}

function checkCompletion() {
  if (!activeId || completionShown) return;
  const state = loadState();
  if (state.completedLessons.includes(activeId)) openCompletion();
}

function init() {
  ensureLink();
  const modal = $("#lesson-modal");
  if (!modal) return;

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "hidden"
      ) {
        if (modal.hidden) onModalClose();
        else setTimeout(onModalOpen, 0);
      }
    }
  });
  observer.observe(modal, { attributes: true });

  document.addEventListener("click", captureTrigger, true);
  document.addEventListener("keydown", onKeydown, true);
  window.addEventListener("ailearn-state-updated", checkCompletion);

  $("#modal-close")?.addEventListener("click", () =>
    setTimeout(onModalClose, 0),
  );

  if (!modal.hidden) setTimeout(onModalOpen, 0);
}

if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
