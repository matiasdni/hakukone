"use client";

import React from "react";
import { ResumeReview, CoverLetterReview } from "@/types";
import { ThumbsUp, AlertTriangle, Lightbulb, Sparkles } from "lucide-react";

interface ReviewPanelProps {
  review: ResumeReview | CoverLetterReview;
  type: "resume" | "coverLetter";
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({ review }) => {
  const isResumeReview = (
    r: ResumeReview | CoverLetterReview
  ): r is ResumeReview => "issues" in r;

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Overall Summary */}
      <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
        <h3 className="mb-2 flex items-center gap-2 font-bold text-purple-900">
          <Sparkles className="h-4 w-4 text-purple-600" />
          AI Feedback
        </h3>
        <p className="text-sm leading-relaxed text-purple-800">
          {review.overallFeedback}
        </p>
        {!isResumeReview(review) && (
          <div className="mt-2 text-xs font-semibold tracking-wider text-purple-600 uppercase">
            Tone: {review.toneAssessment}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Strengths (Resume Only) */}
        {isResumeReview(review) && review.strengths.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <ThumbsUp className="h-4 w-4 text-green-500" /> What Works
            </h4>
            <ul className="space-y-2">
              {review.strengths.map((item, i) => (
                <li
                  key={i}
                  className="rounded border border-slate-100 bg-white p-2 text-sm text-slate-600"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Issues / Improvements */}
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            {isResumeReview(review) ? "Issues Detected" : "Suggestions"}
          </h4>
          <ul className="space-y-2">
            {(isResumeReview(review) ? review.issues : review.suggestions).map(
              (item, i) => (
                <li
                  key={i}
                  className="rounded border border-slate-100 bg-white p-2 text-sm text-slate-600"
                >
                  {item}
                </li>
              )
            )}
          </ul>
        </div>

        {/* Suggestions (Resume Only) */}
        {isResumeReview(review) && review.suggestions.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Lightbulb className="h-4 w-4 text-blue-500" /> Actionable Tips
            </h4>
            <ul className="space-y-2">
              {review.suggestions.map((item, i) => (
                <li
                  key={i}
                  className="rounded border border-blue-100 bg-blue-50 p-2 text-sm text-slate-600"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
