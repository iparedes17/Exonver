import { useState, useCallback } from 'react';
import { generateId, load, save } from '../utils/helpers';

// ── DEFAULT PERMISSIONS ───────────────────────────────────────────────────────
export const ALL_PERMISSIONS = [
  { id:'ver_pipeline',       label:'Ver pipeline',             group:'Pipeline' },
  { id:'mover_clientes',     label:'Mover clientes en pipeline',group:'Pipeline' },
  { id:'crear_clientes',     label:'Crear clientes',            group:'Clientes' },
  { id:'editar_clientes',    label:'Editar clientes',           group:'Clientes' },
  { id:'eliminar_clientes',  label:'Eliminar clientes',         group:'Clientes' },
  { id:'ver_tareas',         label:'Ver tareas',                group:'Tareas' },
  { id:'crear_tareas',       label:'Crear tareas',              group:'Tareas' },
  { id:'editar_tareas',      label:'Editar / reprogramar tareas',group:'Tareas' },
  { id:'ver_reportes',       label:'Ver reportes',              group:'Reportes' },
  { id:'ver_agenda',         label:'Ver agenda',                group:'Agenda' },
  { id:'configuracion',      label:'Acceder a configuración',   group:'Sistema' },
  { id:'gestionar_usuarios', label:'Gestionar usuarios',        group:'Sistema' },
];

export const ROLE_DEFAULTS = {
  admin:    ALL_PERMISSIONS.map(p => p.id),
  gerente:  ['ver_pipeline','mover_clientes','crear_clientes','editar_clientes','ver_tareas','crear_tareas','editar_tareas','ver_reportes','ver_agenda'],
  vendedor: ['ver_pipeline','mover_clientes','crear_clientes','editar_clientes','ver_tareas','crear_tareas','editar_tareas','ver_agenda'],
};

const DEFAULT_USERS = [
  {
    id: 'u1', name: 'Administrador', username: 'admin', password: 'admin123',
    role: 'admin', email: 'admin@exonver.com', cargo: 'Administrador', celular: '', active: true,
    permissions: ROLE_DEFAULTS.admin,
    allowedBrands: [], // admin sees all brands always
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u2', name: 'Carlos Asesor', username: 'carlos', password: 'carlos123',
    role: 'vendedor', email: 'carlos@exonver.com', cargo: 'Asesor Comercial', celular: '', active: true,
    permissions: ROLE_DEFAULTS.vendedor,
    allowedBrands: ['toyota','mazda','chevrolet'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u3', name: 'Gerente General', username: 'gerente', password: 'gerente123',
    role: 'gerente', email: 'gerente@exonver.com', cargo: 'Gerente Comercial', celular: '', active: true,
    permissions: ROLE_DEFAULTS.gerente,
    allowedBrands: [],
    createdAt: new Date().toISOString(),
  },
];

export function useAuth() {
  const [users,       setUsers]       = useState(() => load('exv_users', DEFAULT_USERS));
  const [currentUser, setCurrentUser] = useState(() => load('exv_session', null));

  const login = useCallback((username, password) => {
    const user = users.find(u => u.username === username && u.password === password && u.active);
    if (!user) return { ok: false, error: 'Usuario o contraseña incorrectos' };
    setCurrentUser(user);
    save('exv_session', user);
    return { ok: true, user };
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    save('exv_session', null);
  }, []);

  const createUser = useCallback((data) => {
    if (users.find(u => u.username === data.username)) return { ok: false, error: 'El usuario ya existe' };
    const newUser = {
      id: generateId(),
      ...data,
      active: true,
      permissions: data.permissions || ROLE_DEFAULTS[data.role] || [],
      createdAt: new Date().toISOString(),
    };
    const updated = [...users, newUser];
    setUsers(updated);
    save('exv_users', updated);
    return { ok: true, user: newUser };
  }, [users]);

  const updateUser = useCallback((id, data) => {
    const updated = users.map(u => u.id === id ? { ...u, ...data } : u);
    setUsers(updated);
    save('exv_users', updated);
    // update session if editing self
    if (currentUser?.id === id) {
      const refreshed = updated.find(u => u.id === id);
      setCurrentUser(refreshed);
      save('exv_session', refreshed);
    }
  }, [users, currentUser]);

  const deleteUser = useCallback((id) => {
    if (id === currentUser?.id) return { ok: false, error: 'No puedes eliminarte a ti mismo' };
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    save('exv_users', updated);
    return { ok: true };
  }, [users, currentUser]);

  const hasPermission = useCallback((permId) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return (currentUser.permissions || []).includes(permId);
  }, [currentUser]);

  return { users, currentUser, login, logout, createUser, updateUser, deleteUser, hasPermission };
}
