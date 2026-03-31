export type View =
  | 'dashboard'
  | 'theorie'
  | 'les'
  | 'labo'
  | 'labo-oefening'
  | 'analyse'
  | 'arena'
  | 'arena-debat'
  | 'noodmodus'
  | 'archief'
  | 'coach'
  | 'instellingen';

export interface Lesson {
  id: string;
  title: string;
  category: 'kernwaarden' | 'economie' | 'retoriek' | 'strategie' | 'ethiek';
  difficulty: 1 | 2 | 3;
  durationMin: number;
  coreIdea: string;
  practicalExample: string;
  pitfall: string;
  debateRule: string;
  keyPoints: string[];
  exercises: string[];
}

export interface Exercise {
  id: string;
  type: 'repliek' | 'argument' | 'frame' | 'punchline' | 'structuur';
  difficulty: 1 | 2 | 3;
  title: string;
  context: string;
  prompt: string;
  scenario: 'cafe' | 'politiek' | 'online' | 'vijandig' | 'familie';
  lessonIds: string[];
  hints: string[];
  modelAnswer?: string;
}

export interface Opponent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  color: string;
  personality: string;
  systemPrompt: string;
  openingLines: string[];
}

export interface ArchivedItem {
  id: string;
  type: 'argument' | 'punchline' | 'repliek' | 'analyse';
  content: string;
  topic: string;
  rating: number;
  date: string;
  context?: string;
}

export interface DebateMessage {
  role: 'user' | 'opponent';
  content: string;
  timestamp: number;
}

export interface UserProfile {
  level: number;
  xp: number;
  streak: number;
  lastStudied: string;
  completedLessons: string[];
  completedExercises: string[];
  weakTopics: string[];
  strongTopics: string[];
  archive: ArchivedItem[];
  dailyXP: number;
  lastXPDate: string;
  totalDebates: number;
  totalExercises: number;
  role: string;
}

export type ExerciseResult = {
  score: number;
  structuurScore: number;
  overtuigingScore: number;
  consistentieScore: number;
  feedback: string;
  verbeterd: string;
  sterktepunten: string[];
  verbeterpunten: string[];
};
