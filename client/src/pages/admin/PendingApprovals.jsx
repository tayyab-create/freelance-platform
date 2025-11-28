import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from '../../utils/toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FiCheck, FiX, FiUser, FiBriefcase, FiClock, FiSearch, FiEye } from 'react-icons/fi';
import { SkeletonLoader, Select } from '../../components/shared';
import UserApprovalModal from '../../components/admin/UserApprovalModal';

const PendingApprovals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await adminAPI.getPendingUsers();
      setPendingUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await adminAPI.approveUser(userId);
      toast.success('User approved successfully!');
      fetchPendingUsers();
      setSelectedUser(null);
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (userId, reason) => {
    try {
      await adminAPI.rejectUser(userId, reason);
      toast.success('User rejected');
      fetchPendingUsers();
      setSelectedUser(null);
    } catch (error) {
      toast.error('Failed to reject user');
    }
  };

  const filteredUsers = pendingUsers.filter(({ user, profile }) => {
    const matchesRole = filterRole === 'all' ? true : user.role === filterRole;
    const name = profile?.fullName || profile?.companyName || '';
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRole && matchesSearch;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <SkeletonLoader type="list" count={8} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
            <p className="text-gray-500 text-sm mt-1">Review and manage registration requests</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
              <FiClock />
              {pendingUsers.length} Pending
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'worker', label: 'Workers' },
                { value: 'company', label: 'Companies' },
              ]}
            />
          </div>
        </div>

        {/* List View */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="text-gray-500">No pending approvals matching your filter.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {filteredUsers.map((item) => {
                const { user, profile } = item;
                return (
                  <div key={user._id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Avatar/Icon */}
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl font-bold ${user.role === 'worker'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-blue-100 text-blue-600'
                        }`}>
                        {user.role === 'worker' ? <FiUser /> : <FiBriefcase />}
                      </div>

                      {/* Info */}
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {profile?.fullName || profile?.companyName || 'Unknown Name'}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{user.email}</span>
                          <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                          <span className={`capitalize px-2 py-0.5 rounded text-xs font-medium ${user.role === 'worker' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                            {user.role}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                          <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedUser(item)}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <FiEye className="h-4 w-4" />
                        Review Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <UserApprovalModal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          user={selectedUser?.user}
          profile={selectedUser?.profile}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </DashboardLayout>
  );
};

export default PendingApprovals;