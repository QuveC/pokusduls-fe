import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';

const STORAGE_KEY = 'pokus-reminders';

function pad(n) { return String(n).padStart(2, '0'); }

function nowHMS() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export default function GlobalAlarm() {
  const [activeAlarm, setActiveAlarm] = useState(null);
  const lastFiredRef = useRef({});
  const audioRef = useRef(null);
  const beepIntervalRef = useRef(null);

  useEffect(() => {
    const checkReminders = () => {

      if (activeAlarm) return;

      let reminders = [];
      try {
        reminders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      } catch (e) { return; }

      const cur = nowHMS();
      for (const r of reminders) {
        if (!r.enabled) continue;
        if (r.time === cur && lastFiredRef.current[r.id] !== cur) {
          lastFiredRef.current[r.id] = cur;

          if ('Notification' in window && Notification.permission === 'granted') {
            try { new Notification('PokusDuls — Pengingat Belajar', { body: r.message, icon: '/favicon.ico' }); } catch(e){}
          }

          triggerAlarm(r);
          break; 
        }
      }
    };

    const id = setInterval(checkReminders, 1000);
    return () => clearInterval(id);
  }, [activeAlarm]);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); }
      if (beepIntervalRef.current) { clearInterval(beepIntervalRef.current); }
    };
  }, []);

  const playBeep = () => {
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
  };

  const triggerAlarm = (r) => {
    if (r.soundData) {
      try {
        const audio = new Audio(r.soundData);
        audio.loop = true;
        audio.volume = 0.8;
        audio.play().catch(() => {
          playBeep();
          beepIntervalRef.current = setInterval(playBeep, 1500);
        });
        audioRef.current = audio;
      } catch {
        playBeep();
        beepIntervalRef.current = setInterval(playBeep, 1500);
      }
    } else {
      playBeep();
      beepIntervalRef.current = setInterval(playBeep, 1500);
    }
    setActiveAlarm(r);
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (beepIntervalRef.current) {
      clearInterval(beepIntervalRef.current);
      beepIntervalRef.current = null;
    }

    if (activeAlarm) {
      try {
        let reminders = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        reminders = reminders.map(r => r.id === activeAlarm.id ? { ...r, enabled: false } : r);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
        window.dispatchEvent(new Event('pokus-reminders-updated'));
      } catch (e) {}
    }

    setActiveAlarm(null);
  };

  if (!activeAlarm) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-8 text-center shadow-[0_0_60px_rgba(16,185,129,0.2)] max-w-sm w-full animate-slide-up">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Bell className="w-10 h-10 text-emerald-400 animate-bounce" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-3">Waktunya Tiba!</h2>
        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
          {activeAlarm.message}
        </p>
        <button 
          onClick={stopAlarm}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Matikan Alarm
        </button>
      </div>
    </div>
  );
}
