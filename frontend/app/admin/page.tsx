"use client";

import LogoUpload from "@/components/LogoUpload";

const MOCK_ADMIN = {
  total_students: 342,
  active_students_30d: 187,
  average_score: 64.2,
  top_topics: [
    { topic: "Operative Dentistry", avg_score: 72.1, attempts: 890 },
    { topic: "Oral Pathology", avg_score: 58.3, attempts: 654 },
    { topic: "Prosthodontics", avg_score: 63.7, attempts: 521 },
    { topic: "Endodontics", avg_score: 69.5, attempts: 432 },
    { topic: "Periodontics", avg_score: 66.8, attempts: 398 },
    { topic: "Pharmacology", avg_score: 51.2, attempts: 312 },
    { topic: "Orthodontics", avg_score: 61.4, attempts: 287 },
    { topic: "Oral Surgery", avg_score: 57.9, attempts: 256 },
  ],
  tier_distribution: { free: 245, pro: 78, elite: 19 },
};

export default function AdminPage() {
  const data = MOCK_ADMIN;
  const totalTierStudents =
    data.tier_distribution.free +
    data.tier_distribution.pro +
    data.tier_distribution.elite;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-slate-900">
      <main className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-dall-900 dark:text-dall-100 mb-6">
          Institutional Analytics
        </h1>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-3xl font-bold text-dall-600">
              {data.total_students}
            </div>
            <div className="text-xs text-slate-500 mt-1">Total Students</div>
          </div>
          <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-3xl font-bold text-accent-emerald">
              {data.active_students_30d}
            </div>
            <div className="text-xs text-slate-500 mt-1">Active (30 days)</div>
          </div>
          <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-3xl font-bold text-accent-gold">
              {data.average_score.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">Average Score</div>
          </div>
          <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="text-3xl font-bold text-dall-600">
              {((data.active_students_30d / data.total_students) * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-slate-500 mt-1">Engagement Rate</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Topic performance */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-dall-900 dark:text-dall-100 mb-4">
              Topic Performance (All Students)
            </h2>
            <div className="space-y-3">
              {data.top_topics.map((topic) => (
                <div key={topic.topic} className="flex items-center justify-between">
                  <div className="flex-1 mr-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {topic.topic}
                      </span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {topic.avg_score.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          topic.avg_score >= 70
                            ? "bg-green-500"
                            : topic.avg_score >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${topic.avg_score}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 w-16 text-right">
                    {topic.attempts} tries
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Logo Upload */}
          <LogoUpload />
        </div>

        <div className="grid md:grid-cols-1 gap-6 mt-6">
          {/* Tier distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-dall-900 dark:text-dall-100 mb-4">
              Subscription Tiers
            </h2>
            <div className="space-y-4">
              {Object.entries(data.tier_distribution).map(([tier, count]) => {
                const pct = ((count / totalTierStudents) * 100).toFixed(1);
                const colors: Record<string, string> = {
                  free: "bg-slate-400",
                  pro: "bg-dall-500",
                  elite: "bg-accent-gold",
                };
                return (
                  <div key={tier}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize text-slate-700 dark:text-slate-300">
                        {tier}
                      </span>
                      <span className="text-sm text-slate-500">
                        {count} students ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${colors[tier] || "bg-dall-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Revenue Estimate
              </h3>
              <div className="text-2xl font-bold text-accent-emerald">
                {(data.tier_distribution.pro * 49 + data.tier_distribution.elite * 99).toLocaleString()} SAR
              </div>
              <div className="text-xs text-slate-500">Monthly recurring</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
