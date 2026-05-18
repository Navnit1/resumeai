// ══════════════════════════════════════════════════
// routes/admin.routes.js
// ══════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Protect all admin routes + role restriction
router.use(protect, restrictTo('admin'));

router.get('/analytics', adminController.getAnalytics);
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/resumes', adminController.getAllResumes);

module.exports = router;