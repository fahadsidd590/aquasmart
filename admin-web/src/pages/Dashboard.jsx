import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const d = await api('/api/admin/dashboard');
        setData(d);
      } catch (e) {
        setError(e.body?.message || e.message);
      }
    })();
  }, []);

  if (error) return <p style={{ color: '#c00' }}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
        {[
          ['App users (total)', data.totalAppUsers],
          ['App users (active)', data.activeAppUsers],
          ['Filters (total)', data.totalFilters],
          ['Filters (active)', data.activeFilters],
          ['Expiring ≤ 24h', data.expiringWithin24Hours],
          ['Expired (active flag)', data.expired],
        ].map(([label, val]) => (
          <div key={label} style={{ background: '#fff', padding: 16, borderRadius: 10, border: '1px solid #e0e0e0' }}>
            <div style={{ fontSize: 13, color: '#666' }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{val}</div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 32 }}>Filter expiry (next 7 days + expired)</h2>
      <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 10, border: '1px solid #e0e0e0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f0f4ff' }}>
              <th style={{ padding: 10 }}>User</th>
              <th style={{ padding: 10 }}>Filter</th>
              <th style={{ padding: 10 }}>Expires (UTC)</th>
              <th style={{ padding: 10 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(data.upcomingAndExpiredFilters || []).map((row) => (
              <tr key={row.filterId} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: 10 }}>
                  {row.userName}
                  <div style={{ fontSize: 12, color: '#666' }}>{row.userEmail}</div>
                </td>
                <td style={{ padding: 10 }}>{row.filterName}</td>
                <td style={{ padding: 10 }}>{new Date(row.expireDateUtc).toLocaleString()}</td>
                <td style={{ padding: 10 }}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
