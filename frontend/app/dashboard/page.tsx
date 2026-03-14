"use client";

import ReadinessGauge from "@/components/ReadinessGauge";
import TopicHeatmap from "@/components/TopicHeatmap";

// Mock analytics data for standalone operation
const MOCK_ANALYTICS = {
  total_quizzes: 15,
  average_score: 68.5,
  study_streak_days: 7,
  topic_scores: [
    { topic: "Operative Dentistry", score: 78, quizzes: 5 },
    { topic: "Oral Pathology", score: 52, quizzes: 3 },
    { topic: "Prosthodontics", score: 65, quizzes: 2 },
    { topic: "Endodontics", score: 75, quizzes: 2 },
    { topic: "Periodontics", score: 70, quizzes: 2 },
    { topic: "Pharmacology", score: 45, quizzes: 1 },
    { topic: "Orthodontics", score: 60, quizzes: 1 },
    { topic: "Oral Surgery", score: 55, quizzes: 1 },
  ],
  recent_sessions: [
    { date: "2026-02-13", topic: "Operative Dentistry", score: 80, questions: 10 },
    { date: "2026-02-12", topic: "Oral Pathology", score: 55, questions: 10 },
    { date: "2026-02-11", topic: "Periodontics", score: 70, questions: 5 },
    { date: "2026-02-10", topic: "Endodontics", score: 75, questions: 10 },
    { date: "2026-02-09", topic: "Prosthodontics", score: 60, questions: 5 },
  ],
};

const MOCK_READINESS = {
  overall_readiness_pct: 62.4,
  pass_score: 70,
  on_track: false,
  days_until_ready: 14,
};

export default function DashboardPage() {
  const analytics = MOCK_ANALYTICS;
  const readiness = MOCK_READINESS;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-slate-900">
      <main className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-dall-900 dark:text-dall-100 mb-6">
          Your Progress
        </h1>

        {/* Top stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-dall-600">
              {analytics.total_quizzes}
            </div>
            <div className="text-xs text-slate-500 mt-1">Quizzes Taken</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-dall-600">
              {analytics.average_score.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">Average Score</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-accent-gold">
              {analytics.study_streak_days}
            </div>
            <div className="text-xs text-slate-500 mt-1">Day Streak</div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-accent-coral">
              {readiness.days_until_ready}
            </div>
            <div className="text-xs text-slate-500 mt-1">Days to Ready</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Readiness gauge */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center">
            <h2 className="text-lg font-semibold text-dall-900 dark:text-dall-100 mb-4 self-start">
              Exam Readiness
            </h2>
            <ReadinessGauge
              percentage={readiness.overall_readiness_pct}
              passScore={readiness.pass_score}
            />
          </div>

          {/* Topic heatmap */}
          <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-dall-900 dark:text-dall-100 mb-4">
              Topic Performance
            </h2>
            <TopicHeatmap data={analytics.topic_scores} passScore={70} />
          </div>
        </div>

        {/* Recent sessions */}
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-dall-900 dark:text-dall-100 mb-4">
            Recent Quiz Sessions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 text-slate-500 font-medium">Date</th>
                  <th className="text-left py-2 text-slate-500 font-medium">Topic</th>
                  <th className="text-center py-2 text-slate-500 font-medium">Questions</th>
                  <th className="text-right py-2 text-slate-500 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recent_sessions.map((session, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-100 dark:border-slate-700/50"
                  >
                    <td className="py-2.5 text-slate-600 dark:text-slate-400">
                      {session.date}
                    </td>
                    <td className="py-2.5 text-slate-800 dark:text-slate-200">
                      {session.topic}
                    </td>
                    <td className="py-2.5 text-center text-slate-600 dark:text-slate-400">
                      {session.questions}
                    </td>
                    <td className="py-2.5 text-right">
                      <span
                        className={`font-semibold ${
                          session.score >= 70
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {session.score}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
