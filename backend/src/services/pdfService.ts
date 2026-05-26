import PDFDocument from 'pdfkit';
import { GeneratedPaper } from '../types';

export async function generatePDF(paper: GeneratedPaper, assignmentTitle: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const { metadata, sections } = paper;

    // ─── HEADER ────────────────────────────────────────────────────────────
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .text(metadata.schoolName || 'School Name', { align: 'center' });

    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .text(`Subject: ${metadata.subject}`, { align: 'center' });

    doc
      .fontSize(11)
      .font('Helvetica')
      .text(`Class: ${metadata.className}`, { align: 'center' });

    doc.moveDown(0.5);

    // Horizontal rule
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .lineWidth(1.5)
      .stroke();

    doc.moveDown(0.5);

    // ─── META ROW ──────────────────────────────────────────────────────────
    const metaY = doc.y;
    doc
      .fontSize(10)
      .font('Helvetica')
      .text(`Time Allowed: ${metadata.timeAllowed}`, 50, metaY)
      .text(`Maximum Marks: ${metadata.totalMarks}`, { align: 'right' });

    doc.moveDown(0.5);

    // Student info box
    const boxY = doc.y;
    doc
      .rect(50, boxY, doc.page.width - 100, 40)
      .stroke();

    doc.fontSize(9).font('Helvetica');
    doc.text('Name: ________________________', 60, boxY + 8);
    doc.text('Roll No: __________   Section: __________', 60, boxY + 22);

    doc.y = boxY + 50;
    doc.moveDown(0.5);

    // Instructions
    doc
      .fontSize(9)
      .font('Helvetica-Oblique')
      .text('All questions are compulsory unless stated otherwise.', { align: 'center' });

    doc.moveDown(1);

    // ─── SECTIONS ──────────────────────────────────────────────────────────
    for (const section of sections) {
      // Section title background
      const titleY = doc.y;
      doc
        .rect(50, titleY, doc.page.width - 100, 20)
        .fill('#f0f0f0')
        .fillColor('black');

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(section.title.toUpperCase(), 60, titleY + 4);

      doc.y = titleY + 26;
      doc.moveDown(0.3);

      // Section instruction
      doc
        .fontSize(9)
        .font('Helvetica-Oblique')
        .fillColor('#444444')
        .text(section.instruction || '');

      doc.fillColor('black');
      doc.moveDown(0.5);

      // ─── QUESTIONS ───────────────────────────────────────────────────────
      section.questions.forEach((q, idx) => {
        const difficultyColor: Record<string, string> = {
          Easy: '#16a34a',
          Moderate: '#d97706',
          Hard: '#dc2626',
        };
        const color = difficultyColor[q.difficulty] || '#000000';

        // Check page space
        if (doc.y > doc.page.height - 120) doc.addPage();

        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .fillColor('black')
          .text(`${idx + 1}. `, { continued: true })
          .font('Helvetica')
          .text(q.text || '', { lineGap: 2 });

        doc.moveDown(0.2);

        // Difficulty + Marks badge
        doc
          .fontSize(8)
          .font('Helvetica-Bold')
          .fillColor(color)
          .text(`[${q.difficulty}]`, 70, doc.y, { continued: true })
          .fillColor('#555555')
          .font('Helvetica')
          .text(`  ${q.marks} Mark${q.marks > 1 ? 's' : ''}`);

        doc.fillColor('black');
        doc.moveDown(0.6);
      });

      // ─── ANSWER KEY ──────────────────────────────────────────────────────
      const hasAnswers = section.questions.some(q => q.answerKey);
      if (hasAnswers) {
        if (doc.y > doc.page.height - 100) doc.addPage();

        doc.moveDown(0.5);
        doc
          .moveTo(50, doc.y)
          .lineTo(doc.page.width - 50, doc.y)
          .lineWidth(0.5)
          .dash(4, { space: 4 })
          .stroke()
          .undash();

        doc.moveDown(0.3);

        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(`Answer Key — ${section.title}`);

        doc.moveDown(0.3);

        section.questions.forEach((q, idx) => {
          if (!q.answerKey) return;
          if (doc.y > doc.page.height - 80) doc.addPage();

          doc
            .fontSize(9)
            .font('Helvetica-Bold')
            .text(`${idx + 1}. `, { continued: true })
            .font('Helvetica')
            .text(q.answerKey, { lineGap: 2 });

          doc.moveDown(0.4);
        });
      }

      doc.moveDown(1);
    }

    // ─── FOOTER ────────────────────────────────────────────────────────────
    const footerY = doc.page.height - 40;
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#888888')
      .text(
        `Generated by VedaAI • ${assignmentTitle} • ${new Date().toLocaleDateString('en-IN')}`,
        50,
        footerY,
        { align: 'center', width: doc.page.width - 100 }
      );

    doc.end();
  });
}
