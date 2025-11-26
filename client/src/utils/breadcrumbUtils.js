/**
 * Breadcrumb utility functions to generate consistent breadcrumbs across the platform
 * Follows UI/UX best practices for navigation hierarchy
 */

/**
 * Generate breadcrumbs for worker pages
 * @param {string} currentPage - Current page identifier
 * @param {object} data - Additional data for dynamic breadcrumbs (e.g., job title)
 * @returns {array} Array of breadcrumb objects with label and href
 */
export const getWorkerBreadcrumbs = (currentPage, data = {}) => {
  const breadcrumbs = [];

  // Always start with Dashboard for authenticated pages
  breadcrumbs.push({ label: 'Dashboard', href: '/worker/dashboard' });

  switch (currentPage) {
    case 'dashboard':
      // Dashboard is the root, no additional crumbs
      return [{ label: 'Dashboard' }];

    case 'browse-jobs':
      breadcrumbs.push({ label: 'Browse Jobs' });
      break;

    case 'job-details':
      breadcrumbs.push({ label: 'Browse Jobs', href: '/worker/jobs' });
      breadcrumbs.push({ label: data.jobTitle || 'Job Details' });
      break;

    case 'applications':
      breadcrumbs.push({ label: 'My Applications' });
      break;

    case 'assigned-jobs':
      breadcrumbs.push({ label: 'Assigned Jobs' });
      break;

    case 'reviews':
      breadcrumbs.push({ label: 'My Reviews' });
      break;

    case 'profile':
      breadcrumbs.push({ label: 'Profile' });
      break;

    case 'messages':
      breadcrumbs.push({ label: 'Messages' });
      break;

    default:
      break;
  }

  return breadcrumbs;
};

/**
 * Generate breadcrumbs for company pages
 * @param {string} currentPage - Current page identifier
 * @param {object} data - Additional data for dynamic breadcrumbs
 * @returns {array} Array of breadcrumb objects
 */
export const getCompanyBreadcrumbs = (currentPage, data = {}) => {
  const breadcrumbs = [];

  breadcrumbs.push({ label: 'Dashboard', href: '/company/dashboard' });

  switch (currentPage) {
    case 'dashboard':
      return [{ label: 'Dashboard' }];

    case 'post-job':
      breadcrumbs.push({ label: 'Post New Job' });
      break;

    case 'my-jobs':
      breadcrumbs.push({ label: 'My Jobs' });
      break;

    case 'job-applications':
      breadcrumbs.push({ label: 'My Jobs', href: '/company/jobs' });
      breadcrumbs.push({ label: data.jobTitle || 'Applications' });
      break;

    case 'submissions':
      breadcrumbs.push({ label: 'Submissions' });
      break;

    case 'profile':
      breadcrumbs.push({ label: 'Company Profile' });
      break;

    case 'messages':
      breadcrumbs.push({ label: 'Messages' });
      break;

    default:
      break;
  }

  return breadcrumbs;
};

/**
 * Generate breadcrumbs for admin pages
 * @param {string} currentPage - Current page identifier
 * @param {object} data - Additional data for dynamic breadcrumbs
 * @returns {array} Array of breadcrumb objects
 */
export const getAdminBreadcrumbs = (currentPage, data = {}) => {
  const breadcrumbs = [];

  breadcrumbs.push({ label: 'Dashboard', href: '/admin/dashboard' });

  switch (currentPage) {
    case 'dashboard':
      return [{ label: 'Dashboard' }];

    case 'pending-approvals':
      breadcrumbs.push({ label: 'Pending Approvals' });
      break;

    case 'all-users':
      breadcrumbs.push({ label: 'All Users' });
      break;

    case 'manage-jobs':
      breadcrumbs.push({ label: 'Manage Jobs' });
      break;

    default:
      break;
  }

  return breadcrumbs;
};

/**
 * Generate breadcrumbs based on role and page
 * @param {string} role - User role (worker, company, admin)
 * @param {string} currentPage - Current page identifier
 * @param {object} data - Additional data for dynamic breadcrumbs
 * @returns {array} Array of breadcrumb objects
 */
export const getBreadcrumbs = (role, currentPage, data = {}) => {
  switch (role) {
    case 'worker':
      return getWorkerBreadcrumbs(currentPage, data);
    case 'company':
      return getCompanyBreadcrumbs(currentPage, data);
    case 'admin':
      return getAdminBreadcrumbs(currentPage, data);
    default:
      return [];
  }
};
