import React, { useState, useEffect } from 'react';
import EmployeeLayout from '../../components/Layout/EmployeeLayout';
import { vendorAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

const EmployeeVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    serviceType: '',
    address: ''
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await vendorAPI.getAll();
      const data = response.data?.data || response.data || [];
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
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
      if (editingVendor) {
        await vendorAPI.update(editingVendor.id, formData);
        toast.success('Vendor updated successfully');
      } else {
        await vendorAPI.create(formData);
        toast.success('Vendor registered successfully');
      }
      setShowModal(false);
      setEditingVendor(null);
      setFormData({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        serviceType: '',
        address: ''
      });
      fetchVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error('Failed to save vendor');
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name || '',
      contactPerson: vendor.contactPerson || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      serviceType: vendor.serviceType || '',
      address: vendor.address || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete vendor "${name}"?`)) {
      try {
        await vendorAPI.delete(id);
        toast.success('Vendor deleted successfully');
        fetchVendors();
      } catch (error) {
        console.error('Error deleting vendor:', error);
        toast.error('Failed to delete vendor');
      }
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.phone?.includes(searchTerm)
  );

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
            <h1 className="text-2xl font-bold text-gray-800">Vendor Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your suppliers and vendors</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FiPlus size={18} />
            Register Vendor
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, contact person, service type or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>

        {/* Vendors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <div className="text-4xl mb-2">🚚</div>
              <p>No vendors found</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-3 text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                + Register your first vendor
              </button>
            </div>
          ) : (
            filteredVendors.map(vendor => (
              <div key={vendor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{vendor.name}</h3>
                      {vendor.serviceType && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                          {vendor.serviceType}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(vendor)}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                        title="Edit"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(vendor.id, vendor.name)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {vendor.contactPerson && (
                    <p className="text-gray-600 text-sm mt-2">👤 {vendor.contactPerson}</p>
                  )}
                  
                  <div className="mt-2 space-y-1">
                    {vendor.phone && (
                      <p className="text-gray-500 text-sm flex items-center gap-2">
                        <FiPhone size={12} /> {vendor.phone}
                      </p>
                    )}
                    {vendor.email && (
                      <p className="text-gray-500 text-sm flex items-center gap-2">
                        <FiMail size={12} /> {vendor.email}
                      </p>
                    )}
                    {vendor.address && (
                      <p className="text-gray-500 text-sm flex items-start gap-2">
                        <FiMapPin size={12} className="mt-0.5" /> {vendor.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Vendor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingVendor ? 'Edit Vendor' : 'Register New Vendor'}
              </h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter vendor/supplier name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Name of contact person"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="vendor@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <input
                    type="text"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    placeholder="e.g., Software, Hardware, Consulting"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Vendor address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
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
                  {editingVendor ? 'Update Vendor' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </EmployeeLayout>
  );
};

export default EmployeeVendors;