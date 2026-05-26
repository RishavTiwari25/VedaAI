'use client';

import { X, Minus, Plus } from 'lucide-react';
import { QUESTION_TYPE_OPTIONS } from '@/types';
import type { QuestionType } from '@/types';

interface QuestionTypeRowProps {
  qt: QuestionType;
  index: number;
  onUpdate: (index: number, field: keyof QuestionType, value: string | number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export default function QuestionTypeRow({ qt, index, onUpdate, onRemove, canRemove }: QuestionTypeRowProps) {
  return (
    <div className="question-type-row">
      {/* Type dropdown */}
      <select
        className="question-type-select"
        value={qt.type}
        onChange={(e) => onUpdate(index, 'type', e.target.value)}
        aria-label={`Question type ${index + 1}`}
        id={`question-type-select-${index}`}
      >
        {QUESTION_TYPE_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>

      {/* Remove X — always visible */}
      <button
        type="button"
        className="remove-btn"
        onClick={() => onRemove(index)}
        aria-label={`Remove question type ${index + 1}`}
        id={`remove-qt-${index}`}
        disabled={!canRemove}
        style={{ opacity: canRemove ? 1 : 0.3, cursor: canRemove ? 'pointer' : 'not-allowed' }}
      >
        <X size={15} />
      </button>

      {/* No. of Questions counter */}
      <div className="counter-group">
        <div className="counter">
          <button
            type="button"
            className="counter-btn"
            onClick={() => onUpdate(index, 'count', Math.max(1, qt.count - 1))}
            aria-label="Decrease question count"
            id={`decrease-count-${index}`}
          >
            <Minus size={12} />
          </button>
          <div className="counter-value">{qt.count}</div>
          <button
            type="button"
            className="counter-btn"
            onClick={() => onUpdate(index, 'count', Math.min(50, qt.count + 1))}
            aria-label="Increase question count"
            id={`increase-count-${index}`}
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Marks counter */}
      <div className="counter-group">
        <div className="counter">
          <button
            type="button"
            className="counter-btn"
            onClick={() => onUpdate(index, 'marks', Math.max(1, qt.marks - 1))}
            aria-label="Decrease marks"
            id={`decrease-marks-${index}`}
          >
            <Minus size={12} />
          </button>
          <div className="counter-value">{qt.marks}</div>
          <button
            type="button"
            className="counter-btn"
            onClick={() => onUpdate(index, 'marks', Math.min(20, qt.marks + 1))}
            aria-label="Increase marks"
            id={`increase-marks-${index}`}
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
