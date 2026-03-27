import React, { useState, useRef } from 'react';
import { ExoBtn } from '../App';
import { generateId, today } from '../utils/helpers';

// ── Minimal XLSX parser (reads .xlsx without library dependency) ──────────────
// Uses FileReader + basic XML parsing since we can't import xlsx in this env.
// For production use, import SheetJS (xlsx) instead.

const TEMPLATE_HEADERS = ['Nombre','Teléfono','Email','Origen','Vehículo (Marca Referencia)','Notas'];
const TEMPLATE_NOTE    = 'Complete los campos. La etapa inicial será "Lead" automáticamente.';

function downloadTemplate() {
  // Create CSV template (universal, works without xlsx library)
  const rows = [
    TEMPLATE_HEADERS,
    ['Carlos Mendoza','3001234567','carlos@email.com','Showroom','Toyota Hilux','Interesado en crédito'],
    ['Valentina Torres','3109876543','val@email.com','Referido','Mazda CX-5',''],
  ];
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href  = url; a.download = 'plantilla_leads_exonver.csv'; a.click();
  URL.revokeObjectURL(url);
}

function parseCSV(text) {
  const lines  = text.replace(/\r/g,'').split('\n').filter(l=>l.trim());
  if (!lines.length) return [];
  // Handle quoted fields
  const parseRow = (line) => {
    const fields = [];
    let cur = '', inQ = false;
    for (let i=0; i<line.length; i++) {
      const ch = line[i];
      if (ch==='"') { if (inQ && line[i+1]==='"') { cur+='"'; i++; } else inQ=!inQ; }
      else if (ch===',' && !inQ) { fields.push(cur.trim()); cur=''; }
      else cur+=ch;
    }
    fields.push(cur.trim());
    return fields;
  };
  const headers = parseRow(lines[0]).map(h=>h.toLowerCase());
  return lines.slice(1).filter(l=>l.trim()).map(line => {
    const vals = parseRow(line);
    const obj  = {};
    headers.forEach((h,i) => obj[h] = vals[i]||'');
    return obj;
  });
}

function mapRow(row, origins, currentUserId) {
  // Try to find columns flexibly
  const get = (...keys) => {
    for (const k of keys) {
      const val = row[k] || row[k.toLowerCase()] || '';
      if (val) return val;
    }
    return '';
  };
  const name   = get('nombre','name','cliente');
  const phone  = get('teléfono','telefono','phone','tel');
  const email  = get('email','correo','e-mail');
  const origin = get('origen','origin','fuente') || origins[0] || 'Showroom';
  const vehicle= get('vehículo (marca referencia)','vehiculo','vehicle','vehículo','vh');
  const notes  = get('notas','notes','nota','observaciones');

  if (!name) return null;

  const client = {
    id:          generateId(),
    ownerId:     currentUserId,
    name, phone, email,
    vehicle:     vehicle || '',
    origin:      origins.includes(origin) ? origin : (origins[0]||'Showroom'),
    stageId:     'lead',
    budget:      '',
    payment:     '',
    notes:       notes ? [{ id:generateId(), date:today(), text:notes }] : [],
    tasks:       [],
    lastContact: today(),
    pipelineHistory: [{
      from: null, to:'lead',
      date: new Date().toISOString(),
      note: 'Lead importado desde archivo',
    }],
  };
  return client;
}

