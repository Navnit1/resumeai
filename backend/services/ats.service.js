/**
 * ATS Scoring Service
 * Analyzes resume against job description for ATS compatibility
 * Score: 0-100 based on multiple weighted factors
 */

// ─── Action Verbs Library ─────────────────────────────────────────────────────
const STRONG_ACTION_VERBS = new Set([
  'led', 'built', 'created', 'developed', 'designed', 'implemented', 'delivered',
  'launched', 'managed', 'optimized', 'increased', 'reduced', 'improved', 'achieved',
  'generated', 'drove', 'established', 'spearheaded', 'architected', 'engineered',
  'automated', 'streamlined', 'accelerated', 'transformed', 'scaled', 'deployed',
  'integrated', 'migrated', 'mentored', 'collaborated', 'pioneered', 'negotiated',
]);

// ─── Weak Patterns ────────────────────────────────────────────────────────────
const WEAK_PATTERNS = [
  /responsible for/gi,
  /worked on/gi,
  /helped with/gi,
  /assisted in/gi,
  /duties included/gi,
  /involved in/gi,
];

// ─── Required Resume Sections ─────────────────────────────────────────────────
const REQUIRED_SECTIONS = ['summary', 'experience', 'education', 'skills'];
const BONUS_SECTIONS = ['projects', 'certifications', 'languages'];

/**
 * Extract meaningful keywords from text
 */
function extractKeywords(text) {
  if (!text) return [];
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'must', 'ought',
    'this', 'that', 'these', 'those', 'we', 'you', 'they', 'it',
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s+#.]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word))
    .filter(Boolean);
}

/**
 * Extract noun phrases and technical terms (multi-word keywords)
 */
function extractPhrases(text) {
  if (!text) return [];
  const patterns = [
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g,  // Title Case phrases
    /\b([A-Z]{2,}(?:\+?\+?)?)\b/g,              // Acronyms (AWS, SQL, API, C++)
    /\b(\w+\.\w+)\b/g,                           // Dotted terms (Node.js)
    /\b(\w+\/\w+)\b/g,                           // Slash terms (CI/CD)
  ];

  const phrases = [];
  patterns.forEach((pattern) => {
    const matches = text.match(pattern) || [];
    phrases.push(...matches.map((m) => m.toLowerCase()));
  });
  return phrases;
}

/**
 * Score keyword matching between resume and job description
 */
function scoreKeywordMatch(resumeText, jdText) {
  const resumeKeywords = new Set([
    ...extractKeywords(resumeText),
    ...extractPhrases(resumeText),
  ]);
  const jdKeywords = [...new Set([
    ...extractKeywords(jdText),
    ...extractPhrases(jdText),
  ])];

  // Filter JD keywords to meaningful ones (length > 3)
  const importantJDKeywords = jdKeywords.filter((kw) => kw.length > 3);

  const found = [];
  const missing = [];

  importantJDKeywords.forEach((keyword) => {
    const isFound = resumeKeywords.has(keyword) ||
      [...resumeKeywords].some((rk) => rk.includes(keyword) || keyword.includes(rk));

    if (isFound) {
      found.push(keyword);
    } else {
      missing.push(keyword);
    }
  });

  const matchRate = importantJDKeywords.length > 0
    ? (found.length / importantJDKeywords.length) * 100
    : 50;

  return {
    score: Math.min(Math.round(matchRate), 100),
    found: [...new Set(found)].slice(0, 20),
    missing: [...new Set(missing)].slice(0, 15),
  };
}

/**
 * Score resume formatting and structure
 */
function scoreFormatting(resume) {
  let score = 100;
  const issues = [];

  // Check contact info completeness
  const personal = resume.personal || {};
  if (!personal.email) { score -= 10; issues.push('Missing email address'); }
  if (!personal.phone) { score -= 5; issues.push('Missing phone number'); }
  if (!personal.location) { score -= 5; issues.push('Missing location'); }
  if (!personal.linkedin) { score -= 5; issues.push('Missing LinkedIn URL'); }

  // Check summary length
  const summary = resume.summary || '';
  if (summary.length < 50) { score -= 15; issues.push('Summary too short (aim for 3-4 sentences)'); }
  if (summary.length > 500) { score -= 5; issues.push('Summary too long (aim for under 100 words)'); }

  // Check experience bullet count
  const experience = resume.experience || [];
  if (experience.length === 0) { score -= 20; issues.push('No work experience listed'); }
  experience.forEach((exp) => {
    if (!exp.bullets || exp.bullets.length < 2) {
      score -= 5;
      issues.push(`Add more bullet points for ${exp.company || 'position'}`);
    }
    if (!exp.dates) {
      score -= 3;
      issues.push(`Missing dates for ${exp.company || 'position'}`);
    }
  });

  // Check skills count
  const skills = resume.skills || [];
  if (skills.length < 5) { score -= 10; issues.push('Add more skills (aim for 8-15)'); }

  return { score: Math.max(score, 0), issues };
}

/**
 * Score section coverage
 */
