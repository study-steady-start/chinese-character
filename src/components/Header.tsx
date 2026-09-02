import React from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  FileCheck2,
  BookmarkCheck,
  Flame,
  Bot,
  BrainCircuit,
  Compass,
  History
} from 'lucide-react';

export type TabType = 'dictionary' | 'flashcard' | 'idioms' | 'confusion' | 'mock_exam' | 'past_exam' | 'wrong_notes';

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenAITutor: () => void;
  learnedCount: number;
  totalCount: number;
  streakDays: number;
  wrongCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenAITutor,
  learnedCount,
  totalCount,
  streakDays,
  wrongCount,
}) => {
  const masteryPercentage = Math.round((learnedCount / (totalCount || 1)) * 100);

  const navItems = [
    { id: 'dictionary', label: '배정한자 사전', icon: BookOpen, badge: `${totalCount}자` },
    { id: 'flashcard', label: '플래시카드 암기', icon: Layers, badge: `${learnedCount}완료` },
    { id: 'idioms', label: '사자성어·고사성어', icon: Compass, badge: '500+' },
    { id: 'confusion', label: '혼동·약자·부수 특강', icon: BrainCircuit, badge: '1급필수' },
    { id: 'mock_exam', label: '실전 모의고사', icon: FileCheck2, badge: '공식유형' },
    { id: 'past_exam', label: '최근 기출문제', icon: History, badge: '최근5회' },
    { id: 'wrong_notes', label: '오답노트 & 통계', icon: BookmarkCheck, badge: wrongCount > 0 ? `${wrongCount}` : undefined },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 flex items-center justify-center text-amber-100 shadow-md font-serif text-xl font-black border border-amber-600/30">
              壹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 tracking-wide">
                  한국어문회 1급 대비
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline-block">
                  3,500자 정복
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5 font-serif">
                한자능력검정시험 <span className="text-amber-800">1級 마스터</span>
              </h1>
            </div>
          </div>

          {/* Quick Stats & AI Master Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Streak */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-xs font-medium">
              <Flame className="w-4 h-4 text-orange-600 fill-orange-500 animate-pulse" />
              <span>{streakDays}일 연속 학습</span>
            </div>

            {/* Mastery Progress */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200 text-xs">
              <span className="text-slate-500">배정한자 완독률:</span>
              <span className="font-bold text-slate-800">{masteryPercentage}%</span>
              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-600 transition-all duration-500 rounded-full"
                  style={{ width: `${masteryPercentage}%` }}
                />
              </div>
            </div>

            {/* AI Tutor Button */}
            <button
              id="ai-tutor-trigger-btn"
              type="button"
              onClick={onOpenAITutor}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-white shadow-sm hover:shadow text-xs sm:text-sm font-medium flex items-center gap-2 transition active:scale-95 border border-amber-700/50"
            >
              <Bot className="w-4 h-4 text-amber-200" />
              <span className="font-medium">AI 한자 훈장님</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                type="button"
                onClick={() => onSelectTab(item.id as TabType)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-200' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-amber-800 text-amber-100'
                        : item.id === 'wrong_notes' && wrongCount > 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
