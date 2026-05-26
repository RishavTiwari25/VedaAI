'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import type { GeneratedPaper } from '@/types';

interface QuestionPaperProps {
  paper: GeneratedPaper;
  assignmentId: string;
}

export default function QuestionPaper({ paper, assignmentId }: QuestionPaperProps) {
  const [answerKeyOpen, setAnswerKeyOpen] = useState(true); // open by default per Figma
  const { metadata, sections } = paper;

  let globalQuestionNumber = 1;

  return (
    <div className="paper-container" id="question-paper-output">
      {/* Paper Header */}
      <div className="paper-header">
        <div className="paper-school-name">{metadata.schoolName}</div>
        <div className="paper-subject">Subject: {metadata.subject}</div>
        <div className="paper-class">Class: {metadata.className}</div>
      </div>

      {/* Meta row */}
      <div className="paper-meta">
        <div className="paper-meta-item">
          Time Allowed: <strong>{metadata.timeAllowed}</strong>
        </div>
        <div className="paper-meta-item">
          Maximum Marks: <strong>{metadata.totalMarks}</strong>
        </div>
      </div>

      {/* General instructions */}
      <div className="paper-instructions">
        All questions are compulsory unless stated otherwise.
      </div>

      {/* Student Info */}
      <div className="student-info-section">
        <div className="student-field">
          <span className="student-field-label">Name</span>
          <div className="student-field-line" />
        </div>
        <div className="student-field">
          <span className="student-field-label">Roll Number</span>
          <div className="student-field-line" />
        </div>
        <div className="student-field">
          <span className="student-field-label">Section</span>
          <div className="student-field-line" style={{ width: '100px' }} />
        </div>
      </div>

      {/* Sections */}
      <div className="paper-body">
        {sections.map((section, sIdx) => {
          const sectionStart = globalQuestionNumber;
          globalQuestionNumber += section.questions.length;

          return (
            <div key={sIdx} className="paper-section">
              <div className="paper-section-header">
                <div className="paper-section-title">{section.title}</div>
              </div>
              <p className="paper-section-instruction">{section.instruction}</p>

              <div className="paper-questions">
                {section.questions.map((question, qIdx) => {
                  const qNum = sectionStart + qIdx;
                  const diffColors: Record<string, string> = {
                    Easy: '#16a34a', Moderate: '#d97706', Hard: '#dc2626',
                  };
                  const col = diffColors[question.difficulty] || '#6b7280';
                  return (
                    <div
                      key={question.id || qIdx}
                      className="paper-question"
                      id={`question-${section.title.replace(/\s+/g, '-')}-${qIdx + 1}`}
                      style={{ flexDirection: 'row', alignItems: 'flex-start', gap: '8px', flexWrap: 'nowrap' }}
                    >
                      <span className="paper-question-number" style={{ flexShrink: 0 }}>{qNum}.</span>
                      <span style={{
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        color: col,
                        border: `1px solid ${col}`,
                        borderRadius: '4px',
                        padding: '1px 6px',
                        flexShrink: 0,
                        whiteSpace: 'nowrap',
                      }}>
                        {question.difficulty}
                      </span>
                      <span className="paper-question-text" style={{ flex: 1, marginBottom: 0 }}>
                        {question.text}
                      </span>
                      <span style={{
                        flexShrink: 0,
                        fontSize: '0.875rem',
                        color: 'var(--neutral-600)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}>
                        [{question.marks} Mark{question.marks !== 1 ? 's' : ''}]
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* End of paper */}
        <div style={{
          textAlign: 'center',
          padding: '16px 0 0',
          borderTop: '1px solid var(--neutral-200)',
          marginTop: '24px',
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'var(--neutral-500)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          *** End of Question Paper ***
        </div>
      </div>

      {/* Answer Key Toggle */}
      <div
        className="answer-key-toggle"
        onClick={() => setAnswerKeyOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setAnswerKeyOpen((v) => !v)}
        aria-expanded={answerKeyOpen}
        id="answer-key-toggle"
      >
        <div className="answer-key-title">
          <BookOpen size={16} />
          Answer Key
        </div>
        {answerKeyOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>

      {answerKeyOpen && (
        <div className="answer-key-body" id="answer-key-body">
          {(() => {
            let globalNum = 1;
            return sections.map((section, sIdx) => (
              <div key={sIdx} style={{ marginBottom: '20px' }}>
                <div style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'var(--neutral-600)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '8px',
                }}>
                  {section.title}
                </div>
                {section.questions.map((q, qIdx) => {
                  const num = globalNum++;
                  return q.answerKey ? (
                    <div key={qIdx} className="answer-item">
                      <span className="answer-item-num">{num}.</span>
                      <span>{q.answerKey}</span>
                    </div>
                  ) : null;
                })}
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
}
