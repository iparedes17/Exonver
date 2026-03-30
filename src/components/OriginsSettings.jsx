import React, { useState } from 'react';
import { ExoBtn } from '../App';

const COLORS = ['#60a5fa','#4ade80','#f472b6','#fbbf24','#a78bfa','#f87171','#34d399','#fb923c'];

export function OriginsSettings({ cats, onAddCategory, onRemoveCategory, onAddItem, onRemoveItem, onUpdateColor, isAdmin }) {
  const [newCat,   setNewCat]   = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [newItem,  setNewItem]  = useState({});
  const [active,   setActive]   = useState(cats[0]?.id||null);

  const cat = cats.find(c=>c.id===active);

  const inp = { background:'var(--bg-deep)', boxShadow:'var(--neu-inset)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text-1)', fontFamily:'DM Sans,sans-serif', fontSize:13, padding:'9px 12px', outline:'none' };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'220px 1fr', gap:16, minHeight:300 }} className="grid-2">

      {/* ── LEFT: Categories ── */}
      <div style={{ background:'var(--bg-deep)', boxShadow:'var(--neu-inset)', border:'1px solid var(--border)', borderRadius:14, padding:14, display:'flex', flexDirection:'column', gap:4 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>Categorías</div>

        {cats.map(c=>(
          <div key={c.id} onClick={()=>setActive(c.id)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:9, cursor:'pointer', background:active===c.id?'rgba(0,93,165,0.12)':'transparent', border:active===c.id?'1px solid rgba(0,93,165,0.3)':'1px solid transparent', transition:'all .15s' }}>
            <span style={{ width:9, height:9, borderRadius:'50%', background:c.color, boxShadow:`0 0 6px ${c.color}`, flexShrink:0 }}/>
            <span style={{ flex:1, fontSize:13, fontWeight:active===c.id?600:400, color:active===c.id?'#60a5fa':'var(--text-2)' }}>{c.name}</span>
            <span style={{ fontSize:10, color:'var(--text-3)' }}>{c.items.length}</span>
            {isAdmin && (
              <button onClick={e=>{ e.stopPropagation(); if(window.confirm(`¿Eliminar categoría "${c.name}"?`))onRemoveCategory(c.id); }} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(248,113,113,0.5)', fontSize:14, padding:0, lineHeight:1, fontFamily:'inherit' }}
                onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
                onMouseLeave={e=>e.currentTarget.style.color='rgba(248,113,113,0.5)'}>×</button>
            )}
          </div>
        ))}

        {isAdmin && (
          <div style={{ marginTop:10, paddingTop:10, borderTop:'1px solid var(--border)' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>Nueva categoría</div>
            <input style={{ ...inp, width:'100%', marginBottom:8 }} placeholder="Nombre..." value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'&&newCat.trim()){ onAddCategory(newCat.trim(),newColor); setNewCat(''); }}}/>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:8 }}>
              {COLORS.map(c=>(
                <div key={c} onClick={()=>setNewColor(c)} style={{ width:18, height:18, borderRadius:'50%', background:c, cursor:'pointer', border:newColor===c?'2px solid #fff':'2px solid transparent', boxShadow:newColor===c?`0 0 6px ${c}`:'none', transition:'all .15s' }}/>
              ))}
            </div>
            <ExoBtn size="exo-sm" style={{ width:'100%' }} onClick={()=>{ if(newCat.trim()){ onAddCategory(newCat.trim(),newColor); setNewCat(''); }}}>+ Agregar</ExoBtn>
          </div>
        )}
      </div>

      {/* ── RIGHT: Items ── */}
      <div style={{ background:'var(--bg-card)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:14, padding:16 }}>
        {!cat ? (
          <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-3)', fontSize:13 }}>Selecciona una categoría</div>
        ) : (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:cat.color, boxShadow:`0 0 8px ${cat.color}` }}/>
              <span style={{ fontSize:15, fontWeight:700 }}>{cat.name}</span>
              <span style={{ fontSize:11, color:'var(--text-3)' }}>{cat.items.length} origen{cat.items.length!==1?'es':''}</span>
              {isAdmin && (
                <div style={{ display:'flex', gap:4, marginLeft:'auto' }}>
                  {COLORS.map(c=>(
                    <div key={c} onClick={()=>onUpdateColor(cat.id,c)} style={{ width:14, height:14, borderRadius:'50%', background:c, cursor:'pointer', border:cat.color===c?'2px solid #fff':'2px solid transparent', transition:'all .12s' }}/>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
              {cat.items.map(item=>(
                <div key={item} style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 12px', borderRadius:20, background:`${cat.color}15`, border:`1px solid ${cat.color}30`, color:cat.color, fontSize:12, fontWeight:500 }}>
                  {item}
                  {isAdmin && (
                    <button onClick={()=>onRemoveItem(cat.id,item)} style={{ background:'none', border:'none', cursor:'pointer', color:`${cat.color}88`, fontSize:13, padding:'0 0 0 4px', lineHeight:1, fontFamily:'inherit' }}
                      onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
                      onMouseLeave={e=>e.currentTarget.style.color=`${cat.color}88`}>×</button>
                  )}
                </div>
              ))}
              {cat.items.length===0 && <span style={{ fontSize:12, color:'var(--text-3)' }}>Sin orígenes en esta categoría</span>}
            </div>

            {isAdmin && (
              <div style={{ display:'flex', gap:8 }}>
                <input style={{ ...inp, flex:1 }} placeholder={`Nuevo origen en ${cat.name}...`}
                  value={newItem[cat.id]||''} onChange={e=>setNewItem(p=>({...p,[cat.id]:e.target.value}))}
                  onKeyDown={e=>{ if(e.key==='Enter'&&(newItem[cat.id]||'').trim()){ onAddItem(cat.id,(newItem[cat.id]||'').trim()); setNewItem(p=>({...p,[cat.id]:''})); }}}/>
                <ExoBtn size="exo-sm" onClick={()=>{ const v=(newItem[cat.id]||'').trim(); if(v){ onAddItem(cat.id,v); setNewItem(p=>({...p,[cat.id]:''})); }}}>+ Agregar</ExoBtn>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
