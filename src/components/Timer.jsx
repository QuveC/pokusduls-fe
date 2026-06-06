import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Square, Settings, Target, AlertCircle, Layers, BookOpen } from 'lucide-react';
import MusicPlayer from './MusicPlayer.jsx';
import SettingsModal from './SettingsModal.jsx';
import FocusAnimation from './FocusAnimation.jsx';
import GoalSelector from './GoalSelector.jsx';
import ModeCarousel from './ModeCarousel.jsx';
import FocusDetectorMini from './FocusDetectorMini.jsx';
import FeynmanAI from './FeynmanAI.jsx';
import FlashcardManager from './FlashcardManager.jsx';
import { completeSession } from '../api/session';
import { updateStatistics } from '../api/statistics';

const Timer = forwardRef(function Timer({ onRunningChange }, ref) {
  const [mode, setMode] = useState('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessionType, setSessionType] = useState('focus');
  const [cycleCount, setCycleCount] = useState(0);
  const [feynmanStep, setFeynmanStep] = useState('learn');
  const [feynmanNotes, setFeynmanNotes] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [settings, setSettings] = useState({
    focusDuration: 25, shortBreakDuration: 5, longBreakDuration: 15,
    cyclesBeforeLongBreak: 4, enableFocusEnforcement: true,
  });
  const [focusProgress, setFocusProgress] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showFocusWarning, setShowFocusWarning] = useState(false);
  const [showFeynmanAI, setShowFeynmanAI] = useState(false);
  const [showFlashcard, setShowFlashcard] = useState(false);
  const [treeType, setTreeType] = useState(null);       // null = not picked yet
  const [showTreePicker, setShowTreePicker] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);  // mode change guard
  const [carouselKey, setCarouselKey] = useState(0);     // force carousel reset on cancel
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!settings.enableFocusEnforcement || !isRunning) return;
    if (sessionType !== 'focus' && mode === 'pomodoro') return;
    const handleVis = () => {
      if (document.hidden && isRunning) {
        setTabSwitchCount(p => p + 1);
        setShowFocusWarning(true);
        setTimeout(() => setShowFocusWarning(false), 3000);
        if (sessionType === 'focus' || mode !== 'pomodoro') setIsRunning(false);
      }
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, [isRunning, sessionType, mode, settings.enableFocusEnforcement]);

  useEffect(() => {
    const s = localStorage.getItem('pokus-settings');
    if (s) setSettings(JSON.parse(s));
  }, []);

  useEffect(() => {
    if (mode === 'pomodoro') { setTimeLeft(settings.focusDuration * 60); setSessionType('focus'); setCycleCount(0); }
    else if (mode === 'feynman') { setFeynmanStep('learn'); setTimeLeft(30 * 60); setFeynmanNotes(''); }
    else if (mode === 'active-recall') setTimeLeft(20 * 60);
    setIsRunning(false); setFocusProgress(0);
  }, [mode, settings]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          const t = prev - 1;
          if (sessionType === 'focus' || mode !== 'pomodoro') {
            const total = mode === 'pomodoro' ? settings.focusDuration * 60
              : mode === 'feynman' && feynmanStep === 'learn' ? 30 * 60
              : mode === 'feynman' && feynmanStep === 'explain' ? 15 * 60
              : mode === 'feynman' && feynmanStep === 'review' ? 10 * 60
              : 20 * 60;
            setFocusProgress((total - t) / total * 100);
          }
          return t;
        });
      }, 1000);
    } else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, timeLeft, sessionType, mode, feynmanStep, settings]);

  useEffect(() => {
    if (timeLeft === 0 && isRunning) handleTimerComplete();
  }, [timeLeft, isRunning]);

  useEffect(() => {
    if (isRunning) {
      const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
      document.title = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} - PokusDuls`;
    } else {
      document.title = 'PokusDuls - Aplikasi Produktivitas';
    }
  }, [timeLeft, isRunning]);

  // Notify parent when running state changes so Dashboard can gate navigation
  useEffect(() => { onRunningChange?.(isRunning); }, [isRunning]); // eslint-disable-line

  useEffect(() => {

    const handleKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') { e.preventDefault(); isRunning ? handlePause() : handleStart(); }
      if (e.code === 'Escape') { e.preventDefault(); handleStop(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isRunning]);

  const saveSession = async () => {
    const dur = mode === 'pomodoro' ? settings.focusDuration
      : mode === 'feynman' && feynmanStep === 'learn' ? 30
      : mode === 'feynman' && feynmanStep === 'explain' ? 15
      : mode === 'feynman' && feynmanStep === 'review' ? 10 : 20;

    const userId = localStorage.getItem('pokus-user-id');
    const historyKey = userId ? `pokus-history-${userId}` : 'pokus-history-guest';

    // Simpan ke localStorage (lokal)
    const h = JSON.parse(localStorage.getItem(historyKey) || '[]');
    h.push({ date: new Date().toISOString(), duration: dur, mode });
    localStorage.setItem(historyKey, JSON.stringify(h));

    // Kirim ke backend jika user sudah login
    if (userId) {
      try {
        const xpGained = Math.floor(dur * 2); // 2 XP per menit
        await completeSession({ user_id: userId, duration: dur, method_type: mode });
        await updateStatistics(userId, { xp_gained: xpGained, session_completed: true });
      } catch (e) {
        console.warn('Gagal sync sesi ke server:', e);
      }
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false); setFocusProgress(0);
    if (sessionType === 'focus' || mode !== 'pomodoro') saveSession();
    if (mode === 'pomodoro') {
      if (sessionType === 'focus') {
        const next = cycleCount + 1; setCycleCount(next);
        if (next % settings.cyclesBeforeLongBreak === 0) { setSessionType('long-break'); setTimeLeft(settings.longBreakDuration * 60); }
        else { setSessionType('short-break'); setTimeLeft(settings.shortBreakDuration * 60); }
      } else { setSessionType('focus'); setTimeLeft(settings.focusDuration * 60); }
    } else if (mode === 'feynman') {
      if (feynmanStep === 'learn') { setFeynmanStep('explain'); setTimeLeft(15 * 60); }
      else if (feynmanStep === 'explain') { setFeynmanStep('review'); setTimeLeft(10 * 60); }
      else alert('Sesi Feynman selesai! Bagus!');
    } else if (mode === 'active-recall') {
      alert('Sesi Active Recall selesai! Bagus!');
    }
  };

  const handleStart = () => {
    // If no tree picked yet for this session, show picker first
    if (!treeType && (sessionType === 'focus' || mode !== 'pomodoro')) {
      setShowTreePicker(true);
      return;
    }
    setIsRunning(true); setShowFocusWarning(false);
  };
  const handlePause = () => setIsRunning(false);
  const handleStop = () => {
    setIsRunning(false); setFocusProgress(0); setTabSwitchCount(0); setShowFocusWarning(false);
    setTreeType(null); // reset so next session requires picking again
    if (mode === 'pomodoro') { setTimeLeft(settings.focusDuration * 60); setSessionType('focus'); setCycleCount(0); }
    else if (mode === 'feynman') { setFeynmanStep('learn'); setTimeLeft(30 * 60); }
    else setTimeLeft(20 * 60);
  };
  // Expose stop() to parent (Dashboard) via ref
  useImperativeHandle(ref, () => ({ stop: handleStop }));

  const handleTreePicked = (id) => {
    setTreeType(id);
    setShowTreePicker(false);
    setIsRunning(true);
    setShowFocusWarning(false);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  const getSessionLabel = () => {
    if (mode === 'pomodoro') {
      if (sessionType === 'focus') return 'Waktu Fokus';
      if (sessionType === 'short-break') return 'Istirahat Pendek';
      return 'Istirahat Panjang';
    }
    if (mode === 'feynman') {
      if (feynmanStep === 'learn') return 'Langkah 1: Belajar';
      if (feynmanStep === 'explain') return 'Langkah 2: Jelaskan';
      return 'Langkah 3: Tinjau';
    }
    return 'Active Recall';
  };

  const getInstruction = () => {
    if (mode === 'feynman') {
      if (feynmanStep === 'learn') return 'Pelajari konsepnya dengan seksama.';
      if (feynmanStep === 'explain') return 'Tulis penjelasan sederhana seolah mengajar anak kecil.';
      return 'Identifikasi celah pengetahuan dan pelajari lagi.';
    }
    if (mode === 'active-recall') return 'Gunakan waktu ini untuk menjawab soal latihan atau mengambil informasi dari memori. JANGAN hanya membaca ulang.';
    return '';
  };

  const sessionColors = {
    focus: 'from-emerald-500 to-teal-600',
    'short-break': 'from-sky-500 to-blue-600',
    'long-break': 'from-purple-500 to-indigo-600',
  };
  const timerGradient = mode === 'feynman' ? 'from-cyan-500 to-blue-600'
    : mode === 'active-recall' ? 'from-purple-500 to-pink-600'
    : (sessionColors[sessionType] || 'from-emerald-500 to-teal-600');

  // Guard mode change while timer is running
  const handleModeChangeRequest = (newMode) => {
    if (isRunning) {
      setPendingMode(newMode); // show warning
    } else {
      setMode(newMode);
    }
  };

  return (
    <div className="space-y-5">
      {/* Focus Warning */}
      {showFocusWarning && settings.enableFocusEnforcement && (
        <div className="bg-amber-500/10 border border-amber-500/40 p-4 rounded-2xl animate-pulse">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-amber-300 text-sm font-medium">Tetap fokus! Tab berpindah {tabSwitchCount}x</p>
              <p className="text-slate-400 text-xs mt-0.5">Timer dijeda. Klik "Mulai" untuk melanjutkan.</p>
            </div>
          </div>
        </div>
      )}

      {/* Mode Change Guard Modal */}
      {pendingMode && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl w-full max-w-xs p-6 animate-slide-up">
            <div className="w-14 h-14 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div className="text-center mb-6">
              <h3 className="text-white font-bold text-lg mb-1">Sesi sedang berjalan!</h3>
              <p className="text-slate-400 text-sm">
                Apakah kamu yakin ingin berhenti dan ganti ke mode{' '}
                <span className="text-white font-semibold">
                  {pendingMode === 'pomodoro' ? 'Pomodoro'
                    : pendingMode === 'feynman' ? 'Feynman'
                    : 'Active Recall'}
                </span>?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setPendingMode(null); setCarouselKey(k => k + 1); }}
                className="flex-1 py-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-xl text-sm font-semibold hover:bg-emerald-500/25 transition-all">
                Tidak, Lanjut
              </button>
              <button
                onClick={() => {
                  handleStop();
                  setMode(pendingMode);
                  setPendingMode(null);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-red-500/80 to-rose-600/80 border border-red-500/40 text-white rounded-xl text-sm font-semibold hover:from-red-500 hover:to-rose-600 hover:shadow-lg hover:shadow-red-500/20 transition-all">
                Ya, Berhenti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Carousel */}
      <div className="max-w-md mx-auto">
        <ModeCarousel key={carouselKey} currentMode={mode} onModeChange={handleModeChangeRequest} />
      </div>

      {/* Goal Button */}
      <div className="flex justify-center">
        <button
          id="btn-goal-selector"
          onClick={() => setShowGoalSelector(true)}
          className="px-6 py-3 bg-slate-800/80 text-emerald-400 rounded-xl border border-slate-700/60 flex items-center gap-2 hover:bg-slate-700/80 hover:border-emerald-500/40 transition-all text-sm font-medium"
        >
          <Target className="w-4 h-4" />
          <span>Apa Tujuan Anda?</span>
        </button>
      </div>

      {/* Timer Card */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="flex justify-between items-center mb-2">
          {/* Flashcard quick-access — top left, active-recall only */}
          {mode === 'active-recall' ? (
            <button
              id="btn-open-flashcard"
              onClick={() => setShowFlashcard(true)}
              className="group flex items-center gap-0 hover:gap-2 overflow-hidden
                px-2.5 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10
                hover:bg-purple-500/20 hover:border-purple-500/50
                text-purple-300 transition-all duration-300 ease-out"
              title="Buka Flashcard"
            >
              <Layers className="w-4 h-4 shrink-0 group-hover:hidden" />
              <BookOpen className="w-4 h-4 shrink-0 hidden group-hover:block" />
              <span className="max-w-0 group-hover:max-w-[80px] overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-300 ease-out">
                Flashcard
              </span>
            </button>
          ) : (
            <div className="w-8" />
          )}
          <button
            id="btn-settings"
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-all"
          >
            <Settings className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Session Label */}
        <div className="text-center mb-8">
          <div className={`inline-block px-4 py-1.5 rounded-full bg-gradient-to-r ${timerGradient} text-white text-sm font-medium mb-3 shadow-lg`}>
            {getSessionLabel()}
          </div>
          {mode === 'pomodoro' && (
            <p className="text-slate-400 text-sm">Siklus: {cycleCount} / {settings.cyclesBeforeLongBreak}</p>
          )}
          {(mode === 'feynman' || mode === 'active-recall') && (
            <p className="text-slate-400 text-sm max-w-xs mx-auto mt-1">{getInstruction()}</p>
          )}
          {tabSwitchCount > 0 && settings.enableFocusEnforcement && (
            <p className="text-amber-400 text-xs mt-2">⚠ Distraksi terdeteksi: {tabSwitchCount}x</p>
          )}
        </div>

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            {/* Ring */}
            <svg className="absolute -inset-4 w-[calc(100%+2rem)] h-[calc(100%+2rem)]" viewBox="0 0 200 80" preserveAspectRatio="none">
              <rect x="2" y="2" width="196" height="76" rx="12" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
            </svg>
            <div className="text-7xl sm:text-8xl text-white font-light tracking-widest tabular-nums px-4 py-2">
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Focus Animation */}
        {isRunning && (sessionType === 'focus' || mode !== 'pomodoro') && (
          <div className="mb-6">
            <FocusAnimation progress={focusProgress} treeType={treeType} />
          </div>
        )}

        {/* Feynman Notes */}
        {mode === 'feynman' && feynmanStep === 'explain' && (
          <div className="mb-6">
            <textarea
              value={feynmanNotes}
              onChange={(e) => setFeynmanNotes(e.target.value)}
              placeholder="Tulis penjelasan Anda di sini..."
              className="w-full h-28 p-4 bg-slate-700/50 border border-slate-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-white placeholder-slate-500 text-sm"
            />
          </div>
        )}

        {/* AI Rangkuman — Feynman only (available in all steps) */}
        {mode === 'feynman' && treeType && (
          <div className="mb-5">
            <button
              id="btn-open-feynman-ai"
              onClick={() => setShowFeynmanAI(v => !v)}
              className="w-full py-3 border rounded-xl flex items-center justify-center gap-2 transition-all text-sm font-medium"
              style={{
                background: showFeynmanAI
                  ? 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(16,185,129,0.15))'
                  : 'rgba(6,182,212,0.08)',
                borderColor: showFeynmanAI ? 'rgba(6,182,212,0.5)' : 'rgba(6,182,212,0.25)',
                color: '#06b6d4',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
              {showFeynmanAI ? 'Tutup AI Rangkuman' : 'AI Rangkuman Materi'}
            </button>

            {/* Inline FeynmanAI panel */}
            {showFeynmanAI && (
              <div className="mt-4 animate-slide-up">
                <FeynmanAI />
              </div>
            )}
          </div>
        )}


        {/* Controls */}
        <div className="flex justify-center gap-3">
          {!isRunning ? (
            <button
              id="btn-start-timer"
              onClick={handleStart}
              className={`px-8 py-3.5 bg-gradient-to-r ${timerGradient} text-white rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105 transition-all shadow-md font-medium`}
            >
              <Play className="w-5 h-5" />
              <span>Mulai</span>
            </button>
          ) : (
            <button
              id="btn-pause-timer"
              onClick={handlePause}
              className="px-8 py-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-2 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all font-medium"
            >
              <Pause className="w-5 h-5" />
              <span>Jeda</span>
            </button>
          )}
          <button
            id="btn-stop-timer"
            onClick={handleStop}
            className="px-8 py-3.5 bg-slate-700/80 border border-slate-600/50 text-white rounded-xl flex items-center gap-2 hover:bg-slate-600/80 transition-all font-medium"
          >
            <Square className="w-5 h-5" />
            <span>Stop</span>
          </button>
        </div>
      </div>

      {/* Music Player */}
      <MusicPlayer />

      {/* Modals */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={(s) => { setSettings(s); localStorage.setItem('pokus-settings', JSON.stringify(s)); setShowSettings(false); }}
          onClose={() => setShowSettings(false)}
        />
      )}
      {showGoalSelector && (
        <GoalSelector
          onSelect={(m) => { setMode(m); setShowGoalSelector(false); }}
          onClose={() => setShowGoalSelector(false)}
        />
      )}
      {/* Tree Picker Modal */}
      {showTreePicker && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <span style={{ fontSize: 28 }}>🌱</span>
              </div>
              <h3 className="text-white font-bold text-lg">Pilih Pohonmu</h3>
              <p className="text-slate-400 text-sm mt-1">Pohon akan tumbuh selama sesi fokusmu!</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'oak',    emoji: '🌳', label: 'Pohon Oak',  desc: 'Kuat & berbuah',  from: 'from-emerald-500/20', to: 'to-green-700/20',   border: 'border-emerald-500/40' },
                { id: 'sakura', emoji: '🌸', label: 'Sakura',     desc: 'Indah & mekar',   from: 'from-pink-500/20',   to: 'to-rose-600/20',    border: 'border-pink-500/40'    },
                { id: 'pine',   emoji: '🌲', label: 'Pohon Pinus',desc: 'Kokoh & tegak',   from: 'from-teal-500/20',   to: 'to-emerald-700/20', border: 'border-teal-500/40'    },
                { id: 'cactus', emoji: '🌵', label: 'Kaktus',     desc: 'Tahan & unik',    from: 'from-lime-500/20',   to: 'to-green-500/20',   border: 'border-lime-500/40'    },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => handleTreePicked(t.id)}
                  className={`p-4 bg-gradient-to-br ${t.from} ${t.to} border ${t.border} rounded-2xl flex flex-col items-center gap-2 hover:scale-105 hover:brightness-110 active:scale-95 transition-all duration-150`}
                >
                  <span style={{ fontSize: 40, lineHeight: 1 }}>{t.emoji}</span>
                  <div className="text-center">
                    <p className="text-white text-sm font-semibold">{t.label}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowTreePicker(false)}
              className="mt-4 w-full py-2.5 bg-slate-800/60 border border-slate-700/40 text-slate-400 rounded-xl text-sm hover:bg-slate-700/60 transition-all"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* FeynmanAI is now rendered inline inside the timer card above */}
      {showFlashcard && (
        <FlashcardManager onClose={() => setShowFlashcard(false)} />
      )}

      {/* Focus Detector */}
      <FocusDetectorMini
        isActive={isRunning && (sessionType === 'focus' || mode !== 'pomodoro')}
        onDistractionDetected={() => setTabSwitchCount(p => p + 1)}
      />
    </div>
  );
});

export default Timer;
