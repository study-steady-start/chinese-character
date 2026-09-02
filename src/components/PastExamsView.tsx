import React, { useState, useEffect } from 'react';
import { PastExamSession, ExamQuestion } from '../types';
import { PAST_EXAMS_DATA } from '../data/pastExamsData';
import confetti from 'canvas-confetti';
import {
  History,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Flag,
  Award,
  RotateCcw,
  BookOpen,
  BookmarkPlus,
  Printer,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Bot,
  AlertCircle,
  HelpCircle,
  Check,
  Zap,
  Flame,
  Layers
} from 'lucide-react';

interface PastExamsViewProps {
  onAddWrongNotes: (questions: ExamQuestion[], userAnswers: Record<string, number>) => void;
  onOpenAITutorWithPrompt?: (prompt: string) => void;
}

export const PastExamsView: React.FC<PastExamsViewProps> = ({
  onAddWrongNotes,
  onOpenAITutorWithPrompt,
}) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>('session_105');
  const [viewMode, setViewMode] = useState<'cbt_exam' | 'study_all' | 'print_preview'>('cbt_exam');

  // Exam Test State
  const currentSession = PAST_EXAMS_DATA.find((s) => s.id === selectedSessionId) || PAST_EXAMS_DATA[0];
  const questions = currentSession.questions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 mins (1800s)
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Reset exam state when changing session
  const handleSelectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedIds([]);
    setIsSubmitted(false);
    setTimeRemaining(1800);
    setIsTimerRunning(true);
  };

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || isSubmitted || viewMode !== 'cbt_exam') return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning, isSubmitted, viewMode]);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optIdx,
    }));
  };

  const toggleFlag = (qId: string) => {
    setFlaggedIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    setIsTimerRunning(false);

    let correctCount = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    if (score >= 80) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestartExam = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedIds([]);
    setIsSubmitted(false);
    setTimeRemaining(1800);
    setIsTimerRunning(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Statistics calculation
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = questions.filter((q) => userAnswers[q.id] === q.correctIndex).length;
  const incorrectQuestions = questions.filter((q) => userAnswers[q.id] !== q.correctIndex);
  const score = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = score >= 80;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Recent 5 Sessions Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-900 text-amber-100 flex items-center justify-center font-serif text-2xl font-bold shadow-md border border-amber-700/50">
              歷
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold tracking-wide">
                  한국어문회 공식 1급 검정
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  최신 5개년 회차 완벽 복원
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif tracking-tight mt-0.5">
                최근 5회차 기출문제 실전관
              </h2>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start md:self-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('cbt_exam')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'cbt_exam'
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              실전 CBT 시험
            </button>
            <button
              type="button"
              onClick={() => setViewMode('study_all')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'study_all'
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              전 문항 해설 학습
            </button>
            <button
              type="button"
              onClick={() => setViewMode('print_preview')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'print_preview'
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              시험지 인쇄 서식
            </button>
          </div>
        </div>

        {/* 5 Sessions Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {PAST_EXAMS_DATA.map((session) => {
            const isSelected = session.id === selectedSessionId;
            return (
              <button
                key={session.id}
                type="button"
                onClick={() => handleSelectSession(session.id)}
                className={`text-left p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-700 bg-amber-900 text-white shadow-md ring-2 ring-amber-700/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-amber-800 text-amber-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {session.examDate}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        session.difficulty === '최상'
                          ? isSelected
                            ? 'bg-red-900 text-red-200'
                            : 'bg-red-100 text-red-800'
                          : isSelected
                          ? 'bg-amber-800 text-amber-200'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      난이도 {session.difficulty}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-sm leading-snug">
                    제{session.roundNumber}회 기출
                  </h3>
                  <p
                    className={`text-[11px] line-clamp-1 mt-1 ${
                      isSelected ? 'text-amber-200' : 'text-slate-500'
                    }`}
                  >
                    {session.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <span className={isSelected ? 'text-amber-200/90' : 'text-slate-400'}>
                    합격률 {session.passingRateEstimate.split(' ')[0]}
                  </span>
                  <span className={`font-semibold ${isSelected ? 'text-amber-100' : 'text-amber-900'}`}>
                    {session.questions.length}문항
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Session Detail Info Pill */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm font-serif text-amber-900">
                {currentSession.title}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-semibold text-[10px]">
                {currentSession.examDate}
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              {currentSession.description}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentSession.focusTopics.map((topic, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-[10px] text-amber-900 font-medium"
                >
                  #{topic}
                </span>
              ))}
            </div>
          </div>

          {onOpenAITutorWithPrompt && (
            <button
              type="button"
              onClick={() =>
                onOpenAITutorWithPrompt(
                  `제${currentSession.roundNumber}회 한국어문회 1급 기출문제의 핵심 출제 경향과 수험생들이 가장 많이 틀린 고난도 함정 문제 유형을 해설해 주세요.`
                )
              }
              className="whitespace-nowrap px-3.5 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-white font-semibold flex items-center gap-1.5 shadow-xs transition self-start sm:self-center"
            >
              <Bot className="w-4 h-4 text-amber-200" />
              <span>회차별 훈장님 총평 듣기</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. MAIN VIEW 1: CBT EXAM MODE */}
      {viewMode === 'cbt_exam' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question & Test Area (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            {!isSubmitted ? (
              /* Ongoing Exam Card */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
                {/* Question Top Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold font-serif">
                      제{currentSession.roundNumber}회 기출 · 문항 {currentIndex + 1} / {totalQuestions}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      [{currentQuestion.section}]
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFlag(currentQuestion.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                        flaggedIds.includes(currentQuestion.id)
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      {flaggedIds.includes(currentQuestion.id) ? '검토 표시됨' : '검토 체크'}
                    </button>
                  </div>
                </div>

                {/* Prompt */}
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif leading-relaxed">
                    <span className="text-amber-800 mr-2">Q{currentIndex + 1}.</span>
                    {currentQuestion.prompt}
                  </h3>

                  {currentQuestion.contextSentence && (
                    <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 font-serif text-base sm:text-lg text-slate-800 leading-relaxed tracking-wide">
                      {currentQuestion.contextSentence}
                    </div>
                  )}

                  {currentQuestion.highlightText && !currentQuestion.contextSentence && (
                    <div className="py-6 text-center bg-amber-50/50 rounded-xl border border-amber-200/60 font-serif text-4xl sm:text-5xl font-black text-amber-950 tracking-widest">
                      {currentQuestion.highlightText}
                    </div>
                  )}
                </div>

                {/* 4 Multiple Choice Options */}
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = userAnswers[currentQuestion.id] === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-amber-800 bg-amber-50/90 text-amber-950 font-bold shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-serif ${
                              isSelected
                                ? 'bg-amber-800 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-serif text-sm sm:text-base">{option}</span>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-amber-800" />}
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => prev - 1)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" /> 이전 문항
                  </button>

                  <div className="text-xs text-slate-500 font-medium hidden sm:block">
                    마킹 완료: {answeredCount} / {totalQuestions}
                  </div>

                  {currentIndex < totalQuestions - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((prev) => prev + 1)}
                      className="px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition"
                    >
                      다음 문항 <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitExam}
                      className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition animate-pulse"
                    >
                      기출 답안 최종 제출
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Exam Result & Scorecard View */
              <div className="space-y-6">
                {/* Result Top Banner */}
                <div
                  className={`p-6 sm:p-8 rounded-3xl border shadow-md text-center space-y-4 ${
                    isPassed
                      ? 'bg-gradient-to-b from-emerald-50 to-emerald-100/60 border-emerald-300'
                      : 'bg-gradient-to-b from-red-50 to-red-100/60 border-red-300'
                  }`}
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg bg-slate-900">
                    {isPassed ? (
                      <Award className="w-8 h-8 text-amber-300" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    )}
                  </div>

                  <div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        isPassed
                          ? 'bg-emerald-200 text-emerald-900'
                          : 'bg-red-200 text-red-900'
                      }`}
                    >
                      {isPassed ? '합격 기준 (80점) 통과' : '합격 기준 미달 (재도전 필요)'}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 mt-2">
                      제{currentSession.roundNumber}회 기출 채점 결과:{' '}
                      <span className={isPassed ? 'text-emerald-700' : 'text-red-700'}>
                        {score}점
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      총 {totalQuestions}문항 중 <strong className="text-slate-900">{correctCount}개 정답</strong> (틀린 문항: {totalQuestions - correctCount}개)
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleRestartExam}
                      className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition"
                    >
                      <RotateCcw className="w-4 h-4" /> 다시 풀기
                    </button>

                    {incorrectQuestions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onAddWrongNotes(incorrectQuestions, userAnswers)}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition"
                      >
                        <BookmarkPlus className="w-4 h-4" />
                        틀린 문제 오답노트에 담기 ({incorrectQuestions.length}개)
                      </button>
                    )}
                  </div>
                </div>

                {/* Detailed Solution Explanations */}
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-800" />
                    제{currentSession.roundNumber}회 기출 문항별 훈장님 정답 및 상세 해설
                  </h4>

                  <div className="space-y-4">
                    {questions.map((q, idx) => {
                      const userChoice = userAnswers[q.id];
                      const isCorrect = userChoice === q.correctIndex;

                      return (
                        <div
                          key={q.id}
                          className={`p-5 rounded-2xl border bg-white shadow-xs space-y-3 ${
                            isCorrect ? 'border-emerald-200' : 'border-red-200'
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                                  isCorrect
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                {q.section}
                              </span>
                            </div>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded ${
                                isCorrect
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {isCorrect ? '정답' : '오답'}
                            </span>
                          </div>

                          <p className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                            {q.prompt}
                          </p>

                          {q.contextSentence && (
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-serif text-sm">
                              {q.contextSentence}
                            </div>
                          )}

                          {/* Options comparison */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div
                              className={`p-2.5 rounded-lg border ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-semibold'
                                  : 'bg-red-50 border-red-200 text-red-950 font-semibold'
                              }`}
                            >
                              <span>내가 고른 답: </span>
                              <strong>
                                {userChoice !== undefined
                                  ? `${userChoice + 1}. ${q.options[userChoice]}`
                                  : '미응답'}
                              </strong>
                            </div>

                            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 font-semibold">
                              <span>공식 정답: </span>
                              <strong>
                                {q.correctIndex + 1}. {q.options[q.correctIndex]}
                              </strong>
                            </div>
                          </div>

                          {/* Explanation Box */}
                          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-slate-800 space-y-1">
                            <strong className="text-amber-950 flex items-center gap-1.5 font-bold">
                              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                              출제 분석 & 훈장님 해설:
                            </strong>
                            <p className="leading-relaxed font-serif">{q.explanation}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Timer & OMR Sheet (1 col) */}
          <div className="space-y-4">
            {/* Realtime Timer & Progress Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 sticky top-20">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-800" />
                  <span className="text-xs font-bold text-slate-700">시험 제한시간</span>
                </div>
                <span
                  className={`font-mono font-black text-base ${
                    timeRemaining < 300 ? 'text-red-600 animate-pulse' : 'text-slate-900'
                  }`}
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>마킹 진행률</span>
                  <span className="font-bold text-slate-800">
                    {Math.round((answeredCount / totalQuestions) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-800 transition-all rounded-full"
                    style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* OMR Question Palette */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 block">
                  OMR 답안 마킹 네비게이터
                </span>
                <div className="grid grid-cols-5 gap-1.5">
                  {questions.map((q, idx) => {
                    const isAnswered = userAnswers[q.id] !== undefined;
                    const isCurrent = currentIndex === idx;
                    const isFlagged = flaggedIds.includes(q.id);

                    let btnClass = 'bg-slate-50 text-slate-600 border-slate-200';
                    if (isAnswered) {
                      btnClass = 'bg-amber-900 text-white font-bold border-amber-900';
                    }
                    if (isCurrent) {
                      btnClass += ' ring-2 ring-amber-500 ring-offset-1 font-black';
                    }

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-9 rounded-lg border text-xs flex flex-col items-center justify-center transition relative ${btnClass}`}
                      >
                        <span>{idx + 1}</span>
                        {isFlagged && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit / Reset Actions in Sidebar */}
              {!isSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmitExam}
                  className="w-full py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm shadow-xs transition"
                >
                  기출 답안 제출 및 채점하기
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRestartExam}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" /> 다시 풀기
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN VIEW 2: STUDY ALL EXPLANATIONS MODE */}
      {viewMode === 'study_all' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-serif text-slate-900">
                {currentSession.title} · 전 문항 완독 해설집
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                한국어문회 1급 공식 출제 영역별 정답과 훈장님의 자원 풀이를 학습합니다.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs">
              총 {questions.length}문항 수록
            </span>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-slate-50/50 space-y-4 hover:border-amber-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-amber-900 text-white flex items-center justify-center font-serif text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                      {q.section}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    1급 정기 기출
                  </span>
                </div>

                <h4 className="font-serif font-bold text-base sm:text-lg text-slate-900">
                  {q.prompt}
                </h4>

                {q.contextSentence && (
                  <div className="p-4 bg-white rounded-xl border border-slate-200 font-serif text-base text-slate-800">
                    {q.contextSentence}
                  </div>
                )}

                {/* Options with Highlighted Correct Answer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = optIdx === q.correctIndex;
                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="font-serif">
                          {optIdx + 1}. {opt}
                        </span>
                        {isCorrect && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold">
                            공식 정답
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 훈장님 해설 */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    훈장님 심층 자원 분석 및 1급 출제 팁:
                  </div>
                  <p className="leading-relaxed font-serif text-slate-700">
                    {q.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MAIN VIEW 3: PRINT PREVIEW SHEET FORMAT */}
      {viewMode === 'print_preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div className="text-xs text-slate-600">
              실제 수험 환경과 동일한 <strong>문제지 인쇄 서식</strong>입니다.
            </div>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition"
            >
              <Printer className="w-4 h-4" /> 이 기출 시험지 인쇄하기
            </button>
          </div>

          <div className="bg-white rounded-3xl border-2 border-slate-800 p-8 sm:p-12 space-y-8 font-serif print:border-none print:p-0 shadow-lg">
            {/* Print Header */}
            <div className="text-center border-b-2 border-slate-900 pb-6 space-y-2">
              <div className="text-xs font-sans tracking-widest text-slate-500 font-bold">
                (社) 韓國漢字能力檢定會 · 國家公認 漢字能力檢定試驗
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {currentSession.title} (1級)
              </h1>
              <div className="flex items-center justify-center gap-6 text-xs text-slate-600 font-sans pt-1">
                <span>시행일자: {currentSession.examDate}</span>
                <span>제한시간: 60분</span>
                <span>배점: 100점 만점 (합격선 80점)</span>
              </div>
            </div>

            {/* Questions Grid 2-column print layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
              {questions.map((q, idx) => (
                <div key={q.id} className="space-y-2 pb-4 border-b border-slate-200">
                  <div className="font-bold text-slate-900 flex items-baseline gap-1.5">
                    <span className="text-base font-black font-sans">{idx + 1}.</span>
                    <span>{q.prompt}</span>
                  </div>

                  {q.contextSentence && (
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                      {q.contextSentence}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-800 pt-1">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx}>
                        {optIdx + 1} {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Print Footer */}
            <div className="text-center pt-6 border-t border-slate-900 text-xs text-slate-500 font-sans">
              ※ 본 시험 문제의 저작권은 한국어문회 및 학습 플랫폼에 있습니다. 무단 전재를 금합니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
