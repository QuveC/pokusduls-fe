import { useState } from 'react';
import { X } from 'lucide-react';

export default function SettingsModal({ settings, onSave, onClose }) {
  const [s, setS] = useState({ ...settings });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white font-bold text-xl">Pengaturan Timer</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-4">
          {[
            { key: 'focusDuration', label: 'Durasi Fokus (menit)', min: 1, max: 120 },
            { key: 'shortBreakDuration', label: 'Istirahat Pendek (menit)', min: 1, max: 60 },
            { key: 'longBreakDuration', label: 'Istirahat Panjang (menit)', min: 1, max: 120 },
            { key: 'cyclesBeforeLongBreak', label: 'Siklus Sebelum Istirahat Panjang', min: 1, max: 10 },
          ].map(({ key, label, min, max }) => (
            <div key={key}>
              <label className="block text-slate-400 text-sm mb-1.5">{label}</label>
              <input type="number" min={min} max={max} value={s[key]}
                onChange={e => setS({ ...s, [key]: parseInt(e.target.value) || s[key] })}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>
          ))}

          <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/50 rounded-xl">
            <div>
              <label className="block text-white text-sm font-medium">Penegakan Fokus</label>
              <p className="text-slate-400 text-xs mt-0.5">Jeda timer saat meninggalkan tab</p>
            </div>
            <button
              onClick={() => setS({ ...s, enableFocusEnforcement: !s.enableFocusEnforcement })}
              className={`relative w-12 h-6 rounded-full transition-colors ${s.enableFocusEnforcement ? 'bg-emerald-500' : 'bg-slate-600'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg transition-transform ${s.enableFocusEnforcement ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors text-sm font-medium">Batal</button>
          <button onClick={() => onSave(s)} className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-medium">Simpan</button>
        </div>
      </div>
    </div>
  );
}
