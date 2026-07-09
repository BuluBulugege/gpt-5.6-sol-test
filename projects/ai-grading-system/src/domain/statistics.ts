import type { ScoreSummary, Submission } from './models'

export interface SubmissionFilters {
  search: string
  className: string
  status: Submission['status'] | 'all'
}

const round = (value: number) => Math.round(value * 10) / 10

export function calculateScoreSummary(rows: readonly Submission[]): ScoreSummary {
  const scores = rows.filter((row) => row.status === 'completed' && row.finalScore !== null).map((row) => row.finalScore as number).sort((left, right) => left - right)
  if (scores.length === 0) return { count: 0, average: 0, median: 0, highest: 0, lowest: 0, passRate: 0, excellentRate: 0, bands: ['90-100', '80-89', '70-79', '60-69', '0-59'].map((label) => ({ label, count: 0 })) }
  const middle = Math.floor(scores.length / 2)
  const median = scores.length % 2 === 0 ? (scores[middle - 1] + scores[middle]) / 2 : scores[middle]
  return {
    count: scores.length,
    average: round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
    median: round(median), highest: scores.at(-1) ?? 0, lowest: scores[0],
    passRate: round((scores.filter((score) => score >= 60).length / scores.length) * 100),
    excellentRate: round((scores.filter((score) => score >= 90).length / scores.length) * 100),
    bands: [
      { label: '90-100', count: scores.filter((score) => score >= 90).length },
      { label: '80-89', count: scores.filter((score) => score >= 80 && score < 90).length },
      { label: '70-79', count: scores.filter((score) => score >= 70 && score < 80).length },
      { label: '60-69', count: scores.filter((score) => score >= 60 && score < 70).length },
      { label: '0-59', count: scores.filter((score) => score < 60).length },
    ],
  }
}

export function filterSubmissions(rows: readonly Submission[], filters: SubmissionFilters): Submission[] {
  const keyword = filters.search.trim().toLocaleLowerCase('zh-CN')
  return rows.filter((row) => {
    const matchesSearch = !keyword || [row.studentName, row.studentId, row.id].some((value) => value.toLocaleLowerCase('zh-CN').includes(keyword))
    return matchesSearch && (filters.className === 'all' || row.className === filters.className) && (filters.status === 'all' || row.status === filters.status)
  })
}
