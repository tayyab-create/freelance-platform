import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register, clearError } from '../../redux/slices/authSlice';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FiMail, FiLock, FiUser, FiBriefcase } from 'react-icons/fi';
import { useFormValidation } from '../../hooks/useFormValidation';
import { validationRules, ValidationSchema } from '../../utils/validation';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated, user } = useSelector((state) => state.auth);

  // Build validation schema dynamically based on role
  const buildValidationSchema = (role) => {
    const schema = new ValidationSchema()
      .field('email', validationRules.required, validationRules.email)
      .field('password', validationRules.required, validationRules.password)
      .field('role', validationRules.required);

    if (role === 'worker') {
      schema.field('fullName', validationRules.required, validationRules.minLength(2), validationRules.maxLength(100));
    } else if (role === 'company') {
      schema.field('companyName', validationRules.required, validationRules.minLength(2), validationRules.maxLength(200));
    }

    return schema.build();
  };

  // Form validation hook
  const {
    values: formData,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldsValues,
  } = useFormValidation(
    {
      email: '',
      password: '',
      confirmPassword: '',
      role: 'worker',
      fullName: '',
      companyName: '',
    },
    buildValidationSchema('worker'),
    { validateOnChange: true, validateOnBlur: true }
  );

  // Custom validation for confirm password
  const confirmPasswordError =
    touched.confirmPassword && formData.confirmPassword && formData.password !== formData.confirmPassword
      ? 'Passwords do not match'
      : '';

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.status === 'pending') {
        // If onboarding is not complete, redirect to onboarding flow
        if (!user.onboardingCompleted) {
          if (user.role === 'worker') {
            navigate('/worker/onboarding');
          } else if (user.role === 'company') {
            navigate('/company/onboarding');
          }
        } else {
          // If onboarding is complete but status is pending, go to status page
          navigate('/onboarding/status');
        }
      } else if (user.status === 'approved') {
        if (user.role === 'worker') {
          navigate('/worker/dashboard');
        } else if (user.role === 'company') {
          navigate('/company/dashboard');
        } else if (user.role === 'admin') {
          navigate('/admin/dashboard');
        }
      } else if (user.status === 'rejected') {
        navigate('/onboarding/status');
      }
    }

    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, user, navigate, dispatch]);

  const handleRoleChange = (newRole) => {
    setFieldValue('role', newRole);
  };

  const onSubmit = async (values) => {
    // Check confirm password match
    if (values.password !== values.confirmPassword) {
      return;
    }

    const userData = {
      email: values.email,
      password: values.password,
      role: values.role,
    };

    if (values.role === 'worker') {
      userData.fullName = values.fullName;
    } else {
      userData.companyName = values.companyName;
    }

    dispatch(register(userData));
  };

  const isFormValid =
    !errors.email &&
    !errors.password &&
    !confirmPasswordError &&
    (formData.role === 'worker' ? !errors.fullName : !errors.companyName) &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    (formData.role === 'worker' ? formData.fullName : formData.companyName);

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join our platform and start your journey"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Role Selection */}
        <div>
          <label className="label mb-3">I want to join as a</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleRoleChange('worker')}
              className={`group relative p-4 rounded-xl border-2 text-left transition-all duration-300 flex flex-col gap-3 ${formData.role === 'worker'
                ? 'border-primary-600 bg-primary-50/50 ring-2 ring-primary-100 shadow-lg shadow-primary-500/10'
                : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50 hover:shadow-md'
                }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${formData.role === 'worker'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600'
                  }`}
              >
                <FiUser className="w-5 h-5" />
              </div>
              <div>
                <div
                  className={`font-bold transition-colors ${formData.role === 'worker' ? 'text-primary-900' : 'text-gray-900'
                    }`}
                >
                  Freelancer
                </div>
                <div className="text-xs text-gray-500 mt-1">I want to find work</div>
              </div>
              {formData.role === 'worker' && (
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
              onClick={() => handleRoleChange('company')}
              className={`group relative p-4 rounded-xl border-2 text-left transition-all duration-300 flex flex-col gap-3 ${formData.role === 'company'
                ? 'border-primary-600 bg-primary-50/50 ring-2 ring-primary-100 shadow-lg shadow-primary-500/10'
                : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50 hover:shadow-md'
                }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${formData.role === 'company'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600'
                  }`}
              >
                <FiBriefcase className="w-5 h-5" />
              </div>
              <div>
                <div
                  className={`font-bold transition-colors ${formData.role === 'company' ? 'text-primary-900' : 'text-gray-900'
                    }`}
                >
                  Company
                </div>
                <div className="text-xs text-gray-500 mt-1">I want to hire talent</div>
              </div>
              {formData.role === 'company' && (
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
        {formData.role === 'worker' ? (
          <Input
            label="Full Name"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your full name"
            required
            icon={FiUser}
            error={touched.fullName ? errors.fullName : ''}
            success={touched.fullName && !errors.fullName && formData.fullName}
            maxLength={100}
            helperText="Your full legal name"
          />
        ) : (
          <Input
            label="Company Name"
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your company name"
            required
            icon={FiBriefcase}
            error={touched.companyName ? errors.companyName : ''}
            success={touched.companyName && !errors.companyName && formData.companyName}
            maxLength={200}
            helperText="Your registered company name"
          />
        )}

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your email"
          required
          icon={FiMail}
          error={touched.email ? errors.email : ''}
          success={touched.email && !errors.email && formData.email}
          autoComplete="email"
          helperText="We'll send a verification email to this address"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Create a strong password"
          required
          icon={FiLock}
          error={touched.password ? errors.password : ''}
          success={touched.password && !errors.password && formData.password}
          autoComplete="new-password"
          helperText="At least 8 characters with uppercase, lowercase, and number"
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Re-enter your password"
          required
          icon={FiLock}
          error={confirmPasswordError}
          success={formData.confirmPassword && !confirmPasswordError && formData.password}
          autoComplete="new-password"
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
          disabled={loading || !isFormValid}
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
