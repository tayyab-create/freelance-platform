import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { FiUser, FiBriefcase, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
  });

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

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await adminAPI.toggleUserActive(userId);
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to toggle user status');
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">All Users</h1>

        {/* Filters */}
        <div className="card">
          <div className="grid md:grid-cols-3 gap-4">
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Roles</option>
              <option value="worker">Workers</option>
              <option value="company">Companies</option>
              <option value="admin">Admins</option>
            </select>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <button onClick={fetchUsers} className="btn-primary">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user._id} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      {user.role === 'worker' ? (
                        <FiUser className="h-6 w-6 text-primary-600" />
                      ) : (
                        <FiBriefcase className="h-6 w-6 text-primary-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.email}</h3>
                      <div className="flex gap-2 mt-1">
                        <span className="badge badge-info text-xs">
                          {user.role}
                        </span>
                        <span className={`badge text-xs ${
                          user.status === 'approved' ? 'badge-success' :
                          user.status === 'pending' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {user.status}
                        </span>
                        <span className={`badge text-xs ${
                          user.isActive ? 'badge-success' : 'badge-danger'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant={user.isActive ? 'danger' : 'success'}
                    icon={user.isActive ? FiToggleRight : FiToggleLeft}
                    onClick={() => handleToggleActive(user._id, user.isActive)}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AllUsers;