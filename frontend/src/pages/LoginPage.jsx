// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { loginUser, clearError } from '../store/slices/authSlice';
import { Button, Input } from '../components/common';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const res = await dispatch(loginUser(form));
    if (res.payload?.user) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Sign in</h2>
      <p className="text-sm text-gray-400 mb-6">Welcome back to NextRole AI</p>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
        <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-brand-400 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" variant="primary" className="w-full justify-center py-2.5" loading={loading}>Sign In</Button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-5">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-400 hover:underline font-medium">Sign up free</Link>
      </p>
      <div className="mt-4 p-3 bg-dark-400 rounded-lg text-xs text-gray-500">
        <strong className="text-gray-400">Demo:</strong> Use any email + 8+ char password to sign in
      </div>
    </div>
  );
}
