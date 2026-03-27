import React from 'react';

const sel = (extra={}) => ({
  width:'100%', padding:'10px 14px',
  background:'var(--bg-deep)', boxShadow:'var(--neu-inset)',
  border:'1px solid var(--border)', borderRadius:12,
  color:'var(--text-1)', fontFamily:'DM Sans,sans-serif',
  fontSize:13, outline:'none', cursor:'pointer',
  appearance:'none', WebkitAppearance:'none',
  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235a6075' stroke-width='2.5' stroke-linecap='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat:'no-repeat', backgroundPosition:'right 12px center',
  paddingRight:36,
  ...extra,
});

export function VehicleSelector({ catalog=[], allowedBrands=[], value={}, onChange, isAdmin=false }) {
  const { brandId='', refId='' } = value;

  const visibleBrands = isAdmin || allowedBrands.length===0
    ? catalog
    : catalog.filter(b => allowedBrands.includes(b.id));

  const brand = visibleBrands.find(b => b.id === brandId);
  const refs  = brand?.refs || [];
  const ref   = refs.find(r => r.id === refId);

  const setBrand = (bid) => {
    onChange({ brandId:bid, refId:'', label:'' });
  };
  const setRef = (rid) => {
    const r = brand?.refs.find(x=>x.id===rid);
    const b = brand?.name||'';
    const label = [b, r?.name].filter(Boolean).join(' ');
    onChange({ brandId, refId:rid, label });
  };

  const lbl = { display:'block', fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:0 };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }} className="grid-2">
      {/* Brand */}
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        <label style={lbl}>Marca</label>
        <select style={sel()} value={brandId} onChange={e=>setBrand(e.target.value)}>
          <option value="">— Seleccionar —</option>
          {visibleBrands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        {visibleBrands.length===0 && <span style={{ fontSize:10, color:'#f87171' }}>Sin marcas asignadas</span>}
      </div>

      {/* Reference */}
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        <label style={lbl}>Referencia</label>
        <select style={sel({ opacity: brand?1:0.4 })} value={refId} onChange={e=>setRef(e.target.value)} disabled={!brand}>
          <option value="">— Seleccionar —</option>
          {refs.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>
    </div>
  );
}
