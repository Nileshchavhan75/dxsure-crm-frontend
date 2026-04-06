import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import { pettyCashAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiSearch, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

const AdminPettyCash = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await pettyCashAPI.getAll();
      const data = response.data?.data || response.data || [];
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await pettyCashAPI.update(id, { status: 'APPROVED' });
      toast.success('Expense approved successfully');
      fetchExpenses();
    } catch (error) {
      console.error('Error approving expense:', error);
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await pettyCashAPI.update(id, { status: 'REJECTED' });
      toast.success('Expense rejected');
      fetchExpenses();
    } catch (error) {
      console.error('Error rejecting expense:', error);
      toast.error('Failed to reject');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || expense.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = expenses.filter(e => e.status === 'PENDING').length;
  const totalApproved = expenses.filter(e => e.status === 'APPROVED').reduce((sum, e) => sum + (e.amount || 0), 0);

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
          <h1 className="text-2xl font-bold text-gray-800">Petty Cash Management</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage employee expense requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Approvals</p>
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
                <p className="text-gray-500 text-sm">Total Approved Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{totalApproved.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiCheckCircle className="text-green-600" size={20} />
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
              placeholder="Search by description..."
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
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Expenses Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-2">💰</div>
                    <p>No expense requests found</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-600">{expense.expenseDate}</td>
                    <td className="px-6 py-4 text-gray-600">{expense.createdBy?.fullName || 'Unknown'}</td>
                    <td className="px-6 py-4 text-gray-900">{expense.description}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">₹{expense.amount?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(expense.status)}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {expense.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(expense.id)}
                            className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(expense.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
           </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPettyCash;