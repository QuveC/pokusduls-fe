import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Settings, Target, AlertCircle } from 'lucide-react';
import MusicPlayer from './MusicPlayer.jsx';
import SettingsModal from './SettingsModal.jsx';
import FocusAnimation from './FocusAnimation.jsx';
import GoalSelector from './GoalSelector.jsx';
import ModeCarousel from './ModeCarousel.jsx';
import FocusDetectorMini from './FocusDetectorMini.jsx';

export default function Timer() {
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

  useEffect(() => {
    const handleKey = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') { e.preventDefault(); isRunning ? handlePause() : handleStart(); }
      if (e.code === 'Escape') { e.preventDefault(); handleStop(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isRunning]);

  const saveSession = () => {
    const dur = mode === 'pomodoro' ? settings.focusDuration
      : mode === 'feynman' && feynmanStep === 'learn' ? 30
      : mode === 'feynman' && feynmanStep === 'explain' ? 15
      : mode === 'feynman' && feynmanStep === 'review' ? 10 : 20;
    const h = JSON.parse(localStorage.getItem('pokus-history') || '[]');
    h.push({ date: new Date().toISOString(), duration: dur, mode });
    localStorage.setItem('pokus-history', JSON.stringify(h));
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

  const handleStart = () => { setIsRunning(true); setShowFocusWarning(false); };
  const handlePause = () => setIsRunning(false);
  const handleStop = () => {
    setIsRunning(false); setFocusProgress(0); setTabSwitchCount(0); setShowFocusWarning(false);
    if (mode === 'pomodoro') { setTimeLeft(settings.focusDuration * 60); setSessionType('focus'); setCycleCount(0); }
    else if (mode === 'feynman') { setFeynmanStep('learn'); setTimeLeft(30 * 60); }
    else setTimeLeft(20 * 60);
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

      {/* Mode Carousel */}
      <div className="max-w-md mx-auto">
        <ModeCarousel currentMode={mode} onModeChange={setMode} />
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
        <div className="flex justify-end mb-2">
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
            <FocusAnimation progress={focusProgress} />
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
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all shadow-md font-medium"
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

      {/* Focus Detector */}
      <FocusDetectorMini
        isActive={isRunning && (sessionType === 'focus' || mode !== 'pomodoro')}
        onDistractionDetected={() => setTabSwitchCount(p => p + 1)}
      />
    </div>
  );
}
