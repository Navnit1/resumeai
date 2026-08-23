const OpenAI = require('openai');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');
const User = require('../models/User.model');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Track AI usage ───────────────────────────────────────────────────────────
const trackAIUsage = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    $inc: { 'stats.aiGenerations': 1 },
  });
};

// ─── Base AI call ─────────────────────────────────────────────────────────────
const callAI = async (systemPrompt, userPrompt, maxTokens = 800) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: maxTokens,
    temperature: 0.7,
  });
  return response.choices[0].message.content.trim();
};

// ─── Generate Professional Summary ────────────────────────────────────────────
exports.generateSummary = asyncHandler(async (req, res, next) => {
  const { jobTitle, yearsOfExperience, skills, achievements, industry } = req.body;

  if (!jobTitle) {
    return next(new AppError('Job title is required', 400));
  }

  const systemPrompt = `You are an expert resume writer who creates compelling, ATS-optimized professional summaries. 
Write in first person implied voice (no "I"). Use strong action verbs and quantifiable impact. 
Keep it 3-4 sentences, 60-80 words. Be specific and impactful.`;

  const userPrompt = `Create a professional resume summary for:
- Job Title: ${jobTitle}
- Years of Experience: ${yearsOfExperience || 'Not specified'}
- Key Skills: ${skills?.join(', ') || 'Not specified'}
- Key Achievements: ${achievements || 'Not specified'}
- Industry: ${industry || 'Technology'}

Write ONLY the summary text, no labels or explanations.`;

  const summary = await callAI(systemPrompt, userPrompt);
  await trackAIUsage(req.user.id);

  res.json({ success: true, summary });
});

// ─── Generate Experience Bullet Points ────────────────────────────────────────
exports.generateBullets = asyncHandler(async (req, res, next) => {
  const { jobTitle, company, responsibilities, industry, count = 4 } = req.body;

  if (!jobTitle || !responsibilities) {
    return next(new AppError('Job title and responsibilities are required', 400));
  }

  const systemPrompt = `You are an expert resume writer specializing in impactful bullet points.
Create bullets using the STAR format (Situation/Task-Action-Result).
Rules:
- Start each bullet with a strong action verb (Led, Built, Increased, Reduced, etc.)
- Include realistic quantifiable metrics (%, $, time saved, team size)
- Keep each bullet 1-2 lines
- Be specific to the role and industry
- Optimize for ATS keyword inclusion`;

  const userPrompt = `Generate ${count} powerful resume bullet points for:
- Job Title: ${jobTitle}
- Company/Industry: ${company || industry || 'tech company'}
- Responsibilities/Tasks: ${responsibilities}

Format: Return ONLY the bullet points, one per line, starting with •`;

  const response = await callAI(systemPrompt, userPrompt, 600);
  const bullets = response
    .split('\n')
    .filter((line) => line.trim().startsWith('•') || line.trim().startsWith('-'))
    .map((line) => line.replace(/^[•\-]\s*/, '').trim())
    .filter(Boolean);

  await trackAIUsage(req.user.id);

  res.json({ success: true, bullets });
});

// ─── ATS Keyword Analysis ─────────────────────────────────────────────────────
exports.extractKeywords = asyncHandler(async (req, res, next) => {
  const { jobDescription, jobTitle } = req.body;

  if (!jobDescription) {
    return next(new AppError('Job description is required', 400));
  }

  const systemPrompt = `You are an ATS (Applicant Tracking System) expert who identifies critical keywords from job descriptions.
Categorize keywords and rank them by importance for ATS parsing.
Return valid JSON only.`;

  const userPrompt = `Extract and categorize the top ATS keywords from this job description.

Job Title: ${jobTitle || 'Not specified'}
Job Description:
${jobDescription.slice(0, 2000)}

Return JSON in this exact format:
{
  "technical": ["keyword1", "keyword2"],
  "softSkills": ["keyword1", "keyword2"],
  "industry": ["keyword1", "keyword2"],
  "tools": ["keyword1", "keyword2"],
  "certifications": ["keyword1"],
  "mustHave": ["top 5 most critical keywords"]
}`;

  const response = await callAI(systemPrompt, userPrompt, 500);
  let keywords;
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    keywords = JSON.parse(jsonMatch ? jsonMatch[0] : response);
  } catch {
    keywords = { raw: response };
  }

  await trackAIUsage(req.user.id);

  res.json({ success: true, keywords });
});

