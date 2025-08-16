import { GoogleGenAI, Type, Schema } from "@google/genai";
import type {
  JobAnalysis,
  MatchAnalysis,
  ResumeReview,
  CoverLetterReview,
} from "@/types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function fastRewrite(
  text: string,
  tone: "professional" | "creative" | "concise",
  language: "en" | "fi" = "en"
): Promise<string> {
  const ai = getAI();
  const modelId = "gemini-flash-lite-latest";
  const langInstruction =
    language === "fi" ? "Respond in Finnish (Suomi)." : "Respond in English.";
  const prompt = `${langInstruction}\nRewrite the following resume text to be ${tone}. Keep it factual but impactful.\nText: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || text;
  } catch (error) {
    console.error("Fast rewrite failed:", error);
    return text;
  }
}

export async function analyzeJobPosting(
  jobText: string,
  language: "en" | "fi" = "en"
): Promise<JobAnalysis | null> {
  const ai = getAI();
  const modelId = "gemini-2.5-flash";
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      role: { type: Type.STRING },
      company: { type: Type.STRING },
      keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
      requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
      cultureFit: { type: Type.STRING },
      summary: { type: Type.STRING },
    },
    required: ["role", "keywords", "requiredSkills", "summary"],
  };
  const langInstruction =
    language === "fi" ? "Analyze in Finnish." : "Analyze in English.";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `${langInstruction} Analyze this job posting. Return a valid JSON object matching the schema.\nJob Posting:\n${jobText}`,
      config: { responseMimeType: "application/json", responseSchema: schema },
    });
    const jsonStr = response.text;
    if (!jsonStr) return null;
    return JSON.parse(jsonStr) as JobAnalysis;
  } catch (error) {
    console.error("Job analysis failed:", error);
    return null;
  }
}

export async function researchCompany(
  companyName: string,
  language: "en" | "fi" = "en"
): Promise<{ text: string; sources: { uri: string; title: string }[] }> {
  const ai = getAI();
  const modelId = "gemini-2.5-flash";
  const langInstruction =
    language === "fi" ? "Answer in Finnish." : "Answer in English.";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `${langInstruction} What are the recent news, core values, and mission statement of the company "${companyName}"? Keep it brief and relevant for a job interview.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const chunks =
      response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = chunks
      .map((c) => c.web)
      .filter(
        (web): web is { uri: string; title: string } =>
          web !== undefined &&
          typeof web.uri === "string" &&
          typeof web.title === "string"
      );
    return {
      text: response.text || "No information found.",
      sources: webSources,
    };
  } catch (error) {
    console.error("Search failed:", error);
    return { text: "Error searching for company info.", sources: [] };
  }
}

export async function askCareerStrategist(
  query: string,
  context: string,
  language: "en" | "fi" = "en"
): Promise<string> {
  const ai = getAI();
  const modelId = "gemini-3-pro-preview";
  const langInstruction =
    language === "fi"
      ? "Think and respond in Finnish."
      : "Think and respond in English.";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Context: User has the following resume summary: "${context}".\n${langInstruction}\nQuery: ${query}`,
      config: { thinkingConfig: { thinkingBudget: 32768 } },
    });
    return response.text || "I couldn't formulate a strategy at this time.";
  } catch (error) {
    console.error("Thinking mode failed:", error);
    return "Error in strategic thinking module.";
  }
}

export async function digitizeResumeImage(
  base64Image: string,
  mimeType: string,
  language: "en" | "fi" = "en"
): Promise<string> {
  const ai = getAI();
  const modelId = "gemini-3-pro-preview";
  const langInstruction =
    language === "fi" ? "Translate content to Finnish if needed." : "";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          {
            text: `Analyze this image of a resume. ${langInstruction} Extract the full text content organized by sections (Experience, Education, Skills). Return Markdown.`,
          },
        ],
      },
    });
    return response.text || "Could not extract text.";
  } catch (error) {
    console.error("Vision analysis failed:", error);
    return "Error processing image.";
  }
}

export async function generateCoverLetter(
  resumeData: string,
  jobDescription: string,
  language: "en" | "fi" = "en"
): Promise<string> {
  const ai = getAI();
  const modelId = "gemini-3-pro-preview";
  const langInstruction =
    language === "fi" ? "Write in Finnish." : "Write in English.";

  const prompt = `You are an expert professional resume writer.
Task: Write a compelling, professional cover letter based on the candidate's resume and the job description.
${langInstruction}

Candidate's Resume Context:
${resumeData}

Target Job Description:
${jobDescription}

Requirements:
- Return ONLY the body of the letter (no placeholders like [Your Name], no header info, just the salutation and paragraphs).
- Tone: Professional, enthusiastic, and confident.
- Highlight 2-3 key matches between the candidate's experience and the job requirements.
- Format with HTML paragraphs (<p>) for easy rendering.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "";
  } catch (error) {
    console.error("Cover letter generation failed:", error);
    return "<p>Error generating cover letter. Please try again.</p>";
  }
}

