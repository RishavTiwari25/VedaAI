import axios from 'axios';
import type { Assignment, AssignmentFormData, AssignmentWithResult, ApiResponse } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export async function getAssignments(): Promise<Assignment[]> {
  const { data } = await api.get<ApiResponse<Assignment[]>>('/assignments');
  return data.data;
}

export async function getAssignment(id: string): Promise<AssignmentWithResult> {
  const { data } = await api.get<ApiResponse<AssignmentWithResult>>(`/assignments/${id}`);
  return data.data;
}

export async function createAssignment(formData: AssignmentFormData): Promise<{ assignment: Assignment; jobId: string }> {
  const fd = new FormData();
  fd.append('title', formData.title);
  fd.append('subject', formData.subject);
  fd.append('className', formData.className);
  fd.append('dueDate', formData.dueDate);
  fd.append('questionTypes', JSON.stringify(formData.questionTypes));
  fd.append('additionalInstructions', formData.additionalInstructions || '');
  fd.append('schoolName', formData.schoolName || 'Delhi Public School');
  fd.append('teacherName', formData.teacherName || 'John Doe');
  fd.append('timeAllowed', formData.timeAllowed || '3 Hours');
  if (formData.file) fd.append('file', formData.file);

  const { data } = await api.post<ApiResponse<{ assignment: Assignment; jobId: string }>>('/assignments', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function deleteAssignment(id: string): Promise<void> {
  await api.delete(`/assignments/${id}`);
}

export async function regenerateAssignment(id: string): Promise<{ jobId: string }> {
  const { data } = await api.post<ApiResponse<{ jobId: string }>>(`/assignments/${id}/regenerate`);
  return data.data;
}

export function getPdfUrl(id: string): string {
  return `${API_URL}/api/assignments/${id}/pdf`;
}

export default api;
