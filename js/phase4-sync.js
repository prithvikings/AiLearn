import { loadState } from "./state.js";

// Load the premium UI as an additive presentation layer without changing the
// existing page structure or learning logic.
if (!document.querySelector('link[data-premium-learning-ui]')) {
  const style = document.createElement('link');
  style.rel = 'stylesheet';
  style.href = './css/premium-learning-ui.css';
  style.dataset.premiumLearningUi = 'true';
  document.head.append(style);
}
if (!document.querySelector('script[data-premium-learning-ui]')) {
  const script = document.createElement('script');
  script.type = 'module';
  script.src = './js/premium-learning-ui.js';
  script.dataset.premiumLearningUi = 'true';
  document.body.append(script);
}

let signature = JSON.stringify(loadState());

setInterval(() => {
  const next = loadState();
  const nextSignature = JSON.stringify(next);
  if (nextSignature !== signature) {
    signature = nextSignature;
    window.dispatchEvent(new CustomEvent("ailearn-state-updated"));
  }
}, 600);
