import { useState, useCallback } from 'react';
import { generateId, load, save } from '../utils/helpers';

// Default catalog seeded with common Colombian market brands
const DEFAULT_CATALOG = [
  {
    id: 'toyota', name: 'Toyota',
    refs: [
      { id: 'hilux',   name: 'Hilux',   years: [2020,2021,2022,2023,2024,2025] },
      { id: 'corolla', name: 'Corolla', years: [2020,2021,2022,2023,2024] },
      { id: 'prado',   name: 'Prado',   years: [2021,2022,2023,2024] },
      { id: 'sw4',     name: 'SW4',     years: [2022,2023,2024] },
    ],
  },
  {
    id: 'mazda', name: 'Mazda',
    refs: [
      { id: 'cx5',  name: 'CX-5',  years: [2020,2021,2022,2023,2024] },
      { id: 'cx30', name: 'CX-30', years: [2021,2022,2023,2024] },
      { id: 'mx5',  name: 'MX-5',  years: [2022,2023,2024] },
      { id: 'cx9',  name: 'CX-9',  years: [2021,2022,2023] },
    ],
  },
  {
    id: 'chevrolet', name: 'Chevrolet',
    refs: [
      { id: 'tracker',   name: 'Tracker',   years: [2020,2021,2022,2023,2024] },
      { id: 'captiva',   name: 'Captiva',   years: [2021,2022,2023,2024] },
      { id: 'silverado', name: 'Silverado', years: [2022,2023,2024] },
      { id: 'onix',      name: 'Onix',      years: [2020,2021,2022,2023,2024] },
    ],
  },
  {
    id: 'renault', name: 'Renault',
    refs: [
      { id: 'duster',  name: 'Duster',  years: [2020,2021,2022,2023,2024] },
      { id: 'kwid',    name: 'Kwid',    years: [2020,2021,2022,2023] },
      { id: 'koleos',  name: 'Koleos',  years: [2021,2022,2023,2024] },
      { id: 'stepway', name: 'Stepway', years: [2020,2021,2022,2023,2024] },
    ],
  },
  {
    id: 'kia', name: 'Kia',
    refs: [
      { id: 'sportage', name: 'Sportage', years: [2020,2021,2022,2023,2024] },
      { id: 'sorento',  name: 'Sorento',  years: [2021,2022,2023,2024] },
      { id: 'picanto',  name: 'Picanto',  years: [2020,2021,2022,2023,2024] },
      { id: 'stinger',  name: 'Stinger',  years: [2022,2023,2024] },
    ],
  },
  {
    id: 'ford', name: 'Ford',
    refs: [
      { id: 'ranger',  name: 'Ranger',  years: [2020,2021,2022,2023,2024] },
      { id: 'explorer',name: 'Explorer',years: [2021,2022,2023,2024] },
      { id: 'bronco',  name: 'Bronco',  years: [2022,2023,2024] },
    ],
  },
  {
    id: 'nissan', name: 'Nissan',
    refs: [
      { id: 'kicks',    name: 'Kicks',    years: [2020,2021,2022,2023,2024] },
      { id: 'navara',   name: 'Navara',   years: [2021,2022,2023,2024] },
      { id: 'frontier', name: 'Frontier', years: [2020,2021,2022,2023,2024] },
      { id: 'murano',   name: 'Murano',   years: [2022,2023,2024] },
    ],
  },
  {
    id: 'hyundai', name: 'Hyundai',
    refs: [
      { id: 'tucson',  name: 'Tucson',  years: [2020,2021,2022,2023,2024] },
      { id: 'santa-fe',name: 'Santa Fe',years: [2021,2022,2023,2024] },
      { id: 'creta',   name: 'Creta',   years: [2020,2021,2022,2023,2024] },
    ],
  },
];

export function useCatalog() {
  const [catalog, setCatalog] = useState(() => load('exv_catalog', DEFAULT_CATALOG));

  const saveCatalog = (next) => { setCatalog(next); save('exv_catalog', next); };

  // ── BRANDS ───────────────────────────────────────────
  const addBrand = useCallback((name) => {
    if (!name.trim()) return { ok:false, error:'Nombre requerido' };
    if (catalog.find(b => b.name.toLowerCase() === name.trim().toLowerCase()))
      return { ok:false, error:'Esa marca ya existe' };
    const nb = { id: generateId(), name: name.trim(), refs: [] };
    saveCatalog([...catalog, nb]);
    return { ok:true, brand: nb };
  }, [catalog]);

  const removeBrand = useCallback((brandId) => {
    saveCatalog(catalog.filter(b => b.id !== brandId));
  }, [catalog]);

  const renameBrand = useCallback((brandId, name) => {
    saveCatalog(catalog.map(b => b.id === brandId ? { ...b, name } : b));
  }, [catalog]);

  // ── REFERENCES ───────────────────────────────────────
  const addRef = useCallback((brandId, name) => {
    if (!name.trim()) return { ok:false, error:'Nombre requerido' };
    const brand = catalog.find(b => b.id === brandId);
    if (!brand) return { ok:false, error:'Marca no encontrada' };
    if (brand.refs.find(r => r.name.toLowerCase() === name.trim().toLowerCase()))
      return { ok:false, error:'Esa referencia ya existe' };
    const nr = { id: generateId(), name: name.trim(), years: [] };
    saveCatalog(catalog.map(b => b.id === brandId ? { ...b, refs: [...b.refs, nr] } : b));
    return { ok:true, ref: nr };
  }, [catalog]);

  const removeRef = useCallback((brandId, refId) => {
    saveCatalog(catalog.map(b => b.id === brandId
      ? { ...b, refs: b.refs.filter(r => r.id !== refId) }
      : b
    ));
  }, [catalog]);

  // ── YEARS ─────────────────────────────────────────────
  const addYear = useCallback((brandId, refId, year) => {
    const yr = parseInt(year);
    if (isNaN(yr) || yr < 2000 || yr > 2035) return { ok:false, error:'Año inválido (2000-2035)' };
    saveCatalog(catalog.map(b => b.id !== brandId ? b : {
      ...b,
      refs: b.refs.map(r => r.id !== refId ? r : {
        ...r,
        years: r.years.includes(yr) ? r.years : [...r.years, yr].sort((a,b)=>b-a),
      }),
    }));
    return { ok:true };
  }, [catalog]);

  const removeYear = useCallback((brandId, refId, year) => {
    saveCatalog(catalog.map(b => b.id !== brandId ? b : {
      ...b,
      refs: b.refs.map(r => r.id !== refId ? r : {
        ...r, years: r.years.filter(y => y !== year),
      }),
    }));
  }, [catalog]);

  return { catalog, addBrand, removeBrand, renameBrand, addRef, removeRef, addYear, removeYear };
}
