import React, { useState } from 'react';
import { ALL_PERMISSIONS, ROLE_DEFAULTS } from './useAuth';
import { ExoBtn } from '../App';

const ROLES = [
  { id:'admin',    label:'Administrador', color:'#f472b6', bg:'rgba(244,114,182,0.12)' },
  { id:'gerente',  label:'Gerente',       color:'#fbbf24', bg:'rgba(251,191,36,0.12)'  },
  { id:'vendedor', label:'Vendedor',      color:'#60a5fa', bg:'rgba(96,165,250,0.12)'  },
];

function RoleBadge({ role }) {
  const r = ROLES.find(x=>x.id===role)||ROLES[2];
  return <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:20, background:r.bg, color:r.color, border:'1px solid '+r.color+'30' }}>{r.label}</span>;
}

const inputSt = { width:'100%', padding:'10px 13px', background:'#141720', boxShadow:'inset -2px -2px 5px rgba(255,255,255,0.03),inset 2px 2px 7px rgba(0,0,0,0.45)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, color:'#e8eaf0', fontSize:13, fontFamily:'DM Sans,sans-serif', outline:'none' };

function UserForm({ initial, onSave, onCancel, isAdmin, catalog=[] }) {
  const [form, setForm] = useState({
    name:          initial?.name     || '',
    username:      initial?.username || '',
    password:      initial?.password || '',
    email:         initial?.email    || '',
    role:          initial?.role     || 'vendedor',
    active:        initial?.active   !== false,
    permissions:   initial?.permissions   || ROLE_DEFAULTS['vendedor'],
    allowedBrands: initial?.allowedBrands || [],
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleRoleChange = (role) => { set('role',role); set('permissions', ROLE_DEFAULTS[role]||[]); };
  const togglePerm = (id) => {
    const has = form.permissions.includes(id);
    set('permissions', has ? form.permissions.filter(p=>p!==id) : [...form.permissions, id]);
  };
  const groups = [...new Set(ALL_PERMISSIONS.map(p=>p.group))];

  return (
    <div style={{ background:'#1e2333', boxShadow:'-6px -6px 16px rgba(255,255,255,0.03),6px 6px 20px rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:18, padding:24, marginBottom:16 }}>
      <div style={{ fontSize:14, fontWeight:700, marginBottom:20 }}>{initial?'Editar usuario':'Nuevo usuario'}</div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }} className="grid-2">
        <div><label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Nombre completo</label><input style={inputSt} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Nombre del usuario"/></div>
        <div><label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Usuario (login)</label><input style={inputSt} value={form.username} onChange={e=>set('username',e.target.value)} placeholder="usuario123" disabled={!!initial}/></div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }} className="grid-2">
        <div><label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>{initial?'Nueva contraseña (vacío = sin cambio)':'Contraseña'}</label><input style={inputSt} type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="••••••••"/></div>
        <div><label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Email</label><input style={inputSt} type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="usuario@exonver.com"/></div>
      </div>

      {/* Role */}
      <div style={{ marginBottom:20 }}>
        <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>Rol</label>
        <div style={{ display:'flex', gap:10 }}>
          {ROLES.map(r=>(
            <button key={r.id} onClick={()=>handleRoleChange(r.id)} style={{ flex:1, padding:'10px', borderRadius:10, cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontSize:12, fontWeight:700, transition:'all .15s', background:form.role===r.id?r.color:'rgba(255,255,255,0.04)', color:form.role===r.id?'#0f172a':r.color, border:`1px solid ${r.color}${form.role===r.id?'':'30'}`, boxShadow:form.role===r.id?'0 0 14px '+r.color+'40':'none' }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Permissions */}
      {isAdmin && form.role !== 'admin' && (
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:12 }}>Permisos específicos</label>
          {groups.map(group=>(
            <div key={group} style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.4)', marginBottom:8 }}>{group}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {ALL_PERMISSIONS.filter(p=>p.group===group).map(p=>{
                  const has = form.permissions.includes(p.id);
                  return (
                    <button key={p.id} onClick={()=>togglePerm(p.id)} style={{ fontSize:11, padding:'5px 12px', borderRadius:8, cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontWeight:500, transition:'all .15s', background:has?'rgba(0,93,165,0.2)':'rgba(255,255,255,0.04)', color:has?'#60a5fa':'rgba(255,255,255,0.4)', border:`1px solid ${has?'rgba(0,93,165,0.4)':'rgba(255,255,255,0.08)'}`, boxShadow:has?'0 0 8px rgba(0,93,165,0.2)':'none' }}>
                      {has?'✓ ':''}{p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Brand permissions */}
      {isAdmin && form.role !== 'admin' && catalog.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 }}>Marcas asignadas</label>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:10 }}>El usuario solo verá estas marcas al registrar vehículos.</p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {catalog.map(b=>{
              const has = form.allowedBrands.includes(b.id);
              return (
                <button key={b.id} onClick={()=>set('allowedBrands', has?form.allowedBrands.filter(x=>x!==b.id):[...form.allowedBrands,b.id])} style={{ fontSize:12, padding:'6px 14px', borderRadius:20, cursor:'pointer', fontFamily:'DM Sans,sans-serif', fontWeight:500, transition:'all .15s', background:has?'rgba(52,211,153,0.2)':'rgba(255,255,255,0.04)', color:has?'#34d399':'rgba(255,255,255,0.4)', border:has?'1px solid rgba(52,211,153,0.4)':'1px solid rgba(255,255,255,0.08)' }}>
                  {has?'✓ ':''}{b.name}
                </button>
              );
            })}
          </div>
          {form.allowedBrands.length===0&&<p style={{ fontSize:11, color:'rgba(248,113,113,0.7)', marginTop:8 }}>⚠ Sin marcas asignadas</p>}
        </div>
      )}

      {/* Active toggle */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <div onClick={()=>set('active',!form.active)} style={{ width:40, height:22, borderRadius:11, cursor:'pointer', transition:'background .2s', background:form.active?'#005da5':'rgba(255,255,255,0.1)', boxShadow:'inset 1px 1px 4px rgba(0,0,0,0.4)', position:'relative' }}>
          <div style={{ position:'absolute', top:3, left:form.active?20:3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left .2s', boxShadow:'0 1px 4px rgba(0,0,0,0.4)' }}/>
        </div>
        <span style={{ fontSize:13, color:form.active?'#4ade80':'rgba(255,255,255,0.4)', fontWeight:500 }}>{form.active?'Usuario activo':'Usuario inactivo'}</span>
      </div>

      <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
        <ExoBtn size="exo-sm" variant="exo-ghost" onClick={onCancel}>Cancelar</ExoBtn>
        <ExoBtn size="exo-sm" onClick={()=>{
          if(!form.name||!form.username)return alert('Nombre y usuario son obligatorios');
          if(!initial&&!form.password)return alert('La contraseña es obligatoria');
          onSave(form);
        }}>{initial?'Guardar cambios':'Crear usuario'}</ExoBtn>
      </div>
    </div>
  );
}

export function UsersView({ users, currentUser, onCreateUser, onUpdateUser, onDeleteUser, catalog=[] }) {
  const [showForm,  setShowForm]  = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search,    setSearch]    = useState('');
  const isAdmin = currentUser?.role === 'admin';

  const handleCreate = (form) => { const r=onCreateUser(form); if(!r.ok)return alert(r.error); setShowForm(false); };
  const handleUpdate = (id, form) => { const u={...form}; if(!u.password)delete u.password; onUpdateUser(id,u); setEditingId(null); };
  const handleDelete = (user) => { if(!window.confirm(`¿Eliminar "${user.name}"?`))return; const r=onDeleteUser(user.id); if(r&&!r.ok)alert(r.error); };

  const filtered = users.filter(u => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || (u.email||'').toLowerCase().includes(q);
  });

  return (
    <div style={{ padding:'0 20px 28px', maxWidth:800 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>Usuarios del sistema</h2>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>{filtered.length} de {users.length} usuario{users.length!==1?'s':''}</p>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <input
            className="neu-input"
            style={{ width:200, padding:'8px 14px' }}
            placeholder="🔍 Buscar usuario..."
            value={search}
            onChange={e=>setSearch(e.target.value)}
          />
          {isAdmin && !showForm && <ExoBtn size="exo-sm" onClick={()=>setShowForm(true)}>+ Nuevo usuario</ExoBtn>}
        </div>
      </div>

      {showForm && <UserForm isAdmin={isAdmin} catalog={catalog} onSave={handleCreate} onCancel={()=>setShowForm(false)}/>}

      {filtered.length===0 && search && (
        <div style={{ textAlign:'center', padding:'32px 0', color:'var(--text-3)', fontSize:13 }}>
          Sin usuarios que coincidan con "{search}"
        </div>
      )}

      {filtered.map(user=>(
        <div key={user.id}>
          {editingId===user.id ? (
            <UserForm initial={user} isAdmin={isAdmin} catalog={catalog} onSave={form=>handleUpdate(user.id,form)} onCancel={()=>setEditingId(null)}/>
          ) : (
            <div style={{ background:'#1e2333', boxShadow:'-4px -4px 10px rgba(255,255,255,0.03),4px 4px 12px rgba(0,0,0,0.5)', border:user.id===currentUser?.id?'1px solid rgba(0,93,165,0.4)':'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'16px 20px', marginBottom:10, display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#005da5,#0077c8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#fff', flexShrink:0, boxShadow:'0 0 10px rgba(0,93,165,0.3)' }}>
                {user.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                  <span style={{ fontSize:14, fontWeight:600 }}>{user.name}</span>
                  {user.id===currentUser?.id&&<span style={{ fontSize:9, fontWeight:700, color:'#60a5fa', background:'rgba(0,93,165,0.12)', border:'1px solid rgba(0,93,165,0.25)', borderRadius:6, padding:'1px 7px', textTransform:'uppercase' }}>Tú</span>}
                  <RoleBadge role={user.role}/>
                  {!user.active&&<span style={{ fontSize:9, fontWeight:700, color:'#f87171', background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:6, padding:'1px 7px', textTransform:'uppercase' }}>Inactivo</span>}
                </div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', display:'flex', gap:14, flexWrap:'wrap' }}>
                  <span>@{user.username}</span>{user.email&&<span>{user.email}</span>}<span>{(user.permissions||[]).length} permisos</span>
                </div>
              </div>
              {isAdmin && (
                <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                  <ExoBtn size="exo-sm" onClick={()=>setEditingId(user.id)}>✏ Editar</ExoBtn>
                  {user.id!==currentUser?.id && <ExoBtn size="exo-sm" variant="exo-danger" onClick={()=>handleDelete(user)}>× Eliminar</ExoBtn>}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {!isAdmin && (
        <div style={{ padding:'14px 18px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:8 }}>
          Solo el Administrador puede crear, editar o eliminar usuarios.
        </div>
      )}
    </div>
  );
}
