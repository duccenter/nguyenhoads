import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to={getDefaultRoute()} replace />} 
        />
        
        {user ? (
          <Route path="/" element={<MainLayout user={user} onLogout={handleLogout} />}>
            <Route index element={
              <ErrorBoundary key="dashboard"><Dashboard /></ErrorBoundary>
            } />
            <Route path="thuchi" element={
              <ErrorBoundary key="thuchi"><ThuChi /></ErrorBoundary>
            } />
            <Route path="banhang" element={
              <ErrorBoundary key="banhang"><BanHang /></ErrorBoundary>
            } />
            <Route path="nhapkho" element={
              <ErrorBoundary key="nhapkho"><KhoHang /></ErrorBoundary>
            } />
            <Route path="congno" element={
              <ErrorBoundary key="congno"><CongNo /></ErrorBoundary>
            } />
            <Route path="khachhang" element={
              <ErrorBoundary key="khachhang"><KhachHang /></ErrorBoundary>
            } />
            {/* Catch all route - redirect to default */}
            <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
  );
}
