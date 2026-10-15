export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Scenario {
  id: string;
  title: string;
  category: string;
  categoryTag: 'friends' | 'team' | 'discussion' | 'apology' | 'refusal' | 'teacher';
  difficulty: DifficultyLevel;
  partnerName: string;
  partnerRole: string;
  partnerAvatar: string;
  contextDescription: string;
  initialPrompt: string;
  quickStarters?: string[];
}

export type CriterionLevel = 'Cần chú ý' | 'Khá tốt' | 'Rất tốt';

export interface CriterionRating {
  name: 'Rõ ràng' | 'Lịch sự' | 'Phù hợp';
  score: 0 | 1 | 2; // Exact numeric score (0, 1, 2)
  level: CriterionLevel; // Exact synchronized level
  reason: string; // Specific rationale based on actual words/context
  detail?: string; // For backward compatibility
}

export interface Rewrites {
  friendly: string; // Tự nhiên, thân thiện
  polite_confident: string; // Rõ ràng, lịch sự và tự tin
}

export interface AIFeedback {
  criteria: CriterionRating[];
  strengths: string;
  improvements: string;
  rewrites: Rewrites;
  character_follow_up: string;
  // Backward compatibility fields for existing components:
  shortSuggestion: string;
  alternativeSuggestion?: string;
  followUpDialogue: string;
}

export interface ChatMessage {
  sender: 'partner' | 'student';
  text: string;
  feedback?: AIFeedback;
  timestamp?: string;
}

export interface SessionAttempt {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  category: string;
  categoryTag?: Scenario['categoryTag'];
  difficulty?: DifficultyLevel;
  partnerName: string;
  partnerAvatar: string;
  studentResponse: string;
  feedback: AIFeedback;
  scoreNumber: number; // 0 to 10 scale
  timestamp: number;
}

export interface DailyStreakInfo {
  currentStreak: number;
  bestStreak: number;
  practicedToday: boolean;
  activeDates: string[]; // YYYY-MM-DD list
  recentWeekDays: {
    date: string; // YYYY-MM-DD
    dayName: string; // T2, T3, T4...
    isToday: boolean;
    completed: boolean;
  }[];
}

export interface BestResponseItem {
  style: string;
  text: string;
  explanation: string;
}

export interface LiveChatMessage {
  id: string;
  sender: 'partner' | 'student';
  text: string;
  timestamp: string;
  quickScore?: number;
  quickPraise?: string;
  feedback?: AIFeedback;
  bestResponses?: BestResponseItem[];
}

export interface SessionStats {
  totalAttempts: number;
  completedScenariosCount: number;
  totalScenariosCount: number;
  averageScore: number;
  criteriaAverages: {
    clarity: number; // 0-100%
    politeness: number; // 0-100%
    appropriateness: number; // 0-100%
  };
  streak: DailyStreakInfo;
}

// 20-case Benchmark test item interface
export interface BenchmarkTestCase {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  partnerName: string;
  partnerRole: string;
  contextDescription: string;
  contextPrompt: string;
  studentResponse: string;
  categoryDescription: string;
  expectedScores: {
    clarity: 0 | 1 | 2;
    politeness: 0 | 1 | 2;
    appropriateness: 0 | 1 | 2;
  };
  expectedReasons: {
    clarity: string;
    politeness: string;
    appropriateness: string;
  };
}

export interface BenchmarkTestResult extends BenchmarkTestCase {
  actualScores?: {
    clarity: 0 | 1 | 2;
    politeness: 0 | 1 | 2;
    appropriateness: 0 | 1 | 2;
  };
  actualLevels?: {
    clarity: CriterionLevel;
    politeness: CriterionLevel;
    appropriateness: CriterionLevel;
  };
  actualReasons?: {
    clarity: string;
    politeness: string;
    appropriateness: string;
  };
  passed?: boolean;
  errorNotes?: string;
  rawFeedback?: AIFeedback;
}
