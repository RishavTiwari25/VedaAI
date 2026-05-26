import { AssignmentInput } from '../types';

export function buildGenerationPrompt(assignment: AssignmentInput): string {
  const questionBreakdown = assignment.questionTypes
    .map(qt => `  - ${qt.type}: ${qt.count} question(s), ${qt.marks} mark(s) each (Total: ${qt.count * qt.marks} marks)`)
    .join('\n');

  const totalQuestions = assignment.questionTypes.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = assignment.questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

  return `You are an expert academic question paper generator. Generate a complete, high-quality question paper.

ASSIGNMENT DETAILS:
- Subject: ${assignment.subject}
- Class/Grade: ${assignment.className}
- School: ${assignment.schoolName || 'Delhi Public School'}
- Teacher: ${assignment.teacherName || 'John Doe'}
- Total Questions: ${totalQuestions}
- Total Marks: ${totalMarks}
- Time Allowed: ${assignment.timeAllowed || '3 Hours'}

QUESTION BREAKDOWN:
${questionBreakdown}

${assignment.additionalInstructions ? `ADDITIONAL INSTRUCTIONS:\n${assignment.additionalInstructions}` : ''}

INSTRUCTIONS FOR GENERATION:
1. Organize questions into sections (Section A, Section B, etc.) based on question types
2. Each section gets ONE question type
3. Assign difficulty: distribute as approximately 30% Easy, 40% Moderate, 30% Hard
4. Each question must have a clear, well-worded text appropriate for the class level
5. Include a comprehensive answer key for all questions
6. Make questions relevant to the subject and class level

RESPOND WITH VALID JSON ONLY. No markdown, no explanation, just the JSON:

{
  "metadata": {
    "totalQuestions": ${totalQuestions},
    "totalMarks": ${totalMarks},
    "subject": "${assignment.subject}",
    "className": "${assignment.className}",
    "schoolName": "${assignment.schoolName || 'Delhi Public School'}",
    "teacherName": "${assignment.teacherName || 'John Doe'}",
    "timeAllowed": "${assignment.timeAllowed || '3 Hours'}",
    "generatedAt": "${new Date().toISOString()}"
  },
  "sections": [
    {
      "title": "Section A",
      "instruction": "Attempt all questions. Each question carries X marks.",
      "questions": [
        {
          "id": "A1",
          "text": "Question text here",
          "difficulty": "Easy",
          "marks": 1,
          "answerKey": "Answer text here"
        }
      ]
    }
  ]
}`;
}
