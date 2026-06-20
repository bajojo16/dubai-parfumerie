"use client";
import { useState, useRef, useEffect } from "react";

type Message = { role: 'user' | 'assistant'; content: string };

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '✨ Bonjour ! Je suis votre parfumeur virtuel. Dites-moi ce que vous cherchez — une note, une occasion, une émotion — et je vous guide vers votre signature olfactive.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const apiMessages = [...messages, { role: 'user', content: userMsg }].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const { text } = JSON.parse(data) as { text: string };
            assistantText += text;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', content: assistantText };
              return updated;
            });
          } catch { /* ignore malformed SSE chunks */ }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Désolé, une erreur est survenue. Veuillez réessayer.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Chatbot parfumeur"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 250,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--gold-500)',
          border: 'none',
          boxShadow: '0 4px 20px rgba(200,144,30,0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          transition: 'transform 0.2s',
        }}
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 92,
          right: 24,
          zIndex: 250,
          width: 360,
          height: 480,
          background: 'var(--surface-white)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--line-200)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            background: 'var(--espresso-900)',
            color: 'var(--on-dark-strong)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: '1.2rem' }}>🌸</span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem' }}>Votre Parfumeur</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--on-dark-muted)', letterSpacing: '0.1em' }}>
                DUBAI PARFUMERIE · EN LIGNE
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  maxWidth: '85%',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.role === 'user' ? 'var(--gold-500)' : 'var(--surface-cream)',
                  color: msg.role === 'user' ? '#fff' : 'var(--ink-900)',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                }}
              >
                {msg.content || (loading && i === messages.length - 1 ? '...' : '')}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px',
            borderTop: '1px solid var(--line-100)',
            display: 'flex',
            gap: 8,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Décrivez votre parfum idéal…"
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: '1px solid var(--line-200)',
                borderRadius: 'var(--r-sm)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.85rem',
                background: 'var(--surface-page)',
                color: 'var(--ink-900)',
                outline: 'none',
              }}
            />
            <button
              onClick={send}
              disabled={loading}
              style={{
                background: 'var(--gold-500)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--r-sm)',
                padding: '10px 14px',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
