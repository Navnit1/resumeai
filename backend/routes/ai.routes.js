// ══════════════════════════════════════════════════
// routes/ai.routes.js
// ══════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth.middleware');

// Protect all AI routes
router.use(protect);

router.post('/generate-summary', aiController.generateSummary);
router.post('/generate-bullets', aiController.generateBullets);
router.post('/extract-keywords', aiController.extractKeywords);
router.post('/optimize-content', aiController.optimizeContent);
router.post('/analyze-resume', aiController.analyzeResume);
router.post('/suggest-skills', aiController.suggestSkills);
router.post('/improve-sentence', aiController.improveSentence);

module.exports = router;