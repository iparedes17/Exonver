import { ExoBtn } from '../App';
import React, { useState } from 'react';
import { DEFAULT_LOSS_REASONS } from '../data/constants';
import { formatCOP, parseCOP } from '../utils/helpers';
import { Avatar, ContactActions, SectionDiv, NoteItem, Input, Textarea, TaskWarningIcon } from './UI';
import { PipelineHistory } from './PipelineHistory';
import { TasksPanel } from './TasksPanel';
import { VehicleSelector } from './VehicleSelector';

const TABS = [
  { id:'datos',    label:'Datos' },
  { id:'pipeline', label:'Pipeline' },
  { id:'tareas',   label:'Tareas' },
  { id:'notas',    label:'Notas' },
];

const neu = {
  width:'100%', padding:'10px 14px',
  background:'var(--bg-deep)', boxShadow:'var(--neu-inset)',
  border:'1px solid var(--border)', borderRadius:12,
  color:'var(--text-1)', fontFamily:'DM Sans,sans-serif',
  fontSize:13, outline:'none',
};
const selStyle = { ...neu, cursor:'pointer',
  appearance:'none', WebkitAppearance:'none',
  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a6075' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center', paddingRight:36,
};

function parseVehicle(vehicleStr, catalog) {
  if (!vehicleStr || !catalog?.length) return { brandId:'', refId:'' };
  for (const b of catalog) {
    for (const r of b.refs) {
      // Match "Brand Reference" (without year) or "Brand Reference Year" (legacy)
      if (vehicleStr.startsWith(`${b.name} ${r.name}`)) {
        return { brandId:b.id, refId:r.id };
      }
    }
  }
  return { brandId:'', refId:'' };
}

// ── LOSS REASON MODAL ────────────────────────────────────────────────────────
function LossReasonModal({ onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  const [notes,  setNotes]  = useState('');
  const [err,    setErr]    = useState('');

  const handle = () => {
    if (!reason) return setErr('Selecciona el motivo de pérdida');
    if (!notes.trim()) return setErr('Agrega una nota explicativa');
    onConfirm(reason, notes.trim());
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(10,12,22,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:500, padding:20 }}>
      <div className="slide-up" style={{ background:'#1e2333', boxShadow:'-8px -8px 20px rgba(255,255,255,0.04),8px 8px 28px rgba(0,0,0,0.8),0 0 40px rgba(248,113,113,0.12)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:20, padding:28, width:'100%', maxWidth:460 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <span style={{ fontSize:22 }}>❌</span>
          <div>
            <div style={{ fontSize:16, fontWeight:700 }}>Motivo de pérdida</div>
            <div style={{ fontSize:12, color:'var(--text-3)' }}>Este campo es obligatorio al marcar un lead como perdido</div>
          </div>
        </div>

        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:7 }}>Motivo *</label>
          <select style={{ ...selStyle }} value={reason} onChange={e=>{setReason(e.target.value);setErr('');}}>
            <option value="">— Seleccionar motivo —</option>
            {DEFAULT_LOSS_REASONS.map(r=><option key={r}>{r}</option>)}
          </select>
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:7 }}>Nota adicional *</label>
          <textarea style={{ ...neu, resize:'vertical', minHeight:80 }} value={notes} onChange={e=>{setNotes(e.target.value);setErr('');}} placeholder="Describe brevemente por qué se perdió este cliente..."/>
        </div>

        {err && <div style={{ fontSize:12, color:'#f87171', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)', borderRadius:8, padding:'8px 12px', marginBottom:14 }}>{err}</div>}

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <ExoBtn size="exo-sm" variant="exo-ghost" onClick={onCancel}>Cancelar</ExoBtn>
          <ExoBtn size="exo-sm" variant="exo-danger" onClick={handle}>Marcar como perdido</ExoBtn>
        </div>
      </div>
    </div>
  );
}

