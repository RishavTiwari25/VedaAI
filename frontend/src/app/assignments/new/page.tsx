'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft, ArrowRight, Calendar, Mic } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import FileUpload from '@/components/create/FileUpload';
import QuestionTypeRow from '@/components/create/QuestionTypeRow';
import { useAssignmentStore, useTotals } from '@/store/assignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { createAssignment } from '@/lib/api';
import { SUBJECT_OPTIONS, CLASS_OPTIONS, TIME_OPTIONS } from '@/types';

interface FormErrors {
  title?: string;
  subject?: string;
  className?: string;
  dueDate?: string;
  questionTypes?: string;
  [key: string]: string | undefined;
}

export default function NewAssignmentPage() {
  const router = useRouter();
  const {
    formData,
    updateFormField,
    addQuestionType,
    removeQuestionType,
    updateQuestionType,
    resetForm,
    formStep,
    setFormStep,
  } = useAssignmentStore();
  const { totalQuestions, totalMarks } = useTotals();
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { joinAssignment } = useWebSocket();

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Assignment title is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.className.trim()) newErrors.className = 'Class is required';
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else if (new Date(formData.dueDate) < new Date(new Date().toDateString())) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    const hasInvalidQT = formData.questionTypes.some(
      (qt) => !qt.type || qt.count < 1 || qt.marks < 1
    );
    if (formData.questionTypes.length === 0) {
      newErrors.questionTypes = 'Add at least one question type';
    } else if (hasInvalidQT) {
      newErrors.questionTypes = 'All question types must have valid count and marks (min 1)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createAssignment(formData);
      const assignmentId = result.assignment._id;

      // Join WebSocket room immediately
      joinAssignment(assignmentId);

      toast.success('Assignment created! Generating question paper...');
      resetForm();

      // Navigate to output page
      router.push(`/assignments/${assignmentId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  }

  const progressPercent = formStep === 1 ? 50 : 100;

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="page-shell">
        <Header
          showBack
          breadcrumb="Create Assignment"
          onMenuToggle={() => setSidebarOpen(true)}
        />

        <div className="page-content">
          <form onSubmit={handleSubmit} noValidate>
            <div className="create-page">
              {/* Page header */}
              <div className="create-page-header">
                <h1 className="create-page-title">Create Assignment</h1>
                <p className="create-page-subtitle">Set up a new assignment for your students</p>
              </div>

              {/* Progress */}
              <div className="form-progress" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                <div className="form-progress-bar" style={{ width: `${progressPercent}%` }} />
              </div>

              {/* Form Card */}
              <div className="form-card">
                <h2 className="form-section-title">Assignment Details</h2>
                <p className="form-section-subtitle">Basic information about your assignment</p>

                {/* File Upload */}
                <FileUpload
                  onFileChange={(file) => updateFormField('file', file)}
                  selectedFile={formData.file || null}
                />

                {/* Title */}
                <div className="form-group">
                  <label className="form-label" htmlFor="assignment-title">
                    Assignment Title <span className="required">*</span>
                  </label>
                  <input
                    id="assignment-title"
                    type="text"
                    className={`form-input ${errors.title ? 'error' : ''}`}
                    placeholder="e.g. Quiz on Electricity"
                    value={formData.title}
                    onChange={(e) => {
                      updateFormField('title', e.target.value);
                      if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                    }}
                    aria-describedby={errors.title ? 'title-error' : undefined}
                    aria-required="true"
                  />
                  {errors.title && (
                    <p className="form-error" id="title-error" role="alert">{errors.title}</p>
                  )}
                </div>

                {/* Subject + Class */}
                <div className="form-row">
                  <div>
                    <label className="form-label" htmlFor="subject">
                      Subject <span className="required">*</span>
                    </label>
                    <select
                      id="subject"
                      className={`form-select ${errors.subject ? 'error' : ''}`}
                      value={formData.subject}
                      onChange={(e) => {
                        updateFormField('subject', e.target.value);
                        if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
                      }}
                      aria-required="true"
                    >
                      <option value="">Select Subject</option>
                      {SUBJECT_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.subject && <p className="form-error" role="alert">{errors.subject}</p>}
                  </div>

                  <div>
                    <label className="form-label" htmlFor="class">
                      Class/Grade <span className="required">*</span>
                    </label>
                    <select
                      id="class"
                      className={`form-select ${errors.className ? 'error' : ''}`}
                      value={formData.className}
                      onChange={(e) => {
                        updateFormField('className', e.target.value);
                        if (errors.className) setErrors((prev) => ({ ...prev, className: undefined }));
                      }}
                      aria-required="true"
                    >
                      <option value="">Select Class</option>
                      {CLASS_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    {errors.className && <p className="form-error" role="alert">{errors.className}</p>}
                  </div>
                </div>

                {/* Teacher + School */}
                <div className="form-row">
                  <div>
                    <label className="form-label" htmlFor="teacher-name">Teacher Name</label>
                    <input
                      id="teacher-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. John Doe"
                      value={formData.teacherName}
                      onChange={(e) => updateFormField('teacherName', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label" htmlFor="school-name">School Name</label>
                    <input
                      id="school-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Delhi Public School"
                      value={formData.schoolName}
                      onChange={(e) => updateFormField('schoolName', e.target.value)}
                    />
                  </div>
                </div>

                {/* Due Date + Time Allowed */}
                <div className="form-row">
                  <div>
                    <label className="form-label" htmlFor="due-date">
                      Due Date <span className="required">*</span>
                    </label>
                    <div className="form-input-wrapper">
                      <input
                        id="due-date"
                        type="date"
                        className={`form-input ${errors.dueDate ? 'error' : ''}`}
                        value={formData.dueDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                          updateFormField('dueDate', e.target.value);
                          if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: undefined }));
                        }}
                        aria-required="true"
                      />
                      <div className="form-input-icon">
                        <Calendar size={16} />
                      </div>
                    </div>
                    {errors.dueDate && <p className="form-error" role="alert">{errors.dueDate}</p>}
                  </div>

                  <div>
                    <label className="form-label" htmlFor="time-allowed">Time Allowed</label>
                    <select
                      id="time-allowed"
                      className="form-select"
                      value={formData.timeAllowed}
                      onChange={(e) => updateFormField('timeAllowed', e.target.value)}
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Question Types */}
                <div className="form-group">
                  <label className="form-label">
                    Question Type <span className="required">*</span>
                  </label>

                  {/* Column headers — matches Figma table layout */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto auto',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '0 0 8px',
                    borderBottom: '1px solid var(--neutral-150)',
                    marginBottom: '8px',
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Question Type</span>
                    <span style={{ width: '20px' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', minWidth: '90px' }}>No. of Questions</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--neutral-500)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', minWidth: '80px' }}>Marks</span>
                  </div>

                  {formData.questionTypes.map((qt, idx) => (
                    <QuestionTypeRow
                      key={idx}
                      qt={qt}
                      index={idx}
                      onUpdate={updateQuestionType}
                      onRemove={removeQuestionType}
                      canRemove={formData.questionTypes.length > 1}
                    />
                  ))}

                  {errors.questionTypes && (
                    <p className="form-error" role="alert" style={{ marginBottom: '8px' }}>
                      {errors.questionTypes}
                    </p>
                  )}

                  <button
                    type="button"
                    className="add-question-type-btn"
                    onClick={addQuestionType}
                    id="add-question-type-btn"
                  >
                    <Plus size={18} />
                    Add Question Type
                  </button>

                  {/* Totals */}
                  <div className="totals-summary">
                    <div className="total-item">
                      Total Questions: <strong>{totalQuestions}</strong>
                    </div>
                    <div className="total-item">
                      Total Marks: <strong>{totalMarks}</strong>
                    </div>
                  </div>
                </div>

                {/* Additional Instructions */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="additional-instructions">
                    Additional Information (For better output)
                  </label>
                  <div className="form-input-wrapper" style={{ position: 'relative' }}>
                    <textarea
                      id="additional-instructions"
                      className="form-textarea"
                      placeholder="e.g Generate a question paper for 3 hour exam duration..."
                      value={formData.additionalInstructions}
                      onChange={(e) => updateFormField('additionalInstructions', e.target.value)}
                      rows={4}
                    />
                    <div style={{ position: 'absolute', bottom: '12px', right: '12px', color: 'var(--neutral-400)' }}>
                      <Mic size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky bottom nav */}
            <div className="form-nav">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => router.back()}
                id="form-previous-btn"
              >
                <ArrowLeft size={16} />
                Previous
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                id="form-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner spinner-sm" />
                    Creating...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
