# AI Learn

A beginner-friendly, interactive GenAI learning platform built with plain HTML, CSS, and vanilla JavaScript.

## Phase 1

Phase 1 establishes the learning engine: a roadmap, reusable lesson view, XP progression, achievements, and local persistence. The curriculum is intentionally limited to five AI Foundations lessons.

## Run locally

No build step or package installation is required. Serve the repository with any static HTTP server. For example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## State

Player progress is stored in `localStorage` under `ai-learn-player-state-v1`. The state contains XP, level, streak, completed lesson IDs, and achievement IDs.

To reset progress from the browser console:

```js
localStorage.removeItem('ai-learn-player-state-v1');
location.reload();
```
