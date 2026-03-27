import { ExoBtn } from '../App';
import React, { useState, useMemo } from 'react';
import { CatalogSettings } from './CatalogSettings';
import { WidgetSettings } from './DashboardWidgets';
import { ORIGINS } from '../data/constants';
import { formatDate, daysSince, getNextTask, getCreatedDate } from '../utils/helpers';
import { StagePill, ContactActions, Avatar, TaskWarningIcon, TempIcon } from './UI';
import { CarIcon } from './Icons';

// ── CLIENT LIST ──────────────────────────────────────────────────────────────
export function ClientList({ stages, clients, onClientClick, origins=[] }) {
  const [search, setSearch]   = useState('');
  const [fStage, setFStage]   = useState('');
  const [fOrigin, setFOrigin] = useState('');
  const [sort, setSort]       = useState({ key:'lastContact', dir:'desc' });
  const stageMap = useMemo(() => Object.fromEntries(stages.map(s=>[s.id,s])), [stages]);

  const filtered = useMemo(() => {
    let r = clients.filter(c => {
      const q = search.toLowerCase();
      return (!q || c.name.toLowerCase().includes(q) || c.vehicle.toLowerCase().includes(q) || (c.email||'').toLowerCase().includes(q))
        && (!fStage  || c.stageId === fStage)
        && (!fOrigin || c.origin  === fOrigin);
    });
    return [...r].sort((a,b) => {
      let av = sort.key==='lastContact' ? new Date(a[sort.key]) : (a[sort.key]||'').toLowerCase();
      let bv = sort.key==='lastContact' ? new Date(b[sort.key]) : (b[sort.key]||'').toLowerCase();
      return av<bv?(sort.dir==='asc'?-1:1):av>bv?(sort.dir==='asc'?1:-1):0;
    });
  }, [clients, search, fStage, fOrigin, sort]);

  const toggleSort = k => setSort(p=>({key:k, dir:p.key===k&&p.dir==='asc'?'desc':'asc'}));
  const fs = { background:'var(--bg-deep)', boxShadow:'var(--neu-inset)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text-1)', fontFamily:'DM Sans,sans-serif', fontSize:13, padding:'9px 12px', outline:'none' };

  return (
    <div style={{ padding:'0 20px 28px' }}>
      <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
        <input className="neu-input" style={{ flex:'1 1 200px' }} placeholder="Buscar nombre, vehículo, email..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={fs} value={fStage}  onChange={e=>setFStage(e.target.value)}>
          <option value="">Todas las etapas</option>
          {stages.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select style={fs} value={fOrigin} onChange={e=>setFOrigin(e.target.value)}>
          <option value="">Todos los orígenes</option>
          {(origins||ORIGINS).map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <div style={{ background:'var(--bg-card)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:18, overflow:'hidden' }}>
        <div className="table-scroll" style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--bg-deep)' }}>
                {[
                  {k:'name',       l:'Cliente',          s:true },
                  {k:'vehicle',    l:'Vehículo',         s:false},
                  {k:null,         l:'Etapa',            s:false},
                  {k:'lastContact',l:'Último contacto',  s:true },
                  {k:null,         l:'Próximo contacto', s:false},
                  {k:null,         l:'Creado',           s:false},
                  {k:null,         l:'Temp.',            s:false},
                  {k:null,         l:'Acciones',         s:false},
                ].map(col=>(
                  <th key={col.l} onClick={()=>col.s&&toggleSort(col.k)} style={{ padding:'11px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', borderBottom:'1px solid var(--border)', cursor:col.s?'pointer':'default', userSelect:'none', whiteSpace:'nowrap' }}>
                    {col.l}{col.s&&sort.key===col.k&&<span style={{marginLeft:4,opacity:.7}}>{sort.dir==='asc'?'↑':'↓'}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0
                ? <tr><td colSpan={8} style={{ padding:36, textAlign:'center', color:'var(--text-3)', fontSize:13 }}>No hay clientes que coincidan</td></tr>
                : filtered.map(c => {
                    const ds        = daysSince(c.lastContact);
                    const stage     = stageMap[c.stageId];
                    const dateColor = ds>=7?'#f87171':ds>=4?'#fbbf24':'var(--text-2)';
                    const nextTask  = getNextTask(c.tasks);
                    const createdAt = getCreatedDate(c);
                    const createdDs = createdAt ? daysSince(createdAt) : null;
                    return (
                      <tr key={c.id} onClick={()=>onClientClick(c)} style={{ cursor:'pointer', borderBottom:'1px solid var(--border)', transition:'background .12s' }}
                        onMouseEnter={e=>Array.from(e.currentTarget.cells).forEach(td=>td.style.background='var(--bg-raised)')}
                        onMouseLeave={e=>Array.from(e.currentTarget.cells).forEach(td=>td.style.background='transparent')}>
                        {/* Cliente */}
                        <td style={{ padding:'11px 14px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <Avatar name={c.name} size={28}/>
                            <div>
                              <div style={{ fontWeight:600, fontSize:13, display:'flex', alignItems:'center', gap:5 }}>
                                {c.name}<TaskWarningIcon tasks={c.tasks||[]}/>
                              </div>
                              <div style={{ fontSize:11, color:'var(--text-3)' }}>{c.phone}</div>
                            </div>
                          </div>
                        </td>
                        {/* Vehículo */}
                        <td style={{ padding:'11px 14px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                            <span style={{ color:'var(--text-3)', flexShrink:0 }}><CarIcon s={11}/></span>
                            <span style={{ fontSize:12, color:'var(--text-2)', maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.vehicle}</span>
                          </div>
                        </td>
                        {/* Etapa */}
                        <td style={{ padding:'11px 14px' }}>{stage&&<StagePill stage={stage}/>}</td>
                        {/* Último contacto */}
                        <td style={{ padding:'11px 14px', color:dateColor, fontSize:12, whiteSpace:'nowrap' }}>{formatDate(c.lastContact)}</td>
                        {/* Próximo contacto */}
                        <td style={{ padding:'11px 14px', whiteSpace:'nowrap' }}>
                          {nextTask ? (
                            <div>
                              <div style={{ fontSize:12, color:'#60a5fa', fontWeight:600 }}>{nextTask.dueDate}</div>
                              <div style={{ fontSize:10, color:'var(--text-3)' }}>{nextTask.type}{nextTask.dueTime?' · '+nextTask.dueTime:''}</div>
                            </div>
                          ) : (
                            <span style={{ fontSize:11, color:'var(--text-3)' }}>—</span>
                          )}
                        </td>
                        {/* Creado */}
                        <td style={{ padding:'11px 14px', whiteSpace:'nowrap' }}>
                          {createdAt ? (
                            <div>
                              <div style={{ fontSize:12, color:'var(--text-2)' }}>{formatDate(createdAt)}</div>
                              {createdDs!==null && <div style={{ fontSize:10, color:'var(--text-3)' }}>{createdDs===0?'Hoy':`hace ${createdDs}d`}</div>}
                            </div>
                          ) : <span style={{ fontSize:11, color:'var(--text-3)' }}>—</span>}
                        </td>
                        {/* Temperatura */}
                        <td style={{ padding:'11px 14px' }}>
                          <TempIcon lastContact={c.lastContact} stageId={c.stageId}/>
                        </td>
                        {/* Acciones */}
                        <td style={{ padding:'11px 14px' }} onClick={e=>e.stopPropagation()}>
                          <ContactActions phone={c.phone} name={c.name}/>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
        <div style={{ padding:'9px 16px', borderTop:'1px solid var(--border)', fontSize:11, color:'var(--text-3)', fontWeight:700, letterSpacing:'.04em' }}>
          {filtered.length} DE {clients.length} CLIENTES
        </div>
      </div>
    </div>
  );
}

// ── REPORTS ──────────────────────────────────────────────────────────────────
const REPORT_MENU = [
  { id:'funnel',   label:'Embudo de conversión',  icon:'📊' },
  { id:'origen',   label:'Clientes por origen',   icon:'🌐' },
  { id:'mensual',  label:'Ventas por asesor/mes',  icon:'📅' },
  { id:'clientes', label:'Reporte de clientes',    icon:'👤' },
  { id:'tareas',   label:'Cumplimiento de tareas', icon:'✅' },
];

function ReportBar({ pct, color, height=10 }) {
  return (
    <div style={{ background:'var(--bg-deep)', boxShadow:'var(--neu-inset)', borderRadius:6, height, overflow:'hidden', border:'1px solid var(--border)' }}>
      <div style={{ height:'100%', width:`${Math.max(pct,1.5)}%`, background:'linear-gradient(90deg,'+color+'99,'+color+')', borderRadius:6, boxShadow:'0 0 10px '+color+'55', transition:'width .7s ease' }}/>
    </div>
  );
}

// Modern funnel SVG visualization
function FunnelViz({ stages, clients }) {
  const funnel = stages.filter(s=>s.id!=='cerrado'&&s.id!=='perdido');
  const total  = clients.length || 1;
  const maxH   = 52;
  const minH   = 20;

  if (clients.length === 0) return (
    <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-3)', fontSize:13 }}>
      📭 Sin leads en el pipeline todavía
    </div>
  );
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6, padding:'8px 0' }}>
      {funnel.filter(s=>clients.filter(c=>c.stageId===s.id).length>0).map((s, i) => {
        const count = clients.filter(c=>c.stageId===s.id).length;
        const pct   = Math.round(count / total * 100);
        const width = Math.max(count / total * 100, 8);
        const h     = Math.max(minH, maxH - i * 4);
        return (
          <div key={s.id} style={{ display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:130, flexShrink:0, display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:s.dot, boxShadow:'0 0 6px '+s.dot, flexShrink:0 }}/>
              <span style={{ fontSize:12, color:'var(--text-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.label}</span>
            </div>
            <div style={{ flex:1, position:'relative', height:h }}>
              {/* Track */}
              <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.03)', boxShadow:'var(--neu-inset)', borderRadius:h/2, border:'1px solid rgba(255,255,255,0.06)' }}/>
              {/* Fill */}
              <div style={{ position:'absolute', top:0, left:0, height:'100%', width:width+'%', background:'linear-gradient(90deg,'+s.dot+'66,'+s.dot+')', borderRadius:h/2, boxShadow:'0 0 14px '+s.dot+'44', transition:'width .8s cubic-bezier(.4,0,.2,1)' }}/>
              {/* Glow dot at end */}
              {count > 0 && <div style={{ position:'absolute', top:'50%', left:`calc(${width}% - 6px)`, transform:'translateY(-50%)', width:10, height:10, borderRadius:'50%', background:s.dot, boxShadow:'0 0 6px '+s.dot+', 0 0 12px '+s.dot+'66', border:'2px solid rgba(255,255,255,0.3)' }}/>}
            </div>
            <div style={{ width:80, flexShrink:0, textAlign:'right', display:'flex', alignItems:'center', gap:8, justifyContent:'flex-end' }}>
              <span style={{ fontSize:16, fontWeight:700, color:s.textColor }}>{count}</span>
              <span style={{ fontSize:11, color:'var(--text-3)', minWidth:36 }}>({pct}%)</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FunnelReport({ stages, clients }) {
  const totalAll = clients.length || 1;
  const cerrado  = clients.filter(c=>c.stageId==='cerrado');
  const perdido  = clients.filter(c=>c.stageId==='perdido');

  return (
    <div>
      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:12, marginBottom:28 }}>
        {[
          {l:'Total leads',   v:clients.length,                                                                    c:'#e8eaf0'},
          {l:'En pipeline',   v:clients.filter(c=>c.stageId!=='cerrado'&&c.stageId!=='perdido').length,            c:'#fbbf24'},
          {l:'Cerrados',      v:cerrado.length,                                                                    c:'#4ade80'},
          {l:'Perdidos',      v:perdido.length,                                                                    c:'#f87171'},
          {l:'Tasa conversión',v:`${Math.round(cerrado.length/totalAll*100)}%`,                                    c:'#60a5fa'},
        ].map(s=>(
          <div key={s.l} style={{ background:'var(--bg-raised)', boxShadow:'-3px -3px 8px rgba(255,255,255,0.04),3px 3px 10px rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'14px 16px', textAlign:'center' }}>
            <div style={{ fontSize:9, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.09em', marginBottom:8 }}>{s.l}</div>
            <div style={{ fontSize:28, fontWeight:700, color:s.c, lineHeight:1 }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Funnel viz */}
      <div style={{ background:'var(--bg-card)', boxShadow:'-6px -6px 16px rgba(255,255,255,0.03),6px 6px 20px rgba(0,0,0,0.55)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'24px 28px' }}>
        <div style={{ fontSize:12, fontWeight:700, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.09em', marginBottom:20 }}>Pipeline — Embudo de conversión</div>
        <FunnelViz stages={stages} clients={clients}/>

        {/* Outcome row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginTop:24, paddingTop:20, borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          {[
            {label:'✅ Cerrados',  val:cerrado.length, color:'#4ade80', pct:Math.round(cerrado.length/totalAll*100)},
            {label:'❌ Perdidos',  val:perdido.length, color:'#f87171', pct:Math.round(perdido.length/totalAll*100)},
            {label:'🎯 Tasa cierre',val:`${Math.round(cerrado.length/(cerrado.length+perdido.length||1)*100)}%`, color:'#60a5fa', pct:null},
          ].map(item => (
            <div key={item.label} style={{ textAlign:'center', padding:'16px 12px', background:'rgba(255,255,255,0.03)', borderRadius:12, border:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize:10, color:item.color, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>{item.label}</div>
              <div style={{ fontSize:32, fontWeight:700, color:item.color, lineHeight:1, marginBottom:4 }}>{item.val}</div>
              {item.pct!==null && <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{item.pct}% del total</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrigenReport({ clients }) {
  const OCOL = {'Referido':'#60a5fa','Showroom':'#60a5fa','Web':'#34d399','Redes sociales':'#f472b6','Llamada':'#fbbf24'};
  const totalAll = clients.length || 1;
  const byOrigin = {};
  clients.forEach(c => { byOrigin[c.origin]=(byOrigin[c.origin]||0)+1; });
  const origins = Object.entries(byOrigin).sort((a,b)=>b[1]-a[1]);
  const maxO = Math.max(...origins.map(([,v])=>v),1);
  return (
    <div style={{ background:'var(--bg-card)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:16, padding:20 }}>
      <div style={{ fontSize:11, fontWeight:700, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:16 }}>Distribución por origen</div>
      {origins.map(([o,count]) => (
        <div key={o} style={{ marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
            <span style={{ fontSize:13, color:'var(--text-1)', display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:7,height:7,borderRadius:'50%',background:OCOL[o]||'#8f95a8',boxShadow:'0 0 5px '+(OCOL[o]||'#8f95a8') }}/>
              {o}
            </span>
            <span style={{ fontSize:13, fontWeight:700, color:OCOL[o]||'#8f95a8' }}>{count} <span style={{ color:'var(--text-3)', fontWeight:400, fontSize:11 }}>({Math.round(count/totalAll*100)}%)</span></span>
          </div>
          <ReportBar pct={count/maxO*100} color={OCOL[o]||'#8f95a8'}/>
        </div>
      ))}
    </div>
  );
}

function MensualReport({ clients, users }) {
  const cerrado = clients.filter(c=>c.stageId==='cerrado');
  const userMap = Object.fromEntries((users||[]).map(u=>[u.id, u.name]));
  const COLORS  = ['#60a5fa','#34d399','#f472b6','#fbbf24','#f87171','#a78bfa'];

  if (cerrado.length === 0) return (
    <div style={{ textAlign:'center', padding:60, color:'var(--text-3)', fontSize:13 }}>
      📭 Sin ventas cerradas aún
    </div>
  );

  // Summary by advisor (bar chart)
  const byAdvisor = {};
  cerrado.forEach(c => {
    const name = userMap[c.ownerId] || 'Sin asignar';
    if (!byAdvisor[name]) byAdvisor[name] = [];
    byAdvisor[name].push(c);
  });
  const advisors = Object.entries(byAdvisor).sort((a,b)=>b[1].length-a[1].length);
  const maxA = Math.max(...advisors.map(([,v])=>v.length),1);

  // Helper: time in pipeline (days from first history to cerrado)
  const pipelineDays = (c) => {
    const first = (c.pipelineHistory||[])[0];
    const last  = (c.pipelineHistory||[]).filter(h=>h.to==='cerrado').slice(-1)[0];
    if (!first||!last) return null;
    const days = Math.round((new Date(last.date)-new Date(first.date))/86400000);
    return days;
  };

  const th = { padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', borderBottom:'1px solid rgba(255,255,255,0.07)', whiteSpace:'nowrap', background:'var(--bg-deep)' };
  const td = (extra={}) => ({ padding:'10px 14px', fontSize:12, borderBottom:'1px solid rgba(255,255,255,0.05)', ...extra });

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Summary bar chart */}
      <div style={{ background:'var(--bg-card)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:16, padding:20 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:16 }}>Resumen por asesor</div>
        {advisors.map(([advisor, cs], i) => (
          <div key={advisor} style={{ marginBottom:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <span style={{ fontSize:13, color:'var(--text-1)', display:'flex', alignItems:'center', gap:7 }}>
                <span style={{ width:7,height:7,borderRadius:'50%',background:COLORS[i%COLORS.length],boxShadow:'0 0 6px '+COLORS[i%COLORS.length] }}/>
                {advisor}
              </span>
              <span style={{ fontSize:14, fontWeight:700, color:COLORS[i%COLORS.length] }}>{cs.length} venta{cs.length!==1?'s':''}</span>
            </div>
            <ReportBar pct={cs.length/maxA*100} color={COLORS[i%COLORS.length]} height={12}/>
          </div>
        ))}
      </div>

      {/* Detailed table per advisor */}
      {advisors.map(([advisor, cs], i) => (
        <div key={advisor} style={{ background:'var(--bg-card)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:10,height:10,borderRadius:'50%',background:COLORS[i%COLORS.length],boxShadow:'0 0 8px '+COLORS[i%COLORS.length],flexShrink:0 }}/>
            <span style={{ fontSize:14, fontWeight:700 }}>{advisor}</span>
            <span style={{ fontSize:12, color:'var(--text-3)', marginLeft:'auto' }}>{cs.length} venta{cs.length!==1?'s':''}</span>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead>
                <tr>
                  {['Cliente','Teléfono','Vehículo','Origen','Cerrado el','Días en pipeline'].map(h=><th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {cs.map(c => {
                  const closeEntry = (c.pipelineHistory||[]).filter(h=>h.to==='cerrado').slice(-1)[0];
                  const closeDate  = closeEntry?.date?.split('T')[0] || '—';
                  const days       = pipelineDays(c);
                  return (
                    <tr key={c.id}
                      onMouseEnter={e=>Array.from(e.currentTarget.cells).forEach(td=>td.style.background='var(--bg-raised)')}
                      onMouseLeave={e=>Array.from(e.currentTarget.cells).forEach(td=>td.style.background='transparent')}>
                      <td style={td({ fontWeight:600, color:'var(--text-1)' })}>{c.name}</td>
                      <td style={td()}>{c.phone||'—'}</td>
                      <td style={td({ color:'var(--text-2)' })}>{c.vehicle||'—'}</td>
                      <td style={td()}>
                        {c.origin && <span style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:'rgba(0,93,165,0.12)', color:'#60a5fa', border:'1px solid rgba(0,93,165,0.25)' }}>{c.origin}</span>}
                      </td>
                      <td style={td({ color:'#4ade80' })}>{closeDate}</td>
                      <td style={td({ textAlign:'center' })}>
                        {days !== null
                          ? <span style={{ fontWeight:700, color: days<=7?'#4ade80':days<=30?'#fbbf24':'#f87171' }}>{days}d</span>
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClientesReport({ clients, stages, users }) {
  const stageMap = Object.fromEntries(stages.map(s=>[s.id,s]));
  const userMap  = Object.fromEntries((users||[]).map(u=>[u.id, u.name]));

  const data = clients.map(c => {
    const tasks   = c.tasks || [];
    const done    = tasks.filter(t=>t.done).length;
    const onTime  = tasks.filter(t=>{ if(!t.done||!t.completedAt)return false; return new Date(t.completedAt)<=new Date(`${t.dueDate}T${t.dueTime||'23:59'}`); }).length;
    const pct     = done > 0 ? Math.round(onTime/done*100) : null;
    const advisor = userMap[c.ownerId] || 'Sin asignar';
    // Parse vehicle into brand + model (first word = brand, rest = model)
    const vParts  = (c.vehicle||'').split(' ');
    const vBrand  = vParts[0]||'';
    const vModel  = vParts.slice(1).join(' ')||'';
    // Payment: could be array string "Contado, Crédito" or single
    const payment = Array.isArray(c.payment) ? c.payment.join(', ') : (c.payment||'—');
    return { ...c, done, onTime, pct, advisor, vBrand, vModel, payment };
  }).sort((a,b)=>a.name.localeCompare(b.name));

  const th = { padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', borderBottom:'1px solid rgba(255,255,255,0.07)', whiteSpace:'nowrap', background:'var(--bg-deep)' };
  const td = (extra={}) => ({ padding:'10px 14px', fontSize:12, borderBottom:'1px solid rgba(255,255,255,0.05)', ...extra });

  const cols = ['Cliente','Asesor','Marca','Vehículo','Origen','Forma de pago','Etapa','Tareas','On-time %'];

  return (
    <div>
      <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:14 }}>
        {data.length} cliente{data.length!==1?'s':''} en el sistema.
      </div>
      <div style={{ background:'var(--bg-card)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
        <div className="table-scroll" style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
            <thead>
              <tr>
                {cols.map(h=><th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map(c => {
                const stage    = stageMap[c.stageId];
                const pctColor = c.pct===null?'var(--text-3)':c.pct>=80?'#4ade80':c.pct>=50?'#fbbf24':'#f87171';
                return (
                  <tr key={c.id}
                    onMouseEnter={e=>Array.from(e.currentTarget.cells).forEach(td=>td.style.background='var(--bg-raised)')}
                    onMouseLeave={e=>Array.from(e.currentTarget.cells).forEach(td=>td.style.background='transparent')}>
                    <td style={td({ fontWeight:600, color:'var(--text-1)' })}>
                      {c.name}
                      <div style={{ fontSize:10, color:'var(--text-3)' }}>{c.phone}</div>
                    </td>
                    <td style={td({ color:'var(--text-2)' })}>{c.advisor}</td>
                    <td style={td({ color:'#60a5fa', fontWeight:600 })}>{c.vBrand||'—'}</td>
                    <td style={td({ color:'var(--text-2)' })}>{c.vModel||'—'}</td>
                    <td style={td()}>
                      {c.origin&&<span style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:'rgba(0,93,165,0.12)', color:'#60a5fa', border:'1px solid rgba(0,93,165,0.25)', whiteSpace:'nowrap' }}>{c.origin}</span>}
                    </td>
                    <td style={td({ color:'var(--text-2)', fontSize:11 })}>{c.payment}</td>
                    <td style={td()}>
                      {stage&&<span className="badge" style={{ background:stage.color, color:stage.textColor, border:'1px solid '+stage.textColor+'30', fontSize:10 }}>
                        <span style={{ width:4,height:4,borderRadius:'50%',background:stage.dot,display:'inline-block',marginRight:4 }}/>{stage.label}
                      </span>}
                    </td>
                    <td style={td({ textAlign:'center', color:'var(--text-2)', fontWeight:600 })}>{(c.tasks||[]).length}</td>
                    <td style={td()}>
                      {c.pct!==null
                        ? <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <div style={{ background:'var(--bg-deep)', borderRadius:4, height:5, width:48, overflow:'hidden', border:'1px solid var(--border)', flexShrink:0 }}>
                              <div style={{ height:'100%', width:c.pct+'%', background:pctColor, borderRadius:4 }}/>
                            </div>
                            <span style={{ fontSize:11, fontWeight:700, color:pctColor }}>{c.pct}%</span>
                          </div>
                        : <span style={{ color:'var(--text-3)', fontSize:12 }}>—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TareasReport({ clients }) {
  const all     = clients.flatMap(c=>(c.tasks||[]).map(t=>({...t,clientName:c.name})));
  const total   = all.length;
  const done    = all.filter(t=>t.done).length;
  const onTime  = all.filter(t=>{ if(!t.done||!t.completedAt)return false; return new Date(t.completedAt)<=new Date(`${t.dueDate}T${t.dueTime||'23:59'}`); }).length;
  const late    = done - onTime;
  const pending = all.filter(t=>!t.done).length;
  const overdue = all.filter(t=>!t.done&&new Date(`${t.dueDate}T${t.dueTime||'23:59'}`)<new Date()).length;
  const pct     = done>0?Math.round(onTime/done*100):0;
  const byType  = {};
  all.forEach(t=>{ byType[t.type]=(byType[t.type]||{total:0,done:0}); byType[t.type].total++; if(t.done)byType[t.type].done++; });
  const types   = Object.entries(byType).sort((a,b)=>b[1].total-a[1].total);

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:12, marginBottom:20 }}>
        {[{l:'Total',v:total,c:'#e8eaf0'},{l:'Completadas',v:done,c:'#4ade80'},{l:'A tiempo',v:onTime,c:'#60a5fa'},{l:'Con retraso',v:late,c:'#f87171'},{l:'Pendientes',v:pending,c:'#fbbf24'},{l:'On-time',v:pct+'%',c:pct>=80?'#4ade80':pct>=50?'#fbbf24':'#f87171'}].map(s=>(
          <div key={s.l} style={{ background:'var(--bg-raised)', boxShadow:'var(--neu-btn)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 14px' }}>
            <div style={{ fontSize:10, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', marginBottom:6 }}>{s.l}</div>
            <div style={{ fontSize:22, fontWeight:700, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'var(--bg-card)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:16, padding:20 }}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:16 }}>Por tipo de tarea</div>
        {types.map(([type, stats]) => (
          <div key={type} style={{ marginBottom:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <span style={{ fontSize:13, color:'var(--text-1)' }}>{type}</span>
              <span style={{ fontSize:12, color:'var(--text-3)' }}>{stats.done}/{stats.total} completadas</span>
            </div>
            <ReportBar pct={stats.total>0?stats.done/stats.total*100:0} color="#60a5fa"/>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsView({ stages, clients, users, currentUser }) {
  const [active, setActive] = useState('funnel');

  // ── Brand-filtered clients for reports ──────────────────────────────────
  // Admin sees everything. Others see only clients whose vehicle brand
  // matches their allowedBrands (or all if allowedBrands is empty).
  const reportClients = useMemo(() => {
    if (!currentUser || currentUser.role === 'admin') return clients;
    const allowed = currentUser.allowedBrands || [];
    if (allowed.length === 0) return clients; // no restriction = see all
    // Filter clients whose vehicle starts with one of the allowed brand names
    // We need catalog to map brandId→name, but we can use the vehicle string directly
    // vehicle format: "Toyota Hilux 2024" — check if starts with any allowed brand name
    // We'll pass catalog names via users list
    const allowedBrandIds = new Set(allowed);
    // Build brand name set from all users' catalogs isn't available here,
    // so filter by ownerId: see clients owned by users who share at least one brand
    const visibleOwners = new Set(
      (users || [])
        .filter(u => {
          if (u.role === 'admin') return true;
          const ub = u.allowedBrands || [];
          return ub.some(b => allowedBrandIds.has(b));
        })
        .map(u => u.id)
    );
    return clients.filter(c => visibleOwners.has(c.ownerId));
  }, [clients, currentUser, users]);

  const visibleBrandNote = currentUser && currentUser.role !== 'admin' && (currentUser.allowedBrands||[]).length > 0
    ? `Mostrando datos de asesores con marcas compartidas`
    : null;
  const menuItem = id => ({
    fontFamily:'DM Sans,sans-serif', fontSize:13, padding:'11px 16px',
    background: active===id?'linear-gradient(135deg,rgba(0,93,165,0.2),rgba(108,99,255,0.05))':'transparent',
    boxShadow:  active===id?'var(--neu-inset)':'none',
    border:     active===id?'1px solid rgba(0,93,165,0.3)':'1px solid transparent',
    borderRadius:10, cursor:'pointer', width:'100%', textAlign:'left',
    color:      active===id?'#60a5fa':'var(--text-2)',
    fontWeight: active===id?700:400,
    transition:'all .15s', display:'flex', alignItems:'center', gap:10,
  });
  return (
    <div className="reports-layout" style={{ display:'flex', gap:0, minHeight:'calc(100vh - 160px)' }}>
      <div className="report-sidebar" style={{ width:220, flexShrink:0, padding:'0 0 20px 20px', borderRight:'1px solid var(--border)' }}>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.09em', padding:'4px 4px 12px' }}>Reportes</div>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {REPORT_MENU.map(r=>(
            <button key={r.id} style={menuItem(r.id)} onClick={()=>setActive(r.id)}>
              <span style={{ fontSize:15 }}>{r.icon}</span>{r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="report-content" style={{ flex:1, padding:'0 20px 28px 24px', overflowX:'hidden' }}>
        <div style={{ marginBottom:20 }}>
          <h2 style={{ fontSize:18, fontWeight:700, marginBottom:4, color:'#005da5' }}>
            {REPORT_MENU.find(r=>r.id===active)?.icon} {REPORT_MENU.find(r=>r.id===active)?.label}
          </h2>
          {visibleBrandNote && (
            <div style={{ fontSize:11, color:'#60a5fa', background:'rgba(0,93,165,0.1)', border:'1px solid rgba(0,93,165,0.25)', borderRadius:8, padding:'5px 12px', display:'inline-flex', alignItems:'center', gap:6 }}>
              🔒 {visibleBrandNote}
            </div>
          )}
        </div>
        {active==='funnel'   && <FunnelReport   stages={stages} clients={reportClients}/>}
        {active==='origen'   && <OrigenReport   clients={reportClients}/>}
        {active==='mensual'  && <MensualReport  clients={reportClients} users={users}/>}
        {active==='clientes' && <ClientesReport clients={reportClients} stages={stages} users={users}/>}
        {active==='tareas'   && <TareasReport   clients={reportClients}/>}
      </div>
    </div>
  );
}

// ── SETTINGS ─────────────────────────────────────────────────────────────────
function ConfigCard({ title, children }) {
  return (
    <div style={{ background:'var(--bg-card)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:16, padding:22, marginBottom:20 }}>
      <div style={{ fontSize:11, fontWeight:700, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:16 }}>{title}</div>
      {children}
    </div>
  );
}

function TagList({ items, onAdd, onRemove, placeholder, isAdmin }) {
  const [val, setVal] = useState('');
  const add = () => { if(!val.trim())return; onAdd(val.trim()); setVal(''); };
  return (
    <div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
        {items.map(item=>(
          <div key={item} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 12px', borderRadius:20, background:'rgba(0,93,165,0.12)', border:'1px solid rgba(0,93,165,0.3)', color:'#60a5fa', fontSize:12, fontWeight:500 }}>
            {item}
            {isAdmin&&<button onClick={()=>onRemove(item)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(96,165,250,0.6)', fontSize:14, lineHeight:1, padding:'0 0 0 4px', fontFamily:'inherit' }}
              onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
              onMouseLeave={e=>e.currentTarget.style.color='rgba(96,165,250,0.6)'}>×</button>}
          </div>
        ))}
        {items.length===0&&<span style={{ fontSize:12, color:'var(--text-3)' }}>Sin elementos</span>}
      </div>
      {isAdmin&&<div style={{ display:'flex', gap:8 }}>
        <input className="neu-input" style={{ flex:1, maxWidth:240 }} placeholder={placeholder} value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()}/>
        <ExoBtn size='exo-sm' onClick={add}>+ Agregar</ExoBtn>
      </div>}
    </div>
  );
}

export function SettingsView({ stages, clients, isAdmin, onAddStage, onRemoveStage, onReorderStages, catalog=[], onAddBrand, onRemoveBrand, onAddRef, onRemoveRef, onAddYear, onRemoveYear, origins=[], paymentTypes=[], taskTypes=[], lossReasons=[], onAddOrigin, onRemoveOrigin, onAddPaymentType, onRemovePaymentType, onAddTaskType, onRemoveTaskType, onAddLossReason, onRemoveLossReason, onEditLossReason, enabledWidgets=[], onToggleWidget, currentUserRole='vendedor' }) {
  const [label, setLabel] = useState('');
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);

  const editable = stages.filter(s=>!s.fixed);
  const fixed    = stages.filter(s=>s.fixed);

  const add = () => {
    const l=label.trim(); if(!l)return;
    if(stages.find(s=>s.label===l))return alert('Esa etapa ya existe');
    onAddStage(l); setLabel('');
  };
  const handleDrop = (targetIdx) => {
    if(dragIdx===null||dragIdx===targetIdx)return;
    const reordered=[...editable]; const[moved]=reordered.splice(dragIdx,1); reordered.splice(targetIdx,0,moved);
    onReorderStages([...reordered,...fixed]); setDragIdx(null); setOverIdx(null);
  };

  return (
    <div className="settings-grid" style={{ padding:'0 20px 40px', maxWidth:900, margin:'0 auto' }}>
      <h2 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>⚙️ Configuración</h2>
      <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:24 }}>Administra catálogos, etapas y parámetros del sistema.</p>

      <div className="config-grid grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:0 }}>
        {/* Origins */}
        <ConfigCard title="📍 Orígenes de leads">
          <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:14, lineHeight:1.5 }}>Define de dónde vienen los clientes al crear o editar un lead.</p>
          <TagList items={origins} onAdd={onAddOrigin} onRemove={onRemoveOrigin} placeholder="Nuevo origen..." isAdmin={isAdmin}/>
        </ConfigCard>

        {/* Payment types */}
        <ConfigCard title="💳 Formas de pago">
          <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:14, lineHeight:1.5 }}>Los asesores pueden seleccionar una o varias al registrar un cliente.</p>
          <TagList items={paymentTypes} onAdd={onAddPaymentType} onRemove={onRemovePaymentType} placeholder="Nueva forma de pago..." isAdmin={isAdmin}/>
        </ConfigCard>
      </div>

      {/* Catalog */}
      {isAdmin&&(
        <ConfigCard title="🚗 Catálogo de vehículos">
          <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:18, lineHeight:1.5 }}>Gestiona marcas → referencias → años. Luego asigna marcas a cada asesor en el módulo de Usuarios.</p>
          <CatalogSettings catalog={catalog} onAddBrand={onAddBrand} onRemoveBrand={onRemoveBrand} onAddRef={onAddRef} onRemoveRef={onRemoveRef} onAddYear={onAddYear} onRemoveYear={onRemoveYear}/>
        </ConfigCard>
      )}

      {/* Stages */}
      <ConfigCard title="🔄 Etapas del pipeline">
        {isAdmin&&<p style={{ fontSize:12, color:'var(--text-3)', marginBottom:16, lineHeight:1.5 }}>Arrastra ⠿ para reordenar. Solo el administrador puede agregar o eliminar etapas.</p>}
        {editable.map((s,i)=>{
          const count=clients.filter(c=>c.stageId===s.id).length;
          const isDragging=dragIdx===i, isOver=overIdx===i;
          return(
            <div key={s.id} draggable={isAdmin}
              onDragStart={()=>isAdmin&&setDragIdx(i)}
              onDragOver={e=>{ e.preventDefault(); isAdmin&&setOverIdx(i); }}
              onDragLeave={()=>isAdmin&&setOverIdx(null)}
              onDrop={()=>handleDrop(i)}
              onDragEnd={()=>{ setDragIdx(null); setOverIdx(null); }}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:isOver?'rgba(0,93,165,0.08)':'var(--bg-raised)', boxShadow:'var(--neu-btn)', border:isOver?'1px solid rgba(0,93,165,0.4)':'1px solid var(--border)', borderRadius:12, marginBottom:8, transition:'all .15s', opacity:isDragging?0.4:1, cursor:isAdmin?'grab':'default' }}>
              <span style={{ fontSize:14, color:'var(--text-3)', flexShrink:0 }}>{isAdmin?'⠿':'·'}</span>
              <span style={{ width:8, height:8, borderRadius:'50%', background:s.dot, boxShadow:'0 0 5px '+s.dot, flexShrink:0 }}/>
              <span style={{ flex:1, fontSize:13, fontWeight:500 }}>{s.label}</span>
              <span style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', background:'var(--bg-deep)', boxShadow:'var(--neu-inset)', border:'1px solid var(--border)', padding:'3px 10px', borderRadius:20 }}>{count}</span>
              {isAdmin&&<button className='exo-btn exo-danger exo-sm' onClick={()=>{ if(window.confirm(`¿Eliminar "${s.label}"?`))onRemoveStage(s.id); }}><div className='btn-outer'><div className='btn-inner'><span>Eliminar</span></div></div></button>}
            </div>
          );
        })}
        {fixed.map(s=>{
          const count=clients.filter(c=>c.stageId===s.id).length;
          return(
            <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'var(--bg-deep)', boxShadow:'var(--neu-inset)', border:'1px solid var(--border)', borderRadius:12, marginBottom:8, opacity:0.7 }}>
              <span style={{ fontSize:14, color:'var(--text-3)', flexShrink:0 }}>🔒</span>
              <span style={{ width:8, height:8, borderRadius:'50%', background:s.dot, boxShadow:'0 0 5px '+s.dot, flexShrink:0 }}/>
              <span style={{ flex:1, fontSize:13, fontWeight:500 }}>{s.label}</span>
              <span style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', border:'1px solid var(--border)', padding:'3px 10px', borderRadius:20 }}>{count}</span>
            </div>
          );
        })}
        {isAdmin&&<div style={{ display:'flex', gap:10, marginTop:14 }}>
          <input className="neu-input" style={{ maxWidth:240 }} placeholder="Nueva etapa..." value={label} onChange={e=>setLabel(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add()}/>
          <ExoBtn size='exo-sm' onClick={add}>+ Agregar</ExoBtn>
        </div>}
      </ConfigCard>

      {/* Task Types */}
      <ConfigCard title="📌 Tipos de tarea">
        <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:14, lineHeight:1.5 }}>Define los tipos de actividades disponibles al crear tareas en el seguimiento.</p>
        <TagList items={taskTypes} onAdd={onAddTaskType} onRemove={onRemoveTaskType} placeholder="Nuevo tipo de tarea..." isAdmin={isAdmin}/>
      </ConfigCard>

      {/* Loss Reasons */}
      <ConfigCard title="❌ Motivos de pérdida">
        <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:14, lineHeight:1.5 }}>Razones disponibles al marcar un lead como perdido. Obligatorio seleccionar una.</p>
        <TagList items={lossReasons} onAdd={onAddLossReason} onRemove={onRemoveLossReason} placeholder="Nuevo motivo de pérdida..." isAdmin={isAdmin}/>
      </ConfigCard>

      {/* Dashboard Widgets */}
      <ConfigCard title="📊 Widgets del dashboard">
        <WidgetSettings enabledWidgets={enabledWidgets} onToggle={onToggleWidget} isAdmin={isAdmin} currentUserRole={currentUserRole}/>
      </ConfigCard>

      <div style={{ padding:'15px 18px', background:'var(--bg-deep)', boxShadow:'var(--neu-inset)', border:'1px solid var(--border)', borderRadius:12, fontSize:12, color:'var(--text-3)', lineHeight:1.6 }}>
        <span style={{ fontWeight:700, color:'#005da5', display:'block', marginBottom:3 }}>Fase 2 — Próximamente</span>
        WhatsApp API: mensajes automáticos al mover clientes entre etapas. Lead API: captura automática desde formularios y redes sociales.
      </div>
    </div>
  );
}
