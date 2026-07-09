export type ExamStatus = 'draft' | 'uploading' | 'grading' | 'review' | 'ready' | 'published'
export type SubmissionStatus = 'completed' | 'review' | 'exception' | 'absent'
export type ExceptionStatus = 'open' | 'processing' | 'resolved'

export interface Exam {
  id: string
  name: string
  subject: string
  grade: string
  classes: string[]
  date: string
  students: number
  submissions: number
  progress: number
  status: ExamStatus
  owner: string
  average: number | null
  maxScore?: number
  reviewMode?: 'ai-review' | 'automatic' | 'double-review'
}

export interface Submission {
  id: string
  examId: string
  studentId: string
  studentName: string
  className: string
  status: SubmissionStatus
  aiScore: number | null
  finalScore: number | null
  confidence: number | null
  updatedAt: string
}

export interface ReviewTask {
  id: string
  submissionId: string
  studentName: string
  className: string
  question: string
  maxScore: number
  aiScore: number
  finalScore: number
  confidence: number
  answer: string
  reference: string
  scoringPoints: string[]
  reason?: string
  completed: boolean
}

export interface ExceptionCase {
  id: string
  examId: string
  studentName: string
  className: string
  type: string
  severity: 'blocking' | 'warning'
  status: ExceptionStatus
  assignee: string
  createdAt: string
  detail: string
  resolution?: string
}

export interface ScoreSummary {
  count: number
  average: number
  median: number
  highest: number
  lowest: number
  passRate: number
  excellentRate: number
  bands: Array<{ label: string; count: number }>
}
