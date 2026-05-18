const User = require('../models/User.model');
const Resume = require('../models/Resume.model');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');

// ─── Platform Analytics Overview ──────────────────────────────────────────────
exports.getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalResumes,
    activeUsers,
    planDistribution,
    recentResumes,
    avgATSScore,
  ] = await Promise.all([
    User.countDocuments(),
    Resume.countDocuments(),
    User.countDocuments({
      'stats.lastActive': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
    User.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } },
    ]),
    Resume.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email'),
    Resume.aggregate([
      { $group: { _id: null, avg: { $avg: '$atsAnalysis.score' } } },
    ]),
  ]);

  // Monthly resume creation (last 12 months)
  const monthly = await Resume.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // AI feature usage stats
  const aiStats = await User.aggregate([
    { $group: { _id: null, totalAI: { $sum: '$stats.aiGenerations' }, totalDownloads: { $sum: '$stats.downloads' } } },
  ]);

  res.json({
    success: true,
    analytics: {
      totals: {
        users: totalUsers,
        resumes: totalResumes,
        activeUsers,
        avgATSScore: Math.round(avgATSScore[0]?.avg || 0),
        aiGenerations: aiStats[0]?.totalAI || 0,
        downloads: aiStats[0]?.totalDownloads || 0,
      },
      planDistribution: Object.fromEntries(planDistribution.map((p) => [p._id, p.count])),
      monthlyResumes: monthly,
      recentResumes,
    },
  });
});

// ─── Get All Users ────────────────────────────────────────────────────────────
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, role, plan, sort = '-createdAt' } = req.query;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  if (role) query.role = role;
  if (plan) query.plan = plan;

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).sort(sort).skip(skip).limit(Number(limit)).select('-password -refreshTokens'),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
});

// ─── Get Single User (admin) ──────────────────────────────────────────────────
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password -refreshTokens');
  if (!user) return next(new AppError('User not found', 404));

  const resumes = await Resume.find({ user: req.params.id }).select('name atsAnalysis updatedAt template');

  res.json({ success: true, user, resumes });
});

// ─── Update User (admin) ──────────────────────────────────────────────────────
exports.updateUser = asyncHandler(async (req, res, next) => {
  const { role, plan, isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { ...(role && { role }), ...(plan && { plan }), ...(isActive !== undefined && { isActive }) },
    { new: true, runValidators: true }
  ).select('-password -refreshTokens');

  if (!user) return next(new AppError('User not found', 404));

  res.json({ success: true, user });
});

// ─── Delete User (admin) ──────────────────────────────────────────────────────
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  // Delete all user's resumes
  await Resume.deleteMany({ user: req.params.id });
  await user.deleteOne();

  res.json({ success: true, message: 'User and all associated data deleted' });
});

// ─── Suspend/Activate User ────────────────────────────────────────────────────
exports.toggleUserStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError('User not found', 404));

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'suspended'}`,
    isActive: user.isActive,
  });
});

// ─── Get All Resumes (admin) ──────────────────────────────────────────────────
exports.getAllResumes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, sort = '-createdAt' } = req.query;
  const skip = (page - 1) * limit;

  const [resumes, total] = await Promise.all([
    Resume.find()
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name email plan')
      .select('-personal.profilePicture -customSections'),
    Resume.countDocuments(),
  ]);

  res.json({
    success: true,
    resumes,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
});
