import { useState, useEffect } from 'react';
import { BarChart3, Timer as TimerIcon, Bell, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Timer from '../components/Timer.jsx';
import Statistics from '../components/Statistics.jsx';
import Reminder from '../components/Reminder.jsx';

// ── Logout Confirmation Modal ─────────────────────────────────────────────────
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-xs p-6 animate-slide-up">

        {/* Icon */}
        <div className="w-14 h-14 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-6 h-6 text-red-400" />
        </div>

        {/* Text */}
        <div className="text-center mb-6">
          <h3 className="text-white font-bold text-lg mb-1">Logout dari akun ini?</h3>
          <p className="text-slate-400 text-sm">Kamu akan kembali ke halaman login.</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            id="btn-logout-cancel"
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-800/80 border border-slate-700/50 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700/80 hover:text-white transition-all"
          >
            Tidak
          </button>
          <button
            id="btn-logout-confirm"
            onClick={onConfirm}
            className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            Ya, Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState('timer');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

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
        const map = { '1': 'timer', '2': 'statistics', '3': 'reminder' };
        if (map[e.key]) { e.preventDefault(); setCurrentPage(map[e.key]); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleLogout = () => navigate('/');

  const navItems = [
    { id: 'timer',      label: 'Timer',    Icon: TimerIcon },
    { id: 'statistics', label: 'Statistik', Icon: BarChart3 },
    { id: 'reminder',   label: 'Pengingat', Icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pb-24">

      {/* Header */}
      <div className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/60 sticky top-0 z-50">
        <div className="px-5 py-4 max-w-2xl mx-auto flex items-center gap-3">
          {/* Logo */}
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Clock className="w-5 h-5 text-white" />
          </div>

          {/* Brand */}
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-xl font-bold leading-none">PokusDuls</h1>
            <p className="text-emerald-400/70 text-xs">Aplikasi Produktivitas Belajar</p>
          </div>

          {/* Logout button */}
          <button
            id="btn-logout"
            onClick={() => setShowLogoutModal(true)}
            title="Logout"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/25 transition-all duration-200 shrink-0"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-5 py-6 max-w-2xl mx-auto animate-slide-up">
        {currentPage === 'timer'      && <Timer />}
        {currentPage === 'statistics' && <Statistics />}
        {currentPage === 'reminder'   && <Reminder />}
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
}
