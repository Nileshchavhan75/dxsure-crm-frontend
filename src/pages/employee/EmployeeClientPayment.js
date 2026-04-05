import React, { useState, useEffect } from 'react';
import EmployeeLayout from '../../components/Layout/EmployeeLayout';
import { clientAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiDollarSign, FiCheckCircle, FiClock } from 'react-icons/fi';

const EmployeeClientPayment = () => {
  const [clients, setClients] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'CASH',
    invoiceNumber: '',
    status: 'PAID'
  });

  useEffect(() => {
    fetchClients();
    fetchPayments();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await clientAPI.getAll();
      const data = response.data?.data || response.data || [];
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/client-payments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Payments fetched:', data);
        setPayments(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch payments:', response.status);
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/client-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          client: { id: parseInt(formData.clientId) },
          amount: parseFloat(formData.amount),
          paymentDate: formData.paymentDate,
          paymentMethod: formData.paymentMethod,
          invoiceNumber: formData.invoiceNumber,
          status: 'PAID'
        })
      });

      if (response.ok) {
        toast.success('Payment recorded successfully');
        setShowModal(false);
        setFormData({
          clientId: '',
          amount: '',
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'CASH',
          invoiceNumber: '',
          status: 'PAID'
        });
        fetchPayments();
      } else {
        toast.error('Failed to record payment');
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      toast.error('Failed to record payment');
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.clientName || client.name : 'Unknown';
  };

  const filteredPayments = payments.filter(payment => {
    const clientName = getClientName(payment.client?.id);
    return clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

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
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Client Payments</h1>
            <p className="text-gray-500 text-sm mt-1">Record and track payments from clients</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FiPlus size={18} />
            Record Payment
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Payments Received</p>
                <p className="text-2xl font-bold text-green-600">₹{totalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FiDollarSign className="text-green-600" size={20} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Transactions</p>
                <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FiCheckCircle className="text-blue-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by client name or invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice #</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-2">💰</div>
                    <p>No payment records found</p>
                    <button
                      onClick={() => setShowModal(true)}
                      className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      + Record your first payment
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-600">{payment.paymentDate}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{getClientName(payment.client?.id)}</td>
                    <td className="px-6 py-4 text-gray-600">{payment.invoiceNumber || '-'}</td>
                    <td className="px-6 py-4 font-semibold text-green-600">₹{payment.amount?.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs bg-gray-100 rounded-full">
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                        <FiCheckCircle size={12} />
                        PAID
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Record Client Payment</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                  >
                    <option value="">Select Client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.clientName || client.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleInputChange}
                    placeholder="INV-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </EmployeeLayout>
  );
};

export default EmployeeClientPayment;