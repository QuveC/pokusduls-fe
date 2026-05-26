import { useState, useEffect, useRef } from 'react';
import {
  Camera, CameraOff, Eye, AlertCircle, CheckCircle2,
  Minimize2, Maximize2, Smartphone, ArrowLeftRight, UserX, Zap,
} from 'lucide-react';

const BACKEND_URL = 'http://127.0.0.1:8000/';
// Kirim frame ke backend setiap 800ms
const DETECT_INTERVAL_MS = 800;

export default function FocusDetectorMini({ isActive, onFocusChange, onDistractionDetected }) {
  const [isEnabled, setIsEnabled]           = useState(false);
  const [isFocused, setIsFocused]           = useState(true);
  const [error, setError]                   = useState(null);
  const [isMinimized, setIsMinimized]       = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const [detectionResult, setDetectionResult] = useState(null); // hasil lengkap dari backend
  const [backendOnline, setBackendOnline]   = useState(null);   // null=belum dicek, true/false

  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const streamRef   = useRef(null);
  const timerRef    = useRef(null);   // setInterval handle
  const lastFocusRef = useRef(true);
  const isDetecting  = useRef(false); // hindari request tumpang tindih

  // ── aktif/nonaktif mengikuti prop isActive ───────────────────────
  useEffect(() => {
    if (isActive && !isEnabled) startDetection();
    else if (!isActive && isEnabled) stopDetection();
  }, [isActive]);

  // ── cleanup saat unmount ─────────────────────────────────────────
  useEffect(() => () => stopDetection(), []);

  // ── cek apakah backend hidup ─────────────────────────────────────
  const checkBackend = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(3000) });
      setBackendOnline(res.ok);
      return res.ok;
    } catch {
      setBackendOnline(false);
      return false;
    }
  };

  // ── mulai kamera + loop deteksi ──────────────────────────────────
  const startDetection = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsEnabled(true);

      // cek backend
      const online = await checkBackend();
      if (!online) {
        setError('Backend tidak tersambung. Jalankan: uvicorn main:app --reload');
      }

      // mulai loop pengiriman frame
      timerRef.current = setInterval(sendFrame, DETECT_INTERVAL_MS);
    } catch {
      setError('Tidak bisa mengakses kamera');
    }
  };

  // ── hentikan kamera + loop ───────────────────────────────────────
  const stopDetection = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setIsEnabled(false);
    setIsFocused(true);
    setDistractionCount(0);
    setDetectionResult(null);
    setBackendOnline(null);
  };

  // ── capture frame → kirim ke backend ────────────────────────────
  const sendFrame = async () => {
    if (isDetecting.current) return;                      // skip jika request sebelumnya belum selesai
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    if (video.readyState < video.HAVE_ENOUGH_DATA) return;

    isDetecting.current = true;
    try {
      const canvas = canvasRef.current;
      const ctx    = canvas.getContext('2d');
      canvas.width  = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // ambil sebagai base64 JPEG (quality 0.85 agar lebih detail untuk YOLO)
      const base64 = canvas.toDataURL('image/jpeg', 0.85);

      const res = await fetch(`${BACKEND_URL}/monitoring/detect-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('YOLO backend response:', data);

      setDetectionResult(data);
      setBackendOnline(true);

      const focused = data.is_focused ?? true;
      if (focused !== lastFocusRef.current) {
        setIsFocused(focused);
        onFocusChange?.(focused);
        if (!focused) {
          setDistractionCount(p => p + 1);
          onDistractionDetected?.();
        }
        lastFocusRef.current = focused;
      }
    } catch (err) {
      console.error('sendFrame error:', err);
      // backend mati atau timeout → fallback ke pixel detection
      setBackendOnline(false);
      setError(err.message ?? 'Gagal menghubungi backend');
      fallbackPixelDetect();
    } finally {
      isDetecting.current = false;
    }
  };

  // ── fallback pixel-based (jika backend mati) ─────────────────────
  const fallbackPixelDetect = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current, canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || video.readyState < video.HAVE_ENOUGH_DATA) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const d   = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const cx  = canvas.width / 2, cy = canvas.height / 2;
    const r   = Math.min(canvas.width, canvas.height) / 4;
    let bri = 0, px = 0, skin = 0;
    for (let y = cy - r / 2; y < cy + r / 2; y++)
      for (let x = cx - r / 2; x < cx + r / 2; x++) {
        const i   = (Math.floor(y) * canvas.width + Math.floor(x)) * 4;
        const [rv, g, b] = [d[i], d[i + 1], d[i + 2]];
        bri += (rv + g + b) / 3; px++;
        if (rv > 95 && g > 40 && b > 20 && rv > g && rv > b && rv - g > 15) skin++;
      }
    const focused = (skin / px) > 0.1 && (bri / px) > 30 && (bri / px) < 230;
    if (focused !== lastFocusRef.current) {
      setIsFocused(focused); onFocusChange?.(focused);
      if (!focused) { setDistractionCount(p => p + 1); onDistractionDetected?.(); }
      lastFocusRef.current = focused;
    }
  };

  // ── helper label distraksi ───────────────────────────────────────
  const getDistractionLabel = () => {
    if (!detectionResult) return isFocused ? '✓ Wajah terdeteksi' : '✗ Tidak fokus';
    const t = detectionResult.distraction_type;
    if (t === 'phone')        return '📱 HP terdeteksi!';
    if (t === 'looking_side') return '👀 Menengok!';
    if (t === 'no_face')      return '❌ Wajah tidak ada';
    return '✓ Fokus';
  };

  const getDistractionIcon = () => {
    if (!detectionResult) return null;
    const t = detectionResult.distraction_type;
    if (t === 'phone')        return <Smartphone className="w-3 h-3" />;
    if (t === 'looking_side') return <ArrowLeftRight className="w-3 h-3" />;
    if (t === 'no_face')      return <UserX className="w-3 h-3" />;
    return null;
  };

  if (!isActive) return null;

  // ── RENDER ───────────────────────────────────────────────────────
  return (
    <div className="fixed bottom-20 right-4 z-40">

      {/* ── Mode minimized ── */}
      {isMinimized ? (
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-3 shadow-2xl">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isFocused ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {isFocused ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-slate-400 text-xs">Focus Monitor</p>
              <p className={`text-sm font-medium ${isFocused ? 'text-emerald-400' : 'text-red-400'}`}>
                {isFocused ? 'Fokus ✓' : 'Terdistraksi!'}
              </p>
            </div>
            <button onClick={() => setIsMinimized(false)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors ml-1">
              <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

      ) : (
        /* ── Mode expanded ── */
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden" style={{ width: '260px' }}>

          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-purple-500/20 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Eye className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h3 className="text-white text-xs font-semibold">Focus Monitor</h3>
                <div className="flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-yellow-400" />
                  <p className="text-yellow-400 text-[10px] font-medium">Powered by YOLO</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsMinimized(true)} className="p-1.5 hover:bg-slate-800/50 rounded-lg transition-colors">
              <Minimize2 className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Video feed */}
          <div className="relative bg-slate-950" style={{ aspectRatio: '4/3' }}>
            <video ref={videoRef} className={`w-full h-full object-cover ${!isEnabled ? 'hidden' : ''}`} playsInline muted />
            <canvas ref={canvasRef} className="hidden" />

            {!isEnabled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-4">
                  <CameraOff className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs">Kamera tidak aktif</p>
                  {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                </div>
              </div>
            )}

            {isEnabled && (
              <div className="absolute top-2 left-2 right-2 space-y-1">
                {/* Status badge */}
                <div className={`px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-xl border flex items-center gap-1.5 ${
                  isFocused
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-500/20 border-red-500/40 text-red-300'
                }`}>
                  {getDistractionIcon()}
                  {getDistractionLabel()}
                </div>

                {/* Yaw angle */}
                {detectionResult && (
                  <div className="space-y-0.5">
                    <div className="px-2 py-0.5 rounded-md text-[10px] bg-slate-900/70 border border-slate-700/50 text-slate-400 backdrop-blur-xl">
                      Yaw: <span className="text-white font-mono">{detectionResult.yaw ?? 0}°</span>
                      {detectionResult.phone_detected && (
                        <span className="ml-2 text-red-400 font-medium">📱 HP ({Math.round((detectionResult.phone_confidence ?? 0) * 100)}%)</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="px-4 py-3 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Status</span>
              <span className={`text-xs font-medium ${isFocused ? 'text-emerald-400' : 'text-red-400'}`}>
                {detectionResult?.status ?? (isFocused ? 'FOCUS' : 'DISTRACTION')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">Distraksi</span>
              <span className="text-xs text-white font-medium">{distractionCount}x</span>
            </div>
            {detectionResult && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs">Wajah</span>
                <span className={`text-xs font-medium ${detectionResult.face_detected ? 'text-emerald-400' : 'text-red-400'}`}>
                  {detectionResult.face_detected ? 'Terdeteksi' : 'Tidak ada'}
                </span>
              </div>
            )}
            {/* Tampilkan error dari backend jika ada */}
            {detectionResult?.error && (
              <div className="mt-1 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-[10px] break-all">⚠ {detectionResult.error}</p>
              </div>
            )}
          </div>

          {/* Toggle button */}
          <div className="px-4 pb-3">
            <button
              onClick={isEnabled ? stopDetection : startDetection}
              className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                isEnabled
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                  : 'bg-gradient-to-br from-purple-500 to-pink-600 text-white hover:shadow-lg'
              }`}
            >
              {isEnabled ? (
                <span className="flex items-center justify-center gap-1.5"><CameraOff className="w-3.5 h-3.5" /> Stop</span>
              ) : (
                <span className="flex items-center justify-center gap-1.5"><Camera className="w-3.5 h-3.5" /> Aktifkan</span>
              )}
            </button>
          </div>

          {/* Backend status */}
          <div className="px-4 pb-4">
            {backendOnline === false ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2">
                <p className="text-red-300/80 text-[10px] text-center">⚠ Backend offline – mode fallback aktif</p>
              </div>
            ) : backendOnline === true ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2">
                <p className="text-emerald-300/80 text-[10px] text-center">🟢 YOLO backend tersambung</p>
              </div>
            ) : (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-2">
                <p className="text-blue-300/80 text-[10px] text-center">🔒 Data diproses lokal di browser</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

