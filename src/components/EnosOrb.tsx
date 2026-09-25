'use client';

import React from 'react';

export type OrbState = 'idle' | 'thinking' | 'speaking' | 'waiting';

interface EnosOrbProps {
  state?: OrbState;
  size?: number; // diameter in pixels
  className?: string;
}

export const EnosOrb: React.FC<EnosOrbProps> = ({
  state = 'idle',
  size = 130,
  className = '',
}) => {
  return (
    <div
      className={`enos-orb-container ${state} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      aria-label={`ENOS AI Guide (${state})`}
    >
      {/* Outer ambient radiant aura */}
      <div className="orb-aura" />

      {/* Primary luminous sphere */}
      <div className="orb-core">
        {/* Swirling violet & molten amber ribbons */}
        <div className="orb-ribbon ribbon-violet" />
        <div className="orb-ribbon ribbon-gold" />
        <div className="orb-ribbon ribbon-inner-light" />
      </div>

      <style jsx>{`
        .enos-orb-container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          pointer-events: none;
        }

        .orb-aura {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(124, 58, 237, 0.28) 0%,
            rgba(245, 158, 11, 0.22) 40%,
            transparent 70%
          );
          filter: blur(18px);
          animation: aura-pulse 4s ease-in-out infinite;
          transition: all 0.5s ease;
        }

        .orb-core {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(
            circle at 35% 35%,
            #FFFFFF 0%,
            #FAF5FF 30%,
            #F3E8FF 65%,
            #FDE68A 100%
          );
          box-shadow:
            inset -4px -6px 16px rgba(124, 58, 237, 0.25),
            inset 4px 6px 14px rgba(255, 255, 255, 0.95),
            0 8px 32px rgba(124, 58, 237, 0.2),
            0 4px 16px rgba(245, 158, 11, 0.18);
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .orb-ribbon {
          position: absolute;
          border-radius: 50%;
          mix-blend-mode: multiply;
          filter: blur(8px);
          transition: all 0.6s ease;
        }

        .ribbon-violet {
          width: 110%;
          height: 110%;
          top: -5%;
          left: -5%;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            rgba(124, 58, 237, 0.45) 45%,
            transparent 75%
          );
          animation: rotate-ribbon 6s linear infinite;
        }

        .ribbon-gold {
          width: 95%;
          height: 95%;
          bottom: -5%;
          right: -5%;
          background: conic-gradient(
            from 180deg,
            transparent 0%,
            rgba(245, 158, 11, 0.55) 50%,
            rgba(234, 88, 12, 0.35) 75%,
            transparent 100%
          );
          animation: rotate-ribbon-reverse 8s linear infinite;
        }

        .ribbon-inner-light {
          width: 60%;
          height: 60%;
          top: 15%;
          left: 15%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, transparent 80%);
          animation: inner-shimmer 3s ease-in-out infinite alternate;
        }

        /* ── State: Idle ── */
        .enos-orb-container.idle .orb-core {
          animation: breathe 4s ease-in-out infinite;
        }

        /* ── State: Thinking / Processing ── */
        .enos-orb-container.thinking .orb-aura {
          inset: -30px;
          filter: blur(24px);
          background: radial-gradient(
            circle,
            rgba(124, 58, 237, 0.45) 0%,
            rgba(245, 158, 11, 0.35) 50%,
            transparent 75%
          );
        }
        .enos-orb-container.thinking .ribbon-violet {
          animation-duration: 2s;
        }
        .enos-orb-container.thinking .ribbon-gold {
          animation-duration: 2.5s;
        }
        .enos-orb-container.thinking .orb-core {
          transform: scale(1.05);
        }

        /* ── State: Speaking / Responding ── */
        .enos-orb-container.speaking .orb-aura {
          animation: speech-radiance 1.2s ease-in-out infinite alternate;
        }
        .enos-orb-container.speaking .orb-core {
          animation: speech-pulse 1.2s ease-in-out infinite alternate;
          box-shadow:
            inset -4px -6px 20px rgba(124, 58, 237, 0.35),
            inset 4px 6px 18px rgba(255, 255, 255, 1),
            0 12px 40px rgba(124, 58, 237, 0.32),
            0 6px 24px rgba(245, 158, 11, 0.25);
        }

        /* ── State: Waiting for user ── */
        .enos-orb-container.waiting .orb-aura {
          opacity: 0.75;
        }

        @keyframes rotate-ribbon {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes rotate-ribbon-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }

        @keyframes aura-pulse {
          0%, 100% { opacity: 0.8; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1.06); }
        }

        @keyframes inner-shimmer {
          0% { opacity: 0.7; transform: translate(-2px, -2px) scale(0.95); }
          100% { opacity: 1; transform: translate(2px, 2px) scale(1.05); }
        }

        @keyframes speech-pulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.04); }
        }

        @keyframes speech-radiance {
          0% { opacity: 0.7; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
};
