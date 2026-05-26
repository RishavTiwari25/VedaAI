import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeneratedPaper, AssignmentInput } from '../types';
import { buildGenerationPrompt } from './promptBuilder';

// Lazy-initialize so dotenv has already loaded when first call happens
function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is not set in environment variables');
  return new GoogleGenerativeAI(key);
}

export async function generateQuestionPaper(
  assignment: AssignmentInput,
  onProgress?: (progress: number, message: string) => void
): Promise<GeneratedPaper> {
  const genAI = getGenAI();

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      maxOutputTokens: 8192,
    },
  });

  onProgress?.(10, 'Building prompt...');
  const prompt = buildGenerationPrompt(assignment);

  onProgress?.(30, 'Sending to Gemini AI...');
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  onProgress?.(70, 'Parsing AI response...');
  const parsed = parseAIResponse(text);

  onProgress?.(90, 'Validating output...');
  validatePaper(parsed, assignment);

  return parsed;
}

function parseAIResponse(text: string): GeneratedPaper {
  // Strip markdown code blocks if present
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

  try {
    return JSON.parse(cleaned) as GeneratedPaper;
  } catch {
    // Try to extract JSON object from surrounding text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as GeneratedPaper;
      } catch {
        throw new Error('Failed to parse AI response as JSON');
      }
    }
    throw new Error('No valid JSON found in AI response');
  }
}

function validatePaper(paper: GeneratedPaper, assignment: AssignmentInput): void {
  if (!paper.metadata) throw new Error('Missing metadata in generated paper');
  if (!paper.sections || !Array.isArray(paper.sections) || paper.sections.length === 0) {
    throw new Error('Missing or empty sections in generated paper');
  }

  const validDifficulties = ['Easy', 'Moderate', 'Hard'];
  let qNum = 1;
  for (const section of paper.sections) {
    if (!section.title || !section.questions) throw new Error('Invalid section structure');
    for (const q of section.questions) {
      if (!validDifficulties.includes(q.difficulty)) q.difficulty = 'Moderate';
      if (!q.id) q.id = `Q${qNum}`;
      if (!q.marks || q.marks < 1) q.marks = 1;
      qNum++;
    }
  }

  // Ensure metadata completeness
  paper.metadata.schoolName = paper.metadata.schoolName || assignment.schoolName || 'Delhi Public School';
  paper.metadata.teacherName = paper.metadata.teacherName || assignment.teacherName || 'John Doe';
  paper.metadata.timeAllowed = paper.metadata.timeAllowed || assignment.timeAllowed || '3 Hours';
  paper.metadata.generatedAt = paper.metadata.generatedAt || new Date().toISOString();
}
