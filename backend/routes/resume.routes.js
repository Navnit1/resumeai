// ══════════════════════════════════════════════════
// routes/resume.routes.js
// ══════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth.middleware');

// ─── Public Routes (no auth required) ────────────────────────────────────────
router.get('/share/:token', resumeController.getPublicResume);

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.use(protect);

router.get('/', resumeController.getMyResumes);
router.post('/', resumeController.createResume);

router.get('/:id', resumeController.getResume);
router.put('/:id', resumeController.updateResume);
router.delete('/:id', resumeController.deleteResume);
router.post('/:id/duplicate', resumeController.duplicateResume);
router.post('/:id/analyze-ats', resumeController.analyzeATS);
router.get('/:id/export-pdf', resumeController.exportPDF);
router.post('/:id/toggle-share', resumeController.toggleShare);

module.exports = router;
