import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Scenario, AIFeedback, ChatMessage, SessionAttempt, SessionStats } from '../types';
import { SCENARIOS, SCENARIO_CATEGORIES, DIFFICULTY_LEVELS } from '../data/scenarios';
import { evaluateResponse } from '../data/evaluator';
import { ScenarioCard } from './ScenarioCard';
import { FeedbackCard } from './FeedbackCard';
import { SuggestionChips } from './SuggestionChips';
import { LiveAIChatRoom } from './LiveAIChatRoom';
import { Send, Sparkles, RefreshCw, Info, MessageSquare, Compass, CheckCircle2, Trash2, Trophy, ArrowRight, Flame, Bot, Layers, RotateCcw } from 'lucide-react';

interface PracticeArenaProps {
  history?: SessionAttempt[];
  stats?: SessionStats;
  onSessionCompleted?: (attempt: Omit<SessionAttempt, 'id' | 'timestamp' | 'scoreNumber'>) => void;
  activeScenarioId?: string | null;
  onOpenHistory?: () => void;
}

export const PracticeArena: React.FC<PracticeArenaProps> = ({
  history = [],
  stats,
  onSessionCompleted,
  activeScenarioId,
  onOpenHistory
}) => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeDifficulty, setActiveDifficulty] = useState<string>('all');
  const [interactionMode, setInteractionMode] = useState<'chat' | 'rubric'>('chat');
  const [currentPrompt, setCurrentPrompt] = useState<string>(SCENARIOS[0].initialPrompt);
  const [studentResponse, setStudentResponse] = useState<string>('');
  const [submittedResponse, setSubmittedResponse] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentFeedback, setCurrentFeedback] = useState<AIFeedback | null>(null);
  const [dialogueHistory, setDialogueHistory] = useState<ChatMessage[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync with activeScenarioId selected from Sidebar
  useEffect(() => {
    if (activeScenarioId) {
      const found = SCENARIOS.find(s => s.id === activeScenarioId);
      if (found && found.id !== selectedScenario.id) {
        handleSelectScenario(found);
        setTimeout(() => {
          const workspace = document.getElementById('practice-workspace-section');
          if (workspace) {
            workspace.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [activeScenarioId]);

  // Compute highest score achieved for each scenario
  const scenarioBestScores = useMemo(() => {
    const map: Record<string, number> = {};
    history.forEach(item => {
      if (item.scenarioId) {
        if (!map[item.scenarioId] || item.scoreNumber > map[item.scenarioId]) {
          map[item.scenarioId] = item.scoreNumber;
        }
      }
    });
    return map;
  }, [history]);

  const uniqueCompletedCount = Object.keys(scenarioBestScores).length;

  const filteredScenarios = useMemo(() => {
    return SCENARIOS.filter(s => {
      const matchCategory = activeCategory === 'all' || s.categoryTag === activeCategory;
      const matchDifficulty = activeDifficulty === 'all' || s.difficulty === activeDifficulty;
      return matchCategory && matchDifficulty;
    });
  }, [activeCategory, activeDifficulty]);

  const handleSelectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCurrentPrompt(scenario.initialPrompt);
    setStudentResponse('');
    setSubmittedResponse('');
    setCurrentFeedback(null);
    setDialogueHistory([]);
    setErrorMsg(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!studentResponse.trim()) {
      setErrorMsg('Em hãy nhập câu trả lời của mình trước khi gửi nhé!');
      return;
    }

    setErrorMsg(null);
    setIsAnalyzing(true);
    const responseToSend = studentResponse.trim();

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: selectedScenario.title,
          partnerName: selectedScenario.partnerName,
          partnerRole: selectedScenario.partnerRole,
          contextDescription: selectedScenario.contextDescription,
          contextPrompt: currentPrompt,
          studentResponse: responseToSend,
          dialogueHistory: dialogueHistory.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (!res.ok) {
        throw new Error('API server returned error status: ' + res.status);
      }

      const feedbackData: AIFeedback = await res.json();
      setSubmittedResponse(responseToSend);
      setCurrentFeedback(feedbackData);

      // Record session completion
      if (onSessionCompleted) {
        onSessionCompleted({
          scenarioId: selectedScenario.id,
          scenarioTitle: selectedScenario.title,
          category: selectedScenario.category,
          categoryTag: selectedScenario.categoryTag,
          difficulty: selectedScenario.difficulty,
          partnerName: selectedScenario.partnerName,
          partnerAvatar: selectedScenario.partnerAvatar,
          studentResponse: responseToSend,
          feedback: feedbackData
        });
      }
    } catch (err) {
      console.warn('Analysis via server endpoint failed, activating fallback evaluator:', err);
      try {
        const fallbackData = evaluateResponse(
          selectedScenario.title,
          selectedScenario.partnerName,
          responseToSend,
          selectedScenario.id
        );
        setSubmittedResponse(responseToSend);
        setCurrentFeedback(fallbackData);

        // Record session completion with fallback evaluator
        if (onSessionCompleted) {
          onSessionCompleted({
            scenarioId: selectedScenario.id,
            scenarioTitle: selectedScenario.title,
            category: selectedScenario.category,
            categoryTag: selectedScenario.categoryTag,
            difficulty: selectedScenario.difficulty,
            partnerName: selectedScenario.partnerName,
            partnerAvatar: selectedScenario.partnerAvatar,
            studentResponse: responseToSend,
            feedback: fallbackData
          });
        }
      } catch (fallbackErr) {
        console.error('Fallback error:', fallbackErr);
        setErrorMsg('Đã có lỗi xảy ra, em hãy thử bấm gửi lại nhé.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContinueChat = (nextPrompt: string) => {
    // Append the exchange to dialogueHistory
    setDialogueHistory(prev => [
      ...prev,
      {
        sender: 'partner',
        text: currentPrompt
      },
      {
        sender: 'student',
        text: submittedResponse,
        feedback: currentFeedback || undefined
      }
    ]);

    setCurrentPrompt(nextPrompt);
    setStudentResponse('');
    setSubmittedResponse('');
    setCurrentFeedback(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleRetry = () => {
    setCurrentFeedback(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSelectChip = (chipText: string) => {
    setStudentResponse(prev => {
      if (!prev.trim()) {
        return chipText;
      }
      const separator = prev.endsWith(' ') || prev.endsWith('\n') ? '' : ' ';
      return `${prev}${separator}${chipText}`;
    });
    setErrorMsg(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleResetScenario = () => {
    setCurrentPrompt(selectedScenario.initialPrompt);
    setStudentResponse('');
    setSubmittedResponse('');
    setCurrentFeedback(null);
    setDialogueHistory([]);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-8">
      {/* Motivational Continuous Practice Progress Banner */}
      {(uniqueCompletedCount > 0 || (stats && stats.streak.currentStreak > 0)) && (
        <div className="bg-gradient-to-r from-[#0d1b46]/90 via-[#0a1537]/90 to-[#070e28]/90 border border-cyan-400/30 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
              stats && stats.streak.currentStreak > 0
                ? 'bg-gradient-to-br from-amber-500 to-rose-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
            }`}>
              {stats && stats.streak.currentStreak > 0 ? (
                <Flame className="w-5 h-5 fill-current animate-pulse" />
              ) : (
                <Trophy className="w-5 h-5 text-amber-100" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-white">
                  Đã hoàn thành {uniqueCompletedCount}/{SCENARIOS.length} tình huống ({Math.round((uniqueCompletedCount / SCENARIOS.length) * 100)}%)
                </span>
                {stats && stats.streak.currentStreak > 0 && (
                  <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                    <Flame className="w-3 h-3 fill-current" />
                    <span>Chuỗi {stats.streak.currentStreak} ngày</span>
                  </span>
                )}
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {stats?.streak.practicedToday ? 'Đã giữ lửa hôm nay' : 'Đang tiến bộ tốt'}
                </span>
              </div>
              <p className="text-[11px] text-sky-300/80 mt-0.5">
                {stats?.streak.practicedToday
                  ? 'Tuyệt vời! Em đã luyện tập hôm nay và duy trì chuỗi rèn luyện đều đặn!'
                  : 'Rèn luyện đều đặn mỗi ngày để duy trì chuỗi và tích lũy phản xạ giao tiếp tự tin!'}
              </p>
            </div>
          </div>

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-cyan-300 border border-cyan-400/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm"
            >
              <span>Xem lịch sử & điểm số</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 1. Kho tình huống phong phú & Bộ lọc Cấp độ (Comfort Zone) */}
      <section className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>Chọn tình huống giao tiếp học đường ({SCENARIOS.length} tình huống)</span>
            </h2>
            <p className="text-xs text-sky-300/80 mt-0.5">
              Chọn mức độ phù hợp với vùng an toàn (comfort zone) của em: từ kết bạn khởi động nhẹ nhàng đến thử thách tranh luận & hóa giải xung đột.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 shadow-[0_0_10px_rgba(56,189,248,0.2)] ${
              selectedScenario.difficulty === 'easy'
                ? 'text-emerald-300 bg-emerald-950/80 border-emerald-400/40'
                : selectedScenario.difficulty === 'medium'
                ? 'text-amber-300 bg-amber-950/80 border-amber-400/40'
                : 'text-rose-300 bg-rose-950/80 border-rose-400/40'
            }`}>
              <span>{selectedScenario.difficulty === 'easy' ? '🌱 Cấp độ Dễ' : selectedScenario.difficulty === 'medium' ? '⚡ Cấp độ Vừa sức' : '🔥 Cấp độ Thử thách'}</span>
            </span>
            <span className="text-xs font-semibold text-cyan-300 bg-sky-950/80 border border-sky-400/40 px-3 py-1 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.2)]">
              Đang chọn: <strong className="text-white">{selectedScenario.title}</strong>
            </span>
          </div>
        </div>

        {/* Filter Controls Container */}
        <div className="space-y-3 bg-[#08102d]/75 p-3.5 sm:p-4 rounded-2xl border border-sky-500/25 backdrop-blur-sm shadow-[0_4px_20px_rgba(2,6,23,0.5)]">
          {/* Difficulty / Comfort Zone Level Selector */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Mức độ thử thách (Vùng an toàn - Comfort Zone):</span>
              </div>
              {activeDifficulty !== 'all' && (
                <button
                  type="button"
                  onClick={() => setActiveDifficulty('all')}
                  className="text-[11px] text-sky-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Xem tất cả cấp độ</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {DIFFICULTY_LEVELS.map(lvl => {
                const isActive = activeDifficulty === lvl.id;
                const count = lvl.id === 'all'
                  ? SCENARIOS.length
                  : SCENARIOS.filter(s => s.difficulty === lvl.id).length;

                const activeStyles = {
                  all: 'bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-600 text-white border-cyan-400 shadow-[0_0_18px_rgba(56,189,248,0.35)] ring-1 ring-cyan-400/50',
                  easy: 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white border-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.35)] ring-1 ring-emerald-400/50',
                  medium: 'bg-gradient-to-r from-amber-600 via-amber-700 to-orange-800 text-white border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.35)] ring-1 ring-amber-400/50',
                  hard: 'bg-gradient-to-r from-rose-600 via-rose-700 to-pink-800 text-white border-rose-400 shadow-[0_0_18px_rgba(244,63,94,0.35)] ring-1 ring-rose-400/50'
                }[lvl.id];

                const inactiveBadges = {
                  all: 'text-sky-300 bg-sky-950/70 border-sky-500/30',
                  easy: 'text-emerald-300 bg-emerald-950/70 border-emerald-500/30',
                  medium: 'text-amber-300 bg-amber-950/70 border-amber-500/30',
                  hard: 'text-rose-300 bg-rose-950/70 border-rose-500/30'
                }[lvl.id];

                return (
                  <button
                    key={lvl.id}
                    id={`filter-difficulty-${lvl.id}`}
                    type="button"
                    onClick={() => setActiveDifficulty(lvl.id)}
                    className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isActive
                        ? activeStyles
                        : 'bg-[#0b1434]/80 text-slate-300 hover:text-white border-sky-500/20 hover:border-sky-400/40 hover:bg-[#101b44]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-base sm:text-lg">{lvl.icon}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                        isActive ? 'bg-white/20 text-white border-white/30' : inactiveBadges
                      }`}>
                        {count} tình huống
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm leading-tight">
                        {lvl.label}
                      </div>
                      <p className={`text-[10px] mt-0.5 line-clamp-1 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                        {lvl.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="pt-2 border-t border-sky-500/20">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Lọc theo chủ đề:
              </span>
              {(activeCategory !== 'all' || activeDifficulty !== 'all') && (
                <span className="text-[11px] text-cyan-400 font-medium">
                  Hiển thị: <strong>{filteredScenarios.length}</strong> / {SCENARIOS.length} tình huống
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
              {SCENARIO_CATEGORIES.map(cat => {
                const count = cat.id === 'all'
                  ? (activeDifficulty === 'all'
                      ? SCENARIOS.length
                      : SCENARIOS.filter(s => s.difficulty === activeDifficulty).length)
                  : (activeDifficulty === 'all'
                      ? SCENARIOS.filter(s => s.categoryTag === cat.id).length
                      : SCENARIOS.filter(s => s.categoryTag === cat.id && s.difficulty === activeDifficulty).length);
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    id={`filter-category-${cat.id}`}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isActive
                        ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.35)]'
                        : 'bg-[#09112d]/80 text-sky-200/80 hover:text-white border-sky-500/20 hover:border-sky-400/40 hover:bg-[#0f1b44]'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-sky-500/15 text-cyan-300'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scenario Grid or Empty State */}
        {filteredScenarios.length === 0 ? (
          <div className="p-8 text-center bg-[#09112e]/85 border border-sky-500/25 rounded-2xl space-y-3 shadow-[0_4px_20px_rgba(2,6,23,0.5)]">
            <div className="text-4xl">🎯</div>
            <h3 className="text-white font-bold text-sm sm:text-base">
              Không tìm thấy tình huống nào với sự kết hợp bộ lọc này
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Hiện chưa có tình huống nào cùng lúc thuộc cấp độ <strong className="text-cyan-300">"{DIFFICULTY_LEVELS.find(d => d.id === activeDifficulty)?.label}"</strong> và chủ đề <strong className="text-cyan-300">"{SCENARIO_CATEGORIES.find(c => c.id === activeCategory)?.label}"</strong>. Em hãy thử chuyển sang cấp độ hoặc chủ đề khác nhé!
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveDifficulty('all');
                setActiveCategory('all');
              }}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.3)] transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại bộ lọc (Xem tất cả 14 tình huống)</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {filteredScenarios.map(sc => (
              <ScenarioCard
                key={sc.id}
                scenario={sc}
                isSelected={selectedScenario.id === sc.id}
                onSelect={handleSelectScenario}
                bestScore={scenarioBestScores[sc.id] ?? null}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2 & 3. AI đóng vai đối thoại & Phân tích chuyên sâu */}
      <section id="practice-workspace-section" className="space-y-3">
        {/* Interaction Mode Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0a1128]/80 p-2 rounded-2xl border border-sky-500/25">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInteractionMode('chat')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                interactionMode === 'chat'
                  ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-blue-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)] border border-cyan-400/40'
                  : 'bg-transparent text-slate-300 hover:text-white hover:bg-sky-500/10'
              }`}
            >
              <Bot className="w-4 h-4 text-cyan-300" />
              <span>Đối thoại Trực tiếp với AI (Live AI Chat)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <button
              type="button"
              onClick={() => setInteractionMode('rubric')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                interactionMode === 'rubric'
                  ? 'bg-gradient-to-r from-sky-500 via-indigo-600 to-blue-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)] border border-cyan-400/40'
                  : 'bg-transparent text-slate-300 hover:text-white hover:bg-sky-500/10'
              }`}
            >
              <Layers className="w-4 h-4 text-sky-300" />
              <span>Chấm điểm 3 Tiêu chí (Rubric)</span>
            </button>
          </div>

          <div className="text-[11px] text-sky-300/80 px-3 py-1 hidden lg:block">
            {interactionMode === 'chat'
              ? '✨ Nhắn tin trực tiếp như người thật • Trợ lý AI gợi ý câu đối đáp chuẩn nhất'
              : '📋 Chế độ phân tích chi tiết tiêu chí Sư phạm'}
          </div>
        </div>

        {interactionMode === 'chat' ? (
          <LiveAIChatRoom
            scenario={selectedScenario}
            onSessionCompleted={onSessionCompleted}
            onResetScenario={handleResetScenario}
          />
        ) : (
          <div className="bg-[#0b1330]/85 backdrop-blur-md rounded-2xl border border-sky-500/30 shadow-[0_8px_32px_rgba(2,6,23,0.7)] overflow-hidden">
        {/* Scenario Header Bar */}
        <div className="bg-gradient-to-r from-[#101c44] via-[#0c1535] to-[#070d22] text-white p-5 sm:p-6 border-b border-sky-500/25 relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-72 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-sky-400/30 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                {selectedScenario.partnerAvatar}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-lg text-white">
                    {selectedScenario.title}
                  </h3>
                  {selectedScenario.difficulty && (
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                      selectedScenario.difficulty === 'easy'
                        ? 'text-emerald-300 bg-emerald-950/80 border-emerald-400/40'
                        : selectedScenario.difficulty === 'medium'
                        ? 'text-amber-300 bg-amber-950/80 border-amber-400/40'
                        : 'text-rose-300 bg-rose-950/80 border-rose-400/40'
                    }`}>
                      <span>{selectedScenario.difficulty === 'easy' ? '🌱 Dễ' : selectedScenario.difficulty === 'medium' ? '⚡ Vừa sức' : '🔥 Thử thách'}</span>
                    </span>
                  )}
                  <span className="text-[11px] bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                    {selectedScenario.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Nhân vật đối thoại: <strong className="text-cyan-300">{selectedScenario.partnerName}</strong> ({selectedScenario.partnerRole})
                </p>
              </div>
            </div>

            <button
              onClick={handleResetScenario}
              className="px-3.5 py-1.5 text-xs font-medium text-sky-200 hover:text-white bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              title="Bắt đầu lại tình huống này"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Bắt đầu lại từ đầu</span>
            </button>
          </div>

          {/* Context box */}
          <div className="mt-4 bg-[#070d24]/90 rounded-xl p-3.5 text-xs text-slate-200 flex items-start gap-2.5 border border-sky-500/20 relative z-10">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-sky-100">
              <strong className="text-white">Bối cảnh giao tiếp:</strong> {selectedScenario.contextDescription}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Dialogue Conversation Stream */}
          <div className="space-y-4">
            {/* Previous Conversation History (if multi-turn) */}
            {dialogueHistory.map((item, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 max-w-2xl ${
                  item.sender === 'student' ? 'ml-auto justify-end' : ''
                }`}
              >
                {item.sender === 'partner' && (
                  <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-sky-400/30 text-white flex items-center justify-center text-lg shrink-0 opacity-80">
                    {selectedScenario.partnerAvatar}
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed border ${
                    item.sender === 'student'
                      ? 'bg-[#182859] border-sky-400/30 text-sky-100 rounded-tr-xs'
                      : 'bg-[#09112a] border-sky-500/20 text-slate-300 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-[10px] text-slate-400 font-semibold">
                    <span>{item.sender === 'student' ? 'Em' : selectedScenario.partnerName}</span>
                    <span className="text-[10px] text-cyan-400/70">Lượt trước</span>
                  </div>
                  <p>"{item.text}"</p>
                </div>

                {item.sender === 'student' && (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center text-xs font-bold shrink-0 opacity-80">
                    Em
                  </div>
                )}
              </div>
            ))}

            {/* Current Active AI Partner Prompt */}
            <div className="flex items-start gap-3 max-w-2xl">
              <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-sky-400/30 text-white flex items-center justify-center text-xl shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
                {selectedScenario.partnerAvatar}
              </div>
              <div className="bg-[#0d1738] rounded-2xl rounded-tl-xs p-4 text-slate-100 shadow-[0_4px_20px_rgba(2,6,23,0.5)] space-y-1.5 border border-sky-500/25">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-cyan-400" />
                    {selectedScenario.partnerName}
                  </span>
                  <span className="text-[10px] text-sky-400 font-medium bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-500/20">
                    Đang trò chuyện cùng em
                  </span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-200">
                  "{currentPrompt}"
                </p>
              </div>
            </div>

            {/* Student's Current Submitted Bubble */}
            {currentFeedback && (
              <div className="flex items-start gap-3 max-w-2xl ml-auto justify-end">
                <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-600 text-white rounded-2xl rounded-tr-xs p-4 shadow-[0_0_20px_rgba(56,189,248,0.3)] space-y-1.5 border border-cyan-400/30">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-sky-100">Câu trả lời vừa gửi của em</span>
                    <span className="text-[10px] text-sky-200">Học sinh</span>
                  </div>
                  <p className="text-sm leading-relaxed text-white">
                    "{submittedResponse}"
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-[0_0_12px_rgba(56,189,248,0.4)]">
                  Em
                </div>
              </div>
            )}
          </div>

          {/* AI Feedback or Input Box */}
          {currentFeedback ? (
            <FeedbackCard
              feedback={currentFeedback}
              partnerName={selectedScenario.partnerName}
              onContinueChat={handleContinueChat}
              onRetry={handleRetry}
              streak={stats?.streak}
            />
          ) : (
            <div className="space-y-4">
              {/* Suggestion Chips for quick response starters */}
              <SuggestionChips
                scenarioStarters={selectedScenario.quickStarters || []}
                partnerName={selectedScenario.partnerName}
                onSelectChip={handleSelectChip}
              />

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="student-response-textarea" className="block text-xs font-semibold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Em nhập câu trả lời cho {selectedScenario.partnerName}:</span>
                  </label>

                  {studentResponse.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => setStudentResponse('')}
                      className="text-[11px] text-slate-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Xóa nội dung để nhập lại"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Xóa câu này</span>
                    </button>
                  )}
                </div>

                <div className="rounded-xl border border-sky-500/30 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/25 transition-all bg-[#070e28]/95 p-3.5 shadow-inner">
                  <textarea
                    id="student-response-textarea"
                    ref={inputRef}
                    value={studentResponse}
                    onChange={e => setStudentResponse(e.target.value)}
                    placeholder={`Ví dụ: Em hãy trả lời tự nhiên, có xưng hô rõ ràng và thể hiện sự tôn trọng nhé... (hoặc bấm vào các thẻ gợi ý phía trên)`}
                    rows={4}
                    className="w-full text-sm text-white placeholder:text-slate-400 focus:outline-hidden resize-y bg-transparent"
                    disabled={isAnalyzing}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-sky-500/20">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-cyan-400" />
                      <span>AI sẽ phân tích câu chữ của em theo 3 tiêu chí: Rõ ràng, Lịch sự, Phù hợp.</span>
                    </span>

                    <button
                      type="submit"
                      id="submit-ai-analyze-btn"
                      disabled={isAnalyzing || !studentResponse.trim()}
                      className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isAnalyzing || !studentResponse.trim()
                          ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          : 'bg-gradient-to-r from-sky-500 via-indigo-600 to-blue-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]'
                      }`}
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>SpeakUp AI đang phân tích kỹ lưỡng...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
                          <span>Gửi câu trả lời</span>
                          <Send className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-200 rounded-xl text-xs font-medium">
                    {errorMsg}
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    )}
  </section>
</div>
);
};
