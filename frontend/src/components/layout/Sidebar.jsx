// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { toggleSidebar, closeMobileMenu } from '../../store/slices/uiSlice';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/resumes', icon: '📄', label: 'My Resumes' },
  { to: '/resumes/new', icon: '✏️', label: 'Builder' },
  null, // divider
  { to: '/ats-checker', icon: '🎯', label: 'ATS Checker' },
  { to: '/ai-generator', icon: '⚡', label: 'AI Generator' },
  { to: '/jobs', icon: '💼', label: 'Job Recommendations' },
  null,
  { to: '/profile', icon: '👤', label: 'Profile' },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sidebarOpen, mobileMenuOpen } = useSelector((s) => s.ui);
  const { user } = useSelector((s) => s.auth);
  const { list } = useSelector((s) => s.resumes);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleNavClick = () => {
    dispatch(closeMobileMenu());
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <>
      {/* Mobile backdrop — tapping it closes the menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => dispatch(closeMobileMenu())}
        />
      )}

      <aside className={`fixed top-0 left-0 h-full bg-dark-200 border-r border-dark-500 flex flex-col z-40 transition-all duration-300
        ${sidebarOpen ? 'w-60' : 'w-16'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-dark-500">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-sm font-bold flex-shrink-0">⚡</div>
          {sidebarOpen && (
            <div>
              <div className="font-bold text-sm bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">NextRole AI</div>
              <div className="text-xs text-gray-500">Intelligent Builder</div>
            </div>
          )}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="ml-auto text-gray-500 hover:text-white transition-colors hidden md:block"
            title="Toggle sidebar"
          >
            {sidebarOpen ? '◂' : '▸'}
          </button>
          <button
            onClick={() => dispatch(closeMobileMenu())}
            className="ml-auto text-gray-500 hover:text-white transition-colors md:hidden"
            title="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV_ITEMS.map((item, i) => {
            if (!item) return <div key={i} className="my-2 mx-3 border-t border-dark-500" />;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/resumes/new'}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                      : 'text-gray-400 hover:bg-dark-400 hover:text-white'
                  }`
                }
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <span className="flex-1 font-medium">{item.label}</span>
                )}
                {sidebarOpen && item.to === '/resumes' && list.length > 0 && (
                  <span className="text-xs bg-brand-500 text-white px-1.5 py-0.5 rounded-full">{list.length}</span>
                )}
              </NavLink>
            );
          })}

          {/* Admin link */}
          {user?.role === 'admin' && (
            <NavLink
              to="/admin"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all ${
                  isActive ? 'bg-red-500/10 text-red-400' : 'text-gray-400 hover:bg-dark-400 hover:text-white'
                }`
              }
            >
              <span className="text-base flex-shrink-0">🛡️</span>
              {sidebarOpen && <span className="font-medium">Admin Panel</span>}
            </NavLink>
          )}
        </nav>

        {/* User + Logout */}
        <div className="p-3 border-t border-dark-500">
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-dark-400 cursor-pointer transition-all" onClick={() => { navigate('/profile'); handleNavClick(); }}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.plan || 'free'} plan</div>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                className="text-gray-500 hover:text-red-400 transition-colors text-xs"
                title="Logout"
              >
                ⏻
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}