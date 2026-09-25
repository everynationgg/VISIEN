'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { EnosOrb, OrbState } from '@/components/EnosOrb';
import { ChapterProgress } from '@/components/ChapterProgress';
import { SuggestionChips } from '@/components/SuggestionChips';
import { ReviewDeck } from '@/components/ReviewDeck';
import { CORE_QUESTIONS } from '@/lib/questions';
import { Session, Message, AppBrief } from '@/lib/types';
import { Send, Mic, MicOff, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function DiscoverySessionPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;

  // Session & Chat State
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Review & Completion State
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState<Partial<AppBrief> | null>(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasExited, setHasExited] = useState(false);

  // Onboarding Step State: 'name' | 'consent' | 'chat'
  const [onboardingStep, setOnboardingStep] = useState<'name' | 'consent' | 'chat'>('name');
  const [nameInput, setNameInput] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, orbState]);

  // Load Session Data
  useEffect(() => {
    if (!token) return;

    async function loadSession() {
      try {
        const res = await fetch(`/api/session/${token}`);
        if (!res.ok) {
          throw new Error('Failed to load session');
        }
        const data = await res.json();
        setSession(data.session);
        setMessages(data.messages || []);

        if (data.session.status === 'completed') {
          setIsCompleted(true);
          setGeneratedBrief(data.brief || null);
        } else if (data.session.client_name && data.session.consent_given) {
          setOnboardingStep('chat');
        } else if (data.session.client_name) {
          setNameInput(data.session.client_name);
          setOnboardingStep('consent');
        } else {
          setOnboardingStep('name');
        }
      } catch (err) {
        console.error('Session load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();
  }, [token]);

  // Native Speech Recognition Setup (100% Free Web Speech API)
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  // Step 1: Submit Name
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/session/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_name: nameInput.trim() }),
      });
      const data = await res.json();
      setSession(data.session);
      setOnboardingStep('consent');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Consent Decision
  const handleConsent = async (agree: boolean) => {
    if (!agree) {
      setHasExited(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/session/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_given: true,
          status: 'in_progress',
        }),
      });
      const data = await res.json();
      setSession(data.session);
      setOnboardingStep('chat');

      // If no messages exist yet, send the first core question
      if (messages.length === 0) {
        const firstQ = CORE_QUESTIONS[0];
        const greeting = `Hi ${nameInput.trim() || 'there'}. I'm ENOS, your AI guide. Let's begin exploring your app idea.\n\n${firstQ.title}\n\n*${firstQ.guidance}*`;
        setMessages([
          {
            id: 'init-1',
            session_id: session?.id || '',
            role: 'enos',
            content: greeting,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Send Message / Turn in Chat
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending || !session) return;

    const userMessageContent = text.trim();
    setInputText('');
    setIsSending(true);
    setOrbState('thinking');

    // Optimistically append client message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      session_id: session.id,
      role: 'client',
      content: userMessageContent,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const currentQ = CORE_QUESTIONS[session.current_question_index || 0];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          message: userMessageContent,
          questionId: currentQ?.id,
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');
      const data = await res.json();

      setOrbState('speaking');

      const enosReplyMsg: Message = {
        id: `enos-${Date.now()}`,
        session_id: session.id,
        role: 'enos',
        content: data.reply,
        created_at: new Date().toISOString(),
        is_follow_up: data.isFollowUp,
      };

      setMessages((prev) => [...prev, enosReplyMsg]);

      // Update local session question pointer
      setSession((prev) =>
        prev
          ? {
              ...prev,
              current_question_index: data.nextQuestionIndex,
              current_chapter: data.chapter,
            }
          : prev
      );

      // Transition to Review Stage if all questions complete
      if (data.isFinished) {
        setTimeout(() => triggerReviewSynthesis(), 1500);
      } else {
        setTimeout(() => setOrbState('idle'), 2000);
      }
    } catch (err) {
      console.error(err);
      setOrbState('idle');
    } finally {
      setIsSending(false);
    }
  };

  // Synthesize App Brief for Review
  const triggerReviewSynthesis = async () => {
    setIsGeneratingBrief(true);
    setOrbState('thinking');
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setGeneratedBrief(data.brief);
      setIsReviewMode(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingBrief(false);
      setOrbState('idle');
    }
  };

  // Confirm Final App Brief
  const handleConfirmBrief = async (notes?: string) => {
    setIsSending(true);
    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, feedbackNotes: notes }),
      });
      const data = await res.json();
      setGeneratedBrief(data.brief);
      setIsCompleted(true);
      setIsReviewMode(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="discovery-container center-screen">
        <EnosOrb state="thinking" size={110} />
        <p className="loading-text">Connecting with ENOS...</p>
        <style jsx>{`
          .center-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100dvh;
            text-align: center;
          }
          .loading-text {
            margin-top: 20px;
            font-size: 15px;
            color: var(--text-secondary);
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  // Polite exit screen
  if (hasExited) {
    return (
      <div className="discovery-container center-screen">
        <EnosOrb state="idle" size={90} />
        <h2 className="exit-title">Session Closed</h2>
        <p className="exit-desc">
          Thank you, {nameInput || 'friend'}. Whenever you are ready to explore your application vision, Every Nation GG will be here to bring it to life.
        </p>
        <style jsx>{`
          .center-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100dvh;
            padding: 24px;
            text-align: center;
          }
          .exit-title {
            font-size: 22px;
            color: var(--text-main);
            margin: 20px 0 8px 0;
            font-weight: 700;
          }
          .exit-desc {
            font-size: 14.5px;
            color: var(--text-secondary);
            max-width: 360px;
            line-height: 1.6;
          }
        `}</style>
      </div>
    );
  }

  // Final Completed Celebration Screen
  if (isCompleted) {
    return (
      <div className="discovery-container center-screen">
        <div className="completed-badge">
          <CheckCircle2 size={36} color="var(--violet-primary)" />
        </div>
        <h1 className="completed-title">App Brief Delivered</h1>
        <p className="completed-desc">
          Thank you, <strong>{session?.client_name}</strong>. Your project vision for <strong>{generatedBrief?.project_title || 'your application'}</strong> has been synthesized and delivered directly to the engineering and design team at <strong>Every Nation GG</strong>.
        </p>
        <div className="visien-card brief-highlight-card">
          <p className="highlight-tag">Core Action</p>
          <p className="highlight-text">{generatedBrief?.core_action || 'Documented in App Brief'}</p>
          <p className="highlight-tag" style={{ marginTop: '12px' }}>Infrastructure Choice</p>
          <p className="highlight-text">{generatedBrief?.infrastructure_preference || 'ENGG Managed'}</p>
        </div>
        <p className="completed-footer">We will review your vision and be in touch shortly.</p>
        <style jsx>{`
          .center-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100dvh;
            padding: 32px 20px;
            text-align: center;
          }
          .completed-badge {
            margin-bottom: 16px;
          }
          .completed-title {
            font-size: 26px;
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 10px;
          }
          .completed-desc {
            font-size: 15px;
            color: var(--text-secondary);
            max-width: 440px;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .brief-highlight-card {
            width: 100%;
            max-width: 440px;
            padding: 20px;
            text-align: left;
            margin-bottom: 24px;
          }
          .highlight-tag {
            font-size: 11.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--violet-deep);
            margin-bottom: 4px;
          }
          .highlight-text {
            font-size: 14.5px;
            color: var(--text-main);
            font-weight: 500;
          }
          .completed-footer {
            font-size: 13.5px;
            color: var(--text-muted);
          }
        `}</style>
      </div>
    );
  }

  // Review Mode: "Here's what I understood"
  if (isReviewMode && generatedBrief) {
    return (
      <div className="discovery-container">
        <div className="orb-header">
          <EnosOrb state={orbState} size={85} />
        </div>
        <ReviewDeck
          clientName={session?.client_name || 'Client'}
          brief={generatedBrief}
          onConfirm={handleConfirmBrief}
          isSubmitting={isSending}
        />
        <style jsx>{`
          .discovery-container {
            width: 100%;
            min-height: 100dvh;
            padding-top: 24px;
          }
          .orb-header {
            margin-bottom: 12px;
          }
        `}</style>
      </div>
    );
  }

  // Step 1: "What do I call you?"
  if (onboardingStep === 'name') {
    return (
      <div className="discovery-container center-screen">
        <EnosOrb state="waiting" size={120} />
        <div className="name-prompt-card visien-card">
          <h1 className="name-title">What do I call you?</h1>
          <p className="name-subtitle">Enter your name to begin your private VISIEN session.</p>
          <form onSubmit={handleNameSubmit} className="name-form">
            <input
              type="text"
              autoFocus
              className="name-input"
              placeholder="Your first name"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
            <button type="submit" className="visien-btn-primary continue-btn" disabled={!nameInput.trim()}>
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
        <style jsx>{`
          .center-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100dvh;
            padding: 24px 16px;
          }
          .name-prompt-card {
            width: 100%;
            max-width: 400px;
            margin-top: 32px;
            padding: 32px 24px;
            text-align: center;
          }
          .name-title {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 8px;
          }
          .name-subtitle {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 24px;
          }
          .name-input {
            width: 100%;
            padding: 14px 18px;
            border-radius: var(--radius-md);
            border: 1px solid var(--border-subtle);
            font-size: 16px;
            outline: none;
            background: #FFFFFF;
            color: var(--text-main);
            margin-bottom: 16px;
            text-align: center;
          }
          .name-input:focus {
            border-color: var(--violet-primary);
          }
          .continue-btn {
            width: 100%;
          }
        `}</style>
      </div>
    );
  }

  // Step 2: ENOS Introduction & Consent
  if (onboardingStep === 'consent') {
    return (
      <div className="discovery-container center-screen">
        <EnosOrb state="speaking" size={110} />
        <div className="visien-card consent-card">
          <p className="intro-line">
            Hi, <strong>{nameInput}</strong>. You're now in <strong>VISIEN</strong> — Vision Inspired by Story and Idea, by Every Nation.
          </p>
          <p className="intro-line">
            I'm <strong>ENOS</strong>, your AI guide.
          </p>
          <p className="intro-line">
            VISIEN will ask you questions about the app you want to create — including your idea, goals, users, experience, and how you imagine it looking and working.
          </p>
          <p className="intro-line">
            Your answers will be used by <strong>Every Nation GG</strong> to understand your vision and prepare your project. You may share as much detail as you'd like.
          </p>
          <p className="ready-question">Are you ready to begin?</p>
          <div className="consent-actions">
            <button
              type="button"
              className="visien-btn-primary full-width"
              onClick={() => handleConsent(true)}
            >
              <span>YES, LET'S BEGIN</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="visien-btn-secondary full-width"
              onClick={() => handleConsent(false)}
            >
              <span>NO, EXIT</span>
            </button>
          </div>
        </div>
        <style jsx>{`
          .center-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100dvh;
            padding: 24px 16px;
          }
          .consent-card {
            width: 100%;
            max-width: 440px;
            margin-top: 24px;
            padding: 28px 24px;
            text-align: left;
          }
          .intro-line {
            font-size: 14.5px;
            color: var(--text-main);
            line-height: 1.6;
            margin-bottom: 12px;
          }
          .ready-question {
            font-size: 15.5px;
            font-weight: 700;
            color: var(--violet-deep);
            margin: 16px 0 20px 0;
            text-align: center;
          }
          .consent-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .full-width {
            width: 100%;
          }
        `}</style>
      </div>
    );
  }

  // Active Question info for Suggestion Chips
  const currentQIndex = session?.current_question_index || 0;
  const currentQ = CORE_QUESTIONS[currentQIndex];

  return (
    <div className="chat-layout">
      {/* Top Ambient Bar */}
      <header className="chat-header">
        <EnosOrb state={orbState} size={70} />
        <ChapterProgress
          currentChapter={(session?.current_chapter as any) || 1}
          currentQuestionIndex={currentQIndex}
          totalQuestions={CORE_QUESTIONS.length}
        />
      </header>

      {/* Message Feed */}
      <main className="messages-feed">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble-row ${msg.role === 'client' ? 'client-row' : 'enos-row'}`}
          >
            <div className={`message-bubble ${msg.role === 'client' ? 'client-bubble' : 'enos-bubble'}`}>
              <p className="message-content">{msg.content}</p>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="message-bubble-row enos-row">
            <div className="message-bubble enos-bubble typing-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Suggestion Chips & Floating Input */}
      <footer className="chat-footer">
        {currentQ?.chips && (
          <SuggestionChips
            chips={currentQ.chips}
            onSelectChip={(chip) => handleSendMessage(chip)}
            disabled={isSending}
          />
        )}

        <div className="input-bar-container">
          <button
            type="button"
            className={`voice-btn ${isListening ? 'listening' : ''}`}
            onClick={toggleListening}
            title="Voice dictation"
          >
            {isListening ? <MicOff size={20} color="var(--gold-warm)" /> : <Mic size={20} />}
          </button>

          <input
            type="text"
            className="chat-input"
            placeholder={isListening ? 'Listening...' : 'Share your idea...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isSending}
          />

          <button
            type="button"
            className="send-btn"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isSending}
          >
            <Send size={18} />
          </button>
        </div>
      </footer>

      <style jsx>{`
        .chat-layout {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          max-width: 540px;
          margin: 0 auto;
          position: relative;
        }

        .chat-header {
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(250, 247, 242, 0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-subtle);
          padding: 8px 12px;
          text-align: center;
        }

        .messages-feed {
          flex: 1;
          overflow-y: auto;
          padding: 16px 16px 120px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message-bubble-row {
          display: flex;
          width: 100%;
        }

        .client-row {
          justify-content: flex-end;
        }

        .enos-row {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 82%;
          padding: 12px 16px;
          border-radius: var(--radius-lg);
          font-size: 14.5px;
          line-height: 1.55;
          word-break: break-word;
        }

        .client-bubble {
          background: linear-gradient(135deg, var(--violet-primary) 0%, #6366F1 100%);
          color: #FFFFFF;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.22);
        }

        .enos-bubble {
          background: var(--surface-white);
          color: var(--text-main);
          border: 1px solid var(--border-subtle);
          border-bottom-left-radius: 4px;
          box-shadow: var(--shadow-sm);
        }

        .typing-bubble {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 12px 18px;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--violet-primary);
          animation: dot-pulse 1.4s infinite ease-in-out both;
        }

        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes dot-pulse {
          0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        .chat-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          max-width: 540px;
          margin: 0 auto;
          background: rgba(250, 247, 242, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding-bottom: env(safe-area-inset-bottom, 12px);
          z-index: 20;
        }

        .input-bar-container {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px 12px 16px;
        }

        .voice-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid var(--border-subtle);
          background: #FFFFFF;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .voice-btn.listening {
          border-color: var(--gold-warm);
          background: var(--gold-soft);
          animation: pulse-ring 1.5s infinite;
        }

        .chat-input {
          flex: 1;
          height: 44px;
          padding: 0 16px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          background: #FFFFFF;
          color: var(--text-main);
          font-size: 15px;
          outline: none;
          box-shadow: var(--shadow-sm);
        }

        .chat-input:focus {
          border-color: var(--violet-primary);
        }

        .send-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: var(--violet-primary);
          color: #FFFFFF;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .send-btn:disabled {
          background: rgba(120, 113, 108, 0.2);
          cursor: not-allowed;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 8px rgba(234, 88, 12, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0); }
        }
      `}</style>
    </div>
  );
}
