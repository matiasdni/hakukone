"use client";

import React from "react";
import { ResumeData, SectionConfig } from "@/types";
import { Mail, Phone, MapPin, Linkedin, Github } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { clsx } from "clsx";

interface ResumePreviewProps {
  data: ResumeData;
}

const ContentRenderer = ({
  content,
  className,
}: {
  content: string;
  className?: string;
}) => {
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  if (isHtml) {
    return (
      <div
        className={clsx(
          "mb-1 text-sm leading-relaxed [&>li]:mb-0.5 [&>li]:pl-1 [&>ol]:ml-4 [&>ol]:list-decimal [&>p]:mb-1.5 [&>ul]:ml-4 [&>ul]:list-disc",
          className
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          p: ({ ...props }) => (
            <p
              className="mb-1.5 text-sm leading-relaxed whitespace-pre-wrap"
              {...props}
            />
          ),
          ul: ({ ...props }) => (
            <ul
              className="mb-1 ml-3.5 list-outside list-disc text-sm leading-relaxed"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="mb-1 ml-3.5 list-outside list-decimal text-sm leading-relaxed"
              {...props}
            />
          ),
          li: ({ ...props }) => <li className="mb-0.5 pl-0.5" {...props} />,
          strong: ({ ...props }) => (
            <strong className="font-semibold" {...props} />
          ),
          em: ({ ...props }) => <em className="italic" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const ResumePreview: React.FC<ResumePreviewProps> = ({ data }) => {
  const template = data.templateId || "modern";
  const theme = data.theme || { primaryColor: "#2563eb", fontFamily: "sans" };

  const getFontClass = () => {
    switch (theme.fontFamily) {
      case "serif":
        return "font-serif";
      case "mono":
        return "font-mono";
      default:
        return "font-sans";
    }
  };

  const renderSectionContent = (
    config: SectionConfig,
    styles: Record<string, string>
  ) => {
    switch (config.type) {
      case "summary":
        if (!data.summary) return null;
        return (
          <section key={config.id} className={styles.section}>
            <h2
              className={styles.heading}
              style={{
                color: template === "modern" ? undefined : theme.primaryColor,
              }}
            >
              Profile
            </h2>
            <ContentRenderer content={data.summary} className={styles.text} />
          </section>
        );
      case "experience":
        if (data.experience.length === 0) return null;
        return (
          <section key={config.id} className={styles.section}>
            <h2
              className={styles.heading}
              style={{
                color: template === "modern" ? undefined : theme.primaryColor,
              }}
            >
              Experience
            </h2>
            <div className={styles.itemGap}>
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemTitle}>{exp.role}</h3>
                    <span className={styles.itemDate}>
                      {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <div
                    className={styles.itemSubtitle}
                    style={{ color: theme.primaryColor }}
                  >
                    {exp.company}
                  </div>
                  <ContentRenderer
                    content={exp.description}
                    className={styles.text}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      case "education":
        if (data.education.length === 0) return null;
        return (
          <section key={config.id} className={styles.section}>
            <h2
              className={styles.heading}
              style={{
                color: template === "modern" ? undefined : theme.primaryColor,
              }}
            >
              Education
            </h2>
            <div className={styles.itemGap}>
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemTitle}>{edu.school}</h3>
                    <span className={styles.itemDate}>{edu.year}</span>
                  </div>
                  <div className={styles.text}>{edu.degree}</div>
                </div>
              ))}
            </div>
          </section>
        );
      case "skills":
        if (data.skills.length === 0) return null;
        return (
          <section key={config.id} className={styles.section}>
            <h2
              className={styles.heading}
              style={{
                color: template === "modern" ? undefined : theme.primaryColor,
              }}
            >
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span key={index} className={styles.skillTag}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        );
      case "certifications":
        if (!data.certifications || data.certifications.length === 0)
          return null;
        return (
          <section key={config.id} className={styles.section}>
            <h2
              className={styles.heading}
              style={{
                color: template === "modern" ? undefined : theme.primaryColor,
              }}
            >
              Certifications
            </h2>
            <div className={styles.itemGap}>
              {data.certifications.map((cert) => (
                <div key={cert.id}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemTitle}>{cert.name}</h3>
                    <span className={styles.itemDate}>{cert.date}</span>
                  </div>
                  <div
                    className={styles.itemSubtitle}
                    style={{ color: theme.primaryColor }}
                  >
                    {cert.issuer}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      case "languages":
        if (!data.languages || data.languages.length === 0) return null;
        return (
          <section key={config.id} className={styles.section}>
            <h2
              className={styles.heading}
              style={{
                color: template === "modern" ? undefined : theme.primaryColor,
              }}
            >
              Languages
            </h2>
            <div className="grid grid-cols-2 gap-y-2">
              {data.languages.map((lang) => (
                <div
                  key={lang.id}
                  className="mr-4 flex justify-between border-b border-slate-100 pb-1"
                >
                  <span className="font-medium text-slate-700">
                    {lang.name}
                  </span>
                  <span className="text-sm text-slate-500 italic">
                    {lang.level}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );
      case "custom": {
        const section = data.customSections.find((s) => s.id === config.id);
        if (!section || section.items.length === 0) return null;
        return (
          <section key={config.id} className={styles.section}>
            <h2
              className={styles.heading}
              style={{
                color: template === "modern" ? undefined : theme.primaryColor,
              }}
            >
              {section.title}
            </h2>
            <div className={styles.itemGap}>
              {section.items.map((item) => (
                <div key={item.id}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemTitle}>{item.title}</h3>
                    <span className={styles.itemDate}>{item.date}</span>
                  </div>
                  {item.subtitle && (
                    <div
                      className={styles.itemSubtitle}
                      style={{ color: theme.primaryColor }}
                    >
                      {item.subtitle}
                    </div>
                  )}
                  <ContentRenderer
                    content={item.description}
                    className={styles.text}
                  />
                </div>
              ))}
            </div>
          </section>
        );
      }
      default:
        return null;
    }
  };

  // Modern Template
  if (template === "modern") {
    const styles = {
      section: "mb-8",
      heading:
        "text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-1.5",
      text: "text-slate-700",
      itemGap: "space-y-6",
      itemHeader: "flex justify-between items-baseline mb-1",
      itemTitle: "text-base font-bold text-slate-900",
      itemDate: "text-xs text-slate-500 font-medium",
      itemSubtitle: "text-sm font-medium mb-2",
      skillTag:
        "px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full",
    };

    return (
      <div
        className={clsx(
          "mx-auto min-h-[297mm] w-[210mm] bg-white p-12 text-slate-800 shadow-2xl shadow-slate-300 transition-all duration-300",
          getFontClass()
        )}
        id="resume-preview"
      >
        <header className="mb-8 flex items-start gap-6 border-b border-slate-200 pb-8">
          {data.photoUrl && (
            /* eslint-disable-next-line @next/next/no-img-element -- Dynamic user-uploaded photo with data URL */
            <img
              src={data.photoUrl}
              alt="Profile"
              className="h-24 w-24 rounded-full border-4 border-slate-50 object-cover shadow-sm"
            />
          )}
          <div className="flex-1">
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900">
              {data.fullName || "Your Name"}
            </h1>
            <p
              className="mb-4 text-lg font-medium"
              style={{ color: theme.primaryColor }}
            >
              {data.title || "Professional Title"}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
              {data.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  <span>{data.email}</span>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  <span>{data.phone}</span>
                </div>
              )}
              {data.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{data.location}</span>
                </div>
              )}
              {data.socialLinks?.map(
                (link, i) =>
                  link.url && (
                    <div key={i} className="flex items-center gap-1.5">
                      {link.platform === "linkedin" ? (
                        <Linkedin className="h-4 w-4" />
                      ) : (
                        <Github className="h-4 w-4" />
                      )}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {link.url.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )
              )}
            </div>
          </div>
        </header>
        {data.sectionOrder.map((config) =>
          renderSectionContent(config, styles)
        )}
      </div>
    );
  }

  // Minimal Template
  if (template === "minimal") {
    const styles = {
      section: "mb-8",
      heading:
        "text-xs font-bold uppercase tracking-widest mb-4 border-b border-black pb-1",
      text: "text-gray-800 leading-relaxed",
      itemGap: "space-y-5",
      itemHeader: "flex justify-between items-baseline mb-0",
      itemTitle: "text-lg font-bold text-black",
      itemDate: "text-sm text-gray-500 italic",
      itemSubtitle: "text-base text-gray-700 italic mb-1",
      skillTag: "text-sm text-gray-800 border-b border-gray-300 mr-4 pb-0.5",
    };

    return (
      <div
        className={clsx(
          "mx-auto min-h-[297mm] w-[210mm] bg-white p-14 text-black shadow-2xl shadow-gray-300 transition-all duration-300",
          getFontClass()
        )}
        id="resume-preview"
      >
        <header className="mb-12 text-center">
          {data.photoUrl && (
            /* eslint-disable-next-line @next/next/no-img-element -- Dynamic user-uploaded photo with data URL */
            <img
              src={data.photoUrl}
              alt="Profile"
              className="mx-auto mb-4 h-20 w-20 rounded-full object-cover grayscale"
            />
          )}
          <h1 className="mb-2 text-3xl font-normal tracking-wide text-black uppercase">
            {data.fullName || "Your Name"}
          </h1>
          <p className="mb-6 text-sm font-medium tracking-widest text-gray-500 uppercase">
            {data.title || "Professional Title"}
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-gray-600">
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.location && <span>{data.location}</span>}
          </div>
        </header>
        {data.sectionOrder.map((config) =>
          renderSectionContent(config, styles)
        )}
      </div>
    );
  }

  // Creative Template (Two Column)
  if (template === "creative") {
    const leftSections = ["experience", "education", "custom"];
    const rightSections = ["summary", "skills", "certifications", "languages"];

    const styles = {
      section: "mb-8",
      heading:
        "text-lg font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-100",
      text: "text-slate-600 leading-relaxed",
      itemGap: "space-y-6",
      itemHeader: "mb-1",
      itemTitle: "text-lg font-bold text-slate-900 leading-tight",
      itemDate:
        "text-xs text-slate-400 font-bold block mt-1 uppercase tracking-wide",
      itemSubtitle: "font-medium mb-2",
      skillTag: "block mb-2 text-slate-300 bg-white/10 px-3 py-1.5 rounded",
    };

    const sidebarStyles = {
      ...styles,
      heading:
        "text-xs font-bold text-white/40 uppercase tracking-widest mb-5 border-none pb-0",
      text: "text-slate-300 text-sm leading-relaxed",
      skillTag:
        "inline-block mr-2 mb-2 px-3 py-1 bg-white/10 text-white text-xs rounded-full",
    };

    return (
      <div
        className={clsx(
          "mx-auto flex min-h-[297mm] w-[210mm] overflow-hidden bg-white text-slate-800 shadow-2xl shadow-slate-300 transition-all duration-300",
          getFontClass()
        )}
        id="resume-preview"
      >
        <aside className="flex min-h-full w-[35%] flex-col bg-slate-900 p-10 text-white">
          <div className="mb-12">
            <div className="mb-8 h-24 w-24 overflow-hidden rounded-full border-2 border-white/20 shadow-2xl shadow-purple-900/50">
              {data.photoUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element -- Dynamic user-uploaded photo with data URL */
                <img
                  src={data.photoUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-purple-500 to-blue-500 text-3xl font-bold">
                  {data.fullName?.substring(0, 2) || "ME"}
                </div>
              )}
            </div>
            <h1 className="mb-2 text-3xl leading-tight font-bold tracking-tight">
              {data.fullName}
            </h1>
            <p className="text-lg font-medium text-purple-300">{data.title}</p>
          </div>
          <div className="mb-10 space-y-4 text-sm text-slate-300">
            {data.email && (
              <div className="flex items-center gap-3 break-all">
                <Mail className="h-4 w-4 shrink-0 text-slate-500" />{" "}
                {data.email}
              </div>
            )}
            {data.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-slate-500" />{" "}
                {data.phone}
              </div>
            )}
            {data.location && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-slate-500" />{" "}
                {data.location}
              </div>
            )}
          </div>
          <div className="flex-1">
            {data.sectionOrder
              .filter((s) => rightSections.includes(s.type))
              .map((config) => renderSectionContent(config, sidebarStyles))}
          </div>
        </aside>
        <main className="w-[65%] bg-white p-12">
          {data.sectionOrder
            .filter((s) => leftSections.includes(s.type) || s.type === "custom")
            .map((config) => renderSectionContent(config, styles))}
        </main>
      </div>
    );
  }

  return null;
};
