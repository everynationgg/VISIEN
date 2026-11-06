'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnosOrb } from '@/components/EnosOrb';
import { ArrowRight, Sparkles, ShieldCheck, User, Building, Mail, KeyRound, Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  
  // Modes: 'new' (default, no code needed) or 'resume' (for returning clients with code/link)
  const [mode, setMode] = useState<'new' | 'resume'>('new');

  // New discovery form state
  const [clientName, setClientName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  // Resume form state
  const [tokenInput, setTokenInput] = useState('');

  const handleStartNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || isStarting) return;

    setIsStarting(true);
    setStartError(null);

    try {
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName.trim(),
          company: company.trim() || undefined,
          email: email.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Failed to start session. Please try again.');
      }

      // Seamlessly navigate client into their dedicated discovery experience
      router.push(`/i/${data.token}`);
    } catch (err: any) {
      console.error('Start error:', err);
      setStartError(err.message || 'Something went wrong. Please try again.');
      setIsStarting(false);
    }
  };

  const handleResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    const cleanToken = tokenInput.trim().replace(/^.*\/i\//, '');
    router.push(`/i/${cleanToken}`);
  };

  return (
    <div className="home-container">
      <div className="home-content">
        {/* Luminous Orb Presence */}
        <div className="orb-wrapper">
          <EnosOrb state="idle" size={140} />
        </div>

        {/* Brand Tag */}
        <div className="brand-tag">
          <Sparkles size={14} className="tag-icon" />
          <span>Every Nation GG</span>
        </div>

        {/* Hero Title */}
        <h1 className="hero-title">VISIEN</h1>
        <p className="hero-acronym">Vision Inspired by Story and Idea</p>

        {/* Description */}
        <p className="hero-desc">
          An AI-guided client discovery and application-planning platform. We turn what is in your head into a production-ready application blueprint.
        </p>

        {/* Main Card with Mode Tabs */}
        <div className="visien-card token-card">
          <div className="card-tabs">
            <button
              type="button"
              className={`tab-btn ${mode === 'new' ? 'active' : ''}`}
              onClick={() => { setMode('new'); setStartError(null); }}
            >
              Start Discovery
            </button>
            <button
              type="button"
              className={`tab-btn ${mode === 'resume' ? 'active' : ''}`}
              onClick={() => { setMode('resume'); setStartError(null); }}
            >
              Resume with Code
            </button>
          </div>

          {mode === 'new' ? (
            /* Mode 1: No Code Needed — Direct Start */
            <form onSubmit={handleStartNew} className="entry-form">
              <p className="form-subhead">Tell us who you are to begin your interactive blueprint session.</p>

              {startError && (
                <div className="error-banner">
                  {startError}
                </div>
              )}

              <div className="input-group">
                <label className="field-label">Your Name <span className="req">*</span></label>
                <div className="input-with-icon">
                  <User size={16} className="field-icon" />
                  <input
                    type="text"
                    className="styled-input"
                    placeholder="e.g. Jane Doe"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="field-label">Company or App Idea <span className="opt">(optional)</span></label>
                <div className="input-with-icon">
                  <Building size={16} className="field-icon" />
                  <input
                    type="text"
                    className="styled-input"
                    placeholder="e.g. Acme Studio or Fitness Tracker"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="field-label">Email <span className="opt">(optional, for brief copy)</span></label>
                <div className="input-with-icon">
                  <Mail size={16} className="field-icon" />
                  <input
                    type="email"
                    className="styled-input"
                    placeholder="e.g. jane@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="visien-btn-primary enter-btn"
                disabled={!clientName.trim() || isStarting}
              >
                {isStarting ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Preparing Your Session...</span>
                  </>
                ) : (
                  <>
                    <span>Begin Discovery</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Mode 2: Returning Client with Code / Link */
            <form onSubmit={handleResume} className="entry-form">
              <p className="form-subhead">Enter your 6-digit session code or paste your invitation link to resume.</p>

              <div className="input-group">
                <label className="field-label">Session Code or Link</label>
                <div className="input-with-icon">
                  <KeyRound size={16} className="field-icon" />
                  <input
                    type="text"
                    className="styled-input"
                    placeholder="e.g. 748-219"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                className="visien-btn-primary enter-btn"
                disabled={!tokenInput.trim()}
              >
                <span>Resume / Track</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          <div className="security-note">
            <ShieldCheck size={14} />
            <span>End-to-end encrypted private discovery powered by Every Nation GG.</span>
          </div>
        </div>

        {/* Admin Navigation Link */}
        <footer className="home-footer">
          <a href="/admin" className="admin-link">
            Every Nation GG Admin Portal →
          </a>
        </footer>
      </div>

      <style jsx>{`
        .home-container {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
        }

        .home-content {
          width: 100%;
          max-width: 480px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .orb-wrapper {
          margin-bottom: 24px;
        }

        .brand-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-size: 13px;
          font-weight: 600;
          color: var(--violet-deep);
          margin-bottom: 12px;
          box-shadow: var(--shadow-sm);
        }

        .hero-title {
          font-size: 42px;
          font-weight: 800;
          letter-spacing: 0.08em;
          background: linear-gradient(135deg, var(--text-main) 0%, var(--violet-primary) 70%, var(--gold-warm) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 4px;
        }

        .hero-acronym {
          font-size: 15px;
          font-weight: 600;
          color: var(--gold-warm);
          margin-bottom: 16px;
          letter-spacing: 0.02em;
        }

        .hero-desc {
          font-size: 14.5px;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 420px;
          margin-bottom: 24px;
        }

        .token-card {
          width: 100%;
          padding: 24px 20px;
          text-align: left;
        }

        .card-tabs {
          display: flex;
          gap: 8px;
          background: rgba(0, 0, 0, 0.04);
          padding: 4px;
          border-radius: var(--radius-md);
          margin-bottom: 20px;
        }

        .tab-btn {
          flex: 1;
          padding: 8px 12px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn.active {
          background: #FFFFFF;
          color: var(--violet-primary);
          box-shadow: var(--shadow-sm);
        }

        .form-subhead {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 18px;
          line-height: 1.5;
        }

        .error-banner {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #DC2626;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 13px;
          margin-bottom: 14px;
        }

        .entry-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-label {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--text-main);
        }

        .field-label .req {
          color: #DC2626;
        }

        .field-label .opt {
          font-weight: 400;
          color: var(--text-muted);
          font-size: 11.5px;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
          pointer-events: none;
        }

        .styled-input {
          width: 100%;
          padding: 12px 14px 12px 40px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          background: #FFFFFF;
          color: var(--text-main);
          font-size: 14.5px;
          outline: none;
          transition: border-color 0.2s;
        }

        .styled-input:focus {
          border-color: var(--violet-primary);
        }

        .enter-btn {
          width: 100%;
          padding: 14px;
          margin-top: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .security-note {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 18px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .home-footer {
          margin-top: 36px;
        }

        .admin-link {
          font-size: 13px;
          font-weight: 600;
          color: var(--violet-primary);
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .admin-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }

        :global(.spin) {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
