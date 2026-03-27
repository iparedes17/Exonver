import React, { useState } from 'react';
import { TempIcon, EmptyCol, ContactActions, TaskWarningIcon } from './UI';
import { CarIcon, ChevronIcon } from './Icons';

function KanbanCard({ client, stage, onClick }) {
  return (
    <div
      onClick={() => onClick(client)}
      className="fade-in"
      style={{ background:'var(--bg-card)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:12, padding:'12px 14px', cursor:'pointer', transition:'all .2s', marginBottom:10 }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow=`-5px -5px 14px rgba(255,255,255,0.06),5px 5px 16px rgba(0,0,0,0.65),0 0 18px ${stage?.dot||'#005da5'}22`; e.currentTarget.style.borderColor='var(--border-light)'; e.currentTarget.style.transform='translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow='var(--neu-shadow)'; e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}
    >
      {/* Name row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginBottom:7 }}>
        <div style={{ display:'flex', alignItems:'center', gap:5, flex:1, minWidth:0 }}>
          <TaskWarningIcon tasks={client.tasks||[]}/>
          <span style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{client.name}</span>
        </div>
        <ContactActions phone={client.phone} name={client.name}/>
      </div>
      {/* Vehicle */}
      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
        <span style={{ color:'var(--text-3)', flexShrink:0 }}><CarIcon s={12}/></span>
        <span style={{ fontSize:12, color:'var(--text-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{client.vehicle}</span>
      </div>
      {/* Footer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span style={{ fontSize:10, color:'var(--text-3)', background:'var(--bg-deep)', padding:'2px 7px', borderRadius:6, border:'1px solid var(--border)' }}>{client.origin}</span>
        <TempIcon lastContact={client.lastContact} stageId={client.stageId}/>
      </div>
    </div>
  );
}

function KanbanCol({ stage, clients, onClick }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ width: collapsed ? 160 : 224, flexShrink:0, transition:'width .25s ease', overflow:'hidden' }}>

      {/* ── HEADER — always visible ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'8px 10px 10px',
        background:'var(--bg-card)',
        boxShadow: collapsed ? 'var(--neu-shadow)' : 'none',
        border:'1px solid var(--border)',
        borderRadius: collapsed ? 12 : '12px 12px 0 0',
        gap:6, transition:'border-radius .25s',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, flex:1, minWidth:0 }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:stage.dot, boxShadow:`0 0 6px ${stage.dot}`, flexShrink:0 }}/>
          {/* Label ALWAYS visible */}
          <span style={{ fontSize:10, fontWeight:700, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.06em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {stage.label}
          </span>
        </div>
        <span style={{ fontSize:11, fontWeight:700, background:'var(--bg-deep)', boxShadow:'var(--neu-inset)', border:'1px solid var(--border)', padding:'1px 7px', borderRadius:10, color:'var(--text-3)', flexShrink:0 }}>
          {clients.length}
        </span>
        <button
          onClick={() => setCollapsed(p => !p)}
          title={collapsed ? 'Expandir' : 'Contraer'}
          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', padding:2, display:'flex', alignItems:'center', transition:'color .15s', flexShrink:0 }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
        >
          <ChevronIcon s={12} dir={collapsed ? 'right' : 'down'}/>
        </button>
      </div>

      {/* ── CARDS — hidden when collapsed ── */}
      {!collapsed && (
        <div style={{
          background:'var(--bg-deep)',
          border:'1px solid var(--border)', borderTop:'none',
          borderRadius:'0 0 12px 12px',
          padding:'10px 8px 8px',
          minHeight:60,
        }}>
          {clients.length === 0
            ? <EmptyCol/>
            : clients.map(c => <KanbanCard key={c.id} client={c} stage={stage} onClick={onClick}/>)
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
        {stages.map(s => (
          <KanbanCol key={s.id} stage={s} clients={clients.filter(c => c.stageId===s.id)} onClick={onClientClick}/>
        ))}
      </div>
    </div>
  );
}
