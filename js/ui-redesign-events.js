import { loadState } from './state.js';

let previousUnlocked = new Set(loadState().unlockedLevels);

function celebrateLevelUnlock() {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  const state = loadState();
  const newlyUnlocked = state.unlockedLevels.find((level) => !previousUnlocked.has(level));
  previousUnlocked = new Set(state.unlockedLevels);
  if (!newlyUnlocked) return;

  const overlay = document.querySelector('.completion-overlay');
  if (overlay && !overlay.hidden) {
    const title = overlay.querySelector('[data-completion-title]');
    const next = overlay.querySelector('[data-completion-next]');
    if (title) title.textContent = `Level ${newlyUnlocked} unlocked!`;
    if (next) next.textContent = 'Continue to your new learning path';
  }

  for (let i = 0; i < 28; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = `${45 + Math.random() * 10}%`;
    piece.style.top = `${18 + Math.random() * 14}%`;
    piece.style.setProperty('--dx', `${(Math.random() - .5) * 500}px`);
    piece.style.setProperty('--dy', `${240 + Math.random() * 380}px`);
    piece.style.setProperty('--rot', `${Math.random() * 1000 - 500}deg`);
    piece.style.background = ['#c86c48','#8272bb','#4f8a6b','#d5a13b','#4d7698'][i % 5];
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1000);
  }
}

window.addEventListener('ailearn-state-updated', () => setTimeout(celebrateLevelUnlock, 0));