export async function getMatchAnalysis(
  resumeText: string,
  jobDescription: string,
  language: "en" | "fi" = "en"
): Promise<MatchAnalysis | null> {
  const ai = getAI();
  const modelId = "gemini-2.5-flash";
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER, description: "Match score from 0 to 100" },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["score", "strengths", "gaps", "recommendations"],
  };
  const langInstruction =
    language === "fi" ? "Respond in Finnish." : "Respond in English.";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `${langInstruction} Analyze the match between the resume and the job description. Provide a score (0-100) and specific feedback.\n\nJob Description:\n${jobDescription}\n\nResume:\n${resumeText}`,
      config: { responseMimeType: "application/json", responseSchema: schema },
    });
    const jsonStr = response.text;
    if (!jsonStr) return null;
    return JSON.parse(jsonStr) as MatchAnalysis;
  } catch (error) {
    console.error("Match analysis failed:", error);
    return null;
  }
}

export async function reviewResume(
  resumeText: string,
  language: "en" | "fi" = "en"
): Promise<ResumeReview | null> {
  const ai = getAI();
  const modelId = "gemini-2.5-flash";
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      overallFeedback: { type: Type.STRING },
      strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
      issues: { type: Type.ARRAY, items: { type: Type.STRING } },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["overallFeedback", "strengths", "issues", "suggestions"],
  };
  const langInstruction =
    language === "fi" ? "Respond in Finnish." : "Respond in English.";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `${langInstruction} Review this resume. Identify strengths, weaknesses, and actionable improvements.\nResume Content:\n${resumeText}`,
      config: { responseMimeType: "application/json", responseSchema: schema },
    });
    const jsonStr = response.text;
    if (!jsonStr) return null;
    return JSON.parse(jsonStr) as ResumeReview;
  } catch (error) {
    console.error("Resume review failed:", error);
    return null;
  }
}

export async function reviewCoverLetter(
  letterText: string,
  language: "en" | "fi" = "en"
): Promise<CoverLetterReview | null> {
  const ai = getAI();
  const modelId = "gemini-2.5-flash";
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      overallFeedback: { type: Type.STRING },
      toneAssessment: { type: Type.STRING },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      revisedSnippet: {
        type: Type.STRING,
        description: "Optional revised version of the opening paragraph",
      },
    },
    required: ["overallFeedback", "toneAssessment", "suggestions"],
  };
  const langInstruction =
    language === "fi" ? "Respond in Finnish." : "Respond in English.";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `${langInstruction} Review this cover letter. Assess the tone and clarity.\nLetter Content:\n${letterText}`,
      config: { responseMimeType: "application/json", responseSchema: schema },
    });
    const jsonStr = response.text;
    if (!jsonStr) return null;
    return JSON.parse(jsonStr) as CoverLetterReview;
  } catch (error) {
    console.error("Cover letter review failed:", error);
    return null;
  }
}

export async function chatWithAssistant(
  history: { role: string; parts: { text: string }[] }[],
  newMessage: string,
  language: "en" | "fi" = "en"
) {
  const ai = getAI();
  const langInstruction =
    language === "fi" ? "Respond in Finnish." : "Respond in English.";

  const chat = ai.chats.create({
    model: "gemini-3-pro-preview",
    history,
    config: {
      systemInstruction: `You are a helpful, expert career coach and resume writer. ${langInstruction}`,
    },
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text;
}
