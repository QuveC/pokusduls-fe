import { useEffect, useState } from 'react';
import { Sprout, AlertCircle } from 'lucide-react';

export default function FocusAnimation({ progress }) {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const handleVis = () => {
      if (document.hidden) { setShowWarning(true); }
      else { setTimeout(() => setShowWarning(false), 3000); }
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, []);

  const h = Math.min(progress, 100);
  const stemColor = progress < 30 ? '#86efac' : progress < 70 ? '#4ade80' : '#22c55e';

  return (
    <div className="space-y-3">
      {showWarning && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-3 animate-pulse">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 text-sm font-medium">Fokus terganggu!</p>
            <p className="text-slate-400 text-xs">Tetap di halaman ini untuk menjaga kemajuan.</p>
          </div>
        </div>
      )}

      {/* Plant */}
      <div className="bg-gradient-to-b from-sky-950/80 to-emerald-950/80 rounded-xl p-6 relative overflow-hidden border border-slate-700/40">
        {/* Sun */}
        <div className="absolute top-3 right-3 w-10 h-10 bg-yellow-300/80 rounded-full shadow-lg shadow-yellow-300/30 animate-pulse" />

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-amber-900/80 to-amber-700/60" />

        <div className="relative h-36 flex items-end justify-center">
          <div className="w-2 rounded-t-full transition-all duration-1000 ease-out relative" style={{ height: `${h}%`, backgroundColor: stemColor, transformOrigin: 'bottom' }}>
            {progress > 20 && (
              <>
                <div className="absolute left-2 top-1/4 w-5 h-5 bg-green-400/80 rounded-full transform -rotate-45" />
                <div className="absolute right-2 top-1/4 w-5 h-5 bg-green-400/80 rounded-full transform rotate-45" />
              </>
            )}
            {progress > 50 && (
              <>
                <div className="absolute left-2 top-1/2 w-5 h-5 bg-green-500/80 rounded-full transform -rotate-45" />
                <div className="absolute right-2 top-1/2 w-5 h-5 bg-green-500/80 rounded-full transform rotate-45" />
              </>
            )}
            {progress > 80 && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                <Sprout className="w-7 h-7 text-green-400 animate-bounce" />
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-3 relative z-10">
          <p className="text-emerald-300 text-sm font-medium">
            {progress < 30 && 'Tanaman mulai tumbuh...'}
            {progress >= 30 && progress < 70 && 'Tanaman tumbuh dengan baik!'}
            {progress >= 70 && progress < 100 && 'Hampir berbunga! 🌿'}
            {progress >= 100 && 'Tanaman berbunga sempurna! 🌸'}
          </p>
          <p className="text-emerald-500 text-xs mt-0.5">{Math.round(progress)}% Fokus</p>
        </div>
      </div>

      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
        <p className="text-xs text-indigo-300/80 text-center">💡 Tetap fokus pada tab ini untuk melihat tanaman tumbuh!</p>
      </div>
    </div>
  );
}
