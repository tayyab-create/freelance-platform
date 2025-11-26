import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, clearError } from '../../redux/slices/authSlice';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FiMail, FiLock, FiUser, FiBriefcase } from 'react-icons/fi';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth);


  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'worker',
    fullName: '',
    companyName: '',
  });

  const [errors, setErrors] = useState({});

  const { email, password, confirmPassword, role, fullName, companyName } = formData;

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check user status and redirect accordingly
      if (user.status === 'pending') {
        navigate('/pending-approval');
      } else if (user.status === 'approved') {
        // Redirect based on role for approved users
        if (user.role === 'worker') {
          navigate('/worker/dashboard');
        } else if (user.role === 'company') {
          navigate('/company/dashboard');
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard');
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
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (role === 'worker' && !fullName) newErrors.fullName = 'Full name is required';
    if (role === 'company' && !companyName) newErrors.companyName = 'Company name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const userData = {
      email,
      password,
      role,
    };

    if (role === 'worker') {
      userData.fullName = fullName;
    } else {
      userData.companyName = companyName;
    }

    dispatch(register(userData));
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join our platform and start your journey"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <div>
          <label className="label mb-3">I want to join as a</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'worker' })}
              className={`group relative p-4 rounded-xl border-2 text-left transition-all duration-300 flex flex-col gap-3 ${role === 'worker'
                  ? 'border-primary-600 bg-primary-50/50 ring-2 ring-primary-100 shadow-lg shadow-primary-500/10'
                  : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50 hover:shadow-md'
                }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${role === 'worker' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600'
                }`}>
                <FiUser className="w-5 h-5" />
              </div>
              <div>
                <div className={`font-bold transition-colors ${role === 'worker' ? 'text-primary-900' : 'text-gray-900'}`}>Freelancer</div>
                <div className="text-xs text-gray-500 mt-1">I want to find work</div>
              </div>
              {role === 'worker' && (
                <div className="absolute top-3 right-3 text-primary-600">
                  <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'company' })}
              className={`group relative p-4 rounded-xl border-2 text-left transition-all duration-300 flex flex-col gap-3 ${role === 'company'
                  ? 'border-primary-600 bg-primary-50/50 ring-2 ring-primary-100 shadow-lg shadow-primary-500/10'
                  : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50 hover:shadow-md'
                }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${role === 'company' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600'
                }`}>
                <FiBriefcase className="w-5 h-5" />
              </div>
              <div>
                <div className={`font-bold transition-colors ${role === 'company' ? 'text-primary-900' : 'text-gray-900'}`}>Company</div>
                <div className="text-xs text-gray-500 mt-1">I want to hire talent</div>
              </div>
              {role === 'company' && (
                <div className="absolute top-3 right-3 text-primary-600">
                  <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Conditional Name Field */}
        {role === 'worker' ? (
          <Input
            label="Full Name"
            type="text"
            name="fullName"
            value={fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            icon={FiUser}
            error={errors.fullName}
          />
        ) : (
          <Input
            label="Company Name"
            type="text"
            name="companyName"
            value={companyName}
            onChange={handleChange}
            placeholder="Enter your company name"
            required
            icon={FiBriefcase}
            error={errors.companyName}
          />
        )}

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          icon={FiMail}
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={password}
          onChange={handleChange}
          placeholder="Create a password"
          required
          icon={FiLock}
          error={errors.password}
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          required
          icon={FiLock}
          error={errors.confirmPassword}
        />

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-500 font-medium">
              Terms and Conditions
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={loading}
          disabled={loading}
          className="shadow-xl shadow-primary-500/20"
        >
          Create Account
        </Button>

        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-primary-600 hover:text-primary-500 font-bold">
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Register;