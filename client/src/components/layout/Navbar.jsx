import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { FiMenu, FiX, FiLogOut, FiUser, FiBriefcase, FiHome, FiFileText, FiCheckCircle, FiStar, FiMessageCircle, FiChevronLeft, FiChevronRight, FiSearch } from 'react-icons/fi';
import GlobalSearch from '../shared/GlobalSearch';
import NotificationBell from './NotificationBell';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
      { name: 'Profile', path: '/worker/profile', icon: FiUser },
      { name: 'Messages', path: '/messages', icon: FiMessageCircle },
      { name: 'Reviews', path: '/worker/reviews', icon: FiStar },
    ],
    company: [
      { name: 'Dashboard', path: '/company/dashboard', icon: FiHome },
      { name: 'Post Job', path: '/company/post-job', icon: FiBriefcase },
      { name: 'My Jobs', path: '/company/jobs', icon: FiBriefcase },
      { name: 'Submissions', path: '/company/submissions', icon: FiFileText },
      { name: 'Profile', path: '/company/profile', icon: FiUser },
      { name: 'Messages', path: '/company/messages', icon: FiMessageCircle },
      { name: 'Reviews', path: '/company/reviews', icon: FiStar }
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: FiHome },
      { name: 'Pending Approvals', path: '/admin/pending', icon: FiUser },
      { name: 'All Users', path: '/admin/users', icon: FiUser },
      { name: 'Manage Jobs', path: '/admin/jobs', icon: FiBriefcase },
    ],
  };

  const links = navLinks[user?.role] || [];

  const isActive = (path) => location.pathname === path;

  // Handle Ctrl+K keyboard shortcut for global search
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/20 text-gray-700 hover:bg-white hover:shadow-xl active:scale-95 transition-all duration-300 touch-manipulation"
        aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white/80 backdrop-blur-xl shadow-2xl border-r border-white/20 z-40
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200/50">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-3">
                <Link
                  to={getDashboardLink()}
                  className="font-display font-bold text-gradient hover:scale-105 transition-all duration-300 text-xl"
                >
                  FP
                </Link>
                <NotificationBell isCollapsed={isCollapsed} />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <Link
                  to={getDashboardLink()}
                  className="font-display font-bold text-gradient hover:scale-105 transition-all duration-300 text-2xl"
                >
                  Freelance Platform
                </Link>
                <NotificationBell isCollapsed={isCollapsed} />
              </div>
            )}
          </div>

          {/* Global Search */}
          <div className="px-4 pt-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300
                bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 active:scale-95
                ${isCollapsed ? 'justify-center' : ''}
                touch-manipulation
              `}
              title={isCollapsed ? 'Search' : ''}
            >
              <FiSearch className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'} flex-shrink-0`} />
              {!isCollapsed && <span>Search</span>}
              {!isCollapsed && (
                <kbd className="ml-auto px-2 py-1 bg-white rounded text-xs font-mono text-gray-500">
                  Ctrl+K
                </kbd>
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin">
            {links.map((link) => {
              const isLinkActive = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-300
                    group relative overflow-hidden
                    ${isLinkActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 scale-[1.02]'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600 active:scale-95 hover:shadow-md'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                    touch-manipulation
                  `}
                  title={isCollapsed ? link.name : ''}
                >
                  <link.icon className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'} flex-shrink-0`} />
                  {!isCollapsed && <span>{link.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Section & Logout */}
          <div className="p-4 border-t border-gray-200/50 space-y-2">
            {/* User Info with Photo */}
            {user && (
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-50 to-primary-100/50 ${isCollapsed ? 'justify-center' : ''}`}>
                {/* Profile Photo or Avatar */}
                <div className="flex-shrink-0">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-md">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>

                {/* User Name and Role */}
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-sm">{user.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{user.role}</p>
                  </div>
                )}
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300
                text-gray-700 hover:bg-red-50 hover:text-red-600 active:scale-95 hover:shadow-md
                ${isCollapsed ? 'justify-center' : ''}
                touch-manipulation
              `}
              title={isCollapsed ? 'Logout' : ''}
            >
              <FiLogOut className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'} flex-shrink-0`} />
              {!isCollapsed && <span>Logout</span>}
            </button>

            {/* Collapse Toggle (Desktop Only) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-full items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-gray-700 hover:bg-gray-100"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? <FiChevronRight className="h-5 w-5" /> : <FiChevronLeft className="h-5 w-5" />}
              {!isCollapsed && <span className="text-sm">Collapse</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;