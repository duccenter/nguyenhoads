import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Wallet, ShoppingCart, UserCheck, Package, Users, BarChart3, LogOut, Menu, X } from 'lucide-react';

interface User {
  username: string;
  role: string;
  fullName: string;
}

interface MainLayoutProps {
  user: User;
  onLogout: () => void;
}

export default function MainLayout({ user, onLogout }: MainLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const allNavItems = [
    { id: 'dashboard', path: '/', label: 'Tổng Quan', icon: BarChart3, roles: ['admin'] },
    { id: 'thuchi', path: '/thuchi', label: 'Sổ Thu Chi', icon: Wallet, roles: ['admin', 'staff', 'nhanvien', 'nhân viên'] },
    { id: 'banhang', path: '/banhang', label: 'Bán Hàng', icon: ShoppingCart, roles: ['admin', 'staff', 'nhanvien', 'nhân viên'] },
    { id: 'nhapkho', path: '/nhapkho', label: 'Kho', icon: Package, roles: ['admin', 'staff', 'nhanvien', 'nhân viên'] },
    { id: 'congno', path: '/congno', label: 'Công Nợ', icon: UserCheck, roles: ['admin', 'staff', 'nhanvien', 'nhân viên'] },
    { id: 'khachhang', path: '/khachhang', label: 'Khách Hàng', icon: Users, roles: ['admin', 'staff', 'nhanvien', 'nhân viên'] },
  ] as const;

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

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 text-white shadow-md z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <LayoutDashboard size={24} className="text-sky-400" />
              <h1 className="text-xl font-bold tracking-tight">QC Nguyễn Hồ</h1>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden lg:flex items-center space-x-1 ml-6 flex-1 justify-center">
              {allowedNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink 
                    key={item.id}
                    to={item.path}
                    className={({ isActive }) => `
                      flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white border-b-2 border-transparent'
                      }
                    `}
                  >
                    <Icon size={18} /> {item.label}
                  </NavLink>
                )
              })}
            </nav>

            {/* User Profile & Logout (Desktop) */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-bold text-white">{user.fullName || user.username}</div>
                <div className="text-xs text-sky-400 font-medium">{user.role === 'admin' ? 'Quản lý' : 'Nhân viên'}</div>
              </div>
              <button 
                onClick={() => { onLogout(); navigate('/login'); }}
                className="p-2 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-md transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={20} />
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {allowedNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink 
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium
                      ${isActive 
                        ? 'bg-slate-800 text-sky-400' 
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                      }
                    `}
                  >
                    <Icon size={20} /> {item.label}
                  </NavLink>
                )
              })}
            </div>
            <div className="pt-4 pb-3 border-t border-slate-800">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sky-400">
                    {(user.fullName || user.username).charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">{user.fullName || user.username}</div>
                  <div className="text-sm font-medium leading-none text-slate-400 mt-1">{user.role === 'admin' ? 'Quản lý' : 'Nhân viên'}</div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <button 
                  onClick={() => { onLogout(); navigate('/login'); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-700"
                >
                  <LogOut size={20} /> Đăng xuất
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative p-4 md:p-6 lg:p-8">
         <Outlet />
      </main>
    </div>
  );
}
