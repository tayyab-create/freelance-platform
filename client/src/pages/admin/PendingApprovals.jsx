import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { FiCheck, FiX, FiUser, FiBriefcase } from 'react-icons/fi';

const PendingApprovals = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    try {
      await adminAPI.rejectUser(userId);
      toast.success('User rejected');
      fetchPendingUsers();
    } catch (error) {
      toast.error('Failed to reject user');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Pending Approvals</h1>

      {pendingUsers.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-600">No pending approvals</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingUsers.map(({ user, profile }) => (
            <div key={user._id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    {user.role === 'worker' ? (
                      <FiUser className="h-6 w-6 text-primary-600" />
                    ) : (
                      <FiBriefcase className="h-6 w-6 text-primary-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {profile?.fullName || profile?.companyName}
                    </h3>
                    <p className="text-gray-600">{user.email}</p>
                    <span className="badge badge-info mt-2">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="success"
                    icon={FiCheck}
                    onClick={() => handleApprove(user._id)}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    icon={FiX}
                    onClick={() => handleReject(user._id)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;