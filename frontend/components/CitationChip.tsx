"use client";

import { useState } from "react";
import type { Citation } from "@/lib/api";

export default function CitationChip({ citation }: { citation: Citation }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <span className="relative inline-block">
      <button
        onClick={() => setExpanded(!expanded)}
        className="citation-chip"
        title={citation.source}
      >
        <svg
          className="w-3 h-3 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
          />
        </svg>
        {citation.source.length > 30
          ? citation.source.slice(0, 30) + "..."
          : citation.source}
      </button>

      {expanded && (
        <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
          <div className="text-xs font-medium text-dall-700 dark:text-dall-100 mb-1">
            Source Reference
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-300 mb-2">
            {citation.source}
          </div>
          <div className="text-xs text-slate-500">
            Confidence: {(citation.confidence_score ? citation.confidence_score * 100 : 0).toFixed(0)}%
          </div>
          {citation.claim && (
            <div className="mt-2 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-2">
              {citation.claim}
            </div>
          )}
        </div>
      )}
    </span>
  );
}
