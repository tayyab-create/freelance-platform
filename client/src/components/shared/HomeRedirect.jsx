import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const HomeRedirect = ({ children }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Check if user needs approval
            if (user.approvalStatus === 'pending') {
                navigate('/pending-approval');
                return;
            }

            // Redirect based on role
            if (user.role === 'worker') {
                // If approved, go to dashboard even if onboarding not marked complete
                if (user.approvalStatus === 'approved') {
                    navigate('/worker/dashboard');
                } else if (!user.onboardingCompleted) {
                    navigate('/worker/onboarding');
                } else {
                    navigate('/worker/dashboard');
                }
            } else if (user.role === 'company') {
                // If approved, go to dashboard even if onboarding not marked complete
                if (user.approvalStatus === 'approved') {
                    navigate('/company/dashboard');
                } else if (!user.onboardingCompleted) {
                    navigate('/company/onboarding');
                } else {
                    navigate('/company/dashboard');
                }
            } else if (user.role === 'admin') {
                navigate('/admin/dashboard');
            }
        }
    }, [isAuthenticated, user, navigate]);

    // Show homepage only if not authenticated
    if (!isAuthenticated) {
        return children;
    }

    // Show loading or blank screen while redirecting
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400 text-lg">Redirecting...</p>
            </div>
        </div>
    );
};

export default HomeRedirect;
