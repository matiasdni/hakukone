// ==================== RICH TEXT PARSER ====================
export interface ParsedNode {
  type:
    | "text"
    | "paragraph"
    | "bullet"
    | "numbered"
    | "bold"
    | "italic"
    | "break";
  content?: string;
  children?: ParsedNode[];
}

// Parse HTML/Markdown content into structured nodes
export const parseContent = (html: string): ParsedNode[] => {
  if (!html) return [];

  const decodeEntities = (str: string): string => {
    return str
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  };

  const nodes: ParsedNode[] = [];
  const isHtml = /<[a-z][\s\S]*>/i.test(html);

  if (isHtml) {
    const blocks = html.split(/(<\/?(?:p|ul|ol|li|br)[^>]*>)/gi);
    let inList: "ul" | "ol" | null = null;
    let currentText = "";

    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;

      if (trimmed.toLowerCase() === "<ul>") {
        inList = "ul";
      } else if (trimmed.toLowerCase() === "<ol>") {
        inList = "ol";
      } else if (
        trimmed.toLowerCase() === "</ul>" ||
        trimmed.toLowerCase() === "</ol>"
      ) {
        inList = null;
      } else if (trimmed.toLowerCase() === "</li>") {
        if (currentText) {
          const cleanText = decodeEntities(
            currentText.replace(/<[^>]+>/g, "").trim()
          );
          if (cleanText) {
            nodes.push({
              type: inList === "ol" ? "numbered" : "bullet",
              content: cleanText,
            });
          }
          currentText = "";
        }
      } else if (trimmed.toLowerCase() === "</p>") {
        if (currentText) {
          const cleanText = decodeEntities(
            currentText.replace(/<[^>]+>/g, "").trim()
          );
          if (cleanText) {
            nodes.push({ type: "paragraph", content: cleanText });
          }
          currentText = "";
        }
      } else if (
        trimmed.toLowerCase() === "<br>" ||
        trimmed.toLowerCase() === "<br/>"
      ) {
        if (currentText) {
          const cleanText = decodeEntities(
            currentText.replace(/<[^>]+>/g, "").trim()
          );
          if (cleanText) {
            nodes.push({ type: "paragraph", content: cleanText });
          }
          currentText = "";
        }
      } else if (!trimmed.startsWith("<")) {
        currentText += trimmed;
      }
    }

    if (currentText) {
      const cleanText = decodeEntities(
        currentText.replace(/<[^>]+>/g, "").trim()
      );
      if (cleanText) {
        nodes.push({ type: "paragraph", content: cleanText });
      }
    }
  } else {
    const lines = html.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (/^[-*•]\s+/.test(trimmed)) {
        nodes.push({
          type: "bullet",
          content: decodeEntities(trimmed.replace(/^[-*•]\s+/, "")),
        });
      } else if (/^\d+\.\s+/.test(trimmed)) {
        nodes.push({
          type: "numbered",
          content: decodeEntities(trimmed.replace(/^\d+\.\s+/, "")),
        });
      } else {
        nodes.push({
          type: "paragraph",
          content: decodeEntities(trimmed),
        });
      }
    }
  }

  return nodes;
};
