const Resume = require('../models/Resume.model');
const User = require('../models/User.model');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');
const { calculateATSScore } = require('../services/ats.service');
const { generatePDF } = require('../services/pdf.service');

// ─── Get All Resumes (for current user) ───────────────────────────────────────
exports.getMyResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user.id })
    .select('-__v')
    .sort({ updatedAt: -1 });

  res.json({ success: true, count: resumes.length, resumes });
});

// ─── Get Single Resume ────────────────────────────────────────────────────────
exports.getResume = asyncHandler(async (req, res, next) => {
  const resume = await Resume.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!resume) {
    return next(new AppError('Resume not found', 404));
  }

  // Increment view count
  await Resume.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  res.json({ success: true, resume });
});

// ─── Get Public Resume (via share token) ──────────────────────────────────────
exports.getPublicResume = asyncHandler(async (req, res, next) => {
  const resume = await Resume.findOne({
    shareToken: req.params.token,
    isPublic: true,
  }).populate('user', 'name profilePicture');

  if (!resume) {
    return next(new AppError('Resume not found or not public', 404));
  }

  res.json({ success: true, resume });
});

// ─── Create Resume ────────────────────────────────────────────────────────────
exports.createResume = asyncHandler(async (req, res, next) => {
  // Check plan limits
  const user = await User.findById(req.user.id);
  const resumeCount = await Resume.countDocuments({ user: req.user.id });

  const limits = { free: 3, pro: 20, enterprise: Infinity };
  if (resumeCount >= limits[user.plan]) {
    return next(
      new AppError(
        `Free plan allows up to ${limits[user.plan]} resumes. Upgrade to create more.`,
        403
      )
    );
  }

  const resume = await Resume.create({
    ...req.body,
    user: req.user.id,
  });

  // Update user stats
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { 'stats.resumesCreated': 1 },
  });

  res.status(201).json({ success: true, resume });
});

// ─── Update Resume ────────────────────────────────────────────────────────────
exports.updateResume = asyncHandler(async (req, res, next) => {
  let resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });

  if (!resume) {
    return next(new AppError('Resume not found', 404));
  }

  // Increment version on significant updates
  if (req.body.experience || req.body.education || req.body.summary) {
    req.body.version = (resume.version || 1) + 1;
  }

  resume = await Resume.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true, runValidators: true }
  );

  res.json({ success: true, resume });
});

// ─── Delete Resume ────────────────────────────────────────────────────────────
exports.deleteResume = asyncHandler(async (req, res, next) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });

  if (!resume) {
    return next(new AppError('Resume not found', 404));
  }

  await resume.deleteOne();

  res.json({ success: true, message: 'Resume deleted successfully' });
});

// ─── Duplicate Resume ─────────────────────────────────────────────────────────
exports.duplicateResume = asyncHandler(async (req, res, next) => {
  const original = await Resume.findOne({ _id: req.params.id, user: req.user.id });

  if (!original) {
    return next(new AppError('Resume not found', 404));
  }

  const { _id, shareToken, createdAt, updatedAt, __v, ...data } = original.toObject();

  const copy = await Resume.create({
    ...data,
    name: `${original.name} (Copy)`,
    user: req.user.id,
    isPublic: false,
    shareToken: undefined,
    downloads: 0,
    views: 0,
  });

  res.status(201).json({ success: true, resume: copy });
});

// ─── Run ATS Analysis ─────────────────────────────────────────────────────────
exports.analyzeATS = asyncHandler(async (req, res, next) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });

  if (!resume) {
    return next(new AppError('Resume not found', 404));
  }

  const { jobDescription, jobTitle } = req.body;

  const analysis = await calculateATSScore(resume, jobDescription, jobTitle);

  // Save analysis to resume
  resume.atsAnalysis = { ...analysis, analyzedAt: new Date(), jobTitle };
  await resume.save();

  res.json({ success: true, analysis: resume.atsAnalysis });
});

// ─── Export to PDF ────────────────────────────────────────────────────────────
exports.exportPDF = asyncHandler(async (req, res, next) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });

  if (!resume) {
    return next(new AppError('Resume not found', 404));
  }

  const pdfBuffer = await generatePDF(resume);

  // Update stats
  await Resume.findByIdAndUpdate(req.params.id, {
    $inc: { downloads: 1 },
    lastExported: new Date(),
  });
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { 'stats.downloads': 1 },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${resume.name.replace(/[^a-z0-9]/gi, '_')}_resume.pdf"`
  );
  res.send(pdfBuffer);
});

// ─── Toggle Public Sharing ────────────────────────────────────────────────────
exports.toggleShare = asyncHandler(async (req, res, next) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });

  if (!resume) {
    return next(new AppError('Resume not found', 404));
  }

  resume.isPublic = !resume.isPublic;
  if (resume.isPublic && !resume.shareToken) {
    resume.shareToken = require('crypto').randomBytes(16).toString('hex');
  }
  await resume.save();

  res.json({
    success: true,
    isPublic: resume.isPublic,
    shareToken: resume.shareToken,
    shareUrl: resume.isPublic
      ? `${process.env.CLIENT_URL}/resume/share/${resume.shareToken}`
      : null,
  });
});
