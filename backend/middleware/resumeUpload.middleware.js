// middleware/resumeUpload.middleware.js
const multer = require('multer');
const { AppError } = require('../utils/AppError');

// Memory storage — we only need the buffer briefly to extract text, no need to
// persist the raw file to disk or Cloudinary.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['application/pdf', 'text/plain'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF or TXT resumes are supported', 400), false);
  }
};

const resumeUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = { resumeUpload };
