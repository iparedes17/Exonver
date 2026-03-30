import React, { useState } from 'react';
import { TempIcon, EmptyCol, ContactActions, TaskWarningIcon } from './UI';
import { CarIcon, ChevronIcon } from './Icons';
import { daysSince, getNextTask, formatDate } from '../utils/helpers';

// Probability by stage
const STAGE_PROB = {
  lead:20, contactado:35, seguimiento:45, prueba:60,
  credito:75, propuesta:85, cerrado:100, perdido:0,
};

function ProbabilityBadge({ stageId }) {
  const pct = STAGE_PROB[stageId];
  if (pct === undefined || pct === 0 || pct === 100) return null;
  const color = pct >= 75 ? '#4ade80' : pct >= 50 ? '#fbbf24' : '#60a5fa';
  return (
    <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:5,
      background:`${color}15`, color, border:`1px solid ${color}30` }}>
      {pct}%
    </span>
  );
}

function KanbanCard({ client, stage, onClick }) {
  const nextTask = getNextTask(client.tasks);
  const ds       = daysSince(client.lastContact);
  const isNew    = ds === 0;
  const isHot    = ds <= 1;

  return (
    <div
      onClick={() => onClick(client)}
      className="fade-in kanban-card"
      style={{
        background:'var(--bg-card)',
        boxShadow:'var(--neu-shadow)',
        border:`1px solid ${isNew?'rgba(0,93,165,0.4)':'var(--border)'}`,
        borderRadius:12, padding:'11px 13px', cursor:'pointer',
        transition:'all .2s', marginBottom:10,
        position:'relative',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow=`-5px -5px 14px rgba(255,255,255,0.06),5px 5px 16px rgba(0,0,0,0.65),0 0 18px ${stage?.dot||'#005da5'}22`; e.currentTarget.style.borderColor='var(--border-light)'; e.currentTarget.style.transform='translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow='var(--neu-shadow)'; e.currentTarget.style.borderColor=isNew?'rgba(0,93,165,0.4)':'var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}
    >
      {/* NEW badge */}
      {isNew && (
        <div style={{ position:'absolute', top:-1, right:-1, fontSize:8, fontWeight:700, padding:'2px 7px', borderRadius:'0 12px 0 8px', background:'#005da5', color:'#fff', letterSpacing:'.05em' }}>NUEVO</div>
      )}

      {/* Name row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:6 }}>
        <div style={{ display:'flex', alignItems:'center', gap:5, flex:1, minWidth:0 }}>
          <TaskWarningIcon tasks={client.tasks||[]}/>
          <span style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{client.name}</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, flexShrink:0 }}>
          <ProbabilityBadge stageId={client.stageId}/>
          <ContactActions phone={client.phone} name={client.name}/>
        </div>
      </div>

      {/* Vehicle */}
      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
        <span style={{ color:'var(--text-3)', flexShrink:0 }}><CarIcon s={11}/></span>
        <span style={{ fontSize:11, color:'var(--text-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{client.vehicle||'—'}</span>
      </div>

      {/* Metrics row */}
      <div style={{ display:'flex', flexDirection:'column', gap:4, padding:'8px 10px', background:'var(--bg-deep)', borderRadius:8, marginBottom:8, border:'1px solid rgba(255,255,255,0.04)' }}>
        {/* Last interaction */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:10, color:'var(--text-3)' }}>Última interacción</span>
          <span style={{ fontSize:10, fontWeight:600, color: ds>=7?'#f87171':ds>=4?'#fbbf24':'#4ade80' }}>
            {ds===0?'Hoy':ds===1?'Ayer':`hace ${ds}d`}
          </span>
        </div>
        {/* Next task */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:10, color:'var(--text-3)' }}>Próxima tarea</span>
          {nextTask ? (
            <span style={{ fontSize:10, fontWeight:600, color:'#60a5fa' }}>
              {nextTask.dueDate} {nextTask.dueTime||''} · {nextTask.type}
            </span>
          ) : (
            <span style={{ fontSize:10, color:'rgba(248,113,113,0.7)', fontWeight:600 }}>Sin agendar ⚠</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:10, color:'var(--text-3)', background:'var(--bg-deep)', padding:'2px 7px', borderRadius:6, border:'1px solid var(--border)', maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{client.origin||'—'}</span>
        <TempIcon lastContact={client.lastContact} stageId={client.stageId}/>
      </div>
    </div>
  );
}

function KanbanCol({ stage, clients, onClick }) {
  const [collapsed, setCollapsed] = useState(false);
  const overdue = clients.filter(c=>{
    const pending=(c.tasks||[]).filter(t=>!t.done);
    return pending.some(t=>new Date(`${t.dueDate}T${t.dueTime||'23:59'}`)<new Date());
  }).length;

  return (
    <div style={{ width: collapsed ? 160 : 238, flexShrink:0, transition:'width .25s ease', overflow:'hidden' }}>
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 10px 10px', background:'var(--bg-card)',
        boxShadow: collapsed ? 'var(--neu-shadow)' : 'none',
        border:'1px solid var(--border)',
        borderRadius: collapsed ? 12 : '12px 12px 0 0',
        gap:6, transition:'border-radius .25s',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:0 }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:stage.dot, boxShadow:`0 0 6px ${stage.dot}`, flexShrink:0 }}/>
          <span style={{ fontSize:10, fontWeight:700, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.06em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {stage.label}
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
          {overdue>0 && <span style={{ fontSize:9, fontWeight:700, padding:'1px 5px', borderRadius:5, background:'rgba(248,113,113,0.15)', color:'#f87171', border:'1px solid rgba(248,113,113,0.3)' }}>⚠{overdue}</span>}
          <span style={{ fontSize:11, fontWeight:700, background:'var(--bg-deep)', boxShadow:'var(--neu-inset)', border:'1px solid var(--border)', padding:'1px 7px', borderRadius:10, color:'var(--text-3)' }}>
            {clients.length}
          </span>
        </div>
        <button onClick={()=>setCollapsed(p=>!p)} title={collapsed?'Expandir':'Contraer'}
          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:2, display:'flex', alignItems:'center', transition:'color .15s', flexShrink:0 }}
          onMouseEnter={e=>e.currentTarget.style.color='var(--text-1)'}
          onMouseLeave={e=>e.currentTarget.style.color='var(--text-3)'}
        >
          <ChevronIcon s={12} dir={collapsed?'right':'down'}/>
        </button>
      </div>

      {!collapsed && (
        <div style={{ background:'var(--bg-deep)', border:'1px solid var(--border)', borderTop:'none', borderRadius:'0 0 12px 12px', padding:'10px 8px 8px', minHeight:60 }}>
          {clients.length===0
            ? <EmptyCol/>
            : clients.map(c=><KanbanCard key={c.id} client={c} stage={stage} onClick={onClick}/>)
          }
        </div>
      )}
    </div>
  );
}

export function KanbanBoard({ stages, clients, onClientClick }) {
  return (
    <div style={{ overflowX:'auto', padding:'4px 20px 28px' }}>
      <div style={{ display:'flex', gap:12, minWidth:'max-content', paddingBottom:8, alignItems:'flex-start' }}>
        {stages.map(s=>(
          <KanbanCol key={s.id} stage={s} clients={clients.filter(c=>c.stageId===s.id)} onClick={onClientClick}/>
        ))}
      </div>
    </div>
  );
}
