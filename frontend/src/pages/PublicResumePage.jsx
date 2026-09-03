// src/pages/PublicResumePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import ResumePaper from '../components/resume/ResumePaper';

export default function PublicResumePage() {
  const { token } = useParams();
  const [resume, setResume] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/resumes/share/${token}`)
      .then((res) => setResume(res.data.resume))
      .catch(() => setError('Resume not found or no longer public'));
  }, [token]);

  if (error) return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-white mb-2">Resume Not Found</h2>
        <p className="text-gray-400">{error}</p>
      </div>
    </div>
  );

  if (!resume) return (
    <div className="min-h-screen bg-dark-300 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-300 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-lg font-bold bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">⚡ NextRole AI</h1>
          <p className="text-gray-500 text-sm mt-1">{resume.personal?.name}'s Resume</p>
        </div>
        <ResumePaper data={resume} />
        <p className="text-center text-xs text-gray-600 mt-6">Built with NextRole AI · nextroleai.dev</p>
      </div>
    </div>
  );
}
