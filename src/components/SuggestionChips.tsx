import React, { useState } from 'react';
import { Lightbulb, Sparkles, MessageCircle, HelpCircle, Check, BookOpen } from 'lucide-react';
import { COMMON_RESPONSE_CHIPS, CommonResponseChip } from '../data/scenarios';

interface SuggestionChipsProps {
  scenarioStarters?: string[];
  partnerName: string;
  onSelectChip: (text: string) => void;
}

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  scenarioStarters = [],
  partnerName,
  onSelectChip
}) => {
  const [activeTab, setActiveTab] = useState<'scenario' | 'common'>('scenario');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleChipClick = (text: string, id: string) => {
    onSelectChip(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  return (
    <div className="bg-[#09122f]/90 border border-sky-500/25 rounded-xl p-3 sm:p-3.5 space-y-2.5 shadow-[0_4px_20px_rgba(2,6,23,0.4)]">
      {/* Header with Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-500/20 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_10px_rgba(56,189,248,0.25)]">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Gợi ý mở lời cho em (Suggestion Chips)</span>
              <span className="text-[10px] font-normal text-cyan-400/90 bg-sky-950/80 px-2 py-0.2 rounded-full border border-sky-500/30">
                Bấm để điền nhanh
              </span>
            </span>
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-1 bg-[#060c20] p-0.5 rounded-lg border border-sky-500/30 self-start sm:self-auto text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab('scenario')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'scenario'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                : 'text-sky-300/70 hover:text-white'
            }`}
          >
            <Sparkles className="w-3 h-3 text-cyan-300" />
            <span>Theo tình huống ({scenarioStarters.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('common')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'common'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-[0_0_10px_rgba(56,189,248,0.3)]'
                : 'text-sky-300/70 hover:text-white'
            }`}
          >
            <MessageCircle className="w-3 h-3 text-indigo-300" />
            <span>Mẫu câu thông dụng ({COMMON_RESPONSE_CHIPS.length})</span>
          </button>
        </div>
      </div>

      {/* Chips Container */}
      <div className="space-y-2">
        {activeTab === 'scenario' ? (
          <div>
            <p className="text-[11px] text-sky-200/75 mb-2 flex items-center gap-1">
              <span>💡 Các cách gợi mở phù hợp nhất để em trò chuyện cùng <strong>{partnerName}</strong>:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {scenarioStarters.map((starter, index) => {
                const chipId = `scenario-${index}`;
                const isCopied = copiedId === chipId;

                return (
                  <button
                    key={chipId}
                    type="button"
                    onClick={() => handleChipClick(starter, chipId)}
                    className={`group text-left text-xs px-3 py-2 rounded-xl transition-all cursor-pointer border flex items-start gap-2 shadow-sm ${
                      isCopied
                        ? 'bg-emerald-950/80 border-emerald-400/60 text-emerald-200 ring-2 ring-emerald-400/20'
                        : 'bg-[#0f1b40]/80 hover:bg-[#162758] border-sky-400/25 hover:border-cyan-400/50 text-slate-200 hover:text-white hover:shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0 text-cyan-400 group-hover:scale-110 transition-transform">
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                      )}
                    </span>
                    <span className="leading-snug">
                      "{starter}"
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[11px] text-sky-200/75 mb-2 flex items-center gap-1">
              <span>🗣️ Những cấu trúc câu lịch sự & thông minh thường dùng khi em chưa biết bắt đầu từ đâu:</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {COMMON_RESPONSE_CHIPS.map((chip) => {
                const chipId = `common-${chip.id}`;
                const isCopied = copiedId === chipId;

                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => handleChipClick(chip.text, chipId)}
                    className={`group text-left text-xs p-2.5 rounded-xl transition-all cursor-pointer border flex flex-col justify-between gap-1.5 shadow-sm ${
                      isCopied
                        ? 'bg-emerald-950/80 border-emerald-400/60 text-emerald-200 ring-2 ring-emerald-400/20'
                        : 'bg-[#0f1b40]/80 hover:bg-[#162758] border-sky-400/25 hover:border-cyan-400/50 text-slate-200 hover:text-white hover:shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-semibold text-cyan-300 bg-sky-950/90 border border-sky-400/30 px-2 py-0.5 rounded-md">
                        {chip.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 italic">
                        {chip.englishHint}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="shrink-0 text-cyan-400">
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
                        )}
                      </span>
                      <span className="font-medium text-white group-hover:text-cyan-200 leading-snug">
                        "{chip.label}"
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {copiedId && (
        <div className="text-[11px] text-emerald-300 font-medium flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-lg animate-fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>Đã điền gợi ý vào ô nhập! Em có thể viết tiếp câu chữ theo ý mình nhé.</span>
        </div>
      )}
    </div>
  );
};
