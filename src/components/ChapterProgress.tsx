'use client';

import React from 'react';
import { CHAPTERS } from '@/lib/questions';

interface ChapterProgressProps {
  currentChapter: 1 | 2 | 3;
  currentQuestionIndex: number;
  totalQuestions: number;
}

export const ChapterProgress: React.FC<ChapterProgressProps> = ({
  currentChapter,
  currentQuestionIndex,
  totalQuestions,
}) => {
  const currentChapterInfo = CHAPTERS.find((c) => c.id === currentChapter) || CHAPTERS[0];
  const progressPercent = Math.min(
    100,
    Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100)
  );

  return (
    <div className="chapter-progress-container">
      {/* Chapter Indicator Header */}
      <div className="chapter-header">
        <div className="chapter-pill">
          <span className="chapter-number">Chapter {currentChapterInfo.id}</span>
          <span className="chapter-dot" />
          <span className="chapter-name">{currentChapterInfo.title}</span>
        </div>
        <span className="progress-fraction">
          {Math.min(currentQuestionIndex + 1, totalQuestions)} of {totalQuestions}
        </span>
      </div>

      {/* Progress Track */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <style jsx>{`
        .chapter-progress-container {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          padding: 8px 16px;
        }

        .chapter-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .chapter-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          box-shadow: var(--shadow-sm);
        }

        .chapter-number {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--violet-primary);
        }

        .chapter-dot {
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--text-muted);
        }

        .chapter-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-main);
        }

        .progress-fraction {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .progress-track {
          width: 100%;
          height: 4px;
          background: rgba(120, 113, 108, 0.12);
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--violet-primary) 0%, var(--gold-warm) 100%);
          border-radius: 999px;
          transition: width 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};
