import { loadState } from "./state.js";
import "./journey.js";
import "./gamification-ui.js";
import "./celebration.js";
import "./mastery.js";
import "./achievement-feedback.js";

if (!document.querySelector("link[data-celebration-styles]")) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "css/celebration.css";
  link.dataset.celebrationStyles = "true";
  document.head.appendChild(link);
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
