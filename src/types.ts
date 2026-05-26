export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export type Topic = 'Daily life' | 'School' | 'Work' | 'Travel' | 'Health' | 'Story' | 'Conversation';

export interface VocabularyItem {
  id: string;
  word: string;
  ipa?: string;
  vietnamese: string;
  contextUsage: string;
  exampleSentence: string;
  note?: string;
  status: 'New' | 'Learning' | 'Mastered';
  mySentence?: string;
  topic?: Topic;
  level?: Level;
}

export interface TranscriptSection {
  id: string;
  english: string;
  vietnamese: string;
  context: string;
  vocabulary: {
    word: string;
    meaning: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface FillBlankQuestion {
  id: string;
  sentenceWithBlank: string; // "After sitting and coding all day, I decided to _______."
  blankValue: string; // "work out"
  clue: string;
}

export interface SentenceOrderQuestion {
  id: string;
  scrambledSegments: string[];
  correctOrder: string[]; // English sentence split in parts or list of correct indexes
  solution: string;
}

export interface DictationQuestion {
  id: string;
  audioText: string;
  clue: string;
}

export interface Lesson {
  id: string;
  title: string;
  level: Level;
  topic: Topic;
  durationSeconds: number;
  audioUrl?: string; // or mock audio
  transcript: string;
  vietnameseTranslation: string;
  sections: TranscriptSection[];
  vocabularies: VocabularyItem[];
  quizzes: QuizQuestion[];
  fillBlanks: FillBlankQuestion[];
  sentenceOrdering: SentenceOrderQuestion[];
  dictations: DictationQuestion[];
  createdDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  bestScore?: number;
  listenCount: number;
  rewriteCount: number;
  studentLastRewrite?: string;
}

export interface ActivityLog {
  id: string;
  date: string;
  action: string;
  lessonTitle: string;
  score?: number;
  minutesAdded?: number;
}
