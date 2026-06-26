import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/members', label: 'Members' },
  { to: '/dues', label: 'Dues' },
  { to: '/events', label: 'Events' },
  { to: '/reports', label: 'Reports' },
];

const MEMBER_LINKS = [
  { to: '/', label: 'My Profile', end: true },
  { to: '/my-dues', label: 'My Dues' },
  { to: '/my-events', label: 'Events' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isStaff = user?.role === 'ADMIN' || user?.role === 'EXECUTIVE';
  const links = isStaff ? ADMIN_LINKS : MEMBER_LINKS;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-56 bg-slate-900 flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-slate-700">
          <p className="text-white font-bold text-base">CDAS Registry</p>
          <p className="text-slate-400 text-xs mt-0.5">Member System</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {links.map(link => (
            <NavLink key={link.to} to={link.to} end={link.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-slate-700">
          <p className="text-slate-300 text-xs truncate">{user?.email}</p>
          <p className="text-blue-400 text-xs uppercase tracking-wide mt-0.5">{user?.role}</p>
          <button onClick={handleLogout}
            className="mt-2 text-xs text-slate-500 hover:text-slate-300 underline">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}