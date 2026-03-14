"use client";

import { useState } from "react";
import Link from "next/link";
import QuizCard from "@/components/QuizCard";

// Mock quiz data for standalone operation
const MOCK_QUESTIONS = [
  {
    id: "q001",
    topic: "Operative Dentistry",
    subtopic: "Composite Resins",
    difficulty: "medium",
    text: "A patient requires a Class II composite restoration on tooth #36. Which of the following techniques is MOST effective for reducing polymerization shrinkage stress?",
    options: {
      A: "Bulk fill technique with 4mm increments",
      B: "Oblique layering technique with 2mm increments",
      C: "Horizontal layering with 3mm increments",
      D: "Single increment placement with high-intensity curing",
    },
    time_limit: 90,
    correct_answer: "B",
    explanation:
      "The oblique layering technique (2mm increments) reduces the C-factor by directing polymerization shrinkage away from bonded surfaces. [Source: Sturdevant's, Ch. 8, p. 205]",
  },
  {
    id: "q002",
    topic: "Oral Pathology",
    subtopic: "Oral Malignancies",
    difficulty: "hard",
    text: "A 55-year-old male presents with a non-healing ulcer on the lateral border of the tongue that has been present for 3 months. He has a 30-year smoking history. Biopsy reveals keratin pearls and epithelial dysplasia. What is the MOST likely diagnosis?",
    options: {
      A: "Traumatic ulcer",
      B: "Squamous cell carcinoma",
      C: "Verrucous carcinoma",
      D: "Mucoepidermoid carcinoma",
    },
    time_limit: 90,
    correct_answer: "B",
    explanation:
      "Squamous cell carcinoma (SCC) accounts for ~90% of oral malignancies. Key features: non-healing ulcer on lateral tongue, smoking history, keratin pearls with dysplasia. [Source: Neville's, Ch. 10, p. 409]",
  },
  {
    id: "q003",
    topic: "Periodontics",
    subtopic: "Biological Width",
    difficulty: "medium",
    text: "The biological width consists of the junctional epithelium and connective tissue attachment. What is the average total dimension of the biological width?",
    options: {
      A: "1.07 mm",
      B: "2.04 mm",
      C: "3.0 mm",
      D: "0.97 mm",
    },
    time_limit: 90,
    correct_answer: "B",
    explanation:
      "Biological width averages 2.04mm: CT attachment (1.07mm) + JE (0.97mm), per Gargiulo et al. (1961). [Source: Carranza's, Ch. 2, p. 38]",
  },
];

type QuizState = "start" | "active" | "review" | "results";

export default function QuizPage() {
  const [state, setState] = useState<QuizState>("start");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<
    Array<{ questionId: string; answer: string; correct: boolean }>
  >([]);
  const [feedback, setFeedback] = useState<{
    is_correct: boolean;
    correct_answer: string;
    explanation: string;
  } | null>(null);

  const currentQuestion = MOCK_QUESTIONS[currentIndex];
  const totalQuestions = MOCK_QUESTIONS.length;

  const handleStart = () => {
    setState("active");
    setCurrentIndex(0);
    setAnswers([]);
    setFeedback(null);
  };

  const handleAnswer = (answer: string) => {
    const q = MOCK_QUESTIONS[currentIndex];
    const correct = answer === q.correct_answer;

    setAnswers((prev) => [
      ...prev,
      { questionId: q.id, answer, correct },
    ]);

    setFeedback({
      is_correct: correct,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
    });

    setState("review");
  };

  const handleNext = () => {
    setFeedback(null);
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
      setState("active");
    } else {
      setState("results");
    }
  };

  const score = answers.length > 0
    ? (answers.filter((a) => a.correct).length / answers.length) * 100
    : 0;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-slate-50 dark:bg-slate-900">
      {state !== "start" && state !== "results" && (
        <div className="h-10 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-end px-4 gap-4 text-sm">
          <span className="text-slate-500">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <div className="w-32 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-dall-500 transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto py-8 px-4">
        {/* Start screen */}
        {state === "start" && (
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-dall-900 dark:text-dall-100 mb-4">
              SDLE Practice Quiz
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              Test your knowledge with exam-style questions. Each question
              includes a detailed explanation with textbook citations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleStart}
                className="px-8 py-3 bg-dall-600 text-white rounded-xl font-semibold hover:bg-dall-700 transition-colors"
              >
                Start Quiz ({totalQuestions} Questions)
              </button>
              <Link
                href="/chat"
                className="px-8 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Ask AI Tutor Instead
              </Link>
            </div>
          </div>
        )}

        {/* Active question */}
        {(state === "active" || state === "review") && currentQuestion && (
          <>
            <QuizCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              onHint={() => {}}
              disabled={state === "review"}
              feedback={feedback}
            />
            {state === "review" && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleNext}
                  className="px-8 py-3 bg-dall-600 text-white rounded-xl font-semibold hover:bg-dall-700 transition-colors"
                >
                  {currentIndex + 1 < totalQuestions
                    ? "Next Question"
                    : "See Results"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Results */}
        {state === "results" && (
          <div className="text-center py-8">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
                score >= 70
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-red-100 dark:bg-red-900/30"
              }`}
            >
              <span
                className={`text-3xl font-bold ${
                  score >= 70
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {score.toFixed(0)}%
              </span>
            </div>
            <h2 className="text-2xl font-bold text-dall-900 dark:text-dall-100 mb-2">
              Quiz Complete!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              You got {answers.filter((a) => a.correct).length} out of{" "}
              {totalQuestions} questions correct.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleStart}
                className="px-6 py-2.5 bg-dall-600 text-white rounded-xl font-medium hover:bg-dall-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
