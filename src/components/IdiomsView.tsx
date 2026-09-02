import React, { useState, useMemo } from 'react';
import { IDIOMS_DATA } from '../data/idiomData';
import { IdiomItem } from '../types';
import confetti from 'canvas-confetti';
import {
  Search,
  BookOpen,
  Compass,
  Play,
  Award,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2
} from 'lucide-react';

export const IdiomsView: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'browse' | 'quiz'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIdiom, setSelectedIdiom] = useState<IdiomItem | null>(null);

  // Quiz Mode state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userSelection, setUserSelection] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  const categories = ['all', '처세/인성', '학문/노력', '변화/세태', '비유/지혜', '자연/예술'];

  const filteredIdioms = useMemo(() => {
    return IDIOMS_DATA.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchIdiom = item.idiom.includes(q);
        const matchReading = item.reading.includes(q);
        const matchMeaning = item.meaning.toLowerCase().includes(q);
        const matchOrigin = item.origin?.toLowerCase().includes(q);
        return matchIdiom || matchReading || matchMeaning || matchOrigin;
      }
      return true;
    });
  }, [searchQuery, selectedCategory]);

  // Generate quiz question options for current index
  const currentQuizIdiom = IDIOMS_DATA[quizIndex % IDIOMS_DATA.length];

  // Pick a random blank position (0, 1, 2, or 3)
  const blankPos = (quizIndex * 3) % 4;
  const correctHanja = currentQuizIdiom.characters[blankPos].hanja;
  const correctReading = currentQuizIdiom.characters[blankPos].reading;

  const quizOptions = useMemo(() => {
    const distractors = ['魍', '絶', '窟', '膽', '搔', '錐', '猛', '邯', '粟', '附', '膾', '魑']
      .filter((h) => h !== correctHanja)
      .slice(0, 3);
    const opts = [
      { hanja: correctHanja, isCorrect: true },
      ...distractors.map((d) => ({ hanja: d, isCorrect: false })),
    ].sort(() => Math.random() - 0.5);
    return opts;
  }, [currentQuizIdiom, correctHanja]);

  const handleSelectQuizOption = (index: number) => {
    if (isAnswerChecked) return;
    setUserSelection(index);
    setIsAnswerChecked(true);

    if (quizOptions[index].isCorrect) {
      setQuizScore((prev) => prev + 1);
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
      });
    }
  };

  const nextQuizQuestion = () => {
    if (quizIndex < 9) {
      setQuizIndex((prev) => prev + 1);
      setUserSelection(null);
      setIsAnswerChecked(false);
    } else {
      setQuizFinished(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const restartQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizFinished(false);
    setUserSelection(null);
    setIsAnswerChecked(false);
  };

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Switcher */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveMode('browse')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              activeMode === 'browse'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> 사자성어 모음집 ({IDIOMS_DATA.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('quiz')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              activeMode === 'quiz'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Play className="w-4 h-4 text-amber-300" /> 괄호 채우기 퀴즈 게임
          </button>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline-block">
          1급 시험 필수 고사성어 완벽 수록
        </span>
      </div>

      {activeMode === 'browse' ? (
        <>
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="사자성어 한자, 독음, 뜻으로 검색 (예: 魑魅魍魎, 이매망량, 도깨비, 사기)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/20"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-slate-400 font-medium mr-1">분야:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? '전체' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Idioms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIdioms.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedIdiom(item)}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                      {item.category}
                    </span>
                    <span className="text-xs text-amber-700 font-medium">
                      중요도: {'⭐'.repeat(item.examImportance)}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 my-2">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif tracking-wider">
                      {item.idiom}
                    </h3>
                    <span className="text-base font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                      {item.reading}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed line-clamp-2 mt-2">
                    {item.meaning}
                  </p>
                </div>

                {item.origin && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>출전: <strong className="text-slate-700">{item.origin}</strong></span>
                    <span className="text-amber-800 font-semibold flex items-center gap-0.5">
                      상세 유래 <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        /* QUIZ MODE */
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border-2 border-amber-900/20 shadow-xl p-6 sm:p-8 space-y-6">
          {!quizFinished ? (
            <>
              {/* Quiz Header */}
              <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
                <span className="font-bold text-amber-900 text-sm">
                  1급 사자성어 빈칸 채우기 퀴즈
                </span>
                <span className="font-semibold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                  문제 {quizIndex + 1} / 10 · 점수: {quizScore * 10}점
                </span>
              </div>

              {/* Question Idiom with Blank */}
              <div className="text-center py-6 bg-amber-50/30 rounded-2xl border border-amber-200/50 space-y-3">
                <div className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 tracking-widest flex items-center justify-center gap-2">
                  {currentQuizIdiom.characters.map((ch, idx) => (
                    <span
                      key={idx}
                      className={`inline-block px-2 py-1 rounded-lg ${
                        idx === blankPos
                          ? 'bg-amber-200/90 text-amber-950 border-2 border-dashed border-amber-700'
                          : 'text-slate-800'
                      }`}
                    >
                      {idx === blankPos ? ' ( ? ) ' : ch.hanja}
                    </span>
                  ))}
                </div>

                <p className="text-base font-semibold text-amber-900">
                  [{currentQuizIdiom.reading}]
                </p>

                <p className="text-sm text-slate-600 max-w-md mx-auto px-4">
                  {currentQuizIdiom.meaning}
                </p>
              </div>

              {/* 4 Hanja Options */}
              <div className="grid grid-cols-2 gap-3">
                {quizOptions.map((opt, idx) => {
                  let btnStyle = 'bg-slate-50 border-slate-200 hover:bg-amber-50 hover:border-amber-300';
                  if (isAnswerChecked) {
                    if (opt.isCorrect) {
                      btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                    } else if (userSelection === idx) {
                      btnStyle = 'bg-red-100 border-red-500 text-red-950 font-bold';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswerChecked}
                      onClick={() => handleSelectQuizOption(idx)}
                      className={`p-4 rounded-xl border-2 text-center text-3xl font-serif font-bold transition flex items-center justify-center gap-3 ${btnStyle}`}
                    >
                      <span>{opt.hanja}</span>
                      {isAnswerChecked && opt.isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      )}
                      {isAnswerChecked && userSelection === idx && !opt.isCorrect && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Next Button */}
              {isAnswerChecked && (
                <div className="pt-2 animate-in fade-in space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <p className="font-bold text-slate-900 mb-1">
                      정답: {correctHanja} ({currentQuizIdiom.characters[blankPos].meaning} {correctReading})
                    </p>
                    <p>출전: {currentQuizIdiom.origin}</p>
                  </div>

                  <button
                    type="button"
                    onClick={nextQuizQuestion}
                    className="w-full py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-white font-bold text-sm shadow-md transition"
                  >
                    {quizIndex < 9 ? '다음 문제 풀기 →' : '퀴즈 결과 보기 →'}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Quiz Completed Score Card */
            <div className="text-center py-8 space-y-4">
              <Award className="w-16 h-16 text-amber-700 mx-auto animate-bounce" />
              <h3 className="text-2xl font-bold text-slate-900 font-serif">
                사자성어 퀴즈 완료!
              </h3>
              <p className="text-lg font-semibold text-amber-900">
                총 점수: <strong className="text-3xl font-black">{quizScore * 10}</strong> / 100점
              </p>
              <p className="text-xs text-slate-500">
                {quizScore >= 8 ? '🎉 1급 사자성어 마스터 수준입니다!' : '꾸준한 복습으로 1급 시험을 완벽 대비하세요!'}
              </p>
              <button
                type="button"
                onClick={restartQuiz}
                className="px-6 py-3 rounded-xl bg-amber-900 text-white font-bold text-sm hover:bg-amber-800 transition"
              >
                다시 풀기
              </button>
            </div>
          )}
        </div>
      )}

      {/* Idiom Detail Story Modal */}
      {selectedIdiom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-100 text-amber-900">
                {selectedIdiom.category}
              </span>
              <button
                type="button"
                onClick={() => setSelectedIdiom(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                닫기 ✕
              </button>
            </div>

            <div className="text-center sm:text-left space-y-2">
              <div className="flex items-baseline gap-3">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif tracking-wider">
                  {selectedIdiom.idiom}
                </h2>
                <span className="text-xl font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded">
                  {selectedIdiom.reading}
                </span>
                <button
                  type="button"
                  onClick={() => playTTS(`${selectedIdiom.reading}. ${selectedIdiom.meaning}`)}
                  className="p-1 text-amber-800 hover:scale-110"
                  title="낭독"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-base text-slate-800 font-medium">{selectedIdiom.meaning}</p>
            </div>

            {/* Characters breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {selectedIdiom.characters.map((ch, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="font-serif text-2xl font-bold text-slate-900 block">{ch.hanja}</span>
                  <span className="text-xs font-semibold text-amber-800 mt-1 block">{ch.meaning}</span>
                </div>
              ))}
            </div>

            {/* Detailed Origin Story */}
            {selectedIdiom.detailedStory && (
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs sm:text-sm text-slate-700 space-y-1">
                <h4 className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" /> 고사 유래 ({selectedIdiom.origin})
                </h4>
                <p className="leading-relaxed text-slate-800">{selectedIdiom.detailedStory}</p>
              </div>
            )}

            {/* Similar Idioms */}
            {selectedIdiom.similarIdioms && selectedIdiom.similarIdioms.length > 0 && (
              <div className="text-xs text-slate-600">
                <strong className="text-slate-800">유사 성어: </strong>
                {selectedIdiom.similarIdioms.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
