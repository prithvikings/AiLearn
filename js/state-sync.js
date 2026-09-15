import { loadState } from "./state.js";

let signature = JSON.stringify(loadState());

export function startStateSync(intervalMs = 600) {
  return window.setInterval(() => {
    const nextSignature = JSON.stringify(loadState());
    if (nextSignature === signature) return;
    signature = nextSignature;
    window.dispatchEvent(new CustomEvent("ailearn-state-updated"));
  }, intervalMs);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => startStateSync(), { once: true });
} else {
  startStateSync();
}
