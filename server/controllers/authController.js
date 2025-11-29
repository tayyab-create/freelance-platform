const jwt = require('jsonwebtoken');
const { User, WorkerProfile, CompanyProfile } = require('../models');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register user (Worker or Company)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, role, fullName, companyName } = req.body;

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and role'
      });
    }

    // Check if role is valid
    if (!['worker', 'company'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either worker or company'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      status: 'incomplete' // Requires onboarding completion
    });

    // Create profile based on role
    if (role === 'worker') {
      if (!fullName) {
        return res.status(400).json({
          success: false,
          message: 'Full name is required for workers'
        });
      }
      await WorkerProfile.create({
        user: user._id,
        fullName
      });
    } else if (role === 'company') {
      if (!companyName) {
        return res.status(400).json({
          success: false,
          message: 'Company name is required for companies'
        });
      }
      await CompanyProfile.create({
        user: user._id,
        companyName
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Get profile data to include in response
    let profileData = {};
    if (role === 'worker') {
      const workerProfile = await WorkerProfile.findOne({ user: user._id });
      profileData = {
        name: workerProfile?.fullName,
        profilePhoto: workerProfile?.profilePicture
      };
    } else if (role === 'company') {
      const companyProfile = await CompanyProfile.findOne({ user: user._id });
      profileData = {
        name: companyProfile?.companyName,
        profilePhoto: companyProfile?.logo
      };
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please complete your profile.',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        ...profileData
      }
    });

  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Get profile data to include in response
    let profileData = {};
    if (user.role === 'worker') {
      const workerProfile = await WorkerProfile.findOne({ user: user._id });
      profileData = {
        name: workerProfile?.fullName,
        profilePhoto: workerProfile?.profilePicture
      };
    } else if (user.role === 'company') {
      const companyProfile = await CompanyProfile.findOne({ user: user._id });
      profileData = {
        name: companyProfile?.companyName,
        profilePhoto: companyProfile?.logo
      };
    } else if (user.role === 'admin') {
      // Admin users don't have a profile
      profileData = {
        name: 'Admin',
        profilePhoto: null
      };
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        ...profileData
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    let profile = null;
    let profileData = {};

    // Get profile based on role
    if (user.role === 'worker') {
      profile = await WorkerProfile.findOne({ user: user._id });
      if (profile) {
        profileData = {
          name: profile.fullName,
          profilePhoto: profile.profilePicture
        };
      }
    } else if (user.role === 'company') {
      profile = await CompanyProfile.findOne({ user: user._id });
      if (profile) {
        profileData = {
          name: profile.companyName,
          profilePhoto: profile.logo
        };
      }
    } else if (user.role === 'admin') {
      // Admin users don't have a profile
      profileData = {
        name: 'Admin',
        profilePhoto: null
      };
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        isActive: user.isActive,
        createdAt: user.createdAt,
        ...profileData
      },
      profile
    });

  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};