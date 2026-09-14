import { loadState, getLevelProgress, calculateLevel } from './state.js';

const LEVELS = [
  ['AI Foundations','Build your mental model of AI.','#foundation-list'],
  ['LLM Fundamentals','Tokens, embeddings, attention & prediction.','#llm-list'],
  ['Prompt Engineering','Learn to communicate with models effectively.','#prompt-list'],
  ['LLM Applications','Learn API basics and build with language models.','#app-list'],
  ['Open Source & Local AI','Explore model weights, local inference and hardware.','#local-ai-list'],
  ['Embeddings & Vector Search','Turn text into numerical representations for semantic search.','#embeddings-list'],
  ['Retrieval-Augmented Generation','Connect generation to selected external knowledge.','#rag-list'],
  ['AI Agents & Tools','Learn systems that can choose actions and use tools.','#agent-list'],
  ['Agent Memory & Planning','Explore state, memory, planning, retries and longer-horizon tasks.','#agent9-list'],
  ['MCP','Standardize how AI applications discover and interact with capabilities.','#mcp-list'],
  ['Agent Orchestration','Coordinate multiple agents, tools, workflows, and AI components.','#orch-list'],
  ['Advanced Agentic AI','Explore evaluation, reliability, guardrails, observability and production AI systems.','#advanced-list']
];

