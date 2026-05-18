const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');

// ─── Protect: Verify JWT ──────────────────────────────────────────────────────
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Access denied. Please log in.', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Session expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid token. Please log in again.', 401));
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError('User no longer exists.', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Account suspended. Contact support.', 403));
  }

  req.user = { id: user._id.toString(), role: user.role, plan: user.plan };
  next();
});

// ─── Restrict: Role-Based Access ─────────────────────────────────────────────
exports.restrictTo = (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission for this action.', 403));
    }
    next();
  };

// ─── Plan Gate: Check subscription ───────────────────────────────────────────
exports.requirePlan = (...plans) =>
  (req, res, next) => {
    if (!plans.includes(req.user.plan)) {
      return next(
        new AppError(
          `This feature requires ${plans.join(' or ')} plan. Please upgrade.`,
          403
        )
      );
    }
    next();
  };
