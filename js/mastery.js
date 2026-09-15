import { foundationLessons, llmLessons, promptLessons, finalChallenge } from "./curriculum.js";
import { phase4Lessons } from "./phase4.js";
import { phase5Lessons } from "./phase5.js";
import { phase6Lessons } from "./phase6.js";
import { phase7Lessons } from "./phase7.js";
import { phase8Lessons } from "./phase8.js";
import { phase9Lessons } from "./phase9.js";
import { phase10Lessons } from "./phase10.js";
import { phase11Lessons } from "./phase11.js";
import { phase12Lessons } from "./phase12.js";
import { loadState, saveState } from "./state.js";
import { roadmapLevels } from "./phase5-roadmap.js";

const LEVELS = [
  foundationLessons,
  [...llmLessons, finalChallenge],
  promptLessons,
  phase4Lessons,
  phase5Lessons,
  phase6Lessons,
  phase7Lessons,
  phase8Lessons,
  phase9Lessons,
  phase10Lessons,
  phase11Lessons,
  phase12Lessons,
];

export const MEANINGFUL_ACHIEVEMENTS = [
  ["foundations-complete", "AI Foundations", "Complete the AI Foundations path.", "mastery", 1],
  ["llm-fundamentals-complete", "Model Thinker", "Complete the LLM Fundamentals path, including its final challenge.", "mastery", 2],
  ["prompt-architect", "Prompt Architect", "Complete the Prompt Engineering path.", "mastery", 3],
  ["application-architect", "Application Architect", "Complete the LLM Applications path.", "mastery", 4],
  ["local-ai-builder", "Local AI Builder", "Complete the Open Source & Local AI path.", "mastery", 5],
  ["vector-search-architect", "Vector Search Architect", "Complete the Embeddings & Vector Search path.", "mastery", 6],
  ["rag-builder", "RAG Builder", "Complete the Retrieval-Augmented Generation path.", "mastery", 7],
  ["agent-engineer", "Agent Engineer", "Complete the AI Agents & Tools path.", "mastery", 8],
  ["memory-planning-architect", "Memory & Planning Architect", "Complete the Agent Memory & Planning path.", "mastery", 9],
  ["mcp-architect", "MCP Architect", "Complete the MCP path.", "mastery", 10],
  ["orchestration-architect", "Orchestration Architect", "Complete the Agent Orchestration path.", "mastery", 11],
  ["advanced-agentic-architect", "Advanced Agentic Architect", "Complete the Advanced Agentic AI path.", "mastery", 12],
  ["ai-explorer", "AI Explorer", "Complete at least 5 curriculum paths.", "exploration", 5],
  ["breadth-builder", "Breadth Builder", "Complete at least 8 curriculum paths.", "exploration", 8],
  ["perfect-challenge", "Perfect Challenge", "Earn a 100% score on a recorded challenge.", "excellence", "perfect"],
  ["challenge-specialist", "Challenge Specialist", "Earn 100% on three recorded challenges.", "excellence", "three-perfect"],
  ["full-journey", "Full Journey", "Complete every curriculum path in the learning journey.", "mastery", "all"],
];

