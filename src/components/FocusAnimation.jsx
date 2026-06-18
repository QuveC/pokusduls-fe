import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

function PotSVG() {
  return (
    <svg viewBox="0 0 200 68" width="100%" height="100%" style={{ display: 'block' }}>
      {}
      <ellipse cx="100" cy="63" rx="52" ry="7"   fill="#78350f" />
      <ellipse cx="100" cy="61" rx="50" ry="6"   fill="#92400e" />
      <ellipse cx="100" cy="59" rx="48" ry="5.5" fill="#b45309" />
      <ellipse cx="100" cy="58" rx="40" ry="3"   fill="#ca8a04" opacity="0.25" />

      {}
      <path
        d="M70 20 Q66 44 68 58 Q82 66 100 66 Q118 66 132 58 Q134 44 130 20Z"
        fill="#c2410c"
      />
      {}
      <path d="M127 22 Q131 44 130 56 Q133 40 130 22Z" fill="#991b1b" opacity="0.55" />
      {}
      <path d="M73 22 Q69 44 70 56 Q68 40 71 22Z" fill="#f97316" opacity="0.25" />
      {}
      <path
        d="M71 43 Q100 47 129 43 Q100 39 71 43Z"
        fill="#991b1b" opacity="0.3"
        stroke="#b91c1c" strokeWidth="0.5"
      />
      {}
      <ellipse cx="80" cy="38" rx="4.5" ry="13" fill="white" opacity="0.06"
        transform="rotate(-8,80,38)" />

      {}
      <path
        d="M61 11 Q60 23 70 23 Q85 25 100 25 Q115 25 130 23 Q140 23 139 11 Q132 4 100 4 Q68 4 61 11Z"
        fill="#ea580c"
      />
      {}
      <ellipse cx="100" cy="10" rx="40" ry="8"   fill="#f97316" />
      {}
      <ellipse cx="100" cy="8"  rx="33" ry="6.5" fill="#7c1d00" />

      {}
      <ellipse cx="100" cy="7"  rx="31" ry="5.5" fill="#1c0a00" />
      {}
      <ellipse cx="87"  cy="6"  rx="9"  ry="2.2" fill="#292524" opacity="0.9" />
      <ellipse cx="113" cy="7"  rx="7"  ry="1.8" fill="#292524" opacity="0.7" />
      <ellipse cx="100" cy="9"  rx="5"  ry="1.4" fill="#44403c" opacity="0.6" />
      <ellipse cx="94"  cy="5"  rx="3"  ry="1"   fill="#57534e" opacity="0.5" />
    </svg>
  );
}

function OakTree({ progress: p }) {
  return (
    <svg viewBox="0 0 200 160" width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="oak-g" cx="38%" cy="33%" r="62%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="55%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#14532d" />
        </radialGradient>
        <radialGradient id="oak-hi" cx="28%" cy="28%" r="55%">
          <stop offset="0%" stopColor="#86efac" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#86efac" stopOpacity="0" />
        </radialGradient>
      </defs>
      {}
      <path d="M93 160 C91 144 90 128 92 116 Q100 105 108 116 C110 128 109 144 107 160Z" fill="#92400e" />
      <path d="M97 155 C96 141 96 128 98 118 Q100 112 102 118 C104 128 104 141 103 155Z" fill="#a16207" opacity="0.35" />
      {}
      <circle cx="100" cy="88" r="56" fill="url(#oak-g)" />
      <circle cx="66"  cy="102" r="35" fill="#16a34a" opacity="0.9" />
      <circle cx="134" cy="97"  r="32" fill="#16a34a" opacity="0.9" />
      <circle cx="100" cy="61"  r="36" fill="#22c55e" opacity="0.75" />
      <circle cx="120" cy="83"  r="25" fill="#22c55e" opacity="0.65" />
      <circle cx="80"  cy="79"  r="23" fill="#22c55e" opacity="0.65" />
      <circle cx="87"  cy="70"  r="30" fill="url(#oak-hi)" />
      {}
      {p >= 70 && (<>
        <circle cx="74"  cy="97" r="6"   fill="#dc2626" />
        <ellipse cx="72" cy="95" rx="2.5" ry="2" fill="#fca5a5" opacity="0.7" />
        <rect x="73" y="91" width="2" height="3" rx="1" fill="#78350f" />
        <circle cx="124" cy="91" r="5.5" fill="#dc2626" />
        <ellipse cx="122" cy="89" rx="2.2" ry="1.8" fill="#fca5a5" opacity="0.7" />
        <rect x="123" y="85" width="2" height="3" rx="1" fill="#78350f" />
        <circle cx="97"  cy="53" r="6"   fill="#dc2626" />
        <ellipse cx="95" cy="51" rx="2.5" ry="2" fill="#fca5a5" opacity="0.7" />
        <rect x="96" y="47" width="2" height="3" rx="1" fill="#78350f" />
      </>)}
    </svg>
  );
}

