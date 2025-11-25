const { User, WorkerProfile, CompanyProfile, Job, Application } = require('../models');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    const totalCompanies = await User.countDocuments({ role: 'company' });
    const pendingApprovals = await User.countDocuments({ status: 'pending' });
    const approvedUsers = await User.countDocuments({ status: 'approved' });
    const rejectedUsers = await User.countDocuments({ status: 'rejected' });

    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'posted' });
    const completedJobs = await Job.countDocuments({ status: 'completed' });

    const totalApplications = await Application.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          workers: totalWorkers,
          companies: totalCompanies,
          pending: pendingApprovals,
          approved: approvedUsers,
          rejected: rejectedUsers
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          completed: completedJobs
        },
        applications: {
          total: totalApplications
        }
      }
    });
  } catch (error) {
    console.error('Dashboard Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all pending user registrations
// @route   GET /api/admin/users/pending
// @access  Private/Admin
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .select('-password')
      .sort('-createdAt');

    // Get profiles for each user
    const usersWithProfiles = await Promise.all(
      pendingUsers.map(async (user) => {
        let profile = null;
        if (user.role === 'worker') {
          profile = await WorkerProfile.findOne({ user: user._id });
        } else if (user.role === 'company') {
          profile = await CompanyProfile.findOne({ user: user._id });
        }
        return {
          user,
          profile
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithProfiles.length,
      data: usersWithProfiles
    });
  } catch (error) {
    console.error('Get Pending Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all users with filters
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status } = req.query;

    let query = {};
    if (role) query.role = role;
    if (status) query.status = status;

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get user details with profile
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let profile = null;
    if (user.role === 'worker') {
      profile = await WorkerProfile.findOne({ user: user._id });
    } else if (user.role === 'company') {
      profile = await CompanyProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    console.error('Get User Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve user registration
// @route   PUT /api/admin/users/:id/approve
// @access  Private/Admin
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'User is already approved'
      });
    }

    user.status = 'approved';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User approved successfully',
      data: user
    });
  } catch (error) {
    console.error('Approve User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reject user registration
// @route   PUT /api/admin/users/:id/reject
// @access  Private/Admin
exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.status = 'rejected';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User rejected',
      data: user
    });
  } catch (error) {
    console.error('Reject User Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Deactivate/Activate user account
// @route   PUT /api/admin/users/:id/toggle-active
// @access  Private/Admin
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('Toggle User Active Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all jobs for admin
// @route   GET /api/admin/jobs
// @access  Private/Admin
exports.getAllJobs = async (req, res) => {
  try {
    const { status, category } = req.query;

    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const jobs = await Job.find(query)
      .populate('company', 'email')
      .sort('-createdAt');

    // Populate company details
    const jobsWithDetails = await Promise.all(
      jobs.map(async (job) => {
        const jobObj = job.toObject();
        if (jobObj.company) {
          const companyProfile = await CompanyProfile.findOne({ user: jobObj.company._id });
          jobObj.companyInfo = companyProfile ? {
            companyName: companyProfile.companyName,
            logo: companyProfile.logo
          } : null;
        }
        return jobObj;
      })
    );

    res.status(200).json({
      success: true,
      count: jobsWithDetails.length,
      data: jobsWithDetails
    });
  } catch (error) {
    console.error('Admin Get Jobs Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete job (Admin)
// @route   DELETE /api/admin/jobs/:id
// @access  Private/Admin
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job removed'
    });
  } catch (error) {
    console.error('Admin Delete Job Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};