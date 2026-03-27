import { ExoBtn } from '../App';
import React, { useState, useMemo } from 'react';

// ── Colombian festivos ────────────────────────────────────────────────────────
function getColombiaFestivos(year) {
  const fixed = [`${year}-01-01`,`${year}-05-01`,`${year}-07-20`,`${year}-08-07`,`${year}-12-08`,`${year}-12-25`];
  const emiliani = (m, d) => {
    const dt = new Date(year, m - 1, d);
    const dow = dt.getDay();
    if (dow === 1) return dt;
    return new Date(year, m - 1, d + (dow === 0 ? 1 : 8 - dow));
  };
  const fmt = d => d.toISOString().split('T')[0];
  const emDates = [emiliani(1,6),emiliani(3,19),emiliani(6,29),emiliani(8,15),emiliani(10,12),emiliani(11,1),emiliani(11,11)].map(fmt);
  const easters = {2024:'2024-03-31',2025:'2025-04-20',2026:'2026-04-05',2027:'2027-03-28',2028:'2028-04-16',2029:'2029-04-01',2030:'2030-04-21'};
  const easter = new Date(easters[year] || `${year}-04-13`);
  const addD = (d, n) => { const r=new Date(d); r.setDate(r.getDate()+n); return fmt(r); };
  const easterDates = [addD(easter,-3),addD(easter,-2),fmt(easter),addD(easter,39),addD(easter,60),addD(easter,71)];
  return [...new Set([...fixed,...emDates,...easterDates])];
}

const FESTIVO_LABEL = {
  '01-01':'Año Nuevo','01-06':'Reyes Magos','03-19':'San José','05-01':'Día del Trabajo',
  '06-29':'San Pedro y San Pablo','07-20':'Independencia','08-07':'Batalla de Boyacá',
  '08-15':'Asunción','10-12':'Día de la Raza','11-01':'Todos los Santos',
  '11-11':'Independencia Cartagena','12-08':'Inmaculada Concepción','12-25':'Navidad',
};
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const pad    = n => String(n).padStart(2,'0');

function taskColor(t) {
  if (t.done) return '#4ade80';
  const due = new Date(`${t.dueDate}T${t.dueTime||'23:59'}`);
  if (due < new Date()) return '#f87171';
  const diff = (due - new Date()) / 60000;
  if (diff <= (t.reminderMin||30)) return '#fbbf24';
  return '#60a5fa';
}

function formatDT(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-CO',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
}

export function AgendaView({ clients, onClientClick }) {
  const now  = new Date();
  const [yr,  setYr]  = useState(now.getFullYear());
  const [mo,  setMo]  = useState(now.getMonth());
  const [sel, setSel] = useState(null);

  const festivos   = useMemo(() => getColombiaFestivos(yr), [yr]);
  const festivoSet = useMemo(() => new Set(festivos), [festivos]);

  const allTasks = useMemo(() => {
    const list = [];
    clients.forEach(c => (c.tasks||[]).forEach(t => list.push({ ...t, clientName:c.name, clientId:c.id, client:c })));
    return list;
  }, [clients]);

  const tasksByDate = useMemo(() => {
    const map = {};
    allTasks.forEach(t => { if (!map[t.dueDate]) map[t.dueDate]=[]; map[t.dueDate].push(t); });
    return map;
  }, [allTasks]);

  const firstDay   = new Date(yr, mo, 1).getDay();
  const daysInMo   = new Date(yr, mo + 1, 0).getDate();
  const cells      = [...Array(firstDay).fill(null), ...Array.from({length:daysInMo},(_,i)=>i+1)];
  const todayStr   = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
  const selStr     = sel ? `${yr}-${pad(mo+1)}-${pad(sel)}` : null;
  const selFestivo = selStr ? (festivos.find(f => f === selStr) ? FESTIVO_LABEL[selStr.slice(5)] || 'Festivo' : null) : null;

  const prevMo = () => { if(mo===0){setMo(11);setYr(y=>y-1);}else setMo(m=>m-1); setSel(null); };
  const nextMo = () => { if(mo===11){setMo(0);setYr(y=>y+1);}else setMo(m=>m+1); setSel(null); };

  const upcomingTasks = useMemo(() => {
    const from = new Date(); from.setHours(0,0,0,0);
    const to   = new Date(from); to.setDate(to.getDate()+7);
    return allTasks.filter(t => { const d=new Date(t.dueDate+'T12:00:00'); return d>=from && d<=to; })
      .sort((a,b)=>a.dueDate.localeCompare(b.dueDate)||(a.dueTime||'').localeCompare(b.dueTime||''));
  }, [allTasks]);

  const displayTasks = selStr ? (tasksByDate[selStr]||[]) : upcomingTasks;
  const panelTitle   = selStr ? `${sel} de ${MONTHS[mo]}` : 'Próximos 7 días';

  return (
    <div style={{ padding:'0 20px 28px' }}>
      <div className="agenda-layout grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:24, alignItems:'start' }}>

        {/* ── CALENDAR ── */}
        <div style={{
          background:'var(--bg-card)',
          boxShadow:'-8px -8px 20px rgba(255,255,255,0.04),8px 8px 24px rgba(0,0,0,0.55)',
          border:'1px solid var(--border-light)',
          borderRadius:24, overflow:'hidden',
        }}>
          {/* Month nav */}
          <div style={{ padding:'22px 28px 16px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <button
                onClick={prevMo}
                style={{ width:36, height:36, borderRadius:10, background:'var(--bg-raised)', boxShadow:'var(--neu-btn)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-2)', fontSize:16, fontFamily:'inherit', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.color='var(--text-1)';e.currentTarget.style.boxShadow='-4px -4px 10px rgba(255,255,255,0.06),4px 4px 12px rgba(0,0,0,0.6)';}}
                onMouseLeave={e=>{e.currentTarget.style.color='var(--text-2)';e.currentTarget.style.boxShadow='var(--neu-btn)';}}
              >‹</button>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:22, fontWeight:700, letterSpacing:'.01em' }}>{MONTHS[mo]}</div>
                <div style={{ fontSize:13, color:'var(--text-3)', fontWeight:600 }}>{yr} 🇨🇴</div>
              </div>
              <button
                onClick={nextMo}
                style={{ width:36, height:36, borderRadius:10, background:'var(--bg-raised)', boxShadow:'var(--neu-btn)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-2)', fontSize:16, fontFamily:'inherit', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.color='var(--text-1)';e.currentTarget.style.boxShadow='-4px -4px 10px rgba(255,255,255,0.06),4px 4px 12px rgba(0,0,0,0.6)';}}
                onMouseLeave={e=>{e.currentTarget.style.color='var(--text-2)';e.currentTarget.style.boxShadow='var(--neu-btn)';}}
              >›</button>
            </div>
            {/* Weekday headers */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginTop:12 }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color: d==='Dom'?'rgba(248,113,113,0.7)':'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', padding:'6px 0' }}>{d}</div>
              ))}
            </div>
          </div>

          {/* Day cells */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6, padding:'16px 20px 20px' }}>
            {cells.map((day, idx) => {
              if (!day) return <div key={'e'+idx}/>;
              const dateStr  = `${yr}-${pad(mo+1)}-${pad(day)}`;
              const isFest   = festivoSet.has(dateStr);
              const isToday  = dateStr === todayStr;
              const isSel    = sel === day;
              const isSun    = (firstDay + day - 1) % 7 === 0;
              const isSat    = (firstDay + day - 1) % 7 === 6;
              const dayTasks = tasksByDate[dateStr] || [];
              const hasTask  = dayTasks.length > 0;
              const festName = isFest ? (FESTIVO_LABEL[dateStr.slice(5)] || 'Festivo') : null;

              let cellBg     = 'var(--bg-raised)';
              let cellBorder = '1px solid var(--border)';
              let cellShadow = 'var(--neu-btn)';
              let numColor   = 'var(--text-1)';

              if (isSel) {
                cellBg     = 'linear-gradient(135deg,#005da5,#004a87)';
                cellBorder = '1px solid rgba(0,93,165,0.7)';
                cellShadow = '-3px -3px 8px rgba(255,255,255,0.04),3px 3px 10px rgba(0,0,0,0.5),0 0 20px rgba(0,93,165,0.4)';
                numColor   = '#fff';
              } else if (isToday) {
                cellBg     = 'var(--bg-raised)';
                cellBorder = '1px solid rgba(0,93,165,0.5)';
                cellShadow = '-3px -3px 8px rgba(255,255,255,0.05),3px 3px 10px rgba(0,0,0,0.5),0 0 12px rgba(0,93,165,0.25)';
                numColor   = '#60a5fa';
              } else if (isFest) {
                numColor = '#f87171';
              } else if (isSun || isSat) {
                numColor = 'rgba(248,113,113,0.6)';
              }

              return (
                <div
                  key={day}
                  onClick={() => setSel(isSel ? null : day)}
                  title={festName || ''}
                  style={{
                    position:'relative', textAlign:'center',
                    padding:'8px 4px 10px', borderRadius:12,
                    cursor:'pointer', background:cellBg,
                    boxShadow:cellShadow, border:cellBorder,
                    transition:'all .18s', minHeight:58,
                    display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                  }}
                  onMouseEnter={e => { if (!isSel) { e.currentTarget.style.boxShadow='-4px -4px 10px rgba(255,255,255,0.06),4px 4px 12px rgba(0,0,0,0.6)'; e.currentTarget.style.transform='translateY(-1px)'; }}}
                  onMouseLeave={e => { if (!isSel) { e.currentTarget.style.boxShadow=cellShadow; e.currentTarget.style.transform='translateY(0)'; }}}
                >
                  <span style={{ fontSize:14, fontWeight: isToday||isSel ? 700 : 400, color:numColor, lineHeight:1 }}>{day}</span>
                  {isFest && (
                    <span style={{ fontSize:7, color: isSel?'rgba(255,255,255,0.7)':'rgba(248,113,113,0.8)', fontWeight:600, lineHeight:1, maxWidth:44, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {festName}
                    </span>
                  )}
                  {hasTask && (
                    <div style={{ display:'flex', justifyContent:'center', gap:2, flexWrap:'wrap', maxWidth:40 }}>
                      {dayTasks.slice(0,4).map((t,ti) => (
                        <span key={ti} style={{ width:5, height:5, borderRadius:'50%', background: isSel?'rgba(255,255,255,0.8)':taskColor(t), flexShrink:0, boxShadow: isSel?'none':'0 0 3px '+taskColor(t) }}/>
                      ))}
                      {dayTasks.length > 4 && (
                        <span style={{ fontSize:7, color: isSel?'rgba(255,255,255,0.7)':'var(--text-3)', lineHeight:'5px' }}>+{dayTasks.length-4}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ padding:'14px 24px 20px', borderTop:'1px solid var(--border)', display:'flex', gap:20, flexWrap:'wrap' }}>
            {[
              {color:'#4ade80',label:'Completada'},
              {color:'#60a5fa',label:'A tiempo'},
              {color:'#fbbf24',label:'Próxima'},
              {color:'#f87171',label:'Vencida'},
            ].map(l => (
              <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:l.color, boxShadow:'0 0 5px '+l.color, flexShrink:0 }}/>
                <span style={{ fontSize:11, color:'var(--text-3)' }}>{l.label}</span>
              </div>
            ))}
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:11, color:'#f87171' }}>rojo = </span>
              <span style={{ fontSize:11, color:'var(--text-3)' }}>festivo Colombia</span>
            </div>
          </div>
        </div>

        {/* ── TASK PANEL ── */}
        <div style={{
          background:'var(--bg-card)',
          boxShadow:'-6px -6px 16px rgba(255,255,255,0.03),6px 6px 20px rgba(0,0,0,0.5)',
          border:'1px solid var(--border)',
          borderRadius:20,
          overflow:'hidden',
          position:'sticky',
          top:120,
        }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg-raised)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700 }}>{panelTitle}</div>
                {selFestivo && (
                  <div style={{ fontSize:10, color:'#f87171', fontWeight:600, marginTop:2 }}>🇨🇴 {selFestivo}</div>
                )}
                <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>{displayTasks.length} tarea{displayTasks.length!==1?'s':''}</div>
              </div>
              {sel && (
                <button className='exo-btn exo-sm' onClick={() => setSel(null)}><div className='btn-outer'><div className='btn-inner'><span>Ver próximos</span></div></div></button>
              )}
            </div>
          </div>

          <div style={{ maxHeight:520, overflowY:'auto', padding:'12px 16px' }}>
            {displayTasks.length === 0 ? (
              <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-3)', fontSize:13 }}>
                {sel ? '🎉 Sin tareas este día' : 'Sin tareas próximas'}
              </div>
            ) : displayTasks.map(t => {
              const color = taskColor(t);
              return (
                <div
                  key={t.id}
                  onClick={() => onClientClick(t.client)}
                  style={{
                    padding:'11px 14px',
                    background:'var(--bg-deep)',
                    boxShadow:'var(--neu-inset)',
                    border:'1px solid '+color+'28',
                    borderRadius:12, marginBottom:8,
                    cursor:'pointer', transition:'all .15s',
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=color+'55';e.currentTarget.style.boxShadow='var(--neu-inset),0 0 10px '+color+'22';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=color+'28';e.currentTarget.style.boxShadow='var(--neu-inset)';}}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background:color, boxShadow:'0 0 5px '+color, flexShrink:0 }}/>
                    <span style={{ fontSize:11, fontWeight:700, color, textTransform:'uppercase', letterSpacing:'.04em' }}>{t.type}</span>
                    {t.rescheduledAt && <span style={{ fontSize:9, color:'#fbbf24', background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.25)', borderRadius:4, padding:'1px 5px', fontWeight:700 }}>🔄 Reprog.</span>}
                    {t.done && <span style={{ fontSize:9, color:'#4ade80', marginLeft:'auto', fontWeight:700 }}>✓ HECHA</span>}
                  </div>
                  <div style={{ fontSize:12, fontWeight:600, marginBottom:2 }}>{t.clientName}</div>
                  <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.desc}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)', display:'flex', gap:10, flexWrap:'wrap' }}>
                    <span>📅 {t.dueDate}{t.dueTime?' · '+t.dueTime:''}</span>
                    {t.done && t.completedAt && <span style={{ color:'#4ade80' }}>✓ {formatDT(t.completedAt)}</span>}
                    {t.rescheduledAt && <span style={{ color:'#fbbf24' }}>🔄 {formatDT(t.rescheduledAt)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
