'use client';

import Link from 'next/link';
import { FileX, Plus } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-state-illustration" aria-hidden="true">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          {/* Background circle */}
          <circle cx="100" cy="100" r="85" fill="#f3f4f6" />

          {/* Document */}
          <rect x="58" y="45" width="72" height="90" rx="8" fill="white" stroke="#e5e7eb" strokeWidth="2" />
          <rect x="70" y="63" width="48" height="5" rx="2.5" fill="#e5e7eb" />
          <rect x="70" y="76" width="38" height="5" rx="2.5" fill="#e5e7eb" />
          <rect x="70" y="89" width="44" height="5" rx="2.5" fill="#e5e7eb" />

          {/* Magnifier */}
          <circle cx="118" cy="118" r="26" fill="white" stroke="#d1d5db" strokeWidth="2.5" />
          <circle cx="118" cy="118" r="18" fill="#fafafa" />

          {/* X mark */}
          <line x1="110" y1="110" x2="126" y2="126" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
          <line x1="126" y1="110" x2="110" y2="126" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />

          {/* Magnifier handle */}
          <line x1="138" y1="138" x2="152" y2="152" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round" />

          {/* Sparkles */}
          <circle cx="60" cy="50" r="3" fill="#f97316" opacity="0.7" />
          <circle cx="150" cy="70" r="4" fill="#f97316" opacity="0.5" />
          <circle cx="145" cy="145" r="3" fill="#6366f1" opacity="0.6" />
          <circle cx="52" cy="138" r="2.5" fill="#06b6d4" opacity="0.6" />

          {/* Pencil */}
          <g transform="rotate(-35, 72, 55)">
            <rect x="66" y="40" width="12" height="28" rx="2" fill="#fbbf24" />
            <polygon points="66,68 78,68 72,80" fill="#374151" />
            <rect x="66" y="36" width="12" height="8" rx="1" fill="#f87171" />
          </g>
        </svg>
      </div>

      <h2 className="empty-state-title">No assignments yet</h2>
      <p className="empty-state-desc">
        Create your first assignment to start collecting and grading student submissions.
        You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      <Link href="/assignments/new" className="btn btn-primary btn-lg" id="empty-state-create-btn">
        <Plus size={18} />
        Create Your First Assignment
      </Link>
    </div>
  );
}
