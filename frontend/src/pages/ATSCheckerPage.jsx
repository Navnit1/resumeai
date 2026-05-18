// src/pages/ATSCheckerPage.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchResumes, analyzeATS } from '../store/slices/resumeSlice';
import { extractKeywords } from '../store/slices/aiSlice';
import { PageHeader, Card, Button, ScoreRing, ProgressBar, AIPanel, AIResponse, Textarea, Select } from '../components/common';

const SAMPLE_JD = `We are looking for a Senior Software Engineer.

Requirements:
- 5+ years experience with JavaScript, React, and Node.js
- Experience with TypeScript and modern ES6+ features  
- Proficiency with AWS services (EC2, S3, Lambda, RDS)
- Experience with Docker and containerization
- Knowledge of microservices architecture
- Experience with PostgreSQL and MongoDB
- Strong understanding of REST APIs and GraphQL
- CI/CD pipeline experience (GitHub Actions, Jenkins)
- Familiarity with Agile/Scrum methodology

Nice to Have:
- Kubernetes experience
- Redis caching knowledge
- Experience with event-driven architecture`;

export default function ATSCheckerPage() {
  const dispatch = useDispatch();
  const { list, atsLoading } = useSelector((s) => s.resumes);
  const { loading: aiLoading, results: aiResults } = useSelector((s) => s.ai);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [jobDescription, setJobDescription] = useState(SAMPLE_JD);
  const [jobTitle, setJobTitle] = useState('Senior Software Engineer');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  useEffect(() => {
    dispatch(fetchResumes());
  }, [dispatch]);

  useEffect(() => {
    if (list.length > 0 && !selectedResumeId) {
      setSelectedResumeId(list[0]._id);
    }
  }, [list, selectedResumeId]);

  const selectedResume = list.find((r) => r._id === selectedResumeId);

  const handleAnalyze = async () => {
    if (!selectedResumeId) { toast.error('Please select a resume'); return; }
    if (!jobDescription.trim()) { toast.error('Please enter a job description'); return; }
    const res = await dispatch(analyzeATS({ id: selectedResumeId, jobDescription, jobTitle }));
    if (res.payload?.analysis) {
      setAnalysisResult(res.payload.analysis);
      toast.success('ATS analysis complete!');
    }
  };

  const handleExtractKeywords = async () => {
    setShowAISuggestions(true);
    await dispatch(extractKeywords({ jobDescription, jobTitle }));
  };

  const analysis = analysisResult || selectedResume?.atsAnalysis;
  const score = analysis?.score || 0;
  const scoreColor = score >= 80 ? '#00E580' : score >= 60 ? '#FFB340' : '#FF5577';

  return (
    <div>
      <PageHeader title="ATS Score Checker" subtitle="Analyze your resume against any job description" />
      <div className="p-7">
        <div className="grid grid-cols-2 gap-6">
          {/* Left: Input */}
          <div className="space-y-4">
            <Card>
              <h2 className="font-bold text-sm mb-4">Job Details</h2>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400">Select Resume</label>
                  <Select value={selectedResumeId} onChange={(e) => setSelectedResumeId(e.target.value)}>
                    <option value="">-- Select a resume --</option>
                    {list.map((r) => (
                      <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400">Job Title</label>
                  <input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Senior Software Engineer"
                    className="w-full bg-dark-400 border border-dark-500 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
                <Textarea
                  label="Job Description"
                  rows={12}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here..."
                />
                <Button variant="primary" className="w-full justify-center" onClick={handleAnalyze} loading={atsLoading}>
                  🎯 Analyze ATS Compatibility
                </Button>
              </div>
            </Card>

            <AIPanel title="AI Keyword Extractor" subtitle="Find high-value keywords from the job posting">
              <Button size="sm" variant="ghost" onClick={handleExtractKeywords} loading={aiLoading && showAISuggestions}>
                ⚡ Extract Top Keywords
              </Button>
              {showAISuggestions && (
                <div className="mt-3">
                  {aiLoading ? (
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <div className="flex gap-1">{[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{animationDelay:`${i*.15}s`}}/>)}</div>
                      Extracting keywords...
                    </div>
                  ) : aiResults.extractKeywords ? (
                    <div className="space-y-2">
                      {Object.entries(aiResults.extractKeywords).map(([cat, kws]) => (
                        Array.isArray(kws) && kws.length > 0 && (
                          <div key={cat}>
                            <div className="text-xs text-gray-500 mb-1 capitalize">{cat.replace(/([A-Z])/g, ' $1').trim()}</div>
                            <div className="flex flex-wrap gap-1">
                              {kws.map((kw) => (
                                <span key={kw} className="text-xs bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full">{kw}</span>
                              ))}
                            </div>
                          </div>
                        )
                      ))}
                    </div>
                  ) : null}
                </div>
              )}
            </AIPanel>
          </div>

          {/* Right: Results */}
          <div className="space-y-4">
            {/* Score Overview */}
            <Card>
              <div className="flex items-center gap-6">
                <ScoreRing score={score} size={110} />
                <div>
                  <div className="text-xl font-bold">{score >= 80 ? '🎉 Excellent Match' : score >= 60 ? '👍 Good Match' : score > 0 ? '⚠️ Needs Work' : '— Not Analyzed'}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {score > 0 ? `${score}% ATS compatible with this role` : 'Run analysis to see your score'}
                  </div>
                  {analysis && (
                    <div className="flex gap-2 mt-3">
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">✓ {analysis.keywordsFound?.length || 0} Found</span>
                      <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">✗ {analysis.keywordsMissing?.length || 0} Missing</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Score Breakdown */}
            {analysis?.breakdown && (
              <Card>
                <h3 className="font-bold text-sm mb-4">Score Breakdown</h3>
                <div className="space-y-3">
                  {[
                    ['Keyword Match', analysis.breakdown.keywordMatch, 'purple'],
                    ['Formatting', analysis.breakdown.formatting, 'green'],
                    ['Section Coverage', analysis.breakdown.sectionCoverage, 'cyan'],
                    ['Action Verbs', analysis.breakdown.actionVerbs, 'amber'],
                    ['Quantified Impact', analysis.breakdown.quantifiedImpact, 'purple'],
                  ].map(([label, val, color]) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{label}</span>
                        <span className="font-semibold">{Math.round(val || 0)}%</span>
                      </div>
                      <ProgressBar value={val || 0} color={color} />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Keywords */}
            {analysis && (
              <Card>
                <h3 className="font-bold text-sm mb-3">Keyword Analysis</h3>
                {analysis.keywordsFound?.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Found in Your Resume</p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {analysis.keywordsFound.slice(0, 15).map((kw) => (
                        <span key={kw} className="text-xs bg-green-500/15 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">✓ {kw}</span>
                      ))}
                    </div>
                  </>
                )}
                {analysis.keywordsMissing?.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Missing Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.keywordsMissing.slice(0, 10).map((kw) => (
                        <span key={kw} className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">✗ {kw}</span>
                      ))}
                    </div>
                  </>
                )}
              </Card>
            )}

            {/* Suggestions */}
            {analysis?.suggestions?.length > 0 && (
              <Card>
                <h3 className="font-bold text-sm mb-3">Improvement Suggestions</h3>
                <div className="space-y-2">
                  {analysis.suggestions.map((s, i) => (
                    <div key={i} className="flex gap-2 text-sm text-gray-300">
                      <span className="text-amber-400 flex-shrink-0 mt-0.5">→</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {!analysis && (
              <Card className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-semibold mb-2">Ready to analyze</h3>
                <p className="text-sm text-gray-400">Select your resume and paste a job description, then click Analyze</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
