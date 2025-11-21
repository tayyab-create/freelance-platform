import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { FiMenu, FiX, FiLogOut, FiUser, FiBriefcase, FiHome, FiFileText, FiCheckCircle, FiStar, FiMessageCircle } from 'react-icons/fi';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'worker') return '/worker/dashboard';
    if (user?.role === 'company') return '/company/dashboard';
    return '/';
  };

  const navLinks = {
    worker: [
  { name: 'Dashboard', path: '/worker/dashboard', icon: FiHome },
  { name: 'Browse Jobs', path: '/worker/jobs', icon: FiBriefcase },
  { name: 'My Applications', path: '/worker/applications', icon: FiFileText },
  { name: 'Assigned Jobs', path: '/worker/jobs/assigned', icon: FiCheckCircle },
  { name: 'Reviews', path: '/worker/reviews', icon: FiStar },  // Add this
  { name: 'Profile', path: '/worker/profile', icon: FiUser },
  { name: 'Messages', path: '/messages', icon: FiMessageCircle },
],
    company: [
      { name: 'Dashboard', path: '/company/dashboard', icon: FiHome },
      { name: 'Post Job', path: '/company/post-job', icon: FiBriefcase },
      { name: 'My Jobs', path: '/company/jobs', icon: FiBriefcase },
      { name: 'Submissions', path: '/company/submissions', icon: FiFileText },
      { name: 'Profile', path: '/company/profile', icon: FiUser },
      { name: 'Messages', path: '/messages', icon: FiMessageCircle },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: FiHome },
      { name: 'Pending Approvals', path: '/admin/pending', icon: FiUser },
      { name: 'All Users', path: '/admin/users', icon: FiUser },
    ],
  };

  const links = navLinks[user?.role] || [];

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={getDashboardLink()} className="text-2xl font-bold text-primary-600">
            Freelance Platform
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-primary-600 transition flex items-center gap-2"
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-700 hover:text-red-600 transition"
            >
              <FiLogOut className="h-4 w-4" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2"
            >
              <FiLogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;