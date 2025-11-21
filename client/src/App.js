import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getMe } from "./redux/slices/authSlice";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import MyApplications from "./pages/worker/MyApplications";
import AssignedJobs from "./pages/worker/AssignedJobs";
import WorkerProfile from "./pages/worker/WorkerProfile";
import CompanyProfile from "./pages/company/CompanyProfile";
import Submissions from "./pages/company/Submissions";
import MyReviews from "./pages/worker/MyReviews";

import Conversations from "./pages/messages/Conversations";
import Chat from "./pages/messages/Chat";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PendingApproval from "./pages/auth/PendingApproval";

// Worker Pages
import WorkerDashboard from "./pages/worker/WorkerDashboard";
import BrowseJobs from "./pages/worker/BrowseJobs";
import JobDetails from "./pages/worker/JobDetails";

// Company Pages
import CompanyDashboard from "./pages/company/CompanyDashboard";
import PostJob from "./pages/company/PostJob";
import MyJobs from "./pages/company/MyJobs";
import JobApplications from "./pages/company/JobApplications";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingApprovals from "./pages/admin/PendingApprovals";
import AllUsers from "./pages/admin/AllUsers";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getMe());
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <div className="text-center p-10">
              <h1 className="text-4xl font-bold text-primary-600">
                Welcome to Freelance Platform
              </h1>
              <p className="mt-4 text-gray-600">
                Connect with talented freelancers or find your next project
              </p>
              <div className="mt-8 space-x-4">
                <a href="/login" className="btn-primary">
                  Login
                </a>
                <a href="/register" className="btn-secondary">
                  Register
                </a>
              </div>
            </div>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/worker/reviews"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <MyReviews />
            </ProtectedRoute>
          }
        />
        {/* Worker Routes */}
        <Route
          path="/worker/dashboard"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/jobs"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <BrowseJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/jobs/:id"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <JobDetails />
            </ProtectedRoute>
          }
        />
        {/* Company Routes */}
        <Route
          path="/company/dashboard"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/post-job"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <PostJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/jobs"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <MyJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/jobs/:id"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <JobApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/submissions"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <Submissions />
            </ProtectedRoute>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pending"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PendingApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AllUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/applications"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/jobs/assigned"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <AssignedJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/profile"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <WorkerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/profile"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <CompanyProfile />
            </ProtectedRoute>
          }
        />

        {/* Message Routes */}
<Route
  path="/messages"
  element={
    <ProtectedRoute allowedRoles={["worker", "company"]}>
      <Conversations />
    </ProtectedRoute>
  }
/>
<Route
  path="/messages/:conversationId"
  element={
    <ProtectedRoute allowedRoles={["worker", "company"]}>
      <Chat />
    </ProtectedRoute>
  }
/>
        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="text-center p-10">
              <h1 className="text-4xl font-bold text-gray-900">
                404 - Page Not Found
              </h1>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
