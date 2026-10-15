import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SessionAttempt, SessionStats } from '../types';
import { SCENARIOS } from '../data/scenarios';
import { ScoreProgressChart } from './ScoreProgressChart';
import {
  Trophy,
  History,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  Star,
  Target,
  Heart,
  Scale,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Zap,
  ArrowRight,
  Flame,
  Check
} from 'lucide-react';

interface SessionHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: SessionAttempt[];
  stats: SessionStats;
  onClearHistory: () => void;
  onSelectScenarioToPractice: (scenarioId: string) => void;
}

export const SessionHistorySidebar: React.FC<SessionHistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  stats,
  onClearHistory,
  onSelectScenarioToPractice
}) => {
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'high' | 'review'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const toggleExpand = (id: string) => {
    setExpandedAttemptId(prev => (prev === id ? null : id));
  };

  const filteredHistory = history.filter(item => {
    if (filterMode === 'high') return item.scoreNumber >= 8.5;
    if (filterMode === 'review') return item.scoreNumber < 8.0;
    return true;
  });

  const completionPercent = Math.round(
    (stats.completedScenariosCount / stats.totalScenariosCount) * 100
  );

  const formatRelativeTime = (timestamp: number) => {
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return 'Vừa xong';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  // Badges system for gamification & encouraging continuous practice
  const badges = [
    {
      id: 'starter',
      title: 'Khởi đầu tự tin',
      description: 'Luyện tập tình huống đầu tiên',
      icon: '🚀',
      unlocked: stats.totalAttempts >= 1
    },
    {
      id: 'streak_fire',
      title: 'Giữ lửa hôm nay',
      description: 'Hoàn thành bài tập trong ngày',
      icon: '🔥',
      unlocked: stats.streak?.practicedToday ?? false
    },
    {
      id: 'streak_3',
      title: 'Kiên trì 3 ngày',
      description: 'Đạt chuỗi 3 ngày liên tiếp',
      icon: '⚡',
      unlocked: (stats.streak?.currentStreak >= 3 || stats.streak?.bestStreak >= 3) ?? false
    },
    {
      id: 'streak_7',
      title: 'Kỷ luật vàng 7 ngày',
      description: 'Đạt chuỗi 7 ngày liên tiếp',
      icon: '👑',
      unlocked: (stats.streak?.currentStreak >= 7 || stats.streak?.bestStreak >= 7) ?? false
    },
    {
      id: 'explorer',
      title: 'Khám phá học đường',
      description: 'Hoàn thành 3 tình huống khác nhau',
      icon: '🌟',
      unlocked: stats.completedScenariosCount >= 3
    },
    {
      id: 'polite_master',
      title: 'Lịch thiệp mẫu mực',
      description: 'Đạt điểm Lịch sự trung bình từ 85%',
      icon: '💖',
      unlocked: stats.criteriaAverages.politeness >= 85 && stats.totalAttempts >= 2
    },
    {
      id: 'clarity_pro',
      title: 'Khúc chiết & Rõ ràng',
      description: 'Đạt điểm Rõ ràng trung bình từ 85%',
      icon: '🎯',
      unlocked: stats.criteriaAverages.clarity >= 85 && stats.totalAttempts >= 2
    },
    {
      id: 'champion',
      title: 'Ngôi sao giao tiếp',
      description: 'Đạt điểm trung bình từ 9.0 trở lên',
      icon: '🏆',
      unlocked: stats.averageScore >= 9.0 && stats.totalAttempts >= 3
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <aside
        className="relative z-10 w-full max-w-md sm:max-w-lg bg-[#08102d] text-slate-100 h-full flex flex-col border-l border-sky-500/30 shadow-[0_0_50px_rgba(2,6,23,0.9)] overflow-hidden"
        aria-label="Lịch sử thực hành và tiến độ"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#101b44] via-[#0d1637] to-[#070e28] border-b border-sky-500/25 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Tiến độ & Lịch sử</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 rounded-full border border-cyan-400/30">
                  {history.length} lượt
                </span>
              </h2>
              <p className="text-[11px] text-sky-300/80">Theo dõi tiến bộ giao tiếp học đường của em</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="p-2 text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                title="Xóa toàn bộ lịch sử luyện tập"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-sky-500/15 rounded-lg transition-colors cursor-pointer"
              title="Đóng bảng lịch sử"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clear Confirmation Banner */}
        {showClearConfirm && (
          <div className="p-3 bg-rose-950/90 border-b border-rose-500/40 text-rose-200 text-xs flex items-center justify-between gap-3 shrink-0">
            <span>Em có chắc muốn đặt lại toàn bộ lịch sử điểm số không?</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium cursor-pointer"
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 scrollbar-thin">
          {/* Daily Streak Card */}
          <div className="bg-gradient-to-br from-[#1d163a] via-[#161230] to-[#0a0f28] border border-amber-500/35 rounded-2xl p-4 sm:p-4.5 shadow-[0_4px_25px_rgba(245,158,11,0.15)] space-y-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between gap-2 relative z-10">
              <span className="text-xs font-semibold text-amber-300 tracking-wide uppercase flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Chuỗi rèn luyện (Daily Streak)</span>
              </span>

              <span className="text-[11px] text-amber-200/90 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Kỷ lục: {stats.streak?.bestStreak || 0} ngày
              </span>
            </div>

            {/* Big Flame & Counter */}
            <div className="flex items-center justify-between gap-3 bg-[#0a0f26]/90 border border-amber-500/20 rounded-xl p-3 relative z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    (stats.streak?.currentStreak || 0) > 0
                      ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  <Flame
                    className={`w-6 h-6 ${
                      (stats.streak?.currentStreak || 0) > 0 ? 'fill-current animate-pulse' : ''
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {stats.streak?.currentStreak || 0}
                    </span>
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      ngày liên tiếp
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {stats.streak?.practicedToday
                      ? '🔥 Đã giữ lửa hôm nay! Ngọn lửa rèn luyện đang bừng sáng.'
                      : (stats.streak?.currentStreak || 0) > 0
                      ? '⚡ Hôm nay chưa luyện! Hãy hoàn thành 1 bài để giữ chuỗi.'
                      : '🌱 Hoàn thành 1 tình huống hôm nay để thắp sáng ngọn lửa chuỗi.'}
                  </p>
                </div>
              </div>
            </div>

            {/* 7-Day Mini Calendar Strip */}
            <div className="space-y-1.5 relative z-10 pt-1 border-t border-amber-500/20">
              <div className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hành trình 7 ngày gần nhất:</span>
                </span>
                <span className="text-[10px] text-amber-300 font-semibold">
                  {stats.streak?.practicedToday ? '✓ Đã luyện hôm nay' : 'Chờ luyện hôm nay'}
                </span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 pt-1">
                {stats.streak?.recentWeekDays.map((day, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all text-center ${
                      day.completed
                        ? 'bg-gradient-to-b from-amber-500/25 to-orange-500/20 border-amber-400/50 shadow-[0_0_8px_rgba(245,158,11,0.25)] text-amber-200'
                        : day.isToday
                        ? 'bg-amber-950/40 border-amber-400/60 border-dashed text-amber-300 animate-pulse'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px] font-bold">{day.dayName}</span>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center mt-1 text-[11px]">
                      {day.completed ? (
                        <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      ) : day.isToday ? (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      )}
                    </div>
                    <span className="text-[8px] text-slate-400 mt-0.5">
                      {day.isToday ? 'Hôm nay' : day.date.slice(8)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progress & Overall Score Card */}
          <div className="bg-gradient-to-br from-[#101b44] via-[#0d1637] to-[#080f2b] border border-sky-500/35 rounded-2xl p-4 sm:p-4.5 shadow-[0_4px_25px_rgba(2,6,23,0.5)] space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between gap-2 relative z-10">
              <span className="text-xs font-semibold text-cyan-300 tracking-wide uppercase flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>Bảng vàng rèn luyện</span>
              </span>

              <span className="text-[11px] text-sky-300/80 bg-sky-950/80 px-2.5 py-0.5 rounded-full border border-sky-400/30">
                {stats.completedScenariosCount}/{stats.totalScenariosCount} Tình huống
              </span>
            </div>

            {/* Score & Completion Grid */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
              {/* Overall Score */}
              <div className="bg-[#070e28]/90 border border-sky-500/25 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Điểm trung bình</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {stats.averageScore > 0 ? stats.averageScore.toFixed(1) : '--'}
                  </span>
                  <span className="text-xs text-sky-400 font-semibold">/10</span>
                </div>
                <div className="mt-1.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                    stats.averageScore >= 8.5
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : stats.averageScore >= 7.0
                      ? 'bg-sky-500/20 text-cyan-300 border border-cyan-400/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  }`}>
                    {stats.averageScore >= 8.5
                      ? '🌟 Xuất sắc'
                      : stats.averageScore >= 7.0
                      ? '✨ Khá giỏi'
                      : stats.totalAttempts > 0
                      ? '🌱 Cần rèn thêm'
                      : 'Chưa có điểm'}
                  </span>
                </div>
              </div>

              {/* Completion Rate */}
              <div className="bg-[#070e28]/90 border border-sky-500/25 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Độ phủ tình huống</span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-cyan-300">
                    {completionPercent}%
                  </span>
                </div>
                <div className="mt-1.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, completionPercent)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* 3 Pedagogical Criteria Progress Bars */}
            <div className="space-y-2 pt-1 border-t border-sky-500/20 relative z-10">
              <span className="text-[11px] font-medium text-slate-300 flex items-center justify-between">
                <span>Chỉ số 3 tiêu chí cốt lõi:</span>
                <span className="text-[10px] text-cyan-400/90">Dựa trên {stats.totalAttempts} lượt trả lời</span>
              </span>

              <div className="space-y-1.5 text-xs">
                {/* Clarity */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <span className="text-sky-200 flex items-center gap-1">
                      <Target className="w-3 h-3 text-cyan-400" />
                      <span>Rõ ràng</span>
                    </span>
                    <span className="font-semibold text-cyan-300">
                      {stats.criteriaAverages.clarity}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.criteriaAverages.clarity}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                    />
                  </div>
                </div>

                {/* Politeness */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <span className="text-sky-200 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-pink-400" />
                      <span>Lịch sự</span>
                    </span>
                    <span className="font-semibold text-pink-300">
                      {stats.criteriaAverages.politeness}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-pink-500 to-indigo-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.criteriaAverages.politeness}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                </div>

                {/* Appropriateness */}
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <span className="text-sky-200 flex items-center gap-1">
                      <Scale className="w-3 h-3 text-indigo-400" />
                      <span>Phù hợp</span>
                    </span>
                    <span className="font-semibold text-indigo-300">
                      {stats.criteriaAverages.appropriateness}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.criteriaAverages.appropriateness}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Badges Row */}
            <div className="pt-2 border-t border-sky-500/20 relative z-10">
              <span className="text-[11px] font-medium text-slate-300 mb-2 block">
                Huy hiệu đạt được:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {badges.map(b => (
                  <div
                    key={b.id}
                    title={`${b.title}: ${b.description} (${b.unlocked ? 'Đã mở khóa' : 'Chưa đạt'})`}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-center ${
                      b.unlocked
                        ? 'bg-sky-500/15 border-cyan-400/50 shadow-[0_0_10px_rgba(56,189,248,0.25)]'
                        : 'bg-slate-900/50 border-slate-800 opacity-40 grayscale'
                    }`}
                  >
                    <span className="text-xl">{b.icon}</span>
                    <span className="text-[10px] font-semibold mt-1 text-slate-200 line-clamp-1 w-full">
                      {b.title}
                    </span>
                    <span className="text-[8px] text-slate-400 mt-0.5 line-clamp-1 w-full">
                      {b.unlocked ? '✓ Đạt' : 'Chưa đạt'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Score Improvement Line Chart */}
          <ScoreProgressChart
            history={history}
            onSelectAttempt={(id) => setExpandedAttemptId(id)}
          />

          {/* History List Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-cyan-400" />
                <span>Nhật ký câu trả lời ({history.length})</span>
              </span>

              {/* Filter tabs */}
              {history.length > 0 && (
                <div className="flex items-center gap-1 bg-[#060c20] p-0.5 rounded-lg border border-sky-500/30 text-[10px]">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                      filterMode === 'all'
                        ? 'bg-sky-500/30 text-cyan-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setFilterMode('high')}
                    className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                      filterMode === 'high'
                        ? 'bg-sky-500/30 text-cyan-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Điểm cao
                  </button>
                  <button
                    onClick={() => setFilterMode('review')}
                    className={`px-2 py-0.5 rounded font-medium cursor-pointer ${
                      filterMode === 'review'
                        ? 'bg-sky-500/30 text-cyan-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cần rèn thêm
                  </button>
                </div>
              )}
            </div>

            {/* List or Empty State */}
            {history.length === 0 ? (
              <div className="bg-[#070e28]/70 border border-sky-500/20 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-400/20 text-cyan-400 flex items-center justify-center mx-auto text-xl shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Chưa có lượt thực hành nào</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Em hãy chọn một tình huống giao tiếp, nhập câu trả lời và bấm gửi. SpeakUp AI sẽ phân tích và lưu lại quá trình tiến bộ của em tại đây!
                  </p>
                </div>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="bg-[#070e28]/70 border border-sky-500/20 rounded-xl p-4 text-center text-xs text-slate-400">
                Không có lượt luyện tập nào phù hợp với bộ lọc đã chọn.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredHistory.map((item) => {
                  const isExpanded = expandedAttemptId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="bg-[#0a1334]/90 border border-sky-500/25 hover:border-cyan-400/40 rounded-xl overflow-hidden transition-all shadow-sm"
                    >
                      {/* Card Summary Line */}
                      <div
                        onClick={() => toggleExpand(item.id)}
                        className="p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-sky-500/5 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{item.partnerAvatar}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-white truncate">
                                {item.scenarioTitle}
                              </h4>
                              {item.difficulty && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                                  item.difficulty === 'easy'
                                    ? 'text-emerald-300 bg-emerald-950/80 border-emerald-400/30'
                                    : item.difficulty === 'medium'
                                    ? 'text-amber-300 bg-amber-950/80 border-amber-400/30'
                                    : 'text-rose-300 bg-rose-950/80 border-rose-400/30'
                                }`}>
                                  {item.difficulty === 'easy' ? '🌱 Dễ' : item.difficulty === 'medium' ? '⚡ Vừa sức' : '🔥 Thử thách'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                              <span className="text-cyan-300 font-medium">
                                Với {item.partnerName}
                              </span>
                              <span>•</span>
                              <span>{formatRelativeTime(item.timestamp)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                            item.scoreNumber >= 8.5
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                              : item.scoreNumber >= 7.0
                              ? 'bg-sky-500/20 text-cyan-300 border border-cyan-400/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                          }`}>
                            <Star className="w-3 h-3 fill-current" />
                            <span>{item.scoreNumber.toFixed(1)}</span>
                          </div>

                          <div className="text-slate-400">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="p-3 sm:p-3.5 bg-[#060c22] border-t border-sky-500/20 space-y-3 text-xs animate-fade-in">
                          {/* Student Answer */}
                          <div>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                              Câu trả lời của em:
                            </span>
                            <div className="p-2.5 rounded-lg bg-[#0e1940] border border-sky-400/20 text-sky-100 italic leading-relaxed">
                              "{item.studentResponse}"
                            </div>
                          </div>

                          {/* Criteria Rating Badges */}
                          <div className="grid grid-cols-3 gap-1.5">
                            {item.feedback.criteria.map((c, i) => (
                              <div
                                key={i}
                                className="p-1.5 rounded-lg bg-[#0a1438] border border-sky-500/20 text-center"
                              >
                                <span className="text-[10px] text-slate-400 block truncate">
                                  {c.name}
                                </span>
                                <span className={`text-[10px] font-bold ${
                                  c.score === 'Rất tốt'
                                    ? 'text-emerald-300'
                                    : c.score === 'Khá tốt'
                                    ? 'text-cyan-300'
                                    : 'text-amber-300'
                                }`}>
                                  {c.score}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Strengths & Improvements summary */}
                          <div className="space-y-1.5 text-[11px] leading-relaxed">
                            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
                              <strong>Điểm tốt:</strong> {item.feedback.strengths}
                            </div>
                            {item.feedback.improvements && (
                              <div className="p-2 rounded-lg bg-sky-950/40 border border-sky-500/30 text-sky-200">
                                <strong>Gợi ý cải thiện:</strong> {item.feedback.improvements}
                              </div>
                            )}
                          </div>

                          {/* Action button to practice again */}
                          <button
                            type="button"
                            onClick={() => {
                              onSelectScenarioToPractice(item.scenarioId);
                              onClose();
                            }}
                            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(56,189,248,0.3)] transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Luyện tập lại kịch bản này</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#060b20] border-t border-sky-500/20 text-center text-[10px] text-slate-400 shrink-0">
          Điểm số được lưu tự động trên trình duyệt để em theo dõi sự tiến bộ liên tục.
        </div>
      </aside>
    </div>
  );
};
