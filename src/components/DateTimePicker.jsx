import { ExoBtn } from '../App';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS   = ['Do','Lu','Ma','Mi','Ju','Vi','Sá'];
const pad    = n => String(n).padStart(2,'0');

// ── PORTAL DROPDOWN — escapes modal overflow:hidden completely ────────────────
function Dropdown({ triggerRef, children, onClose }) {
  const dropRef = useRef();
  const [pos, setPos] = useState({ top:0, left:0, minWidth:280, openUp:false });

  useEffect(() => {
    if (!triggerRef?.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp     = spaceBelow < 360 && rect.top > spaceBelow;
    setPos({
      top:      openUp ? undefined : rect.bottom + window.scrollY + 8,
      bottom:   openUp ? window.innerHeight - rect.top - window.scrollY + 8 : undefined,
      left:     rect.left + window.scrollX,
      minWidth: Math.max(rect.width, 284),
      openUp,
    });
  }, [triggerRef]);

  useEffect(() => {
    const close = e => {
      const inDrop    = dropRef.current?.contains(e.target);
      const inTrigger = triggerRef?.current?.contains(e.target);
      if (!inDrop && !inTrigger) onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', close), 0);
    return () => document.removeEventListener('mousedown', close);
  }, [onClose, triggerRef]);

  const style = {
    position:'fixed',
    zIndex:999999,
    left:   pos.left,
    minWidth: pos.minWidth,
    background:'#1e2333',
    boxShadow:'-8px -8px 20px rgba(255,255,255,0.04),8px 8px 28px rgba(0,0,0,0.85),0 0 50px rgba(0,93,165,0.15)',
    border:'1px solid rgba(255,255,255,0.12)',
    borderRadius:18,
    overflow:'hidden',
    animation:'fadeIn .18s ease',
  };
  if (pos.openUp) {
    style.bottom = window.innerHeight - (triggerRef?.current?.getBoundingClientRect().top || 0) + 8;
  } else {
    style.top = (triggerRef?.current?.getBoundingClientRect().bottom || 0) + 8;
  }

  return createPortal(
    <div ref={dropRef} style={style}>{children}</div>,
    document.body
  );
}

// ── DATE PICKER ───────────────────────────────────────────────────────────────
export function DatePicker({ value, onChange, label, placeholder='Seleccionar fecha' }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef();

  const parsed = value ? new Date(value + 'T12:00:00') : null;
  const [yr, setYr] = useState(parsed?.getFullYear()  || new Date().getFullYear());
  const [mo, setMo] = useState(parsed?.getMonth()     ?? new Date().getMonth());

  // Keep yr/mo in sync when value changes from outside
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T12:00:00');
      setYr(d.getFullYear());
      setMo(d.getMonth());
    }
  }, [value]);

  const firstDay    = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();
  const cells       = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];
  const todayStr    = new Date().toISOString().split('T')[0];

  const prevMo = () => { if(mo===0){setMo(11);setYr(y=>y-1);}else setMo(m=>m-1); };
  const nextMo = () => { if(mo===11){setMo(0);setYr(y=>y+1);}else setMo(m=>m+1); };

  const selectDay = day => { onChange(`${yr}-${pad(mo+1)}-${pad(day)}`); setOpen(false); };

  const displayVal = value
    ? new Date(value+'T12:00:00').toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})
    : '';

  const navBtn = (onClick, label) => (
    <button onClick={e=>{e.stopPropagation();onClick();}} style={{ width:30,height:30,borderRadius:8,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.65)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontFamily:'inherit',transition:'all .15s' }}
      onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,93,165,0.2)';e.currentTarget.style.color='#60a5fa';}}
      onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='rgba(255,255,255,0.65)';}}>
      {label}
    </button>
  );

  return (
    <div style={{ position:'relative' }}>
      {label && <label className="field-label">{label}</label>}
      <button ref={btnRef} onClick={() => setOpen(p=>!p)} style={{
        width:'100%', padding:'10px 14px',
        background:'var(--bg-deep)',
        boxShadow: open?'var(--neu-inset),0 0 0 3px rgba(0,93,165,0.15)':'var(--neu-inset)',
        border:`1px solid ${open?'rgba(0,93,165,0.5)':'rgba(255,255,255,0.07)'}`,
        borderRadius:12, color: displayVal?'var(--text-1)':'rgba(255,255,255,0.3)',
        fontSize:13, fontFamily:'DM Sans,sans-serif', cursor:'pointer',
        textAlign:'left', display:'flex', alignItems:'center', justifyContent:'space-between',
        transition:'all .2s',
      }}>
        <span>{displayVal || placeholder}</span>
        <span style={{ fontSize:15, opacity:0.5 }}>📅</span>
      </button>

      {open && (
        <Dropdown triggerRef={btnRef} onClose={() => setOpen(false)}>
          {/* Header */}
          <div style={{ padding:'14px 16px 10px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              {navBtn(prevMo,'‹')}
              <span style={{ fontSize:14, fontWeight:700, color:'#e8eaf0', letterSpacing:'.02em' }}>{MONTHS[mo]} {yr}</span>
              {navBtn(nextMo,'›')}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:700, padding:'4px 0',
                  color: d==='Do'||d==='Sá' ? 'rgba(248,113,113,0.65)' : 'rgba(255,255,255,0.3)',
                  textTransform:'uppercase', letterSpacing:'.04em' }}>{d}</div>
              ))}
            </div>
          </div>

          {/* Day grid */}
          <div style={{ padding:'10px 12px 14px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
              {cells.map((day,i) => {
                if (!day) return <div key={'e'+i}/>;
                const ds       = `${yr}-${pad(mo+1)}-${pad(day)}`;
                const isToday  = ds === todayStr;
                const isSel    = ds === value;
                const isWeekend= (firstDay+day-1)%7===0 || (firstDay+day-1)%7===6;

                let bg='transparent', color=isWeekend?'rgba(248,113,113,0.7)':'rgba(255,255,255,0.75)', border='1px solid transparent', shadow='none';
                if (isSel)    { bg='linear-gradient(135deg,#005da5,#004a87)'; color='#fff'; border='1px solid rgba(108,99,255,0.6)'; shadow='0 0 10px rgba(108,99,255,0.45)'; }
                else if (isToday){ bg='rgba(0,93,165,0.15)'; color='#60a5fa'; border='1px solid rgba(0,93,165,0.35)'; }

                return (
                  <button key={day} onClick={()=>selectDay(day)} style={{
                    width:'100%', aspectRatio:'1', borderRadius:8, background:bg,
                    boxShadow:shadow, border, color, fontSize:12,
                    fontWeight:isSel||isToday?700:400, cursor:'pointer',
                    fontFamily:'inherit', transition:'all .14s',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}
                    onMouseEnter={e=>{if(!isSel){e.currentTarget.style.background='rgba(255,255,255,0.08)';e.currentTarget.style.color='#fff';}}}
                    onMouseLeave={e=>{if(!isSel){e.currentTarget.style.background=bg;e.currentTarget.style.color=color;}}}>
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={()=>{onChange('');setOpen(false);}} style={{ fontSize:11, color:'rgba(255,255,255,0.4)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', padding:'4px 8px', borderRadius:6, transition:'color .15s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
                onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.4)'}>Borrar</button>
              <button onClick={()=>{const n=new Date();setYr(n.getFullYear());setMo(n.getMonth());selectDay(n.getDate());}} style={{ fontSize:11, color:'#60a5fa', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', padding:'4px 8px', borderRadius:6, fontWeight:600, transition:'color .15s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#c4b5fd'}
                onMouseLeave={e=>e.currentTarget.style.color='#60a5fa'}>Hoy</button>
            </div>
          </div>
        </Dropdown>
      )}
    </div>
  );
}

// ── TIME PICKER ───────────────────────────────────────────────────────────────
export function TimePicker({ value, onChange, label, placeholder='Seleccionar hora' }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef();

  const toHM = v => { const p=(v||'09:00').split(':'); return [parseInt(p[0])||9, parseInt(p[1])||0]; };
  const [hr,  setHr]  = useState(() => toHM(value)[0]);
  const [min, setMin] = useState(() => toHM(value)[1]);

  useEffect(() => { const [h,m]=toHM(value); setHr(h); setMin(m); }, [value]);

  const emit = (h,m) => onChange(`${pad(h)}:${pad(m)}`);

  const displayVal = value ? (() => {
    const h=parseInt(value.split(':')[0]),m=value.split(':')[1];
    return `${pad(h%12||12)}:${m} ${h>=12?'p.m.':'a.m.'}`;
  })() : '';

  const mins = [0,5,10,15,20,25,30,35,40,45,50,55];

  const spinBtn = (onClick, lbl) => (
    <button onClick={e=>{e.stopPropagation();onClick();}} style={{ width:34,height:26,borderRadius:7,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.6)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontFamily:'inherit',transition:'all .15s',lineHeight:1 }}
      onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,93,165,0.22)';e.currentTarget.style.color='#60a5fa';}}
      onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)';e.currentTarget.style.color='rgba(255,255,255,0.6)';}}>
      {lbl}
    </button>
  );

  const display = (val, color) => (
    <div style={{ background:'rgba(255,255,255,0.04)', boxShadow:'inset -2px -2px 6px rgba(255,255,255,0.03),inset 2px 2px 8px rgba(0,0,0,0.45)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'10px 18px', fontSize:28, fontWeight:700, color, minWidth:66, textAlign:'center' }}>
      {pad(val)}
    </div>
  );

  return (
    <div style={{ position:'relative' }}>
      {label && <label className="field-label">{label}</label>}
      <button ref={btnRef} onClick={() => setOpen(p=>!p)} style={{
        width:'100%', padding:'10px 14px',
        background:'var(--bg-deep)',
        boxShadow: open?'var(--neu-inset),0 0 0 3px rgba(0,93,165,0.15)':'var(--neu-inset)',
        border:`1px solid ${open?'rgba(0,93,165,0.5)':'rgba(255,255,255,0.07)'}`,
        borderRadius:12, color: displayVal?'var(--text-1)':'rgba(255,255,255,0.3)',
        fontSize:13, fontFamily:'DM Sans,sans-serif', cursor:'pointer',
        textAlign:'left', display:'flex', alignItems:'center', justifyContent:'space-between',
        transition:'all .2s',
      }}>
        <span>{displayVal || placeholder}</span>
        <span style={{ fontSize:15, opacity:0.5 }}>🕐</span>
      </button>

      {open && (
        <Dropdown triggerRef={btnRef} onClose={() => setOpen(false)}>
          <div style={{ padding:'18px 20px 16px' }}>

            {/* Spinners row */}
            <div style={{ display:'flex', gap:14, justifyContent:'center', alignItems:'center', marginBottom:18 }}>
              {/* Hour */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                {spinBtn(()=>{const h=(hr+1)%24;setHr(h);emit(h,min);},'▲')}
                {display(hr,'#60a5fa')}
                {spinBtn(()=>{const h=(hr-1+24)%24;setHr(h);emit(h,min);},'▼')}
                <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>Hora</span>
              </div>

              <span style={{ fontSize:30, fontWeight:700, color:'rgba(255,255,255,0.25)', paddingBottom:28, lineHeight:1 }}>:</span>

              {/* Minute */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                {spinBtn(()=>{const m=(min+5)%60;setMin(m);emit(hr,m);},'▲')}
                {display(min,'#60a5fa')}
                {spinBtn(()=>{const m=(min-5+60)%60;setMin(m);emit(hr,m);},'▼')}
                <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>Min</span>
              </div>

              {/* AM/PM */}
              <div style={{ display:'flex', flexDirection:'column', gap:8, paddingBottom:28 }}>
                {['AM','PM'].map(p => {
                  const active = (p==='AM' && hr<12)||(p==='PM' && hr>=12);
                  return (
                    <button key={p} onClick={()=>{let h=hr;if(p==='AM'&&hr>=12)h=hr-12;if(p==='PM'&&hr<12)h=hr+12;setHr(h);emit(h,min);}} style={{
                      padding:'7px 16px', borderRadius:9, cursor:'pointer', fontFamily:'DM Sans,sans-serif',
                      fontSize:12, fontWeight:700, transition:'all .15s',
                      background: active?'linear-gradient(135deg,#005da5,#004a87)':'rgba(255,255,255,0.05)',
                      color: active?'#fff':'rgba(255,255,255,0.4)',
                      border: active?'1px solid rgba(0,93,165,0.5)':'1px solid rgba(255,255,255,0.08)',
                      boxShadow: active?'0 0 14px rgba(0,93,165,0.3)':'none',
                    }}>{p}</button>
                  );
                })}
              </div>
            </div>

            {/* Quick minutes */}
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:14, marginBottom:14 }}>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.28)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>Minutos rápidos</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:5 }}>
                {mins.map(m => {
                  const active = min===m;
                  return (
                    <button key={m} onClick={()=>{setMin(m);emit(hr,m);setOpen(false);}} style={{
                      padding:'5px 0', borderRadius:7, cursor:'pointer', fontFamily:'DM Sans,sans-serif',
                      fontSize:11, fontWeight:600, transition:'all .12s',
                      background: active?'rgba(96,165,250,0.2)':'rgba(255,255,255,0.04)',
                      color: active?'#60a5fa':'rgba(255,255,255,0.45)',
                      border: active?'1px solid rgba(96,165,250,0.4)':'1px solid transparent',
                    }}
                      onMouseEnter={e=>{if(!active){e.currentTarget.style.background='rgba(255,255,255,0.09)';e.currentTarget.style.color='#fff';}}}
                      onMouseLeave={e=>{if(!active){e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='rgba(255,255,255,0.45)';}}}
                    >:{pad(m)}</button>
                  );
                })}
              </div>
            </div>

            {/* Confirm */}
            <button onClick={() => setOpen(false)} style={{
              width:'100%', padding:'10px', borderRadius:10, cursor:'pointer',
              background:'linear-gradient(135deg,#005da5,#004a87)',
              border:'1px solid rgba(108,99,255,0.45)',
              color:'#fff', fontFamily:'DM Sans,sans-serif',
              fontSize:13, fontWeight:700,
              boxShadow:'0 0 16px rgba(108,99,255,0.28)',
            }}>
              ✓ Confirmar {displayVal}
            </button>
          </div>
        </Dropdown>
      )}
    </div>
  );
}
