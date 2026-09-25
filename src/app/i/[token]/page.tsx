'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { EnosOrb, OrbState } from '@/components/EnosOrb';
import { ChapterProgress } from '@/components/ChapterProgress';
import { SuggestionChips } from '@/components/SuggestionChips';
import { ReviewDeck } from '@/components/ReviewDeck';
import { CORE_QUESTIONS } from '@/lib/questions';
import { Session, Message, AppBrief } from '@/lib/types';
import { Send, Mic, MicOff, ArrowRight, CheckCircle2, Copy, Check } from 'lucide-react';

// Typewriter hook: animates text character by character
function useTypewriter(text: string, speed: number = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    if (!text) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

// Individual ENOS message with typewriter effect
function EnosMessage({ content, isNew }: { content: string; isNew: boolean }) {
  const { displayed, done } = useTypewriter(isNew ? content : '', 16);
  const text = isNew ? displayed : content;

  return (
    <div className="message-bubble enos-bubble">
      <p className="message-content">
        {text}
        {isNew && !done && <span className="typing-cursor">|</span>}
      </p>
    </div>
  );
}

export default function DiscoverySessionPage() {
  const params = useParams();
  const token = params?.token as string;

  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [newestEnosId, setNewestEnosId] = useState<string | null>(null);

  // Review & Completion
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState<Partial<AppBrief> | null>(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasExited, setHasExited] = useState(false);

  // Onboarding step
  const [onboardingStep, setOnboardingStep] = useState<'name' | 'consent' | 'chat'>('name');
  const [nameInput, setNameInput] = useState('');

  // Transcript copy
  const [copied, setCopied] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTranscribingAudio, setIsTranscribingAudio] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Keep cursor focused in chatbox
  useEffect(() => {
    if (onboardingStep === 'chat' && !isSending && !isGeneratingBrief) {
      inputRef.current?.focus();
    }
  }, [onboardingStep, isSending, isGeneratingBrief]);

  // Load Session
  useEffect(() => {
    if (!token) return;
    async function loadSession() {
      try {
        const res = await fetch(`/api/session/${token}`);
        if (!res.ok) throw new Error('Failed to load session');
        const data = await res.json();
        setSession(data.session);
        setMessages(data.messages || []);

        if (data.session.status === 'completed') {
          if (data.brief) {
            setGeneratedBrief(data.brief);
            setIsCompleted(true);
          } else {
            // Brief exists but wasn't fetched — trigger review
            setIsReviewMode(false);
            setIsCompleted(true);
          }
        } else if (data.session.client_name && data.session.consent_given) {
          setOnboardingStep('chat');
          setNameInput(data.session.client_name);
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

  // Cleanup voice recognition & audio stream on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (audioStreamRef.current) {
        try {
          audioStreamRef.current.getTracks().forEach((t) => t.stop());
        } catch (e) {}
      }
    };
  }, []);

  const toggleListening = async () => {
    // If currently recording/listening, STOP and transcribe!
    if (isListening) {
      setIsListening(false);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }

      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {}
      }
      return;
    }

    // START recording
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Microphone recording is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    try {
      // 1. Request microphone access - browser icon turns ON and stays ON!
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      // Determine supported mime type
      let mimeType = 'audio/webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        }
      }

      const recorder = new MediaRecorder(stream, { mimeType: mimeType || undefined });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Release audio stream - browser mic icon disappears
        if (audioStreamRef.current) {
          try {
            audioStreamRef.current.getTracks().forEach((track) => track.stop());
          } catch (e) {}
          audioStreamRef.current = null;
        }

        const chunks = audioChunksRef.current;
        if (chunks.length === 0) return;

        const audioBlob = new Blob(chunks, { type: mimeType });

        // If recording was very short (< 200 bytes), skip
        if (audioBlob.size < 200) return;

        setIsTranscribingAudio(true);
        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');
          const res = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.transcript && data.transcript.trim()) {
            setInputText((prev) => {
              const cleaned = data.transcript.trim();
              return prev ? `${prev} ${cleaned}` : cleaned;
            });
          }
        } catch (transcribeErr) {
          console.error('Audio transcription error:', transcribeErr);
        } finally {
          setIsTranscribingAudio(false);
          setTimeout(() => inputRef.current?.focus(), 50);
        }
      };

      // Also start Web Speech in parallel for live interim preview
      const SpeechRecognition =
        typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; i++) {
              fullText += event.results[i][0]?.transcript || '';
            }
            if (fullText.trim()) {
              setInputText(fullText.trim());
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('Live SpeechRecognition notice:', e.error);
          };

          recognitionRef.current = recognition;
          recognition.start();
        } catch (speechErr) {
          console.warn('SpeechRecognition unavailable, MediaRecorder active:', speechErr);
        }
      }

      recorder.start(200);
      setIsListening(true);
    } catch (permError: any) {
      console.error('Microphone access denied:', permError);
      setIsListening(false);
      alert(
        'Microphone permission was not allowed. Please click the camera/lock icon in your browser address bar to allow microphone access.'
      );
    }
  };

  // Copy full transcript to clipboard
  const copyTranscript = useCallback(() => {
    const text = messages
      .map((m) => `${m.role === 'enos' ? 'ENOS' : 'Client'}: ${m.content}`)
      .join('\n\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [messages]);

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

  // Step 2: Consent
  const handleConsent = async (agree: boolean) => {
    if (!agree) { setHasExited(true); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/session/${token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ consent_given: true, status: 'in_progress' }),
      });
      const data = await res.json();
      setSession(data.session);
      setOnboardingStep('chat');

      if (messages.length === 0) {
        const firstQ = CORE_QUESTIONS[0];
        const greeting = `Hi ${nameInput.trim() || 'there'}! I'm ENOS, your AI guide here in VISIEN.\n\nI'll ask you about the app idea you have in mind — no technical knowledge needed, just share your thoughts naturally.\n\nLet's start here: ${firstQ.title}\n\n${firstQ.guidance}`;
        const initMsg: Message = {
          id: 'init-1',
          session_id: data.session?.id || '',
          role: 'enos',
          content: greeting,
          created_at: new Date().toISOString(),
        };
        setMessages([initMsg]);
        setNewestEnosId('init-1');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger App Brief Synthesis
  const triggerReviewSynthesis = useCallback(async () => {
    if (isGeneratingBrief) return;
    setIsGeneratingBrief(true);
    setOrbState('thinking');

    // Add a transitional ENOS message
    const briefingMsg: Message = {
      id: `enos-briefing-${Date.now()}`,
      session_id: session?.id || '',
      role: 'enos',
      content: `That covers everything I needed to know. Give me a moment while I put together what I understood about your app vision...`,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, briefingMsg]);
    setNewestEnosId(briefingMsg.id);

    try {
      const res = await fetch('/api/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setGeneratedBrief(data.brief);
      setTimeout(() => {
        setIsReviewMode(true);
        setOrbState('idle');
      }, 2500);
    } catch (err) {
      console.error('Brief generation error:', err);
      setOrbState('idle');
    } finally {
      setIsGeneratingBrief(false);
    }
  }, [token, session?.id, isGeneratingBrief]);

  // Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending || !session) return;

    const userMessageContent = text.trim();
    setInputText('');
    setIsSending(true);
    setOrbState('thinking');

    // Retain focus in input box immediately
    inputRef.current?.focus();

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
      setNewestEnosId(enosReplyMsg.id);

      setSession((prev) =>
        prev ? { ...prev, current_question_index: data.nextQuestionIndex, current_chapter: data.chapter } : prev
      );

      if (data.isFinished) {
        // Wait for typewriter to finish, then trigger synthesis
        setTimeout(() => triggerReviewSynthesis(), 3000);
      } else {
        setTimeout(() => setOrbState('waiting'), 2500);
      }
    } catch (err) {
      console.error(err);
      setOrbState('idle');
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Confirm Brief
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

  // Loading screen
  if (loading) {
    return (
      <div className="discovery-fullscreen">
        <EnosOrb state="thinking" size={100} />
        <style jsx>{`
          .discovery-fullscreen { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100dvh; }
        `}</style>
      </div>
    );
  }

  // Exit screen
  if (hasExited) {
    return (
      <div className="discovery-fullscreen">
        <EnosOrb state="idle" size={90} />
        <h2 className="exit-title">Session Closed</h2>
        <p className="exit-desc">
          Thank you, {nameInput || 'friend'}. Whenever you are ready to explore your app vision, Every Nation GG will be here.
        </p>
        <style jsx>{`
          .discovery-fullscreen { display:flex; flex-direction:column; align-items:center; justify-content:center; height:100dvh; padding:24px; text-align:center; }
          .exit-title { font-size:22px; color:var(--text-main); margin:20px 0 8px; font-weight:700; }
          .exit-desc { font-size:14.5px; color:var(--text-secondary); max-width:360px; line-height:1.6; }
        `}</style>
      </div>
    );
  }

  // Completed screen
  if (isCompleted) {
    return (
      <div className="discovery-fullscreen completed-screen">
        <div className="completed-icon"><CheckCircle2 size={48} color="var(--violet-primary)" /></div>
        <h1 className="completed-title">Your Vision is Submitted</h1>
        <p className="completed-desc">
          Thank you, <strong>{session?.client_name}</strong>. Your app vision for <strong>{generatedBrief?.project_title || 'your project'}</strong> has been delivered to the team at <strong>Every Nation GG</strong>. They'll be in touch soon.
        </p>
        {messages.length > 0 && (
          <button type="button" className="visien-btn-secondary copy-transcript-btn" onClick={copyTranscript}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
            <span>{copied ? 'Copied!' : 'Copy Full Conversation'}</span>
          </button>
        )}
        <style jsx>{`
          .discovery-fullscreen { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100dvh; padding:32px 20px; text-align:center; }
          .completed-screen { gap:16px; }
          .completed-icon { }
          .completed-title { font-size:26px; font-weight:800; color:var(--text-main); }
          .completed-desc { font-size:15px; color:var(--text-secondary); max-width:440px; line-height:1.6; }
          .copy-transcript-btn { display:inline-flex; align-items:center; gap:8px; margin-top:8px; }
        `}</style>
      </div>
    );
  }

  // Review Mode
  if (isReviewMode && generatedBrief) {
    return (
      <div className="discovery-fullscreen" style={{ justifyContent: 'flex-start', paddingTop: '24px' }}>
        <EnosOrb state={orbState} size={80} />
        <ReviewDeck
          clientName={session?.client_name || 'Client'}
          brief={generatedBrief}
          onConfirm={handleConfirmBrief}
          isSubmitting={isSending}
        />
        <style jsx>{`.discovery-fullscreen{display:flex;flex-direction:column;align-items:center;width:100%;}`}</style>
      </div>
    );
  }

  // Name screen
  if (onboardingStep === 'name') {
    return (
      <div className="discovery-fullscreen">
        <EnosOrb state="waiting" size={120} />
        <div className="visien-card onboard-card">
          <h1 className="onboard-title">What do I call you?</h1>
          <p className="onboard-sub">Enter your name to begin your private VISIEN session.</p>
          <form onSubmit={handleNameSubmit} className="onboard-form">
            <input type="text" autoFocus className="onboard-input" placeholder="Your first name" value={nameInput} onChange={(e) => setNameInput(e.target.value)} />
            <button type="submit" className="visien-btn-primary onboard-btn" disabled={!nameInput.trim()}>
              <span>Continue</span><ArrowRight size={16} />
            </button>
          </form>
        </div>
        <style jsx>{`
          .discovery-fullscreen { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100dvh; padding:24px 16px; }
          .onboard-card { width:100%; max-width:400px; margin-top:28px; padding:32px 24px; text-align:center; }
          .onboard-title { font-size:24px; font-weight:700; color:var(--text-main); margin-bottom:8px; }
          .onboard-sub { font-size:14px; color:var(--text-secondary); margin-bottom:24px; }
          .onboard-input { width:100%; padding:14px 18px; border-radius:var(--radius-md); border:1px solid var(--border-subtle); font-size:16px; outline:none; background:#FFF; color:var(--text-main); margin-bottom:16px; text-align:center; }
          .onboard-input:focus { border-color:var(--violet-primary); }
          .onboard-btn { width:100%; gap:8px; }
        `}</style>
      </div>
    );
  }

  // Consent screen
  if (onboardingStep === 'consent') {
    return (
      <div className="discovery-fullscreen">
        <EnosOrb state="speaking" size={110} />
        <div className="visien-card consent-card">
          <p className="intro-line">Hi, <strong>{nameInput}</strong>. You're now in <strong>VISIEN</strong> — Vision Inspired by Story and Idea, by Every Nation.</p>
          <p className="intro-line">I'm <strong>ENOS</strong>, your AI guide. I'll ask you questions about the app you want to create — your idea, goals, users, and how you imagine it looking and working.</p>
          <p className="intro-line">Your answers will be used by <strong>Every Nation GG</strong> to understand your vision and prepare your project.</p>
          <p className="ready-q">Are you ready to begin?</p>
          <div className="consent-btns">
            <button type="button" className="visien-btn-primary full-w" onClick={() => handleConsent(true)}>
              <span>YES, LET'S BEGIN</span><ArrowRight size={16} />
            </button>
            <button type="button" className="visien-btn-secondary full-w" onClick={() => handleConsent(false)}>NO, EXIT</button>
          </div>
        </div>
        <style jsx>{`
          .discovery-fullscreen { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100dvh; padding:24px 16px; }
          .consent-card { width:100%; max-width:440px; margin-top:24px; padding:28px 24px; text-align:left; }
          .intro-line { font-size:14.5px; color:var(--text-main); line-height:1.6; margin-bottom:12px; }
          .ready-q { font-size:15.5px; font-weight:700; color:var(--violet-deep); margin:16px 0 20px; text-align:center; }
          .consent-btns { display:flex; flex-direction:column; gap:10px; }
          .full-w { width:100%; }
        `}</style>
      </div>
    );
  }

  // Active chat
  const currentQIndex = session?.current_question_index || 0;
  const currentQ = CORE_QUESTIONS[currentQIndex];

  return (
    <div className="chat-layout">
      <header className="chat-header">
        <EnosOrb state={orbState} size={60} />
        <ChapterProgress
          currentChapter={(session?.current_chapter as any) || 1}
          currentQuestionIndex={currentQIndex}
          totalQuestions={CORE_QUESTIONS.length}
        />
      </header>

      <main className="messages-feed">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.role === 'client' ? 'client-row' : 'enos-row'}`}>
            {msg.role === 'enos' ? (
              <EnosMessage content={msg.content} isNew={msg.id === newestEnosId} />
            ) : (
              <div className="message-bubble client-bubble">
                <p className="message-content">{msg.content}</p>
              </div>
            )}
          </div>
        ))}

        {/* Thinking dots while waiting for ENOS response */}
        {isSending && (
          <div className="message-row enos-row">
            <div className="message-bubble enos-bubble typing-bubble">
              <span className="dot" /><span className="dot" /><span className="dot" />
            </div>
          </div>
        )}

        {/* Generating brief indicator */}
        {isGeneratingBrief && (
          <div className="message-row enos-row">
            <div className="message-bubble enos-bubble">
              <p className="message-content" style={{ color: 'var(--violet-deep)', fontStyle: 'italic' }}>
                Synthesizing your App Brief...
              </p>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      <footer className="chat-footer">
        {currentQ?.chips && !isSending && (
          <SuggestionChips
            chips={currentQ.chips}
            onSelectChip={(chip) => handleSendMessage(chip)}
            disabled={isSending}
          />
        )}

        <div className="input-bar">
          <button
            type="button"
            className={`voice-btn ${isListening ? 'listening' : ''} ${isTranscribingAudio ? 'transcribing' : ''}`}
            onClick={toggleListening}
            title={isListening ? 'Stop recording and transcribe' : 'Start voice input'}
            disabled={isTranscribingAudio}
          >
            {isTranscribingAudio ? (
              <span className="transcribing-dot" />
            ) : isListening ? (
              <MicOff size={18} color="var(--gold-warm)" />
            ) : (
              <Mic size={18} />
            )}
          </button>

          <input
            ref={inputRef}
            type="text"
            className="chat-input"
            placeholder={
              isTranscribingAudio
                ? 'Transcribing audio with Gemini...'
                : isListening
                ? 'Listening... Click mic again when done'
                : 'Type your answer...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSendMessage();
                inputRef.current?.focus();
              }
            }}
            autoFocus
          />

          <button
            type="button"
            className="send-btn"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isSending || isGeneratingBrief}
          >
            <Send size={17} />
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
        }

        .chat-header {
          position: sticky;
          top: 0;
          z-index: 10;
          background: rgba(250, 247, 242, 0.94);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-subtle);
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .messages-feed {
          flex: 1;
          overflow-y: auto;
          padding: 16px 16px 140px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message-row {
          display: flex;
          width: 100%;
        }

        .client-row { justify-content: flex-end; }
        .enos-row { justify-content: flex-start; }

        .message-bubble {
          max-width: 84%;
          padding: 12px 16px;
          border-radius: 20px;
          font-size: 14.5px;
          line-height: 1.6;
          word-break: break-word;
        }

        .client-bubble {
          background: linear-gradient(135deg, var(--violet-primary) 0%, #6366F1 100%);
          color: #FFF;
          border-bottom-right-radius: 5px;
          box-shadow: 0 4px 14px rgba(124,58,237,0.2);
        }

        .enos-bubble {
          background: var(--surface-white);
          color: var(--text-main);
          border: 1px solid var(--border-subtle);
          border-bottom-left-radius: 5px;
          box-shadow: var(--shadow-sm);
        }

        .message-content {
          white-space: pre-wrap;
        }

        .typing-cursor {
          display: inline-block;
          animation: blink 0.8s step-end infinite;
          color: var(--violet-primary);
          font-weight: 700;
          margin-left: 1px;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .typing-bubble {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 14px 18px;
        }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--violet-primary);
          animation: dot-bounce 1.4s infinite ease-in-out both;
        }
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes dot-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }

        .chat-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          max-width: 540px;
          margin: 0 auto;
          background: rgba(250, 247, 242, 0.96);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding-bottom: env(safe-area-inset-bottom, 12px);
          z-index: 20;
        }

        .input-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px 12px 14px;
        }

        .voice-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1px solid var(--border-subtle);
          background: #FFF;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .voice-btn.listening {
          border-color: var(--gold-warm);
          background: var(--gold-soft);
          color: var(--gold-warm);
          animation: mic-pulse 1.5s infinite;
        }

        .voice-btn.transcribing {
          border-color: var(--violet-primary);
          background: var(--violet-soft);
        }

        .transcribing-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid var(--violet-primary);
          border-top-color: transparent;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes mic-pulse {
          0% { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(234, 88, 12, 0); }
          100% { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0); }
        }

        .chat-input {
          flex: 1;
          height: 44px;
          padding: 0 16px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          background: #FFF;
          color: var(--text-main);
          font-size: 15px;
          outline: none;
          font-family: inherit;
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
          color: #FFF;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .send-btn:disabled {
          background: rgba(120,113,108,0.2);
          cursor: not-allowed;
        }

        .send-btn:not(:disabled):hover {
          background: var(--violet-deep);
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
