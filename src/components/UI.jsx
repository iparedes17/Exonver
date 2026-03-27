import React from 'react';
import { ORIGIN_COLORS } from '../data/constants';
import { getTemp, getTempInfo, formatDate, whatsappUrl, callUrl } from '../utils/helpers';
import { WhatsAppIcon, PhoneIcon, WarnIcon, CheckIcon } from './Icons';

export function OriginBadge({ origin }) {
  const c = ORIGIN_COLORS[origin] || { bg:'#2a2f45', text:'#8f95a8' };
  return <span className="badge" style={{ background:c.bg, color:c.text, border:`1px solid ${c.text}22` }}>{origin}</span>;
}

export function StagePill({ stage }) {
  if (!stage) return null;
  return <span className="badge" style={{ background:stage.color, color:stage.textColor, border:`1px solid ${stage.textColor}30` }}>
    <span style={{ width:5, height:5, borderRadius:'50%', background:stage.dot, display:'inline-block', marginRight:5 }}/>
    {stage.label}
  </span>;
}

export function TempBadge({ lastContact, stageId }) {
  const info = getTempInfo(lastContact, stageId);
  if (!info) return null;
  return <span style={{ fontSize:11, color:info.color, fontWeight:600 }}>{info.label}</span>;
}

// Thermometer icon with temperature color + day count
export function TempIcon({ lastContact, stageId, showDays=true }) {
  const t = getTemp(lastContact, stageId);
  if (!t) return null;
  const tip = {
    hot:'🔥 Activo — contacto reciente',
    warm:'🌡 Tibio — hace 2-3 días',
    cool:'⚠ Enfriándose — hace 4-6 días',
    cold:'🥶 Frío — más de una semana sin contacto',
    frozen:'🧊 Congelado — sin seguimiento por 2+ semanas',
  }[t.level];
  return (
    <span
      title={tip}
      style={{
        display:'inline-flex', alignItems:'center', gap:3,
        fontSize:11, fontWeight:700, color:t.color,
        background:t.bg, border:`1px solid ${t.color}30`,
        borderRadius:6, padding:'2px 7px', flexShrink:0,
        cursor:'default',
      }}
    >
      <svg width="10" height="14" viewBox="0 0 10 14" fill="none" style={{ flexShrink:0 }}>
        {/* Tube */}
        <rect x="3.5" y="1" width="3" height="8" rx="1.5" fill={t.color} opacity="0.3"/>
        <rect x="3.5" y={1 + (1-['hot','warm','cool','cold','frozen'].indexOf(t.level)/4)*7} width="3" height={(['hot','warm','cool','cold','frozen'].indexOf(t.level)/4)*7+1} rx="1" fill={t.color}/>
        {/* Bulb */}
        <circle cx="5" cy="11" r="2.5" fill={t.color}/>
        <circle cx="5" cy="11" r="1.5" fill={t.color} opacity="0.5"/>
        {/* Outline */}
        <rect x="3.5" y="1" width="3" height="8" rx="1.5" stroke={t.color} strokeWidth="0.8" fill="none"/>
        <circle cx="5" cy="11" r="2.5" stroke={t.color} strokeWidth="0.8" fill="none"/>
      </svg>
      {showDays && t.days > 0 ? `${t.days}d` : showDays ? 'Hoy' : ''}
    </span>
  );
}

