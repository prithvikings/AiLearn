import { phase4Lessons } from "./phase4.js";
import { phase5Lessons } from "./phase5.js";
import { phase6Lessons } from "./phase6.js";
import { phase7Lessons } from "./phase7.js";
import { phase8Lessons } from "./phase8.js";
import { phase9Lessons } from "./phase9.js";
import { phase10Lessons } from "./phase10.js";
import { phase11Lessons } from "./phase11.js";
import { phase12Lessons } from "./phase12.js";

export const levels = [
  { id: 1, title: "AI Foundations", description: "Build your mental model of AI.", unlocked: true, lessons: null },
  { id: 2, title: "LLM Fundamentals", description: "Tokens, embeddings, attention & prediction.", unlocked: false, lessons: null },
  { id: 3, title: "Prompt Engineering", description: "Learn to communicate with models effectively.", unlocked: false, lessons: null },
  { id: 4, title: "LLM Applications", description: "Learn API basics and build with language models.", unlocked: false, lessons: phase4Lessons },
  { id: 5, title: "Open Source & Local AI", description: "Explore model weights, local inference and hardware.", unlocked: false, lessons: phase5Lessons },
  { id: 6, title: "Embeddings & Vector Search", description: "Turn text into numerical representations for semantic search.", unlocked: false, lessons: phase6Lessons },
  { id: 7, title: "Retrieval-Augmented Generation", description: "Connect generation to selected external knowledge.", unlocked: false, lessons: phase7Lessons },
  { id: 8, title: "AI Agents & Tools", description: "Learn systems that can choose actions and use tools.", unlocked: false, lessons: phase8Lessons },
  { id: 9, title: "Agent Memory & Planning", description: "Explore state, memory, planning, retries and longer-horizon tasks.", unlocked: false, lessons: phase9Lessons },
  { id: 10, title: "MCP", description: "Standardize how AI applications discover and interact with capabilities.", unlocked: false, lessons: phase10Lessons },
  { id: 11, title: "Agent Orchestration", description: "Coordinate multiple agents, tools, workflows, and AI components.", unlocked: false, lessons: phase11Lessons },
  { id: 12, title: "Advanced Agentic AI", description: "Explore evaluation, reliability, guardrails, observability and production AI systems.", unlocked: false, lessons: phase12Lessons },
];

export const foundationLessons = [
  {
    id: "ai",
    title: "What is Artificial Intelligence?",
    description:
      "Understand what AI means and how it differs from ordinary software.",
    difficulty: "Beginner",
    xp: 25,
    visual: ["Rules", "Data", "AI System", "Output"],
    content:
      "<p>Artificial Intelligence is a broad field focused on building systems that can perform tasks that normally require human-like intelligence.</p><p>The useful mental model: software follows instructions; AI systems can learn patterns from examples and use those patterns to produce useful outputs.</p>",
    quiz: {
      question: "Which best describes AI?",
      options: [
        "A programming language",
        "Systems that perform tasks requiring intelligence",
        "A database",
        "A web framework",
      ],
      answer: 1,
    },
  },
  {
    id: "genai",
    title: "What is Generative AI?",
    description:
      "See how AI systems can create new text, images, code and more.",
    difficulty: "Beginner",
    xp: 25,
    visual: ["Prompt", "Model", "Generated Output"],
    content:
      "<p>Generative AI refers to models that generate new content from learned patterns. Text, images, audio and code can all be generated.</p><p>Large language models are one important category of generative AI, focused on language.</p>",
    quiz: {
      question: "What is a defining capability of generative AI?",
      options: [
        "Only storing data",
        "Generating new content",
        "Only sorting records",
        "Only rendering websites",
      ],
      answer: 1,
    },
  },
  {
    id: "llm",
    title: "What is an LLM?",
    description:
      "Learn the basic idea behind large language models without the math.",
    difficulty: "Beginner",
    xp: 25,
    visual: ["Text", "Tokens", "LLM", "Next token"],
    content:
      "<p>A Large Language Model (LLM) is a model trained on large amounts of text to learn patterns in language. At its core, a text-generation LLM repeatedly predicts what token should come next.</p>",
    quiz: {
      question: "What does a text-generation LLM fundamentally predict?",
      options: [
        "The next token",
        "A database row",
        "A CSS property",
        "A network packet",
      ],
      answer: 0,
    },
  },
  {
    id: "apps",
    title: "How LLM applications work",
    description: "Build a simple mental model of the pieces around an LLM.",
    difficulty: "Beginner",
    xp: 25,
    visual: ["UI", "Application Logic", "LLM Request", "Model", "Response"],
    content:
      "<p>LLM applications combine familiar software with model APIs. The UI gathers input, application logic builds a request, a model generates a response, and the application renders the result.</p>",
    quiz: {
      question: "Which component typically builds the request sent to a model?",
      options: ["Application logic", "CSS", "Database index", "Browser cache"],
      answer: 0,
    },
  },
  {
    id: "usecases",
    title: "Where LLMs Fit",
    description: "Recognize tasks where a language model can add useful capabilities.",
    difficulty: "Beginner",
    xp: 25,
    type: "use-case-match",
    visual: ["Task", "LLM", "Output"],
    content:
      "<p>Language models are useful for tasks involving language patterns such as summarization, drafting, transformation, classification, extraction, and conversational interfaces.</p>",
    matches: [["Summarize a report", "Transformation"], ["Classify support tickets", "Classification"], ["Draft an email", "Generation"], ["Extract names from text", "Extraction"]],
    quiz: {
      question: "Which is a common LLM use case?",
      options: ["Summarizing text", "Changing CPU voltage", "Rendering pixels directly", "Updating a network driver"],
      answer: 0,
    },
  },
];

export const allCurriculumLessons = levels.flatMap((level) => {
  if (level.id === 1) return foundationLessons;
  if (level.id === 2) return [...llmLessons, finalChallenge];
  if (level.id === 3) return promptLessons;
  return level.lessons || [];
});
