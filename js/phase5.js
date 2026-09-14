export const phase5Lessons = [
  {
    id: 'local-01', title: 'Where Do AI Models Come From?', description: 'Trace the lifecycle from data and training to weights and inference.', difficulty: 'Beginner', xp: 20, type: 'lifecycle',
    objective: 'Understand training, learned weights, inference, and how a model becomes part of an application.',
    content: '<p>A simplified model lifecycle is <strong>data → training → model → weights → inference → application</strong>. Training is where a model learns patterns from data. The learned parameters are commonly represented as weights.</p><p><strong>Inference</strong> means using the trained model to produce an output from an input. The model is a component of an application, not the whole application.</p>',
    stages: [
      ['📚 DATA', 'Training data provides examples and information from which patterns can be learned.'],
      ['🧠 TRAINING', 'Training adjusts model parameters so the model learns useful statistical patterns.'],
      ['⚙️ MODEL', 'The trained model is the learned computation that can be used for inference.'],
      ['📦 WEIGHTS', 'Weights are learned parameters that encode part of what the model learned.'],
      ['⚡ INFERENCE', 'Inference uses the trained model to process an input and generate an output.'],
      ['💬 RESPONSE', 'An application can present the generated output to a user.']
    ],
    quiz: { question: 'What happens during inference?', options: ['A trained model is used to produce an output for an input', 'Training data is collected for the first time', 'A CSS file is compiled', 'A model license is rewritten'], answer: 0 }
  },
  {
    id: 'local-02', title: 'Open Source vs Open Weights', description: 'Learn why downloadable weights and open-source software are related but not interchangeable.', difficulty: 'Beginner', xp: 30, type: 'open-classify',
    objective: 'Distinguish software openness from model-weight availability and consider licenses and usage terms.',
    content: '<p><strong>Open-source software</strong> generally refers to software whose source code is made available under an open-source license with defined rights. <strong>Open-weight models</strong> make model weights available, but that does not by itself tell you what code, data, modification rights, or usage terms are available.</p><p>The practical lesson is to inspect the <strong>license, weights, code availability, documentation, and usage restrictions</strong> instead of treating “downloadable” as a synonym for “open source.”</p>',
    statements: [
      { text: 'The model weights can be downloaded.', answer: 'weights', reason: 'This directly describes availability of model weights.' },
      { text: 'The training code is publicly available.', answer: 'software', reason: 'Public source code is relevant to software openness.' },
      { text: 'The model has a specific license.', answer: 'both', reason: 'Licensing terms matter when evaluating either software or model availability.' },
      { text: 'The model can be modified under its stated terms.', answer: 'both', reason: 'Modification rights depend on the applicable license or terms.' },
      { text: 'The files can be downloaded, so every part is open source.', answer: 'neither', reason: 'Downloadability alone does not establish open-source status.' }
    ],
    choices: [['weights', 'Open weights'], ['software', 'Open-source software'], ['both', 'Could matter to both'], ['neither', 'Not enough / incorrect conclusion']],
    quiz: { question: 'What does downloadable model weights prove by itself?', options: ['That the weights are available to download', 'That every part of the project is open source', 'That the model has no usage restrictions', 'That the training data is public'], answer: 0 }
  },
  {
    id: 'local-03', title: 'Meet the Model Hub', description: 'Browse a fictional model repository and inspect the metadata that helps you evaluate a model.', difficulty: 'Beginner', xp: 30, type: 'model-hub',
    objective: 'Understand what model hubs contain and which metadata is useful when evaluating a model.',
    content: '<p>Model hubs such as <strong>Hugging Face</strong> provide a place for people and organizations to share models, datasets, model cards, documentation, versions, and community resources.</p><p>This activity is fictional. In a real model hub, check details such as task, model size, license, context length, quantization, documentation, and hardware considerations before choosing a model.</p>',
    models: [
      { name: 'TinyChat', task: 'Text generation', size: 'Small', license: 'Example terms', context: 'Compact', quantization: 'Optional', hardware: 'Modest hardware', description: 'A fictional compact chat model for learning.' },
      { name: 'CodeHelper', task: 'Code generation', size: 'Medium', license: 'Example terms', context: 'Medium', quantization: 'Available', hardware: 'Stronger hardware', description: 'A fictional coding-focused model.' },
      { name: 'VisionModel', task: 'Vision', size: 'Large', license: 'Example terms', context: 'Task-specific', quantization: 'Available', hardware: 'Substantial resources', description: 'A fictional vision model used only for this simulation.' }
    ],
    quiz: { question: 'Which information is useful when evaluating a model?', options: ['License and hardware considerations', 'Only the model name', 'Only the download button', 'The page background color'], answer: 0 }
  },
  {
    id: 'local-04', title: 'What Does Running a Model Mean?', description: 'Load fictional weights into a local runtime and simulate inference.', difficulty: 'Beginner', xp: 35, type: 'inference',
    objective: 'Understand that model weights need an inference runtime and compute resources before they can generate outputs.',
    content: '<p>Downloading model weights and running a model are different actions. A <strong>runtime or inference engine</strong> loads the model, prepares the computation, uses available hardware, and performs inference.</p><p>This simulation shows the idea without downloading anything or executing a real model.</p>',
    quiz: { question: 'What is needed to turn model weights into a running local inference process?', options: ['A runtime/inference engine and computational resources', 'Only a filename', 'Only a browser tab', 'A CSS framework'], answer: 0 }
  },
  {
    id: 'local-05', title: 'Cloud AI vs Local AI', description: 'Choose cloud, local, or hybrid architectures for different scenarios.', difficulty: 'Beginner', xp: 35, type: 'cloud-local',
    objective: 'Compare cloud and local inference across setup, privacy control, hardware, connectivity, scalability, and cost tradeoffs.',
    content: '<p>With <strong>cloud AI</strong>, inference happens on provider infrastructure and applications commonly communicate over a network. With <strong>local AI</strong>, inference happens on your machine or local infrastructure.</p><p>Neither is universally better. Local inference can provide more control over where processing happens, but privacy still depends on networking, telemetry, logs, and surrounding software. Local also has hardware and electricity costs. Hybrid architectures can combine approaches.</p>',
    scenarios: [
      { text: 'A developer wants the easiest way to prototype a chatbot.', answer: 'cloud', reason: 'Cloud services can reduce local setup and hardware management.' },
      { text: 'A team wants certain workloads to remain on its own infrastructure.', answer: 'local', reason: 'Local inference can provide more direct control over where that workload is processed.' },
      { text: 'A student wants to experiment without an internet connection.', answer: 'local', reason: 'A locally running model can support offline inference when the full setup is available.' },
      { text: 'A startup wants globally scalable inference managed by a provider.', answer: 'cloud', reason: 'Provider infrastructure can handle scaling across remote infrastructure.' },
      { text: 'A team wants cloud reasoning for some tasks and local processing for others.', answer: 'hybrid', reason: 'A hybrid architecture can route different workloads to different environments.' }
    ],
    quiz: { question: 'Which statement is most accurate?', options: ['Cloud and local AI involve different tradeoffs and hybrid is also possible', 'Local AI is always private', 'Cloud AI is always cheaper', 'Local AI always beats cloud AI'], answer: 0 }
  },
  {
    id: 'local-06', title: 'CPU, GPU & Memory', description: 'Match conceptual model sizes to machine resources without pretending there is one exact hardware rule.', difficulty: 'Beginner', xp: 35, type: 'hardware',
    objective: 'Understand the roles of CPU, GPU, RAM, and VRAM in local AI workloads.',
    content: '<p>A <strong>CPU</strong> is a general-purpose processor. A <strong>GPU</strong> can perform many operations in parallel and is useful for many AI workloads. <strong>RAM</strong> and <strong>VRAM</strong> are memory resources used by software and accelerators.</p><p>Actual local-model requirements depend on architecture, precision, quantization, runtime, context length, and workload. A GPU is useful but not universally mandatory; some models can run on CPUs with different performance characteristics.</p>',
    profiles: [
      { id: 'basic', label: 'Basic', cpu: 45, ram: 45, gpu: 20, vram: 15, summary: 'More likely to suit smaller workloads; larger models may be impractical.' },
      { id: 'moderate', label: 'Moderate', cpu: 65, ram: 70, gpu: 55, vram: 55, summary: 'Provides more headroom for medium workloads, depending on the model and runtime.' },
      { id: 'powerful', label: 'Powerful', cpu: 85, ram: 90, gpu: 90, vram: 90, summary: 'Provides substantial resources, but model architecture and workload still matter.' }
    ],
    quiz: { question: 'Why do RAM and VRAM matter for local AI?', options: ['They provide memory resources needed by workloads', 'They determine the model license', 'They replace the inference runtime', 'They guarantee better answers'], answer: 0 }
  },
  {
    id: 'local-07', title: 'Model Size & Quantization', description: 'Visualize how model size and lower-precision representations can change memory requirements.', difficulty: 'Intermediate', xp: 40, type: 'quantization',
    objective: 'Understand the conceptual tradeoff between model size, numerical precision, memory footprint, and practical performance.',
    content: '<p>Larger models generally contain more parameters and can require more resources. Precision describes how numerical values are represented. Common terms include <strong>FP32, FP16, INT8, and 4-bit</strong>.</p><p><strong>Quantization</strong> can represent model weights with lower-precision formats to reduce memory requirements and may improve practical inference efficiency depending on the hardware and runtime. It is not magic compression and does not guarantee every workload becomes faster or equally accurate.</p>',
    quiz: { question: 'What is a useful reason to quantize a model?', options: ['To reduce memory requirements, with tradeoffs', 'To guarantee higher quality', 'To remove the need for compute', 'To make every model faster'], answer: 0 }
  },
  {
    id: 'local-08', title: 'Meet Ollama & Local Model Runtimes', description: 'Explore a simulated terminal workflow for pulling and running a local model.', difficulty: 'Intermediate', xp: 40, type: 'ollama',
    objective: 'Understand what a local model runtime does and how tools such as Ollama or LM Studio fit into the stack.',
    content: '<p>Tools such as <strong>Ollama</strong> can make local model workflows easier by helping users obtain, manage, and run models and expose local interfaces. <strong>LM Studio</strong> is another type of local AI application for working with models locally.</p><p>This terminal is simulated. The website does not execute Ollama commands, download models, or make external requests.</p>',
    commands: [
      ['$ ollama pull example-model', 'Downloading fictional model…'],
      ['████████████████████', 'Model ready.'],
      ['$ ollama run example-model', 'Starting fictional local runtime…'],
      ['>>> Explain APIs', 'An API is an interface that lets software systems communicate.']
    ],
    quiz: { question: 'What role can a local model runtime play?', options: ['Load/manage models and perform local inference', 'Replace all application UI', 'Automatically publish every model as open source', 'Guarantee unlimited memory'], answer: 0 }
  },
  {
    id: 'local-09', title: 'Build Your Local AI Setup', description: 'Assemble a conceptual local AI stack from goal to deployment style.', difficulty: 'Challenge', xp: 60, type: 'setup-builder',
    objective: 'Reason about goals, machine resources, model size, runtime, and deployment style as connected choices.',
    goals: ['Experiment', 'Coding', 'Chatbot', 'Offline assistant', 'Learning'],
    machines: ['Low-end', 'Mid-range', 'High-end'],
    sizes: ['Small', 'Medium', 'Large'],
    runtimes: ['Ollama', 'LM Studio', 'Other runtime'],
    deployments: ['Local', 'Cloud', 'Hybrid'],
    quiz: { question: 'What should guide a local AI setup choice?', options: ['Goal, hardware, model needs, runtime, and deployment tradeoffs', 'Only model name', 'Only GPU brand', 'Only whether a model is downloadable'], answer: 0 }
  },
  {
    id: 'local-10', title: 'OPEN SOURCE AI — FINAL BOSS', description: 'Design a logically consistent local AI architecture for a developer assistant.', difficulty: 'Final Boss', xp: 175, type: 'local-final',
    objective: 'Design and justify a complete local AI system while reasoning about tradeoffs instead of chasing one “correct” architecture.',
    content: '<p><strong>Scenario:</strong> You are building an AI assistant for a developer who wants to experiment with AI locally, keep data on their machine when possible, and avoid sending every request to a cloud service.</p><p>There is no single required architecture. You earn credit for choices that are logically consistent with the scenario and with one another. Passing requires <strong>70%</strong>. A failed attempt can be retried without losing XP.</p>',
    requirements: ['deployment', 'modelSize', 'runtime', 'hardware', 'precision', 'architecture', 'reasons'],
    deployments: ['Cloud', 'Local', 'Hybrid'],
    modelSizes: ['Small', 'Medium', 'Large'],
    runtimes: ['Local runtime', 'Cloud API'],
    hardware: ['Basic', 'Moderate', 'Powerful'],
    precision: ['Higher precision', 'Quantized'],
    reasons: ['Privacy', 'Offline capability', 'Lower infrastructure dependency', 'Easier setup', 'Hardware constraints', 'Cost considerations']
  }
];

