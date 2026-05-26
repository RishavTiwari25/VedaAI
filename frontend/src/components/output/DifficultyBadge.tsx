import type { Question } from '@/types';

interface DifficultyBadgeProps {
  difficulty: Question['difficulty'];
}

const config = {
  Easy: { className: 'difficulty-easy', label: 'Easy', dot: '●' },
  Moderate: { className: 'difficulty-moderate', label: 'Moderate', dot: '●' },
  Hard: { className: 'difficulty-hard', label: 'Hard', dot: '●' },
};

export default function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const c = config[difficulty] || config.Moderate;
  return (
    <span className={`difficulty-badge ${c.className}`} aria-label={`Difficulty: ${c.label}`}>
      <span aria-hidden="true" style={{ fontSize: '8px' }}>{c.dot}</span>
      {c.label}
    </span>
  );
}
