import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, User, FileText, Megaphone, LogOut, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Layout = () => {
  const navigate = useNavigate();
  const ngoData = JSON.parse(localStorage.getItem('ngoData') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('ngoToken');
    localStorage.removeItem('ngoData');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center space-x-2">
            <Building2 className="text-green-600" size={28} />
            <h1 className="text-xl font-bold text-gray-800">NGO Portal</h1>
          </div>
          <p className="text-sm text-gray-600 mt-2">Welcome, {ngoData.name}</p>
          <p className="text-xs text-gray-400 mt-1 capitalize">Status: {ngoData.status}</p>
        </div>
        
        <nav className="p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition duration-200 ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full mt-8 text-red-600 hover:bg-red-50 transition duration-200"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;