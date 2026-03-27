import React, { useState, useRef, useEffect } from 'react';
import { useCRM } from './hooks/useCRM';
import { useAuth } from './auth/useAuth';
import { useCatalog } from './hooks/useCatalog';
import { useConfig } from './hooks/useConfig';
import { LoginScreen } from './auth/LoginScreen';
import { UsersView } from './auth/UsersView';
import { KanbanBoard } from './components/KanbanBoard';
import { ClientList, ReportsView, SettingsView } from './components/Views';
import { ClientModal, NewClientModal } from './components/ClientModal';
import { AgendaView } from './components/AgendaView';
import { KanbanIcon, ListIcon, GearIcon, PlusIcon, ChartIcon, CalIcon } from './components/Icons';
import { ImportLeadsModal } from './components/ImportLeads';
import { DashboardWidgets } from './components/DashboardWidgets';
import { ForecastView } from './components/ForecastView';
import { useForecast } from './hooks/useForecast';

const UsersIcon = ({s=14}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>;
const ROLE_COLOR = { admin:'#f472b6', gerente:'#fbbf24', vendedor:'#60a5fa' };
const ROLE_LABEL = { admin:'Admin', gerente:'Gerente', vendedor:'Vendedor' };

// Reusable ExoBtn component
export function ExoBtn({ children, onClick, variant='', size='', disabled=false, style={}, title='' }) {
  const isFullWidth = style.width === '100%' || style.width === '100vw';
  return (
    <button
      className={`exo-btn${variant?' '+variant:''}${size?' '+size:''}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{ ...style, ...(isFullWidth ? { width:'100%', display:'flex' } : {}) }}
    >
      <div className="btn-outer" style={isFullWidth ? { width:'100%' } : {}}>
        <div className="btn-inner" style={isFullWidth ? { width:'100%', justifyContent:'center' } : {}}>
          <span>{children}</span>
        </div>
      </div>
    </button>
  );
}

// ── OVERLAY MODAL WRAPPER ─────────────────────────────────────────────────────
function OverlayModal({ onClose, children, maxWidth=420 }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(10,12,22,0.85)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:400, padding:20 }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="slide-up" style={{ background:'#1e2333', boxShadow:'-8px -8px 20px rgba(255,255,255,0.04),8px 8px 28px rgba(0,0,0,0.8)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, width:'100%', maxWidth, padding:28 }}>
        {children}
      </div>
    </div>
  );
}

// ── USER MENU ─────────────────────────────────────────────────────────────────
function UserMenu({ user, onLogout, onChangePassword, onProfile, onImport }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const h = e => { if(ref.current&&!ref.current.contains(e.target))setOpen(false); };
    document.addEventListener('mousedown', h);
    return()=>document.removeEventListener('mousedown', h);
  }, []);

  const menuBtn = (icon, label, onClick, danger=false) => (
    <button onClick={()=>{ setOpen(false); onClick(); }} style={{ width:'100%', padding:'10px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:13, color:danger?'#f87171':'var(--text-2)', textAlign:'left', display:'flex', alignItems:'center', gap:10, transition:'background .15s' }}
      onMouseEnter={e=>e.currentTarget.style.background=danger?'rgba(248,113,113,0.08)':'rgba(255,255,255,0.05)'}
      onMouseLeave={e=>e.currentTarget.style.background='none'}>
      <span style={{ fontSize:15 }}>{icon}</span>{label}
    </button>
  );

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={()=>setOpen(p=>!p)} style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 10px 5px 6px', background:open?'var(--bg-deep)':'var(--bg-raised)', boxShadow:open?'var(--neu-inset)':'-3px -3px 8px rgba(255,255,255,0.05),3px 3px 10px rgba(0,0,0,0.55)', border:`1px solid ${open?'rgba(0,93,165,0.3)':'rgba(255,255,255,0.07)'}`, borderRadius:10, cursor:'pointer', fontFamily:'inherit', transition:'all .18s' }}>
        <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#005da5,#0077c8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff', flexShrink:0 }}>
          {user.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
        </div>
        <span style={{ fontSize:12, fontWeight:500, color:'var(--text-1)' }} className="hide-mobile">{user.name.split(' ')[0]}</span>
        <span style={{ fontSize:9, fontWeight:700, color:ROLE_COLOR[user.role], background:ROLE_COLOR[user.role]+'18', border:'1px solid '+ROLE_COLOR[user.role]+'30', borderRadius:6, padding:'1px 6px', textTransform:'uppercase' }} className="hide-mobile">{ROLE_LABEL[user.role]}</span>
        <span style={{ fontSize:10, color:'var(--text-3)', marginLeft:2 }}>{open?'▲':'▼'}</span>
      </button>
      {open && (
        <div style={{ position:'fixed', zIndex:99999, top:(ref.current?.getBoundingClientRect().bottom||0)+8, right:16, width:220, background:'#1e2333', boxShadow:'-6px -6px 16px rgba(255,255,255,0.04),6px 6px 20px rgba(0,0,0,0.7)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:14, overflow:'hidden', animation:'fadeIn .18s ease' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize:13, fontWeight:700 }}>{user.name}</div>
            <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>@{user.username}</div>
            <div style={{ marginTop:6 }}><span style={{ fontSize:10, fontWeight:700, color:ROLE_COLOR[user.role], background:ROLE_COLOR[user.role]+'18', border:'1px solid '+ROLE_COLOR[user.role]+'30', borderRadius:6, padding:'2px 8px', textTransform:'uppercase' }}>{ROLE_LABEL[user.role]}</span></div>
          </div>
          <div style={{ padding:'8px 0' }}>
            {menuBtn('👤','Mi perfil', onProfile)}
            {menuBtn('🔑','Cambiar contraseña', onChangePassword)}
            {menuBtn('📥','Importar leads', onImport)}
            <div style={{ height:1, background:'rgba(255,255,255,0.06)', margin:'4px 0' }}/>
            {menuBtn('⏻','Cerrar sesión', onLogout, true)}
          </div>
        </div>
      )}
    </div>
  );
}

// ── CHANGE PASSWORD MODAL ─────────────────────────────────────────────────────
function ChangePasswordModal({ onClose, onSave }) {
  const [pw,setPw]=useState(''), [pw2,setPw2]=useState(''), [err,setErr]=useState('');
  const inp={ width:'100%', padding:'11px 14px', background:'#141720', boxShadow:'inset -2px -2px 6px rgba(255,255,255,0.03),inset 2px 2px 8px rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, color:'#e8eaf0', fontSize:13, fontFamily:'DM Sans,sans-serif', outline:'none' };
  const handle=()=>{ if(!pw||pw.length<6)return setErr('Mínimo 6 caracteres'); if(pw!==pw2)return setErr('Las contraseñas no coinciden'); onSave(pw); onClose(); };
  return (
    <OverlayModal onClose={onClose}>
      <div style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>🔑 Cambiar contraseña</div>
      <div style={{ marginBottom:14 }}><label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:7 }}>Nueva contraseña</label><input style={inp} type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr('');}} placeholder="Mínimo 6 caracteres"/></div>
      <div style={{ marginBottom:20 }}><label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:7 }}>Confirmar</label><input style={inp} type="password" value={pw2} onChange={e=>{setPw2(e.target.value);setErr('');}} placeholder="Repite la contraseña"/></div>
      {err&&<div style={{ fontSize:12, color:'#f87171', marginBottom:14, padding:'8px 12px', background:'rgba(248,113,113,0.1)', borderRadius:8, border:'1px solid rgba(248,113,113,0.25)' }}>{err}</div>}
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
        <ExoBtn size="exo-sm" variant="exo-ghost" onClick={onClose}>Cancelar</ExoBtn>
        <ExoBtn size="exo-sm" onClick={handle}>Guardar contraseña</ExoBtn>
      </div>
    </OverlayModal>
  );
}

// ── PROFILE MODAL ─────────────────────────────────────────────────────────────
function ProfileModal({ user, onClose, onSave }) {
  const [name,setName]=useState(user.name||''), [email,setEmail]=useState(user.email||'');
  const inp={ width:'100%', padding:'11px 14px', background:'#141720', boxShadow:'inset -2px -2px 6px rgba(255,255,255,0.03),inset 2px 2px 8px rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, color:'#e8eaf0', fontSize:13, fontFamily:'DM Sans,sans-serif', outline:'none' };
  return (
    <OverlayModal onClose={onClose}>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,#005da5,#0077c8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, color:'#fff', margin:'0 auto 12px', boxShadow:'0 0 20px rgba(0,93,165,0.4)' }}>
          {user.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
        </div>
        <div style={{ fontSize:16, fontWeight:700 }}>{user.name}</div>
        <div style={{ fontSize:12, color:'var(--text-3)', marginTop:3 }}>@{user.username} · <span style={{ color:ROLE_COLOR[user.role] }}>{ROLE_LABEL[user.role]}</span></div>
      </div>
      <div style={{ marginBottom:14 }}><label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:7 }}>Nombre</label><input style={inp} value={name} onChange={e=>setName(e.target.value)}/></div>
      <div style={{ marginBottom:22 }}><label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:7 }}>Email</label><input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)}/></div>
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
        <ExoBtn size="exo-sm" variant="exo-ghost" onClick={onClose}>Cancelar</ExoBtn>
        <ExoBtn size="exo-sm" onClick={()=>{ onSave({name,email}); onClose(); }}>Guardar perfil</ExoBtn>
      </div>
    </OverlayModal>
  );
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function Toast({ notif, onClose }) {
  return (
    <div style={{ background:'var(--bg-raised)', boxShadow:'-4px -4px 12px rgba(255,255,255,0.05),4px 4px 16px rgba(0,0,0,0.6)', border:'1px solid rgba(248,113,113,0.35)', borderRadius:14, padding:'13px 16px', display:'flex', gap:10, alignItems:'flex-start', animation:'notifIn .35s ease', maxWidth:340 }}>
      <span style={{ fontSize:18, flexShrink:0 }}>⏰</span>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:12, fontWeight:700, color:'#f87171', marginBottom:3 }}>Recordatorio de tarea</div>
        <div style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.4 }}>{notif.text}</div>
      </div>
      <button onClick={onClose} style={{ background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.25)', cursor:'pointer', color:'#f87171', fontSize:16, lineHeight:1, fontFamily:'inherit', borderRadius:7, width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const auth = useAuth();
  const crm  = useCRM(auth.currentUser?.id);
  const cat  = useCatalog();
  const cfg  = useConfig();
  const fcast = useForecast();
  const [tab,          setTab]         = useState('kanban');
  const [selected,     setSelected]    = useState(null);
  const [showNew,      setShowNew]     = useState(false);
  const [showChangePw, setShowChangePw]= useState(false);
  const [showProfile,  setShowProfile] = useState(false);
  const [showImport,   setShowImport]   = useState(false);
  const [enabledWidgets, setEnabledWidgets] = useState(() => { try { const v=localStorage.getItem('exv_widgets'); return v?JSON.parse(v):['leads_hoy','sin_gestionar','citas','pruebas','propuestas','creditos','ranking_asesores']; } catch { return ['leads_hoy','sin_gestionar','citas','pruebas','propuestas','creditos','ranking_asesores']; } });

  const toggleWidget = (id) => { setEnabledWidgets(prev => { const next = prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]; localStorage.setItem('exv_widgets',JSON.stringify(next)); return next; }); };

  if (!auth.currentUser) return <LoginScreen onLogin={auth.login}/> ;

  const u = auth.currentUser;
  const hasPerm = auth.hasPermission;
  const canDel  = hasPerm('eliminar_clientes');
  const selectedFull = selected ? crm.clients.find(c=>c.id===selected.id)||selected : null;

  const TABS = [
    hasPerm('ver_pipeline') && { id:'kanban',   label:'Pipeline',      Icon:KanbanIcon },
    hasPerm('ver_pipeline') && { id:'lista',     label:'Clientes',      Icon:ListIcon   },
    hasPerm('ver_agenda')   && { id:'agenda',    label:'Agenda',        Icon:CalIcon    },
    hasPerm('ver_reportes') && { id:'reportes',  label:'Reportes',      Icon:ChartIcon  },
    (u.role==='admin')      && { id:'usuarios',  label:'Usuarios',      Icon:UsersIcon  },
    (u.role==='admin'||u.role==='gerente') && { id:'forecast', label:'Forecast', Icon:({s=14})=><svg width={s} height={s} viewBox='0 0 24 24' fill='currentColor'><path d='M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z'/></svg> },
    hasPerm('configuracion')&& { id:'settings',  label:'Configuración', Icon:GearIcon   },
  ].filter(Boolean);

  const validTab = TABS.find(t=>t.id===tab) ? tab : (TABS[0]?.id||'kanban');

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-deep)' }}>
      {/* ── HEADER ── */}
      <header style={{ background:'var(--bg-card)', boxShadow:'0 4px 24px rgba(0,0,0,0.5)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 16px 0 20px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#005da5,#0077c8)', boxShadow:'0 0 16px rgba(0,93,165,0.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="3.5" fill="#fff"/><path d="M9 1v3M9 14v3M1 9h3M14 9h3M3.34 3.34l2.12 2.12M12.54 12.54l2.12 2.12M12.54 5.46l-2.12 2.12M5.46 12.54l-2.12 2.12" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </div>
          <div>
            <div style={{ fontSize:17, fontWeight:700, letterSpacing:'0.04em', background:'linear-gradient(90deg,#60a5fa,#38bdf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Exonver</div>
            <div style={{ fontSize:9, color:'#005da5', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase' }}>Fase 1</div>
          </div>
        </div>
        <div style={{ flex:1, textAlign:'center', padding:'0 12px' }} className="hide-mobile">
          <div style={{ fontFamily:'DM Serif Display,serif', fontSize:11, fontStyle:'italic', color:'var(--text-3)' }}>"Donde la experiencia del cliente se transforma en éxito comercial."</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <button onClick={()=>setTab('agenda')} title="Agenda" style={{ width:34, height:34, borderRadius:9, background:validTab==='agenda'?'#005da5':'rgba(255,255,255,0.05)', border:validTab==='agenda'?'1px solid #005da5':'1px solid rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', color:validTab==='agenda'?'#fff':'var(--text-2)', cursor:'pointer', transition:'all .18s' }}>
            <CalIcon s={14}/>
          </button>
          {hasPerm('crear_clientes') && (
            <ExoBtn onClick={()=>setShowNew(true)}>
              <PlusIcon s={13}/><span className="hide-mobile">Nuevo cliente</span><span className="hide-desktop">Nuevo</span>
            </ExoBtn>
          )}
          <UserMenu user={u} onLogout={auth.logout} onChangePassword={()=>setShowChangePw(true)} onProfile={()=>setShowProfile(true)} onImport={()=>setShowImport(true)}/>
        </div>
      </header>

      {/* ── TABS ── */}
      <nav style={{ background:'var(--bg-card)', borderBottom:'1px solid rgba(255,255,255,0.07)', padding:'0 20px', display:'flex', gap:4, position:'sticky', top:56, zIndex:99, boxShadow:'0 2px 12px rgba(0,0,0,0.35)', overflowX:'auto' }}>
        {TABS.map(t=>{
          const active=validTab===t.id;
          return <button key={t.id} onClick={()=>setTab(t.id)} style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, padding:'12px 14px', background:'none', border:'none', cursor:'pointer', color:active?'#fff':'var(--text-3)', borderBottom:active?'2px solid #005da5':'2px solid transparent', fontWeight:active?700:400, transition:'all .15s', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap' }}>
            <t.Icon s={13}/><span className="hide-mobile">{t.label}</span>
          </button>;
        })}
      </nav>

      {/* ── STATS ── */}
      {hasPerm('ver_pipeline')&&(
        <div className="stats-bar" style={{ display:'flex', alignItems:'stretch', gap:12, padding:'14px 20px', overflowX:'auto', background:'linear-gradient(180deg,var(--bg-card) 0%,transparent 100%)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          {[{l:'Total',v:crm.stats.total,c:'#e8eaf0'},{l:'Pipeline',v:crm.stats.active,c:'#fbbf24'},{l:'Fríos ❄',v:crm.stats.cold,c:'#f87171'}].map(s=>(
            <div key={s.l} style={{ background:'var(--bg-card)', boxShadow:'-4px -4px 10px rgba(255,255,255,0.04),4px 4px 12px rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 16px', minWidth:90, flexShrink:0 }}>
              <div style={{ fontSize:10, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>{s.l}</div>
              <div style={{ fontSize:24, fontWeight:700, color:s.c }}>{s.v}</div>
            </div>
          ))}
          <div style={{ background:'var(--bg-card)', boxShadow:'-4px -4px 10px rgba(255,255,255,0.04),4px 4px 12px rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 16px', minWidth:150, flexShrink:0 }}>
            <div style={{ fontSize:10, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>Resultados</div>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div><div style={{ fontSize:21, fontWeight:700, color:'#4ade80' }}>{crm.stats.closed}</div><div style={{ fontSize:9, color:'#4ade80', fontWeight:700, textTransform:'uppercase' }}>Cerrados</div></div>
              <div style={{ width:1, height:28, background:'rgba(255,255,255,0.07)' }}/>
              <div><div style={{ fontSize:21, fontWeight:700, color:'#f87171' }}>{crm.stats.lost}</div><div style={{ fontSize:9, color:'#f87171', fontWeight:700, textTransform:'uppercase' }}>Perdidos</div></div>
            </div>
          </div>
          <div style={{ flex:1 }}/>
          {crm.stats.pendingTasks>0&&(
            <div onClick={()=>setTab('agenda')} style={{ background:'var(--bg-card)', boxShadow:'-4px -4px 10px rgba(255,255,255,0.04),4px 4px 12px rgba(0,0,0,0.5)', border:'1px solid rgba(0,93,165,0.25)', borderRadius:12, padding:'12px 16px', minWidth:130, flexShrink:0, cursor:'pointer' }}>
              <div style={{ fontSize:10, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>Tareas</div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                {crm.stats.taskOverdue>0&&<><div><div style={{ fontSize:18, fontWeight:700, color:'#f87171', lineHeight:1 }}>{crm.stats.taskOverdue}</div><div style={{ fontSize:8, color:'#f87171', fontWeight:700, textTransform:'uppercase' }}>Vencidas</div></div><div style={{ width:1, height:24, background:'rgba(255,255,255,0.07)' }}/></>}
                {crm.stats.taskUpcoming>0&&<><div><div style={{ fontSize:18, fontWeight:700, color:'#fbbf24', lineHeight:1 }}>{crm.stats.taskUpcoming}</div><div style={{ fontSize:8, color:'#fbbf24', fontWeight:700, textTransform:'uppercase' }}>Próximas</div></div><div style={{ width:1, height:24, background:'rgba(255,255,255,0.07)' }}/></>}
                {crm.stats.taskOnTime>0&&<div><div style={{ fontSize:18, fontWeight:700, color:'#4ade80', lineHeight:1 }}>{crm.stats.taskOnTime}</div><div style={{ fontSize:8, color:'#4ade80', fontWeight:700, textTransform:'uppercase' }}>Al día</div></div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── DASHBOARD WIDGETS ── */}
      {hasPerm('ver_pipeline') && enabledWidgets.length > 0 && (
        <DashboardWidgets clients={crm.allClients} stages={crm.stages} users={auth.users} currentUser={u} enabledWidgets={enabledWidgets}/>
      )}

      {/* ── VIEWS ── */}
      <div className="main-content" style={{ paddingTop:4 }}>
        {validTab==='kanban'   && <KanbanBoard stages={crm.stages} clients={crm.clients} onClientClick={setSelected}/>}
        {validTab==='lista'    && <ClientList  stages={crm.stages} clients={crm.clients} onClientClick={setSelected} origins={cfg.origins}/>}
        {validTab==='agenda'   && <AgendaView  clients={crm.clients} onClientClick={c=>{ setSelected(c); setTab('kanban'); }}/>}
        {validTab==='reportes' && <ReportsView stages={crm.stages} clients={crm.allClients} users={auth.users} currentUser={u}/>}
        {validTab==='usuarios' && <UsersView   users={auth.users} currentUser={u} catalog={cat.catalog} onCreateUser={auth.createUser} onUpdateUser={auth.updateUser} onDeleteUser={auth.deleteUser}/>}
        {validTab==='forecast' && <ForecastView currentUser={u} users={auth.users} allClients={crm.allClients} getForecast={fcast.getForecast} setForecast={fcast.setForecast} getActual={fcast.getActual}/>}
        {validTab==='settings' && <SettingsView stages={crm.stages} clients={crm.clients} isAdmin={u.role==='admin'} onAddStage={crm.addStage} onRemoveStage={crm.removeStage} onReorderStages={crm.reorderStages} catalog={cat.catalog} onAddBrand={cat.addBrand} onRemoveBrand={cat.removeBrand} onAddRef={cat.addRef} onRemoveRef={cat.removeRef} onAddYear={cat.addYear} onRemoveYear={cat.removeYear} origins={cfg.origins} paymentTypes={cfg.paymentTypes} taskTypes={cfg.taskTypes} lossReasons={cfg.lossReasons} onAddOrigin={cfg.addOrigin} onRemoveOrigin={cfg.removeOrigin} onAddPaymentType={cfg.addPaymentType} onRemovePaymentType={cfg.removePaymentType} onAddTaskType={cfg.addTaskType} onRemoveTaskType={cfg.removeTaskType} onAddLossReason={cfg.addLossReason} onRemoveLossReason={cfg.removeLossReason} onEditLossReason={cfg.editLossReason} enabledWidgets={enabledWidgets} onToggleWidget={toggleWidget} currentUserRole={u.role}/>}
      </div>

      {/* ── MODALS ── */}
      {selectedFull&&(
        <ClientModal client={selectedFull} stages={crm.stages} catalog={cat.catalog} allowedBrands={u.allowedBrands||[]} isAdmin={u.role==='admin'} origins={cfg.origins} paymentTypes={cfg.paymentTypes} taskTypes={cfg.taskTypes} lossReasons={cfg.lossReasons} canDelete={canDel} onClose={()=>setSelected(null)} onSave={(id,form)=>{ crm.updateClient(id,form); setSelected(null); }} onDelete={id=>{ crm.deleteClient(id); setSelected(null); }} onAddNote={crm.addNote} onMoveClient={crm.moveClient} onAddTask={crm.addTask} onToggleTask={crm.toggleTask} onDeleteTask={crm.deleteTask} onEditTask={crm.editTask}/>
      )}
      {showNew&&hasPerm('crear_clientes')&&(
        <NewClientModal stages={crm.stages} catalog={cat.catalog} allowedBrands={u.allowedBrands||[]} isAdmin={u.role==='admin'} origins={cfg.origins} paymentTypes={cfg.paymentTypes} onClose={()=>setShowNew(false)} onCreate={form=>{ crm.createClient(form); setShowNew(false); }}/>
      )}
      {showChangePw&&<ChangePasswordModal onClose={()=>setShowChangePw(false)} onSave={pw=>auth.updateUser(u.id,{password:pw})}/>}
      {showProfile&&<ProfileModal user={u} onClose={()=>setShowProfile(false)} onSave={data=>auth.updateUser(u.id,data)}/>}
      {showImport&&<ImportLeadsModal onClose={()=>{setShowImport(false);setTab('kanban');}} onCreate={c=>crm.importClient(c)} origins={cfg.origins} currentUserId={u.id}/>}

      {/* ── TOASTS ── */}
      <div style={{ position:'fixed', top:72, right:16, zIndex:500, display:'flex', flexDirection:'column', gap:10 }}>
        {crm.pendingNotifs.map(n=><Toast key={n.id} notif={n} onClose={()=>crm.dismissNotif(n.id)}/>)}
      </div>
    </div>
  );
}