const $ = (selector, root = document) => root.querySelector(selector);
const complete = (state, lesson) => state.completedLessons.includes(lesson.id);
const escapeHtml = (value = "") => String(value).replace(/[&<>\"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);

function masteryData(state) {
  return LEVELS.map((lessons, index) => {
    const [title, description] = roadmapLevels[index] || [`Level ${index + 1}`, ""];
    const completed = lessons.filter((lesson) => complete(state, lesson)).length;
    const total = lessons.length;
    const unlocked = state.unlockedLevels.includes(index + 1) || index === 0;
    const completePath = total > 0 && completed === total;
    return {
      id: index + 1,
      title,
      description,
      completed,
      total,
      percent: total ? Math.round((completed / total) * 100) : 0,
      unlocked,
      complete: completePath,
    };
  });
}

export function evaluateMeaningfulAchievements(state, mastery = masteryData(state)) {
  const completedPaths = mastery.filter((item) => item.complete).length;
  const perfectChallenges = Object.values(state.challengeScores || {}).filter((score) => Number(score) === 100).length;
  return MEANINGFUL_ACHIEVEMENTS.filter(([, , , category, requirement]) => {
    if (category === "mastery") {
      if (requirement === "all") return completedPaths === mastery.length;
      return Boolean(mastery.find((item) => item.id === requirement)?.complete);
    }
    if (category === "exploration") return completedPaths >= requirement;
    if (requirement === "perfect") return perfectChallenges >= 1;
    if (requirement === "three-perfect") return perfectChallenges >= 3;
    return false;
  }).map(([id]) => id);
}

function syncMeaningfulAchievements() {
  const state = loadState();
  const mastery = masteryData(state);
  const eligible = evaluateMeaningfulAchievements(state, mastery);
  const newlyUnlocked = eligible.filter((id) => !state.achievements.includes(id));
  if (!newlyUnlocked.length) return { state, mastery, newlyUnlocked: [] };
  state.achievements.push(...newlyUnlocked);
  saveState(state);
  window.dispatchEvent(new CustomEvent("ailearn-achievements-updated", { detail: { newlyUnlocked } }));
  return { state, mastery, newlyUnlocked };
}

function achievementById(id) {
  return MEANINGFUL_ACHIEVEMENTS.find((item) => item[0] === id);
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
  section.innerHTML = `
    <div class="journey-mastery-copy">
      <span class="journey-kicker">LONG-TERM PROGRESS</span>
      <h2 id="journey-mastery-title">Your mastery at a glance</h2>
      <p>${completedPaths} of ${mastery.length} paths complete · ${unlockedAchievements} meaningful achievements</p>
    </div>
    <div class="journey-mastery-current"><strong>${escapeHtml(current?.title || "Full journey complete")}</strong><span>${currentText}</span></div>
    <a class="journey-mastery-action" href="#achievements">View Progress <span aria-hidden="true">→</span></a>`;
  mount.appendChild(section);
}

function renderProgress(state, mastery) {
  const section = $("#achievements");
  if (!section) return;
  section.className = "section progress-experience";
  section.innerHTML = `
    <div class="progress-header">
      <div>
        <span class="journey-kicker">YOUR PROGRESS</span>
        <h2 id="progress-title">Mastery & achievements</h2>
        <p>Completion shows what you've learned in the path. It is a progress signal, not a claim of expertise.</p>
      </div>
      <div class="progress-header-stats" aria-label="Progress summary">
        <span><strong>${state.level}</strong> player level</span>
        <span><strong>${state.xp.toLocaleString()}</strong> XP</span>
        <span><strong>${state.streak}</strong> day streak</span>
      </div>
    </div>

    <section class="mastery-overview" aria-labelledby="mastery-overview-title">
      <div class="progress-section-heading"><div><span class="journey-kicker">LEARNING PATH</span><h3 id="mastery-overview-title">Chapter mastery</h3></div><strong>${mastery.filter((item) => item.complete).length}/${mastery.length} complete</strong></div>
      <div class="mastery-grid">
        ${mastery.map((item) => `
          <article class="mastery-card mastery-card--${item.complete ? "complete" : item.unlocked ? "started" : "locked"}">
            <div class="mastery-card-top"><span class="mastery-index">${String(item.id).padStart(2, "0")}</span><span class="mastery-status">${item.complete ? "✓ Complete" : item.unlocked ? `${item.percent}%` : "Locked"}</span></div>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.description)}</p>
            <div class="mastery-count"><strong>${item.completed}/${item.total}</strong><span>missions</span></div>
            <div class="mastery-track" role="progressbar" aria-label="${escapeHtml(item.title)} mastery progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${item.percent}"><span style="width:${item.percent}%"></span></div>
            <small>${item.complete ? "Path complete" : item.unlocked ? `${item.total - item.completed} mission${item.total - item.completed === 1 ? "" : "s"} remaining` : "Complete the previous path to unlock"}</small>
          </article>`).join("")}
      </div>
    </section>

    <section class="achievement-collection" aria-labelledby="achievement-collection-title">
      <div class="progress-section-heading"><div><span class="journey-kicker">ACHIEVEMENTS</span><h3 id="achievement-collection-title">Meaningful accomplishments</h3></div><strong>${MEANINGFUL_ACHIEVEMENTS.filter(([id]) => state.achievements.includes(id)).length}/${MEANINGFUL_ACHIEVEMENTS.length} unlocked</strong></div>
      <div class="achievement-filter-row" role="group" aria-label="Achievement categories">
        <button type="button" class="achievement-filter is-active" data-achievement-filter="all">All</button>
        <button type="button" class="achievement-filter" data-achievement-filter="mastery">Mastery</button>
        <button type="button" class="achievement-filter" data-achievement-filter="exploration">Exploration</button>
        <button type="button" class="achievement-filter" data-achievement-filter="excellence">Excellence</button>
      </div>
      <div class="achievement-collection-grid" id="meaningful-achievement-list"></div>
    </section>

    <section class="milestone-summary" aria-labelledby="milestone-summary-title">
      <div class="progress-section-heading"><div><span class="journey-kicker">MILESTONES</span><h3 id="milestone-summary-title">Lightweight progress markers</h3></div><span>From your existing progression</span></div>
      <div class="milestone-chip-grid">
        ${[
          ["milestone-first-mission", "First mission"],
          ["milestone-ten-missions", "10 missions"],
          ["milestone-fifty-missions", "50 missions"],
          ["milestone-hundred-missions", "100 missions"],
          ["milestone-1000-xp", "1,000 XP"],
          ["milestone-5000-xp", "5,000 XP"],
          ["milestone-7-day-streak", "7-day streak"],
          ["milestone-30-day-streak", "30-day streak"],
        ].map(([id, label]) => `<span class="milestone-chip ${state.achievements.includes(id) ? "is-complete" : ""}"><b>${state.achievements.includes(id) ? "✓" : "○"}</b>${label}</span>`).join("")}
      </div>
    </section>`;

  const list = $("#meaningful-achievement-list");
  const renderAchievements = (filter = "all") => {
    list.innerHTML = MEANINGFUL_ACHIEVEMENTS.filter(([, , , category]) => filter === "all" || category === filter).map(([id, title, description, category]) => {
      const unlocked = state.achievements.includes(id);
      return `<article class="meaningful-achievement ${unlocked ? "is-unlocked" : "is-locked"}"><div class="achievement-badge" aria-hidden="true">${unlocked ? "◇" : "□"}</div><div class="meaningful-achievement-copy"><span>${categoryLabel(category)}</span><h4>${escapeHtml(title)}</h4><p>${escapeHtml(description)}</p><strong>${unlocked ? "✓ Unlocked" : "Locked"}</strong></div></article>`;
    }).join("");
  };
  renderAchievements();
  section.querySelectorAll("[data-achievement-filter]").forEach((button) => button.addEventListener("click", () => {
    section.querySelectorAll("[data-achievement-filter]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderAchievements(button.dataset.achievementFilter);
  }));
}

function ensureStyles() {
  if ($("#mastery-styles")) return;
  const style = document.createElement("style");
  style.id = "mastery-styles";
  style.textContent = `
    .journey-mastery-summary{display:grid;grid-template-columns:1fr auto auto;align-items:center;gap:18px;padding:20px 22px;border:1px solid var(--border);border-radius:18px;background:var(--surface);box-shadow:0 6px 20px rgba(53,45,35,.04)}
    .journey-mastery-summary h2{margin:.28rem 0 .2rem;font-size:1.25rem;letter-spacing:-.03em}.journey-mastery-summary p{margin:0;color:var(--muted);font-size:.78rem}.journey-mastery-current{display:grid;gap:3px;padding:10px 13px;border:1px solid #e2c7b5;border-radius:12px;background:#fff8f2;min-width:190px}.journey-mastery-current strong{font-size:.78rem}.journey-mastery-current span{font-size:.68rem;color:var(--muted)}.journey-mastery-action{display:inline-flex;align-items:center;gap:8px;padding:10px 13px;border-radius:10px;background:var(--accent);color:#fff;text-decoration:none;font:800 .72rem inherit}.journey-mastery-action:hover{background:#b95837}
    .progress-experience{display:grid;gap:26px}.progress-header{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;padding-bottom:4px}.progress-header h2{margin:.3rem 0 .35rem;font-size:clamp(1.7rem,3vw,2.2rem);letter-spacing:-.045em}.progress-header p{max-width:700px;margin:0;color:var(--muted);font-size:.8rem;line-height:1.55}.progress-header-stats{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.progress-header-stats span{padding:8px 10px;border:1px solid var(--border);border-radius:999px;background:var(--surface);font-size:.68rem;color:var(--muted)}.progress-header-stats strong{color:var(--text)}
    .mastery-overview,.achievement-collection,.milestone-summary{padding:22px;border:1px solid var(--border);border-radius:19px;background:var(--surface)}.progress-section-heading{display:flex;justify-content:space-between;align-items:flex-end;gap:18px;margin-bottom:17px}.progress-section-heading h3{margin:.3rem 0 0;font-size:1.3rem;letter-spacing:-.035em}.progress-section-heading>strong,.progress-section-heading>span{font-size:.72rem;color:var(--muted);white-space:nowrap}.mastery-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}.mastery-card{padding:16px;border:1px solid var(--border);border-radius:15px;background:#fffdf9}.mastery-card--complete{border-color:#c7d8cc;background:#fbfdf9}.mastery-card--locked{opacity:.7;background:#f7f3ee}.mastery-card-top{display:flex;justify-content:space-between;align-items:center;gap:10px}.mastery-index{font:700 .58rem 'DM Mono',monospace;color:var(--muted)}.mastery-status{font:800 .58rem 'DM Mono',monospace;color:var(--accent)}.mastery-card h4{margin:11px 0 5px;font-size:.94rem}.mastery-card p{min-height:39px;margin:0;color:var(--muted);font-size:.7rem;line-height:1.45}.mastery-count{display:flex;align-items:baseline;gap:5px;margin:13px 0 7px}.mastery-count strong{font-size:.86rem}.mastery-count span,.mastery-card>small{color:var(--muted);font-size:.64rem}.mastery-track{height:6px;overflow:hidden;border-radius:999px;background:#eee6dc}.mastery-track span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--accent),var(--accent-2));transition:width .35s ease}
    .achievement-filter-row{display:flex;gap:7px;flex-wrap:wrap;margin:-4px 0 14px}.achievement-filter{padding:7px 10px;border:1px solid var(--border);border-radius:999px;background:var(--surface);color:var(--muted);font:700 .62rem inherit;cursor:pointer}.achievement-filter.is-active{border-color:#d8ad95;background:#fff5ed;color:var(--accent)}.achievement-collection-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}.meaningful-achievement{display:grid;grid-template-columns:46px 1fr;gap:11px;padding:14px;border:1px solid var(--border);border-radius:15px;background:#fffdf9}.meaningful-achievement.is-locked{opacity:.62}.achievement-badge{width:42px;height:42px;display:grid;place-items:center;border:1px solid #dfc6b7;border-radius:12px;background:#fff6ef;color:var(--accent);font-size:1.1rem}.meaningful-achievement-copy>span{font:700 .54rem 'DM Mono',monospace;letter-spacing:.1em;color:var(--muted);text-transform:uppercase}.meaningful-achievement h4{margin:4px 0 4px;font-size:.82rem}.meaningful-achievement p{margin:0 0 8px;color:var(--muted);font-size:.67rem;line-height:1.45}.meaningful-achievement strong{font-size:.62rem;color:var(--accent)}.milestone-chip-grid{display:flex;flex-wrap:wrap;gap:8px}.milestone-chip{display:inline-flex;align-items:center;gap:6px;padding:8px 10px;border:1px solid var(--border);border-radius:999px;background:#fffdf9;color:var(--muted);font-size:.66rem}.milestone-chip b{font-size:.68rem;color:#a99c91}.milestone-chip.is-complete{border-color:#cbdacc;background:#f7fbf7;color:var(--text)}.milestone-chip.is-complete b{color:var(--success)}
    @media(max-width:900px){.mastery-grid,.achievement-collection-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.journey-mastery-summary{grid-template-columns:1fr auto}.journey-mastery-action{justify-self:start}.progress-header{align-items:flex-start;flex-direction:column}.progress-header-stats{justify-content:flex-start}}
    @media(max-width:620px){.mastery-grid,.achievement-collection-grid{grid-template-columns:1fr}.journey-mastery-summary{grid-template-columns:1fr}.journey-mastery-current{min-width:0}.journey-mastery-action{width:100%;justify-content:center}.progress-experience{gap:17px}.mastery-overview,.achievement-collection,.milestone-summary{padding:16px}.progress-section-heading{align-items:flex-start;flex-direction:column;gap:6px}.progress-section-heading>strong,.progress-section-heading>span{white-space:normal}.progress-header-stats span{font-size:.64rem}}
    @media(prefers-reduced-motion:reduce){.mastery-track span{transition:none}}
  `;
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
