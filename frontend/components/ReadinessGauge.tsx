"use client";

interface ReadinessGaugeProps {
  percentage: number;
  passScore: number;
  label?: string;
}

export default function ReadinessGauge({
  percentage,
  passScore,
  label = "Exam Readiness",
}: ReadinessGaugeProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = (percentage / 100) * circumference;
  const isReady = percentage >= passScore;

  const color = isReady
    ? "text-accent-emerald"
    : percentage >= passScore * 0.8
    ? "text-accent-gold"
    : "text-accent-coral";

  const strokeColor = isReady
    ? "#10b981"
    : percentage >= passScore * 0.8
    ? "#f4b942"
    : "#f43f5e";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Progress arc */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
          />
          {/* Pass score marker */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`2 ${circumference - 2}`}
            strokeDashoffset={circumference - (passScore / 100) * circumference}
            className="text-slate-400 dark:text-slate-500"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>
            {percentage.toFixed(0)}%
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {label}
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isReady ? "bg-accent-emerald" : "bg-accent-coral"
          }`}
        />
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {isReady ? "On track to pass" : `Need ${passScore}% to pass`}
        </span>
      </div>
    </div>
  );
}
