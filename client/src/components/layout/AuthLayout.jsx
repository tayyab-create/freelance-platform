import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full lg:w-[480px] xl:w-[600px] relative z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30 group-hover:scale-110 transition-transform duration-300">
                <span className="font-bold text-xl">F</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-gray-900 group-hover:text-primary-600 transition-colors">Freelance</span>
            </Link>
            <h2 className="mt-8 text-3xl font-bold tracking-tight text-gray-900">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600">
                {subtitle}
              </p>
            )}
          </div>

          <div className="mt-8">
            {children}
          </div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-indigo-900">
          {/* Decorative patterns/blobs */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

          {/* Animated Blobs */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 text-center z-10">
          <h3 className="text-4xl font-bold mb-6 max-w-lg leading-tight drop-shadow-lg">
            Connect with Top Talent & Opportunities
          </h3>
          <p className="text-lg text-primary-100 max-w-md leading-relaxed mb-12 drop-shadow-md">
            Join our community of professionals and companies building the future of work together.
          </p>

          {/* Floating Cards Visual */}
          <div className="relative w-full max-w-md aspect-[4/3]">
            {/* Abstract UI representation - Glass Card */}
            <div className="absolute top-0 left-10 right-0 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl transform rotate-[-6deg] hover:rotate-[-3deg] transition-transform duration-500">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-white/20"></div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-white/20 rounded"></div>
                  <div className="h-2 w-16 bg-white/10 rounded"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-white/10 rounded"></div>
                <div className="h-2 w-5/6 bg-white/10 rounded"></div>
                <div className="h-2 w-4/6 bg-white/10 rounded"></div>
              </div>
            </div>

            {/* Abstract UI representation - Solid Card */}
            <div className="absolute top-16 right-10 left-0 bg-white rounded-2xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform rotate-[3deg] hover:rotate-[6deg] transition-transform duration-500">
              <div className="flex justify-between items-center mb-6">
                <div className="font-bold text-gray-900">Project Success</div>
                <div className="text-emerald-500 font-bold bg-emerald-50 px-2 py-1 rounded text-sm">+24%</div>
              </div>
              <div className="flex items-end gap-3 h-32">
                <div className="w-1/5 bg-primary-100 rounded-t-lg h-[40%]"></div>
                <div className="w-1/5 bg-primary-200 rounded-t-lg h-[60%]"></div>
                <div className="w-1/5 bg-primary-300 rounded-t-lg h-[50%]"></div>
                <div className="w-1/5 bg-primary-400 rounded-t-lg h-[80%]"></div>
                <div className="w-1/5 bg-gradient-to-t from-primary-600 to-primary-500 rounded-t-lg h-[100%] shadow-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;