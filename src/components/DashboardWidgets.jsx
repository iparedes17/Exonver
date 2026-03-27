import React, { useState, useMemo } from 'react';
import { daysSince, getTemp, getNextTask } from '../utils/helpers';

// ── ALL AVAILABLE WIDGETS ─────────────────────────────────────────────────────
export const ALL_WIDGETS = [
  { id:'leads_hoy',        label:'Leads nuevos hoy',          icon:'🆕', roles:['admin','gerente','vendedor'] },
  { id:'sin_gestionar',    label:'Sin gestionar',             icon:'⏳', roles:['admin','gerente','vendedor'] },
  { id:'contactados',      label:'Contactados < 15 min',      icon:'⚡', roles:['admin','gerente','vendedor'] },
  { id:'citas',            label:'Citas agendadas hoy',       icon:'📅', roles:['admin','gerente','vendedor'] },
  { id:'pruebas',          label:'Pruebas de manejo hoy',     icon:'🚗', roles:['admin','gerente','vendedor'] },
  { id:'propuestas',       label:'Propuestas enviadas',       icon:'📋', roles:['admin','gerente','vendedor'] },
  { id:'creditos',         label:'Créditos en proceso',       icon:'💳', roles:['admin','gerente','vendedor'] },
  { id:'tasa_etapa',       label:'Tasa de conversión x etapa',icon:'📊', roles:['admin','gerente'] },
  { id:'perdidos_motivo',  label:'Perdidos por motivo',       icon:'❌', roles:['admin','gerente'] },
  { id:'sin_gestion_hrs',  label:'Leads sin gestión > X horas',icon:'🔴', roles:['admin','gerente'] },
  { id:'ranking_asesores', label:'Ranking de asesores',       icon:'🏆', roles:['admin','gerente'] },
  { id:'tiempo_etapa',     label:'Tiempo promedio por etapa', icon:'⏱', roles:['admin','gerente'] },
  { id:'conversion_canal', label:'Conversión por canal',      icon:'🌐', roles:['admin','gerente'] },
];

const DEFAULT_ENABLED = ['leads_hoy','sin_gestionar','citas','pruebas','propuestas','creditos','ranking_asesores'];

