import { loadState } from "./state.js";
import "./journey.js";
import "./gamification-ui.js";
import "./celebration.js";

let signature = JSON.stringify(loadState());

setInterval(() => {
  const next = loadState();
  const nextSignature = JSON.stringify(next);
  if (nextSignature !== signature) {
    signature = nextSignature;
    window.dispatchEvent(new CustomEvent("ailearn-state-updated"));
  }
}, 600);
