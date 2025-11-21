import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import Button from '../../components/common/Button';
import { FiClock, FiLogOut } from 'react-icons/fi';

const PendingApproval = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
            <FiClock className="h-8 w-8 text-yellow-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Account Pending Approval
          </h2>

          {/* Message */}
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Thank you for registering, <span className="font-semibold">{user?.email}</span>!
            </p>
            <p className="text-gray-600 mb-4">
              Your account is currently under review by our admin team. You'll receive access once your account is approved.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>What happens next?</strong>
                <br />
                Our team will review your registration within 24-48 hours. You'll be notified via email once your account is approved.
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span className="badge badge-warning text-base px-4 py-2">
              Status: {user?.status || 'Pending'}
            </span>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="secondary"
              fullWidth
              icon={FiLogOut}
              onClick={handleLogout}
            >
              Logout
            </Button>
            
            <p className="text-sm text-gray-500">
              Need help? <Link to="/contact" className="text-primary-600 hover:text-primary-700">Contact Support</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;