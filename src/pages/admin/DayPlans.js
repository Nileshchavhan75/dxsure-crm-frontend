import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import { dayPlanAPI, userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiClock, FiXCircle, FiSearch, FiEye, FiCalendar } from 'react-icons/fi';

const DayPlans = () => {
  const [dayPlans, setDayPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchDayPlans();
    fetchUsers();
  }, []);

  const fetchDayPlans = async () => {
    try {
      const response = await dayPlanAPI.getAll();
      const data = response.data?.data || response.data || [];
      setDayPlans(data);
    } catch (error) {
      console.error('Error fetching day plans:', error);
      toast.error('Failed to load day plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      const data = response.data?.data || response.data || [];
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      // Use PATCH endpoint for status only
      const response = await fetch(`http://localhost:8080/api/dayplans/${id}/status?status=${newStatus}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        toast.success(`Day plan ${newStatus.toLowerCase()} successfully`);
        fetchDayPlans();
      } else {
        const error = await response.text();
        toast.error(error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'PENDING': return <FiClock size={14} />;
      case 'APPROVED': return <FiCheckCircle size={14} />;
      case 'REJECTED': return <FiXCircle size={14} />;
      default: return <FiCalendar size={14} />;
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.fullName : 'Unknown';
  };

  const filteredDayPlans = dayPlans.filter(plan => {
    const matchesSearch = plan.planTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = dayPlans.filter(p => p.status === 'PENDING').length;
  const approvedCount = dayPlans.filter(p => p.status === 'APPROVED').length;
  const completedCount = dayPlans.filter(p => p.status === 'COMPLETED').length;

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
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Day Plans</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage employee daily work plans</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Plans</p>
                <p className="text-2xl font-bold text-gray-800">{dayPlans.length}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                <FiCalendar className="text-gray-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FiClock className="text-yellow-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiCheckCircle className="text-green-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{completedCount}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiCheckCircle className="text-blue-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search plans by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Day Plans Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Plan Title</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Tasks</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredDayPlans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-sm">No day plans found</p>
                  </td>
                </tr>
              ) : (
                filteredDayPlans.map(plan => (
                  <tr key={plan.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{plan.planTitle}</div>
                      {plan.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{plan.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{getUserName(plan.user?.id)}</td>
                    <td className="px-6 py-4 text-gray-600">{plan.planDate || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-full">
                        {plan.tasks?.length || 0} tasks
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(plan.status)}`}>
                        {getStatusIcon(plan.status)}
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPlan(plan);
                            setShowViewModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="View Details"
                        >
                          <FiEye size={16} />
                        </button>
                        {plan.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(plan.id, 'APPROVED')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Approve"
                            >
                              <FiCheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(plan.id, 'REJECTED')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Reject"
                            >
                              <FiXCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Day Plan Modal */}
      {showViewModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowViewModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Day Plan Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Plan Title</label>
                <p className="text-gray-900 font-medium mt-1">{selectedPlan.planTitle}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Employee</label>
                <p className="text-gray-900 mt-1">{getUserName(selectedPlan.user?.id)}</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
                <p className="text-gray-900 mt-1">{selectedPlan.planDate || '-'}</p>
              </div>

              {selectedPlan.description && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                  <p className="text-gray-700 mt-1">{selectedPlan.description}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Tasks</label>
                <div className="mt-2 space-y-2">
                  {selectedPlan.tasks?.length > 0 ? (
                    selectedPlan.tasks.map((task, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg">
                        <input type="checkbox" checked={task.completed} readOnly className="mt-1" />
                        <div>
                          <p className="font-medium text-gray-800">{task.taskTitle}</p>
                          {task.taskDescription && (
                            <p className="text-sm text-gray-500">{task.taskDescription}</p>
                          )}
                          {task.taskTime && (
                            <p className="text-xs text-gray-400 mt-1">🕐 {task.taskTime}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No tasks added</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPlan.status)}`}>
                    {getStatusIcon(selectedPlan.status)}
                    {selectedPlan.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default DayPlans;