import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_STAGES, SAMPLE_CLIENTS } from '../data/constants';
import { generateId, today, load, save, shouldNotify } from '../utils/helpers';

export function useCRM(currentUserId) {
  const [stages,  setStages]  = useState(() => load('exv_stages',  DEFAULT_STAGES));
  const [allClients, setAllClients] = useState(() => load('exv_clients', SAMPLE_CLIENTS));

  useEffect(() => { save('exv_stages',  stages);     }, [stages]);
  useEffect(() => { save('exv_clients', allClients); }, [allClients]);

  // ── SCOPED CLIENTS: each user only sees their own ────────────────────────
  const clients = currentUserId
    ? allClients.filter(c => c.ownerId === currentUserId)
    : allClients;

  // ── REMINDER ENGINE (screen toasts only, no email) ───────────────────────
  const [pendingNotifs, setPendingNotifs] = useState([]);

  useEffect(() => {
    const check = () => {
      const toFire = [];
      clients.forEach(client => {
        (client.tasks || []).forEach(task => {
          if (!shouldNotify(task)) return;
          toFire.push({ client, task });
        });
      });
      if (!toFire.length) return;

      setAllClients(prev => prev.map(c => ({
        ...c,
        tasks: (c.tasks || []).map(t =>
          toFire.find(f => f.task.id === t.id && f.client.id === c.id)
            ? { ...t, notified: true } : t
        ),
      })));

      setPendingNotifs(p => [...p, ...toFire.map(({ client, task }) => ({
        id: generateId(),
        text: `${task.type}: "${task.desc}" — ${client.name}`,
      }))]);
    };
    check();
    const iv = setInterval(check, 60_000);
    return () => clearInterval(iv);
  }, [allClients]); // eslint-disable-line

  const dismissNotif = useCallback((id) => {
    setPendingNotifs(p => p.filter(n => n.id !== id));
  }, []);

  // ── CLIENTS ──────────────────────────────────────────────────────────────
  const createClient = useCallback((data) => {
    const c = {
      id: generateId(), ...data,
      ownerId: currentUserId,
      lastContact: today(), notes: [], tasks: [],
      pipelineHistory: [{ from: null, to: data.stageId || 'lead', date: new Date().toISOString(), note: 'Lead creado' }],
    };
    setAllClients(p => [c, ...p]);
    return c;
  }, [currentUserId]);

  // Import a pre-built client object (from CSV import — already has id, ownerId, pipelineHistory)
  const importClient = useCallback((clientObj) => {
    setAllClients(p => [clientObj, ...p]);
  }, []);

  const updateClient = useCallback((id, data) => {
    setAllClients(p => p.map(c => c.id === id ? { ...c, ...data, lastContact: today() } : c));
  }, []);

  const deleteClient = useCallback((id) => {
    setAllClients(p => p.filter(c => c.id !== id));
  }, []);

  const moveClient = useCallback((clientId, newStageId, note = '') => {
    setAllClients(p => p.map(c => {
      if (c.id !== clientId) return c;
      const entry = { from: c.stageId, to: newStageId, date: new Date().toISOString(), note: note || 'Movido de etapa' };
      return { ...c, stageId: newStageId, lastContact: today(), pipelineHistory: [...(c.pipelineHistory || []), entry] };
    }));
  }, []);

  const addNote = useCallback((clientId, text) => {
    const note = { id: generateId(), date: today(), text };
    setAllClients(p => p.map(c => c.id === clientId ? { ...c, notes: [...(c.notes || []), note], lastContact: today() } : c));
    return note;
  }, []);

  // ── TASKS ─────────────────────────────────────────────────────────────────
  const addTask = useCallback((clientId, task) => {
    const t = { id: generateId(), ...task, done: false, notified: false };
    setAllClients(p => p.map(c => c.id === clientId ? { ...c, tasks: [...(c.tasks || []), t] } : c));
    return t;
  }, []);

  const toggleTask = useCallback((clientId, taskId, completionNote='') => {
    setAllClients(p => p.map(c => {
      if (c.id !== clientId) return c;
      const now = new Date().toISOString();
      const updatedTasks = (c.tasks || []).map(t => {
        if (t.id !== taskId) return t;
        const nowDone = !t.done;
        return { ...t, done: nowDone, completedAt: nowDone ? now : null, completionNote: nowDone ? completionNote : '' };
      });
      const task = updatedTasks.find(t => t.id === taskId);
      const noteText = completionNote ? ` — Nota: "${completionNote}"` : '';
      const historyEntry = task ? {
        from: c.stageId, to: c.stageId, date: now, isTask: true,
        note: task.done
          ? `✅ Tarea completada: "${task.desc}" (${task.type}) — agendada: ${task.dueDate} ${task.dueTime||''}${noteText}`
          : `↩ Tarea reabierta: "${task.desc}"`,
      } : null;
      return {
        ...c, tasks: updatedTasks,
        pipelineHistory: historyEntry ? [...(c.pipelineHistory || []), historyEntry] : c.pipelineHistory,
      };
    }));
  }, []);

  const deleteTask = useCallback((clientId, taskId) => {
    setAllClients(p => p.map(c => c.id !== clientId ? c : {
      ...c, tasks: (c.tasks || []).filter(t => t.id !== taskId),
    }));
  }, []);

  const editTask = useCallback((clientId, taskId, updates) => {
    const now = new Date().toISOString();
    setAllClients(p => p.map(c => {
      if (c.id !== clientId) return c;
      const original = (c.tasks || []).find(t => t.id === taskId);
      if (!original) return c;
      const rescheduled = updates.dueDate !== original.dueDate || updates.dueTime !== original.dueTime;
      const updatedTask = { ...original, ...updates, notified: rescheduled ? false : original.notified, rescheduledAt: rescheduled ? now : original.rescheduledAt };
      const historyNote = rescheduled
        ? `🔄 Tarea reprogramada: "${original.desc}" (${original.type}) — Original: ${original.dueDate} ${original.dueTime||''} → Nueva: ${updates.dueDate} ${updates.dueTime||''}`
        : `✏️ Tarea editada: "${updatedTask.desc}" (${updatedTask.type})`;
      return {
        ...c,
        tasks: (c.tasks || []).map(t => t.id === taskId ? updatedTask : t),
        pipelineHistory: [...(c.pipelineHistory || []), { from: c.stageId, to: c.stageId, date: now, note: historyNote, isTask: true }],
      };
    }));
  }, []);

  // ── STAGES ────────────────────────────────────────────────────────────────
  const addStage = useCallback((label) => {
    const ns = { id: generateId(), label, color: '#2a2f45', textColor: '#8f95a8', dot: '#8f95a8' };
    setStages(p => { const e = p.filter(s => !s.fixed), f = p.filter(s => s.fixed); return [...e, ns, ...f]; });
  }, []);

  const removeStage = useCallback((id) => {
    setAllClients(p => p.map(c => c.stageId === id ? { ...c, stageId: 'lead' } : c));
    setStages(p => p.filter(s => s.id !== id));
  }, []);

  const reorderStages = useCallback((newOrder) => {
    setStages(newOrder);
  }, []);

  const computeStats = (list) => ({
    total:        list.length,
    active:       list.filter(c => c.stageId !== 'cerrado' && c.stageId !== 'perdido').length,
    closed:       list.filter(c => c.stageId === 'cerrado').length,
    lost:         list.filter(c => c.stageId === 'perdido').length,
    cold:         list.filter(c => {
      if (c.stageId === 'cerrado' || c.stageId === 'perdido') return false;
      return Math.floor((Date.now() - new Date(c.lastContact + 'T12:00:00')) / 86400000) >= 7;
    }).length,
    pendingTasks: list.reduce((a, c) => a + (c.tasks||[]).filter(t=>!t.done).length, 0),
    taskOverdue:  list.reduce((a, c) => a + (c.tasks||[]).filter(t=>!t.done && new Date(`${t.dueDate}T${t.dueTime||'23:59'}`)<new Date()).length, 0),
    taskUpcoming: list.reduce((a, c) => a + (c.tasks||[]).filter(t=>{
      if(t.done)return false; const due=new Date(`${t.dueDate}T${t.dueTime||'23:59'}`);
      if(due<new Date())return false; return(due-new Date())/60000<=(t.reminderMin||30);
    }).length, 0),
    taskOnTime:   list.reduce((a, c) => a + (c.tasks||[]).filter(t=>{
      if(t.done)return false; const due=new Date(`${t.dueDate}T${t.dueTime||'23:59'}`);
      if(due<new Date())return false; return(due-new Date())/60000>(t.reminderMin||30);
    }).length, 0),
  });

  return {
    stages, clients, allClients, stats: computeStats(clients),
    pendingNotifs, dismissNotif,
    createClient, importClient, updateClient, deleteClient, moveClient, addNote,
    addTask, toggleTask, deleteTask, editTask,
    addStage, removeStage, reorderStages,
  };
}
