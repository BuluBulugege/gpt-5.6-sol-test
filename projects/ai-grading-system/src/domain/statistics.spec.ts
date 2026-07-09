import { describe, expect, it } from 'vitest'
import { calculateScoreSummary, filterSubmissions } from './statistics'
import type { Submission } from './models'

const rows: Submission[] = [
  { id: '1', examId: 'e1', studentId: 's1', studentName: '林晓雨', className: '高一(1)班', status: 'completed', aiScore: 92, finalScore: 94, confidence: .97, updatedAt: '' },
  { id: '2', examId: 'e1', studentId: 's2', studentName: '周明哲', className: '高一(2)班', status: 'review', aiScore: 78, finalScore: 80, confidence: .72, updatedAt: '' },
  { id: '3', examId: 'e1', studentId: 's3', studentName: '陈一', className: '高一(1)班', status: 'absent', aiScore: null, finalScore: null, confidence: null, updatedAt: '' },
]

describe('calculateScoreSummary', () => {
  it('排除缺考并计算核心指标与分数段', () => {
    expect(calculateScoreSummary(rows)).toEqual({
      count: 1,
      average: 94,
      median: 94,
      highest: 94,
      lowest: 94,
      passRate: 100,
      excellentRate: 100,
      bands: [
        { label: '90-100', count: 1 }, { label: '80-89', count: 0 },
        { label: '70-79', count: 0 }, { label: '60-69', count: 0 }, { label: '0-59', count: 0 },
      ],
    })
  })

  it('空成绩返回稳定零值', () => {
    expect(calculateScoreSummary(rows.filter(row => row.status === 'absent')).count).toBe(0)
  })
})

describe('filterSubmissions', () => {
  it('支持中文搜索、班级和状态组合筛选', () => {
    expect(filterSubmissions(rows, { search: '林', className: '高一(1)班', status: 'completed' })).toHaveLength(1)
    expect(filterSubmissions(rows, { search: '不存在', className: 'all', status: 'all' })).toEqual([])
  })
})
