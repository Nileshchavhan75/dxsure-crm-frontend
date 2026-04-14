import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaUserPlus,
  FaTicketAlt, 
  FaCalendarAlt, 
  FaBook, 
  FaTruck, 
  FaMoneyBillWave,
  FaSignOutAlt,
  FaChartLine
} from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/admin/clients', icon: FaUsers, label: 'Clients' },
    { path: '/admin/users', icon: FaUserPlus, label: 'Users' },
    { path: '/admin/tickets', icon: FaTicketAlt, label: 'Tickets' },
    { path: '/admin/dayplans', icon: FaCalendarAlt, label: 'Day Plans' },
    { path: '/admin/daybook', icon: FaBook, label: 'Day Book' },
    { path: '/admin/vendors', icon: FaTruck, label: 'Vendors' },
    { path: '/admin/payments', icon: FaMoneyBillWave, label: 'Salary Payments' },
    { path: '/admin/track', icon: FaChartLine, label: 'Activity Log' },
    { path: '/admin/pettycash', icon: FaMoneyBillWave, label: 'Petty Cash' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary-600">DXSure CRM</h1>
          <p className="text-sm text-gray-500 mt-1">Admin Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition group"
            >
              <item.icon className="text-lg" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {user?.fullName?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-800">{user?.fullName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 w-full px-3 py-2 rounded-lg hover:bg-red-50 transition"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;