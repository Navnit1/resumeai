// src/pages/ResumesPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchResumes, deleteResume, duplicateResume, exportPDF } from '../store/slices/resumeSlice';
import { PageHeader, Button, Badge, EmptyState, ScoreRing } from '../components/common';

export default function ResumesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, loading, pdfLoading } = useSelector((s) => s.resumes);
  const [search, setSearch] = useState('');

  useEffect(() => { dispatch(fetchResumes()); }, [dispatch]);

  const filtered = list.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await dispatch(deleteResume(id));
    toast.success('Resume deleted');
  };

  const handleDuplicate = async (id) => {
    await dispatch(duplicateResume(id));
    toast.success('Resume duplicated!');
  };

  return (
    <div>
      <PageHeader
        title="My Resumes"
        subtitle={`${list.length} resume${list.length !== 1 ? 's' : ''} saved`}
        actions={
          <>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search resumes..."
              className="bg-dark-400 border border-dark-500 text-white text-sm rounded-lg px-3 py-2 w-52 focus:outline-none focus:border-brand-500"
            />
            <Button variant="primary" onClick={() => navigate('/resumes/new')}>+ New Resume</Button>
          </>
        }
      />
      <div className="p-7">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 && list.length === 0 ? (
          <EmptyState
            icon="📄"
            title="No resumes yet"
            description="Create your first resume using our AI-powered builder"
            action={<Button variant="primary" onClick={() => navigate('/resumes/new')}>Create Your First Resume</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((resume) => (
              <ResumeCard
                key={resume._id}
                resume={resume}
                onView={() => navigate(`/resumes/${resume._id}`)}
                onEdit={() => navigate(`/resumes/${resume._id}/edit`)}
                onDelete={() => handleDelete(resume._id, resume.name)}
                onDuplicate={() => handleDuplicate(resume._id)}
                onDownload={() => dispatch(exportPDF(resume._id))}
                pdfLoading={pdfLoading}
              />
            ))}
            {/* New Resume Card */}
            <div
              onClick={() => navigate('/resumes/new')}
              className="border-2 border-dashed border-dark-500 hover:border-brand-500 rounded-xl flex flex-col items-center justify-center min-h-[280px] cursor-pointer transition-all hover:bg-brand-500/5 group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">+</div>
              <div className="text-sm font-semibold text-gray-400 group-hover:text-brand-400 transition-colors">New Resume</div>
              <div className="text-xs text-gray-600 mt-1">AI-powered builder</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResumeCard({ resume, onView, onEdit, onDelete, onDuplicate, onDownload }) {
  const score = resume.atsAnalysis?.score || 0;

  return (
    <div className="bg-dark-100 border border-dark-500 rounded-xl overflow-hidden hover:border-brand-500/50 hover:-translate-y-1 transition-all group cursor-pointer" onClick={onView}>
      {/* Preview thumbnail */}
      <div className="h-44 bg-dark-300 relative flex items-center justify-center overflow-hidden">
        <div className="bg-white rounded shadow-lg p-3 w-28 transform scale-90 group-hover:scale-95 transition-transform">
          <div className="h-2 bg-indigo-600 rounded mb-1.5 w-full" />
          <div className="h-1 bg-gray-200 rounded mb-1 w-3/4" />
          <div className="h-1 bg-gray-200 rounded mb-2 w-1/2" />
          {[85, 70, 90, 60, 80].map((w, i) => (
            <div key={i} className="h-0.5 bg-gray-100 rounded mb-1" style={{ width: `${w}%` }} />
          ))}
        </div>
        {/* Score badge */}
        <div className="absolute top-2 right-2">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              color: score >= 80 ? '#00E580' : score >= 60 ? '#FFB340' : score > 0 ? '#FF5577' : '#6B7280',
              background: score >= 80 ? 'rgba(0,229,128,.15)' : score >= 60 ? 'rgba(255,179,64,.15)' : score > 0 ? 'rgba(255,85,119,.15)' : 'rgba(107,114,128,.15)',
            }}>
            {score > 0 ? `${score}/100` : 'Unscored'}
          </span>
        </div>
        <Badge variant="purple" className="absolute bottom-2 left-2 capitalize">{resume.template}</Badge>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-sm mb-1 truncate">{resume.name}</h3>
        <p className="text-xs text-gray-500 mb-3">Updated {new Date(resume.updatedAt).toLocaleDateString()}</p>
        <div className="flex gap-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="secondary" onClick={onEdit}>Edit</Button>
          <Button size="sm" variant="ghost" onClick={onDuplicate}>Copy</Button>
          <Button size="sm" variant="ghost" onClick={onDownload}>⬇</Button>
          <Button size="sm" variant="danger" onClick={onDelete}>🗑</Button>
        </div>
      </div>
    </div>
  );
}
