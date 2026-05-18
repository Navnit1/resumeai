// src/pages/ResumeDetailPage.jsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchResume, exportPDF, analyzeATS, deleteResume } from '../store/slices/resumeSlice';
import { PageHeader, Card, Button, ScoreRing, ProgressBar, Badge } from '../components/common';
import ResumePaper from '../components/resume/ResumePaper';
import toast from 'react-hot-toast';

export default function ResumeDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current, pdfLoading, atsLoading } = useSelector((s) => s.resumes);

  useEffect(() => { dispatch(fetchResume(id)); }, [id, dispatch]);

  if (!current) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const score = current.atsAnalysis?.score || 0;
  const analysis = current.atsAnalysis;

  const handleDelete = async () => {
    if (!window.confirm('Delete this resume?')) return;
    await dispatch(deleteResume(id));
    navigate('/resumes');
    toast.success('Resume deleted');
  };

  return (
    <div>
      <PageHeader
        title={current.name}
        subtitle={`${current.template} template · Updated ${new Date(current.updatedAt).toLocaleDateString()}`}
        actions={
          <>
            <Button variant="ghost" onClick={() => navigate('/resumes')}>← Back</Button>
            <Button variant="secondary" onClick={() => navigate(`/resumes/${id}/edit`)}>✏ Edit</Button>
            <Button variant="primary" onClick={() => dispatch(exportPDF(id))} loading={pdfLoading}>⬇ Download PDF</Button>
          </>
        }
      />
      <div className="p-7">
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-3">
            <ResumePaper data={current} />
          </div>
          <div className="col-span-2 space-y-4">
            <Card>
              <div className="flex items-center gap-4">
                <ScoreRing score={score} size={90} />
                <div>
                  <div className="text-base font-bold">ATS Score</div>
                  <div className="text-sm text-gray-400 mt-1">{score >= 80 ? 'Excellent for most ATS' : score >= 60 ? 'Good compatibility' : score > 0 ? 'Needs improvement' : 'Not yet analyzed'}</div>
                  <Button size="sm" variant="ghost" className="mt-2" onClick={() => navigate('/ats-checker')}>Run Analysis →</Button>
                </div>
              </div>
            </Card>

            {analysis?.breakdown && (
              <Card>
                <h3 className="font-bold text-sm mb-3">Score Breakdown</h3>
                {Object.entries(analysis.breakdown).map(([key, val]) => (
                  <div key={key} className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span>{Math.round(val)}%</span>
                    </div>
                    <ProgressBar value={val} color="purple" />
                  </div>
                ))}
              </Card>
            )}

            <Card>
              <h3 className="font-bold text-sm mb-3">Actions</h3>
              <div className="space-y-2">
                <Button variant="secondary" className="w-full justify-start" onClick={() => navigate(`/resumes/${id}/edit`)}>✏ Edit Resume</Button>
                <Button variant="secondary" className="w-full justify-start" onClick={() => dispatch(exportPDF(id))} loading={pdfLoading}>⬇ Download PDF</Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/ats-checker')}>🎯 ATS Check</Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => toast.success('Link copied!')}>🔗 Share Link</Button>
                <Button variant="danger" className="w-full justify-start" onClick={handleDelete}>🗑 Delete</Button>
              </div>
            </Card>

            {analysis?.keywordsMissing?.length > 0 && (
              <Card>
                <h3 className="font-bold text-sm mb-2">Missing Keywords</h3>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.keywordsMissing.slice(0, 8).map((kw) => (
                    <span key={kw} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full">✗ {kw}</span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
