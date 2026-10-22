import React from 'react';
import { Mail, Phone, MapPin, Globe, ExternalLink, Link2 } from 'lucide-react';

export default function ResumePreview({ resumeData, id = 'resume-printable-area' }) {
  const {
    personalInfo = {},
    summary = '',
    education = [],
    skills = { languages: [], frameworks: [], tools: [], softSkills: [] },
    experience = [],
    projects = [],
    certifications = [],
    achievements = [],
  } = resumeData || {};

  return (
    <div
      id={id}
      className="bg-white text-slate-800 p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200 max-w-4xl mx-auto font-sans leading-normal text-xs sm:text-sm print:border-none print:shadow-none print:p-0"
    >
      {/* Header / Contact Info */}
      <div className="border-b-2 border-slate-900 pb-4 mb-5 text-center sm:text-left sm:flex sm:justify-between sm:items-end">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {personalInfo.fullName || 'Your Full Name'}
          </h1>
          <p className="text-sm font-bold text-primary-700 mt-0.5">
            {resumeData?.targetRole || 'Aspiring Software Engineer / Analyst'}
          </p>
        </div>

        <div className="mt-3 sm:mt-0 flex flex-wrap justify-center sm:justify-end gap-x-3 gap-y-1 text-[11px] text-slate-600">
          {personalInfo.email && (
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-slate-400" />
              {personalInfo.email}
            </span>
          )}
          {personalInfo.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {personalInfo.location}
            </span>
          )}
          {personalInfo.linkedin && (
            <span className="flex items-center gap-1">
              <Link2 className="w-3 h-3 text-slate-400" />
              {personalInfo.linkedin}
            </span>
          )}
          {personalInfo.github && (
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3 text-slate-400" />
              {personalInfo.github}
            </span>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
            Professional Summary
          </h2>
          <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">{summary}</p>
        </div>
      )}

      {/* Technical Skills */}
      {(skills.languages?.length > 0 ||
        skills.frameworks?.length > 0 ||
        skills.tools?.length > 0 ||
        skills.softSkills?.length > 0) && (
        <div className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
            Technical Skills
          </h2>
          <div className="space-y-1 text-xs">
            {skills.languages?.length > 0 && (
              <p>
                <strong className="text-slate-900">Languages:</strong>{' '}
                <span className="text-slate-700">{skills.languages.join(', ')}</span>
              </p>
            )}
            {skills.frameworks?.length > 0 && (
              <p>
                <strong className="text-slate-900">Frameworks &amp; Libraries:</strong>{' '}
                <span className="text-slate-700">{skills.frameworks.join(', ')}</span>
              </p>
            )}
            {skills.tools?.length > 0 && (
              <p>
                <strong className="text-slate-900">Tools &amp; Databases:</strong>{' '}
                <span className="text-slate-700">{skills.tools.join(', ')}</span>
              </p>
            )}
            {skills.softSkills?.length > 0 && (
              <p>
                <strong className="text-slate-900">Core Competencies:</strong>{' '}
                <span className="text-slate-700">{skills.softSkills.join(', ')}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Experience / Internships */}
      {experience?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
            Experience &amp; Internships
          </h2>
          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline font-bold text-xs sm:text-sm">
                  <span className="text-slate-900">{exp.title}</span>
                  <span className="text-slate-500 text-[11px] font-medium">
                    {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-primary-700 font-semibold mb-1">
                  <span>{exp.company}</span>
                  {exp.location && <span className="text-slate-400 font-normal">{exp.location}</span>}
                </div>
                {exp.description && (
                  <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
            Key Projects
          </h2>
          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline font-bold text-xs sm:text-sm">
                  <span className="text-slate-900 flex items-center gap-1.5">
                    {proj.title}
                    {proj.link && (
                      <span className="text-[10px] text-primary-600 font-normal">
                        ({proj.link})
                      </span>
                    )}
                  </span>
                </div>
                {proj.technologies?.length > 0 && (
                  <p className="text-[11px] font-semibold text-slate-500 mb-1">
                    Tech Stack: {proj.technologies.join(', ')}
                  </p>
                )}
                {proj.description && (
                  <p className="text-slate-600 text-xs leading-relaxed">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <div className="mb-5">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2.5">
            Education
          </h2>
          <div className="space-y-2.5">
            {education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs sm:text-sm">
                <div>
                  <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                  <p className="text-xs text-slate-600">{edu.institution} {edu.location ? `· ${edu.location}` : ''}</p>
                  {edu.grade && <p className="text-[11px] font-semibold text-primary-700">Grade / CGPA: {edu.grade}</p>}
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications & Achievements */}
      {(certifications?.length > 0 || achievements?.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {certifications?.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                Certifications
              </h2>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                {certifications.map((c, i) => (
                  <li key={i}>
                    <strong>{c.name}</strong> {c.issuer ? `– ${c.issuer}` : ''} {c.date ? `(${c.date})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {achievements?.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1 mb-2">
                Key Achievements
              </h2>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                {achievements.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
