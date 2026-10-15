import React from 'react';
import { Scenario } from '../types';
import { ArrowRight, MessageSquare, Sparkles } from 'lucide-react';

interface ScenarioCardProps {
  scenario: Scenario;
  isSelected: boolean;
  onSelect: (scenario: Scenario) => void;
  bestScore?: number | null;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  isSelected,
  onSelect,
  bestScore
}) => {
  const difficultyConfig = {
    easy: {
      label: 'Dễ',
      icon: '🌱',
      classes: 'text-emerald-300 bg-emerald-950/90 border-emerald-400/40 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
    },
    medium: {
      label: 'Vừa sức',
      icon: '⚡',
      classes: 'text-amber-300 bg-amber-950/90 border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
    },
    hard: {
      label: 'Thử thách',
      icon: '🔥',
      classes: 'text-rose-300 bg-rose-950/90 border-rose-400/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
    }
  }[scenario.difficulty || 'medium'];

  return (
    <div
      id={`scenario-card-${scenario.id}`}
      onClick={() => onSelect(scenario)}
      className={`group cursor-pointer rounded-2xl p-4 sm:p-5 transition-all duration-300 border text-left flex flex-col justify-between backdrop-blur-sm relative overflow-hidden ${
        isSelected
          ? 'bg-gradient-to-b from-[#182a5c]/90 to-[#0d1738]/95 border-cyan-400 shadow-[0_0_25px_rgba(56,189,248,0.3)] ring-2 ring-cyan-400/40'
          : 'bg-[#0c1432]/75 border-sky-500/20 hover:border-sky-400/50 hover:bg-[#121f4a]/80 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]'
      }`}
    >
      {/* Subtle glowing corner highlight if selected */}
      {isSelected && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/15 rounded-full blur-xl pointer-events-none" />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 gap-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-sky-500/30 flex items-center justify-center text-2xl shadow-[0_0_10px_rgba(56,189,248,0.2)] shrink-0">
              <span role="img" aria-label={scenario.title}>
                {scenario.partnerAvatar}
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${difficultyConfig.classes}`}>
              <span>{difficultyConfig.icon}</span>
              <span>{difficultyConfig.label}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {typeof bestScore === 'number' && (
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-400/30 px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.25)] flex items-center gap-1">
                <span>✓</span>
                <span>{bestScore.toFixed(1)}⭐</span>
              </span>
            )}
            <span className="text-[11px] font-medium text-sky-300 bg-sky-950/80 border border-sky-500/30 px-2.5 py-0.5 rounded-full">
              {scenario.category}
            </span>
          </div>
        </div>

        <h3 className="font-semibold text-white text-sm sm:text-base mb-1.5 group-hover:text-cyan-300 transition-colors">
          {scenario.title}
        </h3>

        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
          {scenario.contextDescription}
        </p>

        <div className="bg-[#070d24]/90 rounded-xl p-2.5 border border-sky-500/20 mb-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-sky-400 mb-0.5">
            <MessageSquare className="w-3 h-3" />
            <span>{scenario.partnerName}</span>
          </div>
          <p className="text-xs text-slate-300 italic line-clamp-2">
            "{scenario.initialPrompt}"
          </p>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between pt-2.5 border-t border-sky-500/20 text-xs font-semibold">
        <span className={isSelected ? 'text-cyan-300 flex items-center gap-1' : 'text-slate-400 group-hover:text-cyan-300'}>
          {isSelected ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Đang chọn</span>
            </>
          ) : (
            'Chọn tình huống'
          )}
        </span>
        <ArrowRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-1 ${isSelected ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'}`} />
      </div>
    </div>
  );
};
