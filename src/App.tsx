import React, { useState, useEffect } from 'react';
import { Header, TabType } from './components/Header';
import { HanjaDictionaryView } from './components/HanjaDictionaryView';
import { FlashcardLearner } from './components/FlashcardLearner';
import { IdiomsView } from './components/IdiomsView';
import { ConfusionCenterView } from './components/ConfusionCenterView';
import { MockTestView } from './components/MockTestView';
import { PastExamsView } from './components/PastExamsView';
import { WrongNotesAndStatsView } from './components/WrongNotesAndStatsView';
import { HanjaDetailModal } from './components/HanjaDetailModal';
import { AITutorModal } from './components/AITutorModal';
import { HANJA_DATA } from './data/hanjaData';
import { HanjaItem, WrongNoteItem, ExamQuestion } from './types';
import {
  Sparkles,
  BookOpen,
  Award,
  Flame,
  CheckCircle2,
  Bot
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dictionary');
  const [selectedHanja, setSelectedHanja] = useState<HanjaItem | null>(null);
  const [isAITutorOpen, setIsAITutorOpen] = useState(false);
  const [aiTutorPrompt, setAiTutorPrompt] = useState('');

  // Persistence State
  const [learnedIds, setLearnedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hanja1_learned_ids');
      return saved ? JSON.parse(saved) : ['h_1', 'h_3'];
    } catch {
      return ['h_1', 'h_3'];
    }
  });

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hanja1_bookmarked_ids');
      return saved ? JSON.parse(saved) : ['h_2', 'h_6'];
    } catch {
      return ['h_2', 'h_6'];
    }
  });

  const [wrongNotes, setWrongNotes] = useState<WrongNoteItem[]>(() => {
    try {
      const saved = localStorage.getItem('hanja1_wrong_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [streakDays, setStreakDays] = useState(3);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('hanja1_learned_ids', JSON.stringify(learnedIds));
    } catch {}
  }, [learnedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('hanja1_bookmarked_ids', JSON.stringify(bookmarkedIds));
    } catch {}
  }, [bookmarkedIds]);

  useEffect(() => {
    try {
      localStorage.setItem('hanja1_wrong_notes', JSON.stringify(wrongNotes));
    } catch {}
  }, [wrongNotes]);

  // Actions
  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleLearned = (id: string) => {
    setLearnedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddWrongNotes = (
    incorrectQuestions: ExamQuestion[],
    userAnswers: Record<string, number>
  ) => {
    const newNotes: WrongNoteItem[] = incorrectQuestions.map((q) => ({
      id: `wn_${Date.now()}_${q.id}`,
      question: q,
      userAnswer: userAnswers[q.id],
      addedAt: new Date().toLocaleDateString('ko-KR'),
    }));

    setWrongNotes((prev) => {
      const existingIds = new Set(prev.map((item) => item.question.id));
      const filteredNew = newNotes.filter((item) => !existingIds.has(item.question.id));
      return [...filteredNew, ...prev];
    });

    setActiveTab('wrong_notes');
  };

  const handleRemoveWrongNote = (id: string) => {
    setWrongNotes((prev) => prev.filter((item) => item.id !== id));
  };

  const handleOpenAITutorWithPrompt = (prompt: string) => {
    setAiTutorPrompt(prompt);
    setIsAITutorOpen(true);
  };

  const learnedHanjaList = HANJA_DATA.filter((h) => learnedIds.includes(h.id));
  const bookmarkedHanjaList = HANJA_DATA.filter((h) => bookmarkedIds.includes(h.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-slate-900 font-sans selection:bg-amber-200">
      {/* Top Main Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAITutor={() => {
          setAiTutorPrompt('');
          setIsAITutorOpen(true);
        }}
        learnedCount={learnedIds.length}
        totalCount={HANJA_DATA.length}
        streakDays={streakDays}
        wrongCount={wrongNotes.length}
      />

      {/* Main Study Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dictionary' && (
          <HanjaDictionaryView
            hanjaList={HANJA_DATA}
            learnedIds={learnedIds}
            bookmarkedIds={bookmarkedIds}
            onSelectHanja={(hanja) => setSelectedHanja(hanja)}
            onToggleBookmark={handleToggleBookmark}
            onToggleLearned={handleToggleLearned}
          />
        )}

        {activeTab === 'flashcard' && (
          <FlashcardLearner
            hanjaList={HANJA_DATA}
            learnedIds={learnedIds}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={handleToggleBookmark}
            onToggleLearned={handleToggleLearned}
            onSelectHanjaForDetail={(hanja) => setSelectedHanja(hanja)}
          />
        )}

        {activeTab === 'idioms' && <IdiomsView />}

        {activeTab === 'confusion' && <ConfusionCenterView />}

        {activeTab === 'mock_exam' && (
          <MockTestView onAddWrongNotes={handleAddWrongNotes} />
        )}

        {activeTab === 'past_exam' && (
          <PastExamsView
            onAddWrongNotes={handleAddWrongNotes}
            onOpenAITutorWithPrompt={handleOpenAITutorWithPrompt}
          />
        )}

        {activeTab === 'wrong_notes' && (
          <WrongNotesAndStatsView
            wrongNotes={wrongNotes}
            learnedHanja={learnedHanjaList}
            bookmarkedHanja={bookmarkedHanjaList}
            totalHanjaCount={HANJA_DATA.length}
            onRemoveWrongNote={handleRemoveWrongNote}
            onSelectHanja={(hanja) => setSelectedHanja(hanja)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-serif font-semibold text-slate-700">
            한국어문회 한자능력검정시험 1급 대비 교육용 플랫폼 · 1級 合格 祈願
          </p>
          <p className="text-[11px] text-slate-400">
            사전 3,500자 DB · 육서(六書) 자원 해설 · 고전 한문 구절 AI 훈장님 튜터 탑재
          </p>
        </div>
      </footer>

      {/* Modals */}
      {selectedHanja && (
        <HanjaDetailModal
          hanja={selectedHanja}
          onClose={() => setSelectedHanja(null)}
          isBookmarked={bookmarkedIds.includes(selectedHanja.id)}
          isLearned={learnedIds.includes(selectedHanja.id)}
          onToggleBookmark={handleToggleBookmark}
          onToggleLearned={handleToggleLearned}
          onOpenAITutorWithPrompt={handleOpenAITutorWithPrompt}
        />
      )}

      {isAITutorOpen && (
        <AITutorModal
          isOpen={isAITutorOpen}
          onClose={() => setIsAITutorOpen(false)}
          initialPrompt={aiTutorPrompt}
        />
      )}
    </div>
  );
}
