import { loadState, saveState } from "./state.js";
import { curriculumLevels, getCurriculumMastery } from "./progression.js";
import { evaluateMeaningfulAchievements, MEANINGFUL_ACHIEVEMENTS } from "./achievements.js";

const $ = (selector, root = document) => root.querySelector(selector);
const escapeHtml = (value = "") => String(value).replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);

function masteryData(state) {
  return getCurriculumMastery(state).levels.map((level) => ({
    ...level,
    unlocked: state.unlockedLevels.includes(level.id) || level.id === 1,
  }));
}

function syncMeaningfulAchievements() {
  const state = loadState();
  const mastery = masteryData(state);
  const eligible = evaluateMeaningfulAchievements(state, mastery);
  const newlyUnlocked = eligible.filter((id) => !state.achievements.includes(id));
  if (newlyUnlocked.length) {
    state.achievements.push(...newlyUnlocked);
    saveState(state);
    window.dispatchEvent(new CustomEvent("ailearn-achievements-updated", { detail: { newlyUnlocked } }));
  }
  return { state, mastery, newlyUnlocked };
}

function categoryLabel(category) {
  return { mastery: "Mastery", exploration: "Exploration", excellence: "Excellence" }[category] || category;
}

function renderCompact(state, mastery) {
  const mount = $("#learning-journey");
  if (!mount || $(".journey-mastery-summary", mount)) return;
  const completedPaths = mastery.filter((item) => item.complete).length;
  const unlockedAchievements = MEANINGFUL_ACHIEVEMENTS.filter(([id]) => state.achievements.includes(id)).length;
  const current = mastery.find((item) => item.unlocked && !item.complete);
  const currentText = current ? `${current.completed}/${current.total} missions · ${current.percent}%` : "Journey complete";
  const section = document.createElement("section");
  section.className = "journey-mastery-summary";
  section.setAttribute("aria-labelledby", "journey-mastery-title");
  section.innerHTML = `<div class="journey-mastery-copy"><span class="journey-kicker">LONG-TERM PROGRESS</span><h2 id="journey-mastery-title">Your mastery at a glance</h2><p>${completedPaths} of ${mastery.length} paths complete · ${unlockedAchievements} meaningful achievements</p></div><div class="journey-mastery-current"><strong>${escapeHtml(current?.title || "Full journey complete")}</strong><span>${currentText}</span></div><a class="journey-mastery-action" href="#achievements">View Progress <span aria-hidden="true">→</span></a>`;
  mount.appendChild(section);
}

