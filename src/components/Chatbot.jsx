import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const BotIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
  </svg>
);

const N8N_WEBHOOK_URL = 'https://flounder-scarce-litter.ngrok-free.dev/webhook/study_assist';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionId = useRef("user_" + Math.random().toString(36).substring(2, 9));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const fetchFromN8n = async (textInput) => {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '69420' },
      body: JSON.stringify({ chatInput: textInput, sessionId: sessionId.current })
    });
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    return data[0]?.output || data.output || "Tidak ada respon.";
  };

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: messageText }]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponse = await fetchFromN8n(messageText);
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'ai', text: "Koneksi ke AI terputus. Coba lagi." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container">
      {}
      <div className="messages">
        {messages.length === 0 && (
          <div className="empty-state">Halo! Ada yang mau ditanyakan?</div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
            gap: '8px',
            alignItems: 'flex-start',
            animation: 'slide-up 0.25s ease-out',
          }}>
            {msg.sender === 'ai' && (
              <div style={{
                width: '28px', height: '28px',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: '2px', color: 'white',
              }}>
                <BotIcon />
              </div>
            )}
            <div
              className="message-content"
              style={{
                maxWidth: '80%',
                padding: '10px 14px',
                borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                fontSize: '13px',
                lineHeight: 1.7,
                color: '#e2e8f0',
                background: msg.sender === 'user'
                  ? 'linear-gradient(135deg, #10b981, #06b6d4)'
                  : 'rgba(255,255,255,0.05)',
                border: msg.sender === 'ai' ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}
              dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
            />
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{
              width: '28px', height: '28px',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, color: 'white',
            }}>
              <BotIcon />
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <div className="bounce-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
              <div className="bounce-dot-delay-1" style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
              <div className="bounce-dot-delay-2" style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {}
      <div className="input-container">
        <div style={{
          display: 'flex', gap: '8px', alignItems: 'center',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '14px',
          padding: '6px 6px 6px 14px',
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ketik pesan..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#f1f5f9', fontSize: '13px', fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={isTyping || !input.trim()}
            style={{
              width: '36px', height: '36px',
              background: !input.trim() || isTyping ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg, #10b981, #06b6d4)',
              border: 'none', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', cursor: !input.trim() || isTyping ? 'not-allowed' : 'pointer',
              transition: 'all 0.18s ease', flexShrink: 0,
            }}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;