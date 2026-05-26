'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, RefreshCw, Loader, AlertCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import QuestionPaper from '@/components/output/QuestionPaper';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { getAssignment, regenerateAssignment, getPdfUrl } from '@/lib/api';
import type { AssignmentWithResult } from '@/types';

export default function AssignmentOutputPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<AssignmentWithResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const jobProgress = useAssignmentStore((s) => s.jobProgress[id]);
  const setJobProgress = useAssignmentStore((s) => s.setJobProgress);

  // Subscribe to WebSocket for this assignment
  useWebSocket(id);

  const loadData = useCallback(async () => {
    try {
      const result = await getAssignment(id);
      setData(result);
      setLoadError(null);

      // If still processing, set initial progress state
      if (result.assignment.status === 'processing' || result.assignment.status === 'pending') {
        setJobProgress({
          assignmentId: id,
          status: result.assignment.status,
          progress: result.assignment.status === 'processing' ? 30 : 5,
          message: result.assignment.status === 'processing' ? 'Generating your question paper...' : 'Job queued...',
        });
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load assignment');
    } finally {
      setIsLoading(false);
    }
  }, [id, setJobProgress]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // When job completes via WebSocket, reload data
  useEffect(() => {
    if (jobProgress?.status === 'completed' && jobProgress?.result) {
      setData((prev) => prev ? {
        ...prev,
        assignment: { ...prev.assignment, status: 'completed' },
        result: jobProgress.result!,
      } : prev);
    }
    if (jobProgress?.status === 'failed') {
      setData((prev) => prev ? {
        ...prev,
        assignment: { ...prev.assignment, status: 'failed' },
      } : prev);
    }
  }, [jobProgress]);

  // Poll if still processing (fallback for WebSocket failures)
  useEffect(() => {
    if (!data) return;
    const status = data.assignment.status;
    if (status !== 'processing' && status !== 'pending') return;

    const interval = setInterval(async () => {
      try {
        const fresh = await getAssignment(id);
        if (fresh.assignment.status === 'completed' || fresh.assignment.status === 'failed') {
          setData(fresh);
          clearInterval(interval);
        }
      } catch {}
    }, 4000);

    return () => clearInterval(interval);
  }, [data, id]);

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerate the question paper? The current paper will be replaced.')) return;
    setIsRegenerating(true);
    try {
      await regenerateAssignment(id);
      setJobProgress({
        assignmentId: id,
        status: 'processing',
        progress: 5,
        message: 'Starting regeneration...',
      });
      setData((prev) => prev ? {
        ...prev,
        assignment: { ...prev.assignment, status: 'processing' },
      } : prev);
      toast.success('Regeneration started!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to regenerate');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    window.open(getPdfUrl(id), '_blank');
  };

  const isGenerating =
    jobProgress?.status === 'processing' ||
    jobProgress?.status === 'pending' ||
    (data?.assignment.status === 'processing' || data?.assignment.status === 'pending') && !jobProgress;

  const hasFailed = data?.assignment.status === 'failed' || jobProgress?.status === 'failed';
  const hasResult = !!data?.result || jobProgress?.result;
  const paper = jobProgress?.result || data?.result;
  const assignment = data?.assignment;

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="page-shell">
        <Header
          showBack
          breadcrumb="Create New"
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <div className="page-content">
          <div className="output-page">
            {isLoading ? (
              <div className="job-progress-card">
                <div className="job-progress-icon">
                  <Loader size={32} />
                </div>
                <div className="job-progress-title">Loading Assignment...</div>
                <p className="job-progress-message">Please wait</p>
              </div>
            ) : loadError ? (
              <div className="job-progress-card">
                <div className="job-progress-icon" style={{ background: 'var(--error-light)' }}>
                  <AlertCircle size={32} style={{ color: 'var(--error)', animation: 'none' }} />
                </div>
                <div className="job-progress-title">Failed to Load</div>
                <p className="job-progress-message">{loadError}</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                  <button className="btn btn-secondary" onClick={() => router.push('/assignments')}>
                    Back to Assignments
                  </button>
                  <button className="btn btn-primary" onClick={loadData}>
                    Retry
                  </button>
                </div>
              </div>
            ) : isGenerating ? (
              <div className="job-progress-card">
                <div className="job-progress-icon">
                  <Loader size={32} />
                </div>
                <div className="job-progress-title">
                  {jobProgress?.progress && jobProgress.progress > 50
                    ? 'Almost There!'
                    : 'Generating Your Question Paper'}
                </div>
                <p className="job-progress-message">
                  {jobProgress?.message || 'Our AI is crafting your personalized question paper...'}
                </p>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${jobProgress?.progress || 10}%` }}
                  />
                </div>
                <p className="progress-percent">{jobProgress?.progress || 10}%</p>

                {/* Steps */}
                <div style={{
                  marginTop: '24px',
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  maxWidth: '480px',
                }}>
                  {['Building prompt', 'Calling Gemini AI', 'Parsing response', 'Saving paper'].map((step, i) => {
                    const prog = jobProgress?.progress || 0;
                    const stepThreshold = [10, 40, 70, 90][i];
                    const isActive = prog >= stepThreshold;
                    return (
                      <div
                        key={step}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-full)',
                          background: isActive ? 'var(--success-light)' : 'var(--neutral-100)',
                          color: isActive ? 'var(--success)' : 'var(--neutral-400)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <span>{isActive ? '✓' : '○'}</span>
                        {step}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : hasFailed ? (
              <div className="job-progress-card">
                <div className="job-progress-icon" style={{ background: 'var(--error-light)' }}>
                  <AlertCircle size={32} style={{ color: 'var(--error)', animation: 'none' }} />
                </div>
                <div className="job-progress-title">Generation Failed</div>
                <p className="job-progress-message">
                  {jobProgress?.error || 'Something went wrong while generating the question paper.'}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                  <button className="btn btn-secondary" onClick={() => router.push('/assignments')}>
                    Back
                  </button>
                  <button
                    className="btn btn-orange"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    id="retry-generate-btn"
                  >
                    {isRegenerating ? <><div className="spinner spinner-sm" /> Retrying...</> : <><RefreshCw size={16} /> Try Again</>}
                  </button>
                </div>
              </div>
            ) : paper ? (
              <>
                {/* AI Greeting Banner */}
                <div className="ai-greeting-banner" role="region" aria-label="AI generated paper notification">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: 'rgba(249,115,22,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Sparkles size={18} style={{ color: '#fb923c' }} />
                    </div>
                    <div className="ai-greeting-text">
                      Certainly, <strong>{assignment?.teacherName || 'Teacher'}!</strong>{' '}
                      Here are customized Question Paper for your{' '}
                      <strong>{paper.metadata.subject}</strong>{' '}
                      <strong>{paper.metadata.className}</strong> classes on the NCERT chapters.{' '}
                      Total <strong>{paper.metadata.totalQuestions} questions</strong> worth{' '}
                      <strong>{paper.metadata.totalMarks} marks</strong>.
                    </div>
                  </div>

                  <div className="ai-greeting-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleRegenerate}
                      disabled={isRegenerating}
                      id="regenerate-btn"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: 'rgba(255,255,255,0.8)',
                      }}
                    >
                      {isRegenerating ? (
                        <><div className="spinner spinner-sm" /> Regenerating...</>
                      ) : (
                        <><RefreshCw size={14} /> Regenerate</>
                      )}
                    </button>
                    <button
                      className="btn btn-orange btn-sm"
                      onClick={handleDownloadPdf}
                      id="download-pdf-btn"
                    >
                      <Download size={14} />
                      Download as PDF
                    </button>
                  </div>
                </div>

                {/* Question Paper */}
                <QuestionPaper paper={paper} assignmentId={id} />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
