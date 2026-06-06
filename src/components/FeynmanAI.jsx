import { useState, useRef, useCallback } from 'react';
import { marked } from 'marked';

/* ── Icons ───────────────────────────────────────────────────── */
const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const BookOpenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

/* ── Supported extensions ─────────────────────────────────────── */
const SUPPORTED_EXTENSIONS = ['.txt', '.pdf', '.docx', '.doc'];

function getFileExt(name) {
  return '.' + name.split('.').pop().toLowerCase();
}

function isSupported(name) {
  return SUPPORTED_EXTENSIONS.includes(getFileExt(name));
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/* ── Read file as text ────────────────────────────────────────── */
async function readFileContent(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve('[Gagal membaca file]');
    reader.readAsText(file, 'UTF-8');
  });
}

/* ── N8N fetch ────────────────────────────────────────────────── */
const N8N_WEBHOOK_URL = 'https://flounder-scarce-litter.ngrok-free.dev/webhook/study_assist';

async function fetchFromN8n(textInput, sessionId) {
  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420'
    },
    body: JSON.stringify({ chatInput: textInput, sessionId })
  });
  if (!response.ok) throw new Error('Network error');
  const data = await response.json();
  return data[0]?.output || data.output || "Tidak ada respon.";
}

/* ═══════════════════════════════════════════════════════════════
   FEYNMAN AI COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function FeynmanAI() {
  const [files, setFiles] = useState([]);          // { name, size, content }
  const [mode, setMode] = useState(null);          // 'summarize' | 'explain'
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const sessionId = useRef("feynman_" + Math.random().toString(36).substring(2, 9));

  /* ── File handling ── */
  const processFiles = useCallback(async (fileList) => {
    const validExt = Array.from(fileList).filter(f => isSupported(f.name));
    if (validExt.length === 0) {
      setError('Format tidak didukung. Gunakan: .txt, .pdf, .docx, .doc');
      return;
    }
    const validFiles = validExt.filter(f => f.size <= 2 * 1024 * 1024);
    if (validFiles.length < validExt.length) {
      setError('Beberapa file gagal diupload: Ukuran maksimal 2MB per file.');
      if (validFiles.length === 0) return;
    }
    setError('');

    const processed = await Promise.all(
      validFiles.map(async (f) => ({
        name: f.name,
        size: f.size,
        content: await readFileContent(f),
      }))
    );

    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...processed.filter(f => !names.has(f.name))];
    });
    setResult('');
    setMode(null);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const removeFile = (name) => {
    setFiles(prev => prev.filter(f => f.name !== name));
    if (files.length <= 1) { setResult(''); setMode(null); }
  };

  /* ── AI processing ── */
  const handleProcess = async (selectedMode) => {
    if (files.length === 0) return;
    setMode(selectedMode);
    setLoading(true);
    setResult('');
    setError('');

    const combined = files.map(f => `=== ${f.name} ===\n${f.content}`).join('\n\n');

    const prompt = selectedMode === 'summarize'
      ? `Berikut adalah isi materi dari beberapa file:\n\n${combined}\n\nTolong buat RANGKUMAN yang komprehensif, terstruktur, dan mudah dipahami. Gunakan poin-poin, heading, dan format yang rapi. Sertakan poin-poin kunci, konsep utama, dan kesimpulan.`
      : `Berikut adalah isi materi dari beberapa file:\n\n${combined}\n\nTolong JELASKAN materi ini dengan bahasa yang sangat sederhana, seolah-olah menjelaskan kepada seseorang yang baru pertama kali mempelajarinya. Gunakan analogi, contoh nyata, dan hindari istilah teknis yang sulit. Buat penjelasan mengalir dan mudah diikuti.`;

    try {
      const response = await fetchFromN8n(prompt, sessionId.current);
      setResult(response);
    } catch {
      setError('Gagal menghubungi AI. Periksa koneksi dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFiles([]);
    setResult('');
    setMode(null);
    setError('');
    sessionId.current = "feynman_" + Math.random().toString(36).substring(2, 9);
  };

  /* ── Styles ── */
  const S = {
    section: {
      background: 'rgba(6,182,212,0.04)',
      border: `1px solid ${isDragging ? 'rgba(6,182,212,0.5)' : 'rgba(6,182,212,0.15)'}`,
      borderRadius: '18px',
      padding: '24px',
      marginBottom: '16px',
      transition: 'all 0.18s ease',
    },
    label: {
      fontSize: '11px',
      fontWeight: 700,
      color: '#06b6d4',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
  };

  return (
    <div>
      {/* ── Section Title ── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(16,185,129,0.08))',
          border: '1px solid rgba(6,182,212,0.2)',
          borderRadius: '16px', padding: '14px 18px',
        }}>
          <div style={{
            width: '38px', height: '38px',
            background: 'linear-gradient(135deg, #06b6d4, #10b981)',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(6,182,212,0.3)',
            flexShrink: 0,
          }}>
            <SparkleIcon />
          </div>
          <div>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '15px', margin: 0 }}>
              AI Rangkuman Materi
            </h3>
            <p style={{ color: '#64748b', fontSize: '12px', margin: '2px 0 0' }}>
              Upload file materi → pilih mode → biarkan AI bekerja
            </p>
          </div>
        </div>
      </div>

      {/* ── Upload Zone ── */}
      <div
        style={{
          ...S.section,
          borderStyle: isDragging ? 'solid' : 'dashed',
          background: isDragging ? 'rgba(6,182,212,0.08)' : S.section.background,
          cursor: 'pointer',
          textAlign: 'center',
        }}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.pdf,.docx,.doc"
          style={{ display: 'none' }}
          onChange={(e) => processFiles(e.target.files)}
        />

        <div style={{
          width: '52px', height: '52px',
          background: isDragging ? 'rgba(6,182,212,0.2)' : 'rgba(6,182,212,0.08)',
          border: '1px solid rgba(6,182,212,0.25)',
          borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
          color: '#06b6d4',
          transition: 'all 0.18s ease',
        }}>
          <UploadIcon />
        </div>

        <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
          {isDragging ? 'Lepaskan file di sini' : 'Klik atau drag & drop file'}
        </p>
        <p style={{ color: '#475569', fontSize: '12px' }}>
          Didukung: TXT, PDF, DOCX, DOC (Maks 2MB)
        </p>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '12px',
          padding: '11px 14px',
          color: '#f87171',
          fontSize: '13px',
          marginBottom: '14px',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* ── File List ── */}
      {files.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ ...S.label }}>
            <FileIcon /> {files.length} File Dipilih
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {files.map((f) => (
              <div key={f.name} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
                padding: '10px 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{
                    width: '32px', height: '32px',
                    background: 'rgba(6,182,212,0.1)',
                    border: '1px solid rgba(6,182,212,0.2)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#06b6d4', flexShrink: 0,
                  }}>
                    <FileIcon />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </p>
                    <p style={{ color: '#475569', fontSize: '11px', margin: '1px 0 0' }}>
                      {formatSize(f.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(f.name); }}
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: '8px',
                    color: '#f87171',
                    padding: '6px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0,
                    transition: 'all 0.15s ease',
                  }}
                  title="Hapus file"
                >
                  <CloseIcon />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Mode Selection ── */}
      {files.length > 0 && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          {/* Summarize */}
          <button
            onClick={() => handleProcess('summarize')}
            style={{
              background: mode === 'summarize'
                ? 'linear-gradient(135deg, #06b6d4, #0891b2)'
                : 'rgba(6,182,212,0.08)',
              border: `1px solid ${mode === 'summarize' ? '#06b6d4' : 'rgba(6,182,212,0.2)'}`,
              borderRadius: '16px',
              padding: '16px 14px',
              color: mode === 'summarize' ? 'white' : '#06b6d4',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              boxShadow: mode === 'summarize' ? '0 6px 20px rgba(6,182,212,0.3)' : 'none',
            }}
            onMouseEnter={e => { if (mode !== 'summarize') e.currentTarget.style.background = 'rgba(6,182,212,0.14)'; }}
            onMouseLeave={e => { if (mode !== 'summarize') e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; }}
          >
            <SparkleIcon />
            <div>
              <p style={{ fontWeight: 700, fontSize: '13px', margin: 0 }}>Rangkum Materi</p>
              <p style={{ fontSize: '11px', margin: '2px 0 0', opacity: 0.75 }}>Poin-poin penting</p>
            </div>
          </button>

          {/* Explain Simply */}
          <button
            onClick={() => handleProcess('explain')}
            style={{
              background: mode === 'explain'
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'rgba(16,185,129,0.08)',
              border: `1px solid ${mode === 'explain' ? '#10b981' : 'rgba(16,185,129,0.2)'}`,
              borderRadius: '16px',
              padding: '16px 14px',
              color: mode === 'explain' ? 'white' : '#10b981',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              boxShadow: mode === 'explain' ? '0 6px 20px rgba(16,185,129,0.3)' : 'none',
            }}
            onMouseEnter={e => { if (mode !== 'explain') e.currentTarget.style.background = 'rgba(16,185,129,0.14)'; }}
            onMouseLeave={e => { if (mode !== 'explain') e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; }}
          >
            <BookOpenIcon />
            <div>
              <p style={{ fontWeight: 700, fontSize: '13px', margin: 0 }}>Jelaskan Sederhana</p>
              <p style={{ fontSize: '11px', margin: '2px 0 0', opacity: 0.75 }}>Bahasa mudah dipahami</p>
            </div>
          </button>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{
          background: 'rgba(6,182,212,0.05)',
          border: '1px solid rgba(6,182,212,0.15)',
          borderRadius: '18px',
          padding: '32px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '48px', height: '48px',
            border: '3px solid rgba(6,182,212,0.15)',
            borderTopColor: '#06b6d4',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#06b6d4', fontWeight: 600, fontSize: '14px', margin: '0 0 4px' }}>
            AI sedang memproses materi...
          </p>
          <p style={{ color: '#475569', fontSize: '12px', margin: 0 }}>
            {mode === 'summarize' ? 'Membuat rangkuman komprehensif' : 'Menyederhanakan penjelasan'}
          </p>
        </div>
      )}

      {/* ── Result ── */}
      {result && !loading && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '18px',
          overflow: 'hidden',
        }}>
          {/* Result header */}
          <div style={{
            background: mode === 'summarize'
              ? 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(8,145,178,0.08))'
              : 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.08))',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {mode === 'summarize' ? <SparkleIcon /> : <BookOpenIcon />}
              <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '14px' }}>
                {mode === 'summarize' ? 'Hasil Rangkuman' : 'Penjelasan Sederhana'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCopy}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: copied ? '#10b981' : '#94a3b8',
                  padding: '7px 12px',
                  fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
              >
                <CopyIcon />
                {copied ? 'Tersalin!' : 'Salin'}
              </button>
              <button
                onClick={() => handleProcess(mode)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  padding: '7px 12px',
                  fontSize: '12px', fontWeight: 600, fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                }}
              >
                <RefreshIcon /> Ulang
              </button>
            </div>
          </div>

          {/* Result content */}
          <div
            style={{
              padding: '20px 22px',
              color: '#cbd5e1',
              fontSize: '14px',
              lineHeight: 1.8,
              maxHeight: '380px',
              overflowY: 'auto',
            }}
            dangerouslySetInnerHTML={{ __html: marked.parse(result) }}
          />
        </div>
      )}

      {/* ── Reset button ── */}
      {(files.length > 0 || result) && !loading && (
        <button
          onClick={handleReset}
          style={{
            marginTop: '14px',
            width: '100%',
            padding: '11px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            color: '#475569',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: 'inherit',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = '#64748b';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#475569';
          }}
        >
          ↺ Mulai Ulang
        </button>
      )}
    </div>
  );
}
