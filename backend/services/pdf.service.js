const puppeteer = require('puppeteer');

/**
 * Resume PDF Generation Service
 * Uses Puppeteer to render HTML templates and generate PDF
 */

/**
 * Generate PDF from resume data
 */
async function generatePDF(resume) {
  // templates object is defined AFTER functions below — safe to reference here
  // because this function is only called at runtime, not at parse time
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    const templateFn = templates[resume.template] || templates.modern;
    const html = templateFn(resume);

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

// ─── Modern Template ──────────────────────────────────────────────────────────
function modernTemplate(resume) {
  const p = resume.personal || {};
  const skills = resume.skills || [];
  const experience = resume.experience || [];
  const education = resume.education || [];
  const projects = resume.projects || [];

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1a1a2e; line-height: 1.5; }
  .header { background: linear-gradient(135deg, #1a1a2e, #2d2d6e); color: white; padding: 28px 30px; }
  .name { font-size: 26px; font-weight: 700; letter-spacing: -0.5px; }
  .title { font-size: 14px; color: #a0a8ff; margin-top: 3px; }
  .contact { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; font-size: 10px; color: #c0c8ff; }
  .contact span::before { content: ''; }
  .body { padding: 20px 30px; }
  .section { margin-top: 18px; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #5b50cc; border-bottom: 2px solid #5b50cc; padding-bottom: 4px; margin-bottom: 10px; }
  .summary { font-size: 11px; color: #333; line-height: 1.6; }
  .exp-item { margin-bottom: 12px; }
  .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
  .exp-title { font-weight: 700; font-size: 12px; }
  .exp-company { font-size: 11px; color: #5b50cc; }
  .exp-dates { font-size: 10px; color: #888; }
  .bullets { margin-top: 4px; padding-left: 14px; }
  .bullets li { margin-bottom: 2px; font-size: 10.5px; color: #333; }
  .skills-grid { display: flex; flex-wrap: wrap; gap: 5px; }
  .skill { background: #f0efff; color: #5b50cc; padding: 3px 10px; border-radius: 4px; font-size: 10px; font-weight: 600; }
  .edu-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
  .edu-degree { font-weight: 700; font-size: 11px; }
  .edu-school { color: #5b50cc; font-size: 10.5px; }
  .project-item { margin-bottom: 8px; }
  .project-name { font-weight: 700; font-size: 11px; }
  .divider { height: 1px; background: #e0e0e0; margin: 4px 0; }
  a { color: #5b50cc; text-decoration: none; }
</style>
</head>
<body>
<div class="header">
  <div class="name">${p.name || 'Your Name'}</div>
  <div class="title">${p.title || ''}</div>
  <div class="contact">
    ${p.email ? `<span>✉ ${p.email}</span>` : ''}
    ${p.phone ? `<span>📞 ${p.phone}</span>` : ''}
    ${p.location ? `<span>📍 ${p.location}</span>` : ''}
    ${p.linkedin ? `<span>🔗 ${p.linkedin}</span>` : ''}
    ${p.github ? `<span>💻 ${p.github}</span>` : ''}
  </div>
</div>
<div class="body">
  ${resume.summary ? `
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <div class="summary">${resume.summary}</div>
  </div>` : ''}

  ${experience.length > 0 ? `
  <div class="section">
    <div class="section-title">Experience</div>
    ${experience.map((e) => `
    <div class="exp-item">
      <div class="exp-header">
        <div>
          <span class="exp-title">${e.title}</span>
          <span class="exp-company"> · ${e.company}</span>
        </div>
        <span class="exp-dates">${e.dates || ''}</span>
      </div>
      ${e.bullets?.length > 0 ? `<ul class="bullets">${e.bullets.map((b) => `<li>${b}</li>`).join('')}</ul>` : ''}
    </div>
    `).join('')}
  </div>` : ''}

  ${education.length > 0 ? `
  <div class="section">
    <div class="section-title">Education</div>
    ${education.map((e) => `
    <div class="edu-item">
      <div>
        <div class="edu-degree">${e.degree}</div>
        <div class="edu-school">${e.school}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;color:#888">${e.dates || ''}</div>
        ${e.gpa ? `<div style="font-size:10px;color:#555">GPA: ${e.gpa}</div>` : ''}
      </div>
    </div>
    `).join('')}
  </div>` : ''}

  ${skills.length > 0 ? `
  <div class="section">
    <div class="section-title">Technical Skills</div>
    <div class="skills-grid">${skills.map((s) => `<span class="skill">${s}</span>`).join('')}</div>
  </div>` : ''}

  ${projects.length > 0 ? `
  <div class="section">
    <div class="section-title">Projects</div>
    ${projects.map((p) => `
    <div class="project-item">
      <span class="project-name">${p.name}</span>
      ${p.link ? ` · <a href="https://${p.link}">${p.link}</a>` : ''}
      ${p.description ? `<div style="font-size:10px;color:#555;margin-top:2px">${p.description}</div>` : ''}
    </div>
    `).join('')}
  </div>` : ''}
</div>
</body>
</html>`;
}

// ─── Classic Template ─────────────────────────────────────────────────────────
function classicTemplate(resume) {
  const p = resume.personal || {};
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Times New Roman', serif; font-size: 11px; color: #000; margin: 0; padding: 20px 30px; }
  .name { font-size: 22px; font-weight: bold; text-align: center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 4px; }
  .contact { text-align: center; font-size: 10px; margin-bottom: 12px; }
  .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #000; margin: 12px 0 6px; }
  .exp-header { display: flex; justify-content: space-between; font-weight: bold; }
  .bullets { padding-left: 14px; }
  .bullets li { margin-bottom: 1px; }
  .skill-list { columns: 3; font-size: 10px; }
</style>
</head>
<body>
  <div class="name">${p.name || 'Your Name'}</div>
  <div class="contact">${[p.email, p.phone, p.location].filter(Boolean).join(' | ')}</div>
  ${resume.summary ? `<div class="section-title">Summary</div><p style="font-size:10.5px">${resume.summary}</p>` : ''}
  ${(resume.experience || []).length > 0 ? `<div class="section-title">Experience</div>${resume.experience.map(e => `
    <div class="exp-header"><span>${e.title} — ${e.company}</span><span>${e.dates || ''}</span></div>
    <ul class="bullets">${(e.bullets || []).map(b => `<li>${b}</li>`).join('')}</ul>`).join('')}` : ''}
  ${(resume.education || []).length > 0 ? `<div class="section-title">Education</div>${resume.education.map(e => `
    <div class="exp-header"><span>${e.degree} — ${e.school}</span><span>${e.dates || ''}</span></div>`).join('')}` : ''}
  ${(resume.skills || []).length > 0 ? `<div class="section-title">Skills</div><div class="skill-list">${resume.skills.map(s => `<div>• ${s}</div>`).join('')}</div>` : ''}
</body></html>`;
}

function minimalTemplate(resume) { return modernTemplate({ ...resume, template: 'modern' }); }
function executiveTemplate(resume) { return classicTemplate({ ...resume, template: 'classic' }); }

// ─── Template Map (defined AFTER functions to avoid hoisting issues) ──────────
const templates = {
  modern: modernTemplate,
  classic: classicTemplate,
  minimal: minimalTemplate,
  executive: executiveTemplate,
};

module.exports = { generatePDF };
