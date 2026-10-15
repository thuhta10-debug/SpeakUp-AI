import React from 'react';
import { MessageSquareQuote, Sparkles, Star, Trophy, History, Flame, Check, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SessionStats } from '../types';

interface NavbarProps {
  onOpenHistory?: () => void;
  onOpenBenchmark?: () => void;
  stats?: SessionStats;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenHistory,
  onOpenBenchmark,
  stats
}) => {
  const hasHistory = stats && stats.totalAttempts > 0;
  const streak = stats?.streak ?? {
    currentStreak: 0,
    bestStreak: 0,
    practicedToday: false,
    activeDates: [],
    recentWeekDays: []
  };

  const completedCount = stats?.completedScenariosCount ?? 0;
  const totalCount = stats?.totalScenariosCount || 14;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header className="bg-[#0a1128]/85 backdrop-blur-md border-b border-sky-500/20 sticky top-0 z-30 shadow-[0_4px_25px_rgba(2,6,23,0.5)] relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 absolute -top-1 -right-1 animate-pulse" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
                SpeakUp AI
              </span>
              <span className="text-[11px] font-semibold bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-cyan-300 px-2 py-0.5 rounded-md border border-cyan-400/30">
                Galaxy THCS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal">Trợ lý AI luyện kỹ năng giao tiếp tình huống</p>
          </div>
        </div>

        {/* Right side: 3 Criteria Badge, Progress Bar, Streak Counter & Session History Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-sky-200 bg-[#121e42]/70 border border-sky-400/30 px-3 py-1.5 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.15)] backdrop-blur-xs">
            <Star className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/40" />
            <span>3 Tiêu chí: <strong className="text-white">Rõ ràng</strong> • <strong className="text-white">Lịch sự</strong> • <strong className="text-white">Phù hợp</strong></span>
          </div>

          {/* Dedicated Animated Progress Bar in Navbar */}
          {onOpenHistory && (
            <motion.button
              id="navbar-progress-bar-widget"
              type="button"
              onClick={onOpenHistory}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-sky-500/30 bg-[#0c1538]/75 hover:bg-[#121f4c]/85 transition-colors cursor-pointer text-xs shadow-xs"
              title={`Tiến độ hoàn thành: ${completedCount}/${totalCount} tình huống (${completionPercent}%). Bấm để xem chi tiết`}
            >
              <div className="flex items-center gap-1.5 text-sky-200">
                <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-semibold text-white">{completedCount}/{totalCount}</span>
              </div>

              {/* Visual Animated Track & Fill */}
              <div className="w-16 lg:w-24 h-2 bg-slate-800/90 rounded-full overflow-hidden p-[1px] border border-sky-500/20 relative">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 shadow-[0_0_8px_rgba(56,189,248,0.7)] relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(completionPercent, completedCount > 0 ? 6 : 0))}%` }}
                  transition={{ type: 'spring', stiffness: 90, damping: 15 }}
                >
                  {/* Subtle moving shimmer highlight */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-8"
                    animate={{ x: ['-100%', '300%'] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: 'linear' }}
                  />
                </motion.div>
              </div>

              <AnimatePresence mode="popLayout">
                <motion.span
                  key={completionPercent}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="text-[10px] font-bold text-cyan-300"
                >
                  {completionPercent}%
                </motion.span>
              </AnimatePresence>
            </motion.button>
          )}

          {/* Daily Streak Counter with Subtle Framer Motion Animations */}
          <motion.button
            id="navbar-streak-counter-btn"
            type="button"
            onClick={onOpenHistory}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer relative overflow-hidden ${
              streak.currentStreak > 0
                ? streak.practicedToday
                  ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-rose-500/20 border-amber-400/50 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:border-amber-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:border-amber-400 shadow-xs'
                : 'bg-[#0b1433]/70 border-slate-700/60 text-slate-400 hover:text-amber-300 hover:border-amber-500/30'
            }`}
            title={
              streak.currentStreak > 0
                ? streak.practicedToday
                  ? `Chuỗi ${streak.currentStreak} ngày liên tiếp! Hôm nay em đã hoàn thành bài tập.`
                  : `Chuỗi ${streak.currentStreak} ngày! Luyện tập hôm nay để giữ chuỗi.`
                : 'Chuỗi 0 ngày. Luyện tập ngay để thắp sáng ngọn lửa rèn luyện!'
            }
          >
            {/* Subtle ambient warm glow backdrop when streak is active */}
            {streak.currentStreak > 0 && (
              <motion.div
                className="absolute inset-0 bg-amber-500/10 pointer-events-none"
                animate={{ opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            <div className="relative flex items-center justify-center">
              {/* Radial flame aura pulse */}
              {streak.currentStreak > 0 && (
                <motion.div
                  className="absolute -inset-1 rounded-full bg-amber-400/25 blur-xs pointer-events-none"
                  animate={{
                    scale: [0.85, 1.25, 0.85],
                    opacity: [0.3, 0.75, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              )}

              {/* Animated Flame Icon */}
              <motion.div
                animate={
                  streak.currentStreak > 0
                    ? {
                        scale: [1, 1.15, 0.98, 1.18, 1],
                        rotate: [0, -4, 3, -3, 0],
                        y: [0, -1, 0, -1.2, 0]
                      }
                    : { scale: 1 }
                }
                transition={
                  streak.currentStreak > 0
                    ? {
                        duration: 2.2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }
                    : undefined
                }
              >
                <Flame
                  className={`w-4 h-4 ${
                    streak.currentStreak > 0
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                      : 'text-slate-500'
                  }`}
                />
              </motion.div>

              {/* Active check indicator for today */}
              {streak.practicedToday && streak.currentStreak > 0 && (
                <motion.span
                  className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-[#0a1128]"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>

            {/* Streak Number with Animated Spring Pop */}
            <AnimatePresence mode="popLayout">
              <motion.span
                key={streak.currentStreak}
                initial={{ y: -8, opacity: 0, scale: 0.7 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 8, opacity: 0, scale: 0.7 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className={streak.currentStreak > 0 ? 'text-amber-300 font-bold' : 'text-slate-300'}
              >
                {streak.currentStreak}
              </motion.span>
            </AnimatePresence>

            <span className="text-[11px] font-medium hidden sm:inline text-amber-200/90">
              ngày
            </span>

            {/* Animated Status Tag */}
            {streak.currentStreak > 0 && !streak.practicedToday && (
              <motion.span
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="text-[9px] font-semibold bg-amber-500/25 text-amber-300 px-1 py-0.5 rounded border border-amber-400/30 hidden md:inline"
              >
                Giữ lửa
              </motion.span>
            )}

            {streak.currentStreak > 0 && streak.practicedToday && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-400/30 hidden md:inline flex items-center gap-0.5"
              >
                <Check className="w-2.5 h-2.5" />
                <span>Đã giữ</span>
              </motion.span>
            )}
          </motion.button>

          {/* Benchmark Test Suite Button for Teachers / Judges */}
          {onOpenBenchmark && (
            <motion.button
              id="open-benchmark-modal-btn"
              type="button"
              onClick={onOpenBenchmark}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-400/40 bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-blue-500/20 hover:border-cyan-300 text-cyan-200 hover:text-white transition-all text-xs font-semibold cursor-pointer shadow-xs"
              title="Bộ kiểm thử Sư phạm 20 câu (Dành cho Ban giám khảo & Chuyên gia)"
            >
              <FileCheck className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">Bộ kiểm thử (20 câu)</span>
              <span className="sm:hidden">Kiểm thử</span>
            </motion.button>
          )}

          {/* Session History & Progress Button */}
          {onOpenHistory && (
            <motion.button
              id="open-session-history-btn"
              type="button"
              onClick={onOpenHistory}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                hasHistory
                  ? 'bg-gradient-to-r from-[#142352] to-[#0c1639] hover:from-[#1b2f6e] hover:to-[#12204f] border-cyan-400/50 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                  : 'bg-[#0e1738]/80 hover:bg-[#162452] border-sky-500/30 text-sky-200 hover:text-white'
              }`}
              title="Mở nhật ký luyện tập và bảng điểm tổng thể"
            >
              <div className="relative">
                <Trophy className="w-4 h-4 text-amber-400" />
                {hasHistory && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
                )}
              </div>
              <span className="hidden sm:inline">Tiến độ & Lịch sử</span>
              {hasHistory ? (
                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                  <span>{stats.completedScenariosCount}/{stats.totalScenariosCount}</span>
                  <span>•</span>
                  <span>{stats.averageScore.toFixed(1)}⭐</span>
                </span>
              ) : (
                <span className="text-[10px] text-sky-400 font-semibold bg-sky-950/80 px-1.5 py-0.5 rounded-md border border-sky-500/30">
                  0/14
                </span>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Subtle Bottom Edge Progress Bar across Navbar with Framer Motion */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-900/60 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500 shadow-[0_0_10px_rgba(56,189,248,0.85)] relative"
          initial={{ width: 0 }}
          animate={{
            width: `${Math.min(100, Math.max(completionPercent, completedCount > 0 ? 4 : 0))}%`
          }}
          transition={{ type: 'spring', stiffness: 85, damping: 16 }}
        >
          {/* Shimmer sweep effect along the edge */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent w-24"
            animate={{ x: ['-100%', '600%'] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </header>
  );
};

