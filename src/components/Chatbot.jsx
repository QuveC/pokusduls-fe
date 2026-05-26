import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';

const StudyChatbox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const messagesEndRef = useRef(null);

  // Sesi unik untuk presentasi
  const sessionId = useRef("user_" + Math.random().toString(36).substring(2, 9));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
    if (!messageText.trim()) return;

    // Tambah pesan user
    setMessages(prev => [...prev, { sender: 'user', text: messageText }]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponse = await fetchFromN8n(messageText);
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Error: Koneksi ke Aura terputus." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateSummary = async () => {
    setIsSummarizing(true);
    setIsTyping(true);
    const prompt = "Please summarize all my study data... (prompt rahasiamu)";
    
    try {
      const aiResponse = await fetchFromN8n(prompt);
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Gagal mengambil rangkuman." }]);
    } finally {
      setIsTyping(false);
      setIsSummarizing(false);
    }
  };

  return (
    <div className="chat-container" style={{ width: '100%', maxWidth: '600px', height: '80vh', display: 'flex', flexDirection: 'column', background: 'white', borderRadius: '20px', overflow: 'hidden' }}>
      <div className="chat-header" style={{ padding: '15px 20px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <span>AI Study Coach</span>
        <button className="summary-btn" onClick={generateSummary} disabled={isSummarizing}>
          {isSummarizing ? "Analyzing..." : "📊 Summarize"}
        </button>
      </div>

      <div className="messages" style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#f8f9fa' }}>
        {messages.length === 0 && <div className="empty-state" style={{ textAlign: 'center', color: '#999' }}>Halo! Ada yang mau didiskusikan?</div>}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: '16px' }}>
            <div className="message-content" 
                 style={{ padding: '12px 16px', borderRadius: '18px', maxWidth: '85%' }}
                 dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} 
            />
          </div>
        ))}
        
        {isTyping && <div className="typing-indicator">Aura is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container" style={{ padding: '20px', borderTop: '1px solid #eee' }}>
        <div className="input-wrapper" style={{ display: 'flex', gap: '12px' }}>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..." 
            style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '2px solid #e0e0e0' }}
          />
          <button onClick={() => handleSend()} disabled={isTyping}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default StudyChatbox;