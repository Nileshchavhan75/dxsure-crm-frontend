import React, { useState, useEffect } from 'react';
import EmployeeLayout from '../../components/Layout/EmployeeLayout';
import { clientAPI, ticketAPI, dayPlanAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaUsers, FaTicketAlt, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    clients: 0,
    tickets: 0,
    dayPlans: 0,
    completedTasks: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentClients, setRecentClients] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [clients, tickets, dayPlans] = await Promise.all([
        clientAPI.getAll(),
        ticketAPI.getAll(),
        dayPlanAPI.getAll()
      ]);
      
      const clientsData = clients.data?.data || clients.data || [];
      const ticketsData = tickets.data?.data || tickets.data || [];
      const dayPlansData = dayPlans.data?.data || dayPlans.data || [];
      
      setStats({
        clients: clientsData.length,
        tickets: ticketsData.filter(t => t.assignedTo?.id === user?.id).length,
        dayPlans: dayPlansData.filter(d => d.user?.id === user?.id).length,
        completedTasks: 0
      });
      
      setRecentClients(clientsData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'My Clients', value: stats.clients, icon: FaUsers, color: 'bg-blue-500' },
    { title: 'My Tickets', value: stats.tickets, icon: FaTicketAlt, color: 'bg-yellow-500' },
    { title: 'My Day Plans', value: stats.dayPlans, icon: FaCalendarAlt, color: 'bg-green-500' },
    { title: 'Tasks Completed', value: stats.completedTasks, icon: FaCheckCircle, color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.fullName}!</h1>
        <p className="text-gray-500 mt-1">Here's your work summary for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Clients</h2>
          {recentClients.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No clients yet</p>
          ) : (
            <div className="space-y-3">
              {recentClients.map(client => (
                <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    client.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {client.status || 'LEAD'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-primary text-sm py-2">Add New Client</button>
            <button className="btn-secondary text-sm py-2">Raise Ticket</button>
            <button className="btn-secondary text-sm py-2">Create Day Plan</button>
            <button className="btn-secondary text-sm py-2">Add Vendor</button>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default EmployeeDashboard;