import { useState, useEffect } from 'react';
import { BarChart3, Timer as TimerIcon, Bell, Clock, MessageSquare } from 'lucide-react';
import Timer from './components/Timer.jsx';
import Statistics from './components/Statistics.jsx';
import Reminder from './components/Reminder.jsx';
import Chatbot from './components/Chatbot.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('timer');

  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; document.head.appendChild(meta); }
    meta.setAttribute('content', '#0f172a');
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey || e.metaKey) {
        const map = { '1': 'timer', '2': 'statistics', '3': 'reminder', '4': 'chatbot' };
        if (map[e.key]) { e.preventDefault(); setCurrentPage(map[e.key]); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const navItems = [
    { id: 'timer', label: 'Timer', Icon: TimerIcon },
    { id: 'statistics', label: 'Statistik', Icon: BarChart3 },
    { id: 'reminder', label: 'Pengingat', Icon: Bell },
    { id: 'chatbot', label: 'Chatbot', Icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24">
      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/60 sticky top-0 z-50">
        <div className="px-5 py-4 max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold leading-none">PokusDuls</h1>
            <p className="text-emerald-400/70 text-xs">Aplikasi Produktivitas Belajar</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-5 py-6 max-w-2xl mx-auto animate-slide-up">
        {currentPage === 'timer' && <Timer />}
        {currentPage === 'statistics' && <Statistics />}
        {currentPage === 'reminder' && <Reminder />}
        {currentPage === 'chatbot' && <Chatbot />}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/50 safe-area-bottom z-50">
        <div className="flex justify-around items-center h-16 px-4 max-w-2xl mx-auto">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => setCurrentPage(id)}
              className={`flex flex-col items-center justify-center gap-1 px-5 py-2 rounded-xl transition-all duration-200 ${
                currentPage === id
                  ? 'text-emerald-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className={`w-5 h-5 transition-all ${currentPage === id ? 'scale-110' : ''}`} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
