import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Clock, Sunrise, Sunset, Moon, Plus, Trash2, CheckCircle2, Upload, Music, X, Play } from 'lucide-react';

const STORAGE_KEY = 'pokus-reminders';

const defaults = [
  { id: '1', time: '08:00:00', message: 'Saatnya mulai belajar pagi!', enabled: false, soundData: null, soundName: null },
  { id: '2', time: '14:00:00', message: 'Jangan lupa belajar siang',   enabled: false, soundData: null, soundName: null },
  { id: '3', time: '19:00:00', message: 'Review materi hari ini',      enabled: false, soundData: null, soundName: null },
];

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || defaults; }
  catch { return defaults; }
}

function pad(n) { return String(n).padStart(2, '0'); }

function nowHMS() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine'; osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
    osc.start(); osc.stop(ctx.currentTime + 0.8);
  } catch {  }
}

function playSound(soundData) {
  if (soundData) {
    try {
      const audio = new Audio(soundData);
      audio.volume = 0.8;
      audio.play().catch(() => playBeep());
      return;
    } catch {  }
  }
  playBeep();
}

function notify(title, body, id) {
  if (Notification.permission !== 'granted') return;
  try { new Notification(title, { body, tag: id, icon: '/favicon.ico' }); }
  catch (e) { console.warn('Notification error', e); }
}

