// services/job.service.js
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');
const { AppError } = require('../utils/AppError');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Extract raw text from an uploaded resume file ────────────────────────────
// Supports PDF out of the box. Plain .txt is handled directly by the caller.
exports.extractResumeText = async (fileBuffer, mimetype) => {
  if (mimetype === 'application/pdf') {
    const data = await pdfParse(fileBuffer);
    return data.text;
  }
  if (mimetype === 'text/plain') {
    return fileBuffer.toString('utf-8');
  }
  throw new AppError('Only PDF or TXT resumes are supported for job matching', 400);
};

// ─── Use AI to turn raw resume text (or structured resume) into a search profile ──
exports.buildSearchProfile = async ({ resumeText, structuredResume, targetRole }) => {
  // If the user already picked a target role explicitly, skip the AI call —
  // just pull skills for context so results stay reasonably specific.
  const source = structuredResume
    ? `Title: ${structuredResume.personal?.title || ''}
Summary: ${structuredResume.summary || ''}
Experience: ${structuredResume.experience?.map((e) => `${e.title} at ${e.company}`).join('; ') || ''}
Skills: ${structuredResume.skills?.join(', ') || ''}`
    : (resumeText || '').slice(0, 6000);

  const systemPrompt = `You are a career-matching assistant. Given resume content, identify the single best-fit
job title to search for on job boards, plus a short list of the most relevant hard-skill keywords.
Be realistic about seniority (e.g. "Senior Backend Engineer" not just "Engineer" if experience shows 5+ years).
Return valid JSON only, no markdown fences.`;

  const userPrompt = `Resume content:
${source}

${targetRole ? `The candidate has also indicated they want to target this role: "${targetRole}". Use it unless it clearly conflicts with the resume.` : ''}

Return JSON in this exact format:
{
  "role": "best-fit job title to search for",
  "keywords": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "seniority": "entry|mid|senior|lead"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 300,
    temperature: 0.4,
  });

  const raw = response.choices[0].message.content.trim();
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : raw);
  } catch {
    return { role: targetRole || 'Software Engineer', keywords: [], seniority: 'mid' };
  }
};

// ─── Query Adzuna for job listings ─────────────────────────────────────────────
// Docs: https://developer.adzuna.com/docs/search
exports.searchJobs = async ({ what, where, country = 'in', page = 1, resultsPerPage = 20 }) => {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    throw new AppError(
      'Job search is not configured yet. Add ADZUNA_APP_ID and ADZUNA_APP_KEY to backend/.env',
      500
    );
  }

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: String(resultsPerPage),
    'content-type': 'application/json',
  });

  if (what) params.set('what', what);
  if (where) params.set('where', where);

  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new AppError(`Job search provider error (${res.status}): ${text.slice(0, 200)}`, 502);
  }

  const data = await res.json();

  const results = (data.results || []).map((job) => ({
    id: job.id,
    title: job.title?.replace(/<[^>]*>/g, '') || 'Untitled role',
    company: job.company?.display_name || 'Unknown company',
    location: job.location?.display_name || where || 'Not specified',
    salaryMin: job.salary_min ? Math.round(job.salary_min) : null,
    salaryMax: job.salary_max ? Math.round(job.salary_max) : null,
    contractType: job.contract_time || job.contract_type || null,
    category: job.category?.label || null,
    description: (job.description || '').replace(/<[^>]*>/g, '').slice(0, 280),
    url: job.redirect_url,
    created: job.created,
  }));

  return {
    results,
    count: data.count || 0,
    page,
    resultsPerPage,
  };
};
