const $ = (selector) => document.querySelector(selector);

const getMissionLists = () => [...document.querySelectorAll('.lesson-list')];

function ensureConfettiLayer() {
  if ($('#confetti-layer')) return;
  const layer = document.createElement('div');
  layer.id = 'confetti-layer';
  layer.className = 'confetti-layer';
  layer.setAttribute('aria-hidden', 'true');
  document.body.append(layer);
}

function missionButton() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'view-more-button';
  button.innerHTML = 'View more missions <span aria-hidden="true">↓</span>';
  button.setAttribute('aria-expanded', 'false');
  return button;
}

function applyProgressiveDisclosure() {
  getMissionLists().forEach((list) => {
    const cards = [...list.querySelectorAll('.lesson-card')];
    if (cards.length <= 3) return;
    const existing = list.nextElementSibling;
    if (existing?.classList.contains('mission-reveal')) return;

    list.classList.add('missions-collapsed');
    const wrapper = document.createElement('div');
    wrapper.className = 'mission-reveal';
    const button = missionButton();
    wrapper.append(button);
    list.insertAdjacentElement('afterend', wrapper);

    button.addEventListener('click', () => {
      const expanded = list.classList.toggle('is-expanded');
      list.classList.toggle('missions-collapsed', !expanded);
      button.setAttribute('aria-expanded', String(expanded));
      button.innerHTML = expanded
        ? 'Show fewer missions <span aria-hidden="true">↑</span>'
        : 'View more missions <span aria-hidden="true">↓</span>';
    });
  });
}

function syncCurrentMission() {
  const current = [...document.querySelectorAll('.lesson-card')].find(
    (card) => !card.classList.contains('completed') && !card.classList.contains('locked'),
  );
  document.querySelectorAll('.lesson-card.current-mission').forEach((card) => card.classList.remove('current-mission'));
  if (!current) return;

  const title = current.querySelector('h3')?.textContent?.trim();
  const heroMission = $('.hero-progress');
  const heroTitle = heroMission?.querySelector('strong');
  const heroMeta = heroMission?.querySelector('.muted.small');
  if (heroTitle && title) heroTitle.textContent = title;
  if (heroMeta) heroMeta.textContent = current.querySelector('.tag.xp')?.textContent || 'Continue your path.';
  current.classList.add('current-mission');
}

function syncFoundationProgress() {
  const count = $('#foundation-count');
  const bar = $('#foundation-progress-bar');
  const percent = $('#foundation-progress-percent');
  if (!count || !bar || !percent) return;
  const [done, total] = count.textContent.split('/').map((part) => Number(part.trim()));
  const value = total ? Math.round((done / total) * 100) : 0;
  percent.textContent = `${value}%`;
  bar.style.width = `${value}%`;
}

function celebrate() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  ensureConfettiLayer();
  const layer = $('#confetti-layer');
  layer.replaceChildren();
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 34; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${35 + Math.random() * 30}%`;
    piece.style.setProperty('--dx', `${(Math.random() - 0.5) * 560}px`);
    piece.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
    piece.style.animationDelay = `${Math.random() * 110}ms`;
    piece.style.background = ['#6257d8', '#4f9a72', '#d88b4a', '#4b84c6', '#d65b7a'][i % 5];
    fragment.append(piece);
  }
  layer.append(fragment);
  window.setTimeout(() => layer.replaceChildren(), 1200);
}

let previousCompleted = null;
function detectCompletion() {
  try {
    const raw = localStorage.getItem('aiLearnState');
    if (!raw) return;
    const state = JSON.parse(raw);
    const count = Array.isArray(state.completedLessons) ? state.completedLessons.length : 0;
    if (previousCompleted !== null && count > previousCompleted) celebrate();
    previousCompleted = count;
  } catch {
    // Presentation layer must never interrupt the learning app.
  }
}

function refresh() {
  window.setTimeout(() => {
    ensureConfettiLayer();
    applyProgressiveDisclosure();
    syncCurrentMission();
    syncFoundationProgress();
    detectCompletion();
  }, 0);
}

const observer = new MutationObserver(refresh);
observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener('ailearn-state-updated', refresh);
window.setTimeout(refresh, 0);
