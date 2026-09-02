/**
 * Korean Hanja Proficiency Test Level 1 Types & Interfaces
 */

export type HanjaLevel = '1급신출' | '2급' | '3급' | '3급II' | '4급' | '5급' | '6급' | '7급' | '8급' | '특급' | '준1급';

export interface HanjaVocabulary {
  word: string;
  reading: string;
  meaning: string;
  difficulty?: '기본' | '빈출' | '고난도';
}

export interface HanjaItem {
  id: string;
  hanja: string;
  meaning: string; // 훈 (e.g. 찡그릴, 답답할, 어긋날)
  reading: string; // 음 (e.g. 빈, 울, 저)
  radical: string; // 부수 (e.g. 頁, 鬯, 齒)
  radicalName: string; // 부수명 (e.g. 머리혈, 울창주창, 이치)
  strokeCount: number; // 총획수
  level: HanjaLevel;
  isWritingTarget: boolean; // 쓰기배정 2005자 포함 여부
  secondaryReadings?: { meaning: string; reading: string; condition?: string }[]; // 동자이음자
  simplified?: string; // 약자
  confusingWith?: string[]; // 혼동하기 쉬운 한자들
  synonyms?: string[]; // 유의자
  antonyms?: string[]; // 반의자
  etymologyType: '상형' | '지사' | '회의' | '형성' | '전주' | '가차';
  etymologyDescription: string;
  strokeOrderGuide?: string[]; // 획순 가이드 텍스트
  vocabularies: HanjaVocabulary[];
  mnemonic?: string; // 연상 암기팁
  examFrequency: 1 | 2 | 3 | 4 | 5; // 출제 빈도 (5가 최고)
}

export interface IdiomItem {
  id: string;
  idiom: string; // 4글자 한자 (e.g. 魑魅魍魎)
  reading: string; // 한글 독음 (e.g. 이매망량)
  meaning: string; // 핵심 의미
  origin?: string; // 고사/출전 (e.g. 춘추좌씨전)
  detailedStory?: string; // 유래 이야기
  characters: {
    hanja: string;
    reading: string;
    meaning: string;
  }[];
  similarIdioms?: string[]; // 유사 성어
  oppositeIdioms?: string[]; // 반의 성어
  category: '처세/인성' | '학문/노력' | '변화/세태' | '우정/가족' | '위기/전쟁' | '자연/예술' | '비유/지혜';
  examImportance: 1 | 2 | 3 | 4 | 5;
}

export interface ConfusingHanjaPair {
  id: string;
  title: string;
  characters: {
    hanja: string;
    reading: string;
    meaning: string;
    radical: string;
    strokeCount: number;
    differenceTip: string;
    sampleWord: string;
  }[];
  distinctionRule: string;
}

export interface PolyphoneItem {
  id: string;
  hanja: string;
  readings: {
    reading: string;
    meaning: string;
    sampleWords: { word: string; reading: string; meaning: string }[];
  }[];
  examTip: string;
}

export interface SimplifiedHanjaPair {
  id: string;
  traditional: string; // 정자 (e.g. 體, 廣)
  simplified: string; // 약자 (e.g. 体, 広)
  reading: string;
  meaning: string;
  ruleExplanation: string;
  sampleWord: string;
}

export interface SynAntPair {
  id: string;
  type: 'synonym' | 'antonym'; // 유의자 or 반의자
  char1: { hanja: string; reading: string; meaning: string };
  char2: { hanja: string; reading: string; meaning: string };
  relationName: string;
  examTip: string;
}

export interface RadicalSpecialItem {
  id: string;
  radical: string; // 원래 부수
  variant: string; // 변형 형태 (예: 水 -> ⺡, 手 -> ⺘, 人 -> 亻, 心 -> 忄)
  name: string; // 삼수변, 재방변, 사람인변, 심방변 등
  meaning: string;
  exampleHanjas: { hanja: string; reading: string; meaning: string }[];
}

export type QuestionType =
  | 'reading' // 독음 문제
  | 'meaning' // 훈음 문제
  | 'writing' // 한자 쓰기/선택
  | 'idiom' // 사자성어 괄호 채우기
  | 'simplified' // 약자 찾기
  | 'radical' // 부수 찾기
  | 'syn_ant' // 유의자/상대자
  | 'homophone'; // 동음이의어 구별

export interface ExamQuestion {
  id: string;
  section: string;
  type: QuestionType;
  questionNumber: number;
  prompt: string;
  contextSentence?: string;
  highlightText?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  relatedHanja?: string;
}

export interface ExamResult {
  id: string;
  date: string;
  totalQuestions: number;
  correctCount: number;
  score: number; // 100점 만점 환산 또는 문항 비례 점수
  passed: boolean; // 1급 기준 80점(120/150문항) 이상 합격
  timeSpentSeconds: number;
  sectionBreakdown: {
    [key: string]: { total: number; correct: number };
  };
  answers: {
    questionId: string;
    userSelected: number;
    correctIndex: number;
    isCorrect: boolean;
  }[];
}

export interface WrongNoteItem {
  id: string;
  question: ExamQuestion;
  userAnswer?: number;
  addedAt: string;
}

export interface PastExamSession {
  id: string;
  roundNumber: number;
  title: string;
  subtitle: string;
  examDate: string;
  difficulty: '상' | '중상' | '최상' | '중';
  focusTopics: string[];
  passingRateEstimate: string;
  description: string;
  questions: ExamQuestion[];
}

export interface UserStudyState {
  learnedHanjaIds: string[];
  masteredHanjaIds: string[];
  bookmarkedHanjaIds: string[];
  wrongAnswerNoteIds: string[];
  examHistory: ExamResult[];
  dailyStudyCount: { [dateKey: string]: number };
  streakDays: number;
  lastStudyDate: string;
}
