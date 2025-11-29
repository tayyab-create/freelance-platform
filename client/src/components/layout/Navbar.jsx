import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import {
  FiMenu, FiX, FiLogOut, FiUser, FiBriefcase, FiHome,
  FiFileText, FiCheckCircle, FiStar, FiMessageSquare,
  FiChevronLeft, FiChevronRight, FiSearch, FiGrid,
  FiCompass, FiSend, FiAward, FiPlusSquare, FiLayers, FiInbox, FiSettings
} from 'react-icons/fi';
import GlobalSearch from '../shared/GlobalSearch';
import NotificationBell from './NotificationBell';
import { Avatar } from '../shared';

const Navbar = ({ disableNavigation = false }) => {
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
      { name: 'Dashboard', path: '/worker/dashboard', icon: FiGrid },
      { name: 'Browse Jobs', path: '/worker/jobs', icon: FiCompass },
      { name: 'My Applications', path: '/worker/applications', icon: FiSend },
      { name: 'Assigned Jobs', path: '/worker/jobs/assigned', icon: FiBriefcase },
      { name: 'Messages', path: '/messages', icon: FiMessageSquare },
      { name: 'Reviews', path: '/worker/reviews', icon: FiAward },
      { name: 'Profile', path: '/worker/profile', icon: FiUser },
    ],
    company: [
      { name: 'Dashboard', path: '/company/dashboard', icon: FiGrid },
      { name: 'Post Job', path: '/company/post-job', icon: FiPlusSquare },
      { name: 'My Jobs', path: '/company/jobs', icon: FiLayers },
      { name: 'Submissions', path: '/company/submissions', icon: FiInbox },
      { name: 'Messages', path: '/company/messages', icon: FiMessageSquare },
      { name: 'Reviews', path: '/company/reviews', icon: FiAward },
      { name: 'Profile', path: '/company/profile', icon: FiSettings },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
      { name: 'Pending Approvals', path: '/admin/pending', icon: FiUser },
      { name: 'All Users', path: '/admin/users', icon: FiUser },
      { name: 'Manage Jobs', path: '/admin/jobs', icon: FiBriefcase },
    ],
  };

  const links = navLinks[user?.role] || [];

  const isActive = (path) => location.pathname === path;

  // Handle Ctrl+K keyboard shortcut for global search
  useEffect(() => {
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 text-gray-700 hover:bg-white hover:shadow-xl active:scale-95 transition-all duration-300 touch-manipulation"
        aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isMobileOpen}
        aria-controls="sidebar-navigation"
      >
        {isMobileOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <aside
        id="sidebar-navigation"
        className={`
          fixed top-0 left-0 h-screen bg-white/90 backdrop-blur-2xl shadow-2xl border-r border-gray-100 z-40
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-24' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Sidebar Navigation"
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className={`p-6 border-b border-gray-100 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <Link
              to={getDashboardLink()}
              className="group flex items-center gap-3"
              aria-label="Go to Dashboard"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform duration-300">
                FP
              </div>
              {!isCollapsed && (
                <span className="font-display font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Freelance
                </span>
              )}
            </Link>

            {/* Notification Bell - Always visible now */}
            {!isCollapsed && <NotificationBell />}
          </div>

          {/* Collapsed Notification Bell */}
          {isCollapsed && (
            <div className="py-4 flex justify-center border-b border-gray-100">
              <NotificationBell isCollapsed={true} />
            </div>
          )}

          {/* Global Search Trigger */}
          <div className="px-4 pt-6 pb-2">
            <button
              onClick={() => !disableNavigation && setIsSearchOpen(true)}
              disabled={disableNavigation}
              className={`
                w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300
                bg-gray-50 text-gray-500 border border-gray-100
                ${disableNavigation
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white hover:border-primary-200 hover:text-primary-600 hover:shadow-lg hover:shadow-primary-500/10 active:scale-95'
                }
                ${isCollapsed ? 'justify-center px-0' : ''}
              `}
              title={disableNavigation ? 'Search disabled during onboarding' : 'Search (Ctrl+K)'}
              aria-label="Search"
            >
              <FiSearch className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'} flex-shrink-0`} />
              {!isCollapsed && <span className="text-sm">Search...</span>}
              {!isCollapsed && (
                <kbd className="ml-auto px-2 py-0.5 bg-white rounded-lg border border-gray-200 text-[10px] font-bold text-gray-400 font-mono shadow-sm">
                  ⌘K
                </kbd>
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent" aria-label="Main">
            {links.map((link) => {
              const isLinkActive = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={disableNavigation ? '#' : link.path}
                  onClick={(e) => {
                    if (disableNavigation) {
                      e.preventDefault();
                      return;
                    }
                    setIsMobileOpen(false);
                  }}
                  className={`
                    flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300
                    group relative overflow-hidden
                    ${disableNavigation ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isLinkActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 translate-x-1'
                      : disableNavigation
                        ? 'text-gray-400'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600 hover:translate-x-1'
                    }
                    ${isCollapsed ? 'justify-center px-0' : ''}
                  `}
                  title={isCollapsed ? link.name : ''}
                  aria-current={isLinkActive ? 'page' : undefined}
                  aria-disabled={disableNavigation}
                >
                  <link.icon className={`
                    ${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'} 
                    flex-shrink-0 transition-transform duration-300
                    ${isLinkActive ? 'scale-110' : disableNavigation ? '' : 'group-hover:scale-110'}
                  `} />
                  {!isCollapsed && <span className="text-sm tracking-wide">{link.name}</span>}

                  {/* Active Indicator Dot */}
                  {isLinkActive && !isCollapsed && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white/50 shadow-sm" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section & Footer */}
          <div className="p-4 border-t border-gray-100 space-y-3 bg-white/50">
            {/* User Profile */}
            {user && (
              <div className={`
                flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300
                ${isCollapsed ? 'justify-center' : 'bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:border-primary-100 hover:shadow-md'}
              `}>
                <div className="relative flex-shrink-0">
                  <Avatar
                    src={user.profilePhoto || user.profilePicture || user.logo}
                    name={user.name || user.companyName || 'User'}
                    type={user.role === 'company' ? 'company' : 'worker'}
                    size="md"
                    className="border-2 border-white shadow-md ring-2 ring-gray-50"
                    shape="circle"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate text-sm leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize font-medium mt-0.5">{user.role}</p>
                  </div>
                )}
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300
                text-gray-500 hover:bg-red-50 hover:text-red-600 hover:shadow-md hover:shadow-red-500/10 active:scale-95
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title="Logout"
              aria-label="Logout"
            >
              <FiLogOut className={`${isCollapsed ? 'h-6 w-6' : 'h-5 w-5'} flex-shrink-0`} />
              {!isCollapsed && <span className="text-sm">Logout</span>}
            </button>

            {/* Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex w-full items-center justify-center p-2 rounded-xl text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-all duration-300"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? <FiChevronRight className="h-5 w-5" /> : <FiChevronLeft className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Navbar;