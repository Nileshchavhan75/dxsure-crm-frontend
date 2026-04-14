import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import { clientAPI, ticketAPI, dayPlanAPI, financeAPI } from '../../services/api';
import { FaUsers, FaTicketAlt, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({
    clients: 0,
    tickets: 0,
    dayPlans: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [clients, tickets, dayPlans, finance] = await Promise.all([
        clientAPI.getAll(),
        ticketAPI.getAll(),
        dayPlanAPI.getAll(),
        financeAPI.getAll()
      ]);
      
      setStats({
        clients: clients.data?.data?.length || clients.data?.length || 0,
        tickets: tickets.data?.data?.length || tickets.data?.length || 0,
        dayPlans: dayPlans.data?.data?.length || dayPlans.data?.length || 0,
        revenue: 125000
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Clients', value: stats.clients, icon: FaUsers, color: 'bg-blue-500' },
    { title: 'Open Tickets', value: stats.tickets, icon: FaTicketAlt, color: 'bg-yellow-500' },
    { title: 'Day Plans', value: stats.dayPlans, icon: FaCalendarAlt, color: 'bg-green-500' },
    { title: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: FaDollarSign, color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="card flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
            </div>
            <div className={`${card.color} p-3 rounded-full text-white`}>
              <card.icon className="text-xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>New client added</span>
              <span className="ml-auto text-gray-400">2 min ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Ticket #123 resolved</span>
              <span className="ml-auto text-gray-400">15 min ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Day plan submitted by John</span>
              <span className="ml-auto text-gray-400">1 hour ago</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-primary text-sm py-2">Add New Client</button>
            <button className="btn-secondary text-sm py-2">Raise Ticket</button>
            <button className="btn-secondary text-sm py-2">Create User</button>
            <button className="btn-secondary text-sm py-2">Add Expense</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;