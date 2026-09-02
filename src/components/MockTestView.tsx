import React, { useState, useEffect } from 'react';
import { ExamQuestion } from '../types';
import { MOCK_EXAM_QUESTIONS } from '../data/mockExamData';
import confetti from 'canvas-confetti';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Flag,
  Award,
  RotateCcw,
  Sparkles,
  Bot,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  BookmarkPlus,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface MockTestViewProps {
  onAddWrongNotes: (questions: ExamQuestion[], userAnswers: Record<string, number>) => void;
}

export const MockTestView: React.FC<MockTestViewProps> = ({ onAddWrongNotes }) => {
  const [questions, setQuestions] = useState<ExamQuestion[]>(MOCK_EXAM_QUESTIONS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 mins
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // AI question generation
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGenError, setAiGenError] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isSubmitted]);

  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (index: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: index,
    }));
  };

  const toggleFlag = (id: string) => {
    setFlaggedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    setIsTimerRunning(false);

    // Calculate score
    let correctCount = 0;
    questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    if (score >= 80) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestart = (newQuestions?: ExamQuestion[]) => {
    setQuestions(newQuestions || MOCK_EXAM_QUESTIONS);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedIds([]);
    setIsSubmitted(false);
    setTimeRemaining(1800);
    setIsTimerRunning(true);
  };

  // Generate fresh questions via Gemini API
  const handleGenerateAIQuestions = async () => {
    setIsGeneratingAi(true);
    setAiGenError(null);
    try {
      const res = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'mixed',
          count: 10,
        }),
      });
      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        const formatted: ExamQuestion[] = data.questions.map((q: any, idx: number) => ({
          id: `ai_q_${Date.now()}_${idx}`,
          section: q.section || 'AI 맞춤 실전 문제',
          type: q.type || 'reading',
          questionNumber: idx + 1,
          prompt: q.prompt,
          contextSentence: q.contextSentence,
          highlightText: q.highlightText,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          relatedHanja: q.relatedHanja,
        }));
        handleRestart(formatted);
      } else {
        setAiGenError(data.error || '문제 생성에 실패했습니다.');
      }
    } catch (e: any) {
      setAiGenError('AI 서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Score statistics
  const answeredCount = Object.keys(userAnswers).length;
  let correctScore = 0;
  const incorrectQuestions: ExamQuestion[] = [];

  questions.forEach((q) => {
    if (userAnswers[q.id] === q.correctIndex) {
      correctScore += 1;
    } else {
      incorrectQuestions.push(q);
    }
  });

  const finalScore = Math.round((correctScore / questions.length) * 100);
  const isPassed = finalScore >= 80;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Test Control Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              한국어문회 1급 공식 유형
            </span>
            <span className="text-xs text-slate-500">
              총 {questions.length}문항 (합격기준: 80점 이상)
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-serif mt-1">
            한자능력검정시험 1급 실전 모의고사
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
          {!isSubmitted && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-mono text-sm font-bold">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
          )}

          {/* AI Generator Button */}
          <button
            id="ai-generate-questions-btn"
            type="button"
            onClick={handleGenerateAIQuestions}
            disabled={isGeneratingAi}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
            title="새로운 1급 문제를 AI로 즉시 생성"
          >
            {isGeneratingAi ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
            ) : (
              <Bot className="w-4 h-4 text-amber-700" />
            )}
            <span>AI 새 문제 생성</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </button>

          {!isSubmitted ? (
            <button
              id="submit-exam-btn"
              type="button"
              onClick={handleSubmitExam}
              className="px-5 py-2 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-sm transition"
            >
              시험 답안 제출하기
            </button>
          ) : (
            <button
              id="restart-exam-btn"
              type="button"
              onClick={() => handleRestart()}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" /> 처음부터 다시 풀기
            </button>
          )}
        </div>
      </div>

      {aiGenError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{aiGenError}</span>
        </div>
      )}

      {/* Main Test Body: Split Layout */}
      {!isSubmitted ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Viewer (Left 3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl border-2 border-amber-900/15 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Question Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-amber-900 text-white text-sm font-bold flex items-center justify-center font-serif">
                    {currentIndex + 1}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                    {currentQuestion.section}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                    flaggedIds.includes(currentQuestion.id)
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                  }`}
                  title="검토할 문제로 표시"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{flaggedIds.includes(currentQuestion.id) ? '검토 표시됨' : '나중에 검토'}</span>
                </button>
              </div>

              {/* Question Prompt */}
              <div className="space-y-3">
                <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug font-serif">
                  {currentQuestion.prompt}
                </p>

                {/* Context Sentence Box */}
                {currentQuestion.contextSentence && (
                  <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/60 text-slate-800 text-base sm:text-lg font-serif leading-relaxed">
                    {currentQuestion.contextSentence}
                  </div>
                )}

                {/* Highlight Text if Single Character */}
                {currentQuestion.highlightText && !currentQuestion.contextSentence && (
                  <div className="py-6 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <span className="font-serif text-5xl sm:text-6xl font-normal text-amber-950">
                      {currentQuestion.highlightText}
                    </span>
                  </div>
                )}
              </div>

              {/* 4 Multi-choice Options */}
              <div className="space-y-3 pt-2">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = userAnswers[currentQuestion.id] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-50/80 border-amber-800 text-amber-950 font-bold shadow-xs'
                          : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center border ${
                            isSelected
                              ? 'bg-amber-900 text-white border-amber-900'
                              : 'bg-white text-slate-600 border-slate-300'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-base font-serif">{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Question Navigation Prev/Next */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> 이전 문제
                </button>

                <span className="text-slate-400 font-medium">
                  {currentIndex + 1} / {questions.length}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentIndex === questions.length - 1}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1"
                >
                  다음 문제 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Question Palette Sidebar (Right column) */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-slate-900 text-sm">문항 답안지</h3>
                <span className="text-xs text-slate-500 font-medium">
                  {answeredCount} / {questions.length} 작성
                </span>
              </div>

              {/* Status Legend */}
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-amber-900" /> 표기
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300" /> 미작성
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-amber-300" /> 검토
                </div>
              </div>

              {/* Number Buttons Grid */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isFlagged = flaggedIds.includes(q.id);
                  const isCurrent = currentIndex === idx;

                  let bgClass = 'bg-slate-50 text-slate-700 border-slate-200';
                  if (isCurrent) {
                    bgClass = 'ring-2 ring-amber-800 ring-offset-1 font-bold';
                  }
                  if (isAnswered) {
                    bgClass += ' bg-amber-900 text-white font-bold border-amber-900';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative h-10 rounded-xl border text-xs flex items-center justify-center transition ${bgClass}`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleSubmitExam}
                className="w-full py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs shadow-sm transition"
              >
                최종 답안 제출
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* GRADE REPORT & DETAILED EXPLANATION REVIEW */
        <div className="space-y-6">
          {/* Score Card Banner */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border-2 shadow-lg text-center space-y-4 ${
              isPassed
                ? 'bg-gradient-to-b from-amber-50 to-emerald-50/40 border-emerald-300'
                : 'bg-gradient-to-b from-amber-50 to-red-50/40 border-red-300'
            }`}
          >
            <div className="flex items-center justify-center">
              {isPassed ? (
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 inline-flex">
                  <Award className="w-12 h-12 animate-bounce" />
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-red-100 text-red-800 inline-flex">
                  <XCircle className="w-12 h-12" />
                </div>
              )}
            </div>

            <div>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
                  isPassed ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                }`}
              >
                {isPassed ? '🎉 1급 합격 기준 충족 (합격권)' : '⚠️ 합격 기준 미달 (재도전 필요)'}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-serif">
                모의고사 결과: <span className="text-amber-900">{finalScore}점</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                정답 {correctScore}문항 / 오답 {questions.length - correctScore}문항 (합격선: 80점)
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {incorrectQuestions.length > 0 && (
                <button
                  id="add-wrong-notes-btn"
                  type="button"
                  onClick={() => onAddWrongNotes(incorrectQuestions, userAnswers)}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <BookmarkPlus className="w-4 h-4" /> 틀린 {incorrectQuestions.length}문제 오답노트에 추가
                </button>
              )}

              <button
                type="button"
                onClick={() => handleRestart()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <RotateCcw className="w-4 h-4" /> 다시 응시하기
              </button>
            </div>
          </div>

          {/* Full Question-by-Question Detailed Review */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <h3 className="text-base font-bold text-slate-900 font-serif border-b border-slate-100 pb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-700" />
              전체 문항 정답 및 심층 해설 분석
            </h3>

            <div className="space-y-6">
              {questions.map((q, idx) => {
                const userAns = userAnswers[q.id];
                const isCorrect = userAns === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border-2 space-y-3 ${
                      isCorrect ? 'bg-emerald-50/20 border-emerald-200' : 'bg-red-50/20 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-600">{q.section}</span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          isCorrect ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                        }`}
                      >
                        {isCorrect ? '정답 ✓' : '오답 ✗'}
                      </span>
                    </div>

                    <p className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                      {q.prompt}
                    </p>

                    {q.contextSentence && (
                      <div className="p-3 bg-white/90 rounded-xl border border-slate-200 text-slate-800 text-sm font-serif">
                        {q.contextSentence}
                      </div>
                    )}

                    {/* Options Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map((opt, oIdx) => {
                        const isThisCorrect = oIdx === q.correctIndex;
                        const isThisUser = oIdx === userAns;

                        let optClass = 'bg-white border-slate-200 text-slate-600';
                        if (isThisCorrect) {
                          optClass = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                        } else if (isThisUser && !isThisCorrect) {
                          optClass = 'bg-red-100 border-red-400 text-red-950 font-bold';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`p-2.5 rounded-lg border flex items-center justify-between ${optClass}`}
                          >
                            <span>
                              {oIdx + 1}. {opt}
                            </span>
                            {isThisCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                            {isThisUser && !isThisCorrect && <XCircle className="w-3.5 h-3.5 text-red-700" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1">
                      <strong className="text-amber-900 block font-bold">💡 훈장님 해설:</strong>
                      <p className="leading-relaxed">{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
