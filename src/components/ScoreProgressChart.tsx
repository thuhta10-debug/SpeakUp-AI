import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Dot
} from 'recharts';
import { SessionAttempt } from '../types';
import { TrendingUp, TrendingDown, Minus, Target, Sparkles } from 'lucide-react';

interface ScoreProgressChartProps {
  history: SessionAttempt[];
  onSelectAttempt?: (attemptId: string) => void;
}

interface ChartDataPoint {
  id: string;
  attemptNumber: number;
  label: string;
  score: number;
  scenarioTitle: string;
  partnerName: string;
  timestamp: number;
  dateStr: string;
  clarity: number;
  politeness: number;
  appropriateness: number;
}

export const ScoreProgressChart: React.FC<ScoreProgressChartProps> = ({
  history,
  onSelectAttempt
}) => {
  const [windowLimit, setWindowLimit] = useState<number>(10);

  // Take the most recent sessions up to windowLimit, then reverse to chronological order (oldest -> newest)
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!history || history.length === 0) return [];

    const recent = history.slice(0, windowLimit).reverse();
    return recent.map((item, idx) => {
      const d = new Date(item.timestamp);
      const timeStr = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
      const dateShort = `${d.getDate()}/${d.getMonth() + 1}`;

      const clarity = item.feedback?.criteriaRatings?.clarity?.score ?? 80;
      const politeness = item.feedback?.criteriaRatings?.politeness?.score ?? 80;
      const appropriateness = item.feedback?.criteriaRatings?.appropriateness?.score ?? 80;

      return {
        id: item.id,
        attemptNumber: idx + 1,
        label: `#${idx + 1}`,
        score: Number(item.scoreNumber.toFixed(1)),
        scenarioTitle: item.scenarioTitle,
        partnerName: item.partnerName,
        timestamp: item.timestamp,
        dateStr: `${timeStr} (${dateShort})`,
        clarity,
        politeness,
        appropriateness
      };
    });
  }, [history, windowLimit]);

  // Improvement analysis
  const trendAnalysis = useMemo(() => {
    if (chartData.length < 2) return null;

    const firstScore = chartData[0].score;
    const latestScore = chartData[chartData.length - 1].score;
    const diff = Number((latestScore - firstScore).toFixed(1));

    const highestScore = Math.max(...chartData.map(d => d.score));
    const lowestScore = Math.min(...chartData.map(d => d.score));

    return {
      diff,
      isImproving: diff > 0,
      isDeclining: diff < 0,
      highestScore,
      lowestScore,
      latestScore
    };
  }, [chartData]);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-[#0c163b] via-[#091230] to-[#060b22] border border-sky-500/35 rounded-2xl p-4 sm:p-4.5 shadow-[0_4px_25px_rgba(2,6,23,0.5)] space-y-3.5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Tiến bộ điểm số</span>
              <span className="text-[10px] text-cyan-300 font-medium normal-case bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-400/30">
                {chartData.length} lượt gần nhất
              </span>
            </h4>
          </div>
        </div>

        {/* Range switcher if there are many sessions */}
        {history.length > 5 && (
          <div className="flex items-center gap-1 bg-[#060c20] p-0.5 rounded-lg border border-sky-500/30 text-[10px]">
            <button
              type="button"
              onClick={() => setWindowLimit(5)}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-all ${
                windowLimit === 5
                  ? 'bg-sky-500/30 text-cyan-300 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              5 lượt
            </button>
            <button
              type="button"
              onClick={() => setWindowLimit(10)}
              className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-all ${
                windowLimit === 10
                  ? 'bg-sky-500/30 text-cyan-300 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              10 lượt
            </button>
          </div>
        )}
      </div>

      {/* Improvement highlight banner */}
      {trendAnalysis && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#060d24]/90 border border-sky-500/20 rounded-xl px-3 py-2 text-xs relative z-10">
          <div className="flex items-center gap-2">
            {trendAnalysis.isImproving ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-400/30">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{trendAnalysis.diff} điểm</span>
              </span>
            ) : trendAnalysis.isDeclining ? (
              <span className="inline-flex items-center gap-1 text-amber-400 font-semibold bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-400/30">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>{trendAnalysis.diff} điểm</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-cyan-300 font-semibold bg-sky-500/15 px-2 py-0.5 rounded-md border border-sky-400/30">
                <Minus className="w-3.5 h-3.5" />
                <span>Ổn định phong độ</span>
              </span>
            )}
            <span className="text-[11px] text-slate-300 hidden sm:inline">
              {trendAnalysis.isImproving
                ? 'Điểm số đang trên đà đi lên rất rõ nét!'
                : trendAnalysis.isDeclining
                ? 'Cần chú ý lịch sự và nói trọn câu hơn.'
                : 'Giữ vững sự tự tin qua từng tình huống!'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <div>
              <span className="text-slate-400">Cao nhất: </span>
              <span className="font-bold text-cyan-300">{trendAnalysis.highestScore}/10</span>
            </div>
            <div>
              <span className="text-slate-400">Gần nhất: </span>
              <span className="font-bold text-amber-300">{trendAnalysis.latestScore}/10</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      {chartData.length >= 2 ? (
        <div className="w-full h-44 sm:h-48 min-w-0 relative z-10 pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 12, left: -22, bottom: 4 }}
            >
              <defs>
                <linearGradient id="scoreLineGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />

              <YAxis
                domain={[4, 10]}
                ticks={[4, 6, 8, 10]}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />

              {/* Target reference line for 8.0 Good communication */}
              <ReferenceLine
                y={8.0}
                stroke="#38bdf8"
                strokeDasharray="4 4"
                strokeOpacity={0.4}
                label={{
                  value: 'Mục tiêu (8.0)',
                  position: 'insideTopRight',
                  fill: '#38bdf8',
                  fontSize: 9,
                  opacity: 0.7
                }}
              />

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartDataPoint;
                    return (
                      <div className="bg-[#0b1330]/95 backdrop-blur-md border border-cyan-400/40 rounded-xl p-2.5 shadow-[0_4px_20px_rgba(2,6,23,0.9)] text-xs space-y-1.5 min-w-[180px]">
                        <div className="flex items-center justify-between gap-2 border-b border-sky-500/20 pb-1">
                          <span className="text-[10px] text-cyan-300 font-bold">
                            Lượt #{data.attemptNumber}
                          </span>
                          <span className="text-[9px] text-slate-400">
                            {data.dateStr}
                          </span>
                        </div>

                        <div>
                          <div className="text-[11px] font-semibold text-white line-clamp-1">
                            {data.scenarioTitle}
                          </div>
                          <div className="text-[10px] text-slate-300">
                            với {data.partnerName}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-sky-500/20">
                          <span className="text-slate-400 text-[10px]">Điểm tổng:</span>
                          <span className="text-sm font-black text-cyan-300">
                            {data.score} <span className="text-[10px] font-normal text-slate-400">/10</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-1 pt-1 text-[9px] text-center text-slate-300">
                          <div className="bg-slate-900/80 p-1 rounded">
                            <span className="block text-slate-400">Rõ ràng</span>
                            <span className="font-bold text-cyan-300">{data.clarity}%</span>
                          </div>
                          <div className="bg-slate-900/80 p-1 rounded">
                            <span className="block text-slate-400">Lịch sự</span>
                            <span className="font-bold text-pink-300">{data.politeness}%</span>
                          </div>
                          <div className="bg-slate-900/80 p-1 rounded">
                            <span className="block text-slate-400">Phù hợp</span>
                            <span className="font-bold text-indigo-300">{data.appropriateness}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Line
                type="monotone"
                dataKey="score"
                name="Điểm"
                stroke="url(#scoreLineGlow)"
                strokeWidth={2.5}
                isAnimationActive={true}
                animationDuration={900}
                dot={{
                  r: 4,
                  fill: '#38bdf8',
                  stroke: '#0f172a',
                  strokeWidth: 2
                }}
                activeDot={{
                  r: 6,
                  fill: '#38bdf8',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                  cursor: 'pointer'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Single attempt encouragement state */
        <div className="bg-[#070e28]/80 border border-dashed border-sky-500/30 rounded-xl p-3.5 text-center space-y-1.5 relative z-10">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-bold text-cyan-300">
              Điểm lượt đầu tiên: {chartData[0]?.score || 8.0}/10
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            🌱 Em đã hoàn thành 1 lượt luyện tập! Hãy thực hành thêm ít nhất 1 tình huống nữa để SpeakUp AI vẽ đường biểu đồ xu hướng tiến bộ cho em nhé.
          </p>
        </div>
      )}

      {/* Footer hint */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-sky-500/15 pt-2 relative z-10">
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3 text-cyan-400" />
          <span>Thang điểm 0 - 10 theo chuẩn 3 tiêu chí</span>
        </span>
        <span className="text-sky-300/80">Di chuột vào điểm để xem chi tiết</span>
      </div>
    </div>
  );
};
