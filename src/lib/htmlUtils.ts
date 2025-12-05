/**
 * HTML utilities for extracting resume/cover letter content for PDF generation.
 * Uses DOM queries to get the rendered HTML from preview elements.
 */

/**
 * Get the HTML content from the resume preview element.
 * This extracts the rendered resume for PDF generation via Puppeteer.
 *
 * @returns The innerHTML of the resume preview element
 * @throws Error if preview element is not found
 */
export function getResumeHtml(): string {
  // Try multiple selectors for the resume preview
  const selectors = [
    "[data-resume-preview]",
    "#resume-preview",
    ".resume-preview",
    "[data-pdf-content]",
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.innerHTML;
    }
  }

  throw new Error(
    "Resume preview element not found. Ensure the preview is rendered with a data-resume-preview attribute."
  );
}

/**
 * Get the HTML content from any preview element (cover letters, etc).
 * Generic version of getResumeHtml for other document types.
 *
 * @param id - Optional ID of the preview element to search for
 * @returns The innerHTML of the preview element
 * @throws Error if preview element is not found
 */
export function getPreviewHtml(id?: string): string {
  // Try multiple selectors for generic preview
  const selectors = id
    ? [`#${id}`, `[data-${id}]`, `[data-preview="${id}"]`]
    : [
        "[data-preview]",
        "[data-resume-preview]",
        "[data-cover-letter-preview]",
        "#preview",
        ".preview",
        "[data-pdf-content]",
      ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      return element.innerHTML;
    }
  }

  throw new Error(
    "Preview element not found. Ensure the preview is rendered with a data-preview attribute."
  );
}

/**
 * Get full HTML document for PDF rendering.
 * Wraps the preview content with proper HTML structure and styles.
 *
 * @param bodyHtml - The inner HTML content
 * @param styles - Optional CSS styles to include
 * @returns Complete HTML document string
 */
export function wrapHtmlForPdf(bodyHtml: string, styles?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&family=Lora:ital,wght@0,400..700;1,400..700&family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            border: "hsl(var(--border))",
            input: "hsl(var(--input))",
            ring: "hsl(var(--ring))",
            background: "hsl(var(--background))",
            foreground: "hsl(var(--foreground))",
            primary: {
              DEFAULT: "hsl(var(--primary))",
              foreground: "hsl(var(--primary-foreground))",
            },
            secondary: {
              DEFAULT: "hsl(var(--secondary))",
              foreground: "hsl(var(--secondary-foreground))",
            },
            destructive: {
              DEFAULT: "hsl(var(--destructive))",
              foreground: "hsl(var(--destructive-foreground))",
            },
            muted: {
              DEFAULT: "hsl(var(--muted))",
              foreground: "hsl(var(--muted-foreground))",
            },
            accent: {
              DEFAULT: "hsl(var(--accent))",
              foreground: "hsl(var(--accent-foreground))",
            },
            popover: {
              DEFAULT: "hsl(var(--popover))",
              foreground: "hsl(var(--popover-foreground))",
            },
            card: {
              DEFAULT: "hsl(var(--card))",
              foreground: "hsl(var(--card-foreground))",
            },
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            serif: ['Merriweather', 'serif'],
            mono: ['JetBrains Mono', 'monospace'],
            'source-sans': ['Source Sans 3', 'sans-serif'],
            'lora': ['Lora', 'serif'],
          },
        },
      },
    }
  </script>

  <style>
    /* CSS Variables Fallback */
    :root {
      --background: 0 0% 100%;
      --foreground: 222.2 84% 4.9%;
      --card: 0 0% 100%;
      --card-foreground: 222.2 84% 4.9%;
      --popover: 0 0% 100%;
      --popover-foreground: 222.2 84% 4.9%;
      --primary: 222.2 47.4% 11.2%;
      --primary-foreground: 210 40% 98%;
      --secondary: 210 40% 96.1%;
      --secondary-foreground: 222.2 47.4% 11.2%;
      --muted: 210 40% 96.1%;
      --muted-foreground: 215.4 16.3% 46.9%;
      --accent: 210 40% 96.1%;
      --accent-foreground: 222.2 47.4% 11.2%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 210 40% 98%;
      --border: 214.3 31.8% 91.4%;
      --input: 214.3 31.8% 91.4%;
      --ring: 222.2 84% 4.9%;
      --radius: 0.5rem;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    body {
      font-family: 'Inter', sans-serif;
      line-height: 1.5;
      color: #1a1a1a;
      background: white;
    }

    /* Print specific overrides */
    @media print {
      @page {
        margin: 0;
        size: auto;
      }
      body {
        -webkit-print-color-adjust: exact;
      }
    }

    ${styles || ""}
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>
`.trim();
}
