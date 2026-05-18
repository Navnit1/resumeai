// src/pages/AdminPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { PageHeader, Card, Button, Badge, StatCard, ProgressBar } from '../components/common';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

export default function AdminPage() {
  const [tab, setTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [analyticsRes, usersRes, resumesRes] = await Promise.all([
          api.get('/admin/analytics'),
          api.get('/admin/users'),
          api.get('/admin/resumes'),
        ]);
        setAnalytics(analyticsRes.data.analytics);
        setUsers(usersRes.data.users);
        setResumes(resumesRes.data.resumes);
      } catch (err) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggleUser = async (userId, currentStatus) => {
    try {
      await api.post(`/admin/users/${userId}/toggle-status`);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isActive: !currentStatus } : u));
      toast.success(`User ${currentStatus ? 'suspended' : 'activated'}`);
    } catch { toast.error('Action failed'); }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}" and all their resumes?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User deleted');
    } catch { toast.error('Delete failed'); }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = ['overview', 'users', 'resumes', 'analytics'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totals = analytics?.totals || {};
  const monthlyData = (analytics?.monthlyResumes || []).map((m) => ({
    name: `${m._id.month}/${m._id.year}`,
    resumes: m.count,
  }));

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform management and analytics"
        actions={<Button variant="secondary" onClick={() => toast.success('Report exported!')}>📊 Export Report</Button>}
      />
      <div className="p-7">
        {/* Tabs */}
        <div className="flex border-b border-dark-500 mb-6">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium capitalize border-b-2 transition-all -mb-px ${
                tab === t ? 'border-brand-500 text-brand-400' : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <StatCard icon="👥" label="Total Users" value={totals.users || 0} change="+12 this week" color="purple" />
              <StatCard icon="📄" label="Total Resumes" value={totals.resumes || 0} change="+47 today" color="green" />
              <StatCard icon="⚡" label="AI Generations" value={totals.aiGenerations || 0} change="Last 30 days" color="cyan" />
              <StatCard icon="🎯" label="Avg ATS Score" value={`${totals.avgATSScore || 0}`} change="Platform average" color="amber" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <h3 className="font-bold text-sm mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map((u) => (
                    <div key={u._id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {u.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{u.name}</div>
                        <div className="text-xs text-gray-500 truncate">{u.email}</div>
                      </div>
                      <Badge variant={u.plan === 'pro' ? 'purple' : u.plan === 'enterprise' ? 'cyan' : 'amber'}>{u.plan}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h3 className="font-bold text-sm mb-4">Plan Distribution</h3>
                <div className="space-y-3">
                  {[
                    ['Free', analytics?.planDistribution?.free || 0, 'amber'],
                    ['Pro', analytics?.planDistribution?.pro || 0, 'purple'],
                    ['Enterprise', analytics?.planDistribution?.enterprise || 0, 'cyan'],
                  ].map(([plan, count, color]) => {
                    const total = totals.users || 1;
                    return (
                      <div key={plan}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">{plan}</span>
                          <span>{count} ({Math.round((count / total) * 100)}%)</span>
                        </div>
                        <ProgressBar value={(count / total) * 100} color={color} />
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-sm">All Users ({filteredUsers.length})</h2>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Search users..."
                className="bg-dark-400 border border-dark-500 text-white text-sm rounded-lg px-3 py-2 w-52 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-500">
                    {['User', 'Role', 'Plan', 'Resumes', 'Joined', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left py-3 px-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="border-b border-dark-500/50 hover:bg-dark-400 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {u.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-xs">{u.name}</div>
                            <div className="text-gray-500 text-xs">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2"><Badge variant={u.role === 'admin' ? 'red' : 'purple'}>{u.role}</Badge></td>
                      <td className="py-3 px-2"><Badge variant={u.plan === 'pro' ? 'green' : u.plan === 'enterprise' ? 'cyan' : 'amber'}>{u.plan}</Badge></td>
                      <td className="py-3 px-2 text-gray-400 text-xs">{u.stats?.resumesCreated || 0}</td>
                      <td className="py-3 px-2 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-2"><Badge variant={u.isActive ? 'green' : 'red'}>{u.isActive ? 'Active' : 'Suspended'}</Badge></td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          <Button size="sm" variant={u.isActive ? 'danger' : 'success'} onClick={() => handleToggleUser(u._id, u.isActive)}>
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => handleDeleteUser(u._id, u.name)}>Del</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Resumes Tab */}
        {tab === 'resumes' && (
          <Card>
            <h2 className="font-bold text-sm mb-4">All Resumes ({resumes.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-dark-500">
                    {['Resume', 'Owner', 'Template', 'ATS Score', 'Downloads', 'Updated'].map((h) => (
                      <th key={h} className="text-left py-3 px-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resumes.slice(0, 20).map((r) => {
                    const score = r.atsAnalysis?.score || 0;
                    return (
                      <tr key={r._id} className="border-b border-dark-500/50 hover:bg-dark-400 transition-colors">
                        <td className="py-3 px-2 font-medium text-xs">📄 {r.name}</td>
                        <td className="py-3 px-2 text-gray-400 text-xs">{r.user?.name || '—'}</td>
                        <td className="py-3 px-2"><Badge variant="purple" className="capitalize">{r.template}</Badge></td>
                        <td className="py-3 px-2">
                          <span className="text-xs font-bold" style={{ color: score >= 80 ? '#00E580' : score >= 60 ? '#FFB340' : score > 0 ? '#FF5577' : '#6B7280' }}>
                            {score > 0 ? `${score}/100` : '—'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-400 text-xs">{r.downloads || 0}</td>
                        <td className="py-3 px-2 text-gray-400 text-xs">{new Date(r.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Analytics Tab */}
        {tab === 'analytics' && (
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <h3 className="font-bold text-sm mb-4">Resume Creations (Monthly)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A45" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#12121A', border: '1px solid #2A2A45', borderRadius: 8 }} />
                  <Bar dataKey="resumes" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <h3 className="font-bold text-sm mb-4">AI Feature Usage</h3>
              <div className="space-y-3">
                {[
                  ['Summary Generation', 480, 38],
                  ['Bullet Point Gen', 380, 30],
                  ['ATS Analysis', 250, 20],
                  ['Keyword Extract', 130, 10],
                  ['Content Optimizer', 20, 2],
                ].map(([label, count, pct]) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-gray-500">{count} uses · {pct}%</span>
                    </div>
                    <ProgressBar value={pct} color="purple" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
