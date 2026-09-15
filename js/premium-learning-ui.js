const $ = (selector) => document.querySelector(selector);

const getMissionLists = () => [...document.querySelectorAll('.lesson-list')];

function missionButton(list) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'view-more-button';
  button.innerHTML = 'View more missions <span aria-hidden="true">↓</span>';
  button.setAttribute('aria-expanded', 'false');
  return button;
}

function applyProgressiveDisclosure() {
  getMissionLists().forEach((list) => {
    if (list.dataset.progressiveReady === 'true') return;
    const cards = [...list.querySelectorAll('.lesson-card')];
    if (cards.length <= 3) return;

    list.dataset.progressiveReady = 'true';
    list.classList.add('missions-collapsed');

    const wrapper = document.createElement('div');
    wrapper.className = 'mission-reveal';
    const button = missionButton(list);
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
  if (!current) return;
  const title = current.querySelector('h3')?.textContent?.trim();
  const button = $('#hero-current-mission');
  const meta = $('#hero-mission-meta');
  if (button && title) button.textContent = title;
  if (meta) meta.textContent = current.querySelector('.tag.xp')?.textContent || 'Continue your path.';
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
  const layer = $('#confetti-layer');
  if (!layer) return;
  layer.replaceChildren();
  const fragment = document.createDocumentFragment();
  const count = 34;
  for (let i = 0; i < count; i += 1) {
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

function patchRewardCelebration() {
  if (typeof window.showReward !== 'function' || window.showReward.__premiumPatched) return;
  const original = window.showReward;
  const wrapped = (...args) => {
    original(...args);
    celebrate();
  };
  wrapped.__premiumPatched = true;
  window.showReward = wrapped;
}

function refresh() {
  window.setTimeout(() => {
    applyProgressiveDisclosure();
    syncCurrentMission();
    syncFoundationProgress();
    patchRewardCelebration();
  }, 0);
}

const observer = new MutationObserver(refresh);
observer.observe(document.body, { childList: true, subtree: true });

window.setTimeout(refresh, 0);
