import React, { useEffect, useState } from 'react';
import { api, getPortalRole } from '../api';

export default function Users() {
  const portalRole = getPortalRole();
  const isSuperAdmin = portalRole === 'SuperAdmin';

  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User',
    isActive: true,
    areaId: '',
  });
  const [areaEdits, setAreaEdits] = useState({});

  const load = async () => {
    try {
      const list = await api('/api/admin/users?page=1&pageSize=200');
      setUsers(list);
    } catch (e) {
      setError(e.body?.message || e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createUser = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          areaId: form.areaId === '' ? undefined : Number(form.areaId),
        }),
      });
      setForm({ name: '', email: '', password: '', role: 'User', isActive: true, areaId: '' });
      await load();
    } catch (err) {
      setError(err.body?.message || err.message);
    }
  };

  const toggleActive = async (u) => {
    try {
      await api(`/api/admin/users/${u.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !u.isActive }),
      });
      await load();
    } catch (err) {
      setError(err.body?.message || err.message);
    }
  };

  const saveAreaId = async (u) => {
    const nextAreaId = Number(areaEdits[u.id]);
    if (!Number.isFinite(nextAreaId) || nextAreaId <= 0) {
      setError('Area ID must be a positive number.');
      return;
    }
    try {
      await api(`/api/admin/users/${u.id}`, {
        method: 'PUT',
        body: JSON.stringify({ areaId: nextAreaId }),
      });
      await load();
    } catch (err) {
      setError(err.body?.message || err.message);
    }
  };

  return (
    <div>
      <h1>App users</h1>
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      <h2>Add user</h2>
      <p style={{ color: '#555', marginTop: -8 }}>
        Choose <strong>User</strong> for mobile app accounts. Choose <strong>Admin</strong> for staff who can use this portal
        {isSuperAdmin ? ' (only you can assign SuperAdmin).' : '.'}
      </p>
      <form
        onSubmit={createUser}
        style={{
          display: 'grid',
          gap: 10,
          maxWidth: 480,
          background: '#fff',
          padding: 16,
          borderRadius: 10,
          border: '1px solid #e0e0e0',
          marginBottom: 24,
        }}
      >
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Role</span>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
          >
            <option value="User">User (app)</option>
            <option value="Admin">Admin (portal)</option>
            {isSuperAdmin && <option value="SuperAdmin">SuperAdmin</option>}
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>
        <input
          placeholder="Area ID (optional, auto if empty)"
          type="number"
          min="1"
          value={form.areaId}
          onChange={(e) => setForm({ ...form, areaId: e.target.value })}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{
            padding: 10,
            background: '#1a73e8',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Create user
        </button>
      </form>

      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 10, border: '1px solid #e0e0e0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f0f4ff' }}>
              <th style={{ padding: 10 }}>Name</th>
              <th style={{ padding: 10 }}>Email</th>
              <th style={{ padding: 10 }}>Role</th>
              <th style={{ padding: 10 }}>Area ID</th>
              <th style={{ padding: 10 }}>Active</th>
              <th style={{ padding: 10 }} />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>{u.name}</td>
                <td style={{ padding: 10 }}>{u.email}</td>
                <td style={{ padding: 10 }}>{u.role}</td>
                <td style={{ padding: 10 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      min="1"
                      value={areaEdits[u.id] ?? u.areaId ?? 1}
                      onChange={(e) => setAreaEdits((prev) => ({ ...prev, [u.id]: e.target.value }))}
                      style={{ width: 90, padding: 6, borderRadius: 6, border: '1px solid #ccc' }}
                    />
                    <button type="button" onClick={() => saveAreaId(u)}>
                      Save
                    </button>
                  </div>
                </td>
                <td style={{ padding: 10 }}>{u.isActive ? 'Yes' : 'No'}</td>
                <td style={{ padding: 10 }}>
                  <button type="button" onClick={() => toggleActive(u)}>
                    Toggle active
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
