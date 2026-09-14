export const levels = [
  { id: 1, title: 'AI Foundations', description: 'Build your mental model of AI.', unlocked: true },
  { id: 2, title: 'LLM Fundamentals', description: 'Tokens, embeddings, attention & prediction.', unlocked: false },
  { id: 3, title: 'Prompt Engineering', description: 'Learn to communicate with models effectively.', unlocked: false },
  { id: 4, title: 'Open Source AI', description: 'Hugging Face, Ollama and local models.', unlocked: false },
  { id: 5, title: 'RAG', description: 'Connect models to your own knowledge.', unlocked: false },
  { id: 6, title: 'Agents', description: 'Models that reason and use tools.', unlocked: false },
  { id: 7, title: 'MCP', description: 'A standard way to connect AI to tools and data.', unlocked: false },
  { id: 8, title: 'Agent Orchestration', description: 'Design reliable multi-step AI systems.', unlocked: false }
];

export const lessons = [
  { id: 'ai', title: 'What is Artificial Intelligence?', description: 'Understand what AI means and how it differs from ordinary software.', difficulty: 'Beginner', xp: 25, visual: ['Rules', 'Data', 'AI System', 'Output'], content: '<p>Artificial Intelligence is a broad field focused on building systems that can perform tasks that normally require human-like intelligence.</p><p>The useful mental model: software follows instructions; AI systems can learn patterns from examples and use those patterns to produce useful outputs.</p>', quiz: { question: 'Which best describes AI?', options: ['A programming language', 'Systems that perform tasks requiring intelligence', 'A database', 'A web framework'], answer: 1 } },
  { id: 'genai', title: 'What is Generative AI?', description: 'See how AI systems can create new text, images, code and more.', difficulty: 'Beginner', xp: 25, visual: ['Prompt', 'Model', 'Generated Output'], content: '<p>Generative AI refers to models that generate new content from learned patterns. Text, images, audio and code can all be generated.</p><p>Large language models are one important category of generative AI, focused on language.</p>', quiz: { question: 'What is a defining capability of generative AI?', options: ['Only storing data', 'Generating new content', 'Only sorting records', 'Only rendering websites'], answer: 1 } },
  { id: 'llm', title: 'What is an LLM?', description: 'Learn the basic idea behind large language models without the math.', difficulty: 'Beginner', xp: 25, visual: ['Text', 'Tokens', 'LLM', 'Next token'], content: '<p>A Large Language Model (LLM) is a model trained on large amounts of text to learn patterns in language. At its core, a text-generation LLM repeatedly predicts what token should come next.</p><p>You do not need transformer math yet. First, remember the pipeline: text becomes tokens, the model processes those tokens, and it predicts a continuation.</p>', quiz: { question: 'What does a text-generation LLM fundamentally predict?', options: ['The next token', 'A database row', 'A CSS property', 'A network packet'], answer: 0 } },
  { id: 'apps', title: 'How LLM applications work', description: 'Build a simple mental model of the pieces around an LLM.', difficulty: 'Beginner', xp: 25, visual: ['User', 'App', 'LLM', 'Response'], content: '<p>An LLM application usually has more than the model. A user interacts with an application, the application prepares a request, the LLM generates a response, and the application presents it.</p><p>Later, you will add APIs, retrieval, tools and memory to this mental model.</p>', quiz: { question: 'What usually sits between a user and an LLM in an application?', options: ['An application layer', 'A compiler only', 'A spreadsheet', 'A router only'], answer: 0 } },
  { id: 'usecases', title: 'Real-world LLM use cases', description: 'Explore practical ways language models are used today.', difficulty: 'Beginner', xp: 25, visual: ['LLM', 'Chat', 'Code', 'Search', 'Summarize'], content: '<p>LLMs can power chat assistants, summarization, code assistance, classification, extraction, content drafting and question-answering.</p><p>The important engineering lesson is that the model is a component. Good products combine the model with the right data, instructions, interface and constraints.</p>', quiz: { question: 'Which is a realistic LLM use case?', options: ['Summarizing a document', 'Replacing electricity', 'Increasing screen resolution', 'Formatting a hard drive'], answer: 0 } }
];

export const achievements = [
  { id: 'first-step', icon: '↗', title: 'FIRST STEP', description: 'Complete your first lesson.' },
  { id: 'curious-mind', icon: '✦', title: 'CURIOUS MIND', description: 'Complete 3 lessons.' },
  { id: 'ai-explorer', icon: '◆', title: 'AI EXPLORER', description: 'Complete Level 1.' }
];
