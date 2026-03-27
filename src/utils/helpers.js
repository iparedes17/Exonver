export const daysSince = d => {
  const local = new Date();
  const today = new Date(local.getFullYear(), local.getMonth(), local.getDate());
  const target = new Date(d + 'T00:00:00');
  return Math.floor((today - target) / 86400000);
};

export function formatDate(d){
  return new Date(d+'T12:00:00').toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'});
}
export function formatDateTime(iso){
  const d=new Date(iso);
  return d.toLocaleDateString('es-CO',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
}
export function today(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export function generateId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2); }

// Temperature levels based on days since last contact
// 0-1d = 🔥 Hot, 2-3d = warm, 4-6d = cool, 7-13d = cold, 14+d = 🧊 frozen
export function getTemp(dateStr, stageId) {
  if (stageId==='cerrado' || stageId==='perdido') return null;
  const ds = daysSince(dateStr);
  if (ds <= 1)  return { level:'hot',    color:'#f87171', bg:'rgba(248,113,113,0.12)', icon:'🔥', label:'Hoy',    days:ds };
  if (ds <= 3)  return { level:'warm',   color:'#fb923c', bg:'rgba(251,146,60,0.12)',  icon:'🌡', label:`${ds}d`,  days:ds };
  if (ds <= 6)  return { level:'cool',   color:'#fbbf24', bg:'rgba(251,191,36,0.12)',  icon:'🌡', label:`${ds}d`,  days:ds };
  if (ds <= 13) return { level:'cold',   color:'#60a5fa', bg:'rgba(96,165,250,0.12)',  icon:'🥶', label:`${ds}d`,  days:ds };
  return         { level:'frozen', color:'#a5b4fc', bg:'rgba(165,180,252,0.12)', icon:'🧊', label:`${ds}d`,  days:ds };
}
// Legacy compat
export function getTempInfo(dateStr, stageId) {
  const t = getTemp(dateStr, stageId);
  if (!t) return null;
  return { label: t.icon+' '+t.label, color: t.color };
}

// Next pending task date for a client
export function getNextTask(tasks=[]) {
  const now = new Date();
  const pending = (tasks||[])
    .filter(t => !t.done && t.dueDate)
    .map(t => ({ ...t, due: new Date(`${t.dueDate}T${t.dueTime||'23:59'}`) }))
    .filter(t => t.due >= now)
    .sort((a,b) => a.due - b.due);
  return pending[0] || null;
}

// Date a client was created (from first pipelineHistory entry)
export function getCreatedDate(client) {
  const h = (client.pipelineHistory||[]);
  if (h.length) return h[0].date?.split('T')[0] || null;
  return client.lastContact || null;
}
export function cleanPhone(p){ return p.replace(/\D/g,''); }
export function whatsappUrl(p,n){
  const num=cleanPhone(p);
  const full=num.startsWith('57')?num:`57${num}`;
  return`https://wa.me/${full}?text=${encodeURIComponent(`Hola ${n}, te contacto desde Exonver — asesoría comercial de vehículos.`)}`;
}
export function callUrl(p){ return`tel:+57${cleanPhone(p)}`; }
export function load(k,fb){ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):fb; }catch{ return fb; } }
export function save(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} }
export function shouldNotify(task){
  if(task.done||task.notified) return false;
  const due=new Date(`${task.dueDate}T${task.dueTime||'23:59'}`);
  const diff=(due-new Date())/60000;
  return diff>=0&&diff<=(task.reminderMin||30);
}
export function minutesUntilTask(task){
  return (new Date(`${task.dueDate}T${task.dueTime||'23:59'}`)-new Date())/60000;
}
export function isTaskOverdue(task){
  if(task.done)return false;
  return new Date(`${task.dueDate}T${task.dueTime||'23:59'}`) < new Date();
}

// Colombian peso formatter
export function formatCOP(value){
  const num = String(value).replace(/\D/g,'');
  if(!num) return '';
  return '$ '+parseInt(num,10).toLocaleString('es-CO');
}
export function parseCOP(str){
  return String(str).replace(/\D/g,'');
}
