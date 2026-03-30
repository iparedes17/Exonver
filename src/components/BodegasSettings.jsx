import React, { useState } from 'react';
import { ExoBtn } from '../App';

const neu = {
  width:'100%', padding:'9px 12px',
  background:'var(--bg-deep)', boxShadow:'var(--neu-inset)',
  border:'1px solid var(--border)', borderRadius:10,
  color:'var(--text-1)', fontFamily:'DM Sans,sans-serif',
  fontSize:13, outline:'none',
};
const selStyle = {
  ...neu, cursor:'pointer',
  appearance:'none', WebkitAppearance:'none',
  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a6075' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center', paddingRight:32,
};

function SedeModal({ bodegaId, sede, gerentes, onSave, onClose }) {
  const [name,      setName]      = useState(sede?.name||'');
  const [address,   setAddress]   = useState(sede?.address||'');
  const [gerenteId, setGerenteId] = useState(sede?.gerenteId||'');
  const [err, setErr] = useState('');

  const handle = () => {
    if (!name.trim()) return setErr('El nombre es obligatorio');
    onSave({ name:name.trim(), address:address.trim(), gerenteId:gerenteId||null });
    onClose();
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(10,12,22,0.88)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:600, padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="slide-up" style={{ background:'#1e2333', boxShadow:'-8px -8px 20px rgba(255,255,255,0.04),8px 8px 28px rgba(0,0,0,0.8)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, width:'100%', maxWidth:440, padding:26 }}>
        <div style={{ fontSize:15, fontWeight:700, marginBottom:20 }}>{sede ? '✏ Editar sede' : '🏢 Nueva sede'}</div>

        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:7 }}>Nombre de la sede *</label>
          <input style={neu} value={name} onChange={e=>{setName(e.target.value);setErr('');}} placeholder="Ej: Sede Norte"/>
        </div>
        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:7 }}>Dirección</label>
          <input style={neu} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Calle 100 #15-20, Bogotá"/>
        </div>
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:7 }}>
            Gerente de sede <span style={{ color:'rgba(255,255,255,0.2)', fontWeight:400 }}>(debe tener rol Gerente)</span>
          </label>
          <select style={selStyle} value={gerenteId} onChange={e=>setGerenteId(e.target.value)}>
            <option value="">— Sin gerente asignado —</option>
            {gerentes.map(g=><option key={g.id} value={g.id}>{g.name} ({g.role})</option>)}
          </select>
        </div>

        {err && <div style={{ fontSize:12, color:'#f87171', marginBottom:14, padding:'8px 12px', background:'rgba(248,113,113,0.1)', borderRadius:8, border:'1px solid rgba(248,113,113,0.25)' }}>{err}</div>}

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <ExoBtn size="exo-sm" variant="exo-ghost" onClick={onClose}>Cancelar</ExoBtn>
          <ExoBtn size="exo-sm" onClick={handle}>{sede ? 'Guardar cambios' : 'Crear sede'}</ExoBtn>
        </div>
      </div>
    </div>
  );
}