function SakuraTree({ progress: p }) {
  return (
    <svg viewBox="0 0 200 160" width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        <radialGradient id="sak-g" cx="40%" cy="34%" r="63%">
          <stop offset="0%" stopColor="#fdf2f8" />
          <stop offset="45%" stopColor="#fbcfe8" />
          <stop offset="100%" stopColor="#be185d" stopOpacity="0.9" />
        </radialGradient>
      </defs>
      {}
      <path d="M97 160 C96 147 95 133 96 123 Q100 113 104 123 C105 133 104 147 103 160Z" fill="#78350f" />
      <path d="M99 154 C98 142 98 131 99 124 Q100 119 101 124 C102 131 102 142 101 154Z" fill="#a16207" opacity="0.28" />
      {}
      <path d="M100 127 Q76 116 54 106" stroke="#78350f" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M100 125 Q124 113 146 104" stroke="#78350f" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M99 119 Q86 98 82 74"    stroke="#92400e" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M101 119 Q114 98 118 76"  stroke="#92400e" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M54 106 Q47 98 51 86"    stroke="#92400e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M146 104 Q153 96 149 85"  stroke="#92400e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {}
      <circle cx="100" cy="79" r="44" fill="url(#sak-g)" opacity="0.94" />
      <circle cx="65"  cy="94" r="32" fill="#fbcfe8" opacity="0.92" />
      <circle cx="135" cy="90" r="30" fill="#fbcfe8" opacity="0.92" />
      <circle cx="83"  cy="66" r="27" fill="#f9a8d4" opacity="0.88" />
      <circle cx="117" cy="71" r="25" fill="#f9a8d4" opacity="0.88" />
      <circle cx="100" cy="55" r="29" fill="#fce7f3" opacity="0.85" />
      <circle cx="50"  cy="90" r="21" fill="#fce7f3" opacity="0.82" />
      <circle cx="150" cy="87" r="19" fill="#fce7f3" opacity="0.82" />
      {[[72,91,7],[124,87,6.5],[93,48,7],[55,87,6],[145,83,5.5],[83,105,5.5],[115,101,6],[100,108,5]].map(([cx,cy,r],i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="white" opacity="0.48" />
      ))}
      {p >= 80 && [[60,105],[100,47],[140,101],[81,57],[119,59]].map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="3"   fill="#fdf4ff" opacity="0.9" />
          <circle cx={cx} cy={cy} r="1.5" fill="white" />
        </g>
      ))}
      <circle cx="100" cy="72" r="22" fill="#fdf4ff" opacity="0.18" />
    </svg>
  );
}

function PineTree({ progress: p }) {
  const snow = p >= 58;
  const star = p >= 65;
  return (
    <svg viewBox="0 0 200 160" width="100%" height="100%" style={{ display: 'block' }}>
      {}
      <rect x="93" y="130" width="14" height="30" rx="5" fill="#92400e" />
      <rect x="97" y="133" width="5"  height="25" rx="2.5" fill="#a16207" opacity="0.38" />
      {}
      <polygon points="100,112 45,152 155,152" fill="#14532d" opacity="0.55" />
      <polygon points="100,107 47,150 153,150" fill="#15803d" />
      <polygon points="100,107 47,128 100,128" fill="#22c55e" opacity="0.28" />
      <line x1="100" y1="107" x2="78"  y2="128" stroke="#4ade80" strokeWidth="1.5" opacity="0.35" />
      <line x1="100" y1="107" x2="122" y2="128" stroke="#4ade80" strokeWidth="1.5" opacity="0.35" />
      {}
      <polygon points="100,80 55,124 145,124" fill="#14532d" opacity="0.55" />
      <polygon points="100,75 57,121 143,121" fill="#16a34a" />
      <polygon points="100,75 57,96 100,96"   fill="#22c55e" opacity="0.28" />
      <line x1="100" y1="75" x2="77"  y2="97" stroke="#4ade80" strokeWidth="1.5" opacity="0.35" />
      <line x1="100" y1="75" x2="123" y2="97" stroke="#4ade80" strokeWidth="1.5" opacity="0.35" />
      {}
      <polygon points="100,46 65,92 135,92" fill="#14532d" opacity="0.5" />
      <polygon points="100,41 67,89 133,89" fill="#22c55e" />
      <polygon points="100,41 67,63 100,63"  fill="#4ade80" opacity="0.32" />
      {}
      {snow && (<>
        <polygon points="100,41 67,58 133,58"  fill="white" opacity="0.82" />
        <polygon points="100,75 57,92 143,92"  fill="white" opacity="0.72" />
        <polygon points="100,107 47,125 153,125" fill="white" opacity="0.62" />
      </>)}
      {}
      {star && (
        <polygon
          points="100,26 103,37 115,37 106,44 109,56 100,49 91,56 94,44 85,37 97,37"
          fill="#fbbf24"
          style={{ filter: 'drop-shadow(0 0 6px rgba(251,191,36,0.7))' }}
        />
      )}
    </svg>
  );
}

