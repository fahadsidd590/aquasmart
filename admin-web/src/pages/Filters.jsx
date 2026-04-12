import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Filters() {
  const [filters, setFilters] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [historyId, setHistoryId] = useState('');
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({
    userId: '',
    name: '',
    brand: '',
    model: '',
    installDateUtc: '',
    expireDateUtc: '',
    notes: '',
  });

  const loadFilters = async () => {
    const list = await api('/api/admin/filters?page=1&pageSize=200');
    setFilters(list);
  };

  useEffect(() => {
    (async () => {
      try {
        const u = await api('/api/admin/users?role=User&isActive=true&page=1&pageSize=200');
        setUsers(u);
        await loadFilters();
      } catch (e) {
        setError(e.body?.message || e.message);
      }
    })();
  }, []);

  const createFilter = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/api/admin/filters', {
        method: 'POST',
        body: JSON.stringify({
          userId: form.userId,
          name: form.name,
          brand: form.brand || null,
          model: form.model || null,
          installDateUtc: new Date(form.installDateUtc).toISOString(),
          expireDateUtc: new Date(form.expireDateUtc).toISOString(),
          notes: form.notes || null,
        }),
      });
      setForm({
        userId: form.userId,
        name: '',
        brand: '',
        model: '',
        installDateUtc: '',
        expireDateUtc: '',
        notes: '',
      });
      await loadFilters();
    } catch (err) {
      setError(err.body?.message || err.message);
    }
  };

  const loadHistory = async (id) => {
    setHistoryId(id);
    const h = await api(`/api/admin/filters/${id}/history?page=1&pageSize=50`);
    setHistory(h);
  };

  return (
    <div>
      <h1>Water filters</h1>
      {error && <p style={{ color: '#c00' }}>{error}</p>}

      <h2>Add filter for active user</h2>
      <form
        onSubmit={createFilter}
        style={{
          display: 'grid',
          gap: 10,
          maxWidth: 520,
          background: '#fff',
          padding: 16,
          borderRadius: 10,
          border: '1px solid #e0e0e0',
          marginBottom: 24,
        }}
      >
        <select
          required
          value={form.userId}
          onChange={(e) => setForm({ ...form, userId: e.target.value })}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        >
          <option value="">Select user</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
        <input
          placeholder="Filter name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <input
          placeholder="Brand (optional)"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <input
          placeholder="Model (optional)"
          value={form.model}
          onChange={(e) => setForm({ ...form, model: e.target.value })}
          style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <label style={{ fontSize: 13 }}>Install (local → sent as ISO UTC)</label>
        <input
          type="datetime-local"
          value={form.installDateUtc}
          onChange={(e) => setForm({ ...form, installDateUtc: e.target.value })}
          required
          style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <label style={{ fontSize: 13 }}>Expire</label>
        <input
          type="datetime-local"
          value={form.expireDateUtc}
          onChange={(e) => setForm({ ...form, expireDateUtc: e.target.value })}
          required
          style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
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
          Save filter
        </button>
      </form>

      <h2>All filters</h2>
      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 10, border: '1px solid #e0e0e0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f0f4ff' }}>
              <th style={{ padding: 10 }}>User</th>
              <th style={{ padding: 10 }}>Name</th>
              <th style={{ padding: 10 }}>Expires</th>
              <th style={{ padding: 10 }}>Status</th>
              <th style={{ padding: 10 }} />
            </tr>
          </thead>
          <tbody>
            {filters.map((f) => (
              <tr key={f.id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>
                  {f.userName}
                  <div style={{ fontSize: 12, color: '#666' }}>{f.userEmail}</div>
                </td>
                <td style={{ padding: 10 }}>{f.name}</td>
                <td style={{ padding: 10 }}>{new Date(f.expireDateUtc).toLocaleString()}</td>
                <td style={{ padding: 10 }}>{f.status}</td>
                <td style={{ padding: 10 }}>
                  <button type="button" onClick={() => loadHistory(f.id)}>
                    History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {historyId && (
        <div style={{ marginTop: 24 }}>
          <h3>History for {historyId}</h3>
          <ul>
            {history.map((h) => (
              <li key={h.id} style={{ marginBottom: 8 }}>
                <strong>{h.action}</strong> — {new Date(h.atUtc).toLocaleString()} — {h.details}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