function TimeSpinner({ label, value, min, max, onChange }) {

  const valueRef   = useRef(value);
  valueRef.current = value;

  const intervalRef = useRef(null);
  const timeoutRef  = useRef(null);

  const wrap = (v) => {
    const range = max - min + 1;
    return ((v - min) % range + range) % range + min;
  };

  const step = (dir) => {
    const next = wrap(valueRef.current + dir);
    valueRef.current = next;   
    onChange(next);
  };

  const startHold = (dir) => {
    step(dir);
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => step(dir), 80);
    }, 350);
  };

  const stopHold = () => {
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
  };

  const touchStartY = useRef(null);
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e) => {
    e.preventDefault(); 
    if (touchStartY.current === null) return;
    const dy = touchStartY.current - e.touches[0].clientY;
    if (Math.abs(dy) >= 20) {
      step(dy > 0 ? 1 : -1);
      touchStartY.current = e.touches[0].clientY; 
    }
  };
  const handleTouchEnd = () => {
    stopHold();
    touchStartY.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <span className="text-slate-500 text-[10px] uppercase tracking-wider font-medium">{label}</span>

      <div
        className="flex flex-col items-center bg-slate-800 border border-emerald-500/40 rounded-xl overflow-hidden shadow-lg"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        {}
        <button
          type="button"
          onMouseDown={() => startHold(1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          className="w-full px-6 py-2 text-emerald-400 hover:bg-emerald-500/20 active:bg-emerald-500/30 transition-colors text-base font-semibold leading-none"
        >
          ▲
        </button>

        {}
        <div className="px-6 py-2 border-y border-slate-700/60 bg-slate-700/30 w-full text-center flex justify-center">
          <input
            type="text"
            inputMode="numeric"
            value={valueRef.current} 
            onChange={(e) => {
              const val = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
              if (!isNaN(val)) {
                let clamped = val;
                if (clamped > max) clamped = max;
                if (clamped < min) clamped = min;
                onChange(clamped);
              }
            }}
            onBlur={(e) => {
              let val = parseInt(e.target.value, 10);
              if (isNaN(val)) val = min;
              if (val > max) val = max;
              if (val < min) val = min;
              onChange(val);
              e.target.value = pad(val); // Reformat on blur
            }}
            onFocus={(e) => e.target.select()}
            ref={(el) => { if (el && document.activeElement !== el) el.value = pad(value); }}
            className="w-12 bg-transparent text-center text-white font-bold text-2xl tabular-nums leading-none focus:outline-none focus:bg-slate-800/50 rounded"
          />
        </div>

        {/* Down button */}
        <button
          type="button"
          onMouseDown={() => startHold(-1)}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          className="w-full px-6 py-2 text-emerald-400 hover:bg-emerald-500/20 active:bg-emerald-500/30 transition-colors text-base font-semibold leading-none"
        >
          ▼
        </button>
      </div>
    </div>
  );
}

// ADD / EDIT REMINDER FORM
function ReminderForm({ initial, onSave, onCancel }) {
  const [hour,      setHour]      = useState(() => initial?.time ? parseInt(initial.time.split(':')[0]) : 9);
  const [minute,    setMinute]    = useState(() => initial?.time ? parseInt(initial.time.split(':')[1]) : 0);
  const [second,    setSecond]    = useState(() => initial?.time ? parseInt(initial.time.split(':')[2] ?? '0') : 0);
  const [message,   setMessage]   = useState(initial?.message  || '');
  const [soundData, setSoundData] = useState(initial?.soundData || null);
  const [soundName, setSoundName] = useState(initial?.soundName || null);
  const fileRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSoundData(ev.target.result);
      setSoundName(file.name);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = () => {
    if (!message.trim()) return;
    onSave({
      time: `${pad(hour)}:${pad(minute)}:${pad(second)}`,
      message: message.trim(),
      soundData,
      soundName,
    });
  };

  return (
    <div className="bg-slate-800/60 border border-emerald-500/30 rounded-xl p-5 space-y-5">
      <h3 className="text-white font-semibold text-sm">
        {initial ? 'Edit Pengingat' : 'Pengingat Baru'}
      </h3>

      {
      <div>
        <label className="block text-slate-400 text-xs mb-3">Waktu Pengingat</label>
        <div className="flex items-start justify-center gap-3">
          <TimeSpinner label="Jam"   value={hour}   min={0} max={23} onChange={setHour}   />
          <span className="text-slate-500 text-3xl font-light mt-7 leading-none">:</span>
          <TimeSpinner label="Menit" value={minute} min={0} max={59} onChange={setMinute} />
          <span className="text-slate-500 text-3xl font-light mt-7 leading-none">:</span>
          <TimeSpinner label="Detik" value={second} min={0} max={59} onChange={setSecond} />
        </div>
        <p className="text-center text-emerald-400/70 text-xs mt-3 tabular-nums font-medium">
          {pad(hour)}:{pad(minute)}:{pad(second)}
        </p>
      </div>

      {
      <div>
        <label className="block text-slate-400 text-xs mb-1.5">Pesan Pengingat</label>
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Contoh: Saatnya belajar matematika"
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
        />
      </div>

      {
      <div>
        <label className="block text-slate-400 text-xs mb-2">Suara Alarm</label>
        <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />

        <div className={`flex items-center gap-2 p-3 rounded-lg mb-2 border ${soundData ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-700/30 border-slate-600/40'}`}>
          <Music className={`w-4 h-4 shrink-0 ${soundData ? 'text-emerald-400' : 'text-slate-500'}`} />
          <p className={`flex-1 text-xs truncate ${soundData ? 'text-emerald-300' : 'text-slate-500'}`}>
            {soundData ? soundName : 'Suara bawaan (beep)'}
          </p>
          {}
          <button
            type="button"
            onClick={() => playSound(soundData)}
            title="Preview suara"
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <Play className={`w-3.5 h-3.5 ${soundData ? 'text-emerald-400' : 'text-slate-400'}`} />
          </button>
          {}
          {soundData && (
            <button
              type="button"
              onClick={() => { setSoundData(null); setSoundName(null); }}
              title="Hapus suara custom"
              className="p-1 hover:bg-red-500/20 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5 text-red-400" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full py-2 px-4 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-600/60 hover:text-white transition-all text-xs"
        >
          <Upload className="w-3.5 h-3.5" />
          {soundData ? 'Ganti Suara' : 'Upload Suara Custom'} (MP3, WAV, OGG…)
        </button>
      </div>

      {
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!message.trim()}
          className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
        >
          {initial ? 'Simpan' : 'Tambah Pengingat'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all text-sm"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

export default function Reminder() {
  const [reminders, setReminders] = useState(load);
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [notifPerm, setNotifPerm] = useState(() =>
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const handleUpdate = () => {
      setReminders(load());
    };
    window.addEventListener('pokus-reminders-updated', handleUpdate);
    return () => window.removeEventListener('pokus-reminders-updated', handleUpdate);
  }, []);

  const reqPerm = async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPerm(perm);
  };

  const toggle = id => setReminders(r => r.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));
  const del    = id => setReminders(r => r.filter(x => x.id !== id));

  const handleAdd = (data) => {
    setReminders(r => [...r, { id: Date.now().toString(), enabled: true, ...data }]);
    setShowForm(false);
  };

  const handleEdit = (data) => {
    setReminders(r => r.map(x => x.id === editId ? { ...x, ...data } : x));
    setEditId(null);
  };

  const editingReminder = editId ? reminders.find(r => r.id === editId) : null;

  const getIcon = (time) => {
    const h = parseInt(time.split(':')[0]);
    if (h >= 5  && h < 12) return Sunrise;
    if (h >= 12 && h < 17) return Clock;
    if (h >= 17 && h < 20) return Sunset;
    return Moon;
  };

  return (
    <div className="space-y-4">

      {
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-11 h-11 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-semibold">Pengingat Belajar</h2>
            <p className="text-slate-400 text-sm mt-0.5">Setiap pengingat bisa punya suara alarm sendiri</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-slate-500 text-[10px] mb-0.5">Sekarang</p>
            <LiveClock />
          </div>
        </div>

        {notifPerm === 'unsupported' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-amber-300 text-sm">
            Browser ini tidak mendukung notifikasi sistem.
          </div>
        )}
        {notifPerm === 'denied' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-300 text-sm">
            Notifikasi diblokir. Aktifkan di pengaturan browser.
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
            Notifikasi aktif — pengingat akan berbunyi tepat waktu
          </div>
        )}
      </div>

      {
      {showForm && (
        <ReminderForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      )}

      {
      {editId && editingReminder && (
        <ReminderForm initial={editingReminder} onSave={handleEdit} onCancel={() => setEditId(null)} />
      )}

      {
      <div className="space-y-3">
        {reminders.map(r => {
          const TIcon = getIcon(r.time);
          return (
            <div key={r.id}
              className={`bg-slate-800/50 border rounded-xl p-4 transition-all ${r.enabled ? 'border-emerald-500/40' : 'border-slate-700/50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${r.enabled ? 'bg-emerald-500/20' : 'bg-slate-700/30'}`}>
                  <TIcon className={`w-5 h-5 ${r.enabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-xl font-bold tabular-nums ${r.enabled ? 'text-white' : 'text-slate-500'}`}>
                      {r.time}
                    </p>
                  </div>
                  <p className={`text-xs truncate ${r.enabled ? 'text-slate-400' : 'text-slate-600'}`}>{r.message}</p>
                  <p className="text-[10px] mt-0.5 flex items-center gap-1">
                    {r.soundData
                      ? <><Music className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500/80 truncate max-w-[120px]">{r.soundName}</span></>
                      : <span className="text-slate-600">Suara bawaan</span>
                    }
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {}
                  <button onClick={() => playSound(r.soundData)} title="Preview suara"
                    className="p-2 text-slate-400 hover:bg-slate-700/50 rounded-lg transition-colors">
                    <Play className="w-4 h-4" />
                  </button>
                  {}
                  <button onClick={() => { setEditId(r.id); setShowForm(false); }} title="Edit"
                    className="p-2 text-slate-400 hover:bg-slate-700/50 rounded-lg transition-colors">
                    <Bell className="w-4 h-4" />
                  </button>
                  {}
                  <button onClick={() => del(r.id)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all border border-red-500/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {}
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

      {
      {!showForm && !editId && (
        <button id="btn-add-reminder" onClick={() => setShowForm(true)}
          className="w-full px-5 py-4 bg-slate-800/30 border-2 border-dashed border-slate-600 text-slate-400 rounded-xl hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Tambah Pengingat Baru
        </button>
      )}

      {
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">💡 Tips</h3>
        <ul className="space-y-1.5 text-slate-400 text-sm">
          <li>• Scroll atau sentuh spinner untuk mengubah waktu</li>
          <li>• Setiap pengingat bisa punya suara alarm berbeda</li>
          <li>• Klik ▶ untuk preview suara sebelum menyimpan</li>
          <li>• Format suara: MP3, WAV, OGG, M4A</li>
        </ul>
      </div>
    </div>
  );
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="text-white font-bold text-sm tabular-nums">
      {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
    </p>
  );
}
