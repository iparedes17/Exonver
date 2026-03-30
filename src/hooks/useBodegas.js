import { useState, useCallback } from 'react';
import { generateId, load, save } from '../utils/helpers';

const DEFAULT_BODEGAS = [
  {
    id: 'bodega1',
    name: 'Bodega Principal',
    sedes: [
      { id: 'sede1', name: 'Sede Norte',   address: 'Calle 100 #15-20', gerenteId: 'u3' },
      { id: 'sede2', name: 'Sede Centro',  address: 'Carrera 7 #32-45', gerenteId: null },
    ],
  },
];

export function useBodegas(users=[]) {
  const [bodegas, setBodegas] = useState(() => load('exv_bodegas', DEFAULT_BODEGAS));

  const persist = (next) => { setBodegas(next); save('exv_bodegas', next); };

  // ── BODEGAS ──────────────────────────────────────────────────────────────
  const addBodega = useCallback((name) => {
    name = name.trim();
    if (!name || bodegas.find(b=>b.name===name)) return { ok:false, error:'Ya existe una bodega con ese nombre' };
    const nb = { id:generateId(), name, sedes:[] };
    persist([...bodegas, nb]);
    return { ok:true, bodega:nb };
  }, [bodegas]);

  const removeBodega = useCallback((id) => {
    persist(bodegas.filter(b=>b.id!==id));
  }, [bodegas]);

  const renameBodega = useCallback((id, name) => {
    persist(bodegas.map(b=>b.id===id?{...b,name}:b));
  }, [bodegas]);

  // ── SEDES ─────────────────────────────────────────────────────────────────
  const addSede = useCallback((bodegaId, { name, address='', gerenteId=null }) => {
    name = name.trim();
    if (!name) return { ok:false, error:'El nombre es obligatorio' };
    const ns = { id:generateId(), name, address, gerenteId };
    persist(bodegas.map(b=>b.id===bodegaId?{...b,sedes:[...b.sedes,ns]}:b));
    return { ok:true, sede:ns };
  }, [bodegas]);

  const updateSede = useCallback((bodegaId, sedeId, data) => {
    persist(bodegas.map(b=>b.id!==bodegaId?b:{
      ...b, sedes:b.sedes.map(s=>s.id===sedeId?{...s,...data}:s),
    }));
  }, [bodegas]);

  const removeSede = useCallback((bodegaId, sedeId) => {
    persist(bodegas.map(b=>b.id!==bodegaId?b:{
      ...b, sedes:b.sedes.filter(s=>s.id!==sedeId),
    }));
  }, [bodegas]);

  // ── HELPERS ───────────────────────────────────────────────────────────────
  const getSedeById = useCallback((sedeId) => {
    for (const b of bodegas) {
      const s = b.sedes.find(s=>s.id===sedeId);
      if (s) return { ...s, bodegaName:b.name, bodegaId:b.id };
    }
    return null;
  }, [bodegas]);

  const getBodegaById = useCallback((bodegaId) => {
    return bodegas.find(b=>b.id===bodegaId)||null;
  }, [bodegas]);

  // Gerente users = users with role gerente
  const gerentesOptions = users.filter(u=>u.role==='gerente'||u.role==='admin');

  return {
    bodegas, gerentesOptions,
    addBodega, removeBodega, renameBodega,
    addSede, updateSede, removeSede,
    getSedeById, getBodegaById,
  };
}
