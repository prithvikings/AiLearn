// Lightweight browser-console test helpers for Phase 5 state mechanics.
// These are intentionally not loaded by the application.
export function assertGamification(condition, message) {
  if (!condition) throw new Error(`Gamification test failed: ${message}`);
}
