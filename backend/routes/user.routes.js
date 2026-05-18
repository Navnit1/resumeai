const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User.model');
const { asyncHandler } = require('../utils/asyncHandler');
const cloudinary = require('../config/cloudinary.config');
const { upload } = require('../middleware/upload.middleware');

// ─── Get Profile ──────────────────────────────────────────────────────────────
router.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user: user.toSafeObject() });
}));

// ─── Update Profile ───────────────────────────────────────────────────────────
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'location', 'linkedIn', 'github', 'preferences'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true, runValidators: true,
  });
  res.json({ success: true, user: user.toSafeObject() });
}));

// ─── Upload Profile Picture ───────────────────────────────────────────────────
router.post('/profile-picture', protect, upload.single('image'), asyncHandler(async (req, res, next) => {
  if (!req.file) return next(new (require('../utils/AppError').AppError)('Please upload an image', 400));

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: 'resumeai/profiles',
    width: 400, height: 400, crop: 'fill',
    quality: 'auto',
  });

  const user = await User.findByIdAndUpdate(req.user.id, {
    profilePicture: { url: result.secure_url, publicId: result.public_id },
  }, { new: true });

  res.json({ success: true, profilePicture: user.profilePicture });
}));

module.exports = router;
