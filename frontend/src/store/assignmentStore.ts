import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { Assignment, AssignmentFormData, QuestionType, JobProgressEvent } from '@/types';
import { getAssignments, deleteAssignment } from '@/lib/api';

const DEFAULT_FORM: AssignmentFormData = {
  title: '',
  subject: '',
  className: '',
  dueDate: '',
  questionTypes: [{ type: 'Multiple Choice Questions', count: 4, marks: 1 }],
  additionalInstructions: '',
  schoolName: 'Delhi Public School',
  teacherName: 'John Doe',
  timeAllowed: '3 Hours',
  file: null,
};

interface AssignmentStore {
  // Assignments list
  assignments: Assignment[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;

  // Form state
  formData: AssignmentFormData;
  formStep: number;

  // Job progress tracking
  jobProgress: Record<string, JobProgressEvent>;

  // Actions
  fetchAssignments: () => Promise<void>;
  removeAssignment: (id: string) => Promise<void>;
  setSearchQuery: (q: string) => void;
  updateFormField: <K extends keyof AssignmentFormData>(key: K, value: AssignmentFormData[K]) => void;
  addQuestionType: () => void;
  removeQuestionType: (index: number) => void;
  updateQuestionType: (index: number, field: keyof QuestionType, value: string | number) => void;
  setFormStep: (step: number) => void;
  resetForm: () => void;
  setJobProgress: (event: JobProgressEvent) => void;
  clearJobProgress: (assignmentId: string) => void;
}

export const useAssignmentStore = create<AssignmentStore>()(
  devtools(
    (set, get) => ({
      assignments: [],
      isLoading: false,
      error: null,
      searchQuery: '',
      formData: { ...DEFAULT_FORM },
      formStep: 1,
      jobProgress: {},

      fetchAssignments: async () => {
        set({ isLoading: true, error: null });
        try {
          const assignments = await getAssignments();
          set({ assignments, isLoading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch assignments', isLoading: false });
        }
      },

      removeAssignment: async (id: string) => {
        try {
          await deleteAssignment(id);
          set((state) => ({
            assignments: state.assignments.filter((a) => a._id !== id),
          }));
        } catch (err) {
          throw err;
        }
      },

      setSearchQuery: (q) => set({ searchQuery: q }),

      updateFormField: (key, value) =>
        set((state) => ({ formData: { ...state.formData, [key]: value } })),

      addQuestionType: () =>
        set((state) => ({
          formData: {
            ...state.formData,
            questionTypes: [
              ...state.formData.questionTypes,
              { type: 'Short Answer Questions', count: 3, marks: 2 },
            ],
          },
        })),

      removeQuestionType: (index) =>
        set((state) => ({
          formData: {
            ...state.formData,
            questionTypes: state.formData.questionTypes.filter((_, i) => i !== index),
          },
        })),

      updateQuestionType: (index, field, value) =>
        set((state) => {
          const updated = [...state.formData.questionTypes];
          updated[index] = { ...updated[index], [field]: field === 'type' ? value : Number(value) };
          return { formData: { ...state.formData, questionTypes: updated } };
        }),

      setFormStep: (step) => set({ formStep: step }),

      resetForm: () => set({ formData: { ...DEFAULT_FORM }, formStep: 1 }),

      setJobProgress: (event) =>
        set((state) => ({
          jobProgress: { ...state.jobProgress, [event.assignmentId]: event },
          // Update assignment status in list
          assignments: state.assignments.map((a) =>
            a._id === event.assignmentId ? { ...a, status: event.status } : a
          ),
        })),

      clearJobProgress: (assignmentId) =>
        set((state) => {
          const { [assignmentId]: _, ...rest } = state.jobProgress;
          return { jobProgress: rest };
        }),
    }),
    { name: 'vedaai-store' }
  )
);

// Derived selectors — use useShallow for object/array returns to avoid infinite loops
export const useFilteredAssignments = () =>
  useAssignmentStore(
    useShallow((s) => {
      const q = s.searchQuery.toLowerCase();
      if (!q) return s.assignments;
      return s.assignments.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subject.toLowerCase().includes(q) ||
          a.className.toLowerCase().includes(q)
      );
    })
  );

export const useTotals = () =>
  useAssignmentStore(
    useShallow((s) => ({
      totalQuestions: s.formData.questionTypes.reduce((sum, qt) => sum + (qt.count || 0), 0),
      totalMarks: s.formData.questionTypes.reduce((sum, qt) => sum + (qt.count || 0) * (qt.marks || 0), 0),
    }))
  );