export function Avatar({ name, size=36 }) {
  const initials = name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  return <div style={{ width:size, height:size, borderRadius:'50%', background:'linear-gradient(135deg,#6c63ff,#4fc3f7)', boxShadow:'0 0 12px rgba(108,99,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.33, fontWeight:700, color:'#fff', flexShrink:0 }}>{initials}</div>;
}

export function ContactActions({ phone, name }) {
  const lnk = (bg, border, color, glow) => ({
    width:32, height:32, borderRadius:8, background:bg, border:`1px solid ${border}`,
    display:'flex', alignItems:'center', justifyContent:'center', color, textDecoration:'none',
    flexShrink:0, boxShadow:`0 0 8px ${glow}`, transition:'all .18s',
  });
  return <div style={{ display:'flex', gap:6 }} onClick={e=>e.stopPropagation()}>
    <a href={whatsappUrl(phone,name)} target="_blank" rel="noreferrer" title="WhatsApp"
       style={lnk('rgba(37,211,102,0.12)','rgba(37,211,102,0.3)','#25d366','rgba(37,211,102,0.2)')}
       onMouseEnter={e=>{e.currentTarget.style.background='rgba(37,211,102,0.22)';e.currentTarget.style.boxShadow='0 0 14px rgba(37,211,102,0.5)'}}
       onMouseLeave={e=>{e.currentTarget.style.background='rgba(37,211,102,0.12)';e.currentTarget.style.boxShadow='0 0 8px rgba(37,211,102,0.2)'}}>
      <WhatsAppIcon s={14}/>
    </a>
    <a href={callUrl(phone)} title="Llamar"
       style={lnk('rgba(79,195,247,0.12)','rgba(79,195,247,0.3)','#4fc3f7','rgba(79,195,247,0.2)')}
       onMouseEnter={e=>{e.currentTarget.style.background='rgba(79,195,247,0.22)';e.currentTarget.style.boxShadow='0 0 14px rgba(79,195,247,0.5)'}}
       onMouseLeave={e=>{e.currentTarget.style.background='rgba(79,195,247,0.12)';e.currentTarget.style.boxShadow='0 0 8px rgba(79,195,247,0.2)'}}>
      <PhoneIcon s={13}/>
    </a>
  </div>;
}

export function TaskWarningIcon({ tasks=[] }) {
  const pending  = (tasks||[]).filter(t => !t.done);
  if (!pending.length) return null;

  const overdue  = pending.filter(t => new Date(`${t.dueDate}T${t.dueTime||'23:59'}`) < new Date());
  const upcoming = pending.filter(t => {
    if (overdue.find(o=>o.id===t.id)) return false;
    const diff = (new Date(`${t.dueDate}T${t.dueTime||'23:59'}`) - new Date()) / 60000;
    return diff >= 0 && diff <= (t.reminderMin||30);
  });

  let color, anim, label;
  if (overdue.length)       { color='#f87171'; anim='blink'; label=`${overdue.length} tarea(s) vencida(s)`; }
  else if (upcoming.length) { color='#fbbf24'; anim='blink'; label='Tarea próxima a vencer'; }
  else                      { color='#4ade80'; anim='';      label=`${pending.length} tarea(s) al día`; }

  return <span className={anim} title={label}
    style={{ color, display:'inline-flex', alignItems:'center', flexShrink:0 }}>
    <WarnIcon s={12}/>
  </span>;
}

// ── Reusable task checkbox ──────────────────────────────
export function TaskCheck({ done, onChange }) {
  return <div className={`task-check${done?' done':''}`} onClick={onChange} title={done?'Marcar como pendiente':'Marcar como hecha'}>
    {done && <CheckIcon s={11}/>}
  </div>;
}

export function SectionDiv({ children }) {
  return <div className="section-divider">{children}</div>;
}

export function NoteItem({ note }) {
  return <div style={{ padding:'10px 14px', background:'var(--bg-deep)', boxShadow:'var(--neu-inset)', border:'1px solid var(--border)', borderRadius:10, marginBottom:8 }}>
    <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:4, fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>{formatDate(note.date)}</div>
    <div style={{ fontSize:13, color:'var(--text-1)', lineHeight:1.5 }}>{note.text}</div>
  </div>;
}

export function EmptyCol() {
  return <div style={{ border:'1.5px dashed var(--border)', borderRadius:10, padding:'18px 12px', textAlign:'center', color:'var(--text-3)', fontSize:12 }}>Sin clientes</div>;
}

export function Field({ label, children }) {
  return <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
    {label && <label className="field-label">{label}</label>}
    {children}
  </div>;
}
export function Input({ label, ...p })    { return <Field label={label}><input className="neu-input" {...p}/></Field>; }
export function Select({ label, children, ...p }) { return <Field label={label}><select className="neu-input" style={{cursor:'pointer'}} {...p}>{children}</select></Field>; }
export function Textarea({ label, ...p }) { return <Field label={label}><textarea className="neu-input" style={{resize:'vertical'}} {...p}/></Field>; }
