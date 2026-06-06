import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Clock, Sunrise, Sunset, Moon, Plus, Trash2, Volume2, VolumeX, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'pokus-reminders';

const defaults = [
  { id: '1', time: '08:00', message: 'Saatnya mulai belajar pagi!',  enabled: false, sound: true },
  { id: '2', time: '14:00', message: 'Jangan lupa belajar siang',    enabled: false, sound: true },
  { id: '3', time: '19:00', message: 'Review materi hari ini',       enabled: false, sound: true },
];

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || defaults; }
  catch { return defaults; }
}

// ── Notification helper ────────────────────────────────────────────────────────
function notify(title, body, id) {
  if (Notification.permission !== 'granted') return;
  // tag prevents duplicate toasts for the same reminder in the same minute
  try { new Notification(title, { body, tag: id, icon: '/favicon.ico' }); }
  catch (e) { console.warn('Notification error', e); }
}

// ── Reminder Component ─────────────────────────────────────────────────────────
export default function Reminder() {
  const [reminders, setReminders] = useState(load);
  const [showForm,  setShowForm]  = useState(false);
  const [newTime,   setNewTime]   = useState('09:00');
  const [newMsg,    setNewMsg]    = useState('');
  const [notifPerm, setNotifPerm] = useState(() =>
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [lastFired, setLastFired] = useState({}); // { id: "HH:MM" } to avoid double-firing

  // Keep ref always up-to-date so the interval callback is never stale
  const remindersRef = useRef(reminders);
  const lastFiredRef = useRef(lastFired);
  useEffect(() => { remindersRef.current = reminders; }, [reminders]);
  useEffect(() => { lastFiredRef.current = lastFired; }, [lastFired]);

  // Persist on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  // ── Core check (called every minute) ────────────────────────────────────────
  const checkReminders = useCallback(() => {
    const now = new Date();
    const cur = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    remindersRef.current.forEach(r => {
      if (!r.enabled) return;
      if (r.time !== cur) return;
      // Prevent firing more than once per minute for the same reminder
      if (lastFiredRef.current[r.id] === cur) return;

      setLastFired(prev => ({ ...prev, [r.id]: cur }));
      notify('PokusDuls — Pengingat Belajar', r.message, r.id);

      // In-app audio beep (optional, only if sound enabled)
      if (r.sound) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sine'; osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
          osc.start(); osc.stop(ctx.currentTime + 0.8);
        } catch { /* audio not supported */ }
      }
    });
  }, []);

  // ── Aligned interval: fire on exact minute boundary ─────────────────────────
  useEffect(() => {
    // Fire once immediately so we don't miss if the component mounts mid-minute
    checkReminders();

    let intervalId;
    // Align to the next whole minute
    const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000 - new Date().getMilliseconds();
    const timeoutId = setTimeout(() => {
      checkReminders();
      intervalId = setInterval(checkReminders, 60_000);
    }, msUntilNextMinute);

    return () => { clearTimeout(timeoutId); clearInterval(intervalId); };
  }, [checkReminders]);

  // ── Permission request ───────────────────────────────────────────────────────
  const reqPerm = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const toggle      = id => setReminders(r => r.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));
  const toggleSound = id => setReminders(r => r.map(x => x.id === id ? { ...x, sound:   !x.sound   } : x));
  const del         = id => setReminders(r => r.filter(x => x.id !== id));
  const add = () => {
    if (!newMsg.trim()) return;
    setReminders(r => [...r, { id: Date.now().toString(), time: newTime, message: newMsg.trim(), enabled: true, sound: true }]);
    setNewMsg(''); setShowForm(false);
  };

  const getIcon = (time) => {
    const h = parseInt(time.split(':')[0]);
    if (h >= 5  && h < 12) return Sunrise;
    if (h >= 12 && h < 17) return Clock;
    if (h >= 17 && h < 20) return Sunset;
    return Moon;
  };

  // Current HH:MM for "next fire" display
  const nowStr = () => {
    const n = new Date();
    return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;
  };

  return (
    <div className="space-y-4">

      {/* Header card */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-11 h-11 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-semibold">Pengingat Belajar</h2>
            <p className="text-slate-400 text-sm mt-0.5">Atur waktu belajar dengan notifikasi otomatis</p>
          </div>
          {/* Live clock */}
          <div className="text-right shrink-0">
            <p className="text-slate-500 text-[10px] mb-0.5">Waktu sekarang</p>
            <LiveClock />
          </div>
        </div>

        {/* Notification permission banner */}
        {notifPerm === 'unsupported' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-amber-300 text-sm">
            Browser ini tidak mendukung notifikasi sistem.
          </div>
        )}
        {notifPerm === 'denied' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
            Notifikasi diblokir. Aktifkan di pengaturan browser untuk menggunakan pengingat.
          </div>
        )}
        {notifPerm === 'default' && (
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 flex items-center gap-3">
            <Bell className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-white text-sm flex-1">Izinkan notifikasi untuk menerima pengingat</p>
            <button onClick={reqPerm}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all text-sm font-medium shrink-0">
              Izinkan
            </button>
          </div>
        )}
        {notifPerm === 'granted' && (
          <div className="flex items-center gap-2 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4" />
            Notifikasi aktif — pengingat akan muncul tepat waktu
          </div>
        )}
      </div>

      {/* Reminder list */}
      <div className="space-y-3">
        {reminders.map(r => {
          const TIcon = getIcon(r.time);
          const firedThisMinute = lastFired[r.id] === nowStr();
          return (
            <div key={r.id}
              className={`bg-slate-800/50 border rounded-xl p-4 transition-all ${r.enabled ? 'border-emerald-500/40' : 'border-slate-700/50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-all ${r.enabled ? 'bg-emerald-500/20' : 'bg-slate-700/30'}`}>
                  <TIcon className={`w-5 h-5 ${r.enabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-xl font-bold tabular-nums ${r.enabled ? 'text-white' : 'text-slate-500'}`}>{r.time}</p>
                    {firedThisMinute && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full animate-pulse">
                        Baru dikirim
                      </span>
                    )}
                  </div>
                  <p className={`text-xs truncate ${r.enabled ? 'text-slate-400' : 'text-slate-600'}`}>{r.message}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => toggleSound(r.id)}
                    title={r.sound ? 'Nonaktifkan suara' : 'Aktifkan suara'}
                    className={`p-2 rounded-lg transition-all ${r.sound ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/30 text-slate-500'}`}>
                    {r.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button onClick={() => del(r.id)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggle(r.id)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all ${r.enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                    <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${r.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Form */}
      {showForm ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Tambah Pengingat Baru</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Waktu</label>
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Pesan Pengingat</label>
              <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && add()}
                placeholder="Contoh: Saatnya belajar matematika"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm" />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={add} disabled={!newMsg.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium">
                Tambah
              </button>
              <button onClick={() => { setShowForm(false); setNewMsg(''); }}
                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all text-sm font-medium">
                Batal
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button id="btn-add-reminder" onClick={() => setShowForm(true)}
          className="w-full px-5 py-4 bg-slate-800/30 border-2 border-dashed border-slate-600 text-slate-400 rounded-xl hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah Pengingat Baru
        </button>
      )}

      {/* Tips */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">💡 Tips Pengingat</h3>
        <ul className="space-y-1.5 text-slate-400 text-sm">
          <li>• Atur pengingat di waktu yang sama untuk membangun kebiasaan</li>
          <li>• Aktifkan suara agar tidak terlewat</li>
          <li>• Gunakan pesan yang memotivasi dan spesifik</li>
          <li>• 3–5 pengingat per hari sudah cukup</li>
        </ul>
      </div>
    </div>
  );
}

// ── Live Clock (re-renders every second) ─────────────────────────────────────
function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="text-white font-bold text-sm tabular-nums">
      {String(now.getHours()).padStart(2,'0')}:{String(now.getMinutes()).padStart(2,'0')}:{String(now.getSeconds()).padStart(2,'0')}
    </p>
  );
}
