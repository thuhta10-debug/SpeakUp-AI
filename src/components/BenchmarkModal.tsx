import React, { useState, useEffect } from 'react';
import { BenchmarkTestResult } from '../types';
import { BENCHMARK_TEST_SUITE } from '../data/evaluationBenchmark';
import {
  X,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Search,
  Filter,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Star,
  ExternalLink
} from 'lucide-react';

interface BenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BenchmarkModal: React.FC<BenchmarkModalProps> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<BenchmarkTestResult[]>(() => {
    return BENCHMARK_TEST_SUITE.map(tc => ({
      ...tc,
      actualScores: undefined,
      passed: undefined,
      errorNotes: undefined
    }));
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runningIndex, setRunningIndex] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'mandatory' | 'passed' | 'failed'>('all');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [stats, setStats] = useState<{ total: number; passed: number; failed: number; rate: number } | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleRunAll = async () => {
    setIsRunning(true);
    setExpandedRowId(null);

    try {
      const res = await fetch('/api/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'all' })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data.results)) {
        setResults(data.results);
        setStats({
          total: data.total,
          passed: data.passed,
          failed: data.failed,
          rate: data.passRate
        });
      }
    } catch (err) {
      console.error('Benchmark execution error:', err);
    } finally {
      setIsRunning(false);
      setRunningIndex(null);
    }
  };

  const handleRunSingle = async (tcId: string) => {
    setIsRunning(true);
    setRunningIndex(results.findIndex(r => r.id === tcId));

    try {
      const res = await fetch('/api/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCaseId: tcId })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const single = data.results[0];
          setResults(prev => {
            const next = prev.map(item => item.id === tcId ? single : item);
            const executed = next.filter(item => item.passed !== undefined);
            const passed = executed.filter(item => item.passed).length;
            if (executed.length > 0) {
              setStats({
                total: executed.length,
                passed,
                failed: executed.length - passed,
                rate: Math.round((passed / executed.length) * 100)
              });
            }
            return next;
          });
        }
      }
    } catch (err) {
      console.error(`Error running test ${tcId}:`, err);
    } finally {
      setIsRunning(false);
      setRunningIndex(null);
    }
  };

  const filteredList = results.filter(item => {
    if (filterMode === 'mandatory') {
      return ['TC01', 'TC02', 'TC03', 'TC04'].includes(item.id);
    }
    if (filterMode === 'passed') {
      return item.passed === true;
    }
    if (filterMode === 'failed') {
      return item.passed === false;
    }
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#070e28] border border-cyan-500/40 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-[0_10px_50px_rgba(2,6,23,0.9)] overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-sky-500/25 bg-gradient-to-r from-[#0c1638] via-[#08112e] to-[#060b22] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg">
                  Bộ Kiểm Thử Sư Phạm 20 Câu (AI Benchmark)
                </h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-semibold px-2 py-0.5 rounded-full border border-cyan-400/30">
                  Dành cho Ban giám khảo & Chuyên gia
                </span>
              </div>
              <p className="text-xs text-sky-300/80">
                Đánh giá độc lập 3 tiêu chí: Rõ ràng – Lịch sự – Phù hợp • Kiểm tra hồi quy 4 trường hợp bắt buộc
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 rounded-xl transition-colors cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter Tabs */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#091232] border-b border-sky-500/20 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                filterMode === 'all'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                  : 'bg-transparent text-slate-300 border-sky-500/20 hover:text-white'
              }`}
            >
              <span>Tất cả (20)</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('mandatory')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                filterMode === 'mandatory'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-transparent text-amber-300 border-amber-500/30 hover:text-white'
              }`}
            >
              <span>🔥 4 ca bắt buộc (A, B, C, D)</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('passed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                filterMode === 'passed'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                  : 'bg-transparent text-emerald-300 border-emerald-500/30 hover:text-white'
              }`}
            >
              <span>Đạt chuẩn</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('failed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                filterMode === 'failed'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-700 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'bg-transparent text-rose-300 border-rose-500/30 hover:text-white'
              }`}
            >
              <span>Chưa đạt</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {stats && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-300 font-medium">Kết quả:</span>
                <span className="font-bold text-emerald-300">{stats.passed} Đạt</span>
                <span className="text-slate-500">/</span>
                <span className="font-bold text-rose-300">{stats.failed} Chưa đạt</span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40">
                  {stats.rate}% chính xác
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleRunAll}
              disabled={isRunning}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                isRunning
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-500 via-indigo-600 to-blue-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang chạy kiểm thử qua AI...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Chạy kiểm thử thực tế (20 câu)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Comparison Table Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          <div className="overflow-x-auto border border-sky-500/20 rounded-xl bg-[#050b20]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0a1435] text-sky-200 border-b border-sky-500/30 font-semibold">
                  <th className="p-3 w-16 text-center">Mã</th>
                  <th className="p-3 min-w-[140px]">Tình huống</th>
                  <th className="p-3 min-w-[200px]">Câu trả lời đầu vào</th>
                  <th className="p-3 min-w-[120px] text-center">Điểm kỳ vọng (R-L-P)</th>
                  <th className="p-3 min-w-[120px] text-center">Điểm AI thực tế (R-L-P)</th>
                  <th className="p-3 min-w-[100px] text-center">Kết quả</th>
                  <th className="p-3 min-w-[150px]">Ghi chú sư phạm</th>
                  <th className="p-3 w-16 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-500/15">
                {filteredList.map((item, index) => {
                  const isExpanded = expandedRowId === item.id;
                  const isItemRunning = isRunning && runningIndex === index;
                  const hasRan = item.actualScores !== undefined;

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        className={`hover:bg-[#0c163a]/60 transition-colors ${
                          ['TC01', 'TC02', 'TC03', 'TC04'].includes(item.id)
                            ? 'bg-amber-500/5'
                            : ''
                        }`}
                      >
                        {/* ID */}
                        <td className="p-3 text-center font-bold text-sky-300">
                          {item.id}
                          {['TC01', 'TC02', 'TC03', 'TC04'].includes(item.id) && (
                            <span className="block text-[9px] text-amber-400 font-semibold mt-0.5">
                              Bắt buộc
                            </span>
                          )}
                        </td>

                        {/* Scenario */}
                        <td className="p-3 text-slate-200">
                          <span className="font-semibold block">{item.scenarioTitle}</span>
                          <span className="text-[11px] text-slate-400 truncate block max-w-[160px]">
                            {item.partnerName} ({item.partnerRole})
                          </span>
                        </td>

                        {/* Student Response */}
                        <td className="p-3">
                          <div className="font-medium text-white bg-[#0b1330] p-2 rounded-lg border border-sky-500/20">
                            "{item.studentResponse}"
                          </div>
                          <span className="text-[10px] text-cyan-300/80 mt-1 block">
                            {item.categoryDescription}
                          </span>
                        </td>

                        {/* Expected Scores */}
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1.5 font-bold text-xs bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700">
                            <span className="text-cyan-300" title="Rõ ràng">{item.expectedScores.clarity}</span>
                            <span className="text-slate-500">-</span>
                            <span className="text-indigo-300" title="Lịch sự">{item.expectedScores.politeness}</span>
                            <span className="text-slate-500">-</span>
                            <span className="text-emerald-300" title="Phù hợp">{item.expectedScores.appropriateness}</span>
                          </div>
                          <span className="block text-[10px] text-slate-400 mt-0.5">R - L - P</span>
                        </td>

                        {/* Actual Scores */}
                        <td className="p-3 text-center">
                          {hasRan ? (
                            <div className={`inline-flex items-center gap-1.5 font-bold text-xs px-2.5 py-1 rounded-md border ${
                              item.passed
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.2)]'
                                : 'bg-rose-950/80 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                            }`}>
                              <span title="Rõ ràng">{item.actualScores!.clarity}</span>
                              <span className="text-slate-500">-</span>
                              <span title="Lịch sự">{item.actualScores!.politeness}</span>
                              <span className="text-slate-500">-</span>
                              <span title="Phù hợp">{item.actualScores!.appropriateness}</span>
                            </div>
                          ) : isItemRunning ? (
                            <div className="flex items-center justify-center gap-1 text-cyan-300">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span className="text-[11px]">Đang chấm...</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">Chưa chạy</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3 text-center">
                          {hasRan ? (
                            item.passed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/40 text-[11px]">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>ĐẠT</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-400/40 text-[11px]">
                                <AlertTriangle className="w-3 h-3" />
                                <span>CHƯA ĐẠT</span>
                              </span>
                            )
                          ) : (
                            <span className="text-slate-500 text-[11px]">—</span>
                          )}
                        </td>

                        {/* Error Notes / Rationale */}
                        <td className="p-3 text-[11px] text-slate-300">
                          {item.errorNotes ? (
                            <span className={item.passed ? 'text-emerald-300/90' : 'text-rose-300 font-medium'}>
                              {item.errorNotes}
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              Kỳ vọng: {item.expectedReasons.clarity}
                            </span>
                          )}
                        </td>

                        {/* Action: Expand & Single Run */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleRunSingle(item.id)}
                              disabled={isRunning}
                              className="p-1.5 text-cyan-300 hover:text-white bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/30 rounded-lg transition-colors cursor-pointer"
                              title="Chạy riêng ca này"
                            >
                              <Play className="w-3 h-3 fill-current" />
                            </button>
                            {item.rawFeedback && (
                              <button
                                type="button"
                                onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                                className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                                title="Xem chi tiết nhận xét & câu mẫu"
                              >
                                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && item.rawFeedback && (
                        <tr className="bg-[#060e28] border-b border-sky-500/20">
                          <td colSpan={8} className="p-4">
                            <div className="space-y-3 bg-[#0a1438] p-4 rounded-xl border border-sky-500/30 text-xs">
                              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                                <span>Phân tích chi tiết câu trả lời "{item.studentResponse}"</span>
                              </div>

                              {/* Criteria details */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {item.rawFeedback.criteria.map((c, idx) => (
                                  <div key={idx} className="bg-[#050b20] p-2.5 rounded-lg border border-sky-500/20">
                                    <div className="flex items-center justify-between font-bold mb-1">
                                      <span className="text-white">{c.name}</span>
                                      <span className="text-cyan-300">{c.score}/2 điểm • {c.level}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300">{c.reason}</p>
                                  </div>
                                ))}
                              </div>

                              {/* Strengths & Improvements */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-500/30 text-emerald-100">
                                  <strong className="text-emerald-300 block mb-0.5">Điểm làm tốt (Có căn cứ):</strong>
                                  {item.rawFeedback.strengths}
                                </div>
                                <div className="bg-amber-950/30 p-2.5 rounded-lg border border-amber-500/30 text-amber-100">
                                  <strong className="text-amber-300 block mb-0.5">Điểm có thể cải thiện:</strong>
                                  {item.rawFeedback.improvements}
                                </div>
                              </div>

                              {/* 2 Rewrites & Partner Follow Up */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                <div className="bg-[#060c22] p-2.5 rounded-lg border border-sky-500/20 text-sky-100">
                                  <strong className="text-cyan-300 block mb-0.5">🌱 Mẫu 1 (Thân thiện, tự nhiên):</strong>
                                  {item.rawFeedback.rewrites.friendly}
                                </div>
                                <div className="bg-[#060c22] p-2.5 rounded-lg border border-indigo-500/20 text-indigo-100">
                                  <strong className="text-indigo-300 block mb-0.5">✨ Mẫu 2 (Rõ ràng, lịch sự, tự tin):</strong>
                                  {item.rawFeedback.rewrites.polite_confident}
                                </div>
                              </div>

                              <div className="bg-[#050a1d] p-2.5 rounded-lg border border-sky-500/15 text-[11px] text-slate-300">
                                <strong className="text-sky-300 block mb-0.5">Lời đáp tiếp theo của {item.partnerName}:</strong>
                                "{item.rawFeedback.character_follow_up}"
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="p-4 bg-[#050a1d] border-t border-sky-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>
              Mỗi ca kiểm thử kiểm tra tính độc lập tuyệt đối giữa 3 tiêu chí: Rõ ràng, Lịch sự, Phù hợp.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#0f1b44] hover:bg-[#15255a] text-sky-200 border border-sky-400/30 rounded-xl transition-colors cursor-pointer"
          >
            Đóng bảng kiểm thử
          </button>
        </div>
      </div>
    </div>
  );
};
