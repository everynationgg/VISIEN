'use client';

import React, { useState } from 'react';
import { Session, AppBrief, Message, ProjectProgressStatus } from '@/lib/types';
import { EnosOrb } from '@/components/EnosOrb';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Layers,
  Cpu,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Send,
  MessageSquare,
  FileText,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  User,
  Building,
} from 'lucide-react';

interface ClientProjectTrackerProps {
  session: Session;
  brief: Partial<AppBrief> | null;
  messages: Message[];
  onRefresh: () => Promise<void>;
  onClarificationSubmit: (replyText: string) => Promise<boolean>;
}

export function ClientProjectTracker({
  session,
  brief,
  messages,
  onRefresh,
  onClarificationSubmit,
}: ClientProjectTrackerProps) {
  const [activeTab, setActiveTab] = useState<'brief' | 'transcript'>('brief');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Clarification reply state
  const [clarificationInput, setClarificationInput] = useState(
    session.client_clarification_reply || ''
  );
  const [isSubmittingClarification, setIsSubmittingClarification] = useState(false);
  const [clarificationSuccess, setClarificationSuccess] = useState(false);

  const currentStatus: ProjectProgressStatus = session.project_status || 'received';

  const copySessionCode = () => {
    navigator.clipboard.writeText(session.token);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyTranscript = () => {
    const text = messages
      .map((m) => `${m.role === 'enos' ? 'ENOS (AI Guide)' : session.client_name || 'Client'}: ${m.content}`)
      .join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2200);
  };

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const handleClarificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarificationInput.trim() || isSubmittingClarification) return;

    setIsSubmittingClarification(true);
    const ok = await onClarificationSubmit(clarificationInput.trim());
    setIsSubmittingClarification(false);
    if (ok) {
      setClarificationSuccess(true);
      setTimeout(() => setClarificationSuccess(false), 4000);
    }
  };

  // Pipeline configuration
  const stepsConfig: {
    key: ProjectProgressStatus;
    title: string;
    label: string;
    subtext: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'received',
      title: '1. Discovery Received',
      label: 'Received by ENGG Team',
      subtext: 'Conversation with ENOS received and compiled for ENGG leads.',
      icon: <CheckCircle2 size={18} />,
    },
    {
      key: 'needs_info',
      title: '2. Connecting with You',
      label: 'Needs More Info / Awaiting Contact',
      subtext: 'Team is requesting clarification or reaching out directly.',
      icon: <AlertCircle size={18} />,
    },
    {
      key: 'conceptualizing',
      title: '3. Conceptualizing',
      label: 'Architecture & Solution Design',
      subtext: 'Product architects are structuring core flows and tech options.',
      icon: <Layers size={18} />,
    },
    {
      key: 'processing',
      title: '4. Processing Scope',
      label: 'Technical Scoping & Feasibility',
      subtext: 'Finalizing database schemas, timeline milestones, and build costs.',
      icon: <Cpu size={18} />,
    },
    {
      key: 'ready',
      title: '5. Blueprint Ready',
      label: 'Blueprint & Proposal Ready',
      subtext: 'Production roadmap complete. Ready for vision walkthrough.',
      icon: <Sparkles size={18} />,
    },
  ];

  // Helper to determine step state
  const getStepState = (stepKey: ProjectProgressStatus) => {
    const order: ProjectProgressStatus[] = [
      'received',
      'needs_info',
      'conceptualizing',
      'processing',
      'ready',
    ];
    const currentIndex = order.indexOf(currentStatus);
    const stepIndex = order.indexOf(stepKey);

    if (currentStatus === stepKey) return 'active';
    if (stepKey === 'needs_info') {
      // If we are past needs_info, mark it as resolved/skipped
      return currentIndex > stepIndex ? 'completed' : 'pending';
    }
    return currentIndex >= stepIndex ? 'completed' : 'pending';
  };

  // Hero status details
  const getHeroStatusDetails = () => {
    switch (currentStatus) {
      case 'needs_info':
        return {
          title: 'Needs More Info • Kindly Wait for Our Team to Contact You',
          subtitle:
            'Our engineering leads have reviewed your discovery conversation and need a few clarifications to finalize your app blueprint.',
          badgeClass: 'badge-needs-info',
          badgeText: 'Action Needed / Connecting',
          orbState: 'waiting' as const,
        };
      case 'conceptualizing':
        return {
          title: 'Conceptualizing Your Application Solution',
          subtitle:
            'Our architecture team at Every Nation GG is currently designing your system architecture, data models, and user workflow diagrams.',
          badgeClass: 'badge-conceptualizing',
          badgeText: 'In Progress: Solution Design',
          orbState: 'thinking' as const,
        };
      case 'processing':
        return {
          title: 'Processing Scope & Technical Feasibility',
          subtitle:
            'We are scoping third-party integrations, infrastructure sizing, target delivery timelines, and budget breakdown.',
          badgeClass: 'badge-processing',
          badgeText: 'In Progress: Technical Scoping',
          orbState: 'speaking' as const,
        };
      case 'ready':
        return {
          title: 'Application Blueprint & Proposal Ready',
          subtitle:
            'Your comprehensive app vision blueprint is finalized! An Every Nation GG lead will reach out to schedule your walkthrough.',
          badgeClass: 'badge-ready',
          badgeText: 'Completed & Ready',
          orbState: 'idle' as const,
        };
      case 'received':
      default:
        return {
          title: 'Conversation with ENOS Received by ENGG Team',
          subtitle:
            'Your app discovery has been compiled and safely delivered to Every Nation GG. Our team is reviewing your vision.',
          badgeClass: 'badge-received',
          badgeText: 'Received by ENGG',
          orbState: 'idle' as const,
        };
    }
  };

  const heroDetails = getHeroStatusDetails();
  const lastUpdated = session.project_status_updated_at || session.updated_at || session.created_at;

  return (
    <div className="tracker-container">
      {/* Top Bar */}
      <header className="tracker-topbar">
        <div className="topbar-brand">
          <div className="topbar-orb-dot" />
          <span className="brand-name">VISIEN</span>
          <span className="brand-divider">/</span>
          <span className="brand-company">Every Nation GG</span>
        </div>

        <div className="topbar-right">
          <div className="session-code-badge" onClick={copySessionCode} title="Click to copy session code">
            <span className="code-label">Session Code</span>
            <code className="code-val">{session.token}</code>
            <button type="button" className="code-copy-btn">
              {copiedCode ? <Check size={13} color="#16A34A" /> : <Copy size={13} />}
            </button>
          </div>

          <button
            type="button"
            className="refresh-btn"
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            title="Refresh current status"
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="tracker-main">
        {/* Project Header Banner */}
        <div className="visien-card project-header-card">
          <div className="project-header-left">
            <span className={`status-pill ${heroDetails.badgeClass}`}>
              <span className="pulsing-dot" />
              {heroDetails.badgeText}
            </span>
            <h1 className="project-title">
              {brief?.project_title || 'Application Blueprint Discovery'}
            </h1>
            <div className="project-meta-row">
              <span className="meta-item">
                <User size={13} />
                <strong>{session.client_name || 'Client'}</strong>
              </span>
              {session.company && (
                <span className="meta-item">
                  <Building size={13} />
                  <span>{session.company}</span>
                </span>
              )}
              <span className="meta-item">
                <Clock size={13} />
                <span>
                  Updated {new Date(lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </span>
            </div>
          </div>
          <div className="project-header-orb">
            <EnosOrb state={heroDetails.orbState} size={84} />
          </div>
        </div>

        {/* Current Status Highlights Box */}
        <div className="visien-card status-hero-card">
          <div className="hero-text-content">
            <h2 className="hero-status-title">{heroDetails.title}</h2>
            <p className="hero-status-desc">{heroDetails.subtitle}</p>

            {/* Custom ENGG Team Note */}
            {session.project_status_note && (
              <div className="engg-note-box">
                <div className="note-box-header">
                  <MessageSquare size={14} className="note-icon" />
                  <span>Update from Every Nation GG Engineering:</span>
                </div>
                <p className="note-box-body">"{session.project_status_note}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Interactive Clarification Box (Active when needs_info) */}
        {currentStatus === 'needs_info' && (
          <div className="visien-card clarification-card">
            <div className="clarification-header">
              <div className="clarification-icon-wrap">
                <AlertCircle size={20} color="#EA580C" />
              </div>
              <div>
                <h3 className="clarification-title">Action Requested: Clarify Your Project Details</h3>
                <p className="clarification-desc">
                  You can submit a quick note directly to our engineering leads below, or wait for our team to contact you via email.
                </p>
              </div>
            </div>

            <form onSubmit={handleClarificationSubmit} className="clarification-form">
              <label className="clarification-input-label">
                Your Clarification or Additional Notes:
              </label>
              <textarea
                className="clarification-textarea"
                rows={3}
                placeholder="e.g. For our v1 MVP, we want Web first, and we prefer Stripe for payments..."
                value={clarificationInput}
                onChange={(e) => setClarificationInput(e.target.value)}
              />

              <div className="clarification-form-footer">
                {session.client_clarification_reply && (
                  <span className="prev-reply-note">
                    ✓ Last submitted on{' '}
                    {new Date(session.client_clarification_replied_at || Date.now()).toLocaleDateString()}:
                    "{session.client_clarification_reply}"
                  </span>
                )}
                <button
                  type="submit"
                  className="visien-btn-primary send-clarification-btn"
                  disabled={!clarificationInput.trim() || isSubmittingClarification}
                >
                  <Send size={14} />
                  <span>{isSubmittingClarification ? 'Submitting...' : 'Send to ENGG Team'}</span>
                </button>
              </div>
            </form>

            {clarificationSuccess && (
              <div className="clarification-success-banner">
                <Check size={14} />
                <span>Your clarification was successfully delivered to the Every Nation GG team!</span>
              </div>
            )}
          </div>
        )}

        {/* Visual Progress Stepper (Pipeline Timeline) */}
        <div className="visien-card stepper-card">
          <h3 className="stepper-section-title">
            <span>Project Progression Timeline</span>
            <span className="stepper-count">Step {stepsConfig.findIndex((s) => s.key === currentStatus) + 1} of 5</span>
          </h3>

          <div className="stepper-list">
            {stepsConfig.map((st, idx) => {
              const state = getStepState(st.key);
              return (
                <div key={st.key} className={`stepper-step-item state-${state}`}>
                  <div className="step-indicator-col">
                    <div className="step-circle">
                      {state === 'completed' ? (
                        <Check size={14} />
                      ) : state === 'active' ? (
                        <span className="step-active-dot" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    {idx < stepsConfig.length - 1 && <div className="step-line" />}
                  </div>

                  <div className="step-details-col">
                    <div className="step-title-row">
                      <h4 className="step-title">{st.title}</h4>
                      <span className={`step-state-badge state-${state}`}>
                        {state === 'completed'
                          ? 'Completed'
                          : state === 'active'
                          ? 'In Progress'
                          : 'Upcoming'}
                      </span>
                    </div>
                    <p className="step-desc">{st.subtext}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabbed Inspector: App Brief vs Transcript */}
        <div className="visien-card tabs-card">
          <div className="tabs-bar">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'brief' ? 'active' : ''}`}
              onClick={() => setActiveTab('brief')}
            >
              <FileText size={15} />
              <span>App Vision Blueprint</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'transcript' ? 'active' : ''}`}
              onClick={() => setActiveTab('transcript')}
            >
              <MessageSquare size={15} />
              <span>Full ENOS Conversation ({messages.length})</span>
            </button>

            {activeTab === 'transcript' && (
              <button
                type="button"
                className="tab-action-btn"
                onClick={copyTranscript}
                title="Copy conversation transcript"
              >
                {copiedTranscript ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                <span>{copiedTranscript ? 'Copied' : 'Copy Transcript'}</span>
              </button>
            )}
          </div>

          <div className="tab-content-body">
            {activeTab === 'brief' ? (
              brief ? (
                <div className="brief-preview-grid">
                  <div className="brief-field">
                    <label>Vision Summary</label>
                    <p>{brief.vision_summary || 'Not specified'}</p>
                  </div>
                  <div className="brief-field">
                    <label>Problem Statement</label>
                    <p>{brief.problem_statement || 'Not specified'}</p>
                  </div>
                  <div className="brief-field">
                    <label>Target Users</label>
                    <p>{brief.target_users || 'Not specified'}</p>
                  </div>
                  <div className="brief-field">
                    <label>Core Action</label>
                    <p>{brief.core_action || 'Not specified'}</p>
                  </div>
                  {brief.v1_essential_features && brief.v1_essential_features.length > 0 && (
                    <div className="brief-field full-span">
                      <label>Essential V1 Features</label>
                      <ul className="features-list">
                        {brief.v1_essential_features.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {brief.visual_direction && (
                    <div className="brief-field">
                      <label>Visual Direction & Aesthetics</label>
                      <p>{brief.visual_direction}</p>
                    </div>
                  )}
                  {brief.target_platform && (
                    <div className="brief-field">
                      <label>Target Platform</label>
                      <p>{brief.target_platform}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-tab-state">
                  <p>Synthesizing app brief...</p>
                </div>
              )
            ) : (
              <div className="transcript-chat-list">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`transcript-msg ${m.role === 'enos' ? 'msg-enos' : 'msg-client'}`}
                  >
                    <div className="msg-header">
                      <span className="msg-author">
                        {m.role === 'enos' ? 'ENOS (AI Guide)' : session.client_name || 'Client'}
                      </span>
                      <span className="msg-time">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="msg-text">{m.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security / Reassurance Footer */}
        <footer className="tracker-footer">
          <div className="security-badge">
            <ShieldCheck size={14} />
            <span>Private discovery session secured by Every Nation GG. Return anytime using code <strong>{session.token}</strong>.</span>
          </div>
          <a href="/" className="return-home-link">
            Return to Homepage →
          </a>
        </footer>
      </main>

      <style jsx>{`
        .tracker-container {
          min-height: 100dvh;
          background-color: var(--bg-cream);
          padding-bottom: 48px;
        }

        .tracker-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .topbar-brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .topbar-orb-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--violet-primary), var(--gold-warm));
          box-shadow: 0 0 8px var(--violet-glow);
        }

        .brand-name {
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: 0.05em;
        }

        .brand-divider {
          color: var(--text-muted);
        }

        .brand-company {
          color: var(--text-secondary);
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .session-code-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: #FFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-size: 13px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .session-code-badge:hover {
          border-color: var(--violet-primary);
        }

        .code-label {
          color: var(--text-muted);
          font-size: 11.5px;
        }

        .code-val {
          font-weight: 700;
          color: var(--violet-deep);
          letter-spacing: 0.05em;
        }

        .code-copy-btn {
          background: none;
          border: none;
          padding: 0;
          display: inline-flex;
          cursor: pointer;
          color: var(--text-muted);
        }

        .refresh-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: #FFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .refresh-btn:hover:not(:disabled) {
          border-color: var(--violet-primary);
          color: var(--violet-deep);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .tracker-main {
          max-width: 860px;
          margin: 0 auto;
          padding: 28px 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .project-header-card {
          padding: 24px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 243, 255, 0.85));
        }

        .project-header-left {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          width: fit-content;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.03em;
        }

        .pulsing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.2); }
        }

        .badge-received {
          background: #F3F4F6;
          color: #4B5563;
        }

        .badge-needs-info {
          background: #FFEDD5;
          color: #C2410C;
        }

        .badge-conceptualizing {
          background: #EDE9FE;
          color: #6D28D9;
        }

        .badge-processing {
          background: #E0E7FF;
          color: #3730A3;
        }

        .badge-ready {
          background: #DCFCE7;
          color: #15803D;
        }

        .project-title {
          font-size: 26px;
          font-weight: 800;
          color: var(--text-main);
          letter-spacing: -0.01em;
        }

        .project-meta-row {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 13px;
          color: var(--text-muted);
          flex-wrap: wrap;
        }

        .meta-item {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        .status-hero-card {
          padding: 24px 28px;
        }

        .hero-status-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .hero-status-desc {
          font-size: 14.5px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .engg-note-box {
          margin-top: 16px;
          padding: 14px 18px;
          background: rgba(124, 58, 237, 0.05);
          border-left: 3px solid var(--violet-primary);
          border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
        }

        .note-box-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--violet-deep);
          margin-bottom: 4px;
        }

        .note-box-body {
          font-size: 14px;
          font-style: italic;
          color: var(--text-main);
          line-height: 1.5;
        }

        .clarification-card {
          padding: 24px 28px;
          border: 1.5px solid rgba(234, 88, 12, 0.4);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 247, 237, 0.9));
        }

        .clarification-header {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .clarification-icon-wrap {
          padding: 8px;
          background: #FFEDD5;
          border-radius: 50%;
          display: flex;
        }

        .clarification-title {
          font-size: 17px;
          font-weight: 700;
          color: #9A3412;
          margin-bottom: 4px;
        }

        .clarification-desc {
          font-size: 13.5px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .clarification-form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .clarification-input-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
        }

        .clarification-textarea {
          width: 100%;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          outline: none;
          background: #FFF;
          color: var(--text-main);
        }

        .clarification-textarea:focus {
          border-color: var(--gold-warm);
        }

        .clarification-form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .prev-reply-note {
          font-size: 12.5px;
          color: #15803D;
          font-weight: 500;
        }

        .send-clarification-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          font-size: 13.5px;
          margin-left: auto;
        }

        .clarification-success-banner {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 12px;
          padding: 10px 14px;
          background: #DCFCE7;
          border: 1px solid #86EFAC;
          border-radius: var(--radius-sm);
          font-size: 13px;
          color: #166534;
          font-weight: 600;
        }

        .stepper-card {
          padding: 24px 28px;
        }

        .stepper-section-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .stepper-count {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--violet-primary);
          background: var(--violet-soft);
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }

        .stepper-list {
          display: flex;
          flex-direction: column;
        }

        .stepper-step-item {
          display: flex;
          gap: 16px;
          position: relative;
        }

        .step-indicator-col {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          z-index: 2;
          transition: all var(--transition-fast);
        }

        .state-completed .step-circle {
          background: #16A34A;
          color: #FFF;
        }

        .state-active .step-circle {
          background: var(--violet-primary);
          color: #FFF;
          box-shadow: 0 0 12px var(--violet-glow);
        }

        .state-pending .step-circle {
          background: #E5E7EB;
          color: #9CA3AF;
        }

        .step-active-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #FFF;
        }

        .step-line {
          width: 2px;
          flex-grow: 1;
          min-height: 36px;
          background: #E5E7EB;
          margin: 4px 0;
        }

        .state-completed .step-line {
          background: #16A34A;
        }

        .step-details-col {
          padding-bottom: 24px;
          flex-grow: 1;
        }

        .step-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .step-title {
          font-size: 14.5px;
          font-weight: 700;
          color: var(--text-main);
        }

        .step-desc {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .step-state-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .step-state-badge.state-completed {
          background: #DCFCE7;
          color: #166534;
        }

        .step-state-badge.state-active {
          background: var(--violet-soft);
          color: var(--violet-deep);
        }

        .step-state-badge.state-pending {
          background: #F3F4F6;
          color: #9CA3AF;
        }

        .tabs-card {
          padding: 0;
          overflow: hidden;
        }

        .tabs-bar {
          display: flex;
          align-items: center;
          border-bottom: 1px solid var(--border-subtle);
          padding: 8px 16px 0;
          background: rgba(250, 247, 242, 0.7);
        }

        .tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tab-btn.active {
          color: var(--violet-deep);
          border-bottom-color: var(--violet-primary);
        }

        .tab-action-btn {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #FFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .tab-content-body {
          padding: 20px 24px;
        }

        .brief-preview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .brief-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .brief-field.full-span {
          grid-column: span 2;
        }

        .brief-field label {
          font-size: 11.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }

        .brief-field p {
          font-size: 13.5px;
          color: var(--text-main);
          line-height: 1.5;
        }

        .features-list {
          padding-left: 18px;
          font-size: 13.5px;
          color: var(--text-main);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .empty-tab-state {
          padding: 32px;
          text-align: center;
          color: var(--text-muted);
        }

        .transcript-chat-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 480px;
          overflow-y: auto;
          padding-right: 6px;
        }

        .transcript-msg {
          padding: 12px 16px;
          border-radius: var(--radius-md);
        }

        .msg-enos {
          background: var(--violet-subtle);
          border-left: 3px solid var(--violet-primary);
        }

        .msg-client {
          background: var(--gold-subtle);
          border-left: 3px solid var(--gold-warm);
        }

        .msg-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .msg-author {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-main);
        }

        .msg-time {
          font-size: 11px;
          color: var(--text-muted);
        }

        .msg-text {
          font-size: 13.5px;
          line-height: 1.5;
          color: var(--text-main);
          white-space: pre-wrap;
        }

        .tracker-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .security-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: var(--text-muted);
        }

        .return-home-link {
          font-size: 13px;
          font-weight: 600;
          color: var(--violet-deep);
          text-decoration: none;
        }

        .return-home-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .project-header-card {
            flex-direction: column-reverse;
            text-align: center;
            gap: 16px;
          }
          .project-header-left {
            align-items: center;
          }
          .project-meta-row {
            justify-content: center;
          }
          .brief-preview-grid {
            grid-template-columns: 1fr;
          }
          .brief-field.full-span {
            grid-column: span 1;
          }
          .tracker-topbar {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
          .topbar-right {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}
