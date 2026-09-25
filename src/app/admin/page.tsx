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
  const [isCreating, setIsCreating] = useState(false);

  // Inspector Drawer State
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'brief' | 'transcript'>('brief');
  const [loadingDetails, setLoadingDetails] = useState(false);

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
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/session/${session.token}`);
      const data = await res.json();
      setSessionMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
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
              const brief = s.app_briefs?.[0];
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
                    <code className="token-code">{shareUrl}</code>
                    <button
                      type="button"
                      className="icon-copy-btn"
                      onClick={() => copyToClipboard(shareUrl)}
                      title="Copy invitation link"
                    >
                      <Copy size={14} />
                    </button>
                    <a
                      href={`/i/${s.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-copy-btn"
                      title="Open discovery session"
                    >
                      <ExternalLink size={14} />
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
                <p className="success-label">🎉 Private Session Created!</p>
                <div className="link-box">
                  <code>{`${getBaseUrl()}/i/${createdToken}`}</code>
                </div>
                <button
                  type="button"
                  className="visien-btn-primary copy-large-btn"
                  onClick={() => copyToClipboard(`${getBaseUrl()}/i/${createdToken}`)}
                >
                  {copiedToken ? <Check size={16} /> : <Copy size={16} />}
                  <span>{copiedToken ? 'Link Copied!' : 'Copy Private Link'}</span>
                </button>
                <button
                  type="button"
                  className="visien-btn-secondary close-btn"
                  onClick={() => setShowNewModal(false)}
                >
                  Done
                </button>
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
                  Token: <code>{selectedSession.token}</code>
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

            {/* Tabs: Brief vs Transcript */}
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

            <div className="drawer-body">
              {loadingDetails ? (
                <p>Loading session details...</p>
              ) : activeTab === 'brief' ? (
                selectedSession.app_briefs?.[0] ? (
                  <div className="brief-full-view">
                    <h3 className="brief-project-title">
                      {selectedSession.app_briefs[0].project_title}
                    </h3>

                    <div className="brief-block">
                      <h4>Vision Summary</h4>
                      <p>{selectedSession.app_briefs[0].vision_summary}</p>
                    </div>

                    <div className="brief-block">
                      <h4>Problem Statement</h4>
                      <p>{selectedSession.app_briefs[0].problem_statement}</p>
                    </div>

                    <div className="brief-block">
                      <h4>Target Users & Moment of Use</h4>
                      <p><strong>Users:</strong> {selectedSession.app_briefs[0].target_users}</p>
                      <p><strong>When:</strong> {selectedSession.app_briefs[0].moment_of_use}</p>
                    </div>

                    <div className="brief-block">
                      <h4>First Screen & Core Action</h4>
                      <p><strong>First Screen:</strong> {selectedSession.app_briefs[0].first_screen_experience}</p>
                      <p><strong>Core Action:</strong> {selectedSession.app_briefs[0].core_action}</p>
                      <p><strong>Expected Outcome:</strong> {selectedSession.app_briefs[0].expected_outcome}</p>
                    </div>

                    <div className="brief-block">
                      <h4>Aesthetics & Feel</h4>
                      <p><strong>Visual Direction:</strong> {selectedSession.app_briefs[0].visual_direction}</p>
                      <p><strong>UX Feel:</strong> {selectedSession.app_briefs[0].emotional_ux_feel?.join(', ')}</p>
                      <p><strong>Anti-patterns:</strong> {selectedSession.app_briefs[0].anti_patterns?.join(', ')}</p>
                    </div>

                    <div className="brief-block">
                      <h4>V1 Essential Scope</h4>
                      <ul>
                        {selectedSession.app_briefs[0].v1_essential_features?.map((feat: string, i: number) => (
                          <li key={i}>{feat}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="brief-block">
                      <h4>Infrastructure Preference</h4>
                      <p>{selectedSession.app_briefs[0].infrastructure_preference}</p>
                    </div>
                  </div>
                ) : (
                  <div className="no-brief-notice">
                    <p>This session has not completed discovery yet.</p>
                  </div>
                )
              ) : (
                <div className="transcript-view">
                  {sessionMessages.map((m) => (
                    <div key={m.id} className={`transcript-bubble ${m.role}`}>
                      <span className="transcript-role">{m.role === 'enos' ? 'ENOS' : 'Client'}:</span>
                      <p>{m.content}</p>
                    </div>
                  ))}
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
          gap: 14px;
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

        .drawer-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid var(--border-subtle);
          padding-bottom: 10px;
          margin-bottom: 20px;
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
        }

        .drawer-tab.active {
          background: var(--violet-soft);
          color: var(--violet-deep);
        }

        .brief-block {
          margin-bottom: 18px;
        }

        .brief-block h4 {
          font-size: 13px;
          font-weight: 700;
          color: var(--violet-deep);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 4px;
        }

        .brief-block p, .brief-block ul {
          font-size: 14px;
          color: var(--text-main);
          line-height: 1.6;
        }

        .transcript-view {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .transcript-bubble {
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-size: 13.5px;
          line-height: 1.5;
        }

        .transcript-bubble.client {
          background: var(--bg-cream-soft);
          align-self: flex-end;
          max-width: 85%;
        }

        .transcript-bubble.enos {
          background: #FAF5FF;
          border: 1px solid var(--violet-soft);
          align-self: flex-start;
          max-width: 85%;
        }

        .transcript-role {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: var(--violet-deep);
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
}
