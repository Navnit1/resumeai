// controllers/job.controller.js
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');
const Resume = require('../models/Resume.model');
const User = require('../models/User.model');
const jobService = require('../services/job.service');

const trackAIUsage = async (userId) => {
  await User.findByIdAndUpdate(userId, { $inc: { 'stats.aiGenerations': 1 } });
};

// ─── Direct search: role + location typed in by the user ─────────────────────
exports.searchJobs = asyncHandler(async (req, res, next) => {
  const { role, location, country = 'in', page = 1 } = req.query;

  if (!role) {
    return next(new AppError('A job title / role is required', 400));
  }

  const data = await jobService.searchJobs({
    what: role,
    where: location,
    country,
    page: Number(page) || 1,
  });

  res.json({ success: true, profile: { role, location }, ...data });
});

// ─── Recommend from an uploaded resume file (PDF/TXT) ─────────────────────────
exports.recommendFromUpload = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload a resume file (PDF or TXT)', 400));
  }

  const { location, country = 'in', targetRole } = req.body;

  const resumeText = await jobService.extractResumeText(req.file.buffer, req.file.mimetype);
  if (!resumeText || resumeText.trim().length < 30) {
    return next(new AppError('Could not read enough text from that file. Try a different PDF or paste your resume as .txt', 400));
  }

  const profile = await jobService.buildSearchProfile({ resumeText, targetRole });
  await trackAIUsage(req.user.id);

  const data = await jobService.searchJobs({
    what: profile.role,
    where: location,
    country,
    page: 1,
  });

  res.json({ success: true, profile: { ...profile, location }, ...data });
});

// ─── Recommend from a resume already saved in ResumeAI ────────────────────────
exports.recommendFromSavedResume = asyncHandler(async (req, res, next) => {
  const { resumeId, location, country = 'in', targetRole } = req.body;

  if (!resumeId) {
    return next(new AppError('resumeId is required', 400));
  }

  const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
  if (!resume) {
    return next(new AppError('Resume not found', 404));
  }

  const profile = await jobService.buildSearchProfile({
    structuredResume: resume,
    targetRole,
  });
  await trackAIUsage(req.user.id);

  const data = await jobService.searchJobs({
    what: profile.role,
    where: location || resume.personal?.location,
    country,
    page: 1,
  });

  res.json({ success: true, profile: { ...profile, location: location || resume.personal?.location }, ...data });
});
