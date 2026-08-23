// src/pages/JobRecommendationsPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchResumes } from '../store/slices/resumeSlice';
import {
  searchJobs,
  recommendFromUpload,
  recommendFromSavedResume,
  clearJobResults,
} from '../store/slices/jobSlice';
import { PageHeader, Card, Button, Badge, Input, Select } from '../components/common';

const COUNTRIES = [
  { code: 'in', label: 'India' },
  { code: 'us', label: 'United States' },
  { code: 'gb', label: 'United Kingdom' },
  { code: 'ca', label: 'Canada' },
  { code: 'au', label: 'Australia' },
  { code: 'de', label: 'Germany' },
  { code: 'sg', label: 'Singapore' },
];

const MODES = [
  { id: 'saved', label: '📄 Use a saved resume' },
  { id: 'upload', label: '⬆️ Upload a resume' },
  { id: 'manual', label: '⌨️ Search by role' },
];

function formatSalary(min, max) {
  if (!min && !max) return null;
  const fmt = (n) => `₹${(n / 100000).toFixed(1)}L`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min || max);
}

function JobCard({ job }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  return (
    <Card className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm text-white">{job.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{job.company} · {job.location}</p>
        </div>
        {salary && <Badge variant="green">{salary}</Badge>}
      </div>
      {job.description && (
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">{job.description}…</p>
      )}
      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-1.5">
          {job.contractType && <Badge variant="cyan">{job.contractType}</Badge>}
          {job.category && <Badge>{job.category}</Badge>}
        </div>
        <a href={job.url} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="secondary">Apply →</Button>
        </a>
      </div>
    </Card>
  );
}

export default function JobRecommendationsPage() {
  const dispatch = useDispatch();
  const { list: resumes } = useSelector((s) => s.resumes);
  const { results, count, profile, loading, error } = useSelector((s) => s.jobs);

  const [mode, setMode] = useState('saved');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [file, setFile] = useState(null);
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('in');
  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchResumes());
    return () => dispatch(clearJobResults());
  }, [dispatch]);

  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) setSelectedResumeId(resumes[0]._id);
  }, [resumes, selectedResumeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'saved') {
      if (!selectedResumeId) return toast.error('Pick a resume first');
      const res = await dispatch(
        recommendFromSavedResume({ resumeId: selectedResumeId, location, country, targetRole: role })
      );
      if (recommendFromSavedResume.rejected.match(res)) toast.error(res.payload);
    } else if (mode === 'upload') {
      if (!file) return toast.error('Upload a PDF or TXT resume first');
      const res = await dispatch(recommendFromUpload({ file, location, country, targetRole: role }));
      if (recommendFromUpload.rejected.match(res)) toast.error(res.payload);
    } else {
      if (!role) return toast.error('Enter a job title or role');
      const res = await dispatch(searchJobs({ role, location, country }));
      if (searchJobs.rejected.match(res)) toast.error(res.payload);
    }
  };

  return (
    <div>
      <PageHeader
        title="Job Recommendations"
        subtitle="Match your resume to open roles, anywhere"
      />

      <div className="p-7 space-y-6">
        {/* Mode switcher */}
        <div className="flex gap-2 flex-wrap">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                mode === m.id
                  ? 'bg-brand-500/10 text-brand-400 border-brand-500/30'
                  : 'text-gray-400 border-dark-500 hover:text-white hover:bg-dark-400'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'saved' && (
              <Select
                label="Resume"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
              >
                {resumes.length === 0 && <option value="">No saved resumes yet</option>}
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </Select>
            )}

            {mode === 'upload' && (
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-400">Resume file (PDF or TXT)</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-dark-500 rounded-lg px-4 py-6 text-center cursor-pointer hover:border-brand-500/50 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,application/pdf,text/plain"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-gray-400">
                    {file ? `📎 ${file.name}` : 'Click to choose a file — max 5MB'}
                  </p>
                </div>
              </div>
            )}

            {(mode === 'manual' || mode === 'upload' || mode === 'saved') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label={mode === 'manual' ? 'Job title / role' : 'Target role (optional)'}
                  placeholder="e.g. Frontend Developer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required={mode === 'manual'}
                />
                <Input
                  label="City / location (optional)"
                  placeholder="e.g. Bangalore"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <Select label="Country" value={country} onChange={(e) => setCountry(e.target.value)}>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </Select>
              </div>
            )}

            <Button type="submit" loading={loading}>
              {loading ? 'Finding jobs…' : '🔍 Find matching jobs'}
            </Button>
          </form>
        </Card>

        {/* Extracted profile */}
        {profile && (
          <Card className="bg-brand-500/5 border-brand-500/20">
            <p className="text-xs text-gray-400 mb-2">Searching for</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="purple">{profile.role}</Badge>
              {profile.seniority && <Badge>{profile.seniority}</Badge>}
              {profile.location && <Badge variant="cyan">📍 {profile.location}</Badge>}
              {profile.keywords?.slice(0, 6).map((k) => (
                <Badge key={k} variant="default">{k}</Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Results */}
        {error && <p className="text-sm text-red-400">{error}</p>}

        {results.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-3">{count.toLocaleString()} matching roles found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {results.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && results.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-10">
            No results yet — pick a resume or role above and hit "Find matching jobs".
          </p>
        )}
      </div>
    </div>
  );
}
