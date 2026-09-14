export const phase12Lessons = [
  {
    id:'agentic-01', title:'Designing Reliable Agentic Systems', description:'Explore how validation, retries, fallback, review, approval and observability change an agent system.', difficulty:'Advanced', xp:40, type:'reliability',
    objective:'Understand reliability as a system-design property with tradeoffs in cost, latency and complexity.',
    components:['Validation','Retries','Fallback','Review','Human approval','Observability'],
    quiz:{question:'What is a sound way to think about reliability safeguards?',options:['They can improve reliability while adding complexity, latency or cost','They guarantee correctness','They remove the need for evaluation','Every system should use every safeguard'],answer:0}
  },
  {
    id:'agentic-02', title:'Planning Strategies', description:'Compare plan-first, incremental and hybrid planning for different task shapes.', difficulty:'Advanced', xp:45, type:'planning',
    objective:'Choose planning strategies based on predictability, uncertainty and the need to adapt during execution.',
    strategies:[
      ['PLAN FIRST','Create a complete plan, then execute it.','Clear structure; easier to inspect.','Plans can become outdated; unnecessary planning for simple tasks.'],
      ['INCREMENTAL','Choose the next step after observing the current result.','Adapts to new information.','More decisions during execution; potentially less predictable.'],
      ['HYBRID','Create an initial plan and re-plan when needed.','Balances structure with adaptation.','Adds system complexity.']
    ],
    scenarios:[['Simple fixed data transformation','PLAN FIRST'],['Research with uncertain findings','INCREMENTAL'],['Complex software debugging','HYBRID'],['Long-running project with known stages and possible surprises','HYBRID']],
    quiz:{question:'Which planning strategy can combine an initial structure with later adaptation?',options:['Hybrid','Plan first only','Incremental only','None'],answer:0}
  },
  {
    id:'agentic-03', title:'Reflection, Critique & Verification', description:'Learn how systems can check generated work using observable evidence instead of trusting claims.', difficulty:'Advanced', xp:50, type:'verification',
    objective:'Distinguish generated claims from verification evidence and choose an appropriate revision path.',
    quiz:{question:'An agent says a migration succeeded, but two checks failed. What should happen next?',options:['Verify the claim using observable evidence','Trust the agent because it generated the result','Retry blindly forever','Hide the failed checks'],answer:0}
  },
  {
    id:'agentic-04', title:'Structured Outputs & Contracts', description:'Build a small contract between agent components and see how validation handles malformed results.', difficulty:'Advanced', xp:50, type:'contracts',
    objective:'Understand that schema validation checks structure, not factual truth.',
    fields:[['status','string','required'],['summary','string','required'],['testsPassed','boolean','required'],['issues','array','optional']],
    quiz:{question:'What does schema validation tell you?',options:['The output follows the required structure','The information is automatically true','The agent cannot hallucinate','The workflow is always safe'],answer:0}
  },
  {
    id:'agentic-05', title:'Guardrails & Safe Tool Use', description:'Configure permissions, confirmations and blocks around simulated tools and sensitive actions.', difficulty:'Advanced', xp:55, type:'guardrails',
    objective:'Apply least-privilege and approval concepts without treating guardrails as perfect protection.',
    tools:[['read_documentation','Low'],['search_code','Low'],['run_tests','Low'],['modify_code','Medium'],['send_email','High'],['delete_data','High']],
    quiz:{question:'What is a sensible control for a sensitive external action?',options:['Appropriate authorization and human approval where warranted','Unlimited tool permissions','Automatic execution without checks','Disable all tools'],answer:0}
  },
  {
    id:'agentic-06', title:'Agent Evaluation', description:'Run a simulated golden test set, inspect failures and detect a regression after a change.', difficulty:'Advanced', xp:60, type:'evaluation',
    objective:'Use representative tests to measure behavior and catch regressions rather than relying on a single demo.',
    tests:[['Research accuracy','Pass','Evidence matches expected findings.'],['Tool selection','Fail','Agent chose an unnecessary tool.'],['Instruction following','Pass','Required constraints were followed.'],['Safety behavior','Partial','Correctly blocked one risky action but missed a confirmation case.'],['Output format','Pass','Required fields were present.']],
    quiz:{question:'What is a golden test set?',options:['A collection of representative scenarios used to evaluate expected behavior','A guarantee that an agent is correct','A hidden reasoning trace','A list of model parameters'],answer:0}
  },
  {
    id:'agentic-07', title:'Observability & Debugging', description:'Inspect an observable execution trace to find where an agent system failed.', difficulty:'Advanced', xp:65, type:'observability',
    objective:'Distinguish observability from evaluation and use traces to locate failures without exposing hidden reasoning.',
    trace:[['00:01','User request received','application','ok','Input accepted.'],['00:02','Planner created task','planner','ok','Three execution steps recorded.'],['00:03','Research Agent called search tool','research-agent','ok','Tool request issued.'],['00:04','Tool returned result','search tool','ok','Result returned.'],['00:05','Agent generated draft','writer-agent','ok','Draft artifact created.'],['00:06','Validator rejected output','validator','error','Required field missing.'],['00:07','Agent retry started','writer-agent','retry','Repair attempt started.'],['00:08','Reviewer flagged issue','reviewer','error','Evidence did not support one claim.'],['00:09','Human approval requested','approval','waiting','Sensitive action requires authorization.']],
    quiz:{question:'What does observability primarily help answer?',options:['What happened during execution and where failures occurred','Whether the model is always factually correct','Whether hidden reasoning was exposed','Whether more agents are always needed'],answer:0}
  },
  {
    id:'agentic-08', title:'Long-Running Agents & Recovery', description:'Use checkpoints, retries and recovery paths to resume a simulated migration after failure.', difficulty:'Advanced', xp:70, type:'recovery',
    objective:'Distinguish retry from broader recovery and choose safe ways to resume partial progress.',
    steps:['Analyze project','Prepare migration plan','Run checks','Perform migration','Validate','Generate report'],
    quiz:{question:'A multi-step task has a valid saved checkpoint after a failure. What is a strong recovery option?',options:['Resume from the checkpoint when safe','Restart everything automatically','Retry the failed action forever','Ignore the saved state'],answer:0}
  },
  {
    id:'agentic-09', title:'Optimize Cost, Latency & Model Selection', description:'Choose fictional model tiers and workflow optimizations using qualitative tradeoffs.', difficulty:'Advanced', xp:75, type:'optimizer',
    objective:'Select models and execution strategies based on task needs rather than assuming bigger or more agents are better.',
    models:[['MODEL A','Small','Fast','Low cost','Lower capability'],['MODEL B','Medium','Moderate','Moderate cost','Balanced capability'],['MODEL C','Large','Slower','Higher cost','Higher capability']],
    scenarios:[['Simple classification','MODEL A'],['Fast autocomplete','MODEL A'],['Complex reasoning task','MODEL C'],['Large batch processing','MODEL B'],['High-risk task requiring stronger verification','MODEL C']],
    quiz:{question:'What should model selection depend on?',options:['Task complexity, latency, cost and quality requirements','Model size alone','Number of agents alone','Which model is newest'],answer:0}
  },
  {
    id:'agentic-10', title:'AGENTIC SYSTEM ARCHITECT — FINAL BOSS', description:'Design and defend a production-style agentic architecture using reliability, evaluation, guardrails, observability and recovery concepts.', difficulty:'Final Boss', xp:500, type:'final',
    objective:'Evaluate architecture choices, debug failures and balance capability, safety, cost and operational visibility.',
    components:['AI Application','Orchestrator','Planner','Research Agent','Code Agent','Test Agent','Review Agent','Memory','Shared State','Tools','MCP Client','MCP Server','Resources','Prompts','Validator','Guardrail','Human Approval','Checkpoint','Retry / Recovery','Observability','Evaluation','Final Response','Model Selector'],
    questions:[
      ['The agent output has valid JSON but an incorrect claim. What is needed?',['Trust the JSON structure','Verify the content with evidence/tests where possible','Retry forever','Ignore the claim'],1],
      ['A tool fails temporarily. What may be appropriate?',['Retry when the failure is plausibly transient','Always retry forever','Skip all error handling','Change every agent'],0],
      ['A tool fails because the requested operation is invalid. What is appropriate?',['Blindly retry','Handle or revise the invalid request rather than blindly retrying','Repeat the same request forever','Hide the error'],1],
      ['A task can resume from a saved checkpoint. What can the system do?',['Resume from the checkpoint when safe','Discard all progress','Always restart','Skip validation'],0],
      ['A sensitive external action is ready. What may be appropriate?',['Appropriate authorization or human approval','Automatic execution with unlimited permissions','No guardrails','Ignore policy'],0],
      ['A simple task is handled by five agents. What is a likely concern?',['Unnecessary complexity, cost or latency','Guaranteed higher intelligence','No coordination overhead','Automatic reliability'],0],
      ['Two independent research tasks can run separately. Which pattern may help?',['Parallel','Sequential regardless of independence','Infinite retry','No workflow'],0],
      ['The system starts failing after a prompt change. What should you inspect?',['Evaluation/regression tests','Only the final answer','Nothing until users complain','Hidden reasoning'],0],
      ['Developers need to locate a failed tool call. What helps?',['Observability and traces','Bigger model only','More agents only','Removing logs'],0],
      ['A small model is sufficient for simple classification. What is reasonable?',['Use the smaller/faster model if it meets requirements','Always use the largest model','Add more agents','Disable evaluation'],0],
      ['An agent repeatedly retries a deterministic permission failure. What is the issue?',['The retry strategy is inappropriate; handle permission or escalate','Retry more aggressively','Add another identical agent','Remove authorization'],0],
      ['Where can MCP fit in an agentic system?',['Through an MCP client to interact with capabilities exposed by MCP servers','As the orchestrator itself','As the model','As a replacement for all agents'],0],
      ['Does structured output guarantee factual correctness?',['No; structure validation does not prove truth','Yes','Always','Only with JSON'],0],
      ['Does reflection guarantee better answers?',['No; it is a design option with tradeoffs','Yes','Always','Only with large models'],0],
      ['Do more safeguards always improve a system?',['No; they can add safety/reliability value while increasing complexity, latency or friction','Yes without tradeoffs','They eliminate evaluation','They guarantee security'],0]
    ],
    debugging:[['Validator rejects output','Invalid structure or missing required field','Repair/retry with a valid contract'],['Permission denied','Tool policy blocks the requested action','Adjust authorization or escalate; do not blindly retry'],['Reviewer flags unsupported claim','Verification evidence is insufficient','Verify source/tool evidence and revise'],['Latency spike','Workflow has unnecessary sequential/agent steps','Simplify or parallelize independent work where appropriate']],
    modelScenario:['Fast autocomplete','MODEL A'],
    principles:['Start with the simplest architecture that solves the problem.','Add agents only when specialization or coordination provides value.','Give tools appropriate permissions.','Validate structured outputs.','Verify important results.','Make failures observable.','Design recovery paths.','Evaluate representative scenarios.','Monitor cost and latency.','Use human approval for appropriate high-risk actions.']
  }
];

export const phase12Achievements=[
  ['reliability-engineer','🧱','RELIABILITY ENGINEER','Complete Mission 1.'],
  ['planning-strategist','🗺️','PLANNING STRATEGIST','Complete Mission 2.'],
  ['verification-specialist','🔎','VERIFICATION SPECIALIST','Complete Mission 3.'],
  ['contract-architect','📐','CONTRACT ARCHITECT','Complete Mission 4.'],
  ['guardrail-guardian','🛡️','GUARDRAIL GUARDIAN','Complete Mission 5.'],
  ['agent-evaluator','📊','AGENT EVALUATOR','Complete Mission 6.'],
  ['trace-detective','🕵️','TRACE DETECTIVE','Complete Mission 7.'],
  ['recovery-engineer','♻️','RECOVERY ENGINEER','Complete Mission 8.'],
  ['system-optimizer','⚡','SYSTEM OPTIMIZER','Complete Mission 9.'],
  ['agentic-system-architect','🏆','AGENTIC SYSTEM ARCHITECT','Complete the Phase 12 Final Boss.']
].map(([id,icon,title,description])=>({id,icon,title,description}));