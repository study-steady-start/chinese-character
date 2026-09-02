import React, { useState, useMemo, useEffect } from 'react';
import { HanjaItem } from '../types';
import { RadicalSelectorModal } from './RadicalSelectorModal';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Award,
  PenTool,
  Volume2,
  Layers,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  List,
  Shuffle,
  RotateCcw
} from 'lucide-react';

interface HanjaDictionaryViewProps {
  hanjaList: HanjaItem[];
  learnedIds: string[];
  bookmarkedIds: string[];
  onSelectHanja: (hanja: HanjaItem) => void;
  onToggleBookmark: (id: string) => void;
  onToggleLearned: (id: string) => void;
}

// Korean Initial Consonants for fast indexing
const INITIAL_CONSONANTS = ['전체', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

function getInitialConsonant(char: string): string {
  const code = char.charCodeAt(0) - 44032;
  if (code < 0 || code > 11171) return '';
  const initialIndex = Math.floor(code / 588);
  const initials = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const res = initials[initialIndex];
  if (res === 'ㄲ') return 'ㄱ';
  if (res === 'ㄸ') return 'ㄷ';
  if (res === 'ㅃ') return 'ㅂ';
  if (res === 'ㅆ') return 'ㅅ';
  if (res === 'ㅉ') return 'ㅈ';
  return res;
}

export const HanjaDictionaryView: React.FC<HanjaDictionaryViewProps> = ({
  hanjaList,
  learnedIds,
  bookmarkedIds,
  onSelectHanja,
  onToggleBookmark,
  onToggleLearned,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlearned' | 'learned' | 'bookmarked'>('all');
  const [initialConsonantFilter, setInitialConsonantFilter] = useState<string>('전체');
  const [selectedRadical, setSelectedRadical] = useState<string>('');
  const [strokeFilter, setStrokeFilter] = useState<number | 'all'>('all');
  const [onlyWritingTarget, setOnlyWritingTarget] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'frequency' | 'reading' | 'strokes' | 'level'>('frequency');
  
  // UI Display state
  const [viewMode, setViewMode] = useState<'card' | 'grid'>('card');
  const [pageSize, setPageSize] = useState<number>(36);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isRadicalModalOpen, setIsRadicalModalOpen] = useState(false);

  // Filter and sort items
  const filteredHanja = useMemo(() => {
    return hanjaList
      .filter((item) => {
        // Search query check (reading, meaning, hanja, radical, vocabularies)
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const matchHanja = item.hanja.includes(q);
          const matchReading = item.reading.toLowerCase().includes(q);
          const matchMeaning = item.meaning.toLowerCase().includes(q);
          const matchRadical = item.radical.includes(q) || item.radicalName.toLowerCase().includes(q);
          const matchVocab = item.vocabularies.some(
            (v) => v.word.includes(q) || v.reading.includes(q) || v.meaning.includes(q)
          );
          if (!matchHanja && !matchReading && !matchMeaning && !matchRadical && !matchVocab) {
            return false;
          }
        }

        // Level filter
        if (levelFilter !== 'all') {
          if (levelFilter === '5급이하') {
            if (!['5급', '6급', '7급', '8급'].includes(item.level)) return false;
          } else if (levelFilter === '3급/3급II') {
            if (!['3급', '3급II'].includes(item.level)) return false;
          } else if (item.level !== levelFilter) {
            return false;
          }
        }

        // Initial consonant filter (초성)
        if (initialConsonantFilter !== '전체') {
          const firstChar = item.reading.charAt(0);
          const initConsonant = getInitialConsonant(firstChar);
          if (initConsonant !== initialConsonantFilter) {
            return false;
          }
        }

        // Radical filter
        if (selectedRadical && item.radical !== selectedRadical) {
          return false;
        }

        // Stroke count filter
        if (strokeFilter !== 'all' && item.strokeCount !== strokeFilter) {
          return false;
        }

        // Writing target filter
        if (onlyWritingTarget && !item.isWritingTarget) {
          return false;
        }

        // Status filter
        if (statusFilter === 'learned' && !learnedIds.includes(item.id)) {
          return false;
        }
        if (statusFilter === 'unlearned' && learnedIds.includes(item.id)) {
          return false;
        }
        if (statusFilter === 'bookmarked' && !bookmarkedIds.includes(item.id)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'frequency') {
          return b.examFrequency - a.examFrequency;
        }
        if (sortBy === 'reading') {
          return a.reading.localeCompare(b.reading, 'ko');
        }
        if (sortBy === 'strokes') {
          return a.strokeCount - b.strokeCount;
        }
        if (sortBy === 'level') {
          const levelRank: Record<string, number> = {
            '1급신출': 1,
            '2급': 2,
            '3급': 3,
            '3급II': 4,
            '4급': 5,
            '5급': 6,
            '6급': 7,
            '7급': 8,
            '8급': 9,
          };
          return (levelRank[a.level] || 99) - (levelRank[b.level] || 99);
        }
        return 0;
      });
  }, [
    hanjaList,
    searchQuery,
    levelFilter,
    statusFilter,
    initialConsonantFilter,
    selectedRadical,
    strokeFilter,
    onlyWritingTarget,
    sortBy,
    learnedIds,
    bookmarkedIds,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    levelFilter,
    statusFilter,
    initialConsonantFilter,
    selectedRadical,
    strokeFilter,
    onlyWritingTarget,
    sortBy,
    pageSize,
  ]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredHanja.length / pageSize));
  const paginatedHanja = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHanja.slice(start, start + pageSize);
  }, [filteredHanja, currentPage, pageSize]);

  const handlePickRandom = () => {
    if (filteredHanja.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredHanja.length);
    onSelectHanja(filteredHanja[randomIndex]);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setLevelFilter('all');
    setStatusFilter('all');
    setInitialConsonantFilter('전체');
    setSelectedRadical('');
    setStrokeFilter('all');
    setOnlyWritingTarget(false);
    setSortBy('frequency');
  };

  const playTTS = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Grade Counts
  const gradeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: hanjaList.length,
      '1급신출': 0,
      '2급': 0,
      '3급/3급II': 0,
      '4급': 0,
      '5급이하': 0,
      writingTarget: 0,
    };
    hanjaList.forEach((h) => {
      if (h.level === '1급신출') counts['1급신출']++;
      else if (h.level === '2급') counts['2급']++;
      else if (h.level === '3급' || h.level === '3급II') counts['3급/3급II']++;
      else if (h.level === '4급') counts['4급']++;
      else if (['5급', '6급', '7급', '8급'].includes(h.level)) counts['5급이하']++;

      if (h.isWritingTarget) counts.writingTarget++;
    });
    return counts;
  }, [hanjaList]);

  return (
    <div className="space-y-6">
      {/* Search & Control Center */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Top Title & Quick Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>한국어문회 1급 배정한자 전체사전</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                총 {hanjaList.length.toLocaleString()}자 수록
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              1급 신출 배정한자 1,145자 · 2급~8급 배정한자 2,355자 · 쓰기배정 2,005자 완비
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePickRandom}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Shuffle className="w-3.5 h-3.5" /> 무작위 한자 뽑기
            </button>
            <button
              type="button"
              onClick={() => setIsRadicalModalOpen(true)}
              className={`px-3 py-1.5 border text-xs font-bold rounded-xl flex items-center gap-1.5 transition ${
                selectedRadical
                  ? 'bg-amber-900 text-white border-amber-950 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              {selectedRadical ? `부수 [${selectedRadical}] 선택됨` : '214 부수 색인기'}
            </button>
          </div>
        </div>

        {/* Main Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            id="dictionary-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="한자, 훈음(뜻/소리), 부수, 단어로 검색 (예: 顰, 빈, 찡그릴, 頁, 憂鬱, 齟齬, 2005자 쓰기)"
            className="w-full pl-11 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-800/30 focus:border-amber-800 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded bg-slate-200"
            >
              지우기
            </button>
          )}
        </div>

        {/* Hangul Initial Sound Quick Selector Bar (초성 퀵 인덱스) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">초성:</span>
          {INITIAL_CONSONANTS.map((cons) => (
            <button
              key={cons}
              type="button"
              onClick={() => setInitialConsonantFilter(cons)}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                initialConsonantFilter === cons
                  ? 'bg-amber-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cons}
            </button>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          {/* Level filters */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-slate-400 text-[11px] font-medium mr-1">급수:</span>
            {[
              { id: 'all', label: '전체', count: gradeCounts.all },
              { id: '1급신출', label: '1급 신출', count: gradeCounts['1급신출'] },
              { id: '2급', label: '2급', count: gradeCounts['2급'] },
              { id: '3급/3급II', label: '3급', count: gradeCounts['3급/3급II'] },
              { id: '4급', label: '4급', count: gradeCounts['4급'] },
              { id: '5급이하', label: '5~8급', count: gradeCounts['5급이하'] },
            ].map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setLevelFilter(lvl.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1 ${
                  levelFilter === lvl.id
                    ? 'bg-amber-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{lvl.label}</span>
                <span className={`text-[10px] ${levelFilter === lvl.id ? 'text-amber-200' : 'text-slate-400'}`}>
                  {lvl.count}
                </span>
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Status pills */}
            {[
              { id: 'all', label: '전체' },
              { id: 'unlearned', label: '미학습' },
              { id: 'learned', label: '학습완료' },
              { id: 'bookmarked', label: '북마크' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  statusFilter === st.id
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Sort, View Mode & Writing Target */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={onlyWritingTarget}
                onChange={(e) => setOnlyWritingTarget(e.target.checked)}
                className="w-4 h-4 rounded text-amber-800 focus:ring-amber-800 accent-amber-800"
              />
              <span className="flex items-center gap-1">
                <PenTool className="w-3.5 h-3.5 text-amber-700" /> 쓰기배정(2,005자)만
              </span>
            </label>

            {/* Stroke Count filter select */}
            <select
              value={strokeFilter}
              onChange={(e) => setStrokeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              aria-label="획수 필터"
              className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none"
            >
              <option value="all">전체 획수</option>
              {Array.from({ length: 36 }, (_, i) => i + 1).map((s) => (
                <option key={s} value={s}>
                  {s}획
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="정렬 기준"
              className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium focus:outline-none"
            >
              <option value="frequency">출제빈도순</option>
              <option value="reading">가나다 독음순</option>
              <option value="strokes">총획수순</option>
              <option value="level">급수순 (1급~8급)</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`p-1 rounded-md transition ${
                  viewMode === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="상세 카드형 보기"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-md transition ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="격자형 색인 보기"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Tags Bar (if any) */}
        {(selectedRadical || strokeFilter !== 'all' || initialConsonantFilter !== '전체' || searchQuery || levelFilter !== 'all' || onlyWritingTarget) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span className="text-[11px] text-slate-400 font-medium">적용된 조건:</span>
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-medium">
                검색어: &ldquo;{searchQuery}&rdquo;
              </span>
            )}
            {initialConsonantFilter !== '전체' && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-medium">
                초성: {initialConsonantFilter}
              </span>
            )}
            {selectedRadical && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-medium">
                부수: {selectedRadical}
              </span>
            )}
            {strokeFilter !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-medium">
                획수: {strokeFilter}획
              </span>
            )}
            {onlyWritingTarget && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-medium">
                쓰기배정 2,005자
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1 ml-auto font-medium"
            >
              <RotateCcw className="w-3 h-3" /> 필터 초기화
            </button>
          </div>
        )}
      </div>

      {/* Results Count & Page Navigation Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 px-1">
        <div className="flex items-center gap-2">
          <span>
            총 <strong className="text-slate-800 font-bold">{filteredHanja.length.toLocaleString()}</strong>자의 한자 (
            {totalPages}페이지 중 {currentPage}페이지)
          </span>
        </div>

        {/* Page size & Pagination */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[11px]">페이지당:</span>
            {[36, 72, 144].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPageSize(size)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  pageSize === size ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {size}개
              </button>
            ))}
          </div>

          {/* Quick Pagination buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500"
                title="첫 페이지"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500"
                title="이전 페이지"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-2 text-slate-700 font-bold text-[11px]">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500"
                title="다음 페이지"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 rounded text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500"
                title="마지막 페이지"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hanja Grid / Matrix Display */}
      {filteredHanja.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">검색된 배정한자가 없습니다.</h3>
          <p className="text-xs text-slate-500">검색어나 초성, 부수, 급수 필터 조건을 변경해 보세요.</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-amber-900 text-white rounded-xl text-xs font-bold hover:bg-amber-950 transition"
          >
            전체 한자 보기
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* DENSE MATRIX GRID VIEW (격자형 색인 보기) */
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2.5 sm:gap-3">
            {paginatedHanja.map((item) => {
              const isBookmarked = bookmarkedIds.includes(item.id);
              const isLearned = learnedIds.includes(item.id);

              return (
                <button
                  key={item.id}
                  id={`hanja-grid-tile-${item.id}`}
                  type="button"
                  onClick={() => onSelectHanja(item)}
                  className={`group relative p-2 rounded-xl border text-center transition flex flex-col items-center justify-between hover:shadow-md hover:scale-105 ${
                    isLearned
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : isBookmarked
                      ? 'bg-amber-50/50 border-amber-300'
                      : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/30'
                  }`}
                >
                  <span className="text-[9px] font-semibold text-slate-400 mb-0.5">
                    {item.level === '1급신출' ? '1급' : item.level}
                  </span>
                  <span className="text-2xl font-serif text-slate-900 group-hover:text-amber-900 transition">
                    {item.hanja}
                  </span>
                  <div className="mt-1 w-full truncate">
                    <span className="text-[10px] text-slate-500 block truncate font-medium">
                      {item.meaning}
                    </span>
                    <span className="text-xs font-black text-amber-900">
                      {item.reading}
                    </span>
                  </div>
                  {item.isWritingTarget && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" title="쓰기배정" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* DETAILED CARD VIEW (카드형 상세 보기) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginatedHanja.map((item) => {
            const isBookmarked = bookmarkedIds.includes(item.id);
            const isLearned = learnedIds.includes(item.id);

            return (
              <div
                key={item.id}
                id={`hanja-card-${item.id}`}
                onClick={() => onSelectHanja(item)}
                className={`group relative bg-white rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                  isLearned
                    ? 'border-emerald-200/80 bg-emerald-50/10'
                    : 'border-slate-200 hover:border-amber-300'
                }`}
              >
                {/* Top Badges */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.level === '1급신출'
                          ? 'bg-amber-100 text-amber-950 border border-amber-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.level}
                    </span>
                    {item.isWritingTarget && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        쓰기
                      </span>
                    )}
                  </div>

                  {/* Bookmark & Learn Quick Action */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleLearned(item.id);
                      }}
                      className={`p-1.5 rounded-md hover:bg-slate-100 transition ${
                        isLearned ? 'text-emerald-600' : 'text-slate-300'
                      }`}
                      title={isLearned ? '학습완료 취소' : '학습완료로 표시'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(item.id);
                      }}
                      className={`p-1.5 rounded-md hover:bg-slate-100 transition ${
                        isBookmarked ? 'text-amber-700' : 'text-slate-300'
                      }`}
                      title="북마크"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 fill-amber-100" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Character & Main Reading */}
                <div className="flex items-center gap-4 my-2">
                  <div className="w-16 h-16 rounded-xl bg-amber-50/70 border border-amber-900/15 flex items-center justify-center text-amber-950 font-serif text-3xl font-normal group-hover:scale-105 transition shadow-inner">
                    {item.hanja}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-slate-900 font-serif">
                        {item.meaning}
                      </span>
                      <span className="text-xl font-black text-amber-900">
                        {item.reading}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => playTTS(e, `${item.meaning} ${item.reading}`)}
                        className="text-slate-400 hover:text-amber-800 p-1"
                        title="소리 듣기"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                      <span>부수: <strong>{item.radical}</strong></span>
                      <span>•</span>
                      <span>{item.strokeCount}획</span>
                      <span>•</span>
                      <span>{item.etymologyType}</span>
                    </div>
                  </div>
                </div>

                {/* Sample Word Preview */}
                {item.vocabularies.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-serif font-bold text-slate-900">
                        {item.vocabularies[0].word}
                      </span>
                      <span className="text-amber-800 font-medium">
                        [{item.vocabularies[0].reading}]
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.vocabularies[0].meaning}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            처음
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> 이전
          </button>

          <span className="px-4 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1"
          >
            다음 <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            끝
          </button>
        </div>
      )}

      {/* 214 Radical Selector Modal */}
      <RadicalSelectorModal
        isOpen={isRadicalModalOpen}
        onClose={() => setIsRadicalModalOpen(false)}
        selectedRadical={selectedRadical}
        onSelectRadical={(rad) => setSelectedRadical(rad)}
      />
    </div>
  );
};
