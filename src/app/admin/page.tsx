'use client';

import React, { useState, useEffect } from 'react';
import { Session, AppBrief, Message } from '@/lib/types';
import {
  Sparkles,
  Plus,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  FileText,
  Clock,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');

  // New Session Form State
  const [showNewModal, setShowNewModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Inspector Drawer State
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [selectedBrief, setSelectedBrief] = useState<any | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'brief' | 'transcript'>('brief');
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sessions');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, company, email }),
      });
      const data = await res.json();
      if (data.token) {
        setCreatedToken(data.token);
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const openSessionDetails = async (session: any) => {
    setSelectedSession(session);
    const initialBrief = Array.isArray(session.app_briefs)
      ? session.app_briefs[0]
      : session.app_briefs;
    setSelectedBrief(initialBrief || null);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/session/${session.token}`);
      const data = await res.json();
      setSessionMessages(data.messages || []);
      if (data.brief) {
        setSelectedBrief(data.brief);
      }
      if (data.session) {
        setSelectedSession((prev: any) => ({ ...prev, ...data.session }));
      }
    } catch (err) {
      console.error('Error fetching session details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const copyFullTranscript = () => {
    if (!selectedSession || sessionMessages.length === 0) return;
    const client = selectedSession.client_name || 'Client';
    const company = selectedSession.company ? ` (${selectedSession.company})` : '';
    const date = new Date(selectedSession.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const header = [
      `==================================================`,
      `VISIEN DISCOVERY TRANSCRIPT`,
      `Client: ${client}${company}`,
      `Token: ${selectedSession.token}`,
      `Status: ${selectedSession.status?.toUpperCase() || 'UNKNOWN'}`,
      `Date: ${date}`,
      `Total Turns: ${sessionMessages.length}`,
      `==================================================\n`,
    ].join('\n');

    const body = sessionMessages
      .map((m) => {
        const roleLabel = m.role === 'enos' ? 'ENOS (AI Guide)' : client;
        return `[${roleLabel}]:\n${m.content}\n`;
      })
      .join('\n');

    navigator.clipboard.writeText(`${header}\n${body}`);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2200);
  };

  const copyBriefAsMarkdown = () => {
    if (!selectedBrief) return;
    const client = selectedBrief.client_name || selectedSession?.client_name || 'Client';
    const company = selectedBrief.company ? ` (${selectedBrief.company})` : '';

    const md = [
      `# ${selectedBrief.project_title || 'VISIEN App Brief'}`,
      `**Client:** ${client}${company}`,
      `**Session Token:** ${selectedSession?.token || 'N/A'}`,
      `**Status:** ${selectedSession?.status?.toUpperCase() || 'COMPLETED'}`,
      `**Date:** ${new Date(selectedBrief.created_at || Date.now()).toLocaleDateString()}`,
      ``,
      `---`,
      ``,
      `## 1. Executive Summary & Vision`,
      selectedBrief.vision_summary || 'Not specified',
      ``,
      `## 2. Core Problem Statement`,
      selectedBrief.problem_statement || 'Not specified',
      ``,
      `## 3. Platform & Target Users`,
      `- **Target Platform:** ${selectedBrief.target_platform || selectedBrief.raw_json?.target_platform || 'Not specified'}`,
      `- **Payments & Integrations:** ${selectedBrief.payments_integrations || selectedBrief.raw_json?.payments_integrations || 'Not specified'}`,
      `- **Target Users:** ${selectedBrief.target_users || 'Not specified'}`,
      `- **Moment of Use:** ${selectedBrief.moment_of_use || 'Not specified'}`,
      ``,
      `## 4. First Screen & Core Action`,
      `- **First Screen Experience:** ${selectedBrief.first_screen_experience || 'Not specified'}`,
      `- **Core Action:** ${selectedBrief.core_action || 'Not specified'}`,
      `- **Expected Outcome:** ${selectedBrief.expected_outcome || 'Not specified'}`,
      ``,
      `## 5. Aesthetics & UX Feel`,
      `- **Visual Direction:** ${selectedBrief.visual_direction || 'Not specified'}`,
      `- **Emotional UX Keywords:** ${(selectedBrief.emotional_ux_feel || []).join(', ') || 'Not specified'}`,
      `- **Anti-Patterns / Avoid:** ${(selectedBrief.anti_patterns || []).join(', ') || 'None specified'}`,
      ``,
      `## 6. V1 Essential Features`,
      ...((selectedBrief.v1_essential_features || []).map((f: string) => `- ${f}`)),
      ``,
      `## 7. Business & Infrastructure`,
      `- **Current Workflow:** ${selectedBrief.current_workflow || 'Not specified'}`,
      `- **Business Impact:** ${selectedBrief.business_impact || 'Not specified'}`,
      `- **Launch Timeline:** ${selectedBrief.target_timeline || selectedBrief.raw_json?.target_timeline || 'Not specified'}`,
      `- **Future Horizon:** ${selectedBrief.future_horizon || 'Not specified'}`,
      `- **Infrastructure Preference:** ${selectedBrief.infrastructure_preference || 'ENGG Managed'}`,
      selectedBrief.additional_notes ? `\n## 8. Additional Notes\n${selectedBrief.additional_notes}` : '',
    ].join('\n');

    navigator.clipboard.writeText(md);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2200);
  };

  const handleGenerateBriefAdmin = async () => {
    if (!selectedSession) return;
    setIsGeneratingBrief(true);
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: selectedSession.token }),
      });
      const data = await res.json();
      if (data.brief) {
        setSelectedBrief(data.brief);
        fetchSessions();
      }
    } catch (err) {
      console.error('Error generating brief:', err);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://visien.engg.online';
  };

  return (
    <div className="admin-container">
      {/* Top Navbar */}
      <header className="admin-header">
        <div className="header-left">
          <div className="brand-badge">
            <Sparkles size={14} />
            <span>Every Nation GG</span>
          </div>
          <h1 className="admin-title">VISIEN Admin</h1>
        </div>
        <div className="header-right">
          <button
            type="button"
            className="visien-btn-secondary refresh-btn"
            onClick={fetchSessions}
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            className="visien-btn-primary"
            onClick={() => {
              setCreatedToken(null);
              setClientName('');
              setCompany('');
              setEmail('');
              setShowNewModal(true);
            }}
          >
            <Plus size={16} />
            <span>New Session</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Filters */}
        <div className="filters-bar">
          <button
            type="button"
            className={`visien-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Sessions ({sessions.length})
          </button>
          <button
            type="button"
            className={`visien-chip ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({sessions.filter((s) => s.status === 'completed').length})
          </button>
          <button
            type="button"
            className={`visien-chip ${filter === 'in_progress' ? 'active' : ''}`}
            onClick={() => setFilter('in_progress')}
          >
            In Progress ({sessions.filter((s) => s.status === 'in_progress').length})
          </button>
          <button
            type="button"
            className={`visien-chip ${filter === 'not_started' ? 'active' : ''}`}
            onClick={() => setFilter('not_started')}
          >
            Not Started ({sessions.filter((s) => s.status === 'not_started').length})
          </button>
        </div>

        {/* Sessions Table / Cards */}
        {loading ? (
          <div className="loading-state">
            <p>Loading sessions...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="empty-state visien-card">
            <Layers size={36} color="var(--violet-primary)" />
            <h3 className="empty-title">No discovery sessions found</h3>
            <p className="empty-subtitle">
              Create a private invitation link to send to your next client.
            </p>
          </div>
        ) : (
          <div className="sessions-grid">
            {filteredSessions.map((s) => {
              const brief = Array.isArray(s.app_briefs) ? s.app_briefs[0] : s.app_briefs;
              const shareUrl = `${getBaseUrl()}/i/${s.token}`;

              return (
                <div
                  key={s.id}
                  className="visien-card session-card"
                  onClick={() => openSessionDetails(s)}
                >
                  <div className="session-card-header">
                    <div>
                      <span className={`status-pill ${s.status}`}>
                        {s.status.replace('_', ' ')}
                      </span>
                      <h3 className="client-heading">
                        {s.client_name || 'Unnamed Client'}
                        {s.company && <span className="company-tag"> • {s.company}</span>}
                      </h3>
                    </div>
                    <ChevronRight size={18} color="var(--text-muted)" />
                  </div>

                  {brief?.project_title && (
                    <p className="project-preview-title">
                      ✨ <strong>{brief.project_title}</strong>
                    </p>
                  )}

                  <div className="session-token-row" onClick={(e) => e.stopPropagation()}>
                    <span className="code-pill">Code: <strong>{s.token}</strong></span>
                    <button
                      type="button"
                      className="icon-copy-btn"
                      onClick={() => copyToClipboard(s.token)}
                      title="Copy 6-digit Code"
                    >
                      <Copy size={13} />
                    </button>
                    <a
                      href={`/i/${s.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-copy-btn"
                      title="Open discovery session"
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>

                  <div className="session-card-footer">
                    <span className="date-text">
                      <Clock size={12} />
                      {new Date(s.created_at).toLocaleDateString()}
                    </span>
                    <span className="chapter-tag">
                      Ch. {s.current_chapter || 1} • Q{s.current_question_index + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* New Session Modal */}
      {showNewModal && (
        <div className="modal-backdrop" onClick={() => setShowNewModal(false)}>
          <div className="visien-card modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create Private VISIEN Session</h2>
            <p className="modal-subtitle">
              Generates a secure, unguessable link for your client to begin their AI discovery.
            </p>

            {!createdToken ? (
              <form onSubmit={handleCreateSession} className="new-session-form">
                <div className="field-group">
                  <label className="field-label">Client Name (Optional)</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. John Doe"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Company / Brand (Optional)</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="e.g. ABC Café"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Client Email (Optional)</label>
                  <input
                    type="email"
                    className="field-input"
                    placeholder="e.g. john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="visien-btn-secondary"
                    onClick={() => setShowNewModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="visien-btn-primary"
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creating...' : 'Generate Private Link'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="created-token-view">
                <p className="success-label">🎉 Session Code Ready!</p>

                <div className="code-display-card">
                  <span className="code-badge-label">SESSION CODE</span>
                  <div className="code-number-display">{createdToken}</div>
                  <p className="code-subtext">
                    Give this 6-digit code to your client to enter on your homepage.
                  </p>
                </div>

                <div className="share-actions-group">
                  <button
                    type="button"
                    className="visien-btn-primary copy-large-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(createdToken || '');
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2200);
                    }}
                  >
                    {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedCode ? 'Code Copied!' : `Copy Code: ${createdToken}`}</span>
                  </button>

                  <button
                    type="button"
                    className="visien-btn-secondary"
                    onClick={() => {
                      const msg = `Hi ${clientName || 'there'}! Here is your private VISIEN session code: ${createdToken}\n\nEnter it at ${getBaseUrl()} to begin your app discovery session.`;
                      navigator.clipboard.writeText(msg);
                      setCopiedMsg(true);
                      setTimeout(() => setCopiedMsg(false), 2200);
                    }}
                  >
                    {copiedMsg ? <Check size={15} /> : <MessageSquare size={15} />}
                    <span>{copiedMsg ? 'Message Copied!' : 'Copy Invitation Message'}</span>
                  </button>

                  <button
                    type="button"
                    className="visien-btn-secondary close-btn"
                    onClick={() => setShowNewModal(false)}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Session Details Drawer */}
      {selectedSession && (
        <div className="drawer-backdrop" onClick={() => setSelectedSession(null)}>
          <div className="drawer-panel visien-card" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className={`status-pill ${selectedSession.status}`}>
                  {selectedSession.status.replace('_', ' ')}
                </span>
                <h2 className="drawer-title">
                  {selectedSession.client_name || 'Client Session'}
                </h2>
                <p className="drawer-sub">
                  Session Code: <strong>{selectedSession.token}</strong>
                </p>
              </div>
              <button
                type="button"
                className="close-drawer-btn"
                onClick={() => setSelectedSession(null)}
              >
                ✕
              </button>
            </div>

            {/* Tabs: Brief vs Transcript & Copy Actions */}
            <div className="drawer-tabs-row">
              <div className="drawer-tabs">
                <button
                  type="button"
                  className={`drawer-tab ${activeTab === 'brief' ? 'active' : ''}`}
                  onClick={() => setActiveTab('brief')}
                >
                  <FileText size={15} />
                  <span>App Brief</span>
                </button>
                <button
                  type="button"
                  className={`drawer-tab ${activeTab === 'transcript' ? 'active' : ''}`}
                  onClick={() => setActiveTab('transcript')}
                >
                  <MessageSquare size={15} />
                  <span>Original Conversation</span>
                </button>
              </div>

              {activeTab === 'transcript' ? (
                <button
                  type="button"
                  className="drawer-copy-action-btn"
                  onClick={copyFullTranscript}
                  disabled={sessionMessages.length === 0}
                  title="Copy full transcript to clipboard"
                >
                  {copiedTranscript ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                  <span>{copiedTranscript ? 'Copied!' : 'Copy Transcript'}</span>
                </button>
              ) : selectedBrief ? (
                <button
                  type="button"
                  className="drawer-copy-action-btn"
                  onClick={copyBriefAsMarkdown}
                  title="Copy brief as Markdown"
                >
                  {copiedBrief ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                  <span>{copiedBrief ? 'Copied!' : 'Copy Brief'}</span>
                </button>
              ) : null}
            </div>

            <div className="drawer-body">
              {loadingDetails ? (
                <div className="drawer-loading">
                  <p>Loading session details...</p>
                </div>
              ) : activeTab === 'brief' ? (
                selectedBrief ? (
                  <div className="brief-full-view">
                    <div className="brief-title-bar">
                      <div>
                        <span className="brief-status-tag">Synthesized App Vision</span>
                        <h3 className="brief-project-title">
                          {selectedBrief.project_title || 'Untitled Application'}
                        </h3>
                      </div>
                      <button
                        type="button"
                        className="visien-btn-secondary copy-brief-btn"
                        onClick={copyBriefAsMarkdown}
                        title="Copy full brief formatted as Markdown"
                      >
                        {copiedBrief ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                        <span>{copiedBrief ? 'Copied!' : 'Copy as Markdown'}</span>
                      </button>
                    </div>

                    <div className="brief-block">
                      <h4>Vision Summary</h4>
                      <p>{selectedBrief.vision_summary || 'Not specified'}</p>
                    </div>

                    <div className="brief-block">
                      <h4>Problem Statement</h4>
                      <p>{selectedBrief.problem_statement || 'Not specified'}</p>
                    </div>

                    <div className="brief-block">
                      <h4>Platform & Integrations</h4>
                      <p><strong>Target Platform:</strong> {selectedBrief.target_platform || selectedBrief.raw_json?.target_platform || 'iOS/Android & Web'}</p>
                      <p><strong>Payments & Integrations:</strong> {selectedBrief.payments_integrations || selectedBrief.raw_json?.payments_integrations || 'Not specified'}</p>
                    </div>

                    <div className="brief-block">
                      <h4>Target Users & Core Journey</h4>
                      <p><strong>Users:</strong> {selectedBrief.target_users || 'Not specified'}</p>
                      <p><strong>Core Journey:</strong> {selectedBrief.core_action || 'Not specified'}</p>
                    </div>

                    <div className="brief-block">
                      <h4>First Screen & Core Action</h4>
                      <p><strong>First Screen:</strong> {selectedBrief.first_screen_experience || 'Not specified'}</p>
                      <p><strong>Core Action:</strong> {selectedBrief.core_action || 'Not specified'}</p>
                      <p><strong>Expected Outcome:</strong> {selectedBrief.expected_outcome || 'Not specified'}</p>
                    </div>

                    <div className="brief-block">
                      <h4>Aesthetics & Feel</h4>
                      <p><strong>Visual Direction:</strong> {selectedBrief.visual_direction || 'Not specified'}</p>
                      <p><strong>UX Feel:</strong> {selectedBrief.emotional_ux_feel && selectedBrief.emotional_ux_feel.length > 0 ? selectedBrief.emotional_ux_feel.join(', ') : 'Not specified'}</p>
                      <p><strong>Anti-patterns:</strong> {selectedBrief.anti_patterns && selectedBrief.anti_patterns.length > 0 ? selectedBrief.anti_patterns.join(', ') : 'None specified'}</p>
                    </div>

                    <div className="brief-block">
                      <h4>V1 Essential Scope</h4>
                      {selectedBrief.v1_essential_features && selectedBrief.v1_essential_features.length > 0 ? (
                        <ul>
                          {selectedBrief.v1_essential_features.map((feat: string, i: number) => (
                            <li key={i}>{feat}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>Not specified</p>
                      )}
                    </div>

                    <div className="brief-block">
                      <h4>Timeline & Infrastructure</h4>
                      <p><strong>Launch Timeline:</strong> {selectedBrief.target_timeline || selectedBrief.raw_json?.target_timeline || 'Not specified'}</p>
                      <p><strong>Infrastructure Preference:</strong> {selectedBrief.infrastructure_preference || 'Every Nation GG Managed'}</p>
                    </div>

                    {selectedBrief.additional_notes && (
                      <div className="brief-block">
                        <h4>Additional Notes</h4>
                        <p>{selectedBrief.additional_notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-brief-notice">
                    <p className="no-brief-text">This session has not generated an App Brief yet.</p>
                    {sessionMessages.length > 0 ? (
                      <button
                        type="button"
                        className="visien-btn-primary generate-brief-btn"
                        onClick={handleGenerateBriefAdmin}
                        disabled={isGeneratingBrief}
                      >
                        <Sparkles size={15} />
                        <span>{isGeneratingBrief ? 'Synthesizing with Gemini...' : 'Synthesize App Brief with Gemini'}</span>
                      </button>
                    ) : (
                      <p className="no-brief-sub">The client has not started chatting yet.</p>
                    )}
                  </div>
                )
              ) : (
                <div className="transcript-view">
                  <div className="transcript-header-bar">
                    <span className="transcript-count">{sessionMessages.length} messages in conversation</span>
                    <button
                      type="button"
                      className="visien-btn-secondary copy-transcript-action-btn"
                      onClick={copyFullTranscript}
                      disabled={sessionMessages.length === 0}
                    >
                      {copiedTranscript ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                      <span>{copiedTranscript ? 'Copied Transcript!' : 'Copy Full Transcript'}</span>
                    </button>
                  </div>
                  {sessionMessages.length === 0 ? (
                    <div className="no-brief-notice">
                      <p className="no-brief-text">No conversation messages recorded yet.</p>
                    </div>
                  ) : (
                    sessionMessages.map((m) => (
                      <div key={m.id} className={`transcript-bubble ${m.role}`}>
                        <span className="transcript-role">
                          {m.role === 'enos' ? 'ENOS (AI Guide)' : selectedSession?.client_name || 'Client'}:
                        </span>
                        <p>{m.content}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-container {
          min-height: 100dvh;
          background: var(--bg-cream);
          padding-bottom: 60px;
        }

        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 32px;
          background: var(--surface-translucent);
          border-bottom: 1px solid var(--border-subtle);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 700;
          color: var(--violet-deep);
          margin-bottom: 4px;
        }

        .admin-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-main);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .admin-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 32px;
        }

        .filters-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
        }

        .sessions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 16px;
        }

        .session-card {
          padding: 20px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .session-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .status-pill {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          margin-bottom: 6px;
        }

        .status-pill.completed {
          background: #DCFCE7;
          color: #15803D;
        }

        .status-pill.in_progress {
          background: var(--gold-soft);
          color: var(--gold-warm);
        }

        .status-pill.not_started {
          background: rgba(120, 113, 108, 0.12);
          color: var(--text-secondary);
        }

        .client-heading {
          font-size: 17px;
          font-weight: 700;
          color: var(--text-main);
        }

        .company-tag {
          font-weight: 500;
          color: var(--text-muted);
        }

        .project-preview-title {
          font-size: 13.5px;
          color: var(--violet-deep);
        }

        .session-token-row {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #FFFFFF;
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .token-code {
          flex: 1;
          font-size: 11.5px;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .icon-copy-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
        }

        .icon-copy-btn:hover {
          color: var(--violet-primary);
        }

        .session-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--text-muted);
          border-top: 1px solid var(--border-subtle);
          padding-top: 10px;
        }

        .date-text {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Modal Styles */
        .modal-backdrop, .drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(30, 27, 24, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
        }

        .modal-card {
          width: 100%;
          max-width: 480px;
          padding: 32px;
          background: #FFFFFF;
        }

        .modal-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 6px;
        }

        .modal-subtitle {
          font-size: 13.5px;
          color: var(--text-secondary);
          margin-bottom: 24px;
        }

        .new-session-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-main);
        }

        .field-input {
          padding: 12px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          font-size: 14px;
          outline: none;
        }

        .field-input:focus {
          border-color: var(--violet-primary);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 12px;
        }

        .created-token-view {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .code-display-card {
          background: rgba(124, 58, 237, 0.05);
          border: 1px solid rgba(124, 58, 237, 0.22);
          border-radius: var(--radius-md);
          padding: 16px 14px;
          margin: 4px 0 6px;
          text-align: center;
        }

        .code-badge-label {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--violet-primary);
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .code-number-display {
          font-family: var(--font-mono, monospace);
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 2px;
          color: var(--text-main);
          user-select: all;
          margin: 4px 0;
        }

        .code-subtext {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .share-actions-group {
          display: flex;
          flex-direction: column;
          gap: 9px;
          width: 100%;
        }

        .code-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(124, 58, 237, 0.08);
          border: 1px solid rgba(124, 58, 237, 0.2);
          color: var(--violet-deep);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 12.5px;
          font-family: var(--font-mono, monospace);
        }

        .code-pill strong {
          letter-spacing: 0.5px;
        }

        .link-box {
          background: var(--bg-cream-soft);
          padding: 14px;
          border-radius: var(--radius-sm);
          word-break: break-all;
          font-size: 13px;
        }

        /* Drawer Styles */
        .drawer-backdrop {
          justify-content: flex-end;
        }

        .drawer-panel {
          width: 100%;
          max-width: 600px;
          height: 100%;
          background: #FFFFFF;
          border-radius: 0;
          display: flex;
          flex-direction: column;
          padding: 32px 24px;
          overflow-y: auto;
        }

        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .drawer-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--text-main);
        }

        .drawer-sub {
          font-size: 12px;
          color: var(--text-muted);
        }

        .close-drawer-btn {
          background: none;
          border: none;
          font-size: 20px;
          color: var(--text-muted);
          cursor: pointer;
        }

        .drawer-tabs-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 12px;
          margin-bottom: 20px;
          gap: 12px;
        }

        .drawer-tabs {
          display: flex;
          gap: 8px;
        }

        .drawer-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: none;
          border: none;
          border-radius: var(--radius-full);
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .drawer-tab:hover {
          color: var(--violet-primary);
          background: var(--violet-subtle);
        }

        .drawer-tab.active {
          background: var(--violet-soft);
          color: var(--violet-deep);
        }

        .drawer-copy-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          background: var(--bg-cream-soft);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-main);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .drawer-copy-action-btn:hover:not(:disabled) {
          background: #FFFFFF;
          border-color: var(--violet-primary);
          color: var(--violet-deep);
          box-shadow: var(--shadow-sm);
        }

        .drawer-copy-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .drawer-loading {
          padding: 32px 0;
          text-align: center;
          color: var(--text-secondary);
        }

        .brief-title-bar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .brief-status-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--violet-deep);
          background: var(--violet-soft);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          margin-bottom: 6px;
        }

        .brief-project-title {
          font-size: 20px;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1.3;
        }

        .copy-brief-btn {
          padding: 8px 14px;
          font-size: 12.5px;
          gap: 6px;
          white-space: nowrap;
        }

        .brief-block {
          margin-bottom: 20px;
        }

        .brief-block h4 {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--violet-deep);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }

        .brief-block p, .brief-block ul {
          font-size: 14.5px;
          color: var(--text-main);
          line-height: 1.6;
        }

        .brief-block ul {
          padding-left: 20px;
        }

        .brief-block li {
          margin-bottom: 4px;
        }

        .no-brief-notice {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 20px;
          text-align: center;
          gap: 14px;
          background: var(--bg-cream-soft);
          border-radius: var(--radius-md);
          border: 1px dashed rgba(120, 113, 108, 0.25);
        }

        .no-brief-text {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-main);
        }

        .no-brief-sub {
          font-size: 13.5px;
          color: var(--text-muted);
        }

        .generate-brief-btn {
          font-size: 13.5px;
          padding: 10px 20px;
          gap: 8px;
        }

        .transcript-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 16px;
        }

        .transcript-count {
          font-size: 12.5px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .copy-transcript-action-btn {
          padding: 6px 14px;
          font-size: 12.5px;
          gap: 6px;
        }

        .transcript-view {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .transcript-bubble {
          padding: 14px 18px;
          border-radius: var(--radius-md);
          font-size: 14.5px;
          line-height: 1.6;
          word-break: break-word;
        }

        .transcript-bubble.client {
          background: var(--bg-cream-soft);
          align-self: flex-end;
          max-width: 85%;
          border: 1px solid var(--border-subtle);
        }

        .transcript-bubble.enos {
          background: #FAF5FF;
          border: 1px solid rgba(124, 58, 237, 0.18);
          align-self: flex-start;
          max-width: 85%;
        }

        .transcript-role {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: var(--violet-deep);
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
      `}</style>
    </div>
  );
}
