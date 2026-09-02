import React, { useState } from 'react';
import { HanjaItem } from '../types';
import { StrokePracticeCanvas } from './StrokePracticeCanvas';
import {
  X,
  Volume2,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  Bot,
  Layers,
  BookOpen,
  HelpCircle,
  Award,
  PenTool,
  Loader2
} from 'lucide-react';

interface HanjaDetailModalProps {
  hanja: HanjaItem | null;
  onClose: () => void;
  isBookmarked: boolean;
  isLearned: boolean;
  onToggleBookmark: (id: string) => void;
  onToggleLearned: (id: string) => void;
  onOpenAITutorWithPrompt?: (prompt: string) => void;
}

export const HanjaDetailModal: React.FC<HanjaDetailModalProps> = ({
  hanja,
  onClose,
  isBookmarked,
  isLearned,
  onToggleBookmark,
  onToggleLearned,
  onOpenAITutorWithPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'practice' | 'ai_deep'>('info');
  const [aiExplanation, setAiExplanation] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!hanja) return null;

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const fetchAIDeepExplanation = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const res = await fetch('/api/gemini/explain-hanja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hanja: hanja.hanja,
          reading: hanja.reading,
          meaning: hanja.meaning,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setAiExplanation(data.result);
      } else {
        setAiError(data.error || '해설을 불러오지 못했습니다.');
      }
    } catch (e: any) {
      setAiError('AI 훈장님 해설 서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
              {hanja.level}
            </span>
            {hanja.isWritingTarget && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <PenTool className="w-3 h-3" /> 쓰기배정(2,005자)
              </span>
            )}
            <div className="flex items-center gap-1 text-xs text-amber-950/70 font-medium ml-2">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              출제빈도: {'⭐'.repeat(hanja.examFrequency)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Learned Toggle */}
            <button
              id="modal-learned-btn"
              type="button"
              onClick={() => onToggleLearned(hanja.id)}
              className={`p-2 rounded-lg border transition ${
                isLearned
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={isLearned ? '학습 완료됨 (클릭하여 취소)' : '학습 완료로 표시'}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>

            {/* Bookmark Toggle */}
            <button
              id="modal-bookmark-btn"
              type="button"
              onClick={() => onToggleBookmark(hanja.id)}
              className={`p-2 rounded-lg border transition ${
                isBookmarked
                  ? 'bg-amber-100 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={isBookmarked ? '북마크 해제' : '북마크 추가'}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-amber-700" /> : <Bookmark className="w-4 h-4" />}
            </button>

            <button
              id="modal-close-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Hero: Character & Core Meanings */}
        <div className="px-6 py-5 bg-gradient-to-b from-amber-50/20 to-white border-b border-slate-100">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Big Hanja Box */}
            <div className="relative group shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-amber-50/70 border-2 border-amber-900/20 flex items-center justify-center shadow-inner text-amber-950 font-serif text-6xl sm:text-7xl font-normal select-none">
                {hanja.hanja}
              </div>
              <button
                type="button"
                onClick={() => playTTS(`${hanja.meaning} ${hanja.reading}`)}
                className="absolute -bottom-2 -right-2 p-2 rounded-full bg-white shadow-md border border-slate-200 text-amber-800 hover:bg-amber-50 hover:scale-110 transition"
                title="발음 듣기"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Information Grid */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-baseline justify-center sm:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif">
                  {hanja.meaning} <span className="text-amber-800 font-black">{hanja.reading}</span>
                </h2>
              </div>

              {/* Secondary readings if polyphone */}
              {hanja.secondaryReadings && hanja.secondaryReadings.length > 0 && (
                <div className="mt-2 inline-flex flex-wrap gap-1.5 p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs">
                  <span className="font-bold">⚠️ 동자이음자(1급 함정):</span>
                  {hanja.secondaryReadings.map((sec, idx) => (
                    <span key={idx} className="bg-white/80 px-1.5 py-0.5 rounded text-[11px] font-medium">
                      {sec.meaning} {sec.reading} ({sec.condition})
                    </span>
                  ))}
                </div>
              )}

              {/* Specs Pills */}
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                  부수: <strong className="text-slate-900 font-serif">{hanja.radical}</strong> ({hanja.radicalName})
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                  총획수: <strong className="text-slate-900">{hanja.strokeCount}획</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                  육서: <strong className="text-amber-800">{hanja.etymologyType}</strong>
                </span>
                {hanja.simplified && (
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                    약자: <strong className="font-serif text-sm">{hanja.simplified}</strong>
                  </span>
                )}
              </div>

              {/* Mnemonic Memory Tip */}
              {hanja.mnemonic && (
                <p className="mt-2.5 text-xs text-amber-900/90 bg-amber-50/80 px-3 py-1.5 rounded-lg border border-amber-200/60 leading-relaxed font-medium">
                  💡 <strong>암기 비법:</strong> {hanja.mnemonic}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* View Tab Buttons */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/60">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'info'
                ? 'border-amber-800 text-amber-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            상세 해설 & 어휘
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('practice')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'practice'
                ? 'border-amber-800 text-amber-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PenTool className="w-4 h-4" />
            한자 쓰기 캔버스
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('ai_deep');
              if (!aiExplanation && !loadingAi) {
                fetchAIDeepExplanation();
              }
            }}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'ai_deep'
                ? 'border-amber-800 text-amber-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-700" />
            AI 훈장님 심층 자원 분석
            <Sparkles className="w-3 h-3 text-amber-500" />
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'info' && (
            <>
              {/* Etymology Description */}
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-700" />
                  글자의 짜임과 자원(字源) 해설
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {hanja.etymologyDescription}
                </p>
              </div>

              {/* Key Vocabularies */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                  1급 시험 빈출 단어 및 용례 ({hanja.vocabularies.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hanja.vocabularies.map((vocab, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-xs transition"
                    >
                      <div className="flex items-baseline justify-between mb-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold text-slate-900 font-serif tracking-wide">
                            {vocab.word}
                          </span>
                          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                            [{vocab.reading}]
                          </span>
                        </div>
                        {vocab.difficulty && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              vocab.difficulty === '빈출'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : vocab.difficulty === '고난도'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {vocab.difficulty}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-normal">{vocab.meaning}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Synonyms & Antonyms */}
              {((hanja.synonyms && hanja.synonyms.length > 0) || (hanja.antonyms && hanja.antonyms.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {hanja.synonyms && hanja.synonyms.length > 0 && (
                    <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/60">
                      <span className="text-xs font-bold text-blue-900 block mb-1.5">
                        유의자(類義字):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {hanja.synonyms.map((syn, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded bg-white font-serif text-sm font-bold text-blue-950 shadow-xs border border-blue-200"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {hanja.antonyms && hanja.antonyms.length > 0 && (
                    <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-200/60">
                      <span className="text-xs font-bold text-orange-900 block mb-1.5">
                        상대자 / 반의자(對義字):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {hanja.antonyms.map((ant, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded bg-white font-serif text-sm font-bold text-orange-950 shadow-xs border border-orange-200"
                          >
                            {ant}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'practice' && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="mb-3 text-center">
                <h4 className="text-sm font-bold text-slate-800">
                  [{hanja.hanja}] 직접 획순 쓰기 연습
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  총 {hanja.strokeCount}획 · {hanja.meaning} {hanja.reading}
                </p>
              </div>
              <StrokePracticeCanvas guideCharacter={hanja.hanja} size={280} />
            </div>
          )}

          {activeTab === 'ai_deep' && (
            <div className="space-y-4">
              {loadingAi && (
                <div className="py-12 text-center flex flex-col items-center justify-center gap-3 text-amber-900">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
                  <p className="text-sm font-medium">
                    AI 훈장님이 [{hanja.hanja}]의 갑골문 자원과 1급 출제 포인트를 분석 중입니다...
                  </p>
                </div>
              )}

              {aiError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                  <p className="font-bold mb-1">오류 발생:</p>
                  <p>{aiError}</p>
                  <button
                    type="button"
                    onClick={fetchAIDeepExplanation}
                    className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700"
                  >
                    다시 시도하기
                  </button>
                </div>
              )}

              {aiExplanation && (
                <div className="space-y-4 text-xs sm:text-sm">
                  {/* Origin */}
                  <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
                    <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" /> 자원 및 육서 분석 ({aiExplanation.etymologyType})
                    </h4>
                    <p className="text-slate-800 leading-relaxed">{aiExplanation.origin}</p>
                  </div>

                  {/* Mnemonic */}
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                    <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider mb-1">
                      💡 훈장님의 암기 비법
                    </h4>
                    <p className="text-slate-800 leading-relaxed">{aiExplanation.mnemonicTip}</p>
                  </div>

                  {/* Confusable */}
                  {aiExplanation.confusableHanja && (
                    <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200">
                      <h4 className="font-bold text-orange-950 text-xs uppercase tracking-wider mb-1">
                        ⚠️ 시험 함정 및 혼동 한자 구별법
                      </h4>
                      <p className="text-slate-800 leading-relaxed">{aiExplanation.confusableHanja}</p>
                    </div>
                  )}

                  {/* Classical Quote */}
                  {aiExplanation.classicalQuote && (
                    <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                      <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                        📜 고전 및 한시 대표 용례
                      </h4>
                      <p className="text-slate-800 font-serif italic leading-relaxed">
                        {aiExplanation.classicalQuote}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>한국어문회 한자능력검정시험 1급 배정한자 표준 DB</span>
          <button
            id="ask-tutor-from-modal-btn"
            type="button"
            onClick={() => {
              onClose();
              if (onOpenAITutorWithPrompt) {
                onOpenAITutorWithPrompt(`한자 [${hanja.hanja}(${hanja.meaning} ${hanja.reading})]에 대한 1급 시험 빈출 유형과 문맥 속 쓰임새를 더 자세히 알려주세요.`);
              }
            }}
            className="text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1"
          >
            <Bot className="w-3.5 h-3.5" /> 훈장님께 추가 질문하기 →
          </button>
        </div>
      </div>
    </div>
  );
};
