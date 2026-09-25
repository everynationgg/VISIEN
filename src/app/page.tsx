'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnosOrb } from '@/components/EnosOrb';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState('');

  const handleJoin = (e: React.FormEvent) => {
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

        {/* Private Token Entry Box */}
        <div className="visien-card token-card">
          <p className="token-label">Enter your 6-digit session code or link</p>
          <form onSubmit={handleJoin} className="token-form">
            <input
              type="text"
              className="token-input"
              placeholder="e.g. 748-219"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              autoCapitalize="characters"
              autoCorrect="off"
            />
            <button
              type="submit"
              className="visien-btn-primary enter-btn"
              disabled={!tokenInput.trim()}
            >
              <span>Enter Session</span>
              <ArrowRight size={16} />
            </button>
          </form>
          <div className="security-note">
            <ShieldCheck size={14} />
            <span>Private sessions are invitation-only and end-to-end encrypted.</span>
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
          max-width: 400px;
          margin-bottom: 28px;
        }

        .token-card {
          width: 100%;
          padding: 24px 20px;
          text-align: left;
        }

        .token-label {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-main);
          margin-bottom: 12px;
        }

        .token-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .token-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-subtle);
          background: #FFFFFF;
          color: var(--text-main);
          font-size: 15px;
          outline: none;
        }

        .token-input:focus {
          border-color: var(--violet-primary);
        }

        .enter-btn {
          width: 100%;
          padding: 14px;
        }

        .security-note {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 14px;
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
      `}</style>
    </div>
  );
}
