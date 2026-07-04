import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ThuChi from './components/ThuChi';
import BanHang from './components/BanHang';
import KhoHang from './components/KhoHang';
import CongNo from './components/CongNo';
import KhachHang from './components/KhachHang';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './components/layout/MainLayout';

interface User {
  username: string;
  role: string;
  fullName: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('erp_user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
      } catch (e) {}
    }
    setIsInitializing(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('erp_user');
    setUser(null);
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  if (isInitializing) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50">Đang tải...</div>;
  }

  // Define default route based on role
  const getDefaultRoute = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/';
    const uname = user.username?.toLowerCase();
    if (uname === 'nv_03' || uname === 'thuchi') return '/thuchi';
    return '/banhang';
  };

  const hasAccess = (roles: string[]) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    
    const uname = user.username?.toLowerCase();
    if ((uname === 'nv_02' || uname === 'kho') && roles.includes('kho')) return true;
    if ((uname === 'nv_03' || uname === 'thuchi') && roles.includes('thuchi')) return true;
    
    return roles.some(r => user.role?.toLowerCase().includes(r));
  };
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to={getDefaultRoute()} replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
          />
          
          <Route path="/" element={user ? <MainLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}>
            <Route index element={
              hasAccess(['admin', 'quản lý']) ? <Dashboard /> : <Navigate to={getDefaultRoute()} replace />
            } />
            <Route path="thuchi" element={
              hasAccess(['admin', 'staff', 'nhanvien', 'nhân viên', 'thuchi']) ? <ThuChi /> : <Navigate to={getDefaultRoute()} replace />
            } />
            <Route path="banhang" element={
              hasAccess(['admin', 'staff', 'nhanvien', 'nhân viên', 'kho']) ? <BanHang /> : <Navigate to={getDefaultRoute()} replace />
            } />
            <Route path="nhapkho" element={
              hasAccess(['admin', 'staff', 'nhanvien', 'nhân viên', 'kho']) ? <KhoHang /> : <Navigate to={getDefaultRoute()} replace />
            } />
            <Route path="congno" element={
              hasAccess(['admin', 'staff', 'nhanvien', 'nhân viên', 'thuchi']) ? <CongNo /> : <Navigate to={getDefaultRoute()} replace />
            } />
            <Route path="khachhang" element={
              hasAccess(['admin', 'staff', 'nhanvien', 'nhân viên', 'thuchi', 'kho']) ? <KhachHang /> : <Navigate to={getDefaultRoute()} replace />
            } />
            <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}
