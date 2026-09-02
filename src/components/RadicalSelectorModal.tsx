import React, { useState, useMemo } from 'react';
import { KANGXI_RADICALS, RadicalInfo } from '../data/radicalsData';
import { X, Search, Layers, Sparkles } from 'lucide-react';

interface RadicalSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRadical: (radical: string) => void;
  selectedRadical: string;
}

export const RadicalSelectorModal: React.FC<RadicalSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectRadical,
  selectedRadical,
}) => {
  const [search, setSearch] = useState('');
  const [selectedStroke, setSelectedStroke] = useState<number | 'all'>('all');

  const filteredRadicals = useMemo(() => {
    return KANGXI_RADICALS.filter((r) => {
      if (selectedStroke !== 'all' && r.strokes !== selectedStroke) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          r.radical.includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.meaning.toLowerCase().includes(q) ||
          r.num.toString() === q
        );
      }
      return true;
    });
  }, [search, selectedStroke]);

  // Group by strokes
  const strokeGroups = useMemo(() => {
    const groups: { [key: number]: RadicalInfo[] } = {};
    for (let i = 1; i <= 17; i++) {
      groups[i] = KANGXI_RADICALS.filter((r) => r.strokes === i);
    }
    return groups;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5 text-amber-900" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                강희자전 214 부수(部首) 색인기
              </h2>
              <p className="text-xs text-slate-500">
                부수를 선택하면 해당 부수로 등록된 배정한자를 즉시 검색합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Stroke Filters */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="부수 한자, 부수 이름(예: 삼수변, 마음심, 鬯, 頁) 검색"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-800"
            />
          </div>

          {/* Stroke Selector Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedStroke('all')}
              className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition ${
                selectedStroke === 'all'
                  ? 'bg-amber-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              전체 (214)
            </button>
            {Array.from({ length: 17 }, (_, i) => i + 1).map((stroke) => (
              <button
                key={stroke}
                type="button"
                onClick={() => setSelectedStroke(stroke)}
                className={`px-2 py-1 rounded-lg font-medium shrink-0 transition ${
                  selectedStroke === stroke
                    ? 'bg-amber-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {stroke}획 ({strokeGroups[stroke]?.length || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Radical Grid */}
        <div className="p-4 overflow-y-auto flex-1 max-h-[55vh]">
          {selectedRadical && (
            <div className="mb-4 p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs text-amber-950">
              <span>
                현재 선택된 부수 필터: <strong className="font-serif font-bold text-sm">{selectedRadical}</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  onSelectRadical('');
                  onClose();
                }}
                className="text-amber-800 hover:underline font-bold"
              >
                부수 필터 해제
              </button>
            </div>
          )}

          {filteredRadicals.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              검색된 부수가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {filteredRadicals.map((rad) => {
                const isSelected = selectedRadical === rad.radical;
                return (
                  <button
                    key={rad.num}
                    type="button"
                    onClick={() => {
                      onSelectRadical(rad.radical);
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 group ${
                      isSelected
                        ? 'bg-amber-900 text-white border-amber-950 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-serif text-xl font-normal shrink-0 ${
                        isSelected
                          ? 'bg-amber-800 text-amber-100'
                          : 'bg-slate-100 text-slate-900 group-hover:bg-amber-100 group-hover:text-amber-950'
                      }`}
                    >
                      {rad.radical}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between">
                        <span
                          className={`text-xs font-bold truncate ${
                            isSelected ? 'text-white' : 'text-slate-800'
                          }`}
                        >
                          {rad.name}
                        </span>
                        <span
                          className={`text-[10px] ml-1 shrink-0 ${
                            isSelected ? 'text-amber-200' : 'text-slate-400'
                          }`}
                        >
                          {rad.strokes}획
                        </span>
                      </div>
                      <p
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-amber-100/80' : 'text-slate-500'
                        }`}
                      >
                        {rad.meaning}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>한국어문회 1급 기준 214개 전 부수 수록</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
