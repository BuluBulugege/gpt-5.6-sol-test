import type { ExamStatus, ExceptionCase, ReviewTask } from './models'

const transitions: Readonly<Record<ExamStatus, readonly ExamStatus[]>> = { draft: ['uploading'], uploading: ['grading'], grading: ['review', 'ready'], review: ['ready'], ready: ['published'], published: [] }
export const canTransitionExam = (current: ExamStatus, next: ExamStatus) => transitions[current].includes(next)

export function applyReviewDecision(task: ReviewTask, score: number, reason: string): ReviewTask {
  const normalizedReason = reason.trim()
  if (!Number.isFinite(score) || score < 0 || score > task.maxScore) throw new Error(`分数必须在 0-${task.maxScore} 之间`)
  if (score !== task.aiScore && !normalizedReason) throw new Error('请填写改分原因')
  return { ...task, finalScore: score, reason: normalizedReason || '确认 AI 评分', completed: true }
}

export function resolveException(item: ExceptionCase, resolution: string): ExceptionCase {
  const normalized = resolution.trim()
  if (!normalized) throw new Error('请填写处理结论')
  return { ...item, status: 'resolved', resolution: normalized }
}
