import { X, Lightbulb, Brain, Pencil } from 'lucide-react';

const options = [
  { mode: 'feynman', label: 'Memahami Konsep Baru', desc: 'Saya ingin benar-benar memahami topik atau konsep baru dengan mendalam.', method: 'Metode Feynman', Icon: Lightbulb, color: 'from-cyan-500 to-blue-600', hover: 'hover:border-cyan-500/50', text: 'text-cyan-400' },
  { mode: 'active-recall', label: 'Menghafal untuk Ujian', desc: 'Saya perlu mengingat fakta, rumus, atau informasi untuk ujian atau kuis.', method: 'Active Recall', Icon: Brain, color: 'from-purple-500 to-pink-600', hover: 'hover:border-purple-500/50', text: 'text-purple-400' },
  { mode: 'pomodoro', label: 'Mengerjakan Tugas/Proyek', desc: 'Saya ingin menyelesaikan tugas, esai, atau proyek dengan produktif.', method: 'Teknik Pomodoro', Icon: Pencil, color: 'from-emerald-500 to-teal-600', hover: 'hover:border-emerald-500/50', text: 'text-emerald-400' },
];

export default function GoalSelector({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-white font-bold text-lg">Apa Tujuan Belajar Anda Hari Ini?</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-3">
          {options.map(({ mode, label, desc, method, Icon, color, hover, text }) => (
            <button key={mode} onClick={() => onSelect(mode)}
              className={`w-full p-5 bg-slate-700/30 border border-slate-600/50 ${hover} hover:bg-slate-700/50 rounded-xl text-left transition-all group`}>
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm mb-1">{label}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                  <p className={`text-xs mt-1.5 ${text}`}>→ Menggunakan {method}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 p-3 bg-slate-700/30 border border-slate-600/50 rounded-xl">
          <p className="text-xs text-slate-400 text-center">Pilih tujuan yang paling sesuai dengan kebutuhan belajar Anda saat ini</p>
        </div>
      </div>
    </div>
  );
}