function scoreSectionCoverage(resume) {
  let score = 0;
  const present = [];
  const missing = [];

  REQUIRED_SECTIONS.forEach((section) => {
    const hasSection = section === 'skills'
      ? (resume.skills?.length > 0)
      : section === 'summary'
      ? (resume.summary?.length > 20)
      : (resume[section]?.length > 0);

    if (hasSection) {
      score += 20;
      present.push(section);
    } else {
      missing.push(section);
    }
  });

  BONUS_SECTIONS.forEach((section) => {
    if (resume[section]?.length > 0) {
      score += 5;
      present.push(section);
    }
  });

  return { score: Math.min(score, 100), present, missing };
}

/**
 * Score action verbs and impact language
 */
function scoreActionVerbs(resume) {
  const allBullets = (resume.experience || [])
    .flatMap((exp) => exp.bullets || [])
    .join(' ')
    .toLowerCase();

  if (!allBullets) return { score: 0, weakBullets: 0, strongBullets: 0 };

  const bulletList = (resume.experience || []).flatMap((exp) => exp.bullets || []);
  let strongCount = 0;
  let weakCount = 0;

  bulletList.forEach((bullet) => {
    const firstWord = bullet.trim().split(/\s+/)[0]?.toLowerCase();
    if (STRONG_ACTION_VERBS.has(firstWord)) strongCount++;

    const hasWeakPattern = WEAK_PATTERNS.some((p) => p.test(bullet));
    if (hasWeakPattern) weakCount++;
  });

  const total = bulletList.length || 1;
  const score = Math.round((strongCount / total) * 100) - (weakCount * 10);

  return {
    score: Math.max(0, Math.min(score, 100)),
    strongBullets: strongCount,
    weakBullets: weakCount,
    total,
  };
}

/**
 * Score quantifiable metrics and impact
 */
function scoreQuantifiableImpact(resume) {
  const allBullets = (resume.experience || [])
    .flatMap((exp) => exp.bullets || []);

  const metricPatterns = [
    /\d+%/,                    // Percentages
    /\$[\d,]+/,                // Dollar amounts
    /\d+x\b/,                  // Multipliers
    /\d+[KkMmBb]\b/,           // Large numbers
    /\b\d+\s*(users?|customers?|clients?|employees?|engineers?|teams?)/i,
    /\b(increased|decreased|reduced|improved|grew|saved)\b.*\d/i,
  ];

  const bulletsWithMetrics = allBullets.filter((bullet) =>
    metricPatterns.some((p) => p.test(bullet))
  );

  const score = allBullets.length > 0
    ? Math.round((bulletsWithMetrics.length / allBullets.length) * 100)
    : 0;

  return {
    score,
    bulletsWithMetrics: bulletsWithMetrics.length,
    totalBullets: allBullets.length,
    recommendation: score < 50
      ? 'Add quantifiable metrics to at least half of your bullet points'
      : 'Good use of metrics!',
  };
}

/**
 * Main ATS Score Calculator
 */
async function calculateATSScore(resume, jobDescription, jobTitle) {
  const resumeText = [
    resume.summary,
    resume.personal?.name,
    resume.personal?.title,
    ...(resume.skills || []),
    ...(resume.experience || []).flatMap((e) => [e.title, e.company, ...(e.bullets || [])]),
    ...(resume.education || []).flatMap((e) => [e.degree, e.school]),
    ...(resume.projects || []).map((p) => p.description),
  ]
    .filter(Boolean)
    .join(' ');

  // Run all scoring algorithms
  const keywordResult = jobDescription
    ? scoreKeywordMatch(resumeText, jobDescription)
    : { score: 70, found: resume.skills?.slice(0, 10) || [], missing: [] };

  const formattingResult = scoreFormatting(resume);
  const sectionResult = scoreSectionCoverage(resume);
  const actionVerbResult = scoreActionVerbs(resume);
  const impactResult = scoreQuantifiableImpact(resume);

  // Weighted final score
  const weights = {
    keywords: 0.35,
    formatting: 0.20,
    sections: 0.20,
    actionVerbs: 0.15,
    impact: 0.10,
  };

  const finalScore = Math.round(
    keywordResult.score * weights.keywords +
    formattingResult.score * weights.formatting +
    sectionResult.score * weights.sections +
    actionVerbResult.score * weights.actionVerbs +
    impactResult.score * weights.impact
  );

  // Generate improvement suggestions
  const suggestions = [
    ...formattingResult.issues,
    sectionResult.missing.length > 0 && `Add missing sections: ${sectionResult.missing.join(', ')}`,
    actionVerbResult.weakBullets > 0 && `Replace weak phrases in ${actionVerbResult.weakBullets} bullet(s)`,
    impactResult.score < 40 && 'Add measurable metrics (%, $, numbers) to your bullets',
    keywordResult.missing.length > 5 && `Include missing keywords: ${keywordResult.missing.slice(0, 5).join(', ')}`,
  ].filter(Boolean);

  return {
    score: Math.min(finalScore, 100),
    breakdown: {
      keywordMatch: keywordResult.score,
      formatting: formattingResult.score,
      sectionCoverage: sectionResult.score,
      actionVerbs: actionVerbResult.score,
      quantifiedImpact: impactResult.score,
    },
    keywordsFound: keywordResult.found,
    keywordsMissing: keywordResult.missing,
    sectionsPresent: sectionResult.present,
    sectionsMissing: sectionResult.missing,
    suggestions: suggestions.slice(0, 5),
    actionVerbStats: actionVerbResult,
    impactStats: impactResult,
  };
}

module.exports = { calculateATSScore };