// ── CLIENT MODAL ─────────────────────────────────────────────────────────────
export function ClientModal({ client, stages, catalog=[], allowedBrands=[], isAdmin=false, origins=[], paymentTypes=[], onClose, onSave, onDelete, onAddNote, onMoveClient, onAddTask, onToggleTask, onDeleteTask, onEditTask, canDelete=true }) {
  const [tab,      setTab]      = useState('datos');
  const parsed = parseVehicle(client.vehicle, catalog);
  const [form, setForm] = useState({
    name:       client.name||'',
    phone:      client.phone||'',
    email:      client.email||'',
    vehicle:    client.vehicle||'',
    vehicleSel: { brandId: parsed.brandId||'', refId: parsed.refId||'' },
    budget:     client.budget||'',
    payment:    Array.isArray(client.payment) ? client.payment : (client.payment ? [client.payment] : []),
    origin:     client.origin||'',
    stageId:    client.stageId||'lead',
  });
  const [noteText,      setNoteText]      = useState('');
  const [moveNote,      setMoveNote]      = useState('');
  const [showLossModal, setShowLossModal] = useState(false);
  const [pendingStage,  setPendingStage]  = useState(null);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const pendingTasks = (client.tasks||[]).filter(t=>!t.done).length;

  const handleStageSelect = (stageId) => {
    if (stageId === 'perdido' && client.stageId !== 'perdido') {
      setPendingStage(stageId);
      setShowLossModal(true);
    } else {
      set('stageId', stageId);
    }
  };

  const handleLossConfirm = (reason, notes) => {
    set('stageId', 'perdido');
    setMoveNote(`Motivo: ${reason}. ${notes}`);
    setShowLossModal(false);
    setPendingStage(null);
  };

  const handleSave = () => {
    if (!form.name.trim()) return alert('El nombre es obligatorio');
    if (form.stageId !== client.stageId) onMoveClient(client.id, form.stageId, moveNote||undefined);
    const { vehicleSel, ...rest } = form;
    const paymentStr = Array.isArray(rest.payment) ? rest.payment.join(', ') : rest.payment;
    onSave(client.id, { ...rest, payment: paymentStr });
  };

  const togglePayment = (p) => {
    const cur = form.payment;
    set('payment', cur.includes(p) ? cur.filter(x=>x!==p) : [...cur, p]);
  };

  const tabStyle = active => ({
    fontFamily:'DM Sans,sans-serif', fontSize:12, padding:'9px 14px',
    background:'none', border:'none', cursor:'pointer', fontWeight:active?700:400,
    color: active ? 'var(--text-1)' : 'var(--text-3)',
    borderBottom: active ? '2px solid #005da5' : '2px solid transparent',
    transition:'all .15s', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6,
  });

  return (
    <>
      {showLossModal && <LossReasonModal onConfirm={handleLossConfirm} onCancel={()=>{ setShowLossModal(false); setPendingStage(null); }}/>}

      <div style={{ position:'fixed', inset:0, background:'rgba(10,12,22,0.82)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:16 }}
        onClick={e=>e.target===e.currentTarget&&onClose()}>
        <div className="slide-up" style={{ background:'#1e2333', boxShadow:'-8px -8px 20px rgba(255,255,255,0.04),8px 8px 24px rgba(0,0,0,0.7)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, width:'100%', maxWidth:620, maxHeight:'93vh', display:'flex', flexDirection:'column' }}>
          {/* Header */}
          <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <Avatar name={client.name} size={34}/>
              <div>
                <div style={{ fontSize:15, fontWeight:700, display:'flex', alignItems:'center', gap:7 }}>
                  {client.name}<TaskWarningIcon tasks={client.tasks||[]}/>
                </div>
                <div style={{ fontSize:12, color:'var(--text-3)' }}>{client.phone}</div>
              </div>
              <ContactActions phone={client.phone} name={client.name}/>
            </div>
            <button onClick={onClose} style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.2)', cursor:'pointer', color:'#f87171', fontSize:18, lineHeight:1, fontFamily:'inherit', borderRadius:8, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}>×</button>
          </div>
          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.07)', paddingLeft:4, flexShrink:0, overflowX:'auto' }}>
            {TABS.map(t=>(
              <button key={t.id} style={tabStyle(tab===t.id)} onClick={()=>setTab(t.id)}>
                {t.label}
                {t.id==='tareas'&&pendingTasks>0&&<span style={{ fontSize:9, fontWeight:800, background:'#f87171', color:'#fff', borderRadius:10, padding:'1px 5px', minWidth:16, textAlign:'center' }}>{pendingTasks}</span>}
              </button>
            ))}
          </div>
          {/* Body */}
          <div style={{ flex:1, overflowY:'auto', padding:'18px 20px' }}>

            {tab==='datos' && <>
              <SectionDiv>Datos del cliente</SectionDiv>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }} className="grid-2">
                <div><label className="field-label">Nombre</label><input style={neu} value={form.name} onChange={e=>set('name',e.target.value)}/></div>
                <div><label className="field-label">Teléfono</label><input style={neu} value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
              </div>
              <div style={{ marginBottom:12 }}><label className="field-label">Email</label><input style={neu} type="email" value={form.email} onChange={e=>set('email',e.target.value)}/></div>

              <SectionDiv>Vehículo de interés</SectionDiv>
              {catalog.length>0?(
                <div style={{ marginBottom:12 }}>
                  <VehicleSelector catalog={catalog} allowedBrands={allowedBrands} isAdmin={isAdmin} value={form.vehicleSel} onChange={v=>{ set('vehicleSel',v); if(v.label) set('vehicle',v.label); }}/>
                  {form.vehicle&&<div style={{ marginTop:8, fontSize:11, color:'var(--text-3)', padding:'6px 10px', background:'var(--bg-deep)', borderRadius:8, border:'1px solid var(--border)' }}>Vehículo: <span style={{ color:'var(--text-2)', fontWeight:600 }}>{form.vehicle}</span></div>}
                </div>
              ):(
                <div style={{ marginBottom:12 }}><label className="field-label">Vehículo</label><input style={neu} value={form.vehicle} onChange={e=>set('vehicle',e.target.value)} placeholder="Toyota Hilux 2024"/></div>
              )}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }} className="grid-2">
                <div>
                  <label className="field-label">Presupuesto</label>
                  <input style={neu} value={form.budget} placeholder="$ 0"
                    onChange={e=>{ const raw=parseCOP(e.target.value); set('budget', raw ? formatCOP(raw) : ''); }}/>
                </div>
                <div>
                  <label className="field-label">Origen</label>
                  <select style={selStyle} value={form.origin} onChange={e=>set('origin',e.target.value)}>
                    <option value="">— Seleccionar —</option>
                    {origins.map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom:12 }}>
                <label className="field-label">Forma(s) de pago</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:6 }}>
                  {paymentTypes.map(p=>{
                    const active = form.payment.includes(p);
                    return <button key={p} onClick={()=>togglePayment(p)} style={{ padding:'6px 14px', borderRadius:20, cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:active?700:400, transition:'all .15s', background:active?'#005da5':'rgba(255,255,255,0.05)', color:active?'#fff':'var(--text-2)', border:active?'1px solid #005da5':'1px solid rgba(255,255,255,0.1)', boxShadow:active?'0 0 10px rgba(0,93,165,0.35)':'none' }}>{active?'✓ ':''}{p}</button>;
                  })}
                </div>
              </div>

              <SectionDiv>Etapa</SectionDiv>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:14 }}>
                {stages.map(s=>(
                  <button key={s.id} onClick={()=>handleStageSelect(s.id)} style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, padding:'6px 13px', borderRadius:8, cursor:'pointer', fontWeight:500, transition:'all .15s', background:form.stageId===s.id?s.textColor:s.color, color:form.stageId===s.id?'#0f172a':s.textColor, border:form.stageId===s.id?`1px solid ${s.textColor}`:`1px solid ${s.textColor}30`, boxShadow:form.stageId===s.id?`0 0 12px ${s.dot}40`:'none' }}>
                    {s.label}
                  </button>
                ))}
              </div>
              {form.stageId!==client.stageId&&form.stageId!=='perdido'&&(
                <div style={{ marginBottom:14 }}>
                  <label className="field-label">Nota del movimiento (opcional)</label>
                  <input style={neu} value={moveNote} onChange={e=>setMoveNote(e.target.value)} placeholder="¿Por qué cambias de etapa?"/>
                </div>
              )}
              {form.stageId==='perdido'&&moveNote&&(
                <div style={{ marginBottom:14, padding:'8px 12px', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, fontSize:12, color:'#f87171' }}>
                  {moveNote}
                </div>
              )}

              <div className="modal-footer" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.07)', marginTop:4 }}>
                {canDelete
                  ? <button className="exo-btn exo-danger exo-sm" onClick={()=>{ if(window.confirm(`¿Eliminar a ${client.name}?`)){ onDelete(client.id); onClose(); }}}><div className="btn-outer"><div className="btn-inner"><span>Eliminar cliente</span></div></div>
                    </button>
                  : <span/>
                }
                <ExoBtn size="exo-sm" onClick={handleSave}>Guardar cambios</ExoBtn>
              </div>
            </>}

            {tab==='pipeline'&&<><SectionDiv>Historial de movimientos</SectionDiv><PipelineHistory history={client.pipelineHistory||[]} stages={stages}/></>}
            {tab==='tareas'&&<><SectionDiv>Agenda de tareas</SectionDiv><TasksPanel client={client} onAddTask={t=>onAddTask(client.id,t)} onToggleTask={onToggleTask} onDeleteTask={onDeleteTask} onEditTask={onEditTask}/></>}
            {tab==='notas'&&<>
              <SectionDiv>Historial de notas</SectionDiv>
              {(client.notes||[]).length===0?<p style={{ fontSize:12, color:'var(--text-3)' }}>Sin notas aún.</p>:[...(client.notes||[])].reverse().map(n=><NoteItem key={n.id} note={n}/>)}
              <div style={{ display:'flex', gap:8, alignItems:'flex-end', marginTop:12 }}>
                <div style={{ flex:1 }}><label className="field-label">Nueva nota</label><textarea style={{ ...neu, resize:'vertical', minHeight:60 }} value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Agrega una observación..."/></div>
                <ExoBtn size="exo-sm" onClick={()=>{ if(noteText.trim()){ onAddNote(client.id,noteText.trim()); setNoteText(''); }}}>+ Nota</ExoBtn>
              </div>
            </>}
          </div>
        </div>
      </div>
    </>
  );
}

