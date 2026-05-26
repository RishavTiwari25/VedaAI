import puppeteer from 'puppeteer';
import { GeneratedPaper } from '../types';

function generateHTML(paper: GeneratedPaper, assignmentTitle: string): string {
  const { metadata, sections } = paper;

  const difficultyColor: Record<string, string> = {
    Easy: '#16a34a',
    Moderate: '#d97706',
    Hard: '#dc2626',
  };

  const sectionsHTML = sections.map(section => {
    const questionsHTML = section.questions.map((q, idx) => `
      <div class="question">
        <div class="question-header">
          <span class="q-number">${idx + 1}.</span>
          <span class="q-text">${q.text}</span>
        </div>
        <div class="question-meta">
          <span class="difficulty-badge" style="color: ${difficultyColor[q.difficulty] || '#000'}; border-color: ${difficultyColor[q.difficulty] || '#000'}">${q.difficulty}</span>
          <span class="marks">[${q.marks} Mark${q.marks > 1 ? 's' : ''}]</span>
        </div>
      </div>
    `).join('');

    const answersHTML = section.questions.map((q, idx) => q.answerKey ? `
      <div class="answer-item">
        <strong>${idx + 1}.</strong> ${q.answerKey}
      </div>
    ` : '').join('');

    return `
      <div class="section">
        <h2 class="section-title">${section.title}</h2>
        <p class="section-instruction">${section.instruction}</p>
        <div class="questions">${questionsHTML}</div>
        ${answersHTML ? `<div class="answer-key"><h3>Answer Key - ${section.title}</h3>${answersHTML}</div>` : ''}
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${assignmentTitle} - Question Paper</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; background: #fff; padding: 20mm; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 16px; }
    .school-name { font-size: 18pt; font-weight: bold; margin-bottom: 4px; }
    .subject { font-size: 14pt; font-weight: bold; }
    .class-info { font-size: 11pt; margin-top: 4px; }
    .meta-row { display: flex; justify-content: space-between; margin: 12px 0; font-size: 11pt; }
    .student-info { border: 1px solid #ccc; padding: 12px; margin: 16px 0; display: flex; gap: 40px; }
    .student-field { display: flex; flex-direction: column; gap: 4px; }
    .student-field label { font-size: 9pt; color: #666; }
    .student-field .line { border-bottom: 1px solid #000; width: 120px; height: 20px; }
    .instructions { font-size: 10pt; font-style: italic; margin-bottom: 20px; }
    .section { margin-bottom: 28px; page-break-inside: avoid; }
    .section-title { font-size: 14pt; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; background: #f0f0f0; padding: 6px 12px; margin-bottom: 6px; }
    .section-instruction { font-size: 10pt; font-style: italic; margin-bottom: 12px; color: #444; }
    .question { margin-bottom: 14px; }
    .question-header { display: flex; gap: 8px; margin-bottom: 4px; }
    .q-number { font-weight: bold; min-width: 20px; }
    .q-text { flex: 1; line-height: 1.5; }
    .question-meta { display: flex; gap: 12px; margin-left: 28px; align-items: center; }
    .difficulty-badge { font-size: 9pt; font-weight: bold; border: 1px solid; border-radius: 4px; padding: 1px 6px; }
    .marks { font-size: 10pt; color: #555; }
    .answer-key { margin-top: 20px; border-top: 1px dashed #999; padding-top: 12px; }
    .answer-key h3 { font-size: 11pt; margin-bottom: 8px; }
    .answer-item { margin-bottom: 8px; font-size: 10pt; line-height: 1.4; }
    @media print { body { padding: 15mm; } .section { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="school-name">${metadata.schoolName}</div>
    <div class="subject">Subject: ${metadata.subject}</div>
    <div class="class-info">Class: ${metadata.className}</div>
  </div>
  <div class="meta-row">
    <span>Time Allowed: ${metadata.timeAllowed}</span>
    <span>Maximum Marks: ${metadata.totalMarks}</span>
  </div>
  <p class="instructions">All questions are compulsory unless stated otherwise.</p>
  <div class="student-info">
    <div class="student-field"><label>Name:</label><div class="line"></div></div>
    <div class="student-field"><label>Roll Number:</label><div class="line"></div></div>
    <div class="student-field"><label>Section:</label><div class="line"></div></div>
  </div>
  ${sectionsHTML}
</body>
</html>`;
}

export async function generatePDF(paper: GeneratedPaper, assignmentTitle: string): Promise<Buffer> {
  const html = generateHTML(paper, assignmentTitle);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      margin: { top: '20mm', bottom: '20mm', left: '20mm', right: '20mm' },
      printBackground: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
