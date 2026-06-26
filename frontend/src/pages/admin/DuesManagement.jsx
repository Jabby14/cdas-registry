import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function DuesManagement() {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(false);

  function loadPeriods() {
    api.get('/dues/periods').then(res => {
      setPeriods(res.data.periods);
      if (res.data.periods[0]) setSelectedPeriod(res.data.periods[0].id);
    });
  }

  useEffect(() => { loadPeriods(); }, []);

  useEffect(() => {
    if (!selectedPeriod) return;
    setLoading(true);
    api.get('/dues', { params: { duesPeriodId: selectedPeriod } })
      .then(res => setDues(res.data.dues))
      .finally(() => setLoading(false));
  }, [selectedPeriod]);

  async function handleMarkPaid(id) {
    const amount = prompt('Amount paid:');
    if (!amount) return;
    await api.patch('/dues/' + id + '/pay', { amountPaid: Number(amount) });
    const res = await api.get('/dues', { params: { duesPeriodId: selectedPeriod } });
    setDues(res.data.dues);
  }

  const colors = { PAID: 'bg-green-100 text-green-700', PENDING: 'bg-amber-100 text-amber-700', OVERDUE: 'bg-red-100 text-red-600' };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Dues</h1>
      {periods.length > 0 && (
        <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}
          className="border border-slate-200 rounded px-3 py-1.5 text-sm">
          {periods.map(p => <option key={p.id} value={p.id}>{p.label} ï¿½ N{Number(p.amount).toLocaleString()}</option>)}
        </select>
      )}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Amount Paid</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">Loading...</td></tr>
            : dues.map(d => (
              <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3"><p className="font-medium">{d.member.fullName}</p><p className="text-xs text-blue-600">{d.member.membershipNo}</p></td>
                <td className="px-4 py-3">N{Number(d.amountPaid).toLocaleString()}</td>
                <td className="px-4 py-3"><span className={"px-2 py-0.5 rounded text-xs font-medium " + (colors[d.status] || 'bg-slate-100 text-slate-500')}>{d.status}</span></td>
                <td className="px-4 py-3 text-right">{d.status !== 'PAID' && <button onClick={() => handleMarkPaid(d.id)} className="text-blue-600 text-sm hover:underline">Mark Paid</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
