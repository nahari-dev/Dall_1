"use client";

interface TopicScore {
  topic: string;
  score: number;
  quizzes?: number;
}

interface TopicHeatmapProps {
  data: TopicScore[];
  passScore?: number;
}

function getScoreColor(score: number, passScore: number): string {
  if (score >= passScore) return "bg-green-500";
  if (score >= passScore * 0.8) return "bg-yellow-500";
  if (score >= passScore * 0.5) return "bg-orange-500";
  return "bg-red-500";
}

function getScoreBgColor(score: number, passScore: number): string {
  if (score >= passScore) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
  if (score >= passScore * 0.8)
    return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
  if (score >= passScore * 0.5)
    return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800";
  return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
}

export default function TopicHeatmap({ data, passScore = 70 }: TopicHeatmapProps) {
  const sorted = [...data].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-2">
      {sorted.map((item) => (
        <div
          key={item.topic}
          className={`flex items-center justify-between p-3 rounded-xl border ${getScoreBgColor(
            item.score,
            passScore
          )}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${getScoreColor(
                item.score,
                passScore
              )}`}
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {item.topic}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {item.quizzes !== undefined && (
              <span className="text-xs text-slate-500">
                {item.quizzes} quizzes
              </span>
            )}
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getScoreColor(
                    item.score,
                    passScore
                  )}`}
                  style={{ width: `${Math.min(item.score, 100)}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 w-10 text-right">
                {item.score}%
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
