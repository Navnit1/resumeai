// src/components/resume/ResumePaper.jsx
import React from 'react';

const TEMPLATE_STYLES = {
  modern: {
    headerBg: 'bg-gradient-to-r from-slate-900 to-indigo-950',
    headerText: 'text-white',
    accentColor: '#6C63FF',
    accentClass: 'text-indigo-600',
    sectionTitleClass: 'text-indigo-700 border-indigo-400',
    skillBg: 'bg-indigo-50 text-indigo-700',
  },
  classic: {
    headerBg: 'bg-white border-b-2 border-black',
    headerText: 'text-black',
    accentColor: '#000000',
    accentClass: 'text-black',
    sectionTitleClass: 'text-black border-black',
    skillBg: 'bg-gray-100 text-gray-700',
  },
  minimal: {
    headerBg: 'bg-white',
    headerText: 'text-gray-900',
    accentColor: '#374151',
    accentClass: 'text-gray-700',
    sectionTitleClass: 'text-gray-500 border-gray-300',
    skillBg: 'bg-gray-100 text-gray-600',
  },
  executive: {
    headerBg: 'bg-slate-800',
    headerText: 'text-white',
    accentColor: '#B8860B',
    accentClass: 'text-yellow-700',
    sectionTitleClass: 'text-yellow-700 border-yellow-600',
    skillBg: 'bg-yellow-50 text-yellow-800',
  },
};

export default function ResumePaper({ data }) {
  if (!data) return null;

  const { personal = {}, summary = '', experience = [], education = [], skills = [], projects = [], template = 'modern' } = data;
  const s = TEMPLATE_STYLES[template] || TEMPLATE_STYLES.modern;

  return (
    <div
      className="bg-white rounded-lg overflow-hidden shadow-2xl mx-auto"
      style={{ maxWidth: 680, fontFamily: template === 'classic' ? "'Times New Roman', serif" : "'Segoe UI', Arial, sans-serif", fontSize: 11 }}
    >
      {/* Header */}
      <div className={`${s.headerBg} px-7 py-6`}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: s.headerText === 'text-white' ? '#fff' : '#111', margin: 0 }}>
          {personal.name || 'Your Name'}
        </h1>
        {personal.title && (
          <p style={{ fontSize: 13, color: s.headerText === 'text-white' ? '#c7d2fe' : s.accentColor, marginTop: 2, marginBottom: 0 }}>
            {personal.title}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8, fontSize: 10, color: s.headerText === 'text-white' ? '#a5b4fc' : '#555' }}>
          {personal.email && <span>✉ {personal.email}</span>}
          {personal.phone && <span>📞 {personal.phone}</span>}
          {personal.location && <span>📍 {personal.location}</span>}
          {personal.linkedin && <span>🔗 {personal.linkedin}</span>}
          {personal.github && <span>💻 {personal.github}</span>}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 28px 24px' }}>
        {/* Summary */}
        {summary && (
          <Section title="Professional Summary" s={s}>
            <p style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.6, margin: 0 }}>{summary}</p>
          </Section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <Section title="Experience" s={s}>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experience.length - 1 ? 12 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 11.5, color: '#111' }}>{exp.title}</span>
                    {exp.company && <span style={{ fontSize: 10.5, color: s.accentColor, marginLeft: 5 }}>@ {exp.company}</span>}
                  </div>
                  <span style={{ fontSize: 9.5, color: '#6B7280', flexShrink: 0 }}>{exp.dates}</span>
                </div>
                {(exp.bullets || []).length > 0 && (
                  <ul style={{ marginTop: 4, paddingLeft: 14, marginBottom: 0 }}>
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} style={{ fontSize: 10.5, color: '#374151', marginBottom: 2, lineHeight: 1.4 }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </Section>
        )}

        {/* Education */}
        {education.length > 0 && (
          <Section title="Education" s={s}>
            {education.map((edu, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 11 }}>{edu.degree}</span>
                  {edu.school && <span style={{ fontSize: 10.5, color: s.accentColor, marginLeft: 4 }}>– {edu.school}</span>}
                </div>
                <div style={{ textAlign: 'right', fontSize: 9.5, color: '#6B7280' }}>
                  <div>{edu.dates}</div>
                  {edu.gpa && <div>GPA: {edu.gpa}</div>}
                </div>
              </div>
            ))}
          </Section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <Section title="Technical Skills" s={s}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {skills.map((skill, i) => (
                <span
                  key={i}
                  style={{
                    background: '#EEF2FF', color: '#4338CA',
                    padding: '2px 9px', borderRadius: 4,
                    fontSize: 9.5, fontWeight: 600,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <Section title="Projects" s={s}>
            {projects.map((proj, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 11 }}>{proj.name}</span>
                {proj.link && <span style={{ fontSize: 9.5, color: s.accentColor, marginLeft: 5 }}>{proj.link}</span>}
                {proj.description && (
                  <p style={{ fontSize: 10, color: '#6B7280', marginTop: 2, marginBottom: 0 }}>{proj.description}</p>
                )}
              </div>
            ))}
          </Section>
        )}

        {!personal.name && !summary && experience.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>📄</div>
            <div style={{ fontSize: 12 }}>Fill in the form to see your resume preview</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, s, children }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '1px', color: s.accentColor,
        borderBottom: `2px solid ${s.accentColor}`,
        paddingBottom: 3, marginBottom: 8,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}
