import { ExoBtn } from '../App';
import React, { useState, useEffect, useRef } from 'react';

// ── SPEEDOMETER SVG ───────────────────────────────────────────────────────────
function Speedometer({ speed }) {
  // speed 0-100 maps to -135deg to +135deg arc
  const angle = -135 + (speed / 100) * 270;
  const cx = 200, cy = 200, r = 160;

  // Needle tip
  const rad = (angle - 90) * Math.PI / 180;
  const nx  = cx + (r - 30) * Math.cos(rad);
  const ny  = cy + (r - 30) * Math.sin(rad);

  // Arc path helper
  const polarToXY = (deg, radius) => {
    const r2 = (deg - 90) * Math.PI / 180;
    return { x: cx + radius * Math.cos(r2), y: cy + radius * Math.sin(r2) };
  };

  const arcPath = (startDeg, endDeg, radius) => {
    const s = polarToXY(startDeg, radius);
    const e = polarToXY(endDeg, radius);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  // Tick marks
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const deg = -135 + i * 27;
    const inner = i % 5 === 0 ? r - 28 : r - 18;
    const s = polarToXY(deg, r - 4);
    const e = polarToXY(deg, inner);
    ticks.push({ s, e, major: i % 5 === 0, deg, val: i * 10 });
  }

  // Speed zone colors
  const greenEnd  = -135 + 0.6 * 270;   // 0-60%
  const yellowEnd = -135 + 0.8 * 270;   // 60-80%
  const redEnd    = -135 + 1.0 * 270;   // 80-100%

  return (
    <svg width="400" height="260" viewBox="0 0 400 260" style={{ overflow:'visible' }}>
      <defs>
        <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#252a3d"/>
          <stop offset="100%" stopColor="#0e1018"/>
        </radialGradient>
        <radialGradient id="needle-grad" cx="50%" cy="0%" r="100%">
          <stop offset="0%"   stopColor="#e8eaf0"/>
          <stop offset="100%" stopColor="#005da5"/>
        </radialGradient>
        <filter id="glow-green">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="glow-red">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="needle-glow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Outer bezel */}
      <circle cx={cx} cy={cy} r={r+14} fill="url(#bg-grad)" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
      {/* Inner face */}
      <circle cx={cx} cy={cy} r={r+2} fill="#141720" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>

      {/* Zone arcs */}
      <path d={arcPath(-135, greenEnd,  r-8)} fill="none" stroke="#22c55e"  strokeWidth="12" strokeLinecap="round" opacity="0.25"/>
      <path d={arcPath(greenEnd, yellowEnd, r-8)} fill="none" stroke="#f59e0b" strokeWidth="12" strokeLinecap="round" opacity="0.25"/>
      <path d={arcPath(yellowEnd, 135,   r-8)} fill="none" stroke="#ef4444"  strokeWidth="12" strokeLinecap="round" opacity="0.25"/>

      {/* Active arc up to current speed */}
      {speed > 0 && (() => {
        const currentDeg = -135 + (speed/100)*270;
        const activeColor = speed < 60 ? '#22c55e' : speed < 80 ? '#f59e0b' : '#ef4444';
        return <path d={arcPath(-135, currentDeg, r-8)} fill="none" stroke={activeColor} strokeWidth="12" strokeLinecap="round" opacity="0.9" filter={`url(#glow-${speed>=80?'red':'green'})`}/>;
      })()}

      {/* Tick marks */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={t.s.x} y1={t.s.y} x2={t.e.x} y2={t.e.y}
            stroke={t.major ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)'}
            strokeWidth={t.major ? 2 : 1} strokeLinecap="round"/>
          {t.major && (() => {
            const lp = polarToXY(t.deg, r - 44);
            return <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central"
              fontSize="11" fill="rgba(255,255,255,0.5)" fontFamily="DM Sans, sans-serif" fontWeight="600">
              {t.val}
            </text>;
          })()}
        </g>
      ))}

      {/* Needle shadow */}
      <line x1={cx} y1={cy} x2={nx+1} y2={ny+1}
        stroke="rgba(0,0,0,0.4)" strokeWidth="3" strokeLinecap="round" opacity="0.5"
        style={{ transformOrigin:`${cx}px ${cy}px`, transition:'all 0.8s cubic-bezier(0.34,1.2,0.64,1)' }}/>

      {/* Needle */}
      <line x1={cx} y1={cy} x2={nx} y2={ny}
        stroke="url(#needle-grad)" strokeWidth="2.5" strokeLinecap="round"
        filter="url(#needle-glow)"
        style={{ transformOrigin:`${cx}px ${cy}px`, transition:'all 0.8s cubic-bezier(0.34,1.2,0.64,1)' }}/>

      {/* Center hub */}
      <circle cx={cx} cy={cy} r="10" fill="#005da5" opacity="0.9"/>
      <circle cx={cx} cy={cy} r="5"  fill="#e8eaf0"/>

      {/* Speed value */}
      <text x={cx} y={cy+52} textAnchor="middle" fontSize="28" fontWeight="700"
        fill={speed >= 80 ? '#ef4444' : speed >= 60 ? '#f59e0b' : '#4ade80'}
        fontFamily="DM Sans, sans-serif">
        {Math.round(speed)}
      </text>
      <text x={cx} y={cy+70} textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.35)"
        fontFamily="DM Sans, sans-serif" fontWeight="600" letterSpacing="2">
        KM/H
      </text>
    </svg>
  );
}

