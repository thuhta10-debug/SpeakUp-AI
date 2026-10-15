import React from 'react';
import { AIFeedback, DailyStreakInfo } from '../types';
import { CheckCircle2, Lightbulb, MessageSquare, Sparkles, ArrowRight, RotateCcw, Star, Flame, ShieldAlert, Award } from 'lucide-react';

interface FeedbackCardProps {
  feedback: AIFeedback;
  partnerName: string;
  onContinueChat: (nextPrompt: string) => void;
  onRetry: () => void;
  streak?: DailyStreakInfo;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  partnerName,
  onContinueChat,
  onRetry,
  streak
}) => {
  const getScoreBadgeClass = (level: string) => {
    switch (level) {
      case 'Rất tốt':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.2)]';
      case 'Khá tốt':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(34,211,238,0.2)]';
      default:
        return 'bg-rose-950/80 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
    }
  };

  // Compute total points out of 6
  const totalPoints = feedback.criteria.reduce((sum, c) => {
    return sum + (typeof c.score === 'number' ? c.score : (c.score === 'Rất tốt' || c.level === 'Rất tốt' ? 2 : c.score === 'Khá tốt' || c.level === 'Khá tốt' ? 1 : 0));
  }, 0);

  const friendlyText = feedback.rewrites?.friendly || feedback.shortSuggestion || '';
  const politeConfidentText = feedback.rewrites?.polite_confident || feedback.alternativeSuggestion || '';
  const followUpText = feedback.character_follow_up || feedback.followUpDialogue || '';

  return (
    <div id="ai-feedback-section" className="bg-[#0b1330]/90 backdrop-blur-md rounded-2xl border border-sky-500/30 p-5 sm:p-6 space-y-6 shadow-[0_4px_30px_rgba(2,6,23,0.7)]">
      {/* Daily Streak Celebration Strip */}
      {streak && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-rose-500/15 border border-amber-500/35 rounded-xl p-3 flex items-center justify-between gap-3 text-xs shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.4)] shrink-0">
              <Flame className="w-4 h-4 fill-current animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-amber-200 flex items-center gap-1.5">
                <span>Chuỗi rèn luyện ngày: {streak.currentStreak} ngày liên tiếp!</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.2 rounded border border-emerald-400/30">
                  Đã giữ lửa hôm nay
                </span>
              </span>
              <p className="text-[11px] text-amber-100/70">
                Thói quen kiên trì mỗi ngày giúp kỹ năng giao tiếp của em ngày càng lưu loát và tự nhiên.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 hidden sm:block">
            <span className="text-[10px] text-amber-300/80 font-medium">Kỷ lục chuỗi</span>
            <div className="font-extrabold text-amber-200">{streak.bestStreak} ngày 🔥</div>
          </div>
        </div>
      )}

      {/* Header with Total Score Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-sky-500/20 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base flex items-center gap-2">
              <span>Đánh giá từ SpeakUp AI</span>
              <span className="text-xs text-cyan-400">✦</span>
            </h3>
            <p className="text-xs text-sky-300/80">3 Tiêu chí độc lập: Rõ ràng – Lịch sự – Phù hợp</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-[#081232] border border-cyan-400/30 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-300">Tổng điểm:</span>
            <span className="text-sm font-bold text-cyan-300">{totalPoints}/6 điểm</span>
            <span className="text-[11px] text-slate-400">({((totalPoints / 6) * 10).toFixed(1)}/10)</span>
          </div>
        </div>
      </div>

      {/* 3 Criteria Evaluation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {feedback.criteria.map((item, idx) => {
          const level = item.level || (item.score === 2 ? 'Rất tốt' : item.score === 1 ? 'Khá tốt' : 'Cần chú ý');
          const numericScore = typeof item.score === 'number' ? item.score : (level === 'Rất tốt' ? 2 : level === 'Khá tốt' ? 1 : 0);
          const reasonText = item.reason || item.detail || '';

          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-[#070e26]/85 border border-sky-500/25 flex flex-col justify-between hover:border-sky-400/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/30" />
                    {item.name}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${getScoreBadgeClass(
                      level
                    )}`}
                  >
                    <span>{numericScore}/2 điểm</span>
                    <span>•</span>
                    <span>{level}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{reasonText}</p>
              </div>

              {/* Progress indicator mini bar */}
              <div className="mt-3 pt-2 border-t border-sky-500/15">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      numericScore === 2
                        ? 'bg-emerald-400 w-full'
                        : numericScore === 1
                        ? 'bg-cyan-400 w-1/2'
                        : 'bg-rose-400 w-[15%]'
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="bg-emerald-950/35 border border-emerald-500/35 rounded-xl p-4 shadow-[0_0_15px_rgba(16,185,129,0.08)]">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Điểm em làm tốt (Có căn cứ thực tế)</span>
          </div>
          <p className="text-xs text-emerald-100/90 leading-relaxed">
            {feedback.strengths}
          </p>
        </div>

        {/* Improvements */}
        <div className="bg-amber-950/35 border border-amber-500/35 rounded-xl p-4 shadow-[0_0_15px_rgba(245,158,11,0.08)]">
          <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm mb-1.5">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Điểm em có thể cải thiện</span>
          </div>
          <p className="text-xs text-amber-100/90 leading-relaxed">
            {feedback.improvements}
          </p>
        </div>
      </div>

      {/* Suggestions Section - Two Distinct Rewrites Preserving Student's Legitimate Intent */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider uppercase text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hai mẫu câu đối đáp chuẩn mực cho em</span>
          </span>
          <span className="text-[11px] text-sky-400/80">Giữ trọn vẹn ý định hợp lý của em</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Rewrite 1: Natural & Friendly */}
          <div className="bg-gradient-to-br from-[#101b44] to-[#09102b] border border-cyan-500/35 text-white rounded-xl p-4 shadow-[0_0_15px_rgba(56,189,248,0.12)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1">
                <span>🌱 Cách 1: Tự nhiên, gần gũi & thân thiện</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-cyan-100 font-medium leading-relaxed">
              {friendlyText.startsWith('“') || friendlyText.startsWith('"')
                ? friendlyText
                : `"${friendlyText}"`}
            </p>
          </div>

          {/* Rewrite 2: Clear, Polite & Confident */}
          <div className="bg-gradient-to-br from-[#121c45] to-[#0b1233] border border-indigo-500/35 text-white rounded-xl p-4 shadow-[0_0_15px_rgba(99,102,241,0.12)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
                <span>✨ Cách 2: Rõ ràng, lịch sự & tự tin</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-indigo-100 font-medium leading-relaxed">
              {politeConfidentText.startsWith('“') || politeConfidentText.startsWith('"')
                ? politeConfidentText
                : `"${politeConfidentText}"`}
            </p>
          </div>
        </div>
      </div>

      {/* Follow-up Dialogue line to continue conversation */}
      <div className="bg-[#070e26]/90 border border-sky-500/25 rounded-xl p-4">
        <div className="flex items-center gap-2 text-sky-200 font-semibold text-sm mb-1.5">
          <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Câu phản hồi tiếp theo của {partnerName}</span>
        </div>
        <p className="text-sm text-slate-200 italic mb-4 font-medium">
          "{followUpText}"
        </p>

        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-sky-500/20">
          <button
            id="continue-dialogue-btn"
            onClick={() => onContinueChat(followUpText)}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-sky-500 via-indigo-600 to-blue-600 hover:from-sky-400 hover:to-indigo-500 text-white transition-all duration-200 flex items-center gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.35)] cursor-pointer"
          >
            <span>Tiếp tục trò chuyện với câu này</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            id="retry-response-btn"
            onClick={onRetry}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-[#111c40] hover:bg-[#182859] border border-sky-400/30 text-sky-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Thử trả lời lại câu trước</span>
          </button>
        </div>
      </div>
    </div>
  );
};
