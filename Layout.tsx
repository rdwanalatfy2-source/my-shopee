
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Users, LogOut, ShieldCheck, Tag, ClipboardList, Menu, X } from 'lucide-react';
import { getCurrentUser, setCurrentUser } from '../utils/storage';
import { Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const user = getCurrentUser();

  const handleLogout = () => {
    setCurrentUser(null);
    window.location.reload();
  };

  const menuItems = [
    { name: 'لوحة التحكم', path: '/', icon: LayoutDashboard, roles: [Role.ADMIN, Role.EMPLOYEE] },
    { name: 'نقطة البيع', path: '/pos', icon: ShoppingCart, roles: [Role.ADMIN, Role.EMPLOYEE] },
    { name: 'مراجعة الفواتير', path: '/history', icon: ClipboardList, roles: [Role.ADMIN, Role.EMPLOYEE] },
    { name: 'إدارة المنتجات', path: '/products', icon: Package, roles: [Role.ADMIN] },
    { name: 'إدارة الأصناف', path: '/categories', icon: Tag, roles: [Role.ADMIN] },
    { name: 'إدارة الموظفين', path: '/employees', icon: Users, roles: [Role.ADMIN] },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6 text-2xl font-bold border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-blue-500" />
          <span>الماهر</span>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-800 rounded-lg">
          <X size={24} />
        </button>
      </div>
      
      <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
          {user?.username[0].toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">مرحباً بك</p>
          <p className="text-sm font-bold truncate">{user?.username}</p>
        </div>
      </div>

      <nav className="flex-1 mt-4 space-y-1 px-3">
        {menuItems.filter(item => item.roles.includes(user?.role || Role.EMPLOYEE)).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${
                isActive 
                  ? 'bg-blue-600 shadow-lg shadow-blue-900/50 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full p-4 rounded-xl hover:bg-red-500/10 transition-colors font-bold"
        >
          <LogOut size={20} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Tajawal']">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar for Mobile */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-blue-500" size={24} />
            <span className="font-bold tracking-tight">الماهر للنظم</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-slate-800 rounded-xl active:scale-95 transition-transform"
          >
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
