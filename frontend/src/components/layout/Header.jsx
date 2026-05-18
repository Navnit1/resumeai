// src/components/layout/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Header() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  return (
    <header className="h-14 bg-dark-200 border-b border-dark-500 flex items-center justify-between px-6 flex-shrink-0">
      <div className="text-sm text-gray-400">
        Welcome back, <span className="text-white font-medium">{user?.name?.split(' ')[0]}</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/resumes/new')}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-all hover:-translate-y-px"
        >
          <span>+</span>
          <span>New Resume</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-xs font-bold cursor-pointer" onClick={() => navigate('/profile')}>
          {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
      </div>
    </header>
  );
}
