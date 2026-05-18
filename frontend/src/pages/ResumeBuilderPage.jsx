// src/pages/ResumeBuilderPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  fetchResume, createResume, updateResume, exportPDF,
  setEditing, updateEditing, startNewResume,
} from '../store/slices/resumeSlice';
import {
  generateSummary, generateBullets, suggestSkills,
} from '../store/slices/aiSlice';
import {
  Button, Input, Textarea, Select, AIPanel, AIResponse, PageHeader,
} from '../components/common';
import ResumePaper from '../components/resume/ResumePaper';

const TABS = ['Personal', 'Experience', 'Education', 'Skills', 'Projects', 'Preview'];

export default function ResumeBuilderPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { editing, saving, pdfLoading } = useSelector((s) => s.resumes);
  const { loading: aiLoading, results: aiResults, error: aiError } = useSelector((s) => s.ai);
  const [tab, setTab] = useState(0);
  const [aiTarget, setAiTarget] = useState(null);
  const isNew = !id;

  // Load or init resume
  useEffect(() => {
    if (id) {
      dispatch(fetchResume(id)).then((res) => {
        if (res.payload?.resume) dispatch(setEditing(res.payload.resume));
      });
    } else {
      dispatch(startNewResume());
    }
  }, [id, dispatch]);

  const d = editing || {};
  const update = useCallback((patch) => dispatch(updateEditing(patch)), [dispatch]);

  const updatePersonal = (field, value) =>
    update({ personal: { ...d.personal, [field]: value } });

  const updateExp = (idx, field, value) => {
    const exp = [...(d.experience || [])];
    exp[idx] = { ...exp[idx], [field]: value };
    update({ experience: exp });
  };

  const updateExpBullets = (idx, text) => {
    const exp = [...(d.experience || [])];
    exp[idx] = { ...exp[idx], bullets: text.split('\n').filter(Boolean) };
    update({ experience: exp });
  };

  const addExp = () =>
    update({ experience: [...(d.experience || []), { company: '', title: '', dates: '', bullets: [] }] });

  const removeExp = (idx) =>
    update({ experience: (d.experience || []).filter((_, i) => i !== idx) });

  const updateEdu = (idx, field, value) => {
    const edu = [...(d.education || [])];
    edu[idx] = { ...edu[idx], [field]: value };
    update({ education: edu });
  };

  const addEdu = () =>
    update({ education: [...(d.education || []), { school: '', degree: '', dates: '', gpa: '' }] });

  const removeEdu = (idx) =>
    update({ education: (d.education || []).filter((_, i) => i !== idx) });

  const updateProject = (idx, field, value) => {
    const projects = [...(d.projects || [])];
    projects[idx] = { ...projects[idx], [field]: value };
    update({ projects });
  };

  const addProject = () =>
    update({ projects: [...(d.projects || []), { name: '', description: '', link: '' }] });

  const removeProject = (idx) =>
    update({ projects: (d.projects || []).filter((_, i) => i !== idx) });

  const handleSave = async () => {
    if (!d.name || !d.personal?.name) {
      toast.error('Resume name and your name are required');
      return;
    }
    if (isNew || !d._id) {
      const res = await dispatch(createResume(d));
      if (res.payload?.resume) {
        toast.success('Resume created!');
        navigate(`/resumes/${res.payload.resume._id}/edit`, { replace: true });
      }
    } else {
      const res = await dispatch(updateResume({ id: d._id, updates: d }));
      if (res.payload?.resume) toast.success('Resume saved!');
    }
  };

  const handleExportPDF = async () => {
    if (!d._id) { await handleSave(); }
    if (d._id) dispatch(exportPDF(d._id));
  };

  const runAI = async (type, expIdx = null) => {
    setAiTarget({ type, expIdx });
    const p = d.personal || {};
    if (type === 'summary') {
      await dispatch(generateSummary({
        jobTitle: p.title || 'Professional',
        yearsOfExperience: d.experience?.length > 0 ? '5' : '2',
        skills: d.skills,
        achievements: d.experience?.[0]?.bullets?.[0] || '',
      }));
    } else if (type === 'bullets' && expIdx !== null) {
      const exp = d.experience[expIdx];
      await dispatch(generateBullets({
        jobTitle: exp.title || 'Professional',
        company: exp.company || '',
        responsibilities: `${exp.title} responsibilities at ${exp.company}`,
        count: 4,
      }));
    } else if (type === 'skills') {
      await dispatch(suggestSkills({
        jobTitle: p.title || 'Professional',
        currentSkills: d.skills,
      }));
    }
  };

  const applyAIResult = (type, expIdx = null) => {
    if (type === 'summary' && aiResults.generateSummary) {
      update({ summary: aiResults.generateSummary });
      toast.success('Summary applied!');
    } else if (type === 'bullets' && aiResults.generateBullets && expIdx !== null) {
      updateExpBullets(expIdx, aiResults.generateBullets.join('\n'));
      toast.success('Bullets applied!');
    } else if (type === 'skills' && aiResults.suggestSkills) {
      const newSkills = [...new Set([...(d.skills || []), ...aiResults.suggestSkills])];
      update({ skills: newSkills });
      toast.success('Skills added!');
    }
  };

  if (!editing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title={isNew ? 'New Resume' : `Edit: ${d.name || 'Resume'}`}
        subtitle="Build and preview your resume in real-time"
        actions={
          <>
            <Select value={d.template || 'modern'} onChange={(e) => update({ template: e.target.value })} className="w-36">
              <option value="modern">Modern</option>
              <option value="classic">Classic</option>
              <option value="minimal">Minimal</option>
              <option value="executive">Executive</option>
            </Select>
            <Input
              value={d.name || ''}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="Resume name"
              className="w-44"
            />
            <Button variant="secondary" onClick={handleSave} loading={saving}>💾 Save</Button>
            <Button variant="primary" onClick={handleExportPDF} loading={pdfLoading}>⬇ PDF</Button>
          </>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Form Panel */}
        <div className="w-1/2 border-r border-dark-500 flex flex-col overflow-hidden bg-dark-200">
          {/* Tabs */}
          <div className="flex border-b border-dark-500 overflow-x-auto flex-shrink-0">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(i)}
                className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  tab === i ? 'border-brand-500 text-brand-400' : 'border-transparent text-gray-500 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* ── Personal Tab ── */}
            {tab === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Full Name *" value={d.personal?.name || ''} onChange={(e) => updatePersonal('name', e.target.value)} placeholder="John Doe" />
                  <Input label="Professional Title" value={d.personal?.title || ''} onChange={(e) => updatePersonal('title', e.target.value)} placeholder="Senior Engineer" />
                  <Input label="Email" type="email" value={d.personal?.email || ''} onChange={(e) => updatePersonal('email', e.target.value)} placeholder="you@email.com" />
                  <Input label="Phone" value={d.personal?.phone || ''} onChange={(e) => updatePersonal('phone', e.target.value)} placeholder="+1 555-0100" />
                  <Input label="Location" value={d.personal?.location || ''} onChange={(e) => updatePersonal('location', e.target.value)} placeholder="San Francisco, CA" />
                  <Input label="LinkedIn" value={d.personal?.linkedin || ''} onChange={(e) => updatePersonal('linkedin', e.target.value)} placeholder="linkedin.com/in/..." />
                  <Input label="GitHub / Portfolio" value={d.personal?.github || ''} onChange={(e) => updatePersonal('github', e.target.value)} placeholder="github.com/..." />
                </div>
                <Textarea
                  label="Professional Summary"
                  value={d.summary || ''}
                  onChange={(e) => update({ summary: e.target.value })}
                  rows={4}
                  placeholder="Compelling 3-4 sentence professional summary..."
                />
                <AIPanel title="AI Summary Generator" subtitle="Generate a tailored summary">
                  <Button size="sm" variant="ghost" onClick={() => runAI('summary')} loading={aiLoading && aiTarget?.type === 'summary'}>
                    ⚡ Generate Summary
                  </Button>
                  <AIResponse
                    loading={aiLoading && aiTarget?.type === 'summary'}
                    content={aiResults.generateSummary}
                    error={aiError}
                  />
                  {aiResults.generateSummary && (
                    <Button size="sm" variant="success" className="mt-2" onClick={() => applyAIResult('summary')}>
                      ✓ Apply to Resume
                    </Button>
                  )}
                </AIPanel>
              </div>
            )}

            {/* ── Experience Tab ── */}
            {tab === 1 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold">Work Experience</h3>
                  <Button size="sm" variant="secondary" onClick={addExp}>+ Add Position</Button>
                </div>
                {(d.experience || []).map((exp, idx) => (
                  <div key={idx} className="bg-dark-300 border border-dark-500 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-300">{exp.company || `Position ${idx + 1}`}</span>
                      <Button size="sm" variant="danger" onClick={() => removeExp(idx)}>Remove</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="Job Title" value={exp.title || ''} onChange={(e) => updateExp(idx, 'title', e.target.value)} placeholder="Senior Engineer" />
                      <Input label="Company" value={exp.company || ''} onChange={(e) => updateExp(idx, 'company', e.target.value)} placeholder="TechCorp Inc." />
                      <Input label="Dates" value={exp.dates || ''} onChange={(e) => updateExp(idx, 'dates', e.target.value)} placeholder="Jan 2021 – Present" className="col-span-2" />
                    </div>
                    <Textarea
                      label="Bullet Points (one per line)"
                      rows={4}
                      value={(exp.bullets || []).join('\n')}
                      onChange={(e) => updateExpBullets(idx, e.target.value)}
                      placeholder="Led a team of 5 engineers to deliver..."
                    />
                    <AIPanel title="AI Bullet Generator">
                      <Button
                        size="sm" variant="ghost"
                        onClick={() => runAI('bullets', idx)}
                        loading={aiLoading && aiTarget?.type === 'bullets' && aiTarget?.expIdx === idx}
                      >
                        ⚡ Generate Bullets for this Role
                      </Button>
                      {aiTarget?.expIdx === idx && (
                        <AIResponse
                          loading={aiLoading && aiTarget?.type === 'bullets'}
                          content={Array.isArray(aiResults.generateBullets) ? aiResults.generateBullets.join('\n') : null}
                          error={aiError}
                        />
                      )}
                      {aiTarget?.expIdx === idx && aiResults.generateBullets && (
                        <Button size="sm" variant="success" className="mt-2" onClick={() => applyAIResult('bullets', idx)}>
                          ✓ Apply Bullets
                        </Button>
                      )}
                    </AIPanel>
                  </div>
                ))}
                {(d.experience || []).length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-dark-500 rounded-xl">
                    No experience added yet.<br />
                    <button className="text-brand-400 hover:underline mt-1" onClick={addExp}>Add your first position</button>
                  </div>
                )}
              </div>
            )}

            {/* ── Education Tab ── */}
            {tab === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold">Education</h3>
                  <Button size="sm" variant="secondary" onClick={addEdu}>+ Add Education</Button>
                </div>
                {(d.education || []).map((edu, idx) => (
                  <div key={idx} className="bg-dark-300 border border-dark-500 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-300">{edu.school || `Education ${idx + 1}`}</span>
                      <Button size="sm" variant="danger" onClick={() => removeEdu(idx)}>Remove</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="School / University" value={edu.school || ''} onChange={(e) => updateEdu(idx, 'school', e.target.value)} placeholder="UC Berkeley" />
                      <Input label="Degree" value={edu.degree || ''} onChange={(e) => updateEdu(idx, 'degree', e.target.value)} placeholder="B.S. Computer Science" />
                      <Input label="Dates" value={edu.dates || ''} onChange={(e) => updateEdu(idx, 'dates', e.target.value)} placeholder="2015 – 2019" />
                      <Input label="GPA (optional)" value={edu.gpa || ''} onChange={(e) => updateEdu(idx, 'gpa', e.target.value)} placeholder="3.8" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Skills Tab ── */}
            {tab === 3 && (
              <div className="space-y-4">
                <Textarea
                  label="Skills (comma-separated)"
                  rows={3}
                  value={(d.skills || []).join(', ')}
                  onChange={(e) => update({ skills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  placeholder="React, Node.js, Python, AWS, Docker..."
                />
                <div className="flex flex-wrap gap-2">
                  {(d.skills || []).map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-brand-500/20 text-brand-300 text-xs px-2.5 py-1 rounded-full">
                      {skill}
                      <button className="hover:text-red-400" onClick={() => update({ skills: (d.skills || []).filter((_, j) => j !== i) })}>×</button>
                    </span>
                  ))}
                </div>
                <AIPanel title="AI Skill Suggestions" subtitle="Add high-value skills for your role">
                  <Button size="sm" variant="ghost" onClick={() => runAI('skills')} loading={aiLoading && aiTarget?.type === 'skills'}>
                    ⚡ Suggest Skills for My Role
                  </Button>
                  <AIResponse loading={aiLoading && aiTarget?.type === 'skills'} content={Array.isArray(aiResults.suggestSkills) ? aiResults.suggestSkills.join(', ') : null} error={aiError} />
                  {aiResults.suggestSkills && (
                    <Button size="sm" variant="success" className="mt-2" onClick={() => applyAIResult('skills')}>✓ Add Suggested Skills</Button>
                  )}
                </AIPanel>
              </div>
            )}

            {/* ── Projects Tab ── */}
            {tab === 4 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold">Projects</h3>
                  <Button size="sm" variant="secondary" onClick={addProject}>+ Add Project</Button>
                </div>
                {(d.projects || []).map((proj, idx) => (
                  <div key={idx} className="bg-dark-300 border border-dark-500 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-300">{proj.name || `Project ${idx + 1}`}</span>
                      <Button size="sm" variant="danger" onClick={() => removeProject(idx)}>Remove</Button>
                    </div>
                    <Input label="Project Name" value={proj.name || ''} onChange={(e) => updateProject(idx, 'name', e.target.value)} placeholder="OpenMetrics" />
                    <Input label="Link / URL" value={proj.link || ''} onChange={(e) => updateProject(idx, 'link', e.target.value)} placeholder="github.com/you/project" />
                    <Textarea label="Description" rows={2} value={proj.description || ''} onChange={(e) => updateProject(idx, 'description', e.target.value)} placeholder="What it does and the impact..." />
                  </div>
                ))}
              </div>
            )}

            {/* ── Preview / Export Tab ── */}
            {tab === 5 && (
              <div className="space-y-4">
                <div className="bg-dark-300 border border-dark-500 rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3">Export Options</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="primary" onClick={handleExportPDF} loading={pdfLoading}>⬇ Download PDF</Button>
                    <Button variant="secondary" onClick={() => toast.success('Share link copied!')}>🔗 Share Link</Button>
                    <Button variant="ghost" onClick={() => toast.success('Sending email...')}>📧 Email PDF</Button>
                  </div>
                </div>
                <div className="bg-dark-300 border border-dark-500 rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3">ATS Score</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Current Score: <strong className="text-brand-400">{d.atsAnalysis?.score || '—'}/100</strong>
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/ats-checker')}>Run Full ATS Analysis →</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Panel */}
        <div className="w-1/2 bg-dark-300 overflow-y-auto p-6">
          <p className="text-xs text-gray-500 text-center mb-4 uppercase tracking-wider">Live Preview</p>
          <ResumePaper data={editing} />
        </div>
      </div>
    </div>
  );
}
