import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Award, Calendar, Zap, Flame } from 'lucide-react';
import { getStatistics } from '../api/statistics';

export default function Statistics() {
  const [sessions, setSessions] = useState([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [weekData, setWeekData] = useState([]);
  const [apiStats, setApiStats] = useState(null);
  const [loadingApi, setLoadingApi] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('pokus-user-id');
    const historyKey = userId ? `pokus-history-${userId}` : 'pokus-history-guest';
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    setSessions(history);
    setTotalMinutes(history.reduce((s, h) => s + h.duration, 0));

    const days = [], names = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push({ date: d, label: names[d.getDay()] });
    }
    setWeekData(days.map(({ date, label }) => ({
      day: label,
      minutes: history.filter(s => new Date(s.date).toDateString() === date.toDateString()).reduce((a, s) => a + s.duration, 0),
    })));

    // Data global dari backend (XP, streak, dll)
    if (userId) {
      setLoadingApi(true);
      getStatistics(parseInt(userId))
        .then(data => setApiStats(data))
        .catch(() => setApiStats(null))
        .finally(() => setLoadingApi(false));
    }
  }, []);

  const fmt = (m) => { const h = Math.floor(m/60), r = m%60; return h > 0 ? `${h}j ${r}m` : `${r}m`; };
  const todayMin = () => { const t = new Date().toDateString(); return sessions.filter(s => new Date(s.date).toDateString() === t).reduce((a,s) => a+s.duration, 0); };
  const weekMin = () => { const w = new Date(); w.setDate(w.getDate()-7); return sessions.filter(s => new Date(s.date) >= w).reduce((a,s) => a+s.duration, 0); };
  const topMode = () => {
    const m = {}; sessions.forEach(s => { m[s.mode] = (m[s.mode]||0)+1; });
    const sorted = Object.entries(m).sort((a,b) => b[1]-a[1]);
    if (!sorted.length) return '-';
    const names = { pomodoro:'Pomodoro', feynman:'Feynman', 'active-recall':'Active Recall' };
    return names[sorted[0][0]] || sorted[0][0];
  };

  const statCards = [
    { label: 'Total Waktu', value: fmt(totalMinutes), Icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { label: 'Hari Ini', value: fmt(todayMin()), Icon: Calendar, color: 'text-sky-400', bg: 'bg-sky-500/20' },
    { label: 'Minggu Ini', value: fmt(weekMin()), Icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/20' },
    { label: 'Mode Favorit', value: topMode(), Icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  ];

  const modeColor = { pomodoro: 'bg-emerald-400', feynman: 'bg-sky-400', 'active-recall': 'bg-purple-400' };
  const modeName = { pomodoro: 'Pomodoro', feynman: 'Feynman', 'active-recall': 'Active Recall' };

  return (
    <div className="space-y-5">
      {/* Stat Cards lokal */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-slate-400 text-xs mb-1">{label}</p>
            <p className="text-white text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {/* Stats dari backend (XP & Streak) */}
      {localStorage.getItem('pokus-user-id') && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">Progress Global</h2>
          {loadingApi ? (
            <p className="text-slate-400 text-sm">Memuat data...</p>
          ) : apiStats ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/40 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Total XP</p>
                  <p className="text-white font-bold">{apiStats.total_xp ?? 0}</p>
                </div>
              </div>
              <div className="bg-slate-700/40 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Streak</p>
                  <p className="text-white font-bold">{apiStats.current_streak ?? 0} hari</p>
                </div>
              </div>
              <div className="bg-slate-700/40 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Total Sesi</p>
                  <p className="text-white font-bold">{apiStats.total_sessions ?? 0}</p>
                </div>
              </div>
              <div className="bg-slate-700/40 rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 bg-sky-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Fokus Rata-rata</p>
                  <p className="text-white font-bold">{apiStats.avg_focus_score ?? 0}%</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Gagal memuat data global.</p>
          )}
        </div>
      )}

      {/* Weekly Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-5">Aktivitas 7 Hari Terakhir</h2>
        {weekData.some(d => d.minutes > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '13px' }}
                formatter={v => [`${v} menit`, 'Waktu Fokus']} />
              <Bar dataKey="minutes" fill="url(#grad)" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 bg-slate-700/50 rounded-xl flex items-center justify-center">
                <Clock className="w-7 h-7 text-slate-600" />
              </div>
              <p className="text-slate-400 text-sm">Belum ada data</p>
              <p className="text-slate-500 text-xs mt-1">Mulai sesi fokus untuk melihat statistik</p>
            </div>
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-4">Riwayat Sesi Terbaru</h2>
        {sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.slice(-10).reverse().map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all border border-slate-700/40">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${modeColor[s.mode] || 'bg-slate-400'}`} />
                  <div>
                    <p className="text-white text-sm font-medium">{modeName[s.mode] || s.mode}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {new Date(s.date).toLocaleString('id-ID', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                </div>
                <span className="text-slate-300 text-sm px-3 py-1 bg-slate-700/60 rounded-lg">{s.duration} menit</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500">
            <p className="text-sm">Belum ada sesi yang tercatat</p>
          </div>
        )}
      </div>

      {sessions.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => { const u = localStorage.getItem('pokus-user-id'); const k = u ? `pokus-history-${u}` : 'pokus-history-guest'; if (confirm('Hapus semua data?')) { localStorage.removeItem(k); setSessions([]); setTotalMinutes(0); setWeekData(weekData.map(d => ({...d, minutes:0}))); }}}
            className="px-5 py-2.5 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all text-sm"
          >
            Hapus Semua Data
          </button>
        </div>
      )}
    </div>
  );
}
