// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center text-center">
      <div>
        <div className="text-8xl font-black text-dark-500 mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="bg-brand-500 hover:bg-brand-600 text-white font-medium px-6 py-2.5 rounded-lg transition-all inline-block">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