function CactusTree({ progress: p }) {
  const armP  = Math.max(0, (p - 35) / 65);
  const arms  = armP > 0;
  const lx    = 88 - armP * 28;
  const rx    = 112 + armP * 28;
  const bloom = p >= 80;
  return (
    <svg viewBox="0 0 200 160" width="100%" height="100%" style={{ display: 'block' }}>
      {}
      {arms && (<>
        <path d={`M90 108 Q${lx+8} 112 ${lx} 104 Q${lx-3} 96 ${lx+12} 92`}
          stroke="#15803d" strokeWidth="17" fill="none" strokeLinecap="round" />
        <path d={`M90 108 Q${lx+8} 112 ${lx} 104 Q${lx-3} 96 ${lx+12} 92`}
          stroke="#22c55e" strokeWidth="5"  fill="none" strokeLinecap="round" opacity="0.38" />
        <line x1={lx-2} y1="100" x2={lx-8} y2="97"  stroke="#d1fae5" strokeWidth="1.5" />
        <line x1={lx+2} y1="108" x2={lx-4} y2="106" stroke="#d1fae5" strokeWidth="1.5" />
        <path d={`M110 116 Q${rx-8} 120 ${rx} 112 Q${rx+3} 104 ${rx-12} 100`}
          stroke="#15803d" strokeWidth="17" fill="none" strokeLinecap="round" />
        <path d={`M110 116 Q${rx-8} 120 ${rx} 112 Q${rx+3} 104 ${rx-12} 100`}
          stroke="#22c55e" strokeWidth="5"  fill="none" strokeLinecap="round" opacity="0.38" />
        <line x1={rx+2} y1="108" x2={rx+8} y2="105" stroke="#d1fae5" strokeWidth="1.5" />
        <line x1={rx-2} y1="115" x2={rx+4} y2="113" stroke="#d1fae5" strokeWidth="1.5" />
      </>)}
      {}
      <rect x="85" y="60" width="30" height="100" rx="15" fill="#16a34a" />
      <rect x="92" y="66" width="9"  height="88"  rx="4.5" fill="#22c55e" opacity="0.4" />
      {}
      {[78,93,108,123,138].map((y,i) => (
        <g key={i}>
          <line x1="83"  y1={y} x2="77"  y2={y-3} stroke="#d1fae5" strokeWidth="1.5" />
          <line x1="117" y1={y} x2="123" y2={y-3} stroke="#d1fae5" strokeWidth="1.5" />
        </g>
      ))}
      {}
      {bloom && (<>
        {[0,60,120,180,240,300].map((deg,i) => (
          <ellipse key={i}
            cx={100 + 10 * Math.cos(deg * Math.PI / 180)}
            cy={58  +  7 * Math.sin(deg * Math.PI / 180)}
            rx="6" ry="5" fill="#fbbf24" />
        ))}
        <circle cx="100" cy="58" r="6"   fill="#fef3c7" />
        <circle cx="100" cy="58" r="2.5" fill="#f59e0b" />
        {arms && (<>
          <circle cx={lx+10} cy="90" r="8"   fill="#f472b6" />
          <circle cx={lx+10} cy="90" r="3.5" fill="#fdf2f8" />
          <circle cx={rx-10} cy="98" r="8"   fill="#f472b6" />
          <circle cx={rx-10} cy="98" r="3.5" fill="#fdf2f8" />
        </>)}
      </>)}
    </svg>
  );
}

