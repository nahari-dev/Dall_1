"use client";

import { useState } from "react";

interface QuizCardProps {
  question: {
    id: string;
    topic: string;
    subtopic: string;
    difficulty: string;
    text: string;
    options: Record<string, string>;
    time_limit: number;
  };
  onAnswer: (answer: string) => void;
  onHint: () => void;
  disabled?: boolean;
  feedback?: {
    is_correct: boolean;
    correct_answer: string;
    explanation: string;
  } | null;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  hard: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function QuizCard({
  question,
  onAnswer,
  onHint,
  disabled,
  feedback,
}: QuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (key: string) => {
    if (disabled || feedback) return;
    setSelected(key);
  };

  const handleSubmit = () => {
    if (selected && !disabled && !feedback) {
      onAnswer(selected);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {question.topic}
          </span>
          <span className="text-xs text-slate-400">/</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {question.subtopic}
          </span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            difficultyColors[question.difficulty] || difficultyColors.medium
          }`}
        >
          {question.difficulty}
        </span>
      </div>

      {/* Question */}
      <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed mb-6">
        {question.text}
      </p>

      {/* Options */}
      <div className="space-y-3 mb-6">
        {Object.entries(question.options).map(([key, value]) => {
          let optionStyle =
            "border-slate-200 dark:border-slate-700 hover:border-dall-400 dark:hover:border-dall-500";

          if (feedback) {
            if (key === feedback.correct_answer) {
              optionStyle =
                "border-green-500 bg-green-50 dark:bg-green-900/30 dark:border-green-500";
            } else if (key === selected && !feedback.is_correct) {
              optionStyle =
                "border-red-500 bg-red-50 dark:bg-red-900/30 dark:border-red-500";
            }
          } else if (key === selected) {
            optionStyle = "border-dall-500 bg-dall-50 dark:bg-dall-900/30";
          }

          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              disabled={disabled || !!feedback}
              className={`w-full text-left p-3 rounded-xl border-2 transition-all ${optionStyle}`}
            >
              <span className="inline-flex items-center gap-3">
                <span className="w-7 h-7 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold shrink-0">
                  {key}
                </span>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {value}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl mb-4 ${
            feedback.is_correct
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}
        >
          <div
            className={`text-sm font-medium mb-2 ${
              feedback.is_correct
                ? "text-green-700 dark:text-green-300"
                : "text-red-700 dark:text-red-300"
            }`}
          >
            {feedback.is_correct ? "Correct!" : "Incorrect"}
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {feedback.explanation}
          </p>
        </div>
      )}

      {/* Actions */}
      {!feedback && (
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!selected || disabled}
            className="flex-1 py-2.5 bg-dall-600 text-white rounded-xl font-medium hover:bg-dall-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Submit Answer
          </button>
          <button
            onClick={onHint}
            disabled={disabled}
            className="px-4 py-2.5 border border-dall-300 dark:border-dall-700 text-dall-700 dark:text-dall-100 rounded-xl font-medium hover:bg-dall-50 dark:hover:bg-dall-900/30 disabled:opacity-50 transition-colors text-sm"
          >
            Hint
          </button>
        </div>
      )}
    </div>
  );
}
