export const phase4Lessons = [
  {
    id: "app-01",
    title: "From Prompt to API Request",
    description:
      "Trace user input as an application turns it into a simulated model request.",
    difficulty: "Beginner",
    xp: 20,
    type: "api-request",
    objective:
      "Understand an API as an interface between software systems and see how application input becomes a request.",
    visual: [
      "User Input",
      "Application",
      "Build Request",
      "LLM",
      "Response",
      "UI",
    ],
    content:
      "<p>An <strong>API</strong> is an interface that lets one piece of software communicate with another. In an LLM application, the text you enter becomes part of a request the application sends to a model service.</p><p>The exact API format varies between providers. This simulation uses a generic request so you can learn the architecture without memorizing vendor syntax.</p>",
    sampleInput: "Explain photosynthesis in simple words.",
    quiz: {
      question: "What is an API?",
      options: [
        "An interface that lets software systems communicate",
        "A type of database",
        "A model parameter",
        "A CSS animation",
      ],
      answer: 0,
    },
  },
  {
    id: "app-02",
    title: "Messages: System, User & Assistant",
    description:
      "Build a conversation from common message roles and observe the conceptual effect.",
    difficulty: "Beginner",
    xp: 25,
    type: "messages",
    objective:
      "Understand system, user and assistant messages as parts of a conversation sent to a model.",
    visual: ["System", "User", "Assistant"],
    content:
      "<p>Many LLM APIs represent conversations as messages with roles such as <strong>system</strong>, <strong>user</strong>, and <strong>assistant</strong>.</p><p>A system message can provide behavioral or contextual guidance. A user message contains the user request. An assistant message represents prior or generated assistant content.</p><p>These roles influence the model context; a system message does not magically guarantee behavior.</p>",
    defaults: {
      system: "You are a helpful programming tutor.",
      user: "Explain recursion.",
      assistant:
        "Recursion is a technique where a function can call itself to solve a smaller version of a problem.",
    },
    quiz: {
      question: "Which message usually contains the learner’s request?",
      options: ["System", "User", "Assistant", "Model"],
      answer: 1,
    },
  },
  {
    id: "app-03",
    title: "Anatomy of an LLM Request",
    description:
      "Configure a generic model request and inspect the request object.",
    difficulty: "Beginner",
    xp: 30,
    type: "request-builder",
    objective:
      "Recognize common request building blocks such as model, messages and generation settings.",
    visual: ["Model", "Messages", "Settings", "Request"],
    content:
      "<p>Across different providers, LLM request formats differ, but many applications deal with similar concepts: a <strong>model</strong>, <strong>messages</strong>, and generation settings such as temperature or a maximum output budget.</p><p>Use the builder to see how those concepts can live together in one request object.</p>",
    quiz: {
      question: "Which is a common building block of an LLM request?",
      options: [
        "Messages",
        "A monitor driver",
        "A browser bookmark",
        "A CSS selector",
      ],
      answer: 0,
    },
  },
  {
    id: "app-04",
    title: "JSON In, JSON Out",
    description:
      "Explore structured API data and learn to identify keys, values, arrays and objects.",
    difficulty: "Beginner",
    xp: 30,
    type: "json-explorer",
    objective:
      "Understand why applications commonly use structured data and how to read simple JSON.",
    visual: [
      "Application",
      "JSON Request",
      "API",
      "JSON Response",
      "Application",
    ],
    content:
      "<p>APIs commonly exchange structured data because applications need predictable fields they can read and use.</p><p>JSON can contain <strong>objects, arrays, strings and numbers</strong>. A requested JSON structure is useful, but generated JSON should still be validated before an application relies on it.</p>",
    json: {
      input: "Explain gravity",
      response: "Gravity is the attraction between masses.",
      sources: ["conceptual example"],
      confidence: 0.8,
    },
    quiz: {
      question: "Which property contains the model response in this example?",
      options: ["input", "response", "confidence", "sources"],
      answer: 1,
    },
  },
  {
    id: "app-05",
    title: "Context Windows & Token Limits",
    description:
      "Fill a conceptual context window and learn why applications manage conversation history.",
    difficulty: "Beginner",
    xp: 35,
    type: "context-window",
    objective:
      "Understand that models have finite context capacity and that context is not the same as permanent memory.",
    visual: ["System", "History", "Documents", "Current Request"],
    content:
      "<p>LLMs do not have unlimited context. A <strong>context window</strong> is the amount of information a model can consider for a particular interaction or request.</p><p>Different models have different context limits. When an application gets close to a limit, it may truncate older content, summarize history, or retrieve only relevant information.</p><p><strong>Context is not permanent memory.</strong> Previous information only affects a request when the application provides it again or retrieves it from a separate memory system.</p>",
    quiz: {
      question:
        "What can an application do when conversation context gets too large?",
      options: [
        "Summarize or remove older content",
        "Assume the model has unlimited memory",
        "Increase the model’s parameters from the browser",
        "Disable all user input",
      ],
      answer: 0,
    },
  },
  {
    id: "app-06",
    title: "Streaming Responses",
    description:
      "Compare a complete response with a response rendered chunk by chunk.",
    difficulty: "Beginner",
    xp: 35,
    type: "streaming",
    objective:
      "Understand how streaming can improve perceived responsiveness without changing answer quality.",
    visual: ["Request", "Chunk", "Chunk", "Chunk", "UI"],
    content:
      "<p>With a normal response, an application may wait until the complete response is available before displaying it. With <strong>streaming</strong>, the service can deliver partial output progressively.</p><p>Streaming can make an interface <strong>feel more responsive</strong> because users see progress earlier. It does not automatically make the model generate a better answer.</p>",
    streamText:
      "An API is an interface that lets software systems communicate.",
    quiz: {
      question: "What is a main user-experience benefit of streaming?",
      options: [
        "Partial output can appear before the complete response",
        "It guarantees better answers",
        "It increases model parameters",
        "It removes the need for a UI",
      ],
      answer: 0,
    },
  },
  {
    id: "app-07",
    title: "Choosing the Right Model",
    description:
      "Compare fictional models using capability, speed, cost and latency tradeoffs.",
    difficulty: "Beginner",
    xp: 35,
    type: "model-picker",
    objective:
      "Choose a model based on application requirements rather than assuming one model is best for everything.",
    visual: ["Task", "Requirements", "Model Choice"],
    content:
      "<p>Models can differ in <strong>capability, speed, cost, context size, latency and specialization</strong>. There is no single best model for every application.</p><p>The names and attributes in this activity are fictional and intentionally avoid real-world benchmark claims. The goal is learning how to reason about tradeoffs.</p>",
    models: [
      {
        id: "swift",
        name: "Swift",
        speed: "High",
        capability: "Medium",
        cost: "Low",
        latency: "Low",
      },
      {
        id: "balanced",
        name: "Balanced",
        speed: "Medium",
        capability: "High",
        cost: "Medium",
        latency: "Medium",
      },
      {
        id: "reasoner",
        name: "Reasoner",
        speed: "Low",
        capability: "Very High",
        cost: "High",
        latency: "High",
      },
    ],
    tasks: [
      {
        id: "classification",
        label: "Simple classification",
        answer: "swift",
        reason:
          "High throughput and low cost are useful when the task is straightforward.",
      },
      {
        id: "coding",
        label: "Coding assistant",
        answer: "balanced",
        reason:
          "A strong general-purpose capability/speed tradeoff fits many coding tasks.",
      },
      {
        id: "reasoning",
        label: "Complex reasoning",
        answer: "reasoner",
        reason: "This task prioritizes capability over speed and cost.",
      },
      {
        id: "chatbot",
        label: "High-volume chatbot",
        answer: "swift",
        reason:
          "Low latency and lower cost can matter when request volume is high.",
      },
    ],
    quiz: {
      question: "How should you choose a model?",
      options: [
        "Match model tradeoffs to application requirements",
        "Always choose the largest model",
        "Always choose the slowest model",
        "Choose based only on name",
      ],
      answer: 0,
    },
  },
  {
    id: "app-08",
    title: "Build Your First LLM App",
    description:
      "Assemble a simulated study, code, email or support assistant from UI to response.",
    difficulty: "Intermediate",
    xp: 50,
    type: "app-builder",
    objective:
      "Connect UI, application logic, messages, request settings, simulated model response and response handling.",
    visual: [
      "UI",
      "Message Builder",
      "Request",
      "Simulated API",
      "Response",
      "UI",
    ],
    content:
      "<p>An LLM application is more than <strong>UI + AI</strong>. It combines an interface, application logic, instructions/messages, a request, a model service, and response handling.</p><p>Build a small conceptual application without calling a real API. The response is simulated locally so no API key or external service is needed.</p>",
    appTypes: [
      "Study Assistant",
      "Code Assistant",
      "Email Assistant",
      "Customer Support Bot",
    ],
    outputFormats: ["Concise text", "Bullet list", "Structured JSON"],
    quiz: {
      question: "Which sequence best represents an LLM application?",
      options: [
        "UI → application logic → request → model → response → UI",
        "UI → database only",
        "Model → CSS → keyboard",
        "Prompt → permanent memory automatically",
      ],
      answer: 0,
    },
  },
  {
    id: "app-09",
    title: "Debug the Request",
    description:
      "Inspect broken generic requests and repair the conceptual problem.",
    difficulty: "Challenge",
    xp: 60,
    type: "request-debug",
    objective:
      "Identify common conceptual request mistakes and explain why they are problematic.",
    visual: ["Inspect", "Find issue", "Fix", "Retry"],
    content:
      "<p>Debugging an LLM integration often starts by inspecting the request your application actually built.</p><p>These examples use generic concepts rather than provider-specific error codes. Look for missing or malformed fields, empty messages, or unsupported roles.</p>",
    bugs: [
      {
        id: "wrong-key",
        label: "Wrong message property",
        request:
          '{\n  "model": "example-model",\n  "message": [{ "role": "user", "content": "Explain APIs" }]\n}',
        choices: [
          'The request uses "message" instead of the expected messages collection.',
          "The prompt is too short.",
          "The model name is too long.",
        ],
        answer: 0,
        fix: 'Use a messages collection such as "messages": [...] in this conceptual format.',
      },
      {
        id: "empty",
        label: "Empty messages",
        request: '{\n  "model": "example-model",\n  "messages": []\n}',
        choices: [
          "There is no conversation input to process.",
          "JSON cannot contain arrays.",
          "Temperature is missing.",
        ],
        answer: 0,
        fix: "Provide at least the relevant conversation message(s) for the simulated request.",
      },
      {
        id: "role",
        label: "Unknown role",
        request:
          '{\n  "model": "example-model",\n  "messages": [{ "role": "unknown", "content": "Hello" }]\n}',
        choices: [
          "The role is not one of the roles supported by this conceptual format.",
          "The content is too friendly.",
          "The model cannot receive text.",
        ],
        answer: 0,
        fix: "Use a supported conceptual role such as system, user, or assistant.",
      },
    ],
    quiz: {
      question: "What is a useful first debugging step?",
      options: [
        "Inspect the request your application actually constructed",
        "Randomly change every setting",
        "Expose a secret API key in the UI",
        "Delete the user input",
      ],
      answer: 0,
    },
  },
  {
    id: "app-10",
    title: "LLM APPLICATIONS — FINAL BOSS",
    description: "Design a complete conceptual LLM-powered study assistant.",
    difficulty: "Final Boss",
    xp: 150,
    type: "app-final",
    objective:
      "Design the major pieces of an LLM application and pass with at least 70% coverage.",
    visual: [
      "Student",
      "Study UI",
      "Application Logic",
      "Messages",
      "LLM Request",
      "Model",
      "Response",
      "Student",
    ],
    content:
      "<p>You are building an <strong>AI study assistant</strong>. Design the application from user input through request construction, model selection and response handling.</p><p>Passing requires <strong>70%</strong>. A failed attempt can be retried without losing XP.</p>",
    requirements: [
      "appType",
      "system",
      "user",
      "settings",
      "model",
      "delivery",
      "responseFlow",
    ],
    appTypes: ["Study Assistant", "Code Assistant", "Email Assistant"],
    models: ["Swift", "Balanced", "Reasoner"],
    deliveries: ["Streaming", "Non-streaming"],
    quiz: null,
  },
];

export const phase4Achievements = [
  {
    id: "api-explorer",
    icon: "↗",
    title: "API EXPLORER",
    description: "Complete Mission 1.",
  },
  {
    id: "message-architect",
    icon: "◫",
    title: "MESSAGE ARCHITECT",
    description: "Complete Mission 2.",
  },
  {
    id: "json-navigator",
    icon: "▦",
    title: "JSON NAVIGATOR",
    description: "Complete Mission 4.",
  },
  {
    id: "context-keeper",
    icon: "◌",
    title: "CONTEXT KEEPER",
    description: "Complete Mission 5.",
  },
  {
    id: "stream-rider",
    icon: "⚡",
    title: "STREAM RIDER",
    description: "Complete Mission 6.",
  },
  {
    id: "llm-builder",
    icon: "◆",
    title: "LLM BUILDER",
    description: "Complete Mission 8.",
  },
  {
    id: "request-debugger",
    icon: "⌕",
    title: "REQUEST DEBUGGER",
    description: "Complete Mission 9.",
  },
  {
    id: "llm-application-architect",
    icon: "★",
    title: "LLM APPLICATION ARCHITECT",
    description: "Complete the entire LLM Applications level.",
  },
];
