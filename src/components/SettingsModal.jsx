import { useState, useRef } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

// ── Custom Number Spinner ─────────────────────────────────────────────────────
function NumberSpinner({ label, value, min, max, onChange, unit = 'menit' }) {
  const intervalRef = useRef(null);
  const timeoutRef  = useRef(null);

  const clamp = (v) => Math.min(max, Math.max(min, v));

  const step = (dir) => onChange(clamp(value + dir));

  // Hold-to-repeat
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

  // Scroll wheel
  const handleWheel = (e) => {
    e.preventDefault();
    step(e.deltaY < 0 ? 1 : -1);
  };

  return (
    <div>
      <label className="block text-slate-400 text-xs mb-2 font-medium">{label}</label>
      <div className="flex items-center gap-0 bg-slate-700/40 border border-slate-600/60 rounded-lg overflow-hidden hover:border-emerald-500/40 transition-colors group">
        {/* Down */}
        <button
          type="button"
          onMouseDown={() => startHold(-1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(-1)}
          onTouchEnd={stopHold}
          className="flex items-center justify-center w-10 h-11 text-slate-400 hover:text-white hover:bg-slate-600/50 active:bg-slate-500/50 transition-all shrink-0 border-r border-slate-600/40"
          tabIndex={-1}
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* Value + scroll */}
        <div
          className="flex-1 flex items-center justify-center gap-1.5 h-11 cursor-ns-resize select-none"
          onWheel={handleWheel}
        >
          <span className="text-white text-lg font-bold tabular-nums w-8 text-center">
            {value}
          </span>
          <span className="text-slate-500 text-xs">{unit}</span>
        </div>

        {/* Up */}
        <button
          type="button"
          onMouseDown={() => startHold(1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={() => startHold(1)}
          onTouchEnd={stopHold}
          className="flex items-center justify-center w-10 h-11 text-slate-400 hover:text-white hover:bg-slate-600/50 active:bg-slate-500/50 transition-all shrink-0 border-l border-slate-600/40"
          tabIndex={-1}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* Min-max hint */}
      <div className="flex justify-between mt-1">
        <span className="text-slate-600 text-[10px]">Min {min}</span>
        <span className="text-slate-600 text-[10px]">Maks {max}</span>
      </div>
    </div>
  );
}

// ── Settings Modal ────────────────────────────────────────────────────────────
export default function SettingsModal({ settings, onSave, onClose }) {
  const [s, setS] = useState({ ...settings });

  const set = (key, val) => setS(prev => ({ ...prev, [key]: val }));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700/50 rounded-xl shadow-2xl max-w-md w-full p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-bold text-xl">Pengaturan Timer</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Duration spinners */}
          <div className="grid grid-cols-2 gap-4">
            <NumberSpinner
              label="Durasi Fokus"
              value={s.focusDuration}
              min={1} max={120}
              onChange={v => set('focusDuration', v)}
            />
            <NumberSpinner
              label="Istirahat Pendek"
              value={s.shortBreakDuration}
              min={1} max={60}
              onChange={v => set('shortBreakDuration', v)}
            />
            <NumberSpinner
              label="Istirahat Panjang"
              value={s.longBreakDuration}
              min={1} max={120}
              onChange={v => set('longBreakDuration', v)}
            />
            <NumberSpinner
              label="Siklus Sebelum Istirahat"
              value={s.cyclesBeforeLongBreak}
              min={1} max={10}
              onChange={v => set('cyclesBeforeLongBreak', v)}
              unit="siklus"
            />
          </div>

          {/* Focus enforcement toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg">
            <div>
              <label className="block text-white text-sm font-medium">Penegakan Fokus</label>
              <p className="text-slate-400 text-xs mt-0.5">Jeda timer saat meninggalkan tab</p>
            </div>
            <button
              onClick={() => set('enableFocusEnforcement', !s.enableFocusEnforcement)}
              className={`relative w-12 h-6 rounded-full transition-colors ${s.enableFocusEnforcement ? 'bg-emerald-500' : 'bg-slate-600'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg transition-transform ${s.enableFocusEnforcement ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium">
            Batal
          </button>
          <button onClick={() => onSave(s)}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium">
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
