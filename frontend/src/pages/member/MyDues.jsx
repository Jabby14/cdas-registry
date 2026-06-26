import { useEffect, useState } from 'react';
import api from '../../api/client';

const STATUS_COLORS = {
  PAID: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  OVERDUE: 'bg-red-100 text-red-600',
};

export default function MyDues() {
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dues/me')
      .then(res => setDues(res.data.dues))
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = dues.filter(d => d.status === 'PAID').reduce((sum, d) => sum + Number(d.amountPaid), 0);
  const pending = dues.filter(d => d.status === 'PENDING' || d.status === 'OVERDUE').length;

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">My Dues</h1>
      <div className="grid grid-cols-2 gap-4 max-w-sm">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Total Paid</p>
          <p className="text-xl font-bold text-green-600 mt-1">₦{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Outstanding</p>
          <p className="text-xl font-bold text-amber-500 mt-1">{pending}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Period</th>
              <th className="px-5 py-3">Amount Due</th>
              <th className="px-5 py-3">Amount Paid</th>
              <th className="px-5 py-3">Due Date</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {dues.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No dues records found.</td></tr>
            ) : dues.map(d => (
              <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{d.duesPeriod?.label || '—'}</td>
                <td className="px-5 py-3">₦{Number(d.duesPeriod?.amount || 0).toLocaleString()}</td>
                <td className="px-5 py-3">₦{Number(d.amountPaid).toLocaleString()}</td>
                <td className="px-5 py-3 text-slate-500">
                  {d.duesPeriod?.dueDate ? new Date(d.duesPeriod.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—'}
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[d.status] || 'bg-slate-100 text-slate-500'}`}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}