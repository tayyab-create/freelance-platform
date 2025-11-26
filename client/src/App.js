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

import Messages from "./pages/shared/Messages";

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
import ManageJobs from "./pages/admin/ManageJobs";

import ScrollToTop from "./components/shared/ScrollToTop";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getMe());
    }
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <div className="min-h-screen flex items-center justify-center px-4">
              <div className="text-center max-w-4xl mx-auto animate-fade-in">
                <h1 className="text-6xl md:text-7xl font-display font-bold text-gradient mb-6">
                  Welcome to Freelance Platform
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-12 font-medium">
                  Connect with talented freelancers or find your next exciting project
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a href="/login" className="btn-primary inline-block px-8 py-4 text-lg">
                    <span>Login</span>
                  </a>
                  <a href="/register" className="btn-secondary inline-block px-8 py-4 text-lg">
                    Register
                  </a>
                </div>

                {/* Feature highlights */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="card-premium text-center">
                    <div className="text-4xl mb-4">🚀</div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Fast & Easy</h3>
                    <p className="text-gray-600">Quick onboarding and intuitive interface</p>
                  </div>
                  <div className="card-premium text-center">
                    <div className="text-4xl mb-4">💼</div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Quality Jobs</h3>
                    <p className="text-gray-600">Find the perfect match for your skills</p>
                  </div>
                  <div className="card-premium text-center">
                    <div className="text-4xl mb-4">⭐</div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Trusted Platform</h3>
                    <p className="text-gray-600">Secure and reliable for everyone</p>
                  </div>
                </div>
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
          path="/admin/jobs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ManageJobs />
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
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/messages"
          element={
            <ProtectedRoute allowedRoles={["worker"]}>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/messages"
          element={
            <ProtectedRoute allowedRoles={["company"]}>
              <Messages />
            </ProtectedRoute>
          }
        />
        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center px-4">
              <div className="text-center">
                <h1 className="text-8xl font-display font-bold text-gradient mb-4">
                  404
                </h1>
                <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
                <a href="/" className="btn-primary inline-block">
                  <span>Go Home</span>
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
