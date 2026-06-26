import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  function loadMembers() {
    setLoading(true);
    api.get('/members', { params: { search } })
      .then(res => setMembers(res.data.members))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const t = setTimeout(loadMembers, 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/members', form);
      setShowForm(false);
      setForm({ fullName: '', email: '', phone: '', address: '' });
      loadMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not create member.');
    } finally {
      setSaving(false);
    }
  }

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-slate-100 text-slate-500',
    SUSPENDED: 'bg-red-100 text-red-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Members</h1>
          <p className="text-slate-500 text-sm mt-1">{members.length} record(s)</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
          + Add Member
        </button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search by name, membership no, email or phone…"
        className="w-full max-w-md border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Membership No.</th>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">Loading…</td></tr>
            ) : members.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400">No members found.</td></tr>
            ) : members.map(m => (
              <tr key={m.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-blue-600">{m.membershipNo}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{m.fullName}</td>
                <td className="px-4 py-3 text-slate-500">{m.phone || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[m.status]}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/members/${m.id}`} className="text-blue-600 text-sm hover:underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="font-semibold text-slate-800 mb-4">Add Member</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required placeholder="Full name" value={form.fullName}
                onChange={e => setForm(f => ({...f, fullName: e.target.value}))}
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              <input type="email" placeholder="Email" value={form.email}
                onChange={e => setForm(f => ({...f, email: e.target.value}))}
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              <input placeholder="Phone" value={form.phone}
                onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              <input placeholder="Address" value={form.address}
                onChange={e => setForm(f => ({...f, address: e.target.value}))}
                className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm border border-slate-200 rounded hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving…' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}