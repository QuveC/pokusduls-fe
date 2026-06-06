import { useState, useEffect, useCallback, useRef } from 'react';
import { BarChart3, Timer as TimerIcon, Bell, Clock, LogOut, Sparkles, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Timer from '../components/Timer.jsx';
import Statistics from '../components/Statistics.jsx';
import Reminder from '../components/Reminder.jsx';
import AIPage from '../components/AIPage.jsx';

// ── Logout Confirmation Modal ─────────────────────────────────────────────────
function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-xs p-6 animate-slide-up">
        <div className="w-14 h-14 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-6 h-6 text-red-400" />
        </div>
        <div className="text-center mb-6">
          <h3 className="text-white font-bold text-lg mb-1">Logout dari akun ini?</h3>
          <p className="text-slate-400 text-sm">Kamu akan kembali ke halaman login.</p>
        </div>
        <div className="flex gap-3">
          <button id="btn-logout-cancel" onClick={onCancel}
            className="flex-1 py-3 bg-slate-800/80 border border-slate-700/50 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700/80 hover:text-white transition-all">
            Tidak
          </button>
          <button id="btn-logout-confirm" onClick={onConfirm}
            className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 active:scale-95 transition-all">
            Ya, Logout
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Navigation Guard Modal ────────────────────────────────────────────────────
function NavGuardModal({ targetPage, onConfirm, onCancel }) {
  const pageNames = {
    statistics: 'Statistik',
    reminder:   'Pengingat',
  };
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl w-full max-w-xs p-6 animate-slide-up">
        <div className="w-14 h-14 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <div className="text-center mb-6">
          <h3 className="text-white font-bold text-lg mb-1">Sesi sedang berjalan!</h3>
          <p className="text-slate-400 text-sm">
            Apakah kamu yakin ingin berhenti dan pindah ke{' '}
            <span className="text-white font-semibold">{pageNames[targetPage] ?? targetPage}</span>?
          </p>
        </div>
        <div className="flex gap-3">
          {/* "Tidak" — safe/neutral */}
          <button onClick={onCancel}
            className="flex-1 py-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-xl text-sm font-semibold hover:bg-emerald-500/25 transition-all">
            Tidak, Lanjut
          </button>
          {/* "Ya" — destructive */}
          <button onClick={onConfirm}
            className="flex-1 py-3 bg-gradient-to-r from-red-500/80 to-rose-600/80 border border-red-500/40 text-white rounded-xl text-sm font-semibold hover:from-red-500 hover:to-rose-600 hover:shadow-lg hover:shadow-red-500/20 transition-all">
            Ya, Berhenti
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
  const [timerRunning, setTimerRunning] = useState(false);
  const [navGuard, setNavGuard] = useState(null); // null | 'statistics' | 'reminder'
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overscrollBehavior = 'none';
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'theme-color'; document.head.appendChild(meta); }
    meta.setAttribute('content', '#080d1a');
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.ctrlKey || e.metaKey) {
        const map = { '1': 'timer', '2': 'statistics', '3': 'reminder', '4': 'ai' };
        if (map[e.key]) { e.preventDefault(); tryNavigate(map[e.key]); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [timerRunning, currentPage]); // eslint-disable-line

  // Called when user taps a nav item
  const tryNavigate = useCallback((id) => {
    if (id === currentPage) return;
    // AI page is always accessible even while timer runs
    // Timer page is always accessible
    const freePages = ['timer', 'ai'];
    if (timerRunning && !freePages.includes(id)) {
      setNavGuard(id); // show warning
    } else {
      setCurrentPage(id);
    }
  }, [timerRunning, currentPage]);

  const confirmNav = () => {
    timerRef.current?.stop(); // reset & stop timer without saving to history
    setCurrentPage(navGuard);
    setNavGuard(null);
  };

  const handleLogout = () => navigate('/');

  const navItems = [
    { id: 'timer',      label: 'Timer',    Icon: TimerIcon },
    { id: 'statistics', label: 'Statistik', Icon: BarChart3 },
    { id: 'reminder',   label: 'Pengingat', Icon: Bell },
    { id: 'ai',         label: 'AI',        Icon: Sparkles, special: true },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: 'linear-gradient(135deg, #080d1a 0%, #0d1530 50%, #080d1a 100%)' }}>

      {/* Header */}
      <div style={{
        background: 'rgba(10, 15, 30, 0.85)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div className="px-5 py-4 max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
            style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-xl font-bold leading-none tracking-tight">PokusDuls</h1>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(16,185,129,0.7)' }}>Aplikasi Produktivitas Belajar</p>
          </div>

          {/* Running indicator */}
          {timerRunning && currentPage !== 'timer' && (
            <button onClick={() => setCurrentPage('timer')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Berjalan
            </button>
          )}

          {currentPage === 'ai' && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))',
              border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '4px 10px',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <Sparkles style={{ width: 12, height: 12, color: '#10b981' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981' }}>AI</span>
            </div>
          )}

          <button id="btn-logout" onClick={() => setShowLogoutModal(true)} title="Logout"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-red-400 transition-all duration-200 shrink-0"
            style={{ border: '1px solid transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      {/* Timer is ALWAYS mounted so the interval + proctoring never stops */}
      <main className="px-5 py-6 max-w-2xl mx-auto">
        <div style={{ display: currentPage === 'timer' ? 'block' : 'none' }}>
          <Timer ref={timerRef} onRunningChange={setTimerRunning} />
        </div>
        {currentPage === 'statistics' && <Statistics />}
        {currentPage === 'reminder'   && <Reminder />}
        {currentPage === 'ai'         && <AIPage />}
      </main>

      {/* Bottom Nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(10, 15, 30, 0.95)',
        backdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        zIndex: 50,
      }} className="safe-area-bottom">
        <div className="flex justify-around items-center h-16 px-4 max-w-2xl mx-auto">
          {navItems.map(({ id, label, Icon, special }) => {
            const isActive = currentPage === id;
            const isLocked = timerRunning && !['timer','ai'].includes(id);
            return (
              <button key={id} id={`nav-${id}`} onClick={() => tryNavigate(id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '3px', padding: '8px 16px', borderRadius: '14px', border: 'none',
                  background: isActive && special
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))'
                    : isActive ? 'rgba(16,185,129,0.1)' : 'transparent',
                  transition: 'all 0.2s ease', cursor: 'pointer', minWidth: '56px',
                  opacity: isLocked ? 0.5 : 1,
                  position: 'relative',
                }}>
                <Icon style={{
                  width: 20, height: 20, transition: 'all 0.2s',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  color: isActive && special ? '#10b981' : isActive ? '#10b981' : '#475569',
                }} />
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  color: isActive && special ? '#10b981' : isActive ? '#10b981' : '#475569',
                }}>
                  {label}
                </span>
                {isActive && (
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981', marginTop: '1px' }} />
                )}
                {/* Lock badge when timer is running */}
                {isLocked && !isActive && (
                  <span style={{
                    position: 'absolute', top: 4, right: 8,
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#f59e0b',
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout Modal */}
      {showLogoutModal && (
        <LogoutModal onConfirm={handleLogout} onCancel={() => setShowLogoutModal(false)} />
      )}

      {/* Navigation Guard Modal */}
      {navGuard && (
        <NavGuardModal
          targetPage={navGuard}
          onConfirm={confirmNav}
          onCancel={() => setNavGuard(null)}
        />
      )}
    </div>
  );
}
