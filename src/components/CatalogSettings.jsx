import React, { useState } from 'react';
import { ExoBtn } from '../App';

export function CatalogSettings({ catalog, onAddBrand, onRemoveBrand, onAddRef, onRemoveRef, onAddYear, onRemoveYear }) {
  const [activeBrand, setActiveBrand] = useState(null);
  const [activeRef,   setActiveRef]   = useState(null);
  const [newBrand,    setNewBrand]    = useState('');
  const [newRef,      setNewRef]      = useState('');
  const [newYear,     setNewYear]     = useState('');

  const brand = catalog.find(b => b.id === activeBrand);
  const ref   = brand?.refs.find(r => r.id === activeRef);

  const inp = (extra={}) => ({
    background:'var(--bg-deep)', boxShadow:'var(--neu-inset)',
    border:'1px solid var(--border)', borderRadius:10,
    color:'var(--text-1)', fontFamily:'DM Sans,sans-serif',
    fontSize:13, padding:'9px 12px', outline:'none', ...extra,
  });

  // Small × icon delete button — stays as plain button (icon-only, no label)
  const DelBtn = ({ onClick }) => (
    <button
      onClick={onClick}
      style={{
        width:22, height:22, borderRadius:6, flexShrink:0,
        background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.25)',
        color:'#f87171', cursor:'pointer', fontFamily:'inherit', fontSize:13,
        display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s',
      }}
      onMouseEnter={e=>e.currentTarget.style.background='rgba(248,113,113,0.22)'}
      onMouseLeave={e=>e.currentTarget.style.background='rgba(248,113,113,0.1)'}
    >×</button>
  );

  // Pill toggle for brands/refs
  const Pill = ({ label, active, onClick, withDot }) => (
    <button onClick={onClick} style={{
      padding:'5px 13px', borderRadius:20, cursor:'pointer',
      fontFamily:'DM Sans,sans-serif', fontSize:12,
      fontWeight: active ? 700 : 400, transition:'all .15s',
      background: active
        ? 'linear-gradient(135deg,rgba(0,93,165,0.35),rgba(0,93,165,0.15))'
        : 'rgba(255,255,255,0.04)',
      color:   active ? '#60a5fa' : 'var(--text-2)',
      border:  active ? '1px solid rgba(0,93,165,0.45)' : '1px solid rgba(255,255,255,0.07)',
      boxShadow: active
        ? 'inset -1px -1px 3px rgba(0,0,0,0.4),inset 1px 1px 3px rgba(255,255,255,0.08),0 0 10px rgba(0,93,165,0.2)'
        : '-2px -2px 5px rgba(255,255,255,0.04),2px 2px 6px rgba(0,0,0,0.4)',
      display:'flex', alignItems:'center', gap:5,
    }}>
      {withDot && <span style={{ width:6, height:6, borderRadius:'50%', background: active ? '#60a5fa' : 'var(--text-3)', flexShrink:0 }}/>}
      {label}
    </button>
  );

  const colCard = (title, faded, children) => ({
    background:'var(--bg-card)',
    boxShadow:'-4px -4px 10px rgba(255,255,255,0.03),4px 4px 12px rgba(0,0,0,0.5)',
    border:'1px solid var(--border)',
    borderRadius:14, padding:16,
    opacity: faded ? 0.45 : 1,
    transition:'opacity .2s',
  });

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }} className="grid-2">

      {/* ── BRANDS ── */}
      <div style={colCard('Marcas', false)}>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>🚗 Marcas</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:14, minHeight:36 }}>
          {catalog.map(b => (
            <div key={b.id} style={{ display:'flex', alignItems:'center', gap:4 }}>
              <Pill
                label={b.name}
                active={activeBrand===b.id}
                withDot
                onClick={()=>{ setActiveBrand(activeBrand===b.id?null:b.id); setActiveRef(null); }}
              />
              <DelBtn onClick={()=>{
                if(window.confirm(`¿Eliminar "${b.name}" y todas sus referencias?`)){
                  onRemoveBrand(b.id);
                  if(activeBrand===b.id){ setActiveBrand(null); setActiveRef(null); }
                }
              }}/>
            </div>
          ))}
          {catalog.length===0 && <span style={{ fontSize:12, color:'var(--text-3)' }}>Sin marcas</span>}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <input
            style={{ ...inp(), flex:1 }}
            placeholder="Nueva marca..."
            value={newBrand}
            onChange={e=>setNewBrand(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'){ const r=onAddBrand(newBrand); if(r.ok)setNewBrand(''); else alert(r.error); }}}
          />
          <ExoBtn size="exo-sm" onClick={()=>{ const r=onAddBrand(newBrand); if(r.ok)setNewBrand(''); else alert(r.error); }}>
            + Agregar
          </ExoBtn>
        </div>
      </div>

      {/* ── REFERENCES ── */}
      <div style={colCard('Referencias', !brand)}>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>📋 Referencias</div>
        <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:12 }}>{brand ? `de ${brand.name}` : 'Selecciona una marca'}</div>
        {brand && <>
          <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:14, minHeight:36 }}>
            {brand.refs.map(r => (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <Pill
                  label={r.name}
                  active={activeRef===r.id}
                  onClick={()=>setActiveRef(activeRef===r.id?null:r.id)}
                />
                <DelBtn onClick={()=>{
                  if(window.confirm(`¿Eliminar referencia "${r.name}"?`)){
                    onRemoveRef(brand.id, r.id);
                    if(activeRef===r.id) setActiveRef(null);
                  }
                }}/>
              </div>
            ))}
            {brand.refs.length===0 && <span style={{ fontSize:12, color:'var(--text-3)' }}>Sin referencias</span>}
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input
              style={{ ...inp(), flex:1 }}
              placeholder="Nueva referencia..."
              value={newRef}
              onChange={e=>setNewRef(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'){ const r=onAddRef(brand.id,newRef); if(r.ok)setNewRef(''); else alert(r.error); }}}
            />
            <ExoBtn size="exo-sm" onClick={()=>{ const r=onAddRef(brand.id,newRef); if(r.ok)setNewRef(''); else alert(r.error); }}>
              + Agregar
            </ExoBtn>
          </div>
        </>}
      </div>

      {/* ── YEARS ── */}
      <div style={colCard('Años', !ref)}>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text-2)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>📅 Años</div>
        <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:12 }}>{ref ? `${brand?.name} ${ref.name}` : 'Selecciona una referencia'}</div>
        {ref && <>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14, minHeight:36 }}>
            {(ref.years||[]).map(y => (
              <div key={y} style={{ display:'flex', alignItems:'center', gap:3 }}>
                <span style={{ fontSize:12, fontWeight:600, padding:'4px 10px', borderRadius:8, background:'rgba(96,165,250,0.12)', color:'#60a5fa', border:'1px solid rgba(96,165,250,0.25)' }}>{y}</span>
                <DelBtn onClick={()=>onRemoveYear(brand.id, ref.id, y)}/>
              </div>
            ))}
            {(ref.years||[]).length===0 && <span style={{ fontSize:12, color:'var(--text-3)' }}>Sin años</span>}
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input
              style={{ ...inp(), width:90 }}
              placeholder="2024"
              type="number" min="2000" max="2035"
              value={newYear}
              onChange={e=>setNewYear(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'){ const r=onAddYear(brand.id,ref.id,newYear); if(r.ok)setNewYear(''); else alert(r.error); }}}
            />
            <ExoBtn size="exo-sm" onClick={()=>{ const r=onAddYear(brand.id,ref.id,newYear); if(r.ok)setNewYear(''); else alert(r.error); }}>
              + Año
            </ExoBtn>
          </div>
        </>}
      </div>
    </div>
  );
}
