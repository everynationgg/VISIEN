import React, { useState } from 'react';
import { AppBrief } from '@/lib/types';
import { downloadBlueprintMarkdown } from '@/lib/blueprintExport';
import {
  CheckCircle2,
  Edit3,
  ArrowRight,
  Sparkles,
  Send,
  Download,
  Printer,
} from 'lucide-react';

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
          {brief.current_workflow && (
            <p className="card-text"><strong>Current Workflow:</strong> {brief.current_workflow}</p>
          )}
        </div>

        {/* Card 2: Platform, Specs & User Journey */}
        <div className="visien-card review-card">
          <h3 className="card-section-title">Platform, Specs & Flow</h3>
          <p className="card-text"><strong>Target Platform:</strong> {brief.target_platform || brief.raw_json?.target_platform || 'iOS/Android & Web'}</p>
          <p className="card-text"><strong>Payments & Integrations:</strong> {brief.payments_integrations || brief.raw_json?.payments_integrations || 'Not specified'}</p>
          <p className="card-text"><strong>Target Users:</strong> {brief.target_users || 'N/A'}</p>
          <p className="card-text"><strong>Core User Journey:</strong> {brief.core_action || 'N/A'}</p>
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
          {(brief.target_timeline || brief.raw_json?.target_timeline) && (
            <p className="card-text" style={{ marginTop: '8px' }}>
              <strong>Launch Timeline:</strong> {brief.target_timeline || brief.raw_json?.target_timeline}
            </p>
          )}
          <p className="card-text" style={{ marginTop: '6px' }}>
            <strong>Infrastructure:</strong> {brief.infrastructure_preference || 'ENGG Managed'}
          </p>
        </div>

        {/* Card 5: Architecture & Investment */}
        <div className="visien-card review-card">
          <h3 className="card-section-title">Architecture, Devices & Investment</h3>
          {(brief.user_roles || brief.raw_json?.user_roles) && (
            <p className="card-text"><strong>User Roles & Access:</strong> {brief.user_roles || brief.raw_json?.user_roles}</p>
          )}
          {(brief.auth_requirements || brief.raw_json?.auth_requirements) && (
            <p className="card-text"><strong>Authentication / Login:</strong> {brief.auth_requirements || brief.raw_json?.auth_requirements}</p>
          )}
          {(brief.notifications_channels || brief.raw_json?.notifications_channels) && (
            <p className="card-text"><strong>Notifications & Alerts:</strong> {brief.notifications_channels || brief.raw_json?.notifications_channels}</p>
          )}
          {(brief.hardware_capabilities || brief.raw_json?.hardware_capabilities) && (
            <p className="card-text"><strong>Hardware & Device Specs:</strong> {brief.hardware_capabilities || brief.raw_json?.hardware_capabilities}</p>
          )}
          {(brief.data_readiness || brief.raw_json?.data_readiness) && (
            <p className="card-text"><strong>Data & Brand Readiness:</strong> {brief.data_readiness || brief.raw_json?.data_readiness}</p>
          )}
          {(brief.budget_range || brief.raw_json?.budget_range) && (
            <p className="card-text" style={{ marginTop: '6px', color: 'var(--violet-primary)', fontWeight: 600 }}>
              <strong>Target Budget / Investment:</strong> {brief.budget_range || brief.raw_json?.budget_range}
            </p>
          )}
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

      {/* Confirmation & Export Buttons */}
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

        <div className="secondary-actions-row">
          <button
            type="button"
            className="visien-btn-secondary export-btn"
            onClick={() => downloadBlueprintMarkdown(brief, clientName)}
            title="Download complete technical blueprint as Markdown"
          >
            <Download size={14} />
            <span>Export Blueprint (.md)</span>
          </button>
          <button
            type="button"
            className="visien-btn-secondary print-btn"
            onClick={() => window.print()}
            title="Print or Save as PDF"
          >
            <Printer size={14} />
            <span>Print / PDF</span>
          </button>
        </div>
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

        .concept-card {
          border: 1.5px solid rgba(139, 92, 246, 0.25);
          background: linear-gradient(180deg, #FFFFFF 0%, rgba(245, 243, 255, 0.4) 100%);
        }

        .concept-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: var(--violet-soft);
          color: var(--violet-deep);
          font-size: 11.5px;
          font-weight: 700;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .concept-subtext {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 14px;
        }

        .concept-image-wrapper {
          width: 100%;
          max-width: 380px;
          margin: 0 auto 16px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05);
          background: #000;
        }

        .concept-image {
          width: 100%;
          height: auto;
          display: block;
          transition: transform 0.3s ease;
        }

        .concept-feedback-section {
          padding-top: 14px;
          border-top: 1px solid var(--border-subtle);
          text-align: center;
        }

        .feedback-prompt {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 10px;
        }

        .feedback-btn-group {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .concept-feedback-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          background: #FFFFFF;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .concept-feedback-btn:hover {
          border-color: var(--violet-primary);
          color: var(--violet-deep);
        }

        .concept-feedback-btn.selected-like {
          background: #DCFCE7;
          border-color: #16A34A;
          color: #166534;
          box-shadow: 0 2px 8px rgba(22, 163, 74, 0.15);
        }

        .concept-feedback-btn.selected-dislike {
          background: #FEE2E2;
          border-color: #DC2626;
          color: #991B1B;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.15);
        }

        .concept-note-box {
          margin-top: 12px;
          max-width: 440px;
          margin-left: auto;
          margin-right: auto;
        }

        .concept-note-field {
          width: 100%;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          font-size: 13px;
          outline: none;
          background: #FFFFFF;
          color: var(--text-main);
        }

        .concept-note-field:focus {
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

        .secondary-actions-row {
          display: flex;
          gap: 10px;
          margin-top: 12px;
          width: 100%;
        }

        .export-btn,
        .print-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 11px 16px;
          font-size: 13.5px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};
