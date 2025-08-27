"use client";

import React from "react";
import { MatchAnalysis } from "@/types";
import { CheckCircle, AlertCircle, Lightbulb, TrendingUp } from "lucide-react";

interface MatchAnalysisPanelProps {
  analysis: MatchAnalysis;
  onApplyRecommendations?: () => void;
}

export const MatchAnalysisPanel: React.FC<MatchAnalysisPanelProps> = ({
  analysis,
  onApplyRecommendations,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Score Header */}
      <div
        className={`flex items-center justify-between rounded-xl border p-4 ${getScoreColor(analysis.score)}`}
      >
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6" />
          <div>
            <h3 className="text-lg font-bold">Match Score</h3>
            <p className="text-xs opacity-80">Based on job requirements</p>
          </div>
        </div>
        <div className="text-3xl font-bold">{analysis.score}%</div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Strengths */}
        <div>
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
            <CheckCircle className="h-4 w-4 text-green-500" /> Strengths
          </h4>
          <ul className="space-y-2">
            {analysis.strengths.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded bg-slate-50 p-2 text-sm text-slate-600"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Gaps */}
        <div>
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
            <AlertCircle className="h-4 w-4 text-orange-500" /> Missing / Gaps
          </h4>
          <ul className="space-y-2">
            {analysis.gaps.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded bg-slate-50 p-2 text-sm text-slate-600"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
            <Lightbulb className="h-4 w-4 text-blue-500" /> AI Recommendations
          </h4>
          <ul className="mb-4 space-y-2">
            {analysis.recommendations.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 rounded border border-blue-100 bg-blue-50 p-2 text-sm text-slate-600"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
                {item}
              </li>
            ))}
          </ul>

          {onApplyRecommendations && (
            <button
              onClick={onApplyRecommendations}
              className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Edit Resume to Improve Match
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
