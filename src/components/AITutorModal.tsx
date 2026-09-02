import React, { useState } from 'react';
import {
  X,
  Bot,
  Send,
  Sparkles,
  Scroll,
  BookOpen,
  HelpCircle,
  Loader2,
  Volume2,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  '1급 시험에서 가장 오답률이 높은 동자이음자 핵심 5가지는?',
  '육서(六書: 상형, 지사, 회의, 형성, 전주, 가차)를 쉽게 구별하는 비법은?',
  '한자능력검정시험 1급 주관식 쓰기에서 감점당하지 않는 요령은?',
  '혼동 한자 戊, 戌, 戍, 戎 4형제를 완벽히 외우는 암기 공식은?',
];

const PRESET_CLASSICAL_PASSAGES = [
  {
    title: '두보(杜甫) - 춘망(春望)',
    passage: '國破山河在 城春草木深 感時花濺淚 恨別鳥驚心',
  },
  {
    title: '논어(論語) - 학이편(學而篇)',
    passage: '學而時習之 不亦說乎 有朋自遠方來 不亦樂乎 人不知而不慍 不亦君子乎',
  },
  {
    title: '명심보감(明心寶鑑) - 계선편(繼善篇)',
    passage: '子曰 爲善者 天報之以福 爲不善者 天報之以禍',
  },
  {
    title: '이백(李白) - 산중문답(山中問答)',
    passage: '問余何意棲碧山 笑而不答心自閑 桃花流水窅然去 別有天地非人間',
  },
];

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  initialPrompt = '',
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'passage'>('chat');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'tutor',
      text: '학동(學童)이여, 반갑네! 나는 한자능력검정시험 1급의 깊은 자원(字源)과 시험의 묘수(妙手)를 알려줄 훈장(訓長)일세. 3,500자의 훈음, 부수, 육서의 원리, 사자성어의 유래 등 무엇이든 하문(下問)하게나.',
      timestamp: '지금',
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState(initialPrompt);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Classical Passage State
  const [passageInput, setPassageInput] = useState(PRESET_CLASSICAL_PASSAGES[0].passage);
  const [passageAnalysis, setPassageAnalysis] = useState<any | null>(null);
  const [isPassageLoading, setIsPassageLoading] = useState(false);
  const [passageError, setPassageError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsChatLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/gemini/ask-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      if (data.answer) {
        setMessages((prev) => [
          ...prev,
          {
            id: `t_${Date.now()}`,
            sender: 'tutor',
            text: data.answer,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'tutor',
            text: '어허, 서당 밖 바람이 거세어 답을 전하지 못했네. 잠시 후 다시 질문해 주게나.',
            timestamp: '오류',
          },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'tutor',
          text: 'AI 서당 서버와의 연결이 원활하지 않네. 잠시 후 다시 시도해 보게.',
          timestamp: '오류',
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleAnalyzePassage = async (customPassage?: string) => {
    const passageToAnalyze = customPassage || passageInput;
    if (!passageToAnalyze.trim() || isPassageLoading) return;

    setIsPassageLoading(true);
    setPassageError(null);

    try {
      const res = await fetch('/api/gemini/analyze-passage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage: passageToAnalyze }),
      });

      const data = await res.json();
      if (data.analysis) {
        setPassageAnalysis(data.analysis);
      } else {
        setPassageError(data.error || '구절 해석을 불러오지 못했습니다.');
      }
    } catch (e) {
      setPassageError('고문 분석 중 통신 오류가 발생했습니다.');
    } finally {
      setIsPassageLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-950 font-serif text-xl font-black flex items-center justify-center shadow-md">
              師
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base sm:text-lg font-bold font-serif flex items-center gap-1.5">
                  AI 한자 훈장님 서당 (書堂)
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-700 text-amber-100 font-medium">
                  Gemini 3.7
                </span>
              </div>
              <p className="text-xs text-amber-200">
                1급 배정한자 자원 분석 · 동자이음자 함정 지도 · 고전 한문 구절 해설
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-amber-200 hover:text-white hover:bg-amber-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'chat'
                ? 'border-amber-900 text-amber-950 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bot className="w-4 h-4 text-amber-800" />
            1:1 훈장님 실시간 문답실
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('passage')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'passage'
                ? 'border-amber-900 text-amber-950 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scroll className="w-4 h-4 text-amber-800" />
            고전문장 & 한시 구절 심층 분석실
          </button>
        </div>

        {/* TAB 1: Chat Mode */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-serif font-bold text-sm ${
                      msg.sender === 'user'
                        ? 'bg-slate-800 text-white'
                        : 'bg-amber-100 text-amber-950 border border-amber-300'
                    }`}
                  >
                    {msg.sender === 'user' ? '學' : '師'}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-amber-900 text-white rounded-tr-xs'
                        : 'bg-amber-50/60 border border-amber-200/80 text-slate-800 rounded-tl-xs whitespace-pre-wrap font-serif'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[10px] block mt-1.5 ${
                        msg.sender === 'user' ? 'text-amber-200 text-right' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-950 border border-amber-300 flex items-center justify-center shrink-0 font-serif font-bold text-sm">
                    師
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-700" />
                    <span>훈장님이 전거(典據)와 옥편(玉篇)을 살펴 답변을 작성하고 계십니다...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="px-6 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">추천 질문:</span>
              {PRESET_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs hover:border-amber-400 hover:text-amber-900 whitespace-nowrap transition"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                id="ai-tutor-input"
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="훈장님께 1급 한자, 자원, 부수, 사자성어 질문을 입력하세요..."
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/30"
              />
              <button
                id="ai-tutor-send-btn"
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isChatLoading || !inputPrompt.trim()}
                className="px-5 py-3 rounded-xl bg-amber-900 hover:bg-amber-800 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-1.5 shadow-sm transition"
              >
                <Send className="w-4 h-4" />
                <span>질문하기</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Classical Passage Analysis */}
        {activeTab === 'passage' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  분석할 한문 문장 또는 한시(漢詩) 구절:
                </label>
                <span className="text-xs text-slate-400">1급 고문 독해 문항 대비</span>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {PRESET_CLASSICAL_PASSAGES.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setPassageInput(p.passage);
                      handleAnalyzePassage(p.passage);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-950 border border-slate-200 text-xs font-medium transition"
                  >
                    {p.title}
                  </button>
                ))}
              </div>

              <textarea
                value={passageInput}
                onChange={(e) => setPassageInput(e.target.value)}
                rows={3}
                placeholder="분석할 한문 구절을 입력하세요 (예: 國破山河在 城春草木深...)"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl font-serif text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-800/30"
              />

              <button
                type="button"
                onClick={() => handleAnalyzePassage()}
                disabled={isPassageLoading || !passageInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-amber-900 hover:bg-amber-800 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition"
              >
                {isPassageLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-300" />
                )}
                <span>AI 훈장님 심층 문장 분석 시작</span>
              </button>
            </div>

            {passageError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                {passageError}
              </div>
            )}

            {/* Analysis Results Display */}
            {passageAnalysis && (
              <div className="space-y-4 pt-2 animate-in fade-in">
                {/* Title & Reading with 토 */}
                <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 uppercase">
                      현토(懸吐) 및 정통 독음
                    </span>
                  </div>
                  <p className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
                    {passageAnalysis.koreanReading}
                  </p>
                  <p className="text-sm font-semibold text-slate-700 pt-1">
                    현대어 완역: {passageAnalysis.modernTranslation}
                  </p>
                </div>

                {/* Grammatical Structure */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-700" /> 문장 구조 및 문법 해석 (주어/술어/허사)
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-serif">
                    {passageAnalysis.grammaticalStructure}
                  </p>
                </div>

                {/* Character Breakdown */}
                {passageAnalysis.characterBreakdown && (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      주요 글자별 훈음 및 어법적 쓰임
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {passageAnalysis.characterBreakdown.map((item: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                          <strong className="font-serif text-base text-amber-950 mr-1.5">
                            {item.hanja}
                          </strong>
                          <span className="text-amber-800 font-semibold mr-2">[{item.reading}]</span>
                          <span className="text-slate-600">{item.role || item.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exam Key Points */}
                {passageAnalysis.examKeyPoints && (
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 font-medium">
                    🎯 <strong>1급 시험 출제 핵심 포인트:</strong> {passageAnalysis.examKeyPoints}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
