import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { sendChatMessage } from '../api/chat';

export default function Chatbot() {
  const [messages, setMessages] = useState([{
    id: '1', role: 'assistant', timestamp: new Date(),
    content: 'Halo! Saya asisten belajar AI PokusDuls. Saya bisa membantu:\n\n• Menjelaskan konsep yang sulit\n• Memberikan tips belajar efektif\n• Motivasi dan strategi fokus\n• Time management\n\nAda yang bisa saya bantu?',
  }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || typing) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(p => [...p, userMsg]);
    const q = input;
    setInput('');
    setTyping(true);

    try {
      const userId = parseInt(localStorage.getItem('pokus-user-id')) || 1;
      const res = await sendChatMessage({ user_id: userId, message: q });
      setMessages(p => [...p, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.response,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(p => [...p, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Maaf, terjadi error. Coba lagi ya!',
        timestamp: new Date(),
      }]);
    } finally {
      setTyping(false);
    }
  };

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };
  const fmt = (d) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const renderContent = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 12rem)' }}>
      <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold">AI Study Assistant</h2>
            <p className="text-slate-400 text-xs">Tanya apa aja tentang belajar!</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-slate-700'}`}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'assistant' ? 'bg-slate-800/60 border border-slate-700/50 text-slate-200' : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'}`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{renderContent(msg.content)}</p>
              <p className={`text-xs mt-1.5 ${msg.role === 'assistant' ? 'text-slate-500' : 'text-emerald-100'}`}>{fmt(msg.timestamp)}</p>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full bounce-dot" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full bounce-dot-delay-1" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full bounce-dot-delay-2" />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-3 flex gap-2 shrink-0">
        <input
          id="chatbot-input"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ketik pertanyaan kamu..."
          disabled={typing}
          className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none text-sm"
        />
        <button
          id="chatbot-send"
          onClick={send}
          disabled={!input.trim() || typing}
          className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shrink-0"
        >
          {typing ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
        </button>
      </div>

      <p className="text-xs text-slate-500 text-center mt-2 shrink-0">💡 Tanya tentang teknik belajar, motivasi, atau strategi fokus</p>
    </div>
  );
}
