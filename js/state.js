const STORAGE_KEY = 'ai-learn-player-state-v1';

export const DEFAULT_STATE = {
  xp: 0, level: 1, streak: 0, completedLessons: [], achievements: [], unlockedLevels: [1], completedLevels: [], challengeScores: {}
};

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return { ...DEFAULT_STATE };
    const state = { ...DEFAULT_STATE, ...saved,
      completedLessons: Array.isArray(saved.completedLessons) ? saved.completedLessons : [],
      achievements: Array.isArray(saved.achievements) ? saved.achievements : [],
      unlockedLevels: Array.isArray(saved.unlockedLevels) ? saved.unlockedLevels : [1],
      completedLevels: Array.isArray(saved.completedLevels) ? saved.completedLevels : [],
      challengeScores: saved.challengeScores && typeof saved.challengeScores === 'object' ? saved.challengeScores : {}
    };
    if (!state.unlockedLevels.includes(1)) state.unlockedLevels.unshift(1);
    const foundationIds=['ai','genai','llm','apps','usecases'];
    const llmMissionIds=['llm-01','llm-02','llm-03','llm-04','llm-05','llm-06','llm-07','llm-08'];
    const promptMissionIds=['prompt-01','prompt-02','prompt-03','prompt-04','prompt-05','prompt-06','prompt-07','prompt-08','prompt-09','prompt-10'];
    const applicationMissionIds=['app-01','app-02','app-03','app-04','app-05','app-06','app-07','app-08','app-09','app-10'];
    const localAIMissionIds=['local-01','local-02','local-03','local-04','local-05','local-06','local-07','local-08','local-09','local-10'];
    const embeddingMissionIds=['embed-01','embed-02','embed-03','embed-04','embed-05','embed-06','embed-07','embed-08','embed-09','embed-10'];
    if (foundationIds.every(id=>state.completedLessons.includes(id))){unlockLevel(state,2);markLevelCompleted(state,1);}
    if (llmMissionIds.every(id=>state.completedLessons.includes(id))&&state.completedLessons.includes('llm-final')){unlockLevel(state,3);markLevelCompleted(state,2);}
    if (promptMissionIds.every(id=>state.completedLessons.includes(id))){unlockLevel(state,4);markLevelCompleted(state,3);}
    if (applicationMissionIds.every(id=>state.completedLessons.includes(id))){unlockLevel(state,5);markLevelCompleted(state,4);}
    if (localAIMissionIds.every(id=>state.completedLessons.includes(id))){unlockLevel(state,6);markLevelCompleted(state,5);}
    if (embeddingMissionIds.every(id=>state.completedLessons.includes(id))){unlockLevel(state,7);markLevelCompleted(state,6);}
    return state;
  } catch { return { ...DEFAULT_STATE }; }
}
export function saveState(state){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
export function calculateLevel(xp){if(xp>=500)return 4;if(xp>=250)return 3;if(xp>=100)return 2;return 1;}
export function getLevelProgress(xp){const thresholds=[0,100,250,500],level=calculateLevel(xp),start=thresholds[level-1],end=thresholds[level]??750;return{current:xp-start,total:end-start,percent:Math.min(100,((xp-start)/(end-start))*100)};}
export function addXP(state,amount){state.xp+=amount;state.level=calculateLevel(state.xp);}
export function completeLesson(state,lessonId,xp=25){if(state.completedLessons.includes(lessonId))return false;state.completedLessons.push(lessonId);addXP(state,xp);return true;}
export function isLevelUnlocked(state,levelId){return state.unlockedLevels.includes(levelId)||levelId===1;}
export function unlockLevel(state,levelId){if(!state.unlockedLevels.includes(levelId))state.unlockedLevels.push(levelId);}
export function markLevelCompleted(state,levelId){if(!state.completedLevels.includes(levelId))state.completedLevels.push(levelId);}
export function recordChallengeScore(state,challengeId,score){state.challengeScores[challengeId]=score;}
export function unlockAchievements(state,lessons){
  const unlocked=[];const foundation=lessons.filter(l=>['ai','genai','llm','apps','usecases'].includes(l.id));const llm=lessons.filter(l=>l.id.startsWith('llm-')&&l.type!=='final');const prompt=lessons.filter(l=>l.id.startsWith('prompt-'));const application=lessons.filter(l=>l.id.startsWith('app-'));const checks=[
    ['first-step',state.completedLessons.length>=1],['curious-mind',state.completedLessons.length>=3],['ai-explorer',foundation.every(l=>state.completedLessons.includes(l.id))],['token-tamer',state.completedLessons.includes('llm-03')],['attention-seeker',state.completedLessons.includes('llm-05')],['model-thinker',state.completedLessons.includes('llm-07')],['llm-initiate',llm.every(l=>state.completedLessons.includes(l.id))&&state.completedLessons.includes('llm-final')],['prompt-apprentice',prompt.filter(l=>state.completedLessons.includes(l.id)).length>=3],['context-master',state.completedLessons.includes('prompt-07')],['example-builder',state.completedLessons.includes('prompt-05')],['prompt-refiner',state.completedLessons.includes('prompt-08')],['prompt-engineer',prompt.every(l=>state.completedLessons.includes(l.id))],['api-explorer',state.completedLessons.includes('app-01')],['message-architect',state.completedLessons.includes('app-02')],['json-navigator',state.completedLessons.includes('app-04')],['context-keeper',state.completedLessons.includes('app-05')],['stream-rider',state.completedLessons.includes('app-06')],['llm-builder',state.completedLessons.includes('app-08')],['request-debugger',state.completedLessons.includes('app-09')],['llm-application-architect',application.every(l=>state.completedLessons.includes(l.id))],
    ['model-explorer',state.completedLessons.includes('local-01')],['open-weight-detective',state.completedLessons.includes('local-02')],['model-hub-navigator',state.completedLessons.includes('local-03')],['inference-initiate',state.completedLessons.includes('local-04')],['cloud-local-strategist',state.completedLessons.includes('local-05')],['hardware-scout',state.completedLessons.includes('local-06')],['quantization-explorer',state.completedLessons.includes('local-07')],['local-ai-explorer',state.completedLessons.includes('local-08')],['local-ai-builder',state.completedLessons.includes('local-09')],['open-source-ai-architect',state.completedLessons.includes('local-10')],
    ['embedding-explorer',state.completedLessons.includes('embed-01')],['vector-thinker',state.completedLessons.includes('embed-02')],['dimension-explorer',state.completedLessons.includes('embed-03')],['similarity-seeker',state.completedLessons.includes('embed-04')],['cosine-navigator',state.completedLessons.includes('embed-05')],['semantic-searcher',state.completedLessons.includes('embed-06')],['chunk-master',state.completedLessons.includes('embed-07')],['vector-vault',state.completedLessons.includes('embed-08')],['search-engine-builder',state.completedLessons.includes('embed-09')],['vector-search-architect',state.completedLessons.includes('embed-10')]
  ];
  checks.forEach(([id,condition])=>{if(condition&&!state.achievements.includes(id)){state.achievements.push(id);unlocked.push(id);}});return unlocked;
}