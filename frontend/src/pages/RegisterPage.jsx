// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { registerUser, clearError } from '../store/slices/authSlice';
import { Button, Input } from '../components/common';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    const res = await dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
    if (res.payload?.user) { toast.success('Account created! Welcome to NextRole AI 🎉'); navigate('/dashboard'); }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Create account</h2>
      <p className="text-sm text-gray-400 mb-6">Start building AI-powered resumes</p>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
        <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 characters" required />
        <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat password" required />
        <Button type="submit" variant="primary" className="w-full justify-center py-2.5" loading={loading}>Create Account</Button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-5">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  );
}
