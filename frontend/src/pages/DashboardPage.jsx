// src/pages/DashboardPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchResumes } from '../store/slices/resumeSlice';
import { StatCard, Card, ScoreRing, ProgressBar, PageHeader, Button, AIPanel } from '../components/common';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading } = useSelector((s) => s.resumes);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => { dispatch(fetchResumes()); }, [dispatch]);

  const avgScore = list.length > 0 ? Math.round(list.reduce((a, r) => a + (r.atsAnalysis?.score || 0), 0) / list.length) : 0;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'} 👋`}
        subtitle="Here's your resume activity overview"
        actions={<Button variant="primary" onClick={() => navigate('/resumes/new')}>+ New Resume</Button>}
      />
      <div className="p-7 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon="📄" label="Total Resumes" value={list.length} change="+2 this month" color="purple" />
          <StatCard icon="🎯" label="Avg ATS Score" value={`${avgScore}`} change="Platform avg: 74" color="green" />
          <StatCard icon="⬇" label="Downloads" value="12" change="Last 30 days" color="cyan" />
          <StatCard icon="⚡" label="AI Generations" value={user?.stats?.aiGenerations || 0} change="Total uses" color="amber" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Recent Resumes */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-sm">Recent Resumes</h2>
              <Button size="sm" variant="ghost" onClick={() => navigate('/resumes')}>View All →</Button>
            </div>
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : list.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No resumes yet.<br />
                <button className="text-brand-400 hover:underline mt-2" onClick={() => navigate('/resumes/new')}>Create your first resume →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {list.slice(0, 4).map((r) => (
                  <div key={r._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-400 cursor-pointer transition-all" onClick={() => navigate(`/resumes/${r._id}`)}>
                    <div className="w-8 h-8 bg-brand-500/20 rounded-lg flex items-center justify-center text-base">📄</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{r.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{r.template} · {new Date(r.updatedAt).toLocaleDateString()}</div>
                    </div>
                    <ScoreChip score={r.atsAnalysis?.score || 0} />
                  </div>
                ))}
              </div>
            )}
            <Button variant="secondary" size="sm" className="w-full justify-center mt-4" onClick={() => navigate('/resumes/new')}>
              + Create New Resume
            </Button>
          </Card>

          {/* ATS Overview + AI Quick Actions */}
          <div className="space-y-4">
            <Card>
              <h2 className="font-bold text-sm mb-3">ATS Score Breakdown</h2>
              {list.slice(0, 3).map((r) => {
                const score = r.atsAnalysis?.score || 0;
                const color = score >= 80 ? 'green' : score >= 60 ? 'amber' : 'red';
                return (
                  <div key={r._id} className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400 truncate max-w-[60%]">{r.name}</span>
                      <span className="font-semibold" style={{ color: score >= 80 ? '#00E580' : score >= 60 ? '#FFB340' : '#FF5577' }}>
                        {score}/100
                      </span>
                    </div>
                    <ProgressBar value={score} color={color} />
                  </div>
                );
              })}
              {list.length === 0 && <p className="text-xs text-gray-500">No resumes to analyze yet.</p>}
            </Card>

            <AIPanel title="AI Quick Actions" subtitle="Powered by GPT-4">
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { label: '✨ Generate Summary', path: '/ai-generator' },
                  { label: '🎯 ATS Keywords', path: '/ats-checker' },
                  { label: '📝 Bullet Points', path: '/ai-generator' },
                  { label: '💡 Improve Content', path: '/ai-generator' },
                ].map((a) => (
                  <button key={a.label} className="bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs px-3 py-1.5 rounded-full hover:bg-brand-500/25 transition-all" onClick={() => navigate(a.path)}>
                    {a.label}
                  </button>
                ))}
              </div>
            </AIPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreChip({ score }) {
  const color = score >= 80 ? '#00E580' : score >= 60 ? '#FFB340' : score > 0 ? '#FF5577' : '#6B7280';
  const bg = score >= 80 ? 'rgba(0,229,128,.15)' : score >= 60 ? 'rgba(255,179,64,.15)' : score > 0 ? 'rgba(255,85,119,.15)' : 'rgba(107,114,128,.15)';
  return <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, background: bg }}>{score || '—'}</span>;
}
