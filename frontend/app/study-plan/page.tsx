"use client";

import StudyCalendar from "@/components/StudyCalendar";

const MOCK_PLAN = [
  {
    day: 1,
    date: "2026-02-15",
    topic: "Pharmacology",
    score: 40,
    target: 70,
    activities: [
      "Review core concepts: Pharmacology (2 hours)",
      "Practice 20 MCQs on Pharmacology",
      "Review incorrect answers with explanations",
    ],
  },
  {
    day: 2,
    date: "2026-02-16",
    topic: "Oral Pathology",
    score: 45,
    target: 70,
    activities: [
      "Review core concepts: Oral Pathology (2 hours)",
      "Practice 20 MCQs on Oral Pathology",
      "Review incorrect answers with explanations",
    ],
  },
  {
    day: 3,
    date: "2026-02-17",
    topic: "Oral Surgery",
    score: 50,
    target: 70,
    activities: [
      "Focused review: Oral Surgery weak subtopics (1 hour)",
      "Practice 10 MCQs on Oral Surgery",
    ],
  },
  {
    day: 4,
    date: "2026-02-18",
    topic: "Orthodontics",
    score: 55,
    target: 70,
    activities: [
      "Focused review: Orthodontics weak subtopics (1 hour)",
      "Practice 10 MCQs on Orthodontics",
    ],
  },
  {
    day: 5,
    date: "2026-02-19",
    topic: "Prosthodontics",
    score: 60,
    target: 70,
    activities: [
      "Focused review: Prosthodontics weak subtopics (1 hour)",
      "Practice 10 MCQs on Prosthodontics",
    ],
  },
  {
    day: 6,
    date: "2026-02-20",
    topic: "Periodontics",
    score: 65,
    target: 70,
    activities: [
      "Quick revision: Periodontics key points (30 min)",
      "Practice 5 high-yield MCQs on Periodontics",
    ],
  },
  {
    day: 8,
    date: "2026-02-22",
    topic: "REVIEW: Pharmacology",
    score: 40,
    target: 70,
    activities: [
      "Spaced repetition review of Pharmacology",
      "Practice mixed MCQs from previously weak areas",
    ],
  },
  {
    day: 10,
    date: "2026-02-24",
    topic: "REVIEW: Oral Pathology",
    score: 45,
    target: 70,
    activities: [
      "Spaced repetition review of Oral Pathology",
      "Practice mixed MCQs from previously weak areas",
    ],
  },
];

export default function StudyPlanPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-slate-900">
      <main className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-dall-900 dark:text-dall-100 mb-2">
            Your Personalised Study Plan
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Based on your performance data, here&apos;s a day-by-day plan to get you
            to 70% readiness using spaced repetition.
          </p>
        </div>

        <StudyCalendar plan={MOCK_PLAN} />

        <div className="mt-6 p-4 bg-dall-50 dark:bg-dall-900/20 rounded-xl border border-dall-200 dark:border-dall-800">
          <h3 className="text-sm font-semibold text-dall-700 dark:text-dall-100 mb-1">
            Study Tips
          </h3>
          <ul className="text-sm text-dall-600 dark:text-dall-100 space-y-1">
            <li>- Review days are scheduled using spaced repetition intervals</li>
            <li>- Focus on understanding concepts, not memorising answers</li>
            <li>- Use the AI Tutor for any topics you find unclear</li>
            <li>- Take practice quizzes after each study session</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
