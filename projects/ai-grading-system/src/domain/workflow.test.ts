import { describe, expect, it } from 'vitest'
import { canTransitionExam, applyReviewDecision, resolveException } from './workflow'
import type { ExceptionCase, ReviewTask } from './models'

const task: ReviewTask = { id: 'r1', submissionId: 's1', studentName: '林晓雨', className: '高一(1)班', question: '第18题', maxScore: 12, aiScore: 8, finalScore: 8, confidence: .63, answer: '证明过程', reference: '参考答案', scoringPoints: ['建立坐标系'], completed: false }
const exception: ExceptionCase = { id: 'x1', examId: 'e1', studentName: '陈一', className: '高一(1)班', type: '缺页', severity: 'blocking', status: 'open', assignee: '未分配', createdAt: '', detail: '第2页缺失' }

describe('workflow', () => {
  it('限制考试状态只能按业务路径推进', () => {
    expect(canTransitionExam('draft', 'uploading')).toBe(true)
    expect(canTransitionExam('published', 'grading')).toBe(false)
  })

  it('人工改分必须填写原因且返回新对象', () => {
    expect(() => applyReviewDecision(task, 10, '')).toThrow('请填写改分原因')
    const result = applyReviewDecision(task, 10, '评分点遗漏')
    expect(result).toMatchObject({ finalScore: 10, completed: true, reason: '评分点遗漏' })
    expect(task.completed).toBe(false)
  })

  it('关闭异常必须填写处理结论', () => {
    expect(() => resolveException(exception, '')).toThrow('请填写处理结论')
    expect(resolveException(exception, '已补传页面')).toMatchObject({ status: 'resolved', resolution: '已补传页面' })
  })
})
