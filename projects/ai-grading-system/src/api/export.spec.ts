import { describe, expect, it } from 'vitest'
import { createScoresCsv } from './export'
import type { Submission } from '../domain/models'

it('CSV 使用 BOM、中文表头并防止公式注入', () => {
  const rows: Submission[] = [{ id: '1', examId: 'e1', studentId: 's1', studentName: '=恶意公式', className: '高一,1班', status: 'completed', aiScore: 90, finalScore: 92, confidence: .98, updatedAt: '' }]
  const csv = createScoresCsv(rows)
  expect(csv.startsWith('\uFEFF')).toBe(true)
  expect(csv).toContain('姓名,班级,状态,AI建议分,最终分,置信度')
  expect(csv).toContain("'=恶意公式")
  expect(csv).toContain('"高一,1班"')
})

it('CSV 防护前导空白与控制字符后的公式', () => {
  const rows: Submission[] = [{ id: '1', examId: 'e1', studentId: 's1', studentName: '\t=HYPERLINK("x")', className: '高一(1)班', status: 'completed', aiScore: 90, finalScore: 92, confidence: .98, updatedAt: '' }]
  expect(createScoresCsv(rows)).toContain("'\t=HYPERLINK")
})
