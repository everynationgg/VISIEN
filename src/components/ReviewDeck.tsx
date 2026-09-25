'use client';

import React, { useState } from 'react';
import { AppBrief } from '@/lib/types';
import { CheckCircle2, Edit3, ArrowRight, Sparkles, Send } from 'lucide-react';

interface ReviewDeckProps {
  clientName: string;
  brief: Partial<AppBrief>;
  onConfirm: (notes?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const ReviewDeck: React.FC<ReviewDeckProps> = ({
  clientName,
  brief,
  onConfirm,
  isSubmitting = false,
}) => {
  const [correctionNote, setCorrectionNote] = useState('');
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);

  const handleSubmit = async () => {
    await onConfirm(correctionNote);
  };

  return (
    <div className="review-deck-container">
      {/* Header */}
      <div className="review-header">
        <div className="review-badge">
          <Sparkles size={14} className="badge-icon" />
          <span>Here's What I Understood</span>
        </div>
        <h2 className="review-title">{brief.project_title || 'Your Application Vision'}</h2>
        <p className="review-subtitle">
          Please review how Every Nation GG will understand your project. If anything needs adjusting, let us know below before final submission.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="cards-list">
        {/* Card 1: Core Vision & Problem */}
        <div className="visien-card review-card">
          <h3 className="card-section-title">Core Vision & Problem</h3>
          <p className="card-text"><strong>Summary:</strong> {brief.vision_summary || 'N/A'}</p>
          <p className="card-text"><strong>Problem Solved:</strong> {brief.problem_statement || 'N/A'}</p>
        </div>

        {/* Card 2: Users & Flow */}
        <div className="visien-card review-card">
          <h3 className="card-section-title">Users & Experience</h3>
          <p className="card-text"><strong>Target Users:</strong> {brief.target_users || 'N/A'}</p>
          <p className="card-text"><strong>First Screen:</strong> {brief.first_screen_experience || 'N/A'}</p>
          <p className="card-text"><strong>Core Action:</strong> {brief.core_action || 'N/A'}</p>
        </div>

        {/* Card 3: Look, Feel & Aesthetics */}
        <div className="visien-card review-card">
          <h3 className="card-section-title">Look & Emotional Feel</h3>
          <p className="card-text"><strong>Visual Direction:</strong> {brief.visual_direction || 'N/A'}</p>
          {brief.emotional_ux_feel && brief.emotional_ux_feel.length > 0 && (
            <div className="tags-row">
              {brief.emotional_ux_feel.map((tag, i) => (
                <span key={i} className="visien-chip active">{tag}</span>
              ))}
            </div>
          )}
          {brief.anti_patterns && brief.anti_patterns.length > 0 && (
            <p className="card-text" style={{ marginTop: '8px' }}>
              <strong>Do NOT Want:</strong> {brief.anti_patterns.join(', ')}
            </p>
          )}
        </div>

        {/* Card 4: Blueprint & Scope */}
        <div className="visien-card review-card">
          <h3 className="card-section-title">V1 Launch & Scope</h3>
          {brief.v1_essential_features && brief.v1_essential_features.length > 0 ? (
            <ul className="features-list">
              {brief.v1_essential_features.map((feat, i) => (
                <li key={i}>{feat}</li>
              ))}
            </ul>
          ) : (
            <p className="card-text">Essential features summarized for development.</p>
          )}
          <p className="card-text" style={{ marginTop: '10px' }}>
            <strong>Infrastructure:</strong> {brief.infrastructure_preference || 'ENGG Managed'}
          </p>
        </div>
      </div>

      {/* Clarification / Correction Prompt */}
      <div className="correction-container">
        {!showCorrectionInput ? (
          <button
            type="button"
            className="visien-btn-secondary add-note-btn"
            onClick={() => setShowCorrectionInput(true)}
          >
            <Edit3 size={15} />
            <span>Need to correct or add anything?</span>
          </button>
        ) : (
          <div className="correction-box">
            <label className="correction-label">What should we refine?</label>
            <textarea
              className="correction-textarea"
              rows={3}
              placeholder="e.g., Actually, the core action should also allow guest checkout..."
              value={correctionNote}
              onChange={(e) => setCorrectionNote(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Confirmation Button */}
      <div className="action-row">
        <button
          type="button"
          className="visien-btn-primary confirm-btn"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span>Finalizing Brief...</span>
          ) : (
            <>
              <span>Confirm & Submit to Every Nation GG</span>
              <CheckCircle2 size={18} />
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        .review-deck-container {
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
          padding: 16px 16px 40px 16px;
        }

        .review-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .review-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--violet-soft);
          color: var(--violet-deep);
          font-size: 12.5px;
          font-weight: 700;
          border-radius: var(--radius-full);
          margin-bottom: 10px;
        }

        .review-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 8px;
        }

        .review-subtitle {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .cards-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 24px;
        }

        .review-card {
          padding: 18px 20px;
        }

        .card-section-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--violet-deep);
          margin-bottom: 8px;
        }

        .card-text {
          font-size: 13.5px;
          color: var(--text-main);
          line-height: 1.5;
          margin-bottom: 6px;
        }

        .tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 8px;
        }

        .features-list {
          padding-left: 20px;
          font-size: 13.5px;
          color: var(--text-main);
          line-height: 1.6;
        }

        .correction-container {
          margin-bottom: 24px;
          text-align: center;
        }

        .add-note-btn {
          width: 100%;
          gap: 8px;
        }

        .correction-box {
          text-align: left;
        }

        .correction-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .correction-textarea {
          width: 100%;
          padding: 12px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          font-family: inherit;
          font-size: 14px;
          outline: none;
          background: #FFFFFF;
          color: var(--text-main);
        }

        .correction-textarea:focus {
          border-color: var(--violet-primary);
        }

        .action-row {
          width: 100%;
        }

        .confirm-btn {
          width: 100%;
          padding: 16px 24px;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};
