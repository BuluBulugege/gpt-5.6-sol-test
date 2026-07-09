import { describe, expect, it } from 'vitest'
import { MockGradingRepository } from './repository'

describe('MockGradingRepository', () => {
  it('通过仓库统一读取分页数据且返回深拷贝', async () => {
    const repository = new MockGradingRepository({ minDelayMs: 0, maxDelayMs: 0 })
    const first = await repository.listExams({ page: 1, pageSize: 2 })
    const second = await repository.listExams({ page: 1, pageSize: 2 })
    expect(first.items).toHaveLength(2)
    expect(first.total).toBeGreaterThan(2)
    expect(first.items).not.toBe(second.items)
  })

  it('创建考试时校验输入并生成独立草稿', async () => {
    const repository = new MockGradingRepository({ minDelayMs: 0, maxDelayMs: 0 })
    await expect(repository.createExam({ name: '', subject: '数学', grade: '高一', classes: [], date: '2026-07-16', students: 0, owner: '张老师' })).rejects.toThrow()
    const exam = await repository.createExam({ name: '高一数学月考', subject: '数学', grade: '高一', classes: ['高一(1)班'], date: '2026-07-16', students: 46, owner: '张老师' })
    expect(exam).toMatchObject({ status: 'draft', progress: 0, students: 46 })
  })

  it('复核和异常处理形成不可变闭环', async () => {
    const repository = new MockGradingRepository({ minDelayMs: 0, maxDelayMs: 0 })
    const queue = await repository.listReviewTasks({ completed: false, pageSize: 10 })
    const task = queue.items[0]
    const updated = await repository.submitReview({ taskId: task.id, finalScore: task.aiScore, reason: '', reviewer: '张老师' })
    expect(updated.completed).toBe(true)
    const cases = await repository.listExceptions({ status: 'open', pageSize: 10 })
    const resolved = await repository.resolveException({ exceptionId: cases.items[0].id, resolution: '已核对原卷并补传', operator: '张老师' })
    expect(resolved.status).toBe('resolved')
  })

  it('上传模拟可被轮询并推进状态', async () => {
    const repository = new MockGradingRepository({ minDelayMs: 0, maxDelayMs: 0, uploadDurationMs: 20 })
    const exam = (await repository.listExams({ pageSize: 20 })).items.find((item) => item.status !== 'published')!
    const batch = await repository.startUpload({ examId: exam.id, name: '测试批次', fileCount: 10, pageCount: 40, operator: '张老师' })
    expect(batch.progress).toBeGreaterThanOrEqual(0)
    await new Promise((resolve) => setTimeout(resolve, 12))
    const advanced = await repository.getUploadBatchById(batch.id)
    expect(advanced?.progress).toBeGreaterThan(batch.progress)
  })
})