// ── WIDGET SETTINGS ───────────────────────────────────────────────────────────
export function WidgetSettings({ enabledWidgets, onToggle, isAdmin, currentUserRole }) {
  const visible = ALL_WIDGETS.filter(w => w.roles.includes(currentUserRole));
  return (
    <div>
      <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:14, lineHeight:1.6 }}>
        Activa o desactiva los widgets del dashboard. Solo el admin puede cambiar esto.
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {visible.map(w => {
          const on = enabledWidgets.includes(w.id);
          return (
            <div key={w.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'var(--bg-raised)', boxShadow:'var(--neu-btn)', border:'1px solid var(--border)', borderRadius:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:16 }}>{w.icon}</span>
                <span style={{ fontSize:13 }}>{w.label}</span>
                {!w.roles.includes('vendedor') && <span style={{ fontSize:9, color:'#fbbf24', background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.25)', borderRadius:5, padding:'1px 6px', fontWeight:700 }}>GERENCIA</span>}
              </div>
              {isAdmin ? (
                <div onClick={()=>onToggle(w.id)} style={{ width:38, height:20, borderRadius:10, cursor:'pointer', transition:'background .2s', background:on?'#005da5':'rgba(255,255,255,0.1)', position:'relative', flexShrink:0 }}>
                  <div style={{ position:'absolute', top:2, left:on?20:2, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,0.4)' }}/>
                </div>
              ) : (
                <span style={{ fontSize:11, color:on?'#4ade80':'var(--text-3)' }}>{on?'Activo':'Inactivo'}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── INDIVIDUAL WIDGETS ────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color='var(--text-1)', bg='var(--bg-card)', onClick }) {
  return (
    <div onClick={onClick} style={{ background:bg, boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 16px', cursor:onClick?'pointer':'default', transition:'all .18s' }}
      onMouseEnter={e=>{ if(onClick){ e.currentTarget.style.borderColor='rgba(0,93,165,0.4)'; e.currentTarget.style.transform='translateY(-2px)'; }}}
      onMouseLeave={e=>{ if(onClick){ e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>{icon} {label}</div>
          <div style={{ fontSize:28, fontWeight:700, color, lineHeight:1 }}>{value}</div>
          {sub && <div style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function RankingWidget({ clients, users }) {
  const userMap = Object.fromEntries(users.map(u=>[u.id, u.name]));
  const byUser  = {};
  clients.forEach(c => {
    const name = userMap[c.ownerId]||'Sin asignar';
    byUser[name] = (byUser[name]||0) + (c.stageId==='cerrado'?1:0);
  });
  const rank = Object.entries(byUser).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const max  = Math.max(...rank.map(([,v])=>v),1);
  const MEDALS = ['🥇','🥈','🥉','4️⃣','5️⃣'];
  return (
    <div style={{ background:'var(--bg-card)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 16px' }}>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>🏆 Ranking de asesores</div>
      {rank.length===0 ? <div style={{ fontSize:12, color:'var(--text-3)' }}>Sin ventas aún</div> : rank.map(([name,count],i)=>(
        <div key={name} style={{ marginBottom:8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
            <span style={{ fontSize:12 }}>{MEDALS[i]} {name}</span>
            <span style={{ fontSize:12, fontWeight:700, color:'#4ade80' }}>{count}</span>
          </div>
          <div style={{ background:'var(--bg-deep)', borderRadius:4, height:5, overflow:'hidden' }}>
            <div style={{ height:'100%', width:(count/max*100)+'%', background:'linear-gradient(90deg,#005da5,#0077c8)', borderRadius:4 }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function PerdidosMotivoWidget({ clients }) {
  const motivos = {};
  clients.filter(c=>c.stageId==='perdido').forEach(c=>{
    const ph = (c.pipelineHistory||[]).filter(h=>h.to==='perdido').slice(-1)[0];
    const motivo = ph?.note?.replace('Motivo: ','').split('.')[0] || 'Sin motivo';
    motivos[motivo] = (motivos[motivo]||0)+1;
  });
  const list = Object.entries(motivos).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const max  = Math.max(...list.map(([,v])=>v),1);
  return (
    <div style={{ background:'var(--bg-card)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 16px' }}>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>❌ Perdidos por motivo</div>
      {list.length===0 ? <div style={{ fontSize:12, color:'var(--text-3)' }}>Sin leads perdidos</div> : list.map(([motivo,count])=>(
        <div key={motivo} style={{ marginBottom:8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
            <span style={{ fontSize:11, color:'var(--text-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:180 }}>{motivo}</span>
            <span style={{ fontSize:11, fontWeight:700, color:'#f87171', flexShrink:0 }}>{count}</span>
          </div>
          <div style={{ background:'var(--bg-deep)', borderRadius:4, height:4, overflow:'hidden' }}>
            <div style={{ height:'100%', width:(count/max*100)+'%', background:'#f87171', borderRadius:4 }}/>
          </div>
        </div>
      ))}
    </div>
  );
}

function TiempoEtapaWidget({ clients, stages }) {
  const stageMap = Object.fromEntries(stages.map(s=>[s.id,s]));
  const avgByStage = {};
  stages.filter(s=>!s.fixed).forEach(s=>{
    const inStage = clients.filter(c=>c.stageId===s.id);
    if(!inStage.length) return;
    const avgDays = inStage.reduce((sum,c)=>sum+daysSince(c.lastContact),0)/inStage.length;
    avgByStage[s.id] = { label:s.label, dot:s.dot, avg:Math.round(avgDays), count:inStage.length };
  });
  const list = Object.values(avgByStage).sort((a,b)=>b.avg-a.avg);
  return (
    <div style={{ background:'var(--bg-card)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:14, padding:'14px 16px' }}>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>⏱ Tiempo promedio por etapa</div>
      {list.map(s=>(
        <div key={s.label} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:s.dot, boxShadow:'0 0 5px '+s.dot, flexShrink:0 }}/>
          <span style={{ fontSize:12, flex:1 }}>{s.label}</span>
          <span style={{ fontSize:12, fontWeight:700, color: s.avg>=7?'#f87171':s.avg>=4?'#fbbf24':'#4ade80' }}>{s.avg}d</span>
          <span style={{ fontSize:10, color:'var(--text-3)' }}>({s.count})</span>
        </div>
      ))}
    </div>
  );
}

// ── MAIN DASHBOARD WIDGET GRID ────────────────────────────────────────────────
export function DashboardWidgets({ clients, stages, users, currentUser, enabledWidgets }) {
  const today = new Date().toISOString().split('T')[0];
  const now   = new Date();
  const isManager = currentUser.role !== 'vendedor';

  // Scoped clients (current user sees only their own)
  const myClients = useMemo(() => {
    if (currentUser.role === 'admin') return clients;
    return clients.filter(c => c.ownerId === currentUser.id);
  }, [clients, currentUser]);

  const active = myClients.filter(c=>c.stageId!=='cerrado'&&c.stageId!=='perdido');

  // Widget computations
  const w = useMemo(()=>({
    leads_hoy:       myClients.filter(c=>{
      const first=(c.pipelineHistory||[])[0];
      return first?.date?.startsWith(today);
    }).length,
    sin_gestionar:   myClients.filter(c=>{
      if(c.stageId==='cerrado'||c.stageId==='perdido')return false;
      return daysSince(c.lastContact)>=1;
    }).length,
    contactados:     myClients.filter(c=>{
      if(c.stageId!=='contactado')return false;
      const last=(c.pipelineHistory||[]).filter(h=>h.to==='contactado').slice(-1)[0];
      if(!last)return false;
      const mins=(now-new Date(last.date))/60000;
      return mins<=15;
    }).length,
    citas:           myClients.filter(c=>{
      const next=getNextTask(c.tasks);
      return next?.dueDate===today && next?.type?.toLowerCase().includes('visita');
    }).length,
    pruebas:         myClients.filter(c=>c.stageId==='prueba').length,
    propuestas:      myClients.filter(c=>c.stageId==='propuesta').length,
    creditos:        myClients.filter(c=>c.stageId==='credito').length,
    sin_gestion_hrs: myClients.filter(c=>{
      if(c.stageId==='cerrado'||c.stageId==='perdido')return false;
      const hrs=(now-new Date(c.lastContact+'T12:00:00'))/3600000;
      return hrs>=24;
    }).length,
  }), [myClients, today]);

  const enabled = (id) => enabledWidgets.includes(id);

  // Responsive grid: stat cards
  const statCards = [
    enabled('leads_hoy')      && { id:'leads_hoy',      icon:'🆕', label:'Leads nuevos hoy',    value:w.leads_hoy,      color:'#60a5fa' },
    enabled('sin_gestionar')  && { id:'sin_gestionar',  icon:'⏳', label:'Sin gestionar',        value:w.sin_gestionar,  color:w.sin_gestionar>0?'#f87171':'#4ade80' },
    enabled('contactados')    && { id:'contactados',    icon:'⚡', label:'Contactados <15min',   value:w.contactados,    color:'#fbbf24' },
    enabled('citas')          && { id:'citas',          icon:'📅', label:'Citas agendadas hoy',  value:w.citas,          color:'#a78bfa' },
    enabled('pruebas')        && { id:'pruebas',        icon:'🚗', label:'Pruebas de manejo',    value:w.pruebas,        color:'#34d399' },
    enabled('propuestas')     && { id:'propuestas',     icon:'📋', label:'Propuestas enviadas',  value:w.propuestas,     color:'#f472b6' },
    enabled('creditos')       && { id:'creditos',       icon:'💳', label:'Créditos en proceso',  value:w.creditos,       color:'#fbbf24' },
    enabled('sin_gestion_hrs')&& isManager && { id:'sin_gestion_hrs', icon:'🔴', label:'Sin gestión >24h', value:w.sin_gestion_hrs, color:'#f87171' },
  ].filter(Boolean);

  if (!statCards.length && !enabled('ranking_asesores') && !enabled('perdidos_motivo') && !enabled('tiempo_etapa')) return null;

  return (
    <div style={{ padding:'0 20px 20px' }}>
      {/* Stat cards grid */}
      {statCards.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:12, marginBottom:16 }}>
          {statCards.map(c=>(
            <StatCard key={c.id} icon={c.icon} label={c.label} value={c.value} color={c.color}/>
          ))}
        </div>
      )}

      {/* Rich widgets row */}
      {isManager && (enabled('ranking_asesores') || enabled('perdidos_motivo') || enabled('tiempo_etapa')) && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
          {enabled('ranking_asesores') && <RankingWidget clients={clients} users={users}/>}
          {enabled('perdidos_motivo')  && <PerdidosMotivoWidget clients={clients}/>}
          {enabled('tiempo_etapa')     && <TiempoEtapaWidget clients={clients} stages={stages}/>}
        </div>
      )}
    </div>
  );
}