const sectionForLevel = (level) => document.querySelector(LEVELS[level - 1]?.[2])?.closest('.lessons-section');
const esc = (value) => String(value).replace(/[&<>\"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));

let previousCompleted = new Set(loadState().completedLessons);
let celebrationTimer = null;

function missionCards() {
  return [...document.querySelectorAll('.lesson-card')];
}

function currentMission() {
  const cards = missionCards();
  const candidate = cards.find((card) => !card.classList.contains('completed') && !card.classList.contains('locked') && !card.querySelector('button')?.disabled);
  if (!candidate) return null;
  const section = candidate.closest('.lessons-section');
  const level = Number(section?.dataset.level || 1);
  const button = candidate.querySelector('.lesson-button');
  const title = candidate.querySelector('h3')?.textContent?.trim() || '';
  const description = candidate.querySelector('p')?.textContent?.trim() || '';
  const tags = [...candidate.querySelectorAll('.tag')].map((node) => node.textContent.trim());
  return { id: button?.dataset.lesson || button?.dataset.localLesson || button?.dataset.embeddingLesson || button?.dataset.ragLesson || button?.dataset.agentLesson || button?.dataset.agent9Lesson || button?.dataset.mcpLesson || button?.dataset.orchestrationLesson || button?.dataset.agenticLesson, title, description, level, tags, card, button };
}

function getMissionId(button) {
  if (!button) return '';
  return Object.entries(button.dataset).find(([key]) => /lesson$/i.test(key))?.[1] || button.dataset.lesson || '';
}

function missionData() {
  const cards = missionCards();
  const candidate = cards.find((card) => {
    const button = card.querySelector('button');
    return !card.classList.contains('completed') && !card.classList.contains('locked') && button && !button.disabled;
  });
  if (!candidate) return null;
  const button = candidate.querySelector('button');
  const section = candidate.closest('.lessons-section');
  const level = Number(section?.dataset.level || 1);
  return {
    id: getMissionId(button),
    title: candidate.querySelector('h3')?.textContent?.trim() || '',
    description: candidate.querySelector('p')?.textContent?.trim() || '',
    level,
    tags: [...candidate.querySelectorAll('.tag')].map((node) => node.textContent.trim()),
    card: candidate,
    button
  };
}

function completedCount() {
  return missionCards().filter((card) => card.classList.contains('completed')).length;
}

function decorateLevelSections() {
  LEVELS.forEach(([title, description, listSelector], index) => {
    const section = document.querySelector(listSelector)?.closest('.lessons-section');
    if (!section) return;
    section.dataset.level = String(index + 1);
    section.setAttribute('aria-label', `Level ${index + 1}: ${title}`);
    const heading = section.querySelector('.section-heading');
    if (heading) {
      const eyebrow = heading.querySelector('.eyebrow');
      if (eyebrow) eyebrow.textContent = `LEVEL ${index + 1}`;
      const titleNode = heading.querySelector('h2');
      if (titleNode) titleNode.textContent = title;
      const copy = heading.querySelector('.section-copy');
      if (copy) copy.textContent = description;
    }
    let expand = section.querySelector('.level-expand');
    if (!expand) {
      expand = document.createElement('button');
      expand.type = 'button';
      expand.className = 'level-expand';
      section.appendChild(expand);
      expand.addEventListener('click', () => {
        section.classList.toggle('level-collapsed');
        updateExpandLabel(section);
      });
    }
    updateExpandLabel(section);
  });
}

function updateExpandLabel(section) {
  const button = section.querySelector('.level-expand');
  if (!button) return;
  const locked = section.classList.contains('locked-level-section');
  if (locked) {
    button.hidden = true;
    return;
  }
  button.hidden = false;
  button.textContent = section.classList.contains('level-collapsed') ? 'View all missions ↓' : 'Show fewer missions ↑';
  button.setAttribute('aria-expanded', String(!section.classList.contains('level-collapsed')));
}

function updateSections() {
  const state = loadState();
  const current = missionData();
  LEVELS.forEach((_, index) => {
    const section = sectionForLevel(index + 1);
    if (!section) return;
    const unlocked = state.unlockedLevels.includes(index + 1) || index === 0;
    const complete = state.completedLevels.includes(index + 1);
    section.classList.toggle('locked-level-section', !unlocked);
    section.classList.toggle('current-level-section', current?.level === index + 1);
    section.classList.toggle('level-collapsed', !unlocked || (current?.level !== index + 1 && !section.classList.contains('user-expanded')));
    if (current?.level === index + 1) section.classList.remove('level-collapsed');
    if (complete && current?.level !== index + 1) section.classList.add('level-collapsed');
    updateExpandLabel(section);
  });
  document.querySelectorAll('.lessons-section').forEach((section) => {
    if (!section.dataset.level) return;
    const level = Number(section.dataset.level);
    const node = document.querySelectorAll('.roadmap-node')[level - 1];
    node?.classList.toggle('current-level', current?.level === level);
    node?.classList.toggle('future', level > (current?.level || calculateLevel(state.xp)) + 1);
  });
}

function renderOverview() {
  const state = loadState();
  const current = missionData();
  const completed = completedCount();
  const total = 114;
  const playerProgress = getLevelProgress(state.xp);
  const levelTitle = LEVELS[(current?.level || state.unlockedLevels.at(-1) || 1) - 1]?.[0] || LEVELS[0][0];
  const overview = document.querySelector('#game-overview');
  if (!overview) return;
  const level = current?.level || Math.min(Math.max(state.unlockedLevels.at(-1) || 1, 1), 12);
  const levelSection = sectionForLevel(level);
  const countText = levelSection?.querySelector('.section-count')?.textContent || '0 / 10';
  overview.querySelector('[data-overview-level]').textContent = `LEVEL ${level}`;
  overview.querySelector('[data-overview-title]').textContent = levelTitle;
  overview.querySelector('[data-overview-count]').textContent = countText;
  overview.querySelector('[data-overview-percent]').textContent = `${Math.round((completed / total) * 100)}% journey`;
  overview.querySelector('[data-overview-bar]').style.width = `${Math.min(100, (completed / total) * 100)}%`;
  overview.querySelector('[data-player-xp]').textContent = `${state.xp} XP`;
  overview.querySelector('[data-player-level]').textContent = `Lv. ${state.level}`;
  overview.querySelector('[data-player-streak]').textContent = `${state.streak} day${state.streak === 1 ? '' : 's'}`;
  overview.querySelector('[data-player-completed]').textContent = `${completed} missions`;
  overview.querySelector('[data-player-rank]').textContent = ['Beginner Explorer','AI Learner','AI Builder','AI Engineer'][Math.min(state.level - 1, 3)];
  overview.querySelector('[data-xp-current]').textContent = `${playerProgress.current} / ${playerProgress.total} XP to next rank`;
  overview.querySelector('[data-xp-bar]').style.width = `${playerProgress.percent}%`;
}

function renderCurrentMission() {
  const shell = document.querySelector('#current-mission');
  if (!shell) return;
  const mission = missionData();
  const empty = shell.querySelector('[data-current-empty]');
  const content = shell.querySelector('[data-current-content]');
  if (!mission) {
    content.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  content.hidden = false;
  content.querySelector('[data-current-level]').textContent = `LEVEL ${mission.level} · MISSION`;
  content.querySelector('[data-current-title]').textContent = mission.title;
  content.querySelector('[data-current-description]').textContent = mission.description;
  const meta = content.querySelector('[data-current-meta]');
  meta.innerHTML = mission.tags.map((tag) => `<span class="${tag.includes('XP') ? 'xp' : ''}">${esc(tag)}</span>`).join('');
  const action = content.querySelector('[data-current-action]');
  action.onclick = () => mission.button?.click();
  mission.card.classList.add('current-mission-card');
  mission.card.setAttribute('aria-current','step');
}

function renderNextUp() {
  const box = document.querySelector('#next-up');
  if (!box) return;
  const current = missionData();
  const nextLevel = current ? current.level + 1 : 13;
  const item = LEVELS[nextLevel - 1];
  if (!item) {
    box.hidden = false;
    box.querySelector('[data-next-title]').textContent = 'Final Boss';
    box.querySelector('[data-next-copy]').textContent = 'Your learning journey is complete. Build the real system next.';
    return;
  }
  box.hidden = false;
  box.querySelector('[data-next-title]').textContent = `Level ${nextLevel} · ${item[0]}`;
  box.querySelector('[data-next-copy]').textContent = item[1];
}

function renderRecentAchievement() {
  const grid = document.querySelector('#achievement-list');
  const box = document.querySelector('#recent-achievement');
  if (!grid || !box) return;
  const unlocked = [...grid.querySelectorAll('.achievement.unlocked')];
  const recent = unlocked.at(-1);
  box.innerHTML = recent ? `<span class="next-up-icon">🏆</span><div><span class="mission-kicker">RECENT ACHIEVEMENT</span>${recent.innerHTML}<a class="achievement-link" href="#achievements">View achievements →</a></div>` : `<span class="next-up-icon">🏆</span><div><span class="mission-kicker">NEXT ACHIEVEMENT</span><strong>Keep learning</strong><p>Complete missions to unlock your first achievement.</p><a class="achievement-link" href="#achievements">View achievements →</a></div>`;
}

function setupModalShell() {
  const modal = document.querySelector('.lesson-modal');
  if (!modal || modal.dataset.redesigned === 'true') return;
  modal.dataset.redesigned = 'true';
  const close = modal.querySelector('#modal-close');
  const meta = modal.querySelector('.lesson-meta');
  const topbar = document.createElement('div');
  topbar.className = 'modal-topbar';
  const label = document.createElement('span');
  label.className = 'modal-progress-label';
  label.id = 'modal-progress-label';
  label.textContent = 'Learning mode';
  topbar.append(meta, label, close);
  modal.prepend(topbar);
  const children = [...modal.children].filter((node) => node !== topbar);
  const actions = modal.querySelector('.modal-actions');
  const scroll = document.createElement('div');
  scroll.className = 'modal-scroll';
  children.forEach((node) => { if (node !== actions) scroll.appendChild(node); });
  modal.insertBefore(scroll, actions);
  const steps = document.createElement('div');
  steps.className = 'lesson-step-progress';
  steps.innerHTML = `<span>LESSON FLOW</span><div class="step-dots" aria-hidden="true"><i class="step-dot active"></i><i class="step-dot"></i><i class="step-dot"></i><i class="step-dot"></i></div><span id="lesson-step-label">Learn</span>`;
  scroll.insertBefore(steps, scroll.firstChild);
  const completion = document.createElement('div');
  completion.className = 'completion-overlay';
  completion.hidden = true;
  completion.innerHTML = `<div class="completion-card"><div class="completion-check">✓</div><p class="eyebrow">MISSION COMPLETE</p><h2 data-completion-title>Great work!</h2><div class="completion-xp" data-completion-xp>+0 XP</div><div class="completion-progress"><span data-completion-bar></span></div><p class="completion-next">Next up<strong data-completion-next>Keep going</strong></p><button class="game-cta" type="button" data-completion-next-action>Next mission →</button></div>`;
  modal.appendChild(completion);
  modal.addEventListener('click', (event) => {
    if (event.target.closest('.quiz-option')) setLessonStep(2, 'Check');
    if (event.target.closest('.lesson-interaction button, .secondary-action, .primary-button')) setLessonStep(1, 'Interact');
  });
}

function setLessonStep(index, label) {
  const dots = [...document.querySelectorAll('.step-dot')];
  dots.forEach((dot, i) => { dot.classList.toggle('done', i < index); dot.classList.toggle('active', i === index); });
  const text = document.querySelector('#lesson-step-label');
  if (text) text.textContent = label;
}

function celebrate(title, xp, levelUnlocked = false) {
  const modal = document.querySelector('.lesson-modal');
  const overlay = modal?.querySelector('.completion-overlay');
  if (!modal || !overlay) return;
  const state = loadState();
  const next = missionData();
  overlay.querySelector('[data-completion-title]').textContent = title;
  overlay.querySelector('[data-completion-xp]').textContent = `+${xp} XP`;
  overlay.querySelector('[data-completion-bar]').style.width = `${Math.min(100, ((completedCount() + 1) / 114) * 100)}%`;
  overlay.querySelector('[data-completion-next]').textContent = levelUnlocked ? `Level ${Math.min(state.unlockedLevels.at(-1) || 1, 12)} unlocked` : next?.title || 'Choose your next mission';
  overlay.hidden = false;
  overlay.querySelector('[data-completion-next-action]').onclick = () => {
    overlay.hidden = true;
    document.querySelector('.modal-close')?.focus();
    if (next?.button) next.button.click(); else modal.closest('.modal-backdrop').hidden = true;
  };
  document.querySelectorAll('.current-mission-card').forEach((card) => card.classList.remove('current-mission-card'));
  confetti(levelUnlocked ? 42 : 22);
  const float = document.createElement('span');
  float.className = 'xp-float';
  float.textContent = `+${xp} XP`;
  float.style.left = '50%'; float.style.top = '28%';
  document.body.appendChild(float);
  setTimeout(() => float.remove(), 1000);
  clearTimeout(celebrationTimer);
  celebrationTimer = setTimeout(() => { overlay.hidden = true; }, 7000);
}

function confetti(amount) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < amount; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${45 + Math.random() * 10}%`;
    piece.style.top = `${20 + Math.random() * 15}%`;
    piece.style.setProperty('--dx', `${(Math.random() - .5) * 420}px`);
    piece.style.setProperty('--dy', `${220 + Math.random() * 360}px`);
    piece.style.setProperty('--rot', `${Math.random() * 900 - 450}deg`);
    piece.style.background = ['#c86c48','#8272bb','#4f8a6b','#d5a13b','#4d7698'][i % 5];
    frag.appendChild(piece);
    setTimeout(() => piece.remove(), 1000);
  }
  document.body.appendChild(frag);
}

function watchState() {
  window.addEventListener('ailearn-state-updated', () => {
    const nextState = loadState();
    const newlyCompleted = nextState.completedLessons.find((id) => !previousCompleted.has(id));
    const wasLevel = Math.max(...[...previousCompleted].map((id) => Number(id.split('-')[1]) || 0), 0);
    previousCompleted = new Set(nextState.completedLessons);
    decorateLevelSections();
    updateSections();
    renderOverview();
    renderCurrentMission();
    renderNextUp();
    renderRecentAchievement();
    if (newlyCompleted) {
      const completedCard = missionCards().find((card) => getMissionId(card.querySelector('button')) === newlyCompleted);
      const xpText = completedCard?.querySelector('.tag.xp')?.textContent || '+0 XP';
      const xp = Number(xpText.replace(/\D/g,'')) || 0;
      const levelUnlocked = nextState.unlockedLevels.length > 1 && nextState.unlockedLevels.length > (loadState().unlockedLevels || []).length;
      celebrate('Mission complete!', xp, levelUnlocked);
    }
  });
}

function init() {
  setupModalShell();
  decorateLevelSections();
  updateSections();
  renderOverview();
  renderCurrentMission();
  renderNextUp();
  renderRecentAchievement();
  watchState();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
