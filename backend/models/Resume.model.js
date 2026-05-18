const mongoose = require('mongoose');

const personalInfoSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  title: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  profilePicture: { type: String, default: '' },
}, { _id: false });

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  isCurrent: { type: Boolean, default: false },
  dates: { type: String, default: '' },
  bullets: [{ type: String }],
  description: { type: String, default: '' },
});

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, default: '' },
  dates: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  gpa: { type: String, default: '' },
  honors: { type: String, default: '' },
  coursework: [{ type: String }],
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  link: { type: String, default: '' },
  technologies: [{ type: String }],
  highlights: [{ type: String }],
});

const certificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, default: '' },
  date: { type: String, default: '' },
  link: { type: String, default: '' },
});

const atsAnalysisSchema = new mongoose.Schema({
  score: { type: Number, default: 0, min: 0, max: 100 },
  keywordsFound: [{ type: String }],
  keywordsMissing: [{ type: String }],
  formattingScore: { type: Number, default: 0 },
  sectionScore: { type: Number, default: 0 },
  impactScore: { type: Number, default: 0 },
  actionVerbScore: { type: Number, default: 0 },
  suggestions: [{ type: String }],
  analyzedAt: { type: Date, default: Date.now },
  jobTitle: { type: String, default: '' },
}, { _id: false });

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Resume name is required'],
      trim: true,
      maxlength: [100, 'Resume name too long'],
    },
    template: {
      type: String,
      enum: ['modern', 'classic', 'minimal', 'executive', 'creative'],
      default: 'modern',
    },
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, unique: true, sparse: true },

    // ─── Content ──────────────────────────────────────────────────────────────
    personal: personalInfoSchema,
    summary: { type: String, default: '', maxlength: 1000 },
    experience: [experienceSchema],
    education: [educationSchema],
    skills: [{ type: String }],
    skillsByCategory: {
      type: Map,
      of: [String],
      default: {},
    },
    projects: [projectSchema],
    certifications: [certificationSchema],
    languages: [{
      language: String,
      proficiency: { type: String, enum: ['Basic', 'Intermediate', 'Advanced', 'Native'] },
    }],
    customSections: [{
      title: String,
      content: String,
      bullets: [String],
    }],

    // ─── ATS Analysis ─────────────────────────────────────────────────────────
    atsAnalysis: atsAnalysisSchema,

    // ─── Metadata ─────────────────────────────────────────────────────────────
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    lastExported: Date,
    pdfUrl: { type: String, default: '' },
    version: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtual: ATS Score shorthand ────────────────────────────────────────────
resumeSchema.virtual('score').get(function () {
  return this.atsAnalysis?.score || 0;
});

// ─── Pre-save: Auto-generate share token ─────────────────────────────────────
resumeSchema.pre('save', function (next) {
  if (this.isPublic && !this.shareToken) {
    this.shareToken = require('crypto').randomBytes(16).toString('hex');
  }
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ shareToken: 1 });
resumeSchema.index({ 'atsAnalysis.score': -1 });

module.exports = mongoose.model('Resume', resumeSchema);
