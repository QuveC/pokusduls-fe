import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Music, Upload, X, Volume2, VolumeX } from 'lucide-react';

// ── Mode color themes ─────────────────────────────────────────────────────────
const modeTheme = {
  pomodoro: {
    gradient:  'from-emerald-500 to-teal-600',
    bar:       '#10b981',
    icon:      'text-emerald-400',
    iconBg:    'bg-emerald-500/20',
    active:    'bg-emerald-500/10 border-emerald-500/30',
    activeIcon:'text-emerald-400',
    shadow:    'shadow-emerald-500/20',
    upload:    'from-emerald-500 to-teal-600',
    uploadShadow: 'hover:shadow-emerald-500/20',
  },
  feynman: {
    gradient:  'from-cyan-500 to-blue-600',
    bar:       '#06b6d4',
    icon:      'text-cyan-400',
    iconBg:    'bg-cyan-500/20',
    active:    'bg-cyan-500/10 border-cyan-500/30',
    activeIcon:'text-cyan-400',
    shadow:    'shadow-cyan-500/20',
    upload:    'from-cyan-500 to-blue-600',
    uploadShadow: 'hover:shadow-cyan-500/20',
  },
  'active-recall': {
    gradient:  'from-purple-500 to-pink-600',
    bar:       '#a855f7',
    icon:      'text-purple-400',
    iconBg:    'bg-purple-500/20',
    active:    'bg-purple-500/10 border-purple-500/30',
    activeIcon:'text-purple-400',
    shadow:    'shadow-purple-500/20',
    upload:    'from-purple-500 to-pink-600',
    uploadShadow: 'hover:shadow-purple-500/20',
  },
};