export default function FocusAnimation({ progress, treeType = 'oak' }) {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const handleVis = () => {
      if (document.hidden) setShowWarning(true);
      else setTimeout(() => setShowWarning(false), 3000);
    };
    document.addEventListener('visibilitychange', handleVis);
    return () => document.removeEventListener('visibilitychange', handleVis);
  }, []);

  const p = Math.min(Math.max(progress, 0), 100);

  const getMessage = () => {
    if (p < 15) return '🌱 Tunas muncul dari pot...';
    if (p < 40) return '🌿 Tanaman mulai berkembang!';
    if (p < 65) return '🌳 Tumbuh semakin tinggi!';
    if (p < 88) return '✨ Hampir sempurna!';
    return '🌸 Pohon berbunga! Luar biasa!';
  };

  const glowColor = {
    oak:    'rgba(52,211,153,0.07)',
    sakura: 'rgba(244,114,182,0.08)',
    pine:   'rgba(52,211,153,0.06)',
    cactus: 'rgba(163,230,53,0.07)',
  }[treeType] || 'rgba(52,211,153,0.07)';

  const trees = { oak: OakTree, sakura: SakuraTree, pine: PineTree, cactus: CactusTree };
  const TreeComponent = trees[treeType] || OakTree;

  return (
    <div className="space-y-3">

      {}
      {showWarning && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-3 animate-pulse">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 text-sm font-medium">Fokus terganggu!</p>
            <p className="text-slate-400 text-xs">Tetap di halaman ini untuk menjaga kemajuan.</p>
          </div>
        </div>
      )}

      {}
      <div style={{
        position: 'relative',
        height: 224,
        borderRadius: 18,
        overflow: 'hidden',
        border: '1px solid rgba(148,163,184,0.10)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}>

        {}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(165deg, #1a1630 0%, #141e36 50%, #0d1a2e 100%)',
        }} />

        {}
        <div style={{
          position: 'absolute',
          top: -30, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          transition: 'background 0.5s ease',
        }} />

        {}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.008) 40px, rgba(255,255,255,0.008) 41px)',
        }} />

        {}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 32,
          background: 'linear-gradient(to top, #1c2537, #263348)',
        }} />
        {}
        <div style={{
          position: 'absolute', bottom: 30, left: 0, right: 0, height: 3,
          background: 'linear-gradient(to right, transparent 5%, rgba(148,163,184,0.22) 30%, rgba(203,213,225,0.35) 50%, rgba(148,163,184,0.22) 70%, transparent 95%)',
        }} />
        {}
        <div style={{
          position: 'absolute', bottom: 26, left: '30%', right: '30%', height: 18,
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.05), transparent 70%)',
        }} />

        <div style={{
          position: 'absolute',
          bottom: 88,   
          left: '12%',
          right: '12%',
          top: 12,
          zIndex: 1,
          clipPath: `inset(${Math.max(0, 100 - p)}% 0 0 0)`,
          transition: 'clip-path 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <TreeComponent progress={p} />
        </div>

        <div style={{
          position: 'absolute',
          bottom: 30,   
          left: 0,
          right: 0,
          height: 72,
          zIndex: 3,
        }}>
          <PotSVG />
        </div>

        {}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '5px 14px 8px',
          background: 'linear-gradient(to top, rgba(8,12,28,0.96) 55%, transparent)',
          display: 'flex', alignItems: 'center', gap: 10,
          zIndex: 5,
        }}>
          <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 9999, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${p}%`,
              background: 'linear-gradient(to right, #10b981, #2dd4bf)',
              borderRadius: 9999,
              transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 0 8px rgba(16,185,129,0.65)',
            }} />
          </div>
          <span style={{
            color: '#34d399', fontSize: 11, fontWeight: 700,
            minWidth: 34, textAlign: 'right', fontVariantNumeric: 'tabular-nums',
          }}>
            {Math.round(p)}%
          </span>
        </div>
      </div>

      {}
      <p className="text-emerald-300 text-sm font-medium px-1">{getMessage()}</p>

      {}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
        <p className="text-xs text-indigo-300/80 text-center">
          💡 Tetap fokus pada tab ini untuk melihat pohon tumbuh!
        </p>
      </div>
    </div>
  );
}
