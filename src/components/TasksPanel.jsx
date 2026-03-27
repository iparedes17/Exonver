import { ExoBtn } from '../App';
import React, { useState } from 'react';
import { TASK_TYPES } from '../data/constants';
import { DatePicker, TimePicker } from './DateTimePicker';
import { isTaskOverdue, minutesUntilTask, formatDateTime } from '../utils/helpers';
import { TaskCheck } from './UI';


function EditTaskForm({ task, onSave, onCancel }) {
  const [form, setForm] = useState({
    type: task.type,
    desc: task.desc,
    dueDate: task.dueDate,
    dueTime: task.dueTime || '09:00',
    reminderMin: task.reminderMin || 30,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const rescheduled = form.dueDate !== task.dueDate || form.dueTime !== task.dueTime;

  return (
    <div style={{ background:'var(--bg-raised)', boxShadow:'var(--neu-shadow)', border:'1px solid rgba(0,93,165,0.3)', borderRadius:12, padding:14, marginBottom:10, position:'relative', zIndex:10 }}>
      {rescheduled && (
        <div style={{ fontSize:10, fontWeight:700, color:'#fbbf24', background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.25)', borderRadius:6, padding:'4px 10px', marginBottom:10, textTransform:'uppercase', letterSpacing:'.06em' }}>
          🔄 Se marcará como reprogramada
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }} className="grid-2">
        <div>
          <label className="field-label">Tipo</label>
          <select className="neu-input" value={form.type} onChange={e => set('type', e.target.value)} style={{ cursor:'pointer' }}>
            {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label">Recordatorio (min)</label>
          <input className="neu-input" type="number" min="5" max="1440" value={form.reminderMin} onChange={e => set('reminderMin', e.target.value)} />
        </div>
      </div>
      <div style={{ marginBottom:10 }}>
        <label className="field-label">Descripción</label>
        <input className="neu-input" value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="¿Qué debes hacer?" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }} className="grid-2">
        <DatePicker
          label={rescheduled ? '📅 Fecha (nueva)' : 'Fecha'}
          value={form.dueDate}
          onChange={v => set('dueDate', v)}
        />
        <TimePicker
          label={rescheduled ? '🕐 Hora (nueva)' : 'Hora'}
          value={form.dueTime}
          onChange={v => set('dueTime', v)}
        />
      </div>
      {rescheduled && (
        <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:10, padding:'6px 10px', background:'var(--bg-deep)', borderRadius:8, border:'1px solid var(--border)' }}>
          <span style={{ color:'var(--text-2)' }}>Original: </span>{task.dueDate} {task.dueTime}
          <span style={{ color:'var(--text-3)', margin:'0 6px' }}>→</span>
          <span style={{ color:'#fbbf24' }}>{form.dueDate} {form.dueTime}</span>
        </div>
      )}
      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
        <button className="neu-btn" style={{ fontSize:12 }} onClick={onCancel}>Cancelar</button>
        <button
          className="neu-btn-accent"
          style={{ fontSize:12 }}
          onClick={() => onSave({ ...form, reminderMin: parseInt(form.reminderMin) || 30 })}
        >
          {rescheduled ? '🔄 Reprogramar' : '💾 Guardar'}
        </button>
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle }) {
  const overdue  = isTaskOverdue(task);
  const diffMin  = minutesUntilTask(task);
  const upcoming = !task.done && diffMin >= 0 && diffMin <= (task.reminderMin || 30);
  // Overdue = INCUMPLIDA visual, but still CAN be marked done (with warning)
  const locked = false; // user can always mark done

  let borderColor = 'var(--border)';
  if (locked)              borderColor = 'rgba(248,113,113,0.45)';
  else if (upcoming)       borderColor = 'rgba(251,191,36,0.4)';
  else if (task.done)      borderColor = 'rgba(74,222,128,0.2)';

  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ padding:'12px 14px', background:'var(--bg-deep)', boxShadow:'var(--neu-inset)', border:'1px solid '+borderColor, borderRadius:12, transition:'all .2s', opacity: task.done ? 0.6 : 1 }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
          {/* Checkbox — disabled if locked (overdue & not done) */}
          <div
            className={task.done ? 'task-check done' : 'task-check'}
            onClick={onToggle}
            title={overdue && !task.done ? 'Tarea vencida — marcar igual como hecha' : task.done ? 'Marcar como pendiente' : 'Marcar como hecha'}
            style={{ cursor:'pointer', opacity:1 }}
          >
            {task.done && <span style={{ fontSize:11, color:'#fff', fontWeight:700 }}>✓</span>}
            {overdue && !task.done && <span style={{ fontSize:11, color:'#f87171' }}>!</span>}
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#005da5', textTransform:'uppercase', letterSpacing:'.05em' }}>{task.type}</span>
              {task.rescheduledAt && !task.done && (
                <span style={{ fontSize:9, fontWeight:700, color:'#fbbf24', background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.25)', borderRadius:4, padding:'1px 6px', textTransform:'uppercase' }}>🔄 Reprogramada</span>
              )}
              {locked  && <span style={{ fontSize:10, color:'#f87171', fontWeight:700, animation:'blink 1s ease-in-out infinite' }}>✗ INCUMPLIDA</span>}
              {!locked && !task.done && upcoming && <span style={{ fontSize:10, color:'#fbbf24', fontWeight:700 }}>⏰ PRÓXIMA</span>}
              {task.done && <span style={{ fontSize:10, color:'#4ade80', fontWeight:700 }}>✓ COMPLETADA</span>}
            </div>
            <p style={{ fontSize:13, color:'var(--text-1)', lineHeight:1.4, marginBottom:6, textDecoration:task.done?'line-through':'none', textDecorationColor:'var(--text-3)' }}>
              {task.desc}
            </p>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <span style={{ fontSize:11, color:locked?'#f87171':'var(--text-3)', fontWeight:600 }}>
                📅 {task.dueDate}{task.dueTime?' · '+task.dueTime:''}
              </span>
              <span style={{ fontSize:11, color:'var(--text-3)' }}>⏰ {task.reminderMin} min antes</span>
              {task.done && task.completedAt && <span style={{ fontSize:11, color:'#4ade80' }}>✓ {formatDateTime(task.completedAt)}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TasksPanel({ client, onAddTask, onToggleTask }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type:'Llamar', desc:'', dueDate:'', dueTime:'09:00', reminderMin:30 });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = () => {
    if (!form.desc.trim() || !form.dueDate) return alert('Completa la descripción y la fecha');
    onAddTask({ ...form, reminderMin: parseInt(form.reminderMin) || 30 });
    setForm({ type:'Llamar', desc:'', dueDate:'', dueTime:'09:00', reminderMin:30 });
    setShowForm(false);
  };

  const tasks   = client.tasks || [];
  const pending = tasks.filter(t => !t.done);
  const done    = tasks.filter(t =>  t.done);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {pending.length > 0 && (
            <span style={{ fontSize:10, fontWeight:700, background:'rgba(248,113,113,0.15)', color:'#f87171', padding:'2px 9px', borderRadius:10, border:'1px solid rgba(248,113,113,0.3)', animation:'pulseRed 2.5s ease-in-out infinite' }}>
              {pending.length} pendiente{pending.length !== 1 ? 's' : ''}
            </span>
          )}
          {done.length > 0 && (
            <span style={{ fontSize:10, fontWeight:700, background:'rgba(74,222,128,0.12)', color:'#4ade80', padding:'2px 9px', borderRadius:10, border:'1px solid rgba(74,222,128,0.25)' }}>
              {done.length} hecha{done.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button className={`exo-btn${showForm?' exo-danger':''}`} onClick={() => setShowForm(p => !p)}><div className='btn-outer'><div className='btn-inner'><span>{showForm ? '✕ Cancelar' : '+ Nueva tarea'}</span></div></div>
        </button>
      </div>

      {showForm && (
        <div style={{ background:'var(--bg-raised)', boxShadow:'var(--neu-shadow)', border:'1px solid var(--border)', borderRadius:14, padding:16, marginBottom:14, position:'relative', zIndex:10 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }} className="grid-2">
            <div>
              <label className="field-label">Tipo de tarea</label>
              <select className="neu-input" value={form.type} onChange={e => set('type', e.target.value)} style={{ cursor:'pointer' }}>
                {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Recordatorio (min antes)</label>
              <input className="neu-input" type="number" min="5" max="1440" value={form.reminderMin} onChange={e => set('reminderMin', e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom:10 }}>
            <label className="field-label">Descripción</label>
            <input className="neu-input" value={form.desc} onChange={e => set('desc', e.target.value)} placeholder="¿Qué debes hacer?" />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }} className="grid-2">
            <DatePicker label="Fecha" value={form.dueDate} onChange={v => set('dueDate', v)}/>
            <TimePicker label="Hora"  value={form.dueTime} onChange={v => set('dueTime', v)}/>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button className='exo-btn' onClick={handleAdd}><div className='btn-outer'><div className='btn-inner'><span>Guardar tarea</span></div></div></button>
          </div>
        </div>
      )}

      {pending.map(t => (
        <TaskItem key={t.id} task={t} onToggle={() => onToggleTask(client.id, t.id)}/>
      ))}

      {done.length > 0 && (
        <div style={{ marginTop:16 }}>
          <div style={{ fontSize:10, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10, paddingBottom:6, borderBottom:'1px solid var(--border)' }}>
            Tareas completadas
          </div>
          {done.map(t => (
            <TaskItem key={t.id} task={t} onToggle={() => onToggleTask(client.id, t.id)}/>
          ))}
        </div>
      )}

      {tasks.length === 0 && !showForm && (
        <p style={{ fontSize:12, color:'var(--text-3)', textAlign:'center', padding:'20px 0' }}>Sin tareas. Crea una para hacer seguimiento.</p>
      )}
    </div>
  );
}
