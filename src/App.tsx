import { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, ShoppingCart, UserCheck, Package, Users, BarChart3, LogOut, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ThuChi from './components/ThuChi';
import BanHang from './components/BanHang';
import KhoHang from './components/KhoHang';
import CongNo from './components/CongNo';
import KhachHang from './components/KhachHang';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';

type TabType = 'dashboard' | 'thuchi' | 'banhang' | 'nhapkho' | 'congno' | 'khachhang';

interface User {
  username: string;
  role: string;
  fullName: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (user?.role === 'admin') return 'dashboard';
    const uname = user?.username?.toLowerCase();
    if (uname === 'nv_03' || uname === 'thuchi') return 'thuchi';
    return 'banhang';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('erp_user');
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
        const uname = parsed.username?.toLowerCase();
        if (parsed.role === 'admin') {
          setActiveTab('dashboard');
        } else if (uname === 'nv_03' || uname === 'thuchi') {
          setActiveTab('thuchi');
        } else {
          setActiveTab('banhang');
        }
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('erp_user');
    setUser(null);
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    const uname = loggedInUser.username?.toLowerCase();
    if (loggedInUser.role === 'admin') {
      setActiveTab('dashboard');
    } else if (uname === 'nv_02' || uname === 'kho') {
      setActiveTab('banhang');
    } else if (uname === 'nv_03' || uname === 'thuchi') {
      setActiveTab('thuchi');
    } else {
      setActiveTab('banhang');
    }
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const allNavItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: BarChart3, roles: ['admin'] },
    { id: 'thuchi', label: 'Sổ Thu Chi', icon: Wallet, roles: ['admin', 'staff', 'nhanvien', 'nhân viên'] },
    { id: 'banhang', label: 'Bán Hàng', icon: ShoppingCart, roles: ['admin', 'staff', 'nhanvien', 'nhân viên'] },
    { id: 'nhapkho', label: 'Kho & Nhập Hàng', icon: Package, roles: ['admin', 'staff', 'nhanvien', 'nhân viên'] },
    { id: 'congno', label: 'Công Nợ', icon: UserCheck, roles: ['admin', 'staff', 'nhanvien', 'nhân viên'] },
    { id: 'khachhang', label: 'Khách Hàng (CRM)', icon: Users, roles: ['admin', 'staff', 'nhanvien', 'nhân viên'] },
  ] as const;

  // Lọc menu theo phân quyền
  const allowedNavItems = allNavItems.filter(item => {
    if (user.role === 'admin') return true;
    
    const uname = user.username?.toLowerCase();
    if (uname === 'nv_02' || uname === 'kho') {
      return ['banhang', 'nhapkho'].includes(item.id);
    }
    if (uname === 'nv_03' || uname === 'thuchi') {
      return ['thuchi', 'congno'].includes(item.id);
    }
    
    return item.roles.some(r => user.role?.toLowerCase().includes(r));
  });

  const handleTabClick = (id: TabType) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <div className="mobile-header no-print">
        <h1 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LayoutDashboard size={20} /> QC Nguyễn Hồ
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="mobile-menu-btn">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`sidebar no-print ${isMobileMenuOpen ? 'open' : ''}`}>
        <div style={{ padding: '0 20px', marginBottom: '30px' }} className="desktop-logo">
          <h1 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <LayoutDashboard size={24} /> QC Nguyễn Hồ
          </h1>
        </div>

        <div style={{ padding: '0 20px', marginBottom: '20px', fontSize: '0.9rem', color: '#94a3b8' }}>
          <div>Xin chào,</div>
          <div style={{ fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>{user.fullName || user.username}</div>
          <div style={{ fontSize: '0.8rem', marginTop: '4px', display: 'inline-block', backgroundColor: user.role === 'admin' ? '#ef4444' : '#3b82f6', padding: '2px 8px', borderRadius: '12px', color: 'white' }}>
            {user.role === 'admin' ? 'Quản lý' : 'Nhân viên'}
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 }}>
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => handleTabClick(item.id as TabType)}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px',
                  backgroundColor: isActive ? '#334155' : 'transparent',
                  color: isActive ? '#38bdf8' : '#cbd5e1',
                  border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer',
                  borderLeft: isActive ? '4px solid #38bdf8' : '4px solid transparent',
                  transition: 'all 0.2s', fontSize: '16px', fontWeight: 600
                }}
              >
                <Icon size={20} /> {item.label}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '20px' }}>
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px',
              backgroundColor: 'transparent', border: '1px solid #475569', color: '#cbd5e1',
              borderRadius: '6px', cursor: 'pointer', justifyContent: 'center'
            }}
          >
            <LogOut size={18} /> Đăng xuất
          </button>
        </div>
      </div>

      {isMobileMenuOpen && <div className="overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <div className="main-content">
        <ErrorBoundary key={activeTab}>
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'thuchi' && <ThuChi />}
          {activeTab === 'banhang' && <BanHang />}
          {activeTab === 'nhapkho' && <KhoHang />}
          {activeTab === 'congno' && <CongNo />}
          {activeTab === 'khachhang' && <KhachHang />}
        </ErrorBoundary>
      </div>
    </div>
  );
}
