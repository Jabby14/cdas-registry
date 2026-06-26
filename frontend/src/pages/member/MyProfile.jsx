import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function MyProfile() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get('/members/me')
      .then(res => { setMember(res.data.member); setForm(res.data.member); })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true); setError(''); setSuccess('');
    try {
      const res = await api.put(`/members/${member.id}`, { phone: form.phone, address: form.address });
      setMember(res.data.member);
      setEditing(false);
      setSuccess('Profile updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">Loading…</div>;
  if (!member) return <div className="text-red-500">Could not load profile.</div>;

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
      <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-800">{member.fullName}</p>
            <p className="text-sm text-blue-600 font-mono">{member.membershipNo}</p>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
            {member.status}
          </span>
        </div>
        <div className="border-t border-slate-100 pt-4 space-y-3 text-sm">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Email</p>
            <p className="text-slate-700">{member.email}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Phone</p>
            {editing
              ? <input value={form.phone || ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" />
              : <p className="text-slate-700">{member.phone || '—'}</p>}
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Address</p>
            {editing
              ? <input value={form.address || ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" />
              : <p className="text-slate-700">{member.address || '—'}</p>}
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Member Since</p>
            <p className="text-slate-700">{new Date(member.joinDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
        <div className="flex gap-2 pt-2">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setForm(member); }}
                className="px-4 py-2 text-sm border border-slate-200 rounded hover:bg-slate-50">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="px-4 py-2 text-sm border border-slate-200 rounded hover:bg-slate-50">
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}