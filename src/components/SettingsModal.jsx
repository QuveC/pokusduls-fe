import { useState, useRef } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

const modeTheme = {
  pomodoro: {
    accent:      'from-emerald-500 to-teal-600',
    ring:        'focus:ring-emerald-500',
    border:      'border-emerald-500/40',
    bg:          'bg-emerald-500/10',
    text:        'text-emerald-400',
    btnGradient: 'from-emerald-500 to-teal-600',
    shadow:      'hover:shadow-emerald-500/20',
    bar:         '#10b981',
  },
  feynman: {
    accent:      'from-cyan-500 to-blue-600',
    ring:        'focus:ring-cyan-500',
    border:      'border-cyan-500/40',
    bg:          'bg-cyan-500/10',
    text:        'text-cyan-400',
    btnGradient: 'from-cyan-500 to-blue-600',
    shadow:      'hover:shadow-cyan-500/20',
    bar:         '#06b6d4',
  },
  'active-recall': {
    accent:      'from-purple-500 to-pink-600',
    ring:        'focus:ring-purple-500',
    border:      'border-purple-500/40',
    bg:          'bg-purple-500/10',
    text:        'text-purple-400',
    btnGradient: 'from-purple-500 to-pink-600',
    shadow:      'hover:shadow-purple-500/20',
    bar:         '#a855f7',
  },
};

function NumberSpinner({ label, value, min, max, onChange, unit = 'menit', theme }) {
  const intervalRef = useRef(null);
  const timeoutRef  = useRef(null);

  const valueRef = useRef(value);
  valueRef.current = value;

  const clamp = (v) => Math.min(max, Math.max(min, v));

  const step = (dir) => {
    const next = clamp(valueRef.current + dir);
    valueRef.current = next; 
    onChange(next);
  };

  const startHold = (dir) => {
    step(dir);
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => step(dir), 80);
    }, 400);
  };
  const stopHold = () => {
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    step(e.deltaY < 0 ? 1 : -1);
  };

  return (
    <div>
      <label className={`block text-xs mb-2 font-medium ${theme.text}`}>{label}</label>
      <div className={`flex items-center gap-0 bg-slate-700/40 border rounded-lg overflow-hidden transition-colors group ${theme.border}`}>
        {}
        <button
          type="button"
          onMouseDown={() => startHold(-1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(-1)}
          onTouchEnd={stopHold}
          className={`flex items-center justify-center w-10 h-11 text-slate-400 hover:text-white active:bg-slate-500/50 transition-all shrink-0 border-r border-slate-600/40 ${theme.bg} hover:${theme.bg}`}
          tabIndex={-1}
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {}
        <div
          className="flex-1 flex items-center justify-center gap-1.5 h-11 cursor-ns-resize select-none"
          onWheel={handleWheel}
        >
          <span className="text-white text-lg font-bold tabular-nums w-8 text-center">{value}</span>
          <span className="text-slate-500 text-xs">{unit}</span>
        </div>

        {}
        <button
          type="button"
          onMouseDown={() => startHold(1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(1)}
          onTouchEnd={stopHold}
          className={`flex items-center justify-center w-10 h-11 text-slate-400 hover:text-white active:bg-slate-500/50 transition-all shrink-0 border-l border-slate-600/40 ${theme.bg}`}
          tabIndex={-1}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-slate-600 text-[10px]">Min {min}</span>
        <span className="text-slate-600 text-[10px]">Maks {max}</span>
      </div>
    </div>
  );
}

export default function SettingsModal({ settings, mode = 'pomodoro', onSave, onClose }) {
  const [s, setS] = useState({ ...settings });
  const theme = modeTheme[mode] || modeTheme.pomodoro;

  const set = (key, val) => setS(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className={`bg-slate-800 border rounded-xl shadow-2xl max-w-md w-full p-6 ${theme.border}`}>

        {}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${theme.accent} flex items-center justify-center`}>
              <span className="text-white text-xs font-bold">
                {mode === 'pomodoro' ? '🍅' : mode === 'feynman' ? '💡' : '🧠'}
              </span>
            </div>
            <h2 className="text-white font-bold text-xl">Pengaturan Timer</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-5">
            {}
            {mode === 'pomodoro' && (
              <div className="grid grid-cols-2 gap-4">
                <NumberSpinner label="Durasi Fokus" value={s.focusDuration} min={1} max={120} onChange={v => set('focusDuration', v)} theme={theme} />
                <NumberSpinner label="Istirahat Pendek" value={s.shortBreakDuration} min={1} max={60} onChange={v => set('shortBreakDuration', v)} theme={theme} />
                <NumberSpinner label="Istirahat Panjang" value={s.longBreakDuration} min={1} max={120} onChange={v => set('longBreakDuration', v)} theme={theme} />
                <NumberSpinner label="Siklus Sebelum Istirahat" value={s.cyclesBeforeLongBreak} min={1} max={10} onChange={v => set('cyclesBeforeLongBreak', v)} unit="siklus" theme={theme} />
              </div>
            )}

            {}
            {mode === 'feynman' && (
              <div className="grid grid-cols-1 gap-4">
                <NumberSpinner label="Durasi Belajar" value={s.feynmanLearnDuration} min={1} max={120} onChange={v => set('feynmanLearnDuration', v)} theme={theme} />
                <NumberSpinner label="Durasi Penjelasan" value={s.feynmanExplainDuration} min={1} max={120} onChange={v => set('feynmanExplainDuration', v)} theme={theme} />
                <NumberSpinner label="Durasi Review" value={s.feynmanReviewDuration} min={1} max={120} onChange={v => set('feynmanReviewDuration', v)} theme={theme} />
              </div>
            )}

            {}
            {mode === 'active-recall' && (
              <NumberSpinner label="Durasi Sesi" value={s.activeRecallDuration} min={1} max={120} onChange={v => set('activeRecallDuration', v)} theme={theme} />
            )}

          {}
          <div className={`flex items-center justify-between p-4 bg-slate-700/30 border rounded-lg ${theme.border}`}>
            <div>
              <label className="block text-white text-sm font-medium">Penegakan Fokus</label>
              <p className="text-slate-400 text-xs mt-0.5">Jeda timer saat meninggalkan tab</p>
            </div>
            <button
              onClick={() => set('enableFocusEnforcement', !s.enableFocusEnforcement)}
              className={`relative w-12 h-6 rounded-full transition-colors ${s.enableFocusEnforcement ? `bg-gradient-to-r ${theme.accent}` : 'bg-slate-600'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg transition-transform ${s.enableFocusEnforcement ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </div>

        {}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium">
            Batal
          </button>
          <button onClick={() => onSave(s)}
            className={`flex-1 px-4 py-3 bg-gradient-to-r ${theme.btnGradient} text-white rounded-lg hover:shadow-lg ${theme.shadow} transition-all text-sm font-medium`}>
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
