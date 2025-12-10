export interface StudySession {
  id: string;
  subject: string;
  durationMinutes: number;
  timestamp: number;
  notes?: string;
}

export interface SubjectSummary {
  subject: string;
  totalMinutes: number;
}

// For the Heap Visualization
export interface HeapNode extends SubjectSummary {
  rank?: number;
}

export enum SortType {
  HEAP_MAX = 'HEAP_MAX',
  ALPHABETICAL = 'ALPHABETICAL'
}