// ─── Optimize Resume Content ──────────────────────────────────────────────────
exports.optimizeContent = asyncHandler(async (req, res, next) => {
  const { text, optimizationGoal, targetRole } = req.body;

  if (!text) {
    return next(new AppError('Text content is required', 400));
  }

  const goals = {
    'action-verbs': 'Replace weak verbs with strong action verbs. Make each bullet start with a power verb.',
    'metrics': 'Add realistic quantifiable metrics and data points to make achievements concrete.',
    'ats': 'Optimize for ATS systems by adding relevant keywords and industry terminology.',
    'grammar': 'Fix grammar, clarity, and professional tone. Remove filler words.',
    'concise': 'Make the content more concise and impactful. Remove redundancy.',
  };

  const systemPrompt = `You are an expert resume writer and career coach.
Goal: ${goals[optimizationGoal] || goals['action-verbs']}
Preserve the original meaning while making significant improvements.
Return ONLY the improved text, no explanations.`;

  const userPrompt = `Target Role: ${targetRole || 'Professional'}\n\nImprove this resume content:\n${text}`;

  const optimized = await callAI(systemPrompt, userPrompt, 800);
  await trackAIUsage(req.user.id);

  res.json({ success: true, optimized });
});

// ─── Full Resume AI Analysis ──────────────────────────────────────────────────
exports.analyzeResume = asyncHandler(async (req, res, next) => {
  const { resumeData, jobDescription } = req.body;

  const systemPrompt = `You are a professional resume reviewer and career coach.
Provide specific, actionable feedback. Be direct and helpful.
Return valid JSON only.`;

  const userPrompt = `Analyze this resume and provide detailed feedback.

Resume:
Name: ${resumeData.personal?.name}
Title: ${resumeData.personal?.title}
Summary: ${resumeData.summary}
Experience: ${resumeData.experience?.map((e) => `${e.title} at ${e.company}: ${e.bullets?.join(', ')}`).join('\n')}
Skills: ${resumeData.skills?.join(', ')}
Education: ${resumeData.education?.map((e) => `${e.degree} from ${e.school}`).join(', ')}

${jobDescription ? `Target Job Description:\n${jobDescription.slice(0, 1000)}` : ''}

Return JSON:
{
  "overallScore": 75,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "suggestions": [
    {"section": "summary", "issue": "...", "fix": "..."},
    {"section": "experience", "issue": "...", "fix": "..."}
  ],
  "missingElements": ["element1", "element2"],
  "atsCompatibility": "Good/Fair/Poor",
  "topRecommendation": "single most important thing to improve"
}`;

  const response = await callAI(systemPrompt, userPrompt, 1200);
  let analysis;
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    analysis = JSON.parse(jsonMatch ? jsonMatch[0] : response);
  } catch {
    analysis = { raw: response };
  }

  await trackAIUsage(req.user.id);

  res.json({ success: true, analysis });
});

// ─── Generate Skills Suggestions ──────────────────────────────────────────────
exports.suggestSkills = asyncHandler(async (req, res, next) => {
  const { jobTitle, currentSkills, industry } = req.body;

  const systemPrompt = `You are a technical recruiter who knows exactly which skills are valued for each role.
Suggest skills that are: (1) currently in-demand, (2) ATS-searchable, (3) realistic for the role level.`;

  const userPrompt = `Suggest 12 high-value skills for a ${jobTitle} in the ${industry || 'technology'} industry.
Current skills: ${currentSkills?.join(', ') || 'None listed'}
Focus on skills NOT already listed. Include a mix of technical tools and soft skills.
Return as a simple comma-separated list, nothing else.`;

  const response = await callAI(systemPrompt, userPrompt, 200);
  const skills = response.split(',').map((s) => s.trim()).filter(Boolean);

  await trackAIUsage(req.user.id);

  res.json({ success: true, skills });
});

// ─── Improve Grammar & Impact ─────────────────────────────────────────────────
exports.improveSentence = asyncHandler(async (req, res, next) => {
  const { text, context } = req.body;

  const systemPrompt = `You are a professional resume editor. Improve the given text to be:
- More impactful and action-oriented
- Grammatically perfect
- Concise and powerful
- ATS-friendly
Return ONLY the improved text.`;

  const improved = await callAI(systemPrompt, `Context: ${context || 'resume bullet'}\n\nImprove: ${text}`, 300);
  await trackAIUsage(req.user.id);

  res.json({ success: true, improved });
});