// ── LOGIN FORM ────────────────────────────────────────────────────────────────
export function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [speed,    setSpeed]    = useState(0);
  const [showPass, setShowPass] = useState(false);
  const intervalRef = useRef(null);

  // Idle speedometer animation
  useEffect(() => {
    let t = 0;
    intervalRef.current = setInterval(() => {
      t += 0.03;
      const base = 18 + Math.sin(t) * 8 + Math.sin(t * 2.3) * 4;
      setSpeed(base);
    }, 50);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleLogin = async () => {
    if (!username || !password) { setError('Completa usuario y contraseña'); return; }
    setLoading(true);
    setError('');
    // Accelerate needle
    clearInterval(intervalRef.current);
    let s = 20;
    const accel = setInterval(() => { s = Math.min(s + 4, 92); setSpeed(s); }, 40);
    await new Promise(r => setTimeout(r, 900));
    clearInterval(accel);
    const result = onLogin(username, password);
    if (!result.ok) {
      // Brake
      let br = 92;
      const brake = setInterval(() => { br = Math.max(br - 6, 0); setSpeed(br); if(br<=0) clearInterval(brake); }, 40);
      setError(result.error);
      setLoading(false);
      // Restart idle
      setTimeout(() => {
        let t2 = 0;
        intervalRef.current = setInterval(() => {
          t2 += 0.03;
          setSpeed(18 + Math.sin(t2)*8 + Math.sin(t2*2.3)*4);
        }, 50);
      }, 1200);
    }
  };

  const handleKey = e => { if (e.key === 'Enter') handleLogin(); };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'radial-gradient(ellipse at 30% 40%, #1a1440 0%, #0e1018 60%, #0a0c14 100%)',
      padding:20, fontFamily:'DM Sans, sans-serif',
    }}>
      {/* Background glow */}
      <div style={{ position:'fixed', top:'20%', left:'50%', transform:'translateX(-50%)', width:600, height:400, background:'radial-gradient(ellipse, rgba(0,93,165,0.08) 0%, transparent 70%)', pointerEvents:'none' }}/>

      <div style={{ width:'100%', maxWidth:460, display:'flex', flexDirection:'column', alignItems:'center', gap:0 }}>

        {/* Speedometer */}
        <div style={{ width:400, display:'flex', justifyContent:'center', marginBottom:-20, position:'relative', zIndex:1 }}>
          <Speedometer speed={speed}/>
        </div>

        {/* Login card */}
        <div style={{
          background:'#1e2333',
          boxShadow:'-12px -12px 28px rgba(255,255,255,0.04), 12px 12px 32px rgba(0,0,0,0.7), 0 0 60px rgba(0,93,165,0.08)',
          border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:24, padding:'36px 36px 32px',
          width:'100%', position:'relative', zIndex:2,
        }}>
          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:12, marginBottom:8 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#005da5,#0077c8)', boxShadow:'0 0 20px rgba(0,93,165,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="3.5" fill="#fff"/>
                  <path d="M9 1v3M9 14v3M1 9h3M14 9h3M3.34 3.34l2.12 2.12M12.54 12.54l2.12 2.12M12.54 5.46l-2.12 2.12M5.46 12.54l-2.12 2.12" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ fontSize:26, fontWeight:700, letterSpacing:'0.04em', background:'linear-gradient(90deg,#60a5fa,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Exonver
              </div>
            </div>
            <div style={{ fontSize:11, fontStyle:'italic', color:'rgba(255,255,255,0.3)', fontFamily:'DM Serif Display, serif' }}>
              "Donde la experiencia del cliente se transforma en éxito comercial."
            </div>
          </div>

          {/* Username */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.09em', marginBottom:8 }}>
              Usuario
            </label>
            <div style={{
              background:'#141720',
              boxShadow:'inset -2px -2px 6px rgba(255,255,255,0.04), inset 2px 2px 8px rgba(0,0,0,0.5)',
              border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:12, overflow:'hidden',
            }}>
              <input
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                onKeyDown={handleKey}
                placeholder="Ingresa tu usuario"
                style={{
                  width:'100%', padding:'13px 16px', background:'transparent',
                  border:'none', outline:'none', color:'#e8eaf0', fontSize:14,
                  fontFamily:'DM Sans, sans-serif',
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom:24 }}>
            <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.09em', marginBottom:8 }}>
              Contraseña
            </label>
            <div style={{
              background:'#141720',
              boxShadow:'inset -2px -2px 6px rgba(255,255,255,0.04), inset 2px 2px 8px rgba(0,0,0,0.5)',
              border:'1px solid rgba(255,255,255,0.07)',
              borderRadius:12, overflow:'hidden',
              display:'flex', alignItems:'center',
            }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={handleKey}
                placeholder="••••••••"
                style={{
                  flex:1, padding:'13px 16px', background:'transparent',
                  border:'none', outline:'none', color:'#e8eaf0', fontSize:14,
                  fontFamily:'DM Sans, sans-serif',
                }}
              />
              <button onClick={() => setShowPass(p=>!p)} style={{ background:'none', border:'none', cursor:'pointer', padding:'0 14px', color:'rgba(255,255,255,0.35)', fontSize:14, fontFamily:'inherit' }}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ fontSize:12, color:'#f87171', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:8, padding:'9px 14px', marginBottom:16, textAlign:'center' }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <ExoBtn
            onClick={handleLogin}
            disabled={loading}
            size="exo-lg"
            style={{ width:'100%', justifyContent:'center', fontSize:'14px' }}
          >
            {loading ? '⚡ Autenticando...' : 'Ingresar al sistema'}
          </ExoBtn>

          {/* Demo hint */}
          <div style={{ textAlign:'center', marginTop:18, fontSize:11, color:'rgba(255,255,255,0.2)' }}>
            Demo: <span style={{ color:'rgba(255,255,255,0.35)' }}>admin / admin123</span>
            {' · '}
            <span style={{ color:'rgba(255,255,255,0.35)' }}>carlos / carlos123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
