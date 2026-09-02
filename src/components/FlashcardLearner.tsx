import React, { useState, useEffect, useCallback } from 'react';
import { HanjaItem } from '../types';
import { StrokePracticeCanvas } from './StrokePracticeCanvas';
import confetti from 'canvas-confetti';
import {
  RotateCw,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Shuffle,
  Eye,
  PenTool,
  Bot
} from 'lucide-react';

interface FlashcardLearnerProps {
  hanjaList: HanjaItem[];
  learnedIds: string[];
  bookmarkedIds: string[];
  onToggleBookmark: (id: string) => void;
  onToggleLearned: (id: string) => void;
  onSelectHanjaForDetail: (hanja: HanjaItem) => void;
}

export const FlashcardLearner: React.FC<FlashcardLearnerProps> = ({
  hanjaList,
  learnedIds,
  bookmarkedIds,
  onToggleBookmark,
  onToggleLearned,
  onSelectHanjaForDetail,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'level1' | 'writing' | 'unlearned' | 'bookmarked'>('level1');
  const [cardList, setCardList] = useState<HanjaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPracticeOnBack, setShowPracticeOnBack] = useState(false);
  const [cardOrderFlipped, setCardOrderFlipped] = useState(false); // If true, front shows meaning, back shows Hanja

  // Filter cards based on selection
  useEffect(() => {
    let filtered = [...hanjaList];
    if (filterMode === 'level1') {
      filtered = filtered.filter((h) => h.level === '1급신출');
    } else if (filterMode === 'writing') {
      filtered = filtered.filter((h) => h.isWritingTarget);
    } else if (filterMode === 'unlearned') {
      filtered = filtered.filter((h) => !learnedIds.includes(h.id));
    } else if (filterMode === 'bookmarked') {
      filtered = filtered.filter((h) => bookmarkedIds.includes(h.id));
    }

    setCardList(filtered.length > 0 ? filtered : hanjaList);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filterMode, hanjaList, learnedIds, bookmarkedIds]);

  const currentCard = cardList[currentIndex] || hanjaList[0];
  const isBookmarked = currentCard ? bookmarkedIds.includes(currentCard.id) : false;
  const isLearned = currentCard ? learnedIds.includes(currentCard.id) : false;

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setShowPracticeOnBack(false);
    if (currentIndex < cardList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed full cycle!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      setCurrentIndex(0);
    }
  }, [currentIndex, cardList.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setShowPracticeOnBack(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      const nextState = !prev;
      if (nextState && currentCard) {
        playTTS(`${currentCard.meaning} ${currentCard.reading}`);
      }
      return nextState;
    });
  }, [currentCard]);

  const shuffleCards = () => {
    const shuffled = [...cardList].sort(() => Math.random() - 0.5);
    setCardList(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        handleNext();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        handlePrev();
      } else if (e.code === 'Digit1') {
        // Again
        handleNext();
      } else if (e.code === 'Digit4' && currentCard) {
        // Mastered
        onToggleLearned(currentCard.id);
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentCard, onToggleLearned]);

  if (!currentCard) {
    return (
      <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
        <p className="text-slate-600">학습할 한자 카드가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 font-medium mr-1">대상:</span>
          {[
            { id: 'level1', label: '1급 신출' },
            { id: 'writing', label: '쓰기(2,005자)' },
            { id: 'all', label: '전체 한자' },
            { id: 'unlearned', label: '미학습' },
            { id: 'bookmarked', label: '북마크' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setFilterMode(mode.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition whitespace-nowrap ${
                filterMode === mode.id
                  ? 'bg-amber-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Shuffle & Reverse order */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCardOrderFlipped(!cardOrderFlipped)}
            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 transition ${
              cardOrderFlipped
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="훈음 먼저 보고 한자 맞히기"
          >
            <RotateCw className="w-3.5 h-3.5" />
            {cardOrderFlipped ? '뜻·음 먼저' : '한자 먼저'}
          </button>

          <button
            type="button"
            onClick={shuffleCards}
            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            title="카드 섞기"
          >
            <Shuffle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="font-semibold text-slate-700">
          카드 {currentIndex + 1} / {cardList.length}
        </span>
        <span className="text-[11px] text-slate-400">
          단축키: 스페이스바(뒤집기), ← / → (이전/다음), 4번(학습완료)
        </span>
      </div>

      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-700 transition-all duration-300 rounded-full"
          style={{ width: `${((currentIndex + 1) / cardList.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Flashcard */}
      <div className="perspective-1000 min-h-[380px] sm:min-h-[420px] flex items-center justify-center">
        <div
          id="flashcard-box"
          onClick={handleFlip}
          className={`relative w-full rounded-3xl bg-white border-2 border-amber-900/20 shadow-xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 select-none ${
            isFlipped ? 'bg-amber-50/20' : 'hover:border-amber-700/40'
          }`}
        >
          {/* Card Top Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900">
                {currentCard.level}
              </span>
              <span className="text-xs text-slate-400">
                {currentCard.strokeCount}획 · 부수 {currentCard.radical}
              </span>
            </div>

            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onToggleLearned(currentCard.id)}
                className={`p-2 rounded-lg border transition ${
                  isLearned
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
                title="학습 완료"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onToggleBookmark(currentCard.id)}
                className={`p-2 rounded-lg border transition ${
                  isBookmarked
                    ? 'bg-amber-100 border-amber-300 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
                title="북마크"
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-100" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Card Center Content */}
          <div className="my-auto py-8 text-center flex flex-col items-center justify-center">
            {!isFlipped ? (
              // FRONT SIDE
              !cardOrderFlipped ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="font-serif text-7xl sm:text-8xl font-normal text-amber-950 tracking-normal leading-none drop-shadow-xs">
                    {currentCard.hanja}
                  </div>
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <RotateCw className="w-3 h-3" /> 클릭하여 훈음 및 상세 보기
                  </p>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in">
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif">
                    {currentCard.meaning} <span className="text-amber-800">{currentCard.reading}</span>
                  </h2>
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <RotateCw className="w-3 h-3" /> 클릭하여 한자 확인
                  </p>
                </div>
              )
            ) : (
              // BACK SIDE
              <div className="w-full space-y-4 animate-in fade-in">
                {/* Hanja & Meaning Big Header */}
                <div className="flex items-center justify-center gap-4">
                  <span className="text-5xl sm:text-6xl font-serif text-amber-950">
                    {currentCard.hanja}
                  </span>
                  <div className="text-left">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
                      {currentCard.meaning}{' '}
                      <span className="text-amber-900 font-black">{currentCard.reading}</span>
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>부수: <strong>{currentCard.radical}</strong> ({currentCard.radicalName})</span>
                      <span>•</span>
                      <span>{currentCard.strokeCount}획</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playTTS(`${currentCard.meaning} ${currentCard.reading}`);
                        }}
                        className="p-1 text-amber-800 hover:scale-110"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mnemonic or Etymology */}
                {currentCard.mnemonic && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 text-left">
                    💡 <strong>암기 비법:</strong> {currentCard.mnemonic}
                  </div>
                )}

                {/* Sample Vocabularies */}
                {currentCard.vocabularies.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left" onClick={(e) => e.stopPropagation()}>
                    {currentCard.vocabularies.slice(0, 2).map((v, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <div className="font-bold text-slate-900 font-serif flex items-center justify-between">
                          <span>{v.word}</span>
                          <span className="text-amber-800 text-[11px]">[{v.reading}]</span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate mt-0.5">{v.meaning}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Toggle Stroke Practice Canvas on card */}
                {showPracticeOnBack && (
                  <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                    <StrokePracticeCanvas guideCharacter={currentCard.hanja} size={200} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setShowPracticeOnBack(!showPracticeOnBack)}
              className="text-xs text-slate-600 hover:text-amber-900 font-medium flex items-center gap-1"
            >
              <PenTool className="w-3.5 h-3.5" />
              {showPracticeOnBack ? '쓰기 패드 닫기' : '카드에서 직접 쓰기'}
            </button>

            <button
              type="button"
              onClick={() => onSelectHanjaForDetail(currentCard)}
              className="text-xs text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1"
            >
              상세 사전 & AI 해설 보기 →
            </button>
          </div>
        </div>
      </div>

      {/* Leitner Rating & Navigation Buttons */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <button
          id="flashcard-prev-btn"
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm flex items-center gap-1 shadow-xs transition"
        >
          <ChevronLeft className="w-4 h-4" /> 이전 카드
        </button>

        <div className="flex items-center gap-2">
          <button
            id="flashcard-fail-btn"
            type="button"
            onClick={handleNext}
            className="px-3 sm:px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold transition"
          >
            다시보기 (1)
          </button>
          <button
            id="flashcard-pass-btn"
            type="button"
            onClick={() => {
              onToggleLearned(currentCard.id);
              handleNext();
            }}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-xs transition"
          >
            외웠어요 (4)
          </button>
        </div>

        <button
          id="flashcard-next-btn"
          type="button"
          onClick={handleNext}
          className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 text-xs sm:text-sm flex items-center gap-1 shadow-xs transition"
        >
          다음 카드 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
