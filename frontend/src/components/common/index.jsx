// src/components/common/index.jsx
import React from 'react';

// ─── Button ───────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white hover:-translate-y-px',
    secondary: 'bg-dark-400 hover:bg-dark-500 text-white border border-dark-500',
    ghost: 'bg-transparent hover:bg-dark-400 text-gray-300 hover:text-white border border-dark-500',
    danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30',
    success: 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2',
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading} {...props}>
      {loading ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-dark-100 border border-dark-500 rounded-xl p-5 ${hover ? 'hover:border-brand-500/50 hover:-translate-y-1 transition-all cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-500/20 text-gray-400',
    purple: 'bg-brand-500/20 text-brand-300',
    green: 'bg-green-500/20 text-green-400',
    amber: 'bg-amber-500/20 text-amber-400',
    red: 'bg-red-500/20 text-red-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-gray-400">{label}</label>}
      <input
        className={`w-full bg-dark-400 border ${error ? 'border-red-500' : 'border-dark-500'} text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ label, error, className = '', rows = 4, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-gray-400">{label}</label>}
      <textarea
        rows={rows}
        className={`w-full bg-dark-400 border ${error ? 'border-red-500' : 'border-dark-500'} text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 transition-colors resize-y ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-xs font-medium text-gray-400">{label}</label>}
      <select
        className={`w-full bg-dark-400 border ${error ? 'border-red-500' : 'border-dark-500'} text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500 transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
export function ScoreRing({ score, size = 100 }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#00E580' : score >= 60 ? '#FFB340' : '#FF5577';

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#22223A" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold leading-none" style={{ fontSize: size * 0.22, color }}>{score}</span>
        <span className="text-gray-500 uppercase tracking-wide" style={{ fontSize: size * 0.09 }}>/ 100</span>
      </div>
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = 'purple', className = '' }) {
  const colors = {
    purple: 'from-brand-500 to-brand-400',
    green: 'from-green-600 to-green-400',
    amber: 'from-amber-600 to-amber-400',
    red: 'from-red-600 to-red-400',
    cyan: 'from-cyan-600 to-cyan-400',
  };
  return (
    <div className={`h-1.5 bg-dark-400 rounded-full overflow-hidden ${className}`}>
      <div
        className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-700`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className={`bg-dark-200 border border-dark-500 rounded-2xl w-full ${sizes[size]} max-h-[85vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-dark-500">
          <h2 className="font-bold text-base">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-lg">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-xs">{description}</p>
      {action}
    </div>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4 border', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-2' };
  return <div className={`${sizes[size]} border-brand-500 border-t-transparent rounded-full animate-spin`} />;
}

// ─── AI Panel ─────────────────────────────────────────────────────────────────
export function AIPanel({ title, subtitle, children }) {
  return (
    <div className="bg-gradient-to-br from-brand-500/8 to-cyan-500/5 border border-brand-500/20 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-sm flex-shrink-0">⚡</div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── AI Response Box ──────────────────────────────────────────────────────────
export function AIResponse({ loading, content, error }) {
  if (loading) return (
    <div className="bg-dark-300 border border-dark-500 rounded-lg p-3 mt-3 flex items-center gap-2 text-gray-400 text-sm">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      Generating with AI...
    </div>
  );
  if (error) return <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mt-3 text-sm">{error}</div>;
  if (!content) return null;
  return (
    <div className="bg-dark-300 border border-dark-500 rounded-lg p-3 mt-3 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
      {content}
    </div>
  );
}

// ─── Page Header ─────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="bg-dark-200 border-b border-dark-500 px-7 py-5 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ icon, label, value, change, color = 'purple' }) {
  const colors = {
    purple: 'from-brand-500/20 to-brand-500/5',
    green: 'from-green-500/20 to-green-500/5',
    cyan: 'from-cyan-500/20 to-cyan-500/5',
    amber: 'from-amber-500/20 to-amber-500/5',
  };
  const textColors = { purple: 'text-brand-400', green: 'text-green-400', cyan: 'text-cyan-400', amber: 'text-amber-400' };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border border-dark-500 rounded-xl p-4`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${textColors[color]}`}>{value}</div>
      {change && <div className="text-xs text-gray-500 mt-1">{change}</div>}
    </div>
  );
}
