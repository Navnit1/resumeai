// ══════════════════════════════════════════════════
// routes/job.routes.js
// ══════════════════════════════════════════════════
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { protect } = require('../middleware/auth.middleware');
const { resumeUpload } = require('../middleware/resumeUpload.middleware');

// Protect all job routes
router.use(protect);

router.get('/search', jobController.searchJobs);
router.post('/recommend/upload', resumeUpload.single('resume'), jobController.recommendFromUpload);
router.post('/recommend/saved', jobController.recommendFromSavedResume);

module.exports = router;
