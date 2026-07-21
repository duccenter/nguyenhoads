import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, ShoppingCart, UserCheck, Package, Users, BarChart3, LogOut, Shield } from 'lucide-react';
import DebtNotification from '../DebtNotification';

interface User {
  username: string;
  role: string;
  fullName: string;
  permissions?: string[];
}

interface MainLayoutProps {
  user: User;
  onLogout: () => void;
}

export default function MainLayout({ user, onLogout }: MainLayoutProps) {
  const navigate = useNavigate();

  const allNavItems = [
    { id: 'dashboard', path: '/', label: 'Tổng Quan', icon: BarChart3, roles: ['admin'] },
    { id: 'thuchi', path: '/thuchi', label: 'Sổ Thu Chi', icon: Wallet, roles: ['admin', 'staff', 'nhanvien', 'nhân viên'] },
    { id: 'banhang', path: '/banhang', label: 'Bán Hàng', icon: ShoppingCart, roles: ['admin', 'staff', 'nhanvien', 'nhân viên'] },
    { id: 'nhapkho', path: '/nhapkho', label: 'Kho', icon: Package, roles: ['admin', 'staff', 'nhanvien', 'nhân viên'] },
    { id: 'congno', path: '/congno', label: 'Công Nợ', icon: UserCheck, roles: ['admin', 'staff', 'nhanvien', 'nhân viên'] },
    { id: 'khachhang', path: '/khachhang', label: 'Khách Hàng', icon: Users, roles: ['admin', 'staff', 'nhanvien', 'nhân viên'] },
    { id: 'taikhoan', path: '/taikhoan', label: 'Quản Lý TK', icon: Shield, roles: ['admin'] },
  ] as const;

  const allowedNavItems = allNavItems.filter(item => {
    if (user.role === 'admin') return true;
    if (item.id === 'taikhoan' || item.id === 'dashboard') return false;
    
    if (user.permissions && user.permissions.includes(item.id)) return true;
    
    // Legacy support
    const uname = user.username?.toLowerCase();
    if ((uname === 'nv_02' || uname === 'kho') && ['banhang', 'nhapkho', 'khachhang'].includes(item.id)) return true;
    if ((uname === 'nv_03' || uname === 'thuchi') && ['thuchi', 'congno', 'khachhang'].includes(item.id)) return true;
    
    return false;
  });

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Universal Top Navigation */}
      <header className="bg-slate-900 text-white shadow-md z-40 no-print">
        
        {/* Top Header Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-slate-800">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <LayoutDashboard size={22} className="text-sky-400" />
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">QC Nguyễn Hồ</h1>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-white">{user.fullName || user.username}</div>
                <div className="text-xs text-sky-400 font-medium">{user.role === 'admin' ? 'Quản lý' : 'Nhân viên'}</div>
              </div>
              
              {/* Mobile avatar info (Optional visual only) */}
              <div className="sm:hidden h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sky-400 text-sm">
                {(user.fullName || user.username).charAt(0).toUpperCase()}
              </div>

              <button 
                onClick={() => { onLogout(); navigate('/login'); }}
                className="p-2 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Universal Tab Bar (Scrollable on Mobile, Centered on Desktop) */}
        <div className="bg-slate-900">
          <nav className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar gap-2 py-2 items-center sm:justify-center">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink 
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-1.5 px-3.5 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all duration-200 select-none
                    ${isActive 
                      ? 'bg-sky-500 text-white shadow-md' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon size={16} /> {item.label}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative p-3 sm:p-4 md:p-6 lg:p-8">
         <Outlet />
      </main>
      <DebtNotification />
    </div>
  );
}
