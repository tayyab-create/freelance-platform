import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiUser, FiBriefcase, FiFilter, FiCheckCircle, FiXCircle, FiAlertCircle, FiEye, FiX, FiGlobe, FiMapPin, FiPhone, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { PageHeader, DataTable, StatusBadge, ActionDropdown, SkeletonLoader } from '../../components/shared';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', status: '' });

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers(filters);
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      setLoadingDetails(true);
      setIsModalOpen(true);
      const response = await adminAPI.getUserDetails(userId);
      setSelectedUser(response.data.data); // { user, profile }
    } catch (error) {
      toast.error('Failed to load user details');
      setIsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await adminAPI.toggleUserActive(userId);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
      // Update selected user if open
      if (selectedUser && selectedUser.user._id === userId) {
        setSelectedUser(prev => ({
          ...prev,
          user: { ...prev.user, isActive: !prev.user.isActive }
        }));
      }
    } catch (error) {
      toast.error('Failed to toggle user status');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700"><FiCheckCircle className="h-3 w-3" /> Approved</span>;
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700"><FiAlertCircle className="h-3 w-3" /> Pending</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700"><FiXCircle className="h-3 w-3" /> Rejected</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">{status}</span>;
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    const parts = [address.street, address.city, address.state, address.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Users</h1>
            <p className="text-gray-500 text-sm mt-1">Manage platform users and their access</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="worker">Workers</option>
                <option value="company">Companies</option>
                <option value="admin">Admins</option>
              </select>
            </div>
            <div className="relative">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button onClick={fetchUsers} className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <FiFilter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <SkeletonLoader type="table" count={1} />
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No users found matching your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Access</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${user.role === 'worker' ? 'bg-purple-100 text-purple-600' :
                            user.role === 'company' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {user.role === 'worker' ? 'W' : user.role === 'company' ? 'C' : 'A'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.email}</div>
                            <div className="text-xs text-gray-500">ID: {user._id.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium capitalize ${user.role === 'worker' ? 'bg-purple-50 text-purple-700' :
                          user.role === 'company' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm text-gray-600">{user.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(user._id)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                            title="View Details"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(user._id, user.isActive)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${user.isActive
                              ? 'text-red-600 bg-red-50 hover:bg-red-100'
                              : 'text-green-600 bg-green-50 hover:bg-green-100'
                              }`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Details Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {loadingDetails ? (
                <div className="p-12 flex justify-center">
                  <Spinner size="lg" />
                </div>
              ) : selectedUser ? (
                <div>
                  {/* Modal Header */}
                  <div className={`p-6 border-b border-gray-100 flex items-start justify-between ${selectedUser.user.role === 'worker' ? 'bg-purple-50/50' : 'bg-blue-50/50'
                    }`}>
                    <div className="flex items-center gap-4">
                      {selectedUser.profile?.profilePicture || selectedUser.profile?.logo ? (
                        <img
                          src={selectedUser.profile?.profilePicture || selectedUser.profile?.logo}
                          alt="Profile"
                          className="h-16 w-16 rounded-xl object-cover shadow-sm bg-white"
                        />
                      ) : (
                        <div className={`h-16 w-16 rounded-xl flex items-center justify-center text-2xl font-bold shadow-sm ${selectedUser.user.role === 'worker' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                          {selectedUser.user.role === 'worker' ? 'W' : 'C'}
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {selectedUser.profile?.fullName || selectedUser.profile?.companyName || 'No Name'}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-gray-500">{selectedUser.user.email}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedUser.user.role === 'worker' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {selectedUser.user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={closeModal} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                      <FiX className="h-6 w-6 text-gray-500" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 space-y-6">
                    {/* Common Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(selectedUser.user.status)}
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${selectedUser.user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {selectedUser.user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Joined Date</div>
                        <div className="flex items-center gap-2 font-medium text-gray-700">
                          <FiCalendar className="text-gray-400" />
                          {new Date(selectedUser.user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Role Specific Info */}
                    {selectedUser.user.role === 'worker' && selectedUser.profile && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2">About</h3>
                          <p className="text-gray-600 leading-relaxed">
                            {selectedUser.profile.bio || 'No bio provided.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-bold text-gray-900 mb-2">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedUser.profile.skills?.map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
                                  {skill}
                                </span>
                              )) || <span className="text-gray-400 italic">No skills listed</span>}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 mb-2">Details</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                              <li className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">Hourly Rate:</span>
                                ${selectedUser.profile.hourlyRate || 0}/hr
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">Phone:</span>
                                {selectedUser.profile.phone || 'N/A'}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedUser.user.role === 'company' && selectedUser.profile && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                          <p className="text-gray-600 leading-relaxed">
                            {selectedUser.profile.description || 'No description provided.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-bold text-gray-900 mb-2">Company Details</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                              <li className="flex items-center gap-2">
                                <FiBriefcase className="text-gray-400" />
                                {selectedUser.profile.industry || 'N/A'}
                              </li>
                              <li className="flex items-center gap-2">
                                <FiUser className="text-gray-400" />
                                {selectedUser.profile.companySize || 'N/A'} employees
                              </li>
                              <li className="flex items-center gap-2">
                                <FiMapPin className="text-gray-400" />
                                {formatAddress(selectedUser.profile.address)}
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 mb-2">Contact</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                              <li className="flex items-center gap-2">
                                <FiGlobe className="text-gray-400" />
                                <a href={selectedUser.profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {selectedUser.profile.website || 'N/A'}
                                </a>
                              </li>
                              <li className="flex items-center gap-2">
                                <FiUser className="text-gray-400" />
                                {selectedUser.profile.contactPerson?.name || 'N/A'}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        handleToggleActive(selectedUser.user._id, selectedUser.user.isActive);
                      }}
                      className={`px-4 py-2 font-medium rounded-lg transition-colors text-white ${selectedUser.user.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                        }`}
                    >
                      {selectedUser.user.isActive ? 'Deactivate User' : 'Activate User'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-gray-500">User not found</div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AllUsers;