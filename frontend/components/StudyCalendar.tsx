"use client";

interface StudyDay {
  day: number;
  date: string;
  topic: string;
  score: number;
  target: number;
  activities: string[];
}

interface StudyCalendarProps {
  plan: StudyDay[];
}

export default function StudyCalendar({ plan }: StudyCalendarProps) {
  return (
    <div className="space-y-3">
      {plan.map((day) => {
        const isReview = day.topic.startsWith("REVIEW:");
        const gap = day.target - day.score;

        return (
          <div
            key={day.day}
            className={`p-4 rounded-xl border ${
              isReview
                ? "border-dall-300 dark:border-dall-700 bg-dall-50 dark:bg-dall-900/20"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-dall-600 dark:text-dall-100">
                    Day {day.day}
                  </span>
                  <span className="text-xs text-slate-500">{day.date}</span>
                  {isReview && (
                    <span className="px-1.5 py-0.5 bg-dall-100 dark:bg-dall-900 text-dall-700 dark:text-dall-100 rounded text-xs font-medium">
                      Review
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {day.topic}
                </h4>
              </div>
              {gap > 0 && (
                <span className="text-xs text-accent-coral font-medium">
                  Gap: {gap}%
                </span>
              )}
            </div>
            <ul className="space-y-1">
              {day.activities.map((activity, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                >
                  <span className="text-dall-500 mt-0.5 shrink-0">-</span>
                  {activity}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
