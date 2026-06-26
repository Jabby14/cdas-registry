import { useState } from 'react';
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
