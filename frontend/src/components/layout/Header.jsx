// src/components/layout/Header.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleMobileMenu } from '../../store/slices/uiSlice';

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  return (
    <header className="h-14 bg-dark-200 border-b border-dark-500 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center gap-3 text-sm text-gray-400 min-w-0">
        <button
          onClick={() => dispatch(toggleMobileMenu())}
          className="md:hidden text-xl text-gray-400 hover:text-white flex-shrink-0"
        >
          ☰
        </button>
        <span className="truncate">
          Welcome back, <span className="text-white font-medium">{user?.name?.split(' ')[0]}</span>
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate('/resumes/new')}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-3 md:px-4 py-1.5 rounded-lg transition-all hover:-translate-y-px"
        >
          <span>+</span>
          <span className="hidden sm:inline">New Resume</span>
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-xs font-bold cursor-pointer flex-shrink-0" onClick={() => navigate('/profile')}>
          {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
      </div>
    </header>
  );
}