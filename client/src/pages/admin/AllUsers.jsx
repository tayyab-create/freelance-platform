import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiUser, FiBriefcase, FiFilter, FiCheckCircle, FiXCircle, FiAlertCircle, FiEye, FiX, FiGlobe, FiMapPin, FiPhone, FiCalendar } from 'react-icons/fi';
import { toast } from '../../utils/toast';
import { PageHeader, ResponsiveTable, StatusBadge, SkeletonLoader, Modal, Select, Avatar } from '../../components/shared';

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

  const columns = [
    {
      key: 'user',
      label: 'User',
      primary: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={null}
            name={row.email}
            type={row.role === 'worker' ? 'worker' : 'company'}
            size="md"
            shape="circle"
          />
          <div>
            <div className="font-medium text-gray-900 truncate max-w-[150px]" title={row.email}>{row.email}</div>
            <div className="text-xs text-gray-500">ID: {row._id.slice(-6)}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (value) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium capitalize ${value === 'worker' ? 'bg-purple-50 text-purple-700' :
          value === 'company' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'
          }`}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'isActive',
      label: 'Access',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">{value ? 'Active' : 'Inactive'}</span>
        </div>
      )
    }
  ];

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
            <div className="w-40">
              <Select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                options={[
                  { value: "", label: "All Roles" },
                  { value: "worker", label: "Workers" },
                  { value: "company", label: "Companies" },
                  { value: "admin", label: "Admins" }
                ]}
              />
            </div>
            <div className="w-40">
              <Select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                options={[
                  { value: "", label: "All Status" },
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Approved" },
                  { value: "rejected", label: "Rejected" }
                ]}
              />
            </div>
            <button onClick={fetchUsers} className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              <FiFilter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <ResponsiveTable
            columns={columns}
            data={users}
            loading={loading}
            emptyMessage="No users found matching your filters."
            actions={(row) => [
              {
                label: 'View Details',
                icon: FiEye,
                onClick: () => handleViewDetails(row._id)
              },
              {
                label: row.isActive ? 'Deactivate' : 'Activate',
                icon: row.isActive ? FiXCircle : FiCheckCircle,
                variant: row.isActive ? 'danger' : 'success',
                onClick: () => handleToggleActive(row._id, row.isActive)
              }
            ]}
          />
        </div>

        {/* User Details Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={loadingDetails ? 'Loading...' : selectedUser ? (
            <span className="truncate block max-w-md">
              {selectedUser.profile?.fullName || selectedUser.profile?.companyName || 'User Details'}
            </span>
          ) : 'User Details'}
          size="lg"
          footer={
            selectedUser && (
              <>
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
              </>
            )
          }
        >
          {loadingDetails ? (
            <div className="p-12 flex justify-center">
              <Spinner size="lg" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-6">
              {/* Header Info */}
              <div className={`p-6 rounded-xl border border-gray-100 flex items-start justify-between ${selectedUser.user.role === 'worker' ? 'bg-purple-50/50' : 'bg-blue-50/50'}`}>
                <div className="flex items-center gap-4">
                  <Avatar
                    src={selectedUser.profile?.profilePicture || selectedUser.profile?.logo}
                    name={selectedUser.profile?.fullName || selectedUser.profile?.companyName}
                    type={selectedUser.user.role === 'worker' ? 'worker' : 'company'}
                    size="xl"
                    shape="rounded-xl"
                    className="shadow-sm border-gray-100"
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 truncate max-w-[300px]" title={selectedUser.profile?.fullName || selectedUser.profile?.companyName}>
                      {selectedUser.profile?.fullName || selectedUser.profile?.companyName || 'No Name'}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-500 truncate max-w-[200px]" title={selectedUser.user.email}>{selectedUser.user.email}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedUser.user.role === 'worker' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {selectedUser.user.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
                    {new Date(selectedUser.user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Role Specific Info */}
              {selectedUser.user.role === 'worker' && selectedUser.profile && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600 leading-relaxed break-words">
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
                    <p className="text-gray-600 leading-relaxed break-words">
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
                          <a href={selectedUser.profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[200px]" title={selectedUser.profile.website}>
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
          ) : (
            <div className="p-12 text-center text-gray-500">User not found</div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AllUsers;