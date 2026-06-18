import { useState, useRef, useEffect } from 'react';
import { Clock, Lightbulb, Brain } from 'lucide-react';

const modes = [
  { id: 'pomodoro', name: 'Pomodoro', Icon: Clock, description: '25 menit fokus, 5 menit istirahat', accent: 'from-emerald-500 to-teal-600' },
  { id: 'feynman', name: 'Feynman', Icon: Lightbulb, description: 'Belajar dengan menjelaskan konsep', accent: 'from-cyan-500 to-blue-600' },
  { id: 'active-recall', name: 'Active Recall', Icon: Brain, description: 'Latih ingatan dengan mengingat aktif', accent: 'from-purple-500 to-pink-600' },
];

export default function ModeCarousel({ currentMode, onModeChange }) {
  const [idx, setIdx] = useState(modes.findIndex(m => m.id === currentMode));
  const [startX, setStartX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [offsetX, setOffsetX] = useState(0);

  useEffect(() => { setIdx(modes.findIndex(m => m.id === currentMode)); }, [currentMode]);

  const onStart = (x) => { setStartX(x); setDragging(true); };
  const onMove = (x) => { if (!dragging) return; setOffsetX(x - startX); };
  const onEnd = () => {
    if (!dragging) return;
    setDragging(false);
    const thr = 80;
    if (offsetX > thr && idx > 0) { const n = idx - 1; setIdx(n); onModeChange(modes[n].id); }
    else if (offsetX < -thr && idx < modes.length - 1) { const n = idx + 1; setIdx(n); onModeChange(modes[n].id); }
    setOffsetX(0);
  };

  const cardStyle = (i) => {
    const diff = i - idx;
    const base = diff * 300 + offsetX;
    return {
      transform: `translateX(${base}px) scale(${diff === 0 ? 1 : Math.abs(diff) === 1 ? 0.85 : 0.7})`,
      opacity: diff === 0 ? 1 : Math.abs(diff) === 1 ? 0.4 : 0,
      zIndex: diff === 0 ? 10 : Math.abs(diff) === 1 ? 5 : 0,
      transition: dragging ? 'none' : 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    };
  };

  return (
    <div className="relative select-none">
      <div
        className="relative h-52 overflow-visible cursor-grab active:cursor-grabbing"
        onTouchStart={e => onStart(e.touches[0].clientX)}
        onTouchMove={e => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
        onMouseDown={e => onStart(e.clientX)}
        onMouseMove={e => dragging && onMove(e.clientX)}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {modes.map((mode, i) => {
            const { Icon } = mode;
            return (
              <div key={mode.id} className="absolute w-64 sm:w-72" style={cardStyle(i)}>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-700/50 h-44 flex flex-col justify-center items-center">
                  <div className={`w-14 h-14 bg-gradient-to-br ${mode.accent} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-1">{mode.name}</h3>
                  <p className="text-slate-400 text-sm text-center px-2">{mode.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {}
      <div className="flex justify-center gap-2 mt-5">
        {modes.map((m, i) => (
          <button key={m.id} onClick={() => { setIdx(i); onModeChange(m.id); }}
            className={`rounded-full transition-all duration-300 ${i === idx ? 'w-8 h-2 bg-emerald-500' : 'w-2 h-2 bg-slate-600 hover:bg-slate-500'}`}
          />
        ))}
      </div>

      <div className="text-center mt-2">
        <p className="text-slate-500 text-xs">
          {idx > 0 && '← '} Geser untuk ganti mode {idx < modes.length - 1 && ' →'}
        </p>
      </div>
    </div>
  );
}
