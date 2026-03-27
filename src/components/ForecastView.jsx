import React, { useState, useMemo } from 'react';
import { ExoBtn } from '../App';

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const MONTH_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function pad(n){ return String(n).padStart(2,'0'); }

// ── SET FORECAST MODAL ────────────────────────────────────────────────────────
function SetForecastModal({ user, yearMonth, current, onSave, onClose }) {
  const [target, setTarget] = useState(String(current.target||''));
  const [note,   setNote]   = useState(current.note||'');
  const [mo, yr] = [parseInt(yearMonth.split('-')[1])-1, parseInt(yearMonth.split('-')[0])];

  const inp = { width:'100%', padding:'10px 14px', background:'#141720', boxShadow:'inset -2px -2px 6px rgba(255,255,255,0.03),inset 2px 2px 8px rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, color:'#e8eaf0', fontSize:13, fontFamily:'DM Sans,sans-serif', outline:'none' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(10,12,22,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500, padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="slide-up" style={{ background:'#1e2333', boxShadow:'-8px -8px 20px rgba(255,255,255,0.04),8px 8px 28px rgba(0,0,0,0.8)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, width:'100%', maxWidth:420, padding:28 }}>
        <div style={{ fontSize:16, fontWeight:700, marginBottom:4 }}>🎯 Asignar forecast</div>
        <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:22 }}>{user.name} · {MONTH_FULL[mo]} {yr}</div>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:7 }}>Meta de ventas (unidades)</label>
          <input style={inp} type="number" min="0" max="999" value={target} onChange={e=>setTarget(e.target.value)} placeholder="Ej: 5"/>
        </div>
        <div style={{ marginBottom:22 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:7 }}>Nota (opcional)</label>
          <textarea style={{ ...inp, resize:'vertical', minHeight:70 }} value={note} onChange={e=>setNote(e.target.value)} placeholder="Observaciones sobre la meta..."/>
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <ExoBtn size="exo-sm" variant="exo-ghost" onClick={onClose}>Cancelar</ExoBtn>
          <ExoBtn size="exo-sm" onClick={()=>{ onSave(parseInt(target)||0, note); onClose(); }}>Guardar meta</ExoBtn>
        </div>
      </div>
    </div>
  );
}

// ── PROGRESS BAR ──────────────────────────────────────────────────────────────
function ForecastBar({ actual, target }) {
  if (!target) return <span style={{ fontSize:11, color:'var(--text-3)' }}>Sin meta</span>;
  const pct   = Math.min(Math.round(actual/target*100), 100);
  const over  = actual > target;
  const color = pct >= 100 ? '#4ade80' : pct >= 70 ? '#fbbf24' : pct >= 40 ? '#fb923c' : '#f87171';
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, fontWeight:700, color }}>{actual}<span style={{ fontSize:10, color:'var(--text-3)', marginLeft:4 }}>/ {target}</span></span>
        <span style={{ fontSize:11, fontWeight:700, color }}>{pct}%{over?' 🎉':''}</span>
      </div>
      <div style={{ background:'var(--bg-deep)', boxShadow:'var(--neu-inset)', borderRadius:6, height:8, overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ height:'100%', width:pct+'%', background:`linear-gradient(90deg,${color}88,${color})`, borderRadius:6, boxShadow:`0 0 8px ${color}55`, transition:'width .6s ease' }}/>
      </div>
    </div>
  );
}

