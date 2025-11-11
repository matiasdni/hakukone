"use client";

import { ResumeData } from "@/types";
import { typographyToCSS } from "../../../index";
import { ResolvedTemplate } from "../../../types";

interface HeaderSectionProps {
  resume: ResumeData;
  template: ResolvedTemplate;
}

export function HeaderSection({ resume, template }: HeaderSectionProps) {
  const { header, typography, colors, photo } = template;

  const nameStyle: React.CSSProperties = {
    ...typographyToCSS(typography.name),
    color: colors.primary,
    marginBottom: "0.25rem",
  };

  const titleStyle: React.CSSProperties = {
    ...typographyToCSS(typography.title),
    color: colors.text,
    opacity: 0.8,
    marginBottom: header.showDivider ? "1rem" : "0.5rem",
  };

  const contactStyle: React.CSSProperties = {
    ...typographyToCSS(typography.contact),
    color: colors.text,
    opacity: 0.9,
  };

  const headerContainerStyle: React.CSSProperties = {
    textAlign: header.layout === "center" ? "center" : "left",
    marginBottom: header.showDivider ? "0" : `${header.marginBottom}px`,
  };

  const dividerStyle: React.CSSProperties = {
    height: "2px",
    backgroundColor: colors.primary,
    marginTop: "1rem",
    marginBottom: `${header.marginBottom}px`,
  };

  // Photo styles
  const showPhoto = photo?.show && resume.photoUrl;
  const photoSize = photo?.size || 80;
  const photoShape = photo?.shape || "circle";
  const photoPosition = photo?.position || "right";

  const getPhotoStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      width: `${photoSize}px`,
      height: `${photoSize}px`,
      objectFit: "cover",
      flexShrink: 0,
    };

    if (photoShape === "circle") {
      baseStyle.borderRadius = "50%";
    } else if (photoShape === "rounded") {
      baseStyle.borderRadius = "8px";
    } else {
      baseStyle.borderRadius = "0";
    }

    if (photo?.borderWidth) {
      baseStyle.border = `${photo.borderWidth}px solid ${photo.borderColor || colors.primary}`;
    }

    if (photo?.grayscale) {
      baseStyle.filter = "grayscale(100%)";
    }

    return baseStyle;
  };

  // Build contact info array
  const contactItems: string[] = [];
  if (resume.email) contactItems.push(resume.email);
  if (resume.phone) contactItems.push(resume.phone);
  if (resume.location) contactItems.push(resume.location);
  resume.socialLinks?.forEach((link) => {
    if (link.url) contactItems.push(link.url);
  });

  // Render contact info with separator for inline, or stacked
  const separator = " | ";

  // Header content JSX
  const headerContentJsx = (
    <div style={{ flex: 1 }}>
      <h1 style={nameStyle}>{resume.fullName}</h1>

      {resume.title && <h2 style={titleStyle}>{resume.title}</h2>}

      {contactItems.length > 0 && (
        <div style={contactStyle}>
          {header.contactLayout === "stacked" ? (
            <div className="flex flex-col gap-1">
              {contactItems.map((item: string, index: number) => (
                <span key={index}>{item}</span>
              ))}
            </div>
          ) : header.contactLayout === "grid" ? (
            <div className="grid grid-cols-2 gap-2">
              {contactItems.map((item: string, index: number) => (
                <span key={index}>{item}</span>
              ))}
            </div>
          ) : (
            <span>{contactItems.join(separator)}</span>
          )}
        </div>
      )}
    </div>
  );

  // Photo element JSX
  const photoElementJsx = showPhoto ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={resume.photoUrl ?? ""}
      alt={resume.fullName || "Profile photo"}
      style={getPhotoStyle()}
    />
  ) : null;

  return (
    <header style={headerContainerStyle}>
      {showPhoto ? (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            flexDirection: photoPosition === "left" ? "row" : "row-reverse",
          }}
        >
          {photoElementJsx}
          {headerContentJsx}
        </div>
      ) : (
        headerContentJsx
      )}

      {header.showDivider && <div style={dividerStyle} />}
    </header>
  );
}
