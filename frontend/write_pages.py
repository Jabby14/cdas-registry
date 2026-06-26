import os

os.makedirs('src/pages/admin', exist_ok=True)

os.makedirs('src/pages/auth', exist_ok=True) 

# DuesManagement
open('src/pages/admin/DuesManagement.jsx', 'w').write("""import { useEffect, useState } from 'react';
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
          {periods.map(p => <option key={p.id} value={p.id}>{p.label} — N{Number(p.amount).toLocaleString()}</option>)}
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
""")

# EventsManagement
open('src/pages/admin/EventsManagement.jsx', 'w').write("""import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function EventsManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', location: '', eventDate: '' });

  function loadEvents() {
    setLoading(true);
    api.get('/events').then(res => setEvents(res.data.events)).finally(() => setLoading(false));
  }

  useEffect(() => { loadEvents(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/events', form);
      setShowForm(false);
      setForm({ title: '', description: '', location: '', eventDate: '' });
      loadEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not create event.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Events</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">+ New Event</button>
      </div>
      {loading ? <p className="text-slate-400">Loading...</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map(ev => (
            <div key={ev.id} className="bg-white rounded-lg border border-slate-200 p-5">
              <p className="text-xs text-slate-400">{new Date(ev.eventDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
              <h3 className="font-semibold text-slate-800 mt-1">{ev.title}</h3>
              {ev.location && <p className="text-sm text-slate-500 mt-1">{ev.location}</p>}
              {ev.description && <p className="text-sm text-slate-600 mt-2">{ev.description}</p>}
              <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">{ev._count?.attendance || 0} attended</p>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="font-semibold text-slate-800 mb-4">New Event</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required placeholder="Title" value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} className="w-full border border-slate-200 rounded px-3 py-2 text-sm" />
              <input placeholder="Location" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} className="w-full border border-slate-200 rounded px-3 py-2 text-sm" />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className="w-full border border-slate-200 rounded px-3 py-2 text-sm" rows={3} />
              <input required type="date" value={form.eventDate} onChange={e => setForm(f => ({...f, eventDate: e.target.value}))} className="w-full border border-slate-200 rounded px-3 py-2 text-sm" />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-slate-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
""")

# Register page
open('src/pages/auth/Register.jsx', 'w').write("""import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function update(field) { return e => setForm(f => ({...f, [field]: e.target.value})); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">CDAS Registry</h1>
          <p className="text-slate-400 text-sm mt-1">Create your member account</p>
        </div>
        <div className="bg-white rounded-lg p-8 shadow-xl">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
              <input required value={form.fullName} onChange={update('fullName')} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={update('email')} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                <input value={form.phone} onChange={update('phone')} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /></div>
              <div><label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
                <input type="password" required minLength={6} value={form.password} onChange={update('password')} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /></div>
            </div>
            <div><label className="block text-xs font-medium text-slate-600 mb-1">Address</label>
              <input value={form.address} onChange={update('address')} className="w-full border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /></div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full bg-slate-800 text-white py-2 rounded text-sm font-medium hover:bg-slate-700 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-4">Already registered? <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
""")

print('All pages created successfully!')
import os
for f in ['src/pages/admin/DuesManagement.jsx', 'src/pages/admin/EventsManagement.jsx', 'src/pages/auth/Register.jsx']:
    print(f, ':', os.path.exists(f))