// ── MAIN FORECAST VIEW ────────────────────────────────────────────────────────
export function ForecastView({ currentUser, users, allClients, getForecast, setForecast, getActual }) {
  const now      = new Date();
  const [year,   setYear]   = useState(now.getFullYear());
  const [editing, setEditing] = useState(null); // { user, yearMonth }

  const isAdmin   = currentUser.role === 'admin';
  const isGerente = currentUser.role === 'gerente';
  const canEdit   = isAdmin || isGerente;

  // Visible users: admin sees all, gerente sees vendedores + self
  const visibleUsers = useMemo(() => {
    if (isAdmin) return users.filter(u=>u.active!==false);
    if (isGerente) return users.filter(u=>u.active!==false && (u.role==='vendedor' || u.id===currentUser.id));
    return [currentUser];
  }, [users, currentUser, isAdmin, isGerente]);

  const months = Array.from({length:12},(_,i)=>i);
  const currentMonth = now.getMonth();
  const currentYM    = `${year}-${pad(now.getMonth()+1)}`;

  const totalTarget = (userId) => months.reduce((s,m)=>{
    const ym = `${year}-${pad(m+1)}`;
    return s + (getForecast(userId,ym).target||0);
  }, 0);

  const totalActual = (userId) => months.reduce((s,m)=>{
    const ym = `${year}-${pad(m+1)}`;
    return s + getActual(allClients, userId, ym);
  }, 0);

  return (
    <div style={{ padding:'0 20px 40px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:700, marginBottom:4, color:'#005da5' }}>🎯 Forecast</h2>
          <p style={{ fontSize:13, color:'var(--text-3)' }}>
            {canEdit ? 'Asigna metas mensuales de ventas por asesor.' : 'Tu cumplimiento de metas mensuales.'}
          </p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={()=>setYear(y=>y-1)} style={{ width:32, height:32, borderRadius:8, background:'var(--bg-raised)', border:'1px solid var(--border)', color:'var(--text-2)', cursor:'pointer', fontFamily:'inherit', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
          <span style={{ fontSize:15, fontWeight:700, minWidth:48, textAlign:'center' }}>{year}</span>
          <button onClick={()=>setYear(y=>y+1)} style={{ width:32, height:32, borderRadius:8, background:'var(--bg-raised)', border:'1px solid var(--border)', color:'var(--text-2)', cursor:'pointer', fontFamily:'inherit', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
        </div>
      </div>

      {/* Per-user tables */}
      {visibleUsers.map(user => {
        const tTarget = totalTarget(user.id);
        const tActual = totalActual(user.id);
        return (
          <div key={user.id} style={{ background:'var(--bg-card)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:18, marginBottom:20, overflow:'hidden' }}>
            {/* User header */}
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:14, background:'var(--bg-raised)' }}>
              <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#005da5,#0077c8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {user.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:700 }}>{user.name}</div>
                <div style={{ fontSize:11, color:'var(--text-3)' }}>{user.role === 'vendedor' ? 'Asesor' : user.role === 'gerente' ? 'Gerente' : 'Admin'}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:2 }}>Año {year}</div>
                <div style={{ fontSize:13, fontWeight:700 }}>
                  <span style={{ color: tActual>=tTarget && tTarget>0 ? '#4ade80' : 'var(--text-2)' }}>{tActual}</span>
                  <span style={{ color:'var(--text-3)' }}> / {tTarget} ventas</span>
                </div>
              </div>
            </div>

            {/* Month grid */}
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:800 }}>
                <thead>
                  <tr style={{ background:'var(--bg-deep)' }}>
                    {months.map(m => (
                      <th key={m} style={{ padding:'8px 10px', fontSize:10, fontWeight:700, color: m===currentMonth&&year===now.getFullYear()?'#005da5':'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', borderBottom:'1px solid var(--border)', textAlign:'center', whiteSpace:'nowrap', borderRight:'1px solid rgba(255,255,255,0.04)' }}>
                        {MONTHS[m]}
                        {m===currentMonth&&year===now.getFullYear()&&<div style={{ width:4, height:4, borderRadius:'50%', background:'#005da5', margin:'3px auto 0' }}/>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Targets row */}
                  <tr>
                    {months.map(m => {
                      const ym  = `${year}-${pad(m+1)}`;
                      const fc  = getForecast(user.id, ym);
                      const act = getActual(allClients, user.id, ym);
                      const isPast = year < now.getFullYear() || (year===now.getFullYear() && m < currentMonth);
                      const isCurrent = year===now.getFullYear() && m===currentMonth;
                      return (
                        <td key={m} style={{ padding:'12px 10px', borderBottom:'1px solid rgba(255,255,255,0.04)', borderRight:'1px solid rgba(255,255,255,0.04)', verticalAlign:'top', background: isCurrent?'rgba(0,93,165,0.06)':'' }}>
                          <div style={{ display:'flex', flexDirection:'column', gap:6, minWidth:80 }}>
                            {/* Actual vs Target */}
                            <ForecastBar actual={act} target={fc.target}/>
                            {/* Edit button */}
                            {canEdit && (
                              <button
                                onClick={()=>setEditing({user, yearMonth:ym})}
                                style={{ fontSize:10, padding:'3px 0', background:'none', border:'none', color: fc.target?'rgba(0,93,165,0.7)':'rgba(255,255,255,0.2)', cursor:'pointer', fontFamily:'DM Sans,sans-serif', textAlign:'center', transition:'color .15s' }}
                                onMouseEnter={e=>e.currentTarget.style.color='#005da5'}
                                onMouseLeave={e=>e.currentTarget.style.color=fc.target?'rgba(0,93,165,0.7)':'rgba(255,255,255,0.2)'}
                              >
                                {fc.target ? '✏ editar' : '+ meta'}
                              </button>
                            )}
                            {fc.note && <div style={{ fontSize:9, color:'var(--text-3)', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:90 }} title={fc.note}>💬 {fc.note}</div>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* Set forecast modal */}
      {editing && (
        <SetForecastModal
          user={editing.user}
          yearMonth={editing.yearMonth}
          current={getForecast(editing.user.id, editing.yearMonth)}
          onSave={(target, note) => setForecast(editing.user.id, editing.yearMonth, target, note)}
          onClose={()=>setEditing(null)}
        />
      )}
    </div>
  );
}
