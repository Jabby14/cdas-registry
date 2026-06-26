import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events')
      .then(res => setEvents(res.data.events))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = events.filter(e => new Date(e.eventDate) >= new Date());
  const past = events.filter(e => new Date(e.eventDate) < new Date());

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">Loading…</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Events</h1>
      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Upcoming</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {upcoming.map(ev => (
              <div key={ev.id} className="bg-white rounded-lg border border-blue-100 p-5">
                <p className="text-xs text-blue-500 font-medium">
                  {new Date(ev.eventDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </p>
                <h3 className="font-semibold text-slate-800 mt-1">{ev.title}</h3>
                {ev.location && <p className="text-sm text-slate-500 mt-1">📍 {ev.location}</p>}
                {ev.description && <p className="text-sm text-slate-600 mt-2">{ev.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Past Events</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {past.map(ev => (
              <div key={ev.id} className="bg-white rounded-lg border border-slate-200 p-5 opacity-75">
                <p className="text-xs text-slate-400">
                  {new Date(ev.eventDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </p>
                <h3 className="font-semibold text-slate-700 mt-1">{ev.title}</h3>
                {ev.location && <p className="text-sm text-slate-400 mt-1">📍 {ev.location}</p>}
                <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
                  {ev._count?.attendance || 0} attended
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {events.length === 0 && <p className="text-slate-400 text-sm">No events yet.</p>}
    </div>
  );
}
