import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, clearError } from '../../redux/slices/authSlice';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user is pending approval or rejected
      if (user.status === 'pending' || user.status === 'rejected') {
        // Redirect to onboarding flow for both pending and rejected users
        // The onboarding page will handle showing the status/history
        if (user.role === 'worker') {
          navigate('/worker/onboarding');
        } else if (user.role === 'company') {
          navigate('/company/onboarding');
        }
        return;
      }

      // Redirect approved users based on role
      if (user.status === 'approved') {
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user.role === 'worker') {
          navigate('/worker/dashboard');
        } else if (user.role === 'company') {
          navigate('/company/dashboard');
        }
      }
    }

    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, user, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            icon={FiMail}
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              icon={FiLock}
            />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
            Keep me signed in
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
          className="shadow-xl shadow-primary-500/20 py-3 text-lg"
          icon={!loading ? FiArrowRight : undefined}
        >
          Sign In
        </Button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">New to the platform?</span>
          </div>
        </div>
      </form>

      <div className="text-center">
        <Link
          to="/register"
          className="inline-flex items-center justify-center w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-200 transition-all duration-200"
        >
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Login;