import { describe, expect, it } from "vitest";
import { wrapHtmlForPdf } from "../htmlUtils";

describe("htmlUtils", () => {
  describe("wrapHtmlForPdf", () => {
    it("should wrap HTML with proper structure", () => {
      const body = "<div>Test Content</div>";
      const result = wrapHtmlForPdf(body);

      expect(result).toContain("<!DOCTYPE html>");
      expect(result).toContain("<div>Test Content</div>");
      expect(result).toContain("</html>");
    });

    it("should include Google Fonts links", () => {
      const result = wrapHtmlForPdf("");
      expect(result).toContain("fonts.googleapis.com");
      expect(result).toContain("family=Inter");
      expect(result).toContain("family=Merriweather");
    });

    it("should include Tailwind CDN", () => {
      const result = wrapHtmlForPdf("");
      expect(result).toContain("cdn.tailwindcss.com");
    });

    it("should include custom styles if provided", () => {
      const styles = ".custom { color: red; }";
      const result = wrapHtmlForPdf("", styles);
      expect(result).toContain(styles);
    });
  });
});