// ── NEW CLIENT MODAL ──────────────────────────────────────────────────────────
export function NewClientModal({ stages, catalog=[], allowedBrands=[], isAdmin=false, origins=[], paymentTypes=[], onClose, onCreate }) {
  const [form, setForm] = useState({
    name:'', phone:'', email:'',
    vehicle:'', vehicleSel:{ brandId:'', refId:'' },
    budget:'', payment:[], origin:'', stageId:'lead',
  });
  const [showLoss, setShowLoss] = useState(false);
  const [privacy,  setPrivacy]  = useState(false);
  const [privErr,  setPrivErr]  = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleStageSelect = (stageId) => {
    if (stageId==='perdido') { setShowLoss(true); }
    else set('stageId', stageId);
  };

  const togglePayment = (p) => {
    const cur = form.payment;
    set('payment', cur.includes(p) ? cur.filter(x=>x!==p) : [...cur, p]);
  };

  const handleCreate = () => {
    if (!form.name.trim()) return alert('El nombre es obligatorio');
    if (!privacy) { setPrivErr(true); return; }
    const { vehicleSel, ...rest } = form;
    const paymentStr = rest.payment.join(', ');
    onCreate({ ...rest, payment: paymentStr });
  };

  return (
    <>
      {showLoss&&<LossReasonModal onConfirm={(r,n)=>{ set('stageId','perdido'); setShowLoss(false); }} onCancel={()=>setShowLoss(false)}/>}
      <div style={{ position:'fixed', inset:0, background:'rgba(10,12,22,0.82)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300, padding:16 }}
        onClick={e=>e.target===e.currentTarget&&onClose()}>
        <div className="slide-up" style={{ background:'#1e2333', boxShadow:'-8px -8px 20px rgba(255,255,255,0.04),8px 8px 24px rgba(0,0,0,0.7)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, width:'100%', maxWidth:600, maxHeight:'90vh', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <span style={{ fontSize:16, fontWeight:700 }}>Nuevo cliente</span>
            <button onClick={onClose} style={{ background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.2)', cursor:'pointer', color:'#f87171', fontSize:18, lineHeight:1, fontFamily:'inherit', borderRadius:8, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}>×</button>
          </div>
          <div style={{ flex:1, overflowY:'auto', padding:'18px 22px' }}>
            <SectionDiv>Datos del cliente</SectionDiv>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }} className="grid-2">
              <div><label className="field-label">Nombre completo</label><input style={neu} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Carlos Mendoza"/></div>
              <div><label className="field-label">Teléfono</label><input style={neu} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="300 000 0000"/></div>
            </div>
            <div style={{ marginBottom:12 }}><label className="field-label">Email</label><input style={neu} type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="correo@email.com"/></div>

            <SectionDiv>Vehículo de interés</SectionDiv>
            {catalog.length>0?(
              <div style={{ marginBottom:12 }}>
                <VehicleSelector catalog={catalog} allowedBrands={allowedBrands} isAdmin={isAdmin} value={form.vehicleSel} onChange={v=>{ set('vehicleSel',v); if(v.label) set('vehicle',v.label); }}/>
                {form.vehicle&&<div style={{ marginTop:8, fontSize:11, color:'var(--text-3)', padding:'6px 10px', background:'var(--bg-deep)', borderRadius:8, border:'1px solid var(--border)' }}>Vehículo: <span style={{ color:'var(--text-2)', fontWeight:600 }}>{form.vehicle}</span></div>}
              </div>
            ):(
              <div style={{ marginBottom:12 }}><label className="field-label">Vehículo</label><input style={neu} value={form.vehicle} onChange={e=>set('vehicle',e.target.value)} placeholder="Toyota Hilux 2024"/></div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }} className="grid-2">
              <div>
                <label className="field-label">Presupuesto</label>
                <input style={neu} value={form.budget} placeholder="$ 0"
                  onChange={e=>{ const raw=parseCOP(e.target.value); set('budget', raw?formatCOP(raw):''); }}/>
              </div>
              <div>
                <label className="field-label">Origen</label>
                <select style={selStyle} value={form.origin} onChange={e=>set('origin',e.target.value)}>
                  <option value="">— Seleccionar —</option>
                  {origins.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom:12 }}>
              <label className="field-label">Forma(s) de pago</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:6 }}>
                {paymentTypes.map(p=>{
                  const active=form.payment.includes(p);
                  return <button key={p} onClick={()=>togglePayment(p)} style={{ padding:'6px 14px', borderRadius:20, cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:active?700:400, transition:'all .15s', background:active?'#005da5':'rgba(255,255,255,0.05)', color:active?'#fff':'var(--text-2)', border:active?'1px solid #005da5':'1px solid rgba(255,255,255,0.1)', boxShadow:active?'0 0 10px rgba(0,93,165,0.35)':'none' }}>{active?'✓ ':''}{p}</button>;
                })}
              </div>
            </div>

            <SectionDiv>Etapa inicial</SectionDiv>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:18 }}>
              {stages.map(s=>(
                <button key={s.id} onClick={()=>handleStageSelect(s.id)} style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, padding:'6px 13px', borderRadius:8, cursor:'pointer', fontWeight:500, transition:'all .15s', background:form.stageId===s.id?s.textColor:s.color, color:form.stageId===s.id?'#0f172a':s.textColor, border:form.stageId===s.id?`1px solid ${s.textColor}`:`1px solid ${s.textColor}30` }}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* ── Política de datos personales ── */}
            <div style={{ marginBottom:16, padding:'12px 14px', background: privErr ? 'rgba(248,113,113,0.06)' : 'rgba(0,93,165,0.06)', border: `1px solid ${privErr ? 'rgba(248,113,113,0.35)' : 'rgba(0,93,165,0.2)'}`, borderRadius:12, transition:'all .2s' }}>
              <label style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer' }} onClick={()=>{setPrivacy(p=>!p);setPrivErr(false);}}>
                {/* Checkbox */}
                <div style={{
                  width:20, height:20, borderRadius:6, flexShrink:0, marginTop:1,
                  background: privacy ? '#005da5' : 'var(--bg-deep)',
                  border: privErr ? '2px solid #f87171' : privacy ? '2px solid #005da5' : '1.5px solid rgba(255,255,255,0.2)',
                  boxShadow: privacy ? '0 0 10px rgba(0,93,165,0.45)' : 'inset 1px 1px 4px rgba(0,0,0,0.5)',
                  display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s',
                }}>
                  {privacy && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4.5L4 7.5L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                {/* Text */}
                <span style={{ fontSize:12, color: privErr ? '#f87171' : 'rgba(255,255,255,0.55)', lineHeight:1.6, userSelect:'none' }}>
                  {privErr && <strong style={{ display:'block', marginBottom:2, fontSize:11 }}>⚠ Debes aceptar para continuar</strong>}
                  Acepto la{' '}
                  <span
                    style={{ color:'#60a5fa', textDecoration:'underline', cursor:'pointer' }}
                    onClick={e=>{ e.stopPropagation(); alert('Política de Tratamiento de Datos Personales\n\nExonver CRM recopila y trata sus datos personales (nombre, teléfono, email) únicamente con fines de gestión comercial interna. Los datos no serán compartidos con terceros sin consentimiento expreso. Puede solicitar rectificación o eliminación contactando al administrador del sistema.'); }}
                  >
                    política de tratamiento de datos personales
                  </span>
                </span>
              </label>
            </div>

            <div className="modal-footer" style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <ExoBtn size="exo-sm" variant="exo-danger" onClick={onClose}>Cancelar</ExoBtn>
              <ExoBtn size="exo-sm" onClick={handleCreate}>Crear cliente</ExoBtn>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
