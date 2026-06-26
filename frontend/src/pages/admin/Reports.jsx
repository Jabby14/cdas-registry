import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function Reports() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/reports/attendance-summary')
      .then(res => setAttendance(res.data.summary))
      .catch(() => setError('Failed to load attendance report.'))
      .finally(() => setLoading(false));
  }, []);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await api.get('/reports/members/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'members.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Export failed.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Attendance and member data</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {exporting ? 'Exporting…' : '⬇ Export Members CSV'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700 text-sm">Event Attendance</h2>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Event</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Attended</th>
              <th className="px-5 py-3">Rate</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">Loading…</td></tr>
            ) : attendance.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-400">No events yet.</td></tr>
            ) : attendance.map(ev => (
              <tr key={ev.eventId} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{ev.title}</td>
                <td className="px-5 py-3 text-slate-500">
                  {new Date(ev.eventDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </td>
                <td className="px-5 py-3">{ev.attendedCount}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${ev.attendanceRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600">{ev.attendanceRate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}