// ── IMPORT MODAL ──────────────────────────────────────────────────────────────
export function ImportLeadsModal({ onClose, onCreate, origins=[], currentUserId }) {
  const [step,     setStep]     = useState('upload'); // upload | preview | done
  const [rows,     setRows]     = useState([]);
  const [errors,   setErrors]   = useState([]);
  const [imported, setImported] = useState(0);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const processFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv','txt'].includes(ext)) {
      alert('Solo se aceptan archivos .csv — descarga la plantilla y complétala.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text    = e.target.result;
      const parsed  = parseCSV(text);
      const mapped  = parsed.map(r => mapRow(r, origins, currentUserId));
      const valid   = mapped.filter(Boolean);
      const invalid = parsed.length - valid.length;
      const errs    = invalid > 0 ? [`${invalid} fila(s) sin nombre fueron ignoradas`] : [];
      setRows(valid);
      setErrors(errs);
      setStep('preview');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = () => {
    rows.forEach(c => onCreate(c));
    setImported(rows.length);
    setStep('done');
  };

  const th = { padding:'9px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', borderBottom:'1px solid rgba(255,255,255,0.07)', whiteSpace:'nowrap' };
  const td = { padding:'8px 14px', fontSize:12, color:'var(--text-2)', borderBottom:'1px solid rgba(255,255,255,0.05)' };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(10,12,22,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:400, padding:16 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="slide-up" style={{ background:'#1e2333', boxShadow:'-8px -8px 20px rgba(255,255,255,0.04),8px 8px 28px rgba(0,0,0,0.8)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, width:'100%', maxWidth:700, maxHeight:'90vh', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700 }}>📥 Importar leads</div>
            <div style={{ fontSize:12, color:'var(--text-3)', marginTop:3 }}>
              {step==='upload'?'Sube un archivo CSV con los datos de los leads'
              :step==='preview'?`Vista previa — ${rows.length} leads encontrados`
              :`✅ ${imported} leads importados correctamente`}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.2)', cursor:'pointer', color:'#f87171', fontSize:18, borderRadius:8, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit' }}>×</button>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'20px 22px' }}>

          {/* ── STEP 1: UPLOAD ── */}
          {step==='upload' && (
            <div>
              {/* Template download */}
              <div style={{ background:'rgba(0,93,165,0.08)', border:'1px solid rgba(0,93,165,0.2)', borderRadius:12, padding:'14px 18px', marginBottom:20 }}>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:6 }}>📋 Paso 1 — Descarga la plantilla</div>
                <p style={{ fontSize:12, color:'var(--text-3)', lineHeight:1.6, marginBottom:12 }}>
                  Descarga el archivo CSV, llénalo con tus leads y súbelo aquí. Columnas: <strong style={{ color:'var(--text-2)' }}>Nombre, Teléfono, Email, Origen, Vehículo, Notas</strong>
                </p>
                <ExoBtn size="exo-sm" onClick={downloadTemplate}>⬇ Descargar plantilla CSV</ExoBtn>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e=>{e.preventDefault();setDragging(true);}}
                onDragLeave={()=>setDragging(false)}
                onDrop={e=>{e.preventDefault();setDragging(false);processFile(e.dataTransfer.files[0]);}}
                onClick={()=>fileRef.current?.click()}
                style={{
                  border:`2px dashed ${dragging?'#005da5':'rgba(255,255,255,0.12)'}`,
                  borderRadius:16, padding:'48px 24px', textAlign:'center', cursor:'pointer',
                  background: dragging?'rgba(0,93,165,0.08)':'rgba(255,255,255,0.02)',
                  transition:'all .2s',
                }}
              >
                <div style={{ fontSize:36, marginBottom:12 }}>📂</div>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:6 }}>Arrastra tu archivo CSV aquí</div>
                <div style={{ fontSize:12, color:'var(--text-3)' }}>o haz clic para seleccionar</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginTop:10 }}>Solo archivos .csv</div>
              </div>
              <input ref={fileRef} type="file" accept=".csv,.txt" style={{ display:'none' }} onChange={e=>processFile(e.target.files[0])}/>
            </div>
          )}

          {/* ── STEP 2: PREVIEW ── */}
          {step==='preview' && (
            <div>
              {errors.length>0 && (
                <div style={{ background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.25)', borderRadius:10, padding:'10px 14px', marginBottom:14, fontSize:12, color:'#fbbf24' }}>
                  ⚠ {errors.join(' · ')}
                </div>
              )}
              {rows.length===0 ? (
                <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-3)', fontSize:13 }}>
                  No se encontraron leads válidos en el archivo.{' '}
                  <button onClick={()=>setStep('upload')} style={{ background:'none', border:'none', color:'#60a5fa', cursor:'pointer', fontFamily:'inherit', fontSize:13 }}>Volver a subir</button>
                </div>
              ) : (
                <div style={{ background:'var(--bg-card)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:16 }}>
                  <div style={{ overflowX:'auto', maxHeight:350, overflowY:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
                      <thead style={{ position:'sticky', top:0, background:'var(--bg-deep)', zIndex:1 }}>
                        <tr>
                          {['#','Nombre','Teléfono','Email','Origen','Vehículo'].map(h=><th key={h} style={th}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r,i)=>(
                          <tr key={r.id} onMouseEnter={e=>Array.from(e.currentTarget.cells).forEach(c=>c.style.background='var(--bg-raised)')} onMouseLeave={e=>Array.from(e.currentTarget.cells).forEach(c=>c.style.background='transparent')}>
                            <td style={{ ...td, color:'var(--text-3)', width:32 }}>{i+1}</td>
                            <td style={{ ...td, fontWeight:600, color:'var(--text-1)' }}>{r.name}</td>
                            <td style={td}>{r.phone||'—'}</td>
                            <td style={td}>{r.email||'—'}</td>
                            <td style={td}><span style={{ fontSize:10, padding:'2px 8px', borderRadius:10, background:'rgba(0,93,165,0.12)', color:'#60a5fa', border:'1px solid rgba(0,93,165,0.25)' }}>{r.origin}</span></td>
                            <td style={td}>{r.vehicle||'—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <ExoBtn size="exo-sm" variant="exo-ghost" onClick={()=>setStep('upload')}>← Volver</ExoBtn>
                {rows.length>0 && <ExoBtn size="exo-sm" onClick={handleImport}>📥 Importar {rows.length} lead{rows.length!==1?'s':''}</ExoBtn>}
              </div>
            </div>
          )}

          {/* ── STEP 3: DONE ── */}
          {step==='done' && (
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
              <div style={{ fontSize:18, fontWeight:700, marginBottom:8 }}>{imported} leads importados</div>
              <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:24, lineHeight:1.6 }}>
                Todos los leads quedaron en la etapa <strong style={{ color:'var(--text-2)' }}>Lead</strong> del pipeline. Puedes revisarlos y moverlos según avances.
              </p>
              <ExoBtn size="exo-sm" onClick={onClose}>Ir al pipeline</ExoBtn>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
