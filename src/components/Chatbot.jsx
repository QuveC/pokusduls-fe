import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const messagesEndRef = useRef(null);

  // Sesi unik per lifecycle component
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
    const prompt = "Please summarize all my study data. REMEMBER: DO NOT use any introductory sentences. Start IMMEDIATELY with the data.";
    
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
    <div className="chat-container">
      <div className="chat-header">
        <span>AI Study Coach</span>
        <button className="summary-btn" onClick={generateSummary} disabled={isSummarizing}>
          {isSummarizing ? "Analyzing..." : "📊 Summarize"}
        </button>
      </div>

      <div className="messages">
        {messages.length === 0 && <div className="empty-state">Halo! Ada yang mau didiskusikan?</div>}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <div className="message-content" 
                 dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }} 
            />
          </div>
        ))}
        
        {isTyping && <div className="typing-indicator">Aura is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..." 
          />
          <button onClick={() => handleSend()} disabled={isTyping}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;