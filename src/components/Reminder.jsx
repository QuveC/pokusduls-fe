import { useState, useEffect } from 'react';
import { Bell, Clock, Sunrise, Sunset, Moon, Plus, Trash2, Volume2, VolumeX } from 'lucide-react';

const defaults = [
  { id: '1', time: '08:00', message: 'Saatnya mulai belajar pagi!', enabled: false, sound: true },
  { id: '2', time: '14:00', message: 'Jangan lupa belajar siang', enabled: false, sound: true },
  { id: '3', time: '19:00', message: 'Review materi hari ini', enabled: false, sound: true },
];

export default function Reminder() {
  const [reminders, setReminders] = useState(() => {
    const s = localStorage.getItem('pokus-reminders');
    return s ? JSON.parse(s) : defaults;
  });
  const [showForm, setShowForm] = useState(false);
  const [newTime, setNewTime] = useState('09:00');
  const [newMsg, setNewMsg] = useState('');
  const [notifPerm, setNotifPerm] = useState('default');

  useEffect(() => {
    localStorage.setItem('pokus-reminders', JSON.stringify(reminders));
    checkReminders();
  }, [reminders]);

  useEffect(() => {
    if ('Notification' in window) setNotifPerm(Notification.permission);
    const iv = setInterval(checkReminders, 60000);
    return () => clearInterval(iv);
  }, []);

  const checkReminders = () => {
    const now = new Date();
    const cur = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    reminders.forEach(r => {
      if (r.enabled && r.time === cur) {
        if (notifPerm === 'granted') new Notification('PokusDuls - Pengingat Belajar', { body: r.message, tag: r.id });
      }
    });
  };

  const reqPerm = async () => {
    if ('Notification' in window) setNotifPerm(await Notification.requestPermission());
  };

  const toggle = (id) => setReminders(r => r.map(x => x.id === id ? {...x, enabled: !x.enabled} : x));
  const toggleSound = (id) => setReminders(r => r.map(x => x.id === id ? {...x, sound: !x.sound} : x));
  const del = (id) => setReminders(r => r.filter(x => x.id !== id));
  const add = () => {
    if (!newMsg.trim()) return;
    setReminders(r => [...r, { id: Date.now().toString(), time: newTime, message: newMsg, enabled: true, sound: true }]);
    setNewMsg(''); setShowForm(false);
  };

  const getIcon = (time) => {
    const h = parseInt(time.split(':')[0]);
    if (h >= 5 && h < 12) return Sunrise;
    if (h >= 12 && h < 17) return Clock;
    if (h >= 17 && h < 20) return Sunset;
    return Moon;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-11 h-11 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Pengingat Belajar</h2>
            <p className="text-slate-400 text-sm mt-0.5">Atur waktu belajar dengan pengingat otomatis</p>
          </div>
        </div>

        {notifPerm !== 'granted' && (
          <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4">
            <p className="text-white text-sm mb-3">Izinkan notifikasi untuk menerima pengingat</p>
            <button onClick={reqPerm} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all text-sm font-medium">
              Izinkan Notifikasi
            </button>
          </div>
        )}
      </div>

      {/* Reminder List */}
      <div className="space-y-3">
        {reminders.map(r => {
          const TIcon = getIcon(r.time);
          return (
            <div key={r.id} className={`bg-slate-800/50 border rounded-xl p-4 transition-all ${r.enabled ? 'border-emerald-500/40' : 'border-slate-700/50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-all ${r.enabled ? 'bg-emerald-500/20' : 'bg-slate-700/30'}`}>
                  <TIcon className={`w-5 h-5 ${r.enabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xl font-bold ${r.enabled ? 'text-white' : 'text-slate-500'}`}>{r.time}</p>
                  <p className={`text-xs ${r.enabled ? 'text-slate-400' : 'text-slate-600'}`}>{r.message}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => toggleSound(r.id)} className={`p-2 rounded-lg transition-all ${r.sound ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/30 text-slate-500'}`}>
                    {r.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button onClick={() => del(r.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggle(r.id)} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all ${r.enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
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
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Tambah Pengingat Baru</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Waktu</label>
              <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm" />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1.5">Pesan Pengingat</label>
              <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Contoh: Saatnya belajar matematika"
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm" />
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={add} disabled={!newMsg.trim()} className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-medium">Tambah</button>
              <button onClick={() => { setShowForm(false); setNewMsg(''); }} className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all text-sm font-medium">Batal</button>
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
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-3">💡 Tips Pengingat</h3>
        <ul className="space-y-1.5 text-slate-400 text-sm">
          <li>• Atur pengingat di waktu yang sama untuk membangun kebiasaan</li>
          <li>• Aktifkan suara agar tidak terlewat</li>
          <li>• Gunakan pesan yang memotivasi dan spesifik</li>
          <li>• 3-5 pengingat per hari sudah cukup</li>
        </ul>
      </div>
    </div>
  );
}
