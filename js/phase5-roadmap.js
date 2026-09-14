import { loadState, isLevelUnlocked } from './state.js';

const roadmapLevels = [
  ['AI Foundations', 'Build your mental model of AI.'],
  ['LLM Fundamentals', 'Tokens, embeddings, attention & prediction.'],
  ['Prompt Engineering', 'Learn to communicate with models effectively.'],
  ['LLM Applications', 'Learn API basics and build with language models.'],
  ['Open Source & Local AI', 'Explore model weights, local inference and hardware.'],
  ['Embeddings & Vector Search', 'Turn text into numerical representations for semantic search.'],
  ['RAG', 'Connect models to external knowledge.'],
  ['Tools', 'Give AI applications access to useful capabilities.'],
  ['Agents', 'Design systems that can reason and use tools.'],
  ['MCP & Orchestration', 'Connect capabilities and coordinate multi-step AI systems.']
];

function render() {
  const list = document.querySelector('#roadmap-list');
  if (!list) return;
  const state = loadState();
  while (list.children.length < roadmapLevels.length) {
    const node = document.createElement('article');
    node.className = 'roadmap-node';
    node.innerHTML = '<span class="roadmap-number"></span><span class="roadmap-status"></span><h3></h3><p></p>';
    list.appendChild(node);
  }
  [...list.children].slice(0, roadmapLevels.length).forEach((node, index) => {
    const level = index + 1;
    const [title, description] = roadmapLevels[index];
    const open = isLevelUnlocked(state, level);
    const complete = state.completedLevels.includes(level);
    node.classList.toggle('unlocked', open);
    node.classList.toggle('completed', complete);
    node.querySelector('.roadmap-number').textContent = `LEVEL ${level}`;
    node.querySelector('.roadmap-status').textContent = complete ? '✓' : open ? '●' : '⌑';
    node.querySelector('.roadmap-status').setAttribute('aria-label', complete ? 'Completed' : open ? 'Unlocked' : 'Locked');
    node.querySelector('h3').textContent = title.toUpperCase();
    node.querySelector('p').textContent = description;
  });
  const count = document.querySelector('#roadmap .section-count');
  if (count) count.textContent = `${roadmapLevels.length} LEVELS`;
}

render();
window.addEventListener('ailearn-state-updated', render);
