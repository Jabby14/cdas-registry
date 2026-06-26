import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import api from '../../api/client';

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color || 'text-slate-800'}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(res => setStats(res.data))
      .catch(() => setError('Could not load dashboard data.'));
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!stats) return <p className="text-slate-400">Loading dashboard…</p>;

  const chartData = (stats.memberGrowth || []).map(m => ({
    month: m.month, members: Number(m.count)
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Association overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total Members" value={stats.totalMembers} />
        <StatCard label="Active Members" value={stats.activeMembers} color="text-green-600" />
        <StatCard label="Dues Collected" value={`₦${Number(stats.totalDuesCollected).toLocaleString()}`} color="text-blue-600" />
        <StatCard label="Total Events" value={stats.totalEvents} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Pending Dues" value={stats.pendingDuesCount} color="text-amber-600" />
        <StatCard label="Overdue Dues" value={stats.overdueDuesCount || 0} color="text-red-600" />
        <StatCard label="Inactive Members" value={stats.inactiveMembers} color="text-slate-500" />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Membership Growth</h2>
        {chartData.length === 0 ? (
          <p className="text-slate-400 text-sm">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip />
              <Bar dataKey="members" fill="#2563eb" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}