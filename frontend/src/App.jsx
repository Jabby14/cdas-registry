import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/admin/Dashboard';
import MembersList from './pages/admin/MembersList';
import DuesManagement from './pages/admin/DuesManagement';
import EventsManagement from './pages/admin/EventsManagement';
import Reports from './pages/admin/Reports';
import MyProfile from './pages/member/MyProfile';
import MyDues from './pages/member/MyDues';
import MyEvents from './pages/member/MyEvents';
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="members" element={<MembersList />} />
            <Route path="dues" element={<DuesManagement />} />
            <Route path="events" element={<EventsManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="my-profile" element={<MyProfile />} />
<Route path="my-dues" element={<MyDues />} />
<Route path="my-events" element={<MyEvents />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;