export function BodegasSettings({ bodegas, gerentesOptions, isAdmin, onAddBodega, onRemoveBodega, onRenameBodega, onAddSede, onUpdateSede, onRemoveSede, users=[] }) {
  const [activeBodega, setActiveBodega]   = useState(bodegas[0]?.id||null);
  const [newBodega,    setNewBodega]       = useState('');
  const [sedeModal,    setSedeModal]       = useState(null); // null | { bodegaId, sede? }

  const bodega = bodegas.find(b=>b.id===activeBodega);
  const userMap = Object.fromEntries(users.map(u=>[u.id,u.name]));

  const handleSaveSede = ({ name, address, gerenteId }) => {
    if (sedeModal.sede) {
      onUpdateSede(sedeModal.bodegaId, sedeModal.sede.id, { name, address, gerenteId });
    } else {
      onAddSede(sedeModal.bodegaId, { name, address, gerenteId });
    }
    setSedeModal(null);
  };

  return (
    <div>
      {sedeModal && (
        <SedeModal
          bodegaId={sedeModal.bodegaId}
          sede={sedeModal.sede}
          gerentes={gerentesOptions}
          onSave={handleSaveSede}
          onClose={()=>setSedeModal(null)}
        />
      )}

      <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:16 }} className="grid-2">

        {/* ── LEFT: Bodegas ── */}
        <div style={{ background:'var(--bg-deep)', boxShadow:'var(--neu-inset)', border:'1px solid var(--border)', borderRadius:14, padding:14, display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>Bodegas</div>

          {bodegas.map(b=>(
            <div key={b.id} onClick={()=>setActiveBodega(b.id)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:9, cursor:'pointer', background:activeBodega===b.id?'rgba(0,93,165,0.12)':'transparent', border:activeBodega===b.id?'1px solid rgba(0,93,165,0.3)':'1px solid transparent', transition:'all .15s' }}>
              <span style={{ fontSize:16, flexShrink:0 }}>🏭</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:13, fontWeight:activeBodega===b.id?600:400, color:activeBodega===b.id?'#60a5fa':'var(--text-2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.name}</div>
                <div style={{ fontSize:10, color:'var(--text-3)' }}>{b.sedes.length} sede{b.sedes.length!==1?'s':''}</div>
              </div>
              {isAdmin && (
                <button onClick={e=>{ e.stopPropagation(); if(window.confirm(`¿Eliminar bodega "${b.name}" y todas sus sedes?`))onRemoveBodega(b.id); }} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(248,113,113,0.4)', fontSize:14, padding:0, lineHeight:1, fontFamily:'inherit', flexShrink:0 }}
                  onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
                  onMouseLeave={e=>e.currentTarget.style.color='rgba(248,113,113,0.4)'}>×</button>
              )}
            </div>
          ))}

          {bodegas.length===0&&<div style={{ fontSize:12, color:'var(--text-3)', padding:'8px 0', textAlign:'center' }}>Sin bodegas</div>}

          {isAdmin && (
            <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--border)' }}>
              <input style={{ ...neu, width:'100%', marginBottom:8 }} placeholder="Nueva bodega..." value={newBodega} onChange={e=>setNewBodega(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'&&newBodega.trim()){ const r=onAddBodega(newBodega.trim()); if(r.ok)setNewBodega(''); else alert(r.error); }}}/>
              <ExoBtn size="exo-sm" style={{ width:'100%' }} onClick={()=>{ if(newBodega.trim()){ const r=onAddBodega(newBodega.trim()); if(r.ok)setNewBodega(''); else alert(r.error); }}}>+ Bodega</ExoBtn>
            </div>
          )}
        </div>

        {/* ── RIGHT: Sedes ── */}
        <div style={{ background:'var(--bg-card)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:14, padding:16 }}>
          {!bodega ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-3)', fontSize:13 }}>Selecciona una bodega</div>
          ) : (
            <>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:700 }}>🏭 {bodega.name}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)' }}>{bodega.sedes.length} sede{bodega.sedes.length!==1?'s':''}</div>
                </div>
                {isAdmin && <ExoBtn size="exo-sm" onClick={()=>setSedeModal({ bodegaId:bodega.id })}>+ Nueva sede</ExoBtn>}
              </div>

              {bodega.sedes.length===0 ? (
                <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text-3)', fontSize:13, border:'1.5px dashed var(--border)', borderRadius:10 }}>
                  Sin sedes. {isAdmin?'Crea la primera sede.':''}
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {bodega.sedes.map(s=>{
                    const gerente = users.find(u=>u.id===s.gerenteId);
                    return (
                      <div key={s.id} style={{ padding:'14px 16px', background:'var(--bg-raised)', boxShadow:'var(--neu-btn)', border:'1px solid var(--border)', borderRadius:12, display:'flex', alignItems:'flex-start', gap:14 }}>
                        <div style={{ width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,rgba(0,93,165,0.3),rgba(0,93,165,0.1))', border:'1px solid rgba(0,93,165,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>🏢</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:14, fontWeight:600, marginBottom:3 }}>{s.name}</div>
                          {s.address && <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:3 }}>📍 {s.address}</div>}
                          <div style={{ fontSize:11, color: gerente?'#fbbf24':'var(--text-3)' }}>
                            {gerente ? `👤 Gerente: ${gerente.name}` : '👤 Sin gerente asignado'}
                          </div>
                        </div>
                        {isAdmin && (
                          <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                            <ExoBtn size="exo-sm" onClick={()=>setSedeModal({ bodegaId:bodega.id, sede:s })}>✏</ExoBtn>
                            <ExoBtn size="exo-sm" variant="exo-danger" onClick={()=>{ if(window.confirm(`¿Eliminar sede "${s.name}"?`))onRemoveSede(bodega.id,s.id); }}>×</ExoBtn>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