export const phase5Achievements = [
  { id: 'model-explorer', icon: '🌱', title: 'MODEL EXPLORER', description: 'Complete Mission 1.' },
  { id: 'open-weight-detective', icon: '🔓', title: 'OPEN WEIGHT DETECTIVE', description: 'Complete Mission 2.' },
  { id: 'model-hub-navigator', icon: '🗂', title: 'MODEL HUB NAVIGATOR', description: 'Complete Mission 3.' },
  { id: 'inference-initiate', icon: '⚡', title: 'INFERENCE INITIATE', description: 'Complete Mission 4.' },
  { id: 'cloud-local-strategist', icon: '☁️💻', title: 'CLOUD/LOCAL STRATEGIST', description: 'Complete Mission 5.' },
  { id: 'hardware-scout', icon: '🖥', title: 'HARDWARE SCOUT', description: 'Complete Mission 6.' },
  { id: 'quantization-explorer', icon: '📦', title: 'QUANTIZATION EXPLORER', description: 'Complete Mission 7.' },
  { id: 'local-ai-explorer', icon: '🦙', title: 'LOCAL AI EXPLORER', description: 'Complete Mission 8.' },
  { id: 'local-ai-builder', icon: '🛠', title: 'LOCAL AI BUILDER', description: 'Complete Mission 9.' },
  { id: 'open-source-ai-architect', icon: '🏆', title: 'OPEN SOURCE AI ARCHITECT', description: 'Complete the Final Boss.' }
];