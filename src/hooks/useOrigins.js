import { useState, useCallback } from 'react';
import { generateId, load, save } from '../utils/helpers';

const DEFAULT_ORIGIN_CATS = [
  {
    id: 'digital', name: 'Digital', color: '#60a5fa',
    items: ['Página web', 'Facebook', 'Instagram', 'TikTok', 'Google Ads', 'WhatsApp Business'],
  },
  {
    id: 'sala', name: 'Sala de ventas', color: '#4ade80',
    items: ['Visita espontánea', 'Referido de asesor', 'Referido de cliente'],
  },
  {
    id: 'eventos', name: 'Eventos', color: '#f472b6',
    items: ['Feria automotriz', 'Evento de marca', 'Test drive masivo'],
  },
  {
    id: 'posventa', name: 'Posventa', color: '#fbbf24',
    items: ['Servicio técnico', 'Recall', 'Cliente fidelizado'],
  },
  {
    id: 'otros', name: 'Otros', color: '#a78bfa',
    items: ['Llamada entrante', 'Otro'],
  },
];

export function useOrigins() {
  const [cats, setCats] = useState(() => load('exv_origin_cats', DEFAULT_ORIGIN_CATS));

  const save_ = (next) => { setCats(next); save('exv_origin_cats', next); };

  // Flat list for selects: "Digital / Facebook"
  const flatOrigins = cats.flatMap(c => c.items.map(i => ({ cat: c.name, item: i, label: `${c.name} / ${i}`, color: c.color })));

  const addCategory = useCallback((name, color='#8f95a8') => {
    if (!name.trim() || cats.find(c=>c.name===name.trim())) return;
    save_([...cats, { id: generateId(), name: name.trim(), color, items: [] }]);
  }, [cats]);

  const removeCategory = useCallback((id) => {
    save_(cats.filter(c=>c.id!==id));
  }, [cats]);

  const addItem = useCallback((catId, item) => {
    item = item.trim();
    if (!item) return;
    save_(cats.map(c => c.id===catId && !c.items.includes(item) ? { ...c, items:[...c.items,item] } : c));
  }, [cats]);

  const removeItem = useCallback((catId, item) => {
    save_(cats.map(c => c.id===catId ? { ...c, items:c.items.filter(i=>i!==item) } : c));
  }, [cats]);

  const updateColor = useCallback((catId, color) => {
    save_(cats.map(c => c.id===catId ? { ...c, color } : c));
  }, [cats]);

  return { cats, flatOrigins, addCategory, removeCategory, addItem, removeItem, updateColor };
}
