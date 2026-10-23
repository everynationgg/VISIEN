'use client';

import React, { useState, useEffect } from 'react';
import { Session, AppBrief, Message, ProjectProgressStatus } from '@/lib/types';
import { generateBuilderPrompt } from '@/lib/blueprintExport';
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
  Trash2,
  AlertTriangle,
  Mail,
  Send,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Lock,
  ShieldCheck,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'needs_info' | 'completed' | 'in_progress' | 'not_started'>('all');

  // Admin Passcode Protection (Server-Verified)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [passcode, setPasscode] = useState<string>('');
  const [isVerifyingPasscode, setIsVerifyingPasscode] = useState<boolean>(false);

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const candidate = passcodeInput.trim();
    if (!candidate) return;

    setIsVerifyingPasscode(true);
    setPasscodeError(null);

    try {
      const res = await fetch('/api/admin/sessions', {
        headers: { 'x-admin-key': candidate },
      });

      if (res.ok) {
        sessionStorage.setItem('visien_admin_key', candidate);
        setPasscode(candidate);
        setIsAuthenticated(true);
        const data = await res.json();
        setSessions(data.sessions || []);
      } else {
        setPasscodeError('Incorrect admin access code. Please try again.');
      }
    } catch (err) {
      console.error('Admin authentication error:', err);
      setPasscodeError('Failed to verify access code. Please check your network connection.');
    } finally {
      setIsVerifyingPasscode(false);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('visien_admin_key');
    setPasscode('');
    setIsAuthenticated(false);
    setPasscodeInput('');
  };

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
  const [copiedBuilderPrompt, setCopiedBuilderPrompt] = useState(false);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);

  // Project Progress Pipeline Control State
  const [projectStatusInput, setProjectStatusInput] = useState<ProjectProgressStatus>('received');
  const [projectStatusNoteInput, setProjectStatusNoteInput] = useState<string>('');
  const [isSavingProjectStatus, setIsSavingProjectStatus] = useState<boolean>(false);
  const [statusSaveSuccess, setStatusSaveSuccess] = useState<boolean>(false);

  // Delete Session Confirmation State
  const [sessionToDelete, setSessionToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Multi-Session Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  const toggleSelectSession = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredSessions.map((s) => s.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    setBulkDeleteError(null);
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': passcode },
        body: JSON.stringify({ ids: selectedIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete selected sessions');
      }

      // Close drawer if open session was one of deleted
      if (selectedSession && selectedIds.includes(selectedSession.id)) {
        setSelectedSession(null);
      }

      setSessions((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
      setSelectedIds([]);
      setShowBulkDeleteModal(false);
    } catch (err: any) {
      console.error('Error in bulk delete:', err);
      setBulkDeleteError(err.message || 'Failed to delete selected sessions');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/sessions?id=${sessionToDelete.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': passcode },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete session');
      }

      // Close drawer if this session was being viewed
      if (selectedSession?.id === sessionToDelete.id) {
        setSelectedSession(null);
      }

      setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id));
      setSelectedIds((prev) => prev.filter((id) => id !== sessionToDelete.id));
      setSessionToDelete(null);
    } catch (err: any) {
      console.error('Error deleting session:', err);
      setDeleteError(err.message || 'Failed to delete session');
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchSessions = async (overridePasscode?: string) => {
    const key = overridePasscode || passcode;
    if (!key) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sessions', {
        headers: { 'x-admin-key': key },
      });
      if (res.status === 401) {
        handleLock();
        setPasscodeError('Admin access expired or code changed. Please re-enter.');
        return;
      }
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('visien_admin_key') : null;
    if (saved) {
      setPasscode(saved);
      setIsAuthenticated(true);
      fetchSessions(saved);
    } else {
      setLoading(false);
    }
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': passcode },
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
    setProjectStatusInput(session.project_status || 'received');
    setProjectStatusNoteInput(session.project_status_note || '');
    setStatusSaveSuccess(false);

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
        setProjectStatusInput(data.session.project_status || 'received');
        setProjectStatusNoteInput(data.session.project_status_note || '');
      }
    } catch (err) {
      console.error('Error fetching session details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveProjectStatus = async (
    overrideStatus?: ProjectProgressStatus,
    overrideNote?: string
  ) => {
    if (!selectedSession) return;
    const statusToSave = overrideStatus || projectStatusInput;
    const noteToSave = overrideNote !== undefined ? overrideNote : projectStatusNoteInput;

    setIsSavingProjectStatus(true);
    setStatusSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': passcode },
        body: JSON.stringify({
          id: selectedSession.id,
          project_status: statusToSave,
          project_status_note: noteToSave,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const rawMsg = errData.error || 'Failed to update project status';
        if (rawMsg.includes('project_status') || rawMsg.includes('column') || rawMsg.includes('relation')) {
          throw new Error(
            `Database column missing: Please run the SQL migration query in your Supabase SQL Editor.\n\nDetails: ${rawMsg}`
          );
        }
        throw new Error(rawMsg);
      }
      const data = await res.json();
      setSelectedSession((prev: any) => ({ ...prev, ...data.session }));
      setProjectStatusInput(data.session.project_status || 'received');
      setProjectStatusNoteInput(data.session.project_status_note || '');
      // Update in sessions list
      setSessions((prev) =>
        prev.map((s) => (s.id === data.session.id ? { ...s, ...data.session } : s))
      );
      setStatusSaveSuccess(true);
      setTimeout(() => setStatusSaveSuccess(false), 2500);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to save project status');
    } finally {
      setIsSavingProjectStatus(false);
    }
  };

  const handleAdvanceToConceptualizing = () => {
    handleSaveProjectStatus(
      'conceptualizing',
      'Clarification received! We are now conceptualizing your application architecture.'
    );
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
        const roleLabel = m.role === 'client' ? client : 'VISIEN (AI Guide)';
        return `[${roleLabel}]:\n${m.content}\n`;
      })
      .join('\n');

    navigator.clipboard.writeText(`${header}\n${body}`);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2200);
  };

  const copyBuilderPrompt = () => {
    if (!selectedBrief) return;
    const client = selectedBrief.client_name || selectedSession?.client_name || 'Client';
    const comp = selectedBrief.company || selectedSession?.company || undefined;
    const prompt = generateBuilderPrompt(selectedBrief, client, comp);
    navigator.clipboard.writeText(prompt);
    setCopiedBuilderPrompt(true);
    setTimeout(() => setCopiedBuilderPrompt(false), 2200);
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
      ``,
      `## 8. Technical Architecture & Investment`,
      `- **User Roles & Access:** ${selectedBrief.user_roles || selectedBrief.raw_json?.user_roles || 'Not specified'}`,
      `- **Authentication & Login:** ${selectedBrief.auth_requirements || selectedBrief.raw_json?.auth_requirements || 'Not specified'}`,
      `- **Notifications & Alerts:** ${selectedBrief.notifications_channels || selectedBrief.raw_json?.notifications_channels || 'Not specified'}`,
      `- **Hardware & Device Capabilities:** ${selectedBrief.hardware_capabilities || selectedBrief.raw_json?.hardware_capabilities || 'Not specified'}`,
      `- **Data & Brand Readiness:** ${selectedBrief.data_readiness || selectedBrief.raw_json?.data_readiness || 'Not specified'}`,
      `- **Target Budget / Investment:** ${selectedBrief.budget_range || selectedBrief.raw_json?.budget_range || 'Flexible'}`,
      selectedBrief.additional_notes ? `\n## 9. Additional Notes\n${selectedBrief.additional_notes}` : '',
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
    if (filter === 'needs_info') return s.project_status === 'needs_info';
    return s.status === filter;
  });

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://visien.engg.online';
  };

  const needsInfoCount = sessions.filter((s) => s.project_status === 'needs_info').length;

  if (!isAuthenticated) {
    return (
      <div className="admin-lock-container">
        <div className="visien-card" style={{ maxWidth: '440px', width: '100%', padding: '40px 32px', textAlign: 'center', border: '1px solid rgba(139, 92, 246, 0.3)', boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 50px rgba(139, 92, 246, 0.15)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(124, 58, 237, 0.18)', border: '1px solid rgba(124, 58, 237, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#c084fc', boxShadow: '0 0 25px rgba(124, 58, 237, 0.3)' }}>
            <Lock size={28} />
          </div>
          <div className="brand-badge" style={{ display: 'inline-flex', marginBottom: '12px' }}>
            <Sparkles size={13} />
            <span>Every Nation GG</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.02em', color: '#fff' }}>
            VISIEN Admin Portal
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', margin: '0 0 26px 0', lineHeight: 1.5 }}>
            Restricted access. Enter your admin security code to manage client discovery sessions and technical blueprints.
          </p>
          <form onSubmit={handlePasscodeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="password"
              placeholder="Enter admin code..."
              value={passcodeInput}
              onChange={(e) => {
                setPasscodeInput(e.target.value);
                setPasscodeError(null);
              }}
              autoFocus
              className="token-input"
              style={{ width: '100%', textAlign: 'center', letterSpacing: '0.25em', fontSize: '1.25rem', padding: '12px 16px' }}
            />
            {passcodeError && (
              <div style={{ color: '#f87171', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <AlertCircle size={14} />
                <span>{passcodeError}</span>
              </div>
            )}
            <button
              type="submit"
              className="visien-btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', marginTop: '4px' }}
              disabled={!passcodeInput.trim() || isVerifyingPasscode}
            >
              <span>{isVerifyingPasscode ? 'Verifying...' : 'Unlock Command Portal'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

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
            className="visien-btn-secondary"
            onClick={handleLock}
            title="Lock Admin Portal"
            style={{ gap: '6px' }}
          >
            <Lock size={15} />
            <span>Lock</span>
          </button>
          <button
            type="button"
            className="visien-btn-secondary refresh-btn"
            onClick={() => fetchSessions()}
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
            className={`visien-chip chip-needs-info ${filter === 'needs_info' ? 'active' : ''}`}
            onClick={() => setFilter('needs_info')}
          >
            ⚠️ Needs Info ({needsInfoCount})
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

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="bulk-actions-bar">
            <div className="bulk-actions-left">
              <span className="bulk-selection-count">
                {selectedIds.length} session{selectedIds.length > 1 ? 's' : ''} selected
              </span>
              <button
                type="button"
                className="bulk-action-text-btn"
                onClick={handleSelectAllVisible}
              >
                {filteredSessions.length > 0 && filteredSessions.every((s) => selectedIds.includes(s.id))
                  ? 'Deselect Page'
                  : `Select All Visible (${filteredSessions.length})`}
              </button>
              <button
                type="button"
                className="bulk-action-text-btn"
                onClick={handleClearSelection}
              >
                Clear Selection
              </button>
            </div>
            <button
              type="button"
              className="delete-danger-btn bulk-delete-trigger-btn"
              onClick={() => {
                setBulkDeleteError(null);
                setShowBulkDeleteModal(true);
              }}
            >
              <Trash2 size={15} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        )}

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
              const isSelected = selectedIds.includes(s.id);

              return (
                <div
                  key={s.id}
                  className={`visien-card session-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => openSessionDetails(s)}
                >
                  <div className="session-card-header">
                    <div className="client-info-col">
                      <div className="session-top-meta">
                        <button
                          type="button"
                          className={`session-checkbox ${isSelected ? 'checked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectSession(s.id);
                          }}
                          title={isSelected ? 'Deselect session' : 'Select session'}
                          aria-label="Select session"
                        >
                          {isSelected ? <Check size={11} strokeWidth={3} /> : null}
                        </button>
                        <span className={`status-pill ${s.status}`}>
                          {s.status.replace('_', ' ')}
                        </span>
                        {s.status === 'completed' && (
                          <span className={`pipeline-pill pill-${s.project_status || 'received'}`}>
                            {s.project_status === 'needs_info'
                              ? '⚠️ Connecting with You'
                              : s.project_status === 'conceptualizing'
                              ? '🎨 Conceptualizing'
                              : s.project_status === 'processing'
                              ? '⚙️ Processing Scope'
                              : s.project_status === 'ready'
                              ? '✨ Blueprint Ready'
                              : '📥 Received'}
                          </span>
                        )}
                        {s.client_clarification_reply && (
                          <span className="client-replied-pill" title={`Client replied: "${s.client_clarification_reply}"`}>
                            💬 Replied
                          </span>
                        )}
                      </div>
                      <h3 className="client-heading">
                        {s.client_name || 'Unnamed Client'}
                        {s.company && <span className="company-tag"> • {s.company}</span>}
                      </h3>
                    </div>
                    <div className="session-card-actions">
                      <button
                        type="button"
                        className="icon-delete-btn"
                        title="Delete session"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteError(null);
                          setSessionToDelete(s);
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                      <ChevronRight size={18} color="var(--text-muted)" />
                    </div>
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
                  <a
                    href={`/i/${createdToken}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="visien-btn-primary enter-session-btn"
                  >
                    <ExternalLink size={16} />
                    <span>Enter Session Now ({createdToken})</span>
                  </a>

                  <button
                    type="button"
                    className="visien-btn-secondary"
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

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div
          className="modal-backdrop"
          onClick={() => !isDeleting && setSessionToDelete(null)}
        >
          <div
            className="visien-card modal-card delete-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-icon-wrap">
              <AlertTriangle size={24} className="delete-warning-icon" />
            </div>

            <h2 className="modal-title">Delete Session?</h2>
            <p className="delete-modal-description">
              Are you sure you want to permanently delete the discovery session for{' '}
              <strong>{sessionToDelete.client_name || 'Unnamed Client'}</strong>
              {sessionToDelete.company ? ` (${sessionToDelete.company})` : ''}?
            </p>
            <div className="delete-modal-subtext">
              <div>Session Code: <code>{sessionToDelete.token}</code></div>
              <p style={{ marginTop: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                All transcripts, conversation messages, and generated app briefs will be permanently removed.
              </p>
            </div>

            {deleteError && (
              <div className="delete-error-banner">
                {deleteError}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="visien-btn-secondary"
                onClick={() => setSessionToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-danger-btn"
                onClick={handleDeleteSession}
                disabled={isDeleting}
              >
                <Trash2 size={15} />
                <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div
          className="modal-backdrop"
          onClick={() => !isBulkDeleting && setShowBulkDeleteModal(false)}
        >
          <div
            className="visien-card modal-card delete-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-icon-wrap">
              <AlertTriangle size={24} className="delete-warning-icon" />
            </div>

            <h2 className="modal-title">Delete {selectedIds.length} Sessions?</h2>
            <p className="delete-modal-description">
              Are you sure you want to permanently delete the <strong>{selectedIds.length}</strong> selected discovery sessions?
            </p>

            <div className="bulk-delete-preview-list">
              {sessions
                .filter((s) => selectedIds.includes(s.id))
                .slice(0, 5)
                .map((s) => (
                  <div key={s.id} className="bulk-delete-item">
                    <span className="bulk-item-name">{s.client_name || 'Unnamed Client'}</span>
                    <code className="bulk-item-code">{s.token}</code>
                  </div>
                ))}
              {selectedIds.length > 5 && (
                <div className="bulk-item-more">
                  + {selectedIds.length - 5} more sessions
                </div>
              )}
            </div>

            <div className="delete-modal-subtext">
              All conversation transcripts, messages, and synthesized app briefs for these {selectedIds.length} sessions will be permanently removed. This action cannot be undone.
            </div>

            {bulkDeleteError && (
              <div className="delete-error-banner">
                {bulkDeleteError}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="visien-btn-secondary"
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={isBulkDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="delete-danger-btn"
                onClick={handleConfirmBulkDelete}
                disabled={isBulkDeleting}
              >
                <Trash2 size={15} />
                <span>{isBulkDeleting ? 'Deleting...' : `Delete ${selectedIds.length} Sessions`}</span>
              </button>
            </div>
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
              <div className="drawer-header-actions">
                <button
                  type="button"
                  className="drawer-delete-btn"
                  onClick={() => {
                    setDeleteError(null);
                    setSessionToDelete(selectedSession);
                  }}
                  title="Delete this session"
                >
                  <Trash2 size={14} />
                  <span>Delete Session</span>
                </button>
                <button
                  type="button"
                  className="close-drawer-btn"
                  onClick={() => setSelectedSession(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Project Progress Pipeline Manager */}
            {selectedSession.status === 'completed' && (
              <div className="pipeline-control-card">
                <div className="pipeline-control-header">
                  <div className="pipeline-title-group">
                    <Sparkles size={16} className="sparkle-icon" />
                    <h3 className="pipeline-card-title">Client Progress & Live Status</h3>
                  </div>
                  <div className="pipeline-quick-actions">
                    {selectedSession.email && (
                      <a
                        href={`mailto:${selectedSession.email}?subject=Every Nation GG: Regarding your ${selectedBrief?.project_title || 'VISIEN'} App Discovery`}
                        className="quick-link-btn"
                        title="Send email to client"
                      >
                        <Mail size={13} />
                        <span>Email Client</span>
                      </a>
                    )}
                    <a
                      href={`/i/${selectedSession.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="quick-link-btn"
                      title="View exactly what the client sees"
                    >
                      <ExternalLink size={13} />
                      <span>Client Tracker View</span>
                    </a>
                  </div>
                </div>

                <p className="pipeline-control-subtitle">
                  Select the active milestone and note displayed to the client when they re-enter code <strong>{selectedSession.token}</strong>:
                </p>

                {/* Stage Selector Buttons */}
                <div className="pipeline-stage-selector">
                  {[
                    { key: 'received', label: '1. Discovery Received', desc: 'Received by ENGG' },
                    { key: 'needs_info', label: '2. Connecting with You', desc: 'Needs Info' },
                    { key: 'conceptualizing', label: '3. Conceptualizing', desc: 'Solution Design' },
                    { key: 'processing', label: '4. Processing Scope', desc: 'Technical Scoping' },
                    { key: 'ready', label: '5. Blueprint Ready', desc: 'Proposal Ready' },
                  ].map((st) => (
                    <button
                      key={st.key}
                      type="button"
                      className={`stage-select-btn ${projectStatusInput === st.key ? 'active' : ''} ${st.key === 'needs_info' ? 'stage-warning' : ''}`}
                      onClick={() => setProjectStatusInput(st.key as ProjectProgressStatus)}
                    >
                      <span className="stage-btn-label">{st.label}</span>
                      <span className="stage-btn-desc">{st.desc}</span>
                    </button>
                  ))}
                </div>

                {/* If Client Submitted a Clarification Reply */}
                {selectedSession.client_clarification_reply && (
                  <div className="client-reply-received-card">
                    <div className="client-reply-header">
                      <MessageSquare size={15} color="#166534" />
                      <strong>Client Clarification Received ({new Date(selectedSession.client_clarification_replied_at || Date.now()).toLocaleDateString()}):</strong>
                    </div>
                    <p className="client-reply-text">"{selectedSession.client_clarification_reply}"</p>
                    <button
                      type="button"
                      className="visien-btn-primary advance-btn"
                      onClick={handleAdvanceToConceptualizing}
                      disabled={isSavingProjectStatus}
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark Clarified & Advance to Conceptualizing →</span>
                    </button>
                  </div>
                )}

                {/* Status Note to Client */}
                <div className="pipeline-note-group">
                  <label className="pipeline-note-label">
                    Live Note / Question to Client (Visible on client's screen):
                  </label>
                  <textarea
                    className="pipeline-note-textarea"
                    rows={2}
                    placeholder="e.g. Needs clarification on your preferred payment gateway or primary MVP target (Web vs iOS/Android)..."
                    value={projectStatusNoteInput}
                    onChange={(e) => setProjectStatusNoteInput(e.target.value)}
                  />

                  {/* Quick Preset Templates */}
                  <div className="preset-chips-row">
                    <span className="preset-label">Quick Presets:</span>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() =>
                        setProjectStatusNoteInput(
                          'Kindly wait for our engineering lead to contact you via email for a quick 15-minute sync.'
                        )
                      }
                    >
                      Wait for Email Contact
                    </button>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() =>
                        setProjectStatusNoteInput(
                          'Please clarify whether your MVP launch target is Web, iOS, or Android.'
                        )
                      }
                    >
                      Ask Target Platform
                    </button>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() =>
                        setProjectStatusNoteInput(
                          'Please clarify your preferred payment gateway (Stripe vs local bank QR).'
                        )
                      }
                    >
                      Ask Payment Gateway
                    </button>
                    <button
                      type="button"
                      className="preset-chip"
                      onClick={() =>
                        setProjectStatusNoteInput(
                          'Our architects are actively drafting your system workflows, database models, and technical specifications.'
                        )
                      }
                    >
                      Drafting Architecture
                    </button>
                  </div>
                </div>

                {/* Save Button Row */}
                <div className="pipeline-save-row">
                  <button
                    type="button"
                    className="visien-btn-primary save-pipeline-btn"
                    onClick={() => handleSaveProjectStatus()}
                    disabled={isSavingProjectStatus}
                  >
                    <Send size={14} />
                    <span>{isSavingProjectStatus ? 'Saving Status...' : 'Save Pipeline Status & Note'}</span>
                  </button>

                  {statusSaveSuccess && (
                    <span className="save-success-tag">
                      <Check size={14} color="#16A34A" />
                      <span>Status updated live on client portal!</span>
                    </span>
                  )}
                </div>
              </div>
            )}

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
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="drawer-copy-action-btn"
                    onClick={copyBuilderPrompt}
                    title="Copy AI Builder Prompt for Cursor / Claude / Antigravity"
                  >
                    {copiedBuilderPrompt ? <Check size={14} color="#16A34A" /> : <Sparkles size={14} />}
                    <span>{copiedBuilderPrompt ? 'Copied Prompt!' : 'Builder Prompt'}</span>
                  </button>
                  <button
                    type="button"
                    className="drawer-copy-action-btn"
                    onClick={copyBriefAsMarkdown}
                    title="Copy brief as Markdown"
                  >
                    {copiedBrief ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                    <span>{copiedBrief ? 'Copied!' : 'Copy Brief'}</span>
                  </button>
                </div>
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
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="visien-btn-secondary copy-brief-btn"
                          onClick={copyBuilderPrompt}
                          title="Copy ready-to-paste AI Prompt for Cursor / Claude / Antigravity"
                        >
                          {copiedBuilderPrompt ? <Check size={14} color="#16A34A" /> : <Sparkles size={14} />}
                          <span>{copiedBuilderPrompt ? 'Copied Prompt!' : 'Copy Builder Prompt'}</span>
                        </button>
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
                      <h4>Platform, Access & Integrations</h4>
                      <p><strong>Target Platform:</strong> {selectedBrief.target_platform || selectedBrief.raw_json?.target_platform || 'iOS/Android & Web'}</p>
                      <p><strong>Access & Auth:</strong> {selectedBrief.auth_requirements || selectedBrief.raw_json?.auth_requirements || 'Standard secure access'}</p>
                      <p><strong>Payments & Integrations:</strong> {selectedBrief.payments_integrations || selectedBrief.raw_json?.payments_integrations || 'Not specified'}</p>
                      <p><strong>Notifications & Alerts:</strong> {selectedBrief.notifications_channels || selectedBrief.raw_json?.notifications_channels || 'Not specified'}</p>
                    </div>

                    <div className="brief-block">
                      <h4>Target Users & Core Flow</h4>
                      <p><strong>Users:</strong> {selectedBrief.target_users || 'Not specified'}</p>
                      <p><strong>Core Flow:</strong> {selectedBrief.core_action || 'Not specified'}</p>
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

                    <div className="brief-block">
                      <h4>Technical Architecture & Investment</h4>
                      <p><strong>User Roles & Access:</strong> {selectedBrief.user_roles || selectedBrief.raw_json?.user_roles || 'Not specified'}</p>
                      <p><strong>Authentication / Sign-in:</strong> {selectedBrief.auth_requirements || selectedBrief.raw_json?.auth_requirements || 'Not specified'}</p>
                      <p><strong>Notifications & Alerts:</strong> {selectedBrief.notifications_channels || selectedBrief.raw_json?.notifications_channels || 'Not specified'}</p>
                      <p><strong>Hardware Capabilities:</strong> {selectedBrief.hardware_capabilities || selectedBrief.raw_json?.hardware_capabilities || 'Not specified'}</p>
                      <p><strong>Data & Brand Readiness:</strong> {selectedBrief.data_readiness || selectedBrief.raw_json?.data_readiness || 'Not specified'}</p>
                      <p><strong>Target Investment / Budget:</strong> <span style={{ color: 'var(--violet-primary)', fontWeight: 600 }}>{selectedBrief.budget_range || selectedBrief.raw_json?.budget_range || 'Flexible'}</span></p>
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
                          {m.role === 'client' ? selectedSession?.client_name || 'Client' : 'VISIEN (AI Guide)'}:
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

        .session-card-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .icon-delete-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5px;
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
        }

        .icon-delete-btn:hover {
          color: #DC2626;
          background: rgba(220, 38, 38, 0.08);
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

        .enter-session-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          text-decoration: none;
          padding: 12px 18px;
          font-weight: 700;
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

        .drawer-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .drawer-delete-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #DC2626;
          background: rgba(220, 38, 38, 0.06);
          border: 1px solid rgba(220, 38, 38, 0.2);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .drawer-delete-btn:hover {
          background: rgba(220, 38, 38, 0.12);
          border-color: rgba(220, 38, 38, 0.35);
        }

        .close-drawer-btn {
          background: none;
          border: none;
          font-size: 20px;
          color: var(--text-muted);
          cursor: pointer;
        }

        /* Delete Confirmation Modal Styles */
        .delete-modal-card {
          max-width: 440px;
        }

        .delete-modal-icon-wrap {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(220, 38, 38, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .delete-warning-icon {
          color: #DC2626;
        }

        .delete-modal-description {
          font-size: 14.5px;
          color: var(--text-main);
          margin-bottom: 10px;
          line-height: 1.5;
        }

        .delete-modal-subtext {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 20px;
          line-height: 1.5;
          background: var(--bg-cream-soft);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }

        .delete-modal-subtext code {
          font-family: var(--font-mono, monospace);
          font-weight: 700;
          color: var(--violet-deep);
        }

        .delete-error-banner {
          font-size: 13px;
          color: #DC2626;
          background: #FEF2F2;
          border: 1px solid #FCA5A5;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          margin-bottom: 16px;
        }

        .delete-danger-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 16px;
          border-radius: var(--radius-sm);
          background: #DC2626;
          color: #FFFFFF;
          border: none;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .delete-danger-btn:hover:not(:disabled) {
          background: #B91C1C;
        }

        .delete-danger-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Multi-Select & Bulk Actions */
        .session-top-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .session-checkbox {
          width: 17px;
          height: 17px;
          border-radius: 4px;
          border: 1.5px solid rgba(120, 113, 108, 0.3);
          background: #FFFFFF;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: all 0.15s ease;
          color: #FFFFFF;
        }

        .session-card:hover .session-checkbox,
        .session-checkbox.checked {
          border-color: var(--violet-primary);
        }

        .session-checkbox.checked {
          background: var(--violet-primary);
        }

        .session-card.selected {
          border-color: rgba(124, 58, 237, 0.45);
          box-shadow: 0 0 0 1px rgba(124, 58, 237, 0.35);
          background: #FCFAFF;
        }

        .bulk-actions-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #FFFFFF;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          padding: 12px 18px;
          margin-bottom: 20px;
          box-shadow: var(--shadow-sm);
        }

        .bulk-actions-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .bulk-selection-count {
          font-size: 13px;
          font-weight: 700;
          color: var(--violet-deep);
          background: var(--violet-soft);
          padding: 4px 10px;
          border-radius: var(--radius-full);
        }

        .bulk-action-text-btn {
          background: none;
          border: none;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px 6px;
          border-radius: var(--radius-sm);
          transition: color 0.15s ease;
        }

        .bulk-action-text-btn:hover {
          color: var(--violet-primary);
        }

        .bulk-delete-trigger-btn {
          padding: 7px 14px;
          font-size: 13px;
        }

        .bulk-delete-preview-list {
          max-height: 150px;
          overflow-y: auto;
          background: var(--bg-cream-soft);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          margin-bottom: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .bulk-delete-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
        }

        .bulk-item-name {
          font-weight: 600;
          color: var(--text-main);
        }

        .bulk-item-code {
          font-family: var(--font-mono, monospace);
          font-size: 11.5px;
          color: var(--violet-deep);
          background: rgba(124, 58, 237, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .bulk-item-more {
          font-size: 12px;
          color: var(--text-muted);
          text-align: center;
          margin-top: 4px;
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

        /* Pipeline Pills on Session Cards */
        .chip-needs-info {
          border-color: rgba(234, 88, 12, 0.3);
        }
        .chip-needs-info.active {
          background: #FFEDD5;
          color: #C2410C;
          border-color: #EA580C;
        }

        .pipeline-pill {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          letter-spacing: 0.02em;
        }

        .pill-received {
          background: #F3F4F6;
          color: #4B5563;
        }

        .pill-needs_info {
          background: #FFEDD5;
          color: #C2410C;
        }

        .pill-conceptualizing {
          background: #EDE9FE;
          color: #6D28D9;
        }

        .pill-processing {
          background: #E0E7FF;
          color: #3730A3;
        }

        .pill-ready {
          background: #DCFCE7;
          color: #15803D;
        }

        .client-replied-pill {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: var(--radius-full);
          background: #DCFCE7;
          color: #166534;
          border: 1px solid #86EFAC;
        }

        /* Pipeline Control Card in Drawer */
        .pipeline-control-card {
          margin: 16px 24px;
          padding: 20px;
          background: #FFF;
          border: 1px solid rgba(124, 58, 237, 0.2);
          border-radius: var(--radius-md);
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.06);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .pipeline-control-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
        }

        .pipeline-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pipeline-card-title {
          font-size: 15.5px;
          font-weight: 800;
          color: var(--text-main);
        }

        .pipeline-control-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .pipeline-quick-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .quick-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 10px;
          background: var(--bg-cream);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .quick-link-btn:hover {
          color: var(--violet-deep);
          border-color: var(--violet-primary);
        }

        .pipeline-stage-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 8px;
        }

        .stage-select-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 10px 12px;
          background: var(--bg-cream-soft);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
        }

        .stage-select-btn:hover {
          border-color: var(--violet-primary);
        }

        .stage-select-btn.active {
          background: var(--violet-soft);
          border-color: var(--violet-primary);
          box-shadow: 0 0 0 1px var(--violet-primary);
        }

        .stage-select-btn.stage-warning.active {
          background: #FFEDD5;
          border-color: #EA580C;
          box-shadow: 0 0 0 1px #EA580C;
        }

        .stage-btn-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-main);
        }

        .stage-btn-desc {
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .stage-select-btn.active .stage-btn-desc {
          color: var(--violet-deep);
        }

        .stage-select-btn.stage-warning.active .stage-btn-desc {
          color: #C2410C;
        }

        .client-reply-received-card {
          padding: 12px 14px;
          background: #F0FDF4;
          border: 1px solid #86EFAC;
          border-radius: var(--radius-sm);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .client-reply-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          color: #166534;
        }

        .client-reply-text {
          font-size: 13.5px;
          color: #14532D;
          font-style: italic;
          line-height: 1.4;
        }

        .advance-btn {
          align-self: flex-start;
          margin-top: 4px;
          padding: 6px 14px;
          font-size: 12.5px;
          gap: 6px;
        }

        .pipeline-note-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .pipeline-note-label {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--text-main);
        }

        .pipeline-note-textarea {
          width: 100%;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
          font-size: 13.5px;
          font-family: inherit;
          resize: vertical;
          outline: none;
          background: #FAF7F2;
          color: var(--text-main);
        }

        .pipeline-note-textarea:focus {
          border-color: var(--violet-primary);
          background: #FFF;
        }

        .preset-chips-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 2px;
        }

        .preset-label {
          font-size: 11.5px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .preset-chip {
          padding: 3px 8px;
          background: var(--bg-cream-soft);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-size: 11.5px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .preset-chip:hover {
          border-color: var(--violet-primary);
          color: var(--violet-deep);
        }

        .pipeline-save-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .save-pipeline-btn {
          padding: 8px 18px;
          font-size: 13px;
          gap: 6px;
        }

        .save-success-tag {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          font-weight: 600;
          color: #166534;
        }
      `}</style>
    </div>
  );
}