export default function MusicPlayer({ mode = 'pomodoro' }) {
  const theme = modeTheme[mode] || modeTheme.pomodoro;

  const [tracks, setTracks] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDur  = () => setDuration(audio.duration);
    const handleEnd  = () => handleNext();
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDur);
    audio.addEventListener('ended', handleEnd);
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDur);
      audio.removeEventListener('ended', handleEnd);
    };
  }, [currentTrackIndex, repeatMode, isShuffle]);

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files) return;
    const newTracks = Array.from(files).map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      name: f.name.replace(/\.[^/.]+$/, ''),
      file: f,
      url: URL.createObjectURL(f),
    }));
    setTracks(prev => [...prev, ...newTracks]);
    e.target.value = '';
  };

  const handleRemoveTrack = (id) => {
    setTracks(prev => {
      const idx = prev.findIndex(t => t.id === id);
      const next = prev.filter(t => t.id !== id);
      if (currentTrackIndex === idx) {
        setIsPlaying(false); setCurrentTrackIndex(null);
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
      } else if (currentTrackIndex !== null && idx < currentTrackIndex) {
        setCurrentTrackIndex(currentTrackIndex - 1);
      }
      return next;
    });
  };

  const handlePlayTrack = (index) => {
    if (currentTrackIndex === index && isPlaying) { setIsPlaying(false); audioRef.current?.pause(); }
    else if (currentTrackIndex === index && !isPlaying) { setIsPlaying(true); audioRef.current?.play(); }
    else {
      setCurrentTrackIndex(index); setIsPlaying(true);
      if (audioRef.current) { audioRef.current.src = tracks[index].url; audioRef.current.play(); }
    }
  };

  const handlePlayPause = () => {
    if (!tracks.length) return;
    if (currentTrackIndex === null) { handlePlayTrack(0); return; }
    if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); }
    else { audioRef.current?.play(); setIsPlaying(true); }
  };

  const handleNext = () => {
    if (!tracks.length) return;
    if (repeatMode === 'one' && currentTrackIndex !== null) {
      if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play(); } return;
    }
    let next;
    if (isShuffle) next = Math.floor(Math.random() * tracks.length);
    else if (currentTrackIndex === null || currentTrackIndex >= tracks.length - 1) {
      if (repeatMode === 'all') next = 0; else { setIsPlaying(false); return; }
    } else next = currentTrackIndex + 1;
    handlePlayTrack(next);
  };

  const handlePrev = () => {
    if (!tracks.length) return;
    if (currentTrackIndex === null) handlePlayTrack(tracks.length - 1);
    else if (currentTrackIndex === 0) handlePlayTrack(tracks.length - 1);
    else handlePlayTrack(currentTrackIndex - 1);
  };

  const handleSeek = (e) => {
    const t = parseFloat(e.target.value);
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  };

  const fmt = (s) => { if (isNaN(s)) return '0:00'; return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`; };
  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;
  const pct = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-xl overflow-hidden">
      <audio ref={audioRef} />

      {/* Header / Now Playing */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-9 h-9 ${theme.iconBg} rounded-xl flex items-center justify-center`}>
            <Music className={`w-4 h-4 ${theme.icon}`} />
          </div>
          <h3 className="text-white font-semibold">Pemutar Musik</h3>
        </div>

        {currentTrack ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-slate-700/60 rounded-xl flex items-center justify-center shrink-0">
                <Music className={`w-7 h-7 ${theme.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-white font-medium text-sm">{currentTrack.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">{currentTrackIndex + 1} / {tracks.length}</p>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-1">
              <input type="range" min="0" max={duration || 0} value={currentTime} onChange={handleSeek}
                className="w-full"
                style={{ background: `linear-gradient(to right, ${theme.bar} ${pct}%, #334155 ${pct}%)`, height: '6px', borderRadius: '9999px' }}
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>{fmt(currentTime)}</span><span>{fmt(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 rounded-lg transition-colors ${isShuffle ? `${theme.iconBg} ${theme.icon}` : 'text-slate-400 hover:bg-slate-700/50'}`}>
                <Shuffle className="w-4 h-4" />
              </button>
              <button onClick={handlePrev} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-white">
                <SkipBack className="w-5 h-5" />
              </button>
              <button onClick={handlePlayPause}
                className={`p-3.5 bg-gradient-to-br ${theme.gradient} text-white rounded-full hover:scale-105 transition-transform shadow-lg ${theme.shadow}`}>
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button onClick={handleNext} className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-white">
                <SkipForward className="w-5 h-5" />
              </button>
              <button onClick={() => setRepeatMode(r => r === 'off' ? 'all' : r === 'all' ? 'one' : 'off')}
                className={`p-2 rounded-lg transition-colors relative ${repeatMode !== 'off' ? `${theme.iconBg} ${theme.icon}` : 'text-slate-400 hover:bg-slate-700/50'}`}>
                <Repeat className="w-4 h-4" />
                {repeatMode === 'one' && (
                  <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 bg-gradient-to-br ${theme.gradient} text-white rounded-full flex items-center justify-center text-[9px] font-bold`}>1</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Music className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-slate-400 text-sm">Belum ada musik yang diputar</p>
          </div>
        )}
      </div>

      {/* Volume */}
      <div className="px-5 py-3 bg-slate-800/30 border-b border-slate-700/40">
        <div className="flex items-center gap-3">
          <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
          <input type="range" min="0" max="1" step="0.01" value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1"
            style={{ background: `linear-gradient(to right, ${theme.bar} ${volume*100}%, #334155 ${volume*100}%)`, height: '6px', borderRadius: '9999px' }}
          />
          <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 w-9 text-right shrink-0">{Math.round(volume*100)}%</span>
        </div>
      </div>

      {/* Playlist */}
      <div className="p-5">
        <input ref={fileInputRef} type="file" accept="audio/*" multiple onChange={handleFileSelect} className="hidden" />
        <button id="btn-add-music" onClick={() => fileInputRef.current?.click()}
          className={`w-full py-2.5 px-4 bg-gradient-to-r ${theme.upload} text-white rounded-xl flex items-center justify-center gap-2 hover:shadow-lg ${theme.uploadShadow} transition-all mb-3 text-sm font-medium`}>
          <Upload className="w-4 h-4" /> Tambah Musik
        </button>

        {tracks.length > 0 ? (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {tracks.map((track, i) => (
              <div key={track.id}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all border ${
                  currentTrackIndex === i
                    ? theme.active
                    : 'bg-slate-700/30 border-slate-700/50 hover:bg-slate-700/50'
                }`}>
                <button onClick={() => handlePlayTrack(i)}
                  className="shrink-0 w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-600 transition-colors">
                  {currentTrackIndex === i && isPlaying
                    ? <Pause className={`w-4 h-4 ${theme.activeIcon}`} />
                    : <Play  className={`w-4 h-4 ${theme.activeIcon}`} />
                  }
                </button>
                <p className="flex-1 truncate text-sm text-white">{track.name}</p>
                <button onClick={() => handleRemoveTrack(track.id)}
                  className="shrink-0 w-7 h-7 hover:bg-red-500/20 rounded-lg flex items-center justify-center transition-colors">
                  <X className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500">
            <Music className="w-10 h-10 mx-auto mb-2 text-slate-600" />
            <p className="text-sm text-slate-400">Belum ada musik</p>
            <p className="text-xs mt-1 text-slate-500">Klik tombol di atas untuk menambahkan</p>
          </div>
        )}
      </div>
    </div>
  );
}
