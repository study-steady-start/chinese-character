import React, { useState } from 'react';
import { WrongNoteItem, HanjaItem } from '../types';
import {
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  BookOpen,
  Award,
  TrendingUp,
  Brain,
  Layers,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WrongNotesAndStatsViewProps {
  wrongNotes: WrongNoteItem[];
  learnedHanja: HanjaItem[];
  bookmarkedHanja: HanjaItem[];
  totalHanjaCount: number;
  onRemoveWrongNote: (id: string) => void;
  onSelectHanja: (hanja: HanjaItem) => void;
}

export const WrongNotesAndStatsView: React.FC<WrongNotesAndStatsViewProps> = ({
  wrongNotes,
  learnedHanja,
  bookmarkedHanja,
  totalHanjaCount,
  onRemoveWrongNote,
  onSelectHanja,
}) => {
  const [activeTab, setActiveTab] = useState<'wrong_notes' | 'stats' | 'bookmarks'>('wrong_notes');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Re-quiz mode for wrong notes
  const [isRequizActive, setIsRequizActive] = useState(false);
  const [requizIndex, setRequizIndex] = useState(0);
  const [requizUserAnswer, setRequizUserAnswer] = useState<number | null>(null);
  const [requizChecked, setRequizChecked] = useState(false);
  const [requizScore, setRequizScore] = useState(0);

  const filteredWrongNotes = wrongNotes.filter((wn) => {
    if (selectedSection !== 'all' && !wn.question.section.includes(selectedSection)) {
      return false;
    }
    return true;
  });

  const learnedRate = Math.round((learnedHanja.length / (totalHanjaCount || 1)) * 100);

  const startRequiz = () => {
    if (wrongNotes.length === 0) return;
    setIsRequizActive(true);
    setRequizIndex(0);
    setRequizUserAnswer(null);
    setRequizChecked(false);
    setRequizScore(0);
  };

  const handleSelectRequizOption = (idx: number) => {
    if (requizChecked) return;
    setRequizUserAnswer(idx);
    setRequizChecked(true);

    const currentQ = wrongNotes[requizIndex].question;
    if (idx === currentQ.correctIndex) {
      setRequizScore((prev) => prev + 1);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }
  };

  const nextRequizQuestion = () => {
    if (requizIndex < wrongNotes.length - 1) {
      setRequizIndex((prev) => prev + 1);
      setRequizUserAnswer(null);
      setRequizChecked(false);
    } else {
      // Finished
      setIsRequizActive(false);
      confetti({ particleCount: 70, spread: 60 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('wrong_notes');
              setIsRequizActive(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'wrong_notes'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" /> 오답노트 ({wrongNotes.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('stats');
              setIsRequizActive(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'stats'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> 종합 학습 통계
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('bookmarks');
              setIsRequizActive(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'bookmarks'
                ? 'bg-amber-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> 북마크 한자 ({bookmarkedHanja.length})
          </button>
        </div>

        {activeTab === 'wrong_notes' && wrongNotes.length > 0 && !isRequizActive && (
          <button
            type="button"
            onClick={startRequiz}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <RotateCcw className="w-4 h-4" /> 오답 집중 재시험 풀기
          </button>
        )}
      </div>

      {/* TAB 1: WRONG NOTES */}
      {activeTab === 'wrong_notes' && (
        <div className="space-y-4">
          {!isRequizActive ? (
            <>
              {/* Section Filters */}
              {wrongNotes.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
                  <span className="text-slate-400 font-medium">영역 필터:</span>
                  {['all', '독음', '훈음', '선택', '사자성어', '약자', '부수', '유의'].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSelectedSection(sec)}
                      className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                        selectedSection === sec
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sec === 'all' ? '전체 보기' : sec}
                    </button>
                  ))}
                </div>
              )}

              {filteredWrongNotes.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">
                    현재 등록된 오답이 없습니다!
                  </h3>
                  <p className="text-xs text-slate-500">
                    실전 모의고사에서 틀린 문제를 오답노트에 담아 취약점을 보완하세요.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredWrongNotes.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-red-200/80 p-5 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-900">
                            {item.question.section}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            등록: {item.addedAt}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveWrongNote(item.id)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition"
                          title="오답노트에서 삭제 (마스터함)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="font-serif font-bold text-slate-900 text-base">
                        {item.question.prompt}
                      </p>

                      {item.question.contextSentence && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-serif text-sm">
                          {item.question.contextSentence}
                        </div>
                      )}

                      {/* Correct vs Selected */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-950">
                          <span className="font-bold block mb-0.5">내가 선택한 답:</span>
                          <span>
                            {item.userAnswer !== undefined
                              ? item.question.options[item.userAnswer]
                              : '미표기'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                          <span className="font-bold block mb-0.5">정답:</span>
                          <span>{item.question.options[item.question.correctIndex]}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-slate-700">
                        <strong>💡 훈장님 해설: </strong>
                        {item.question.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* RE-QUIZ INTERACTIVE MODE */
            <div className="bg-white rounded-3xl border-2 border-red-200 p-6 sm:p-8 space-y-6 max-w-2xl mx-auto shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
                <span className="font-bold text-red-900 text-sm">
                  오답 집중 복습 퀴즈
                </span>
                <span className="font-semibold bg-red-100 text-red-900 px-2.5 py-1 rounded-full">
                  문제 {requizIndex + 1} / {wrongNotes.length}
                </span>
              </div>

              {/* Question */}
              <div className="space-y-3">
                <p className="font-serif font-bold text-slate-900 text-lg">
                  {wrongNotes[requizIndex].question.prompt}
                </p>

                {wrongNotes[requizIndex].question.contextSentence && (
                  <div className="p-4 bg-amber-50/40 rounded-xl border border-amber-200/60 font-serif text-base text-slate-800">
                    {wrongNotes[requizIndex].question.contextSentence}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {wrongNotes[requizIndex].question.options.map((opt, idx) => {
                  const isCorrect = idx === wrongNotes[requizIndex].question.correctIndex;
                  const isSelected = requizUserAnswer === idx;

                  let optClass = 'bg-slate-50 border-slate-200 hover:bg-slate-100';
                  if (requizChecked) {
                    if (isCorrect) {
                      optClass = 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optClass = 'bg-red-100 border-red-500 text-red-950 font-bold';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={requizChecked}
                      onClick={() => handleSelectRequizOption(idx)}
                      className={`w-full text-left p-3.5 rounded-xl border-2 text-sm font-serif transition flex items-center justify-between ${optClass}`}
                    >
                      <span>
                        {idx + 1}. {opt}
                      </span>
                      {requizChecked && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {requizChecked && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600" />}
                    </button>
                  );
                })}
              </div>

              {requizChecked && (
                <div className="pt-2 space-y-3 animate-in fade-in">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                    <strong>해설:</strong> {wrongNotes[requizIndex].question.explanation}
                  </div>

                  <button
                    type="button"
                    onClick={nextRequizQuestion}
                    className="w-full py-3 rounded-xl bg-amber-900 hover:bg-amber-800 text-white font-bold text-sm shadow-md transition"
                  >
                    {requizIndex < wrongNotes.length - 1 ? '다음 오답 문제 풀기 →' : '오답 퀴즈 완료'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Main 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">1급 배정한자 완독률</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-amber-900 font-serif">{learnedRate}%</span>
                <span className="text-xs text-slate-400">({learnedHanja.length} / {totalHanjaCount}자)</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-amber-700 rounded-full" style={{ width: `${learnedRate}%` }} />
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">등록된 북마크</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-slate-900 font-serif">{bookmarkedHanja.length}</span>
                <span className="text-xs text-slate-400">개 한자</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">자주 잊어버리는 한자 집중 관리</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">누적 오답 문항</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-red-700 font-serif">{wrongNotes.length}</span>
                <span className="text-xs text-slate-400">개 문항</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">오답 집중 풀기로 오답률 제로화</p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">1급 합격 예측 지표</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-emerald-700 font-serif">
                  {learnedRate >= 70 ? '안정권' : '학습중'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">한국어문회 1급 커트라인 80점 대비</p>
            </div>
          </div>

          {/* Detailed Skill Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-serif font-bold text-slate-900 text-base flex items-center gap-2">
              <Brain className="w-4 h-4 text-amber-700" />
              1급 8대 핵심 영역별 목표 달성도
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {[
                { name: '1. 한자어 독음 (讀音)', rate: 85, tip: '동자이음자(賈, 龜, 說) 집중 복습' },
                { name: '2. 한자의 훈과 음 (訓音)', rate: 78, tip: '1급 신출 1,145자 필수 암기' },
                { name: '3. 한자 쓰기 / 도음 (選擇)', rate: 65, tip: '주관식 쓰기배정 2,005자 필순 연습' },
                { name: '4. 사자성어 (四字成語)', rate: 80, tip: '출전 고사 및 빈칸 한자 채우기' },
                { name: '5. 약자와 정자 (略字)', rate: 90, tip: '약자 ↔ 정자 대조 규칙 암기' },
                { name: '6. 부수 찾기 (部首)', rate: 75, tip: '특수 변형 부수(⺡, ⺘, 忄, 鬯) 주의' },
                { name: '7. 유의자 & 반의자', rate: 70, tip: '대립자/상대어(黜陟, 盈虧) 대조' },
                { name: '8. 고전문장 및 한시 해석', rate: 72, tip: '현토 및 주어·술어 구조 분석' },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="font-bold text-amber-900">{item.rate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-800 rounded-full" style={{ width: `${item.rate}%` }} />
                  </div>
                  <p className="text-[11px] text-slate-500">💡 {item.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKMARKS */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {bookmarkedHanja.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-2">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                북마크된 한자가 없습니다.
              </h3>
              <p className="text-xs text-slate-500">
                배정한자 사전이나 플래시카드에서 북마크 버튼을 눌러 중요한 한자를 저장하세요.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {bookmarkedHanja.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectHanja(item)}
                  className="bg-white p-4 rounded-xl border border-amber-300 shadow-xs hover:shadow-md transition cursor-pointer flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center font-serif text-3xl font-bold text-amber-950 shadow-inner">
                    {item.hanja}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif font-bold text-slate-900 text-sm">
                      {item.meaning} <span className="text-amber-900">{item.reading}</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      부수 {item.radical} · {item.strokeCount}획
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
