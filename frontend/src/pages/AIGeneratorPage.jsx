// src/pages/AIGeneratorPage.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  generateSummary, generateBullets, optimizeContent,
  extractKeywords, suggestSkills, improveSentence,
} from '../store/slices/aiSlice';
import { PageHeader, Card, Button, AIPanel, AIResponse, Input, Textarea, Select } from '../components/common';

export default function AIGeneratorPage() {
  const dispatch = useDispatch();
  const { loading, results, error } = useSelector((s) => s.ai);
  const [activeFeature, setActiveFeature] = useState(null);

  // Form states
  const [summaryForm, setSummaryForm] = useState({ jobTitle: 'Senior Software Engineer', yearsOfExperience: '5', skills: 'React, Node.js, AWS, Docker', achievements: 'Led migration to microservices, reducing latency by 40%' });
  const [bulletsForm, setBulletsForm] = useState({ jobTitle: 'Senior Engineer', company: 'TechCorp (SaaS)', responsibilities: 'Improved application performance and mentored junior developers', count: 4 });
  const [optimizeForm, setOptimizeForm] = useState({ text: 'Worked on improving the performance of the web application. Also helped other team members. Did some mentoring and code reviews. Built new features for customers.', optimizationGoal: 'action-verbs', targetRole: 'Software Engineer' });
  const [kwForm, setKwForm] = useState({ jobDescription: 'Looking for a Senior Software Engineer with 5+ years React, Node.js, TypeScript, AWS, Docker, PostgreSQL, microservices, CI/CD, GraphQL, Agile experience.', jobTitle: 'Senior Software Engineer' });
  const [skillsForm, setSkillsForm] = useState({ jobTitle: 'Full Stack Developer', currentSkills: 'React, JavaScript, Node.js', industry: 'Technology' });
  const [improveForm, setImproveForm] = useState({ text: 'Responsible for building web applications and working with the team.', context: 'resume bullet point' });

  const run = async (feature, thunk, payload) => {
    setActiveFeature(feature);
    const res = await dispatch(thunk(payload));
    if (res.error) toast.error('AI generation failed');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(Array.isArray(text) ? text.join('\n') : text || '');
    toast.success('Copied to clipboard!');
  };

  const isLoading = (f) => loading && activeFeature === f;

  return (
    <div>
      <PageHeader title="AI Content Generator" subtitle="Generate professional resume content powered by GPT-4" />
      <div className="p-7">
        <div className="grid grid-cols-2 gap-6">

          {/* Summary Generator */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">✨</span>
              <div>
                <h2 className="font-bold text-sm">Professional Summary</h2>
                <p className="text-xs text-gray-500">Craft a compelling opening statement</p>
              </div>
            </div>
            <div className="space-y-3">
              <Input label="Job Title" value={summaryForm.jobTitle} onChange={(e) => setSummaryForm({ ...summaryForm, jobTitle: e.target.value })} />
              <Input label="Years of Experience" type="number" value={summaryForm.yearsOfExperience} onChange={(e) => setSummaryForm({ ...summaryForm, yearsOfExperience: e.target.value })} />
              <Input label="Key Skills (comma-separated)" value={summaryForm.skills} onChange={(e) => setSummaryForm({ ...summaryForm, skills: e.target.value })} />
              <Input label="Key Achievement" value={summaryForm.achievements} onChange={(e) => setSummaryForm({ ...summaryForm, achievements: e.target.value })} />
              <Button variant="primary" className="w-full justify-center" loading={isLoading('summary')} onClick={() => run('summary', generateSummary, { ...summaryForm, skills: summaryForm.skills.split(',').map(s => s.trim()) })}>
                ⚡ Generate Summary
              </Button>
            </div>
            <AIResponse loading={isLoading('summary')} content={results.generateSummary} error={error} />
            {results.generateSummary && (
              <Button size="sm" variant="ghost" className="mt-2" onClick={() => copyToClipboard(results.generateSummary)}>📋 Copy</Button>
            )}
          </Card>

          {/* Bullet Generator */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📝</span>
              <div>
                <h2 className="font-bold text-sm">Experience Bullets</h2>
                <p className="text-xs text-gray-500">Create impact-driven bullet points</p>
              </div>
            </div>
            <div className="space-y-3">
              <Input label="Job Title" value={bulletsForm.jobTitle} onChange={(e) => setBulletsForm({ ...bulletsForm, jobTitle: e.target.value })} />
              <Input label="Company / Industry" value={bulletsForm.company} onChange={(e) => setBulletsForm({ ...bulletsForm, company: e.target.value })} />
              <Textarea label="Responsibilities / Tasks" rows={3} value={bulletsForm.responsibilities} onChange={(e) => setBulletsForm({ ...bulletsForm, responsibilities: e.target.value })} />
              <Select label="Number of bullets" value={bulletsForm.count} onChange={(e) => setBulletsForm({ ...bulletsForm, count: Number(e.target.value) })}>
                {[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} bullets</option>)}
              </Select>
              <Button variant="primary" className="w-full justify-center" loading={isLoading('bullets')} onClick={() => run('bullets', generateBullets, bulletsForm)}>
                ⚡ Generate Bullet Points
              </Button>
            </div>
            <AIResponse
              loading={isLoading('bullets')}
              content={Array.isArray(results.generateBullets) ? results.generateBullets.map((b) => `• ${b}`).join('\n') : null}
              error={error}
            />
            {results.generateBullets && (
              <Button size="sm" variant="ghost" className="mt-2" onClick={() => copyToClipboard(results.generateBullets)}>📋 Copy</Button>
            )}
          </Card>

          {/* Content Optimizer */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🚀</span>
              <div>
                <h2 className="font-bold text-sm">Content Optimizer</h2>
                <p className="text-xs text-gray-500">Rewrite for more impact and ATS compatibility</p>
              </div>
            </div>
            <div className="space-y-3">
              <Textarea label="Paste resume content to optimize" rows={5} value={optimizeForm.text} onChange={(e) => setOptimizeForm({ ...optimizeForm, text: e.target.value })} />
              <Select label="Optimization Goal" value={optimizeForm.optimizationGoal} onChange={(e) => setOptimizeForm({ ...optimizeForm, optimizationGoal: e.target.value })}>
                <option value="action-verbs">Stronger Action Verbs</option>
                <option value="metrics">Add Quantifiable Metrics</option>
                <option value="ats">ATS Keyword Optimization</option>
                <option value="grammar">Fix Grammar & Clarity</option>
                <option value="concise">Make More Concise</option>
              </Select>
              <Input label="Target Role" value={optimizeForm.targetRole} onChange={(e) => setOptimizeForm({ ...optimizeForm, targetRole: e.target.value })} />
              <Button variant="primary" className="w-full justify-center" loading={isLoading('optimize')} onClick={() => run('optimize', optimizeContent, optimizeForm)}>
                ⚡ Optimize Content
              </Button>
            </div>
            <AIResponse loading={isLoading('optimize')} content={results.optimizeContent} error={error} />
            {results.optimizeContent && (
              <Button size="sm" variant="ghost" className="mt-2" onClick={() => copyToClipboard(results.optimizeContent)}>📋 Copy</Button>
            )}
          </Card>

          {/* Keyword Extractor */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🔍</span>
              <div>
                <h2 className="font-bold text-sm">Keyword Extractor</h2>
                <p className="text-xs text-gray-500">Find ATS keywords from any job posting</p>
              </div>
            </div>
            <div className="space-y-3">
              <Input label="Job Title" value={kwForm.jobTitle} onChange={(e) => setKwForm({ ...kwForm, jobTitle: e.target.value })} />
              <Textarea label="Job Description" rows={5} value={kwForm.jobDescription} onChange={(e) => setKwForm({ ...kwForm, jobDescription: e.target.value })} />
              <Button variant="primary" className="w-full justify-center" loading={isLoading('keywords')} onClick={() => run('keywords', extractKeywords, kwForm)}>
                ⚡ Extract Keywords
              </Button>
            </div>
            {isLoading('keywords') && <AIResponse loading />}
            {!isLoading('keywords') && results.extractKeywords && (
              <div className="mt-3 space-y-2">
                {Object.entries(results.extractKeywords).map(([cat, kws]) =>
                  Array.isArray(kws) && kws.length > 0 ? (
                    <div key={cat}>
                      <p className="text-xs text-gray-500 mb-1.5 capitalize">{cat.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {kws.map((kw) => (
                          <span key={kw} className="text-xs bg-brand-500/20 text-brand-300 border border-brand-500/30 px-2 py-0.5 rounded-full">{kw}</span>
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </Card>

          {/* Skill Suggester */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🔧</span>
              <div>
                <h2 className="font-bold text-sm">Skill Suggester</h2>
                <p className="text-xs text-gray-500">Discover high-value skills for your role</p>
              </div>
            </div>
            <div className="space-y-3">
              <Input label="Target Job Title" value={skillsForm.jobTitle} onChange={(e) => setSkillsForm({ ...skillsForm, jobTitle: e.target.value })} />
              <Input label="Industry" value={skillsForm.industry} onChange={(e) => setSkillsForm({ ...skillsForm, industry: e.target.value })} />
              <Input label="Current Skills" value={skillsForm.currentSkills} onChange={(e) => setSkillsForm({ ...skillsForm, currentSkills: e.target.value })} />
              <Button variant="primary" className="w-full justify-center" loading={isLoading('skills')} onClick={() => run('skills', suggestSkills, { ...skillsForm, currentSkills: skillsForm.currentSkills.split(',').map(s => s.trim()) })}>
                ⚡ Suggest Skills
              </Button>
            </div>
            {isLoading('skills') && <AIResponse loading />}
            {!isLoading('skills') && results.suggestSkills && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {results.suggestSkills.map((skill) => (
                  <span key={skill} className="text-xs bg-green-500/15 text-green-400 border border-green-500/30 px-2.5 py-1 rounded-full">+ {skill}</span>
                ))}
              </div>
            )}
          </Card>

          {/* Sentence Improver */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">💡</span>
              <div>
                <h2 className="font-bold text-sm">Sentence Improver</h2>
                <p className="text-xs text-gray-500">Make any line more impactful</p>
              </div>
            </div>
            <div className="space-y-3">
              <Textarea label="Text to Improve" rows={4} value={improveForm.text} onChange={(e) => setImproveForm({ ...improveForm, text: e.target.value })} />
              <Select label="Context" value={improveForm.context} onChange={(e) => setImproveForm({ ...improveForm, context: e.target.value })}>
                <option value="resume bullet point">Resume Bullet Point</option>
                <option value="professional summary">Professional Summary</option>
                <option value="cover letter">Cover Letter</option>
                <option value="LinkedIn bio">LinkedIn Bio</option>
              </Select>
              <Button variant="primary" className="w-full justify-center" loading={isLoading('improve')} onClick={() => run('improve', improveSentence, improveForm)}>
                ⚡ Improve Writing
              </Button>
            </div>
            <AIResponse loading={isLoading('improve')} content={results.improveSentence} error={error} />
            {results.improveSentence && (
              <Button size="sm" variant="ghost" className="mt-2" onClick={() => copyToClipboard(results.improveSentence)}>📋 Copy</Button>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
}
