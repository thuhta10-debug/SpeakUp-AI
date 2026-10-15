import { AIFeedback, SessionAttempt, SessionStats } from '../types';
import { SCENARIOS } from '../data/scenarios';
import { isProfaneOrInsult } from './moderation';

const STORAGE_KEY = 'speakup_ai_session_history_v1';

export function calculateScoreFromFeedback(feedback: AIFeedback, studentResponse?: string): number {
  if (!feedback?.criteria || feedback.criteria.length === 0) return 7.0;

  // Severe profanity / insult protection
  if (studentResponse && isProfaneOrInsult(studentResponse)) {
    return 1.5;
  }

  let totalPoints = 0;
  feedback.criteria.forEach(crit => {
    if (typeof crit.score === 'number') {
      totalPoints += crit.score;
    } else {
      const map: Record<string, number> = {
        'Rất tốt': 2,
        'Khá tốt': 1,
        'Cần chú ý': 0
      };
      totalPoints += map[crit.score as any] ?? (crit.level === 'Rất tốt' ? 2 : crit.level === 'Khá tốt' ? 1 : 0);
    }
  });

  // Total possible is 6 (3 criteria * 2 points). Scale to 10.0:
  const normalizedScore = (totalPoints / (feedback.criteria.length * 2)) * 10;
  return Math.round(normalizedScore * 10) / 10;
}

export function getStoredHistory(): SessionAttempt[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load session history from localStorage:', err);
    return [];
  }
}

export function saveHistory(history: SessionAttempt[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save session history to localStorage:', err);
  }
}

export function clearStoredHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear session history:', err);
  }
}

function toLocalDateKey(dateInput: Date | number): string {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateStats(history: SessionAttempt[], totalScenariosCount = SCENARIOS.length): SessionStats {
  const now = new Date();
  const todayStr = toLocalDateKey(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toLocalDateKey(yesterday);

  // Helper for 7 recent calendar days (ending with today)
  const vnDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const generateRecentWeekDays = (datesSet: Set<string>) => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = toLocalDateKey(d);
      days.push({
        date: dateKey,
        dayName: vnDays[d.getDay()],
        isToday: i === 0,
        completed: datesSet.has(dateKey)
      });
    }
    return days;
  };

  if (!history || history.length === 0) {
    const emptyDatesSet = new Set<string>();
    return {
      totalAttempts: 0,
      completedScenariosCount: 0,
      totalScenariosCount,
      averageScore: 0,
      criteriaAverages: {
        clarity: 0,
        politeness: 0,
        appropriateness: 0
      },
      streak: {
        currentStreak: 0,
        bestStreak: 0,
        practicedToday: false,
        activeDates: [],
        recentWeekDays: generateRecentWeekDays(emptyDatesSet)
      }
    };
  }

  // 1. Calculate unique dates
  const uniqueDates = new Set<string>();
  history.forEach(h => {
    if (h.timestamp) {
      uniqueDates.add(toLocalDateKey(h.timestamp));
    }
  });

  const practicedToday = uniqueDates.has(todayStr);

  // 2. Calculate current streak
  let currentStreak = 0;
  if (practicedToday) {
    let checkDate = new Date(now);
    while (uniqueDates.has(toLocalDateKey(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else if (uniqueDates.has(yesterdayStr)) {
    let checkDate = new Date(yesterday);
    while (uniqueDates.has(toLocalDateKey(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else {
    currentStreak = 0;
  }

  // 3. Calculate best streak ever
  const sortedDates = Array.from(uniqueDates).sort();
  let bestStreak = currentStreak;
  let tempStreak = 0;
  let prevTime: number | null = null;

  sortedDates.forEach(dateStr => {
    const parts = dateStr.split('-').map(Number);
    const currTime = new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0).getTime();
    if (prevTime === null) {
      tempStreak = 1;
    } else {
      const dayDiff = Math.round((currTime - prevTime) / 86400000);
      if (dayDiff === 1) {
        tempStreak++;
      } else if (dayDiff > 1) {
        tempStreak = 1;
      }
    }
    prevTime = currTime;
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
  });

  const uniqueScenarioIds = new Set(history.map(h => h.scenarioId));
  const totalScore = history.reduce((sum, h) => sum + (h.scoreNumber || 7), 0);
  const averageScore = Math.round((totalScore / history.length) * 10) / 10;

  let clarityCount = 0;
  let clarityTotal = 0;
  let politenessCount = 0;
  let politenessTotal = 0;
  let appropriatenessCount = 0;
  let appropriatenessTotal = 0;

  history.forEach(attempt => {
    attempt.feedback?.criteria?.forEach(crit => {
      // Map score 0, 1, 2 to 0%, 50%, 100%
      let val = 50;
      if (typeof crit.score === 'number') {
        val = crit.score === 2 ? 100 : crit.score === 1 ? 50 : 0;
      } else if (crit.score === 'Rất tốt' || crit.level === 'Rất tốt') {
        val = 100;
      } else if (crit.score === 'Khá tốt' || crit.level === 'Khá tốt') {
        val = 50;
      } else {
        val = 0;
      }

      if (crit.name === 'Rõ ràng') {
        clarityCount++;
        clarityTotal += val;
      } else if (crit.name === 'Lịch sự') {
        politenessCount++;
        politenessTotal += val;
      } else if (crit.name === 'Phù hợp') {
        appropriatenessCount++;
        appropriatenessTotal += val;
      }
    });
  });

  return {
    totalAttempts: history.length,
    completedScenariosCount: uniqueScenarioIds.size,
    totalScenariosCount,
    averageScore,
    criteriaAverages: {
      clarity: clarityCount ? Math.round(clarityTotal / clarityCount) : 0,
      politeness: politenessCount ? Math.round(politenessTotal / politenessCount) : 0,
      appropriateness: appropriatenessCount ? Math.round(appropriatenessTotal / appropriatenessCount) : 0
    },
    streak: {
      currentStreak,
      bestStreak: Math.max(bestStreak, currentStreak),
      practicedToday,
      activeDates: sortedDates,
      recentWeekDays: generateRecentWeekDays(uniqueDates)
    }
  };
}
