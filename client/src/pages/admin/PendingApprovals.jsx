import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from '../../utils/toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import { FiCheck, FiX, FiUser, FiBriefcase, FiClock } from 'react-icons/fi';
import { PageHeader, SkeletonLoader, EmptyState, StatusBadge, Avatar, ActionDropdown, ConfirmationModal } from '../../components/shared';

const PendingApprovals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'approve' | 'reject', userId: string }

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

  const handleApproveClick = (userId) => {
    setConfirmAction({ type: 'approve', userId });
  };

  const handleRejectClick = (userId) => {
    setConfirmAction({ type: 'reject', userId });
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { type, userId } = confirmAction;
    setConfirmAction(null);

    try {
      if (type === 'approve') {
        await adminAPI.approveUser(userId);
        toast.success('User approved successfully!');
      } else {
        await adminAPI.rejectUser(userId);
        toast.success('User rejected');
      }
      fetchPendingUsers();
    } catch (error) {
      toast.error(`Failed to ${type} user`);
    }
  };

  const filteredUsers = pendingUsers.filter(({ user }) =>
    filterRole === 'all' ? true : user.role === filterRole
  );

  if (loading) {
    return (
      <DashboardLayout>
        <SkeletonLoader type="list" count={8} />
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
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="worker">Workers</option>
              <option value="company">Companies</option>
            </select>
            <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
              <FiClock />
              {filteredUsers.length} Pending
            </div>
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
              {filteredUsers.map(({ user, profile }) => (
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
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleRejectClick(user._id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2"
                    >
                      <FiX className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveClick(user._id)}
                      className="px-6 py-2 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
                    >
                      <FiCheck className="h-4 w-4" />
                      Approve Request
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={executeConfirmAction}
          title={confirmAction?.type === 'approve' ? 'Approve User?' : 'Reject User?'}
          message={confirmAction?.type === 'approve'
            ? 'Are you sure you want to approve this user? They will be granted access to the platform.'
            : 'Are you sure you want to reject this user? They will not be able to access the platform.'}
          confirmText={confirmAction?.type === 'approve' ? 'Approve' : 'Reject'}
          variant={confirmAction?.type === 'approve' ? 'success' : 'danger'}
        />
      </div>
    </DashboardLayout>
  );
};

export default PendingApprovals;