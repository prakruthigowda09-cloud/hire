import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Database, FileUp, FileDown, LogOut, Menu, X, Home, PlusCircle, Table } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  const publicNav = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Records', path: '/records', icon: Table },
    { name: 'Add New', path: '/add', icon: PlusCircle },
  ];

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Records', path: '/admin/records', icon: Database },
    { name: 'Import Data', path: '/admin/import', icon: FileUp },
    { name: 'Export Data', path: '/admin/export', icon: FileDown },
  ];

  const navItems = isAdminRoute ? adminNav : publicNav;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-stone-100 rounded-lg lg:hidden"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="bg-emerald-600 text-white p-1 rounded">HD</span>
            <span>Hire Drive</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <Link 
              to="/admin/login" 
              className="text-sm font-medium text-stone-600 hover:text-emerald-600 transition-colors"
            >
              Admin Login
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-sm text-stone-500 hidden sm:inline">Admin Mode</span>
              <button 
                onClick={() => { logout(); navigate('/'); }}
                className="p-2 text-stone-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-stone-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  location.pathname === item.path 
                    ? "bg-emerald-50 text-emerald-700 shadow-sm" 
                    : "text-stone-600 hover:bg-stone-100"
                )}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
