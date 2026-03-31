import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Megaphone, 
  BarChart3, 
  LogOut 
} from 'lucide-react';
import toast from 'react-hot-toast';

const Layout = () => {
  const navigate = useNavigate();
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/ngos', label: 'NGOs', icon: Users },
    { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
    { path: '/reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-sm text-gray-600 mt-1">Welcome, {adminData.name}</p>
        </div>
        
        <nav className="p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
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