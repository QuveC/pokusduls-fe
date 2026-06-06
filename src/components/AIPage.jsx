import { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';

/* ── Icons ───────────────────────────────────────────────────── */
const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const BotIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

/* ── Quick Prompt Suggestions ────────────────────────────────── */
const QUICK_PROMPTS = [
  { label: "Jelaskan konsep", text: "Jelaskan konsep fotosintesis dengan bahasa yang mudah dipahami" },
  { label: "Bantu belajar", text: "Bagaimana cara terbaik untuk belajar matematika secara efektif?" },
  { label: "Rangkum materi", text: "Rangkum materi tentang sistem tata surya" },
  { label: "Buat soal latihan", text: "Buatkan 5 soal latihan tentang hukum Newton beserta jawabannya" },
];

/* ── Main Component ──────────────────────────────────────────── */
const AIPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const sessionId = useRef("general_" + Math.random().toString(36).substring(2, 9));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const fetchFromN8n = async (textInput) => {
    const N8N_WEBHOOK_URL = 'https://flounder-scarce-litter.ngrok-free.dev/webhook/study_assist';
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': '69420'
      },
      body: JSON.stringify({
        chatInput: textInput,
        sessionId: sessionId.current
      })
    });
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    return data[0]?.output || data.output || "Tidak ada respon.";
  };

  const handleSend = async (messageText = input) => {
    if (!messageText.trim() || isTyping) return;

    setMessages(prev => [...prev, { sender: 'user', text: messageText }]);
    setInput('');
    setIsTyping(true);
    inputRef.current?.focus();

    try {
      const aiResponse = await fetchFromN8n(messageText);
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: "Maaf, koneksi ke AI terputus. Coba lagi sebentar." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    sessionId.current = "general_" + Math.random().toString(36).substring(2, 9);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 130px)',
      maxHeight: '700px',
    }}>
      {/* ── Chat Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(6,182,212,0.12) 100%)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '20px',
        padding: '18px 20px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
            flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
          </div>
          <div>
            <h2 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '16px', margin: 0, lineHeight: 1.2 }}>
              Aura — AI Study Assistant
            </h2>
            <p style={{ color: '#10b981', fontSize: '12px', margin: '2px 0 0', fontWeight: 500 }}>
              Tanyakan apa saja tentang pelajaran
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            title="Hapus percakapan"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171',
              borderRadius: '10px',
              padding: '8px 10px',
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
              transition: 'all 0.18s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.18)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            }}
          >
            <TrashIcon /> Hapus
          </button>
        )}
      </div>

      {/* ── Messages Area ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '4px 2px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(16,185,129,0.2) transparent',
      }}>

        {/* Empty state with quick prompts */}
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '64px', height: '64px',
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))',
              border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>
            <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '17px', marginBottom: '6px' }}>
              Halo! Saya Aura 👋
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
              Asisten belajar AI yang siap membantu kamu
            </p>

            {/* Quick Prompts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(qp.text)}
                  style={{
                    background: 'rgba(16,185,129,0.07)',
                    border: '1px solid rgba(16,185,129,0.18)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    color: '#6ee7b7',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(16,185,129,0.15)';
                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(16,185,129,0.07)';
                    e.currentTarget.style.borderColor = 'rgba(16,185,129,0.18)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{ opacity: 0.7, flexShrink: 0 }}><SparkleIcon /></span>
                  {qp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
            gap: '10px',
            alignItems: 'flex-start',
            animation: 'slide-up 0.25s ease-out',
          }}>
            {/* Avatar */}
            {msg.sender === 'ai' && (
              <div style={{
                width: '32px', height: '32px',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: '2px',
              }}>
                <BotIcon />
              </div>
            )}

            {/* Bubble */}
            <div style={{
              maxWidth: '78%',
              padding: '12px 16px',
              borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              fontSize: '14px',
              lineHeight: 1.7,
              color: '#e2e8f0',
              background: msg.sender === 'user'
                ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                : 'rgba(255,255,255,0.05)',
              border: msg.sender === 'ai' ? '1px solid rgba(255,255,255,0.07)' : 'none',
              boxShadow: msg.sender === 'user' ? '0 4px 16px rgba(16,185,129,0.3)' : 'none',
            }}
              dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
            />
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{
              width: '32px', height: '32px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <BotIcon />
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '18px 18px 18px 4px',
              padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <div className="bounce-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              <div className="bounce-dot-delay-1" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              <div className="bounce-dot-delay-2" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Area ── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingTop: '16px',
        marginTop: '12px',
        flexShrink: 0,
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '18px',
          padding: '8px 8px 8px 16px',
          transition: 'all 0.18s ease',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            placeholder="Tanyakan tentang pelajaran apa saja..."
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f1f5f9',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'none',
              lineHeight: 1.6,
              minHeight: '24px',
              maxHeight: '120px',
              paddingTop: '6px',
              paddingBottom: '6px',
              scrollbarWidth: 'none',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isTyping || !input.trim()}
            style={{
              width: '40px', height: '40px',
              background: !input.trim() || isTyping
                ? 'rgba(16,185,129,0.2)'
                : 'linear-gradient(135deg, #10b981, #06b6d4)',
              border: 'none',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white',
              cursor: !input.trim() || isTyping ? 'not-allowed' : 'pointer',
              transition: 'all 0.18s ease',
              flexShrink: 0,
              boxShadow: !input.trim() || isTyping ? 'none' : '0 4px 12px rgba(16,185,129,0.35)',
            }}
          >
            <SendIcon />
          </button>
        </div>
        <p style={{ color: '#334155', fontSize: '11px', textAlign: 'center', marginTop: '8px' }}>
          Enter untuk kirim · Shift+Enter untuk baris baru
        </p>
      </div>
    </div>
  );
};

export default AIPage;
