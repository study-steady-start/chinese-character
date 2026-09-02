import React, { useState } from 'react';
import {
  CONFUSING_PAIRS,
  POLYPHONE_DATA,
  SIMPLIFIED_PAIRS,
  SYN_ANT_PAIRS,
  RADICAL_SPECIALS,
} from '../data/specialTopicsData';
import {
  BrainCircuit,
  Layers,
  ArrowRightLeft,
  Volume2,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

export const ConfusionCenterView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<
    'confusing' | 'polyphone' | 'simplified' | 'syn_ant' | 'radicals'
  >('confusing');

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
      {/* Top Special Topic Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1">
        {[
          { id: 'confusing', label: '혼동 한자 구별 (유사형)', icon: AlertTriangle },
          { id: 'polyphone', label: '동자이음자 (다음자)', icon: Volume2 },
          { id: 'simplified', label: '약자 ↔ 정자 대조', icon: ArrowRightLeft },
          { id: 'syn_ant', label: '유의자 & 상대자', icon: Layers },
          { id: 'radicals', label: '특수 변형 부수', icon: BrainCircuit },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition ${
                isActive
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: 혼동 한자 */}
      {activeSubTab === 'confusing' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs sm:text-sm text-amber-950 flex items-start gap-2.5">
            <Lightbulb className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">1급 합격의 열쇠 - 혼동 한자 정복:</strong> 형태가 매우 비슷하여
              획 하나 차이로 오답이 갈리는 고난도 한자군입니다. 미세한 획 차이와 부수의 의미를 반드시
              비교하여 암기하세요.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONFUSING_PAIRS.map((pair) => (
              <div
                key={pair.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4"
              >
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="font-serif font-bold text-slate-900 text-base">
                    {pair.title}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                  {pair.characters.map((ch, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-3xl font-normal text-amber-950">
                          {ch.hanja}
                        </span>
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">
                          {ch.reading}
                        </span>
                      </div>
                      <div className="mt-2 text-xs">
                        <p className="font-semibold text-slate-800">{ch.meaning}</p>
                        <p className="text-[11px] text-red-700 mt-1 font-medium bg-white p-1 rounded border border-red-100">
                          🔍 {ch.differenceTip}
                        </p>
                        {ch.sampleWord && (
                          <p className="text-[11px] text-slate-500 mt-1 truncate">
                            예: {ch.sampleWord}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-950 font-medium">
                  💡 <strong>구별 공식:</strong> {pair.distinctionRule}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: 동자이음자 */}
      {activeSubTab === 'polyphone' && (
        <div className="space-y-4">
          <div className="bg-red-50/70 p-4 rounded-2xl border border-red-200 text-xs sm:text-sm text-red-950 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">독음 문제 1순위 함정 - 동자이음자:</strong> 한 글자가 문맥과
              단어에 따라 둘 이상의 소리와 뜻을 가지는 한자입니다. (예: 賈 - 상고 vs 가씨, 龜 - 거북 귀 vs 균열 vs 구미)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {POLYPHONE_DATA.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4"
              >
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center font-serif text-3xl text-amber-950 font-normal">
                    {item.hanja}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-slate-900 text-base">
                      한자 [{item.hanja}]의 여러 가지 소리와 뜻
                    </h3>
                    <p className="text-xs text-slate-500">
                      총 {item.readings.length}개의 상이한 독음 보유
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {item.readings.map((rd, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                    >
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-amber-900 font-serif">
                          [{rd.reading}]
                        </span>
                        <span className="font-semibold text-slate-800">{rd.meaning}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {rd.sampleWords.map((sw, sIdx) => (
                          <span
                            key={sIdx}
                            className="bg-white px-2 py-1 rounded-md border border-slate-200 text-[11px]"
                          >
                            <strong className="font-serif text-slate-900">{sw.word}</strong> (
                            {sw.reading}) - {sw.meaning}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {item.examTip && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-950 font-medium">
                    ⚠️ <strong>시험 출제 포인트:</strong> {item.examTip}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: 약자 ↔ 정자 */}
      {activeSubTab === 'simplified' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 text-xs sm:text-sm text-blue-950 flex items-start gap-2.5">
            <ArrowRightLeft className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">약자(略字) 및 속자(俗字) 영역:</strong> 1급 시험에는 복잡한 정자를
              약자로 바꾸어 쓰거나, 약자를 보고 정자를 고르는 문제가 매회 필수 출제됩니다.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SIMPLIFIED_PAIRS.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between shadow-xs hover:border-amber-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>정자(正字)</span>
                    <span>약자(略字)</span>
                  </div>

                  <div className="flex items-center justify-around py-3 bg-amber-50/30 rounded-xl border border-amber-100">
                    <span className="font-serif text-3xl text-slate-900 font-bold">
                      {item.traditional}
                    </span>
                    <ArrowRightLeft className="w-4 h-4 text-amber-700" />
                    <span className="font-serif text-3xl text-blue-700 font-bold">
                      {item.simplified}
                    </span>
                  </div>

                  <div className="text-center mt-2.5">
                    <span className="font-bold text-slate-800 text-sm">{item.meaning}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-2 leading-relaxed bg-slate-50 p-2 rounded-lg">
                    {item.ruleExplanation}
                  </p>
                </div>

                {item.sampleWord && (
                  <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
                    용례: {item.sampleWord}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: 유의자 & 상대자 */}
      {activeSubTab === 'syn_ant' && (
        <div className="space-y-4">
          <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 text-xs sm:text-sm text-purple-950 flex items-start gap-2.5">
            <Layers className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">유의어(類義語)와 상대어(對義語):</strong> 두 글자가 뜻이 같아
              합성어를 이루는 경우(顰蹙, 齟齬)와, 정반대 의미로 대립되는 경우(黜陟, 盈虧)를 분석합니다.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYN_ANT_PAIRS.map((pair) => (
              <div
                key={pair.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                      pair.type === 'synonym'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-orange-100 text-orange-900'
                    }`}
                  >
                    {pair.relationName}
                  </span>
                </div>

                <div className="flex items-center justify-around py-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-center">
                    <span className="font-serif text-3xl font-bold text-slate-900 block">
                      {pair.char1.hanja}
                    </span>
                    <span className="text-xs text-slate-600 font-medium mt-1 block">
                      {pair.char1.meaning} {pair.char1.reading}
                    </span>
                  </div>

                  <span className="font-black text-slate-400 text-lg">
                    {pair.type === 'synonym' ? '≈' : '↔'}
                  </span>

                  <div className="text-center">
                    <span className="font-serif text-3xl font-bold text-slate-900 block">
                      {pair.char2.hanja}
                    </span>
                    <span className="text-xs text-slate-600 font-medium mt-1 block">
                      {pair.char2.meaning} {pair.char2.reading}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs text-slate-700">
                  💡 {pair.examTip}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 5: 특수 변형 부수 */}
      {activeSubTab === 'radicals' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 flex items-start gap-2.5">
            <BrainCircuit className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">부수(部首) 변형 규칙:</strong> 부수가 글자의 좌변(변), 우변(방),
              상단(머리), 하단(발) 등에 위치할 때 형태가 바뀌는 변형 부수 목록입니다.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RADICAL_SPECIALS.map((rad) => (
              <div
                key={rad.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-serif text-2xl font-bold text-emerald-950">
                    {rad.variant}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-sm">
                      {rad.name} (원래 부수: {rad.radical})
                    </h4>
                    <p className="text-xs text-slate-500">{rad.meaning}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">
                    해당 부수가 쓰인 대표 1급 한자:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {rad.exampleHanjas.map((ex, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
                      >
                        <strong className="font-serif font-bold text-amber-900 text-sm mr-1">
                          {ex.hanja}
                        </strong>
                        {ex.meaning}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
