import { useEffect, useState } from 'react';
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