function renderProgress(state, mastery) {
  const section = $("#achievements");
  if (!section) return;
  section.className = "section progress-experience";
  section.innerHTML = `<div class="progress-header"><div><span class="journey-kicker">YOUR PROGRESS</span><h2 id="progress-title">Mastery & achievements</h2><p>Completion shows what you've learned in the path. It is a progress signal, not a claim of expertise.</p></div><div class="progress-header-stats" aria-label="Progress summary"><span><strong>${state.level}</strong> player level</span><span><strong>${state.xp.toLocaleString()}</strong> XP</span><span><strong>${state.streak}</strong> day streak</span></div></div><section class="mastery-overview" aria-labelledby="mastery-overview-title"><div class="progress-section-heading"><div><span class="journey-kicker">LEARNING PATH</span><h3 id="mastery-overview-title">Chapter mastery</h3></div><strong>${mastery.filter((item) => item.complete).length}/${mastery.length} complete</strong></div><div class="mastery-grid">${mastery.map((item) => `<article class="mastery-card mastery-card--${item.complete ? "complete" : item.unlocked ? "started" : "locked"}"><div class="mastery-card-top"><span class="mastery-index">${String(item.id).padStart(2, "0")}</span><span class="mastery-status">${item.complete ? "✓ Complete" : item.unlocked ? `${item.percent}%` : "Locked"}</span></div><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.description)}</p><div class="mastery-count"><strong>${item.completed}/${item.total}</strong><span>missions</span></div><div class="mastery-track" role="progressbar" aria-label="${escapeHtml(item.title)} mastery progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${item.percent}"><span style="width:${item.percent}%"></span></div><small>${item.complete ? "Path complete" : item.unlocked ? `${item.total - item.completed} mission${item.total - item.completed === 1 ? "" : "s"} remaining` : "Complete the previous path to unlock"}</small></article>`).join("")}</div></section><section class="achievement-collection" aria-labelledby="achievement-collection-title"><div class="progress-section-heading"><div><span class="journey-kicker">ACHIEVEMENTS</span><h3 id="achievement-collection-title">Meaningful accomplishments</h3></div><strong>${MEANINGFUL_ACHIEVEMENTS.filter(([id]) => state.achievements.includes(id)).length}/${MEANINGFUL_ACHIEVEMENTS.length} unlocked</strong></div><div class="achievement-filter-row" role="group" aria-label="Achievement categories"><button type="button" class="achievement-filter is-active" data-achievement-filter="all">All</button><button type="button" class="achievement-filter" data-achievement-filter="mastery">Mastery</button><button type="button" class="achievement-filter" data-achievement-filter="exploration">Exploration</button><button type="button" class="achievement-filter" data-achievement-filter="excellence">Excellence</button></div><div class="achievement-collection-grid" id="meaningful-achievement-list"></div></section><section class="milestone-summary" aria-labelledby="milestone-summary-title"><div class="progress-section-heading"><div><span class="journey-kicker">MILESTONES</span><h3 id="milestone-summary-title">Lightweight progress markers</h3></div><span>From your existing progression</span></div><div class="milestone-chip-grid">${[ ["milestone-first-mission", "First mission"], ["milestone-ten-missions", "10 missions"], ["milestone-fifty-missions", "50 missions"], ["milestone-hundred-missions", "100 missions"], ["milestone-1000-xp", "1,000 XP"], ["milestone-5000-xp", "5,000 XP"], ["milestone-7-day-streak", "7-day streak"], ["milestone-30-day-streak", "30-day streak"] ].map(([id, label]) => `<span class="milestone-chip ${state.achievements.includes(id) ? "is-complete" : ""}"><b>${state.achievements.includes(id) ? "✓" : "○"}</b>${label}</span>`).join("")}</div></section>`;
  const list = $("#meaningful-achievement-list");
  const renderAchievements = (filter = "all") => {
    list.innerHTML = MEANINGFUL_ACHIEVEMENTS.filter(([, , , category]) => filter === "all" || category === filter).map(([id, title, description, category]) => { const unlocked = state.achievements.includes(id); return `<article class="meaningful-achievement ${unlocked ? "is-unlocked" : "is-locked"}"><div class="achievement-badge" aria-hidden="true">${unlocked ? "◇" : "□"}</div><div class="meaningful-achievement-copy"><span>${categoryLabel(category)}</span><h4>${escapeHtml(title)}</h4><p>${escapeHtml(description)}</p><strong>${unlocked ? "✓ Unlocked" : "Locked"}</strong></div></article>`; }).join("");
  };
  renderAchievements();
  section.querySelectorAll("[data-achievement-filter]").forEach((button) => button.addEventListener("click", () => { section.querySelectorAll("[data-achievement-filter]").forEach((item) => item.classList.remove("is-active")); button.classList.add("is-active"); renderAchievements(button.dataset.achievementFilter); }));
}

function ensureStyles() {
  if ($("#mastery-styles")) return;
  const style = document.createElement("style");
  style.id = "mastery-styles";
  style.textContent = `.journey-mastery-summary{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:18px;padding:20px 22px;border:1px solid var(--border);border-radius:18px;background:var(--surface);box-shadow:0 6px 20px rgba(53,45,35,.04)}.journey-mastery-summary h2{margin:.28rem 0 .2rem;font-size:1.25rem;letter-spacing:-.03em}.journey-mastery-summary p{margin:0;color:var(--muted);font-size:.78rem}.journey-mastery-current{display:grid;gap:3px;padding:10px 13px;border:1px solid #e2c7b5;border-radius:12px;background:#fff8f2;min-width:190px}.journey-mastery-current strong{font-size:.78rem}.journey-mastery-current span{font-size:.68rem;color:var(--muted)}.journey-mastery-action{display:inline-flex;align-items:center;gap:8px;padding:10px 13px;border-radius:10px;background:var(--accent);color:#fff;text-decoration:none;font:800 .72rem inherit}.journey-mastery-action:hover{background:#b95837}.progress-experience{display:grid;gap:26px}.progress-header{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;padding-bottom:4px}.progress-header h2{margin:.3rem 0 .35rem;font-size:clamp(1.7rem,3vw,2.2rem);letter-spacing:-.045em}.progress-header p{max-width:700px;margin:0;color:var(--muted);font-size:.8rem;line-height:1.55}.progress-header-stats{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.progress-header-stats span{padding:8px 10px;border:1px solid var(--border);border-radius:999px;background:var(--surface);font-size:.68rem;color:var(--muted)}.progress-header-stats strong{color:var(--text)}.mastery-overview,.achievement-collection,.milestone-summary{padding:22px;border:1px solid var(--border);border-radius:19px;background:var(--surface)}.progress-section-heading{display:flex;justify-content:space-between;gap:16px;align-items:flex-end;margin-bottom:16px}.progress-section-heading h3{margin:.25rem 0 0;font-size:1rem;letter-spacing:-.02em}.progress-section-heading>strong,.progress-section-heading>span{font:700 .65rem 'DM Mono',monospace;color:var(--muted)}.mastery-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.mastery-card{display:grid;gap:9px;padding:15px;border:1px solid var(--border);border-radius:15px;background:#fffaf6}.mastery-card--complete{border-color:#cbded1}.mastery-card--locked{opacity:.72}.mastery-card-top{display:flex;justify-content:space-between;align-items:center}.mastery-index{font:800 .62rem 'DM Mono',monospace;color:var(--accent)}.mastery-status{font:700 .61rem 'DM Mono',monospace;color:var(--muted);text-transform:uppercase}.mastery-card h4{margin:0;font-size:.9rem;line-height:1.25}.mastery-card p{margin:0;color:var(--muted);font-size:.68rem;line-height:1.45;min-height:2.9em}.mastery-count{display:flex;align-items:baseline;gap:5px}.mastery-count strong{font:800 .95rem 'DM Mono',monospace}.mastery-count span{font-size:.62rem;color:var(--muted)}.mastery-track{height:7px;border-radius:999px;background:#eee6dc;overflow:hidden}.mastery-track span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--accent),var(--accent-2));transition:width .35s ease}.mastery-card small{font-size:.61rem;color:var(--muted)}.achievement-filter-row{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px}.achievement-filter{border:1px solid var(--border);padding:7px 10px;border-radius:999px;background:transparent;color:var(--muted);cursor:pointer;font:700 .62rem 'DM Mono',monospace}.achievement-filter.is-active{background:#f4ddd1;border-color:#d9b6a3;color:#9b5034}.achievement-collection-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.meaningful-achievement{display:grid;grid-template-columns:auto 1fr;gap:10px;padding:13px;border:1px solid var(--border);border-radius:14px;background:#fffdf9}.meaningful-achievement.is-locked{opacity:.55}.achievement-badge{width:35px;height:35px;display:grid;place-items:center;border-radius:10px;background:#f4e6dc;color:var(--accent);font-size:1rem;font-weight:800}.meaningful-achievement-copy{display:grid;gap:3px}.meaningful-achievement-copy>span{font:700 .55rem 'DM Mono',monospace;letter-spacing:.1em;color:var(--accent);text-transform:uppercase}.meaningful-achievement-copy h4{margin:0;font-size:.8rem}.meaningful-achievement-copy p{margin:0;color:var(--muted);font-size:.65rem;line-height:1.35}.meaningful-achievement-copy strong{font-size:.62rem}.milestone-chip-grid{display:flex;gap:8px;flex-wrap:wrap}.milestone-chip{display:inline-flex;align-items:center;gap:5px;padding:7px 9px;border:1px solid var(--border);border-radius:999px;background:#fffdf9;color:var(--muted);font-size:.63rem}.milestone-chip b{font-size:.7rem;color:var(--accent)}@media(max-width:900px){.journey-mastery-summary{grid-template-columns:1fr auto}.journey-mastery-action{justify-self:start}.mastery-grid,.achievement-collection-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.progress-header{align-items:flex-start;flex-direction:column}.progress-header-stats{justify-content:flex-start}}@media(max-width:620px){.journey-mastery-summary{grid-template-columns:1fr}.mastery-grid,.achievement-collection-grid{grid-template-columns:1fr}.progress-section-heading{align-items:flex-start;flex-direction:column}}@media(prefers-reduced-motion:reduce){.mastery-track span{transition:none}}`;
  document.head.appendChild(style);
}

function renderAll() {
  ensureStyles();
  const { state, mastery } = syncMeaningfulAchievements();
  renderCompact(state, mastery);
  renderProgress(state, mastery);
}

function init() {
  renderAll();
  window.addEventListener("ailearn-state-updated", renderAll);
  window.addEventListener("ailearn-gamification-updated", renderAll);
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
