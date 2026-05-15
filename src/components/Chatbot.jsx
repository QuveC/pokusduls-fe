import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

const getAIResponse = async (msg) => {
  await new Promise(r => setTimeout(r, 800 + Math.random() * 800));
  const m = msg.toLowerCase();

  if (m.includes('tips') || m.includes('cara belajar'))
    return 'Berikut tips belajar efektif:\n\n1. **Pomodoro** - Belajar 25 menit, istirahat 5 menit\n2. **Active Recall** - Test diri sendiri tanpa melihat catatan\n3. **Feynman** - Jelaskan konsep dengan bahasa sederhana\n4. **Spaced Repetition** - Review materi secara berkala\n5. **Eliminate Distractions** - Fokus penuh saat belajar\n\nMau tau lebih detail salah satunya?';

  if (m.includes('pomodoro'))
    return 'Teknik Pomodoro adalah metode manajemen waktu:\n\n🍅 **Cara Kerja:**\n1. Pilih tugas\n2. Set timer 25 menit\n3. Kerjakan fokus penuh\n4. Istirahat 5 menit\n5. Ulangi 4x, lalu istirahat panjang\n\n**Tips:** Gunakan fitur timer di PokusDuls!';

  if (m.includes('active recall'))
    return 'Active Recall = mengingat tanpa melihat sumber:\n\n📝 **Cara:**\n1. Baca materi\n2. Tutup buku\n3. Tulis semua yang diingat\n4. Cek dan pelajari yang kurang\n5. Ulangi\n\n**Kenapa efektif?** Otak bekerja lebih keras saat mengingat!';

  if (m.includes('feynman'))
    return 'Teknik Feynman: belajar dengan mengajar!\n\n🎓 **4 Langkah:**\n1. Pilih konsep\n2. Jelaskan seolah ke anak kecil\n3. Identifikasi bagian yang sulit dijelaskan\n4. Review dan sederhanakan\n\n**Pro tip:** Coba rekam video penjelasan kamu!';

  if (m.includes('motivasi') || m.includes('semangat') || m.includes('capek')) {
    const quotes = [
      '💪 "Success is the sum of small efforts repeated day in and day out."\n\nSetiap sesi belajar kecil membawa kamu lebih dekat ke tujuan!',
      '🌟 "You don\'t have to be great to start, but you have to start to be great."\n\nMulai sekarang, 25 menit fokus bisa mengubah harimu!',
      '⭐ "Discipline is choosing between what you want now and what you want most."\n\nIngat tujuan besarmu!',
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  if (m.includes('fokus') || m.includes('distraksi') || m.includes('konsentrasi'))
    return '🎯 **Tips Fokus:**\n\n1. **Lingkungan** - Cari tempat tenang\n2. **Digital Detox** - Matikan notifikasi\n3. **One Task** - Satu hal dalam satu waktu\n4. **Music** - Gunakan white noise\n5. **Breaks** - Istirahat teratur\n\n**PokusDuls fitur:** Focus detection, Music player, Multi-mode timer';

  if (m.includes('matematika') || m.includes('fisika') || m.includes('kimia') || m.includes('rumus'))
    return '🔬 **Tips Exact Science:**\n\n1. Pahami konsep, jangan hafal\n2. Latihan soal sebanyak mungkin\n3. Gunakan diagram visual\n4. Jelaskan ke teman\n5. Hubungkan ke kehidupan nyata\n\nMau bantuan konsep spesifik?';

  if (m.includes('waktu') || m.includes('jadwal'))
    return '⏰ **Time Management:**\n\n**Eisenhower Matrix:**\n• Urgent + Penting = Kerjakan sekarang\n• Penting + Tidak Urgent = Jadwalkan\n• Urgent + Tidak Penting = Delegasikan\n\n**Weekly Planning:**\n1. List semua deadline\n2. Block 2-3 jam/hari untuk belajar\n3. Include waktu istirahat';

  const def = [
    'Pertanyaan menarik! Bisa jelasin lebih detail?',
    'Saya bisa bantu dengan:\n• Tips belajar (Pomodoro, Feynman, Active Recall)\n• Motivasi dan fokus\n• Time management\n\nAda yang mau ditanyakan?',
    'Untuk topik ini, saya sarankan:\n1. Break down jadi bagian kecil\n2. Cari sumber terpercaya\n3. Practice dengan contoh\n\nSaya di sini untuk support strategi belajarmu! 💪',
  ];
  return def[Math.floor(Math.random() * def.length)];
};

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
      const res = await getAIResponse(q);
      setMessages(p => [...p, { id: (Date.now()+1).toString(), role: 'assistant', content: res, timestamp: new Date() }]);
    } catch {
      setMessages(p => [...p, { id: (Date.now()+1).toString(), role: 'assistant', content: 'Maaf, terjadi error. Coba lagi ya!', timestamp: new Date() }]);
    } finally { setTyping(false); }
  };

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const fmt = (d) => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  // Simple markdown bold renderer
  const renderContent = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2,-2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 12rem)' }}>
      {/* Header */}
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

      {/* Messages */}
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

      {/* Input */}
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
