// src/components/layout/AuthLayout.jsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-lg">⚡</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">NextRole AI</h1>
          </div>
          <p className="text-gray-400 text-sm">Intelligent Resume Builder & ATS Optimizer</p>
        </div>
        <div className="bg-dark-200 border border-dark-500 rounded-2xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
