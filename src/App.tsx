import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { PracticeArena } from './components/PracticeArena';
import { SessionHistorySidebar } from './components/SessionHistorySidebar';
import { BenchmarkModal } from './components/BenchmarkModal';
import { StarfieldBackground } from './components/StarfieldBackground';
import { ShieldCheck, Sparkles, Trophy, History } from 'lucide-react';
import { SessionAttempt } from './types';
import { SCENARIOS } from './data/scenarios';
import {
  getStoredHistory,
  saveHistory,
  clearStoredHistory,
  calculateStats,
  calculateScoreFromFeedback
} from './utils/historyStorage';

export default function App() {
  const [history, setHistory] = useState<SessionAttempt[]>(() => getStoredHistory());
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState<boolean>(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const stats = useMemo(() => {
    return calculateStats(history, SCENARIOS.length);
  }, [history]);

  const handleSessionCompleted = (
    attemptData: Omit<SessionAttempt, 'id' | 'timestamp' | 'scoreNumber'> & { scoreNumber?: number }
  ) => {
    const scoreNumber = typeof attemptData.scoreNumber === 'number'
      ? attemptData.scoreNumber
      : calculateScoreFromFeedback(attemptData.feedback, attemptData.studentResponse);
    const newAttempt: SessionAttempt = {
      ...attemptData,
      id: `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      scoreNumber
    };

    setHistory(prev => {
      const updated = [newAttempt, ...prev];
      saveHistory(updated);
      return updated;
    });
  };

  const handleClearHistory = () => {
    clearStoredHistory();
    setHistory([]);
  };

  const handleSelectScenarioToPractice = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-100 overflow-x-hidden">
      {/* Dynamic Galaxy Starfield with Moving Twinkling Stars */}
      <StarfieldBackground />

      {/* Top Header with Progress Badge */}
      <Navbar
        onOpenHistory={() => setIsSidebarOpen(true)}
        onOpenBenchmark={() => setIsBenchmarkOpen(true)}
        stats={stats}
      />

      {/* Main Practice Screen */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <PracticeArena
          history={history}
          stats={stats}
          onSessionCompleted={handleSessionCompleted}
          activeScenarioId={activeScenarioId}
          onOpenHistory={() => setIsSidebarOpen(true)}
        />
      </main>

      {/* Floating Quick Action Button on desktop / tablet for easy access */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="floating-session-history-btn"
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 text-white shadow-[0_4px_25px_rgba(56,189,248,0.4)] hover:shadow-[0_4px_30px_rgba(56,189,248,0.6)] hover:scale-105 transition-all cursor-pointer border border-cyan-300/40"
          title="Xem tiến độ, chuỗi rèn luyện và lịch sử các lượt thực hành"
        >
          <div className="relative">
            <Trophy className="w-5 h-5 text-amber-300" />
            {stats.totalAttempts > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
            )}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>Tiến độ & Lịch sử</span>
              {stats.streak.currentStreak > 0 && (
                <span className="text-[10px] text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.2 rounded border border-amber-400/40 flex items-center gap-0.5">
                  🔥 {stats.streak.currentStreak}
                </span>
              )}
            </span>
            <span className="text-[10px] text-cyan-200/90 font-medium">
              {stats.completedScenariosCount > 0
                ? `${stats.completedScenariosCount}/${stats.totalScenariosCount} bài • ${stats.averageScore.toFixed(1)}⭐`
                : 'Bắt đầu luyện tập!'}
            </span>
          </div>
        </button>
      </div>

      {/* Session History Sidebar Drawer */}
      <SessionHistorySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        history={history}
        stats={stats}
        onClearHistory={handleClearHistory}
        onSelectScenarioToPractice={handleSelectScenarioToPractice}
      />

      {/* Benchmark Test Suite Modal for Judges & Teachers */}
      <BenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
      />

      {/* Educational Pedagogy Footer */}
      <footer className="relative z-10 bg-[#060a1d]/85 backdrop-blur-md border-t border-sky-500/20 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong className="text-white">Nguyên tắc sư phạm:</strong> Đánh giá khách quan theo 3 tiêu chí: Rõ ràng – Lịch sự – Phù hợp. Không đánh giá tính cách học sinh.
            </span>
          </div>

          <div className="text-sky-300/70 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>SpeakUp AI • Galaxy Edition THCS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
