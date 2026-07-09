import type {
  Exam,
  ExamStatus,
  ExceptionCase,
  ExceptionStatus,
  ReviewTask,
  Submission,
  SubmissionStatus,
} from '../domain/models'
import {
  mockActivityLogs,
  mockExams,
  mockExceptions,
  mockExportRecords,
  mockGradingJobs,
  mockReviewTasks,
  mockSubmissions,
  mockUploadBatches,
  type ActivityLog,
  type ExportRecord,
  type GradingJob,
  type GradingJobStatus,
  type UploadBatch as UploadBatchRecord,
  type UploadBatchStatus,
} from '../data/mockData'
import { icons } from '../components/Icons'
import type { LucideIcon } from 'lucide-react'

export type { ActivityLog, ExportRecord, GradingJob, UploadBatchRecord }

export interface Activity {
  id: string
  text: string
  time: string
  tone: 'blue' | 'green' | 'amber' | 'red'
  icon: LucideIcon
}

export interface ExportJob {
  id: string
  name: string
  type: string
  scope: string
  owner: string
  createdAt: string
  status: '已完成' | '生成中' | '失败'
}

export interface UploadBatch {
  id: string
  name: string
  examName: string
  files: number
  papers: number
  progress: number
  exceptions: number
  owner: string
  stage: string
  status: '处理中' | '待确认' | '完成' | '失败'
  createdAt: string
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PageQuery {
  page?: number
  pageSize?: number
}

export interface ExamListQuery extends PageQuery {
  search?: string
  subject?: string
  grade?: string
  status?: ExamStatus | 'all'
}

export interface SubmissionListQuery extends PageQuery {
  examId?: string
  search?: string
  className?: string
  status?: SubmissionStatus | 'all'
}

export interface ReviewTaskListQuery extends PageQuery {
  examId?: string
  search?: string
  className?: string
  completed?: boolean | 'all'
}

export interface ExceptionListQuery extends PageQuery {
  examId?: string
  search?: string
  severity?: ExceptionCase['severity'] | 'all'
  status?: ExceptionStatus | 'all'
}

export interface CreateExamInput {
  name: string
  subject: string
  grade: string
  classes: string[]
  date: string
  students: number
  owner: string
  maxScore?: number
  reviewMode?: Exam['reviewMode']
}

export interface SubmitReviewInput {
  taskId: string
  finalScore: number
  reason: string
  reviewer: string
}

export interface ResolveExceptionInput {
  exceptionId: string
  resolution: string
  operator: string
}

export interface StartUploadInput {
  examId: string
  name: string
  fileCount: number
  pageCount: number
  operator: string
}

export interface StartGradingInput {
  examId: string
  name?: string
  modelVersion?: string
  operator: string
}

export interface RepositoryOptions {
  minDelayMs?: number
  maxDelayMs?: number
  uploadDurationMs?: number
  gradingDurationMs?: number
}

export interface DashboardSnapshot {
  exams: Exam[]
  recentActivities: ActivityLog[]
  openExceptions: ExceptionCase[]
  activeUploads: UploadBatchRecord[]
  activeGradingJobs: GradingJob[]
}

export interface GradingRepository {
  listExams(query?: ExamListQuery): Promise<PageResult<Exam>>
  getExamById(id: string): Promise<Exam | null>
  createExam(input: CreateExamInput): Promise<Exam>
  listSubmissions(query?: SubmissionListQuery): Promise<PageResult<Submission>>
  getSubmissionById(id: string): Promise<Submission | null>
  listReviewTasks(query?: ReviewTaskListQuery): Promise<PageResult<ReviewTask>>
  getReviewTaskById(id: string): Promise<ReviewTask | null>
  submitReview(input: SubmitReviewInput): Promise<ReviewTask>
  listExceptions(query?: ExceptionListQuery): Promise<PageResult<ExceptionCase>>
  resolveException(input: ResolveExceptionInput): Promise<ExceptionCase>
  listUploadBatches(examId?: string): Promise<UploadBatchRecord[]>
  getUploadBatchById(id: string): Promise<UploadBatchRecord | null>
  startUpload(input: StartUploadInput): Promise<UploadBatchRecord>
  listGradingJobs(examId?: string): Promise<GradingJob[]>
  getGradingJobById(id: string): Promise<GradingJob | null>
  startGrading(input: StartGradingInput): Promise<GradingJob>
  listExportRecords(examId?: string): Promise<ExportRecord[]>
  listActivityLogs(examId?: string): Promise<ActivityLog[]>
  getDashboardSnapshot(): Promise<DashboardSnapshot>
}

interface Simulation {
  startedAt: number
  durationMs: number
}

const defaultOptions: Required<RepositoryOptions> = {
  minDelayMs: 300,
  maxDelayMs: 800,
  uploadDurationMs: 12_000,
  gradingDurationMs: 18_000,
}

const clone = <T>(value: T): T => structuredClone(value)

const normalizeText = (value: string): string => value.trim().toLocaleLowerCase('zh-CN')

const containsText = (source: string, search?: string): boolean => {
  if (!search?.trim()) return true
  return normalizeText(source).includes(normalizeText(search))
}

const requireText = (value: string, label: string, maxLength = 100): string => {
  const normalized = value.trim()
  if (!normalized) throw new Error(`请填写${label}`)
  if (normalized.length > maxLength) throw new Error(`${label}不能超过 ${maxLength} 个字符`)
  return normalized
}

const requirePositiveInteger = (value: number, label: string, maximum = 10_000): number => {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${label}必须是正整数`)
  if (value > maximum) throw new Error(`${label}不能超过 ${maximum}`)
  return value
}

const requireDate = (value: string): string => {
  const normalized = requireText(value, '考试日期', 20)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized) || Number.isNaN(Date.parse(`${normalized}T00:00:00`))) {
    throw new Error('考试日期格式必须为 YYYY-MM-DD')
  }
  return normalized
}

const paginate = <T>(items: T[], query: PageQuery = {}): PageResult<T> => {
  const page = query.page ?? 1
  const pageSize = query.pageSize ?? 20
  if (!Number.isInteger(page) || page < 1) throw new Error('页码必须是正整数')
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) throw new Error('每页数量必须在 1 到 100 之间')
  const total = items.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  return { items: clone(items.slice(start, start + pageSize)), total, page, pageSize, totalPages }
}

const createId = (prefix: string): string => {
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now().toString(36)}-${random}`
}

export class MockGradingRepository implements GradingRepository {
  private exams = clone(mockExams)
  private submissions = clone(mockSubmissions)
  private reviewTasks = clone(mockReviewTasks)
  private exceptions = clone(mockExceptions)
  private uploadBatches = clone(mockUploadBatches)
  private gradingJobs = clone(mockGradingJobs)
  private exportRecords = clone(mockExportRecords)
  private activityLogs = clone(mockActivityLogs)
  private uploadSimulations = new Map<string, Simulation>()
  private gradingSimulations = new Map<string, Simulation>()
  private readonly options: Required<RepositoryOptions>

  constructor(options: RepositoryOptions = {}) {
    this.options = { ...defaultOptions, ...options }
    if (this.options.minDelayMs < 0 || this.options.maxDelayMs < this.options.minDelayMs) {
      throw new Error('异步延迟配置无效')
    }
    if (this.options.uploadDurationMs <= 0 || this.options.gradingDurationMs <= 0) {
      throw new Error('模拟任务时长必须大于 0')
    }
  }

  async listExams(query: ExamListQuery = {}): Promise<PageResult<Exam>> {
    await this.prepare()
    const items = this.exams
      .filter(exam => containsText(`${exam.name} ${exam.subject} ${exam.grade} ${exam.owner}`, query.search))
      .filter(exam => !query.subject || query.subject === 'all' || exam.subject === query.subject)
      .filter(exam => !query.grade || query.grade === 'all' || exam.grade === query.grade)
      .filter(exam => !query.status || query.status === 'all' || exam.status === query.status)
      .sort((left, right) => right.date.localeCompare(left.date))
    return paginate(items, query)
  }

  async getExamById(id: string): Promise<Exam | null> {
    requireText(id, '考试 ID')
    await this.prepare()
    return clone(this.exams.find(exam => exam.id === id) ?? null)
  }

  async createExam(input: CreateExamInput): Promise<Exam> {
    await this.prepare()
    const name = requireText(input.name, '考试名称')
    const subject = requireText(input.subject, '学科', 30)
    const grade = requireText(input.grade, '年级', 30)
    const owner = requireText(input.owner, '负责人', 30)
    const students = requirePositiveInteger(input.students, '学生人数', 5_000)
    const classes = [...new Set(input.classes.map(item => item.trim()).filter(Boolean))]
    if (classes.length === 0) throw new Error('请至少选择一个班级')
    if (classes.length > 50) throw new Error('班级数量不能超过 50 个')
    if (this.exams.some(exam => exam.name === name && exam.date === input.date)) throw new Error('同日期已存在同名考试')

    const exam: Exam = {
      id: createId('exam'),
      name,
      subject,
      grade,
      classes,
      date: requireDate(input.date),
      students,
      submissions: 0,
      progress: 0,
      status: 'draft',
      owner,
      average: null,
      maxScore: input.maxScore ?? 100,
      reviewMode: input.reviewMode ?? 'ai-review',
    }
    this.exams = [exam, ...this.exams]
    this.prependActivity({ examId: exam.id, actor: owner, action: '创建考试', target: name, detail: `已创建${grade}${subject}考试，覆盖 ${classes.length} 个班级、${students} 名学生。`, level: 'success' })
    return clone(exam)
  }

  async listSubmissions(query: SubmissionListQuery = {}): Promise<PageResult<Submission>> {
    await this.prepare()
    const items = this.submissions
      .filter(row => !query.examId || row.examId === query.examId)
      .filter(row => containsText(`${row.studentName} ${row.studentId} ${row.className}`, query.search))
      .filter(row => !query.className || query.className === 'all' || row.className === query.className)
      .filter(row => !query.status || query.status === 'all' || row.status === query.status)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    return paginate(items, query)
  }

  async getSubmissionById(id: string): Promise<Submission | null> {
    requireText(id, '答卷 ID')
    await this.prepare()
    return clone(this.submissions.find(row => row.id === id) ?? null)
  }

  async listReviewTasks(query: ReviewTaskListQuery = {}): Promise<PageResult<ReviewTask>> {
    await this.prepare()
    const submissionIds = query.examId
      ? new Set(this.submissions.filter(row => row.examId === query.examId).map(row => row.id))
      : null
    const items = this.reviewTasks
      .filter(task => !submissionIds || submissionIds.has(task.submissionId))
      .filter(task => containsText(`${task.studentName} ${task.className} ${task.question}`, query.search))
      .filter(task => !query.className || query.className === 'all' || task.className === query.className)
      .filter(task => query.completed === undefined || query.completed === 'all' || task.completed === query.completed)
      .sort((left, right) => Number(left.completed) - Number(right.completed) || left.confidence - right.confidence)
    return paginate(items, query)
  }

  async getReviewTaskById(id: string): Promise<ReviewTask | null> {
    requireText(id, '复核任务 ID')
    await this.prepare()
    return clone(this.reviewTasks.find(task => task.id === id) ?? null)
  }

  async submitReview(input: SubmitReviewInput): Promise<ReviewTask> {
    await this.prepare()
    const taskId = requireText(input.taskId, '复核任务 ID')
    const reviewer = requireText(input.reviewer, '复核人', 30)
    const task = this.reviewTasks.find(item => item.id === taskId)
    if (!task) throw new Error('复核任务不存在')
    if (task.completed) throw new Error('该复核任务已完成')
    if (!Number.isFinite(input.finalScore) || input.finalScore < 0 || input.finalScore > task.maxScore) {
      throw new Error(`分数必须在 0 到 ${task.maxScore} 之间`)
    }
    const scoreChanged = input.finalScore !== task.aiScore
    const reason = scoreChanged ? requireText(input.reason, '改分原因', 200) : input.reason.trim()
    const updatedTask: ReviewTask = { ...task, finalScore: input.finalScore, reason: reason || undefined, completed: true }
    this.reviewTasks = this.reviewTasks.map(item => item.id === taskId ? updatedTask : item)

    const relatedTasks = this.reviewTasks.filter(item => item.submissionId === task.submissionId)
    const submission = this.submissions.find(item => item.id === task.submissionId)
    if (submission) {
      const scoreDelta = input.finalScore - task.aiScore
      const allCompleted = relatedTasks.every(item => item.completed)
      const nextFinalScore = submission.finalScore === null ? null : Math.max(0, submission.finalScore + scoreDelta)
      this.submissions = this.submissions.map(item => item.id === submission.id
        ? { ...item, finalScore: nextFinalScore, status: allCompleted ? 'completed' : 'review', updatedAt: new Date().toISOString() }
        : item)
    }

    const examId = submission?.examId
    this.prependActivity({ examId, actor: reviewer, action: '提交复核', target: `${task.studentName} · ${task.question}`, detail: scoreChanged ? `将 AI 建议分 ${task.aiScore} 分调整为 ${input.finalScore} 分，原因：${reason}。` : `确认 AI 建议分 ${task.aiScore} 分。`, level: 'success' })
    return clone(updatedTask)
  }

  async listExceptions(query: ExceptionListQuery = {}): Promise<PageResult<ExceptionCase>> {
    await this.prepare()
    const items = this.exceptions
      .filter(item => !query.examId || item.examId === query.examId)
      .filter(item => containsText(`${item.studentName} ${item.className} ${item.type} ${item.detail}`, query.search))
      .filter(item => !query.severity || query.severity === 'all' || item.severity === query.severity)
      .filter(item => !query.status || query.status === 'all' || item.status === query.status)
      .sort((left, right) => Number(left.status === 'resolved') - Number(right.status === 'resolved') || right.createdAt.localeCompare(left.createdAt))
    return paginate(items, query)
  }

  async resolveException(input: ResolveExceptionInput): Promise<ExceptionCase> {
    await this.prepare()
    const exceptionId = requireText(input.exceptionId, '异常 ID')
    const resolution = requireText(input.resolution, '处理结论', 300)
    const operator = requireText(input.operator, '处理人', 30)
    const exception = this.exceptions.find(item => item.id === exceptionId)
    if (!exception) throw new Error('异常记录不存在')
    if (exception.status === 'resolved') throw new Error('该异常已处理完成')
    const updatedException: ExceptionCase = { ...exception, status: 'resolved', assignee: operator, resolution }
    this.exceptions = this.exceptions.map(item => item.id === exceptionId ? updatedException : item)
    this.prependActivity({ examId: exception.examId, actor: operator, action: '解决异常', target: `${exception.studentName} · ${exception.type}`, detail: resolution, level: 'success' })
    return clone(updatedException)
  }

  async listUploadBatches(examId?: string): Promise<UploadBatchRecord[]> {
    await this.prepare()
    const items = this.uploadBatches
      .filter(batch => !examId || batch.examId === examId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    return clone(items)
  }

  async getUploadBatchById(id: string): Promise<UploadBatchRecord | null> {
    requireText(id, '上传批次 ID')
    await this.prepare()
    return clone(this.uploadBatches.find(batch => batch.id === id) ?? null)
  }

  async startUpload(input: StartUploadInput): Promise<UploadBatchRecord> {
    await this.prepare()
    const examId = requireText(input.examId, '考试 ID')
    const exam = this.exams.find(item => item.id === examId)
    if (!exam) throw new Error('考试不存在')
    if (exam.status === 'published') throw new Error('已发布考试不能重新上传答卷')
    const fileCount = requirePositiveInteger(input.fileCount, '文件数量', 2_000)
    const pageCount = requirePositiveInteger(input.pageCount, '页数', 20_000)
    if (pageCount < fileCount) throw new Error('总页数不能少于文件数量')
    const operator = requireText(input.operator, '上传人', 30)
    const now = new Date().toISOString()
    const batch: UploadBatchRecord = {
      id: createId('upload'), examId, name: requireText(input.name, '批次名称'), fileCount, pageCount,
      matchedCount: 0, exceptionCount: 0, progress: 1, status: 'uploading', operator, createdAt: now, updatedAt: now,
    }
    this.uploadBatches = [batch, ...this.uploadBatches]
    this.uploadSimulations = new Map(this.uploadSimulations).set(batch.id, { startedAt: Date.now(), durationMs: this.options.uploadDurationMs })
    this.exams = this.exams.map(item => item.id === examId ? { ...item, status: 'uploading', progress: 0 } : item)
    this.prependActivity({ examId, actor: operator, action: '开始上传', target: batch.name, detail: `已提交 ${fileCount} 个文件，共 ${pageCount} 页。`, level: 'info' })
    return clone(batch)
  }

  async listGradingJobs(examId?: string): Promise<GradingJob[]> {
    await this.prepare()
    const items = this.gradingJobs
      .filter(job => !examId || job.examId === examId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    return clone(items)
  }

  async getGradingJobById(id: string): Promise<GradingJob | null> {
    requireText(id, '阅卷任务 ID')
    await this.prepare()
    return clone(this.gradingJobs.find(job => job.id === id) ?? null)
  }

  async startGrading(input: StartGradingInput): Promise<GradingJob> {
    await this.prepare()
    const examId = requireText(input.examId, '考试 ID')
    const exam = this.exams.find(item => item.id === examId)
    if (!exam) throw new Error('考试不存在')
    if (exam.status === 'draft') throw new Error('请先上传答卷再启动 AI 阅卷')
    if (exam.status === 'published') throw new Error('已发布考试不能重新启动阅卷')
    const activeJob = this.gradingJobs.find(job => job.examId === examId && !['completed', 'failed'].includes(job.status))
    if (activeJob) throw new Error('该考试已有进行中的阅卷任务')
    const total = Math.max(exam.submissions, this.uploadBatches.filter(batch => batch.examId === examId).reduce((sum, batch) => sum + batch.fileCount, 0))
    if (total === 0) throw new Error('没有可用于阅卷的答卷')
    const operator = requireText(input.operator, '操作人', 30)
    const now = new Date().toISOString()
    const job: GradingJob = {
      id: createId('grading'), examId, name: input.name?.trim() || `${exam.name} AI 阅卷任务`, total,
      completed: 0, failed: 0, lowConfidence: 0, progress: 0, status: 'queued',
      modelVersion: input.modelVersion?.trim() || 'EduGrade-General-3.2', createdAt: now, updatedAt: now,
    }
    this.gradingJobs = [job, ...this.gradingJobs]
    this.gradingSimulations = new Map(this.gradingSimulations).set(job.id, { startedAt: Date.now(), durationMs: this.options.gradingDurationMs })
    this.exams = this.exams.map(item => item.id === examId ? { ...item, status: 'grading', progress: 0, submissions: total } : item)
    this.prependActivity({ examId, actor: operator, action: '启动阅卷', target: job.name, detail: `共 ${total} 份答卷，使用模型 ${job.modelVersion}。`, level: 'info' })
    return clone(job)
  }

  async listExportRecords(examId?: string): Promise<ExportRecord[]> {
    await this.prepare()
    return clone(this.exportRecords.filter(record => !examId || record.examId === examId).sort((left, right) => right.createdAt.localeCompare(left.createdAt)))
  }

  async listActivityLogs(examId?: string): Promise<ActivityLog[]> {
    await this.prepare()
    return clone(this.activityLogs.filter(log => !examId || log.examId === examId).sort((left, right) => right.createdAt.localeCompare(left.createdAt)))
  }

  async getDashboardSnapshot(): Promise<DashboardSnapshot> {
    await this.prepare()
    return clone({
      exams: this.exams.slice().sort((left, right) => right.date.localeCompare(left.date)).slice(0, 5),
      recentActivities: this.activityLogs.slice().sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, 8),
      openExceptions: this.exceptions.filter(item => item.status !== 'resolved').slice(0, 6),
      activeUploads: this.uploadBatches.filter(item => !['completed', 'failed'].includes(item.status)),
      activeGradingJobs: this.gradingJobs.filter(item => !['completed', 'failed'].includes(item.status)),
    })
  }

  private async prepare(): Promise<void> {
    await this.delay()
    this.advanceUploadSimulations()
    this.advanceGradingSimulations()
  }

  private async delay(): Promise<void> {
    const spread = this.options.maxDelayMs - this.options.minDelayMs
    const duration = this.options.minDelayMs + Math.floor(Math.random() * (spread + 1))
    await new Promise(resolve => globalThis.setTimeout(resolve, duration))
  }

  private advanceUploadSimulations(): void {
    const now = Date.now()
    this.uploadBatches = this.uploadBatches.map(batch => {
      const simulation = this.uploadSimulations.get(batch.id)
      if (!simulation) return batch
      const progress = Math.min(100, Math.max(batch.progress, Math.floor(((now - simulation.startedAt) / simulation.durationMs) * 100)))
      const status = this.uploadStatusFor(progress)
      const matchedCount = progress < 65 ? Math.floor(batch.fileCount * (progress / 100)) : Math.min(batch.fileCount, Math.floor(batch.fileCount * 0.98))
      return { ...batch, progress, status, matchedCount, exceptionCount: progress < 65 ? 0 : batch.fileCount - matchedCount, updatedAt: new Date(now).toISOString() }
    })
    const completedIds = this.uploadBatches
      .filter(batch => this.uploadSimulations.has(batch.id) && batch.progress === 100)
      .map(batch => batch.id)
    if (completedIds.length > 0) {
      const nextSimulations = new Map(this.uploadSimulations)
      completedIds.forEach(id => nextSimulations.delete(id))
      this.uploadSimulations = nextSimulations
      const completedBatches = this.uploadBatches.filter(batch => completedIds.includes(batch.id))
      this.exams = this.exams.map(exam => {
        const batches = completedBatches.filter(batch => batch.examId === exam.id)
        if (batches.length === 0) return exam
        const submissions = Math.min(exam.students, Math.max(exam.submissions, batches.reduce((sum, batch) => sum + batch.matchedCount, 0)))
        return { ...exam, submissions, status: 'uploading', progress: 0 }
      })
    }
  }

  private advanceGradingSimulations(): void {
    const now = Date.now()
    this.gradingJobs = this.gradingJobs.map(job => {
      const simulation = this.gradingSimulations.get(job.id)
      if (!simulation) return job
      const progress = Math.min(100, Math.max(job.progress, Math.floor(((now - simulation.startedAt) / simulation.durationMs) * 100)))
      const status = this.gradingStatusFor(progress)
      const failed = progress < 35 ? 0 : Math.max(0, Math.round(job.total * 0.01))
      const completed = Math.min(job.total - failed, Math.floor(job.total * (progress / 100)))
      const lowConfidence = progress < 55 ? 0 : Math.max(1, Math.round(job.total * 0.06))
      return { ...job, progress, status, failed, completed, lowConfidence, updatedAt: new Date(now).toISOString() }
    })
    const completedIds = this.gradingJobs
      .filter(job => this.gradingSimulations.has(job.id) && job.progress === 100)
      .map(job => job.id)
    if (completedIds.length > 0) {
      const nextSimulations = new Map(this.gradingSimulations)
      completedIds.forEach(id => nextSimulations.delete(id))
      this.gradingSimulations = nextSimulations
    }
    this.exams = this.exams.map(exam => {
      const activeJob = this.gradingJobs.find(job => job.examId === exam.id && this.gradingSimulations.has(job.id))
      const completedJob = this.gradingJobs.find(job => job.examId === exam.id && completedIds.includes(job.id))
      if (activeJob) return { ...exam, status: 'grading', progress: activeJob.progress }
      if (completedJob) return { ...exam, status: 'review', progress: 100 }
      return exam
    })
  }

  private uploadStatusFor(progress: number): UploadBatchStatus {
    if (progress >= 100) return 'completed'
    if (progress >= 85) return 'confirming'
    if (progress >= 60) return 'splitting'
    if (progress >= 30) return 'validating'
    return 'uploading'
  }

  private gradingStatusFor(progress: number): GradingJobStatus {
    if (progress >= 100) return 'completed'
    if (progress >= 90) return 'quality-check'
    if (progress >= 55) return 'grading'
    if (progress >= 25) return 'recognizing'
    if (progress >= 5) return 'image-processing'
    return 'queued'
  }

  private prependActivity(input: Omit<ActivityLog, 'id' | 'createdAt'>): void {
    const activity: ActivityLog = { ...input, id: createId('log'), createdAt: new Date().toISOString() }
    this.activityLogs = [activity, ...this.activityLogs]
  }
}

export const gradingRepository: GradingRepository = new MockGradingRepository()

const formatCompactTime = (value: string): string => {
  const elapsed = Date.now() - new Date(value).getTime()
  if (elapsed >= 0 && elapsed < 60_000) return '刚刚'
  if (elapsed >= 0 && elapsed < 3_600_000) return `${Math.max(1, Math.floor(elapsed / 60_000))} 分钟前`
  return new Intl.DateTimeFormat('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

const toActivity = (log: ActivityLog): Activity => {
  const tone = log.level === 'success' ? 'green' : log.level === 'warning' ? 'amber' : 'blue'
  const icon = log.level === 'warning' ? icons.AlertTriangle : log.level === 'success' ? icons.CheckCircle2 : icons.Sparkles
  return { id: log.id, text: `${log.actor}${log.action}：${log.target}`, time: formatCompactTime(log.createdAt), tone, icon }
}

const uploadStageLabels: Record<UploadBatchStatus, string> = {
  waiting: '等待上传', uploading: '文件上传', validating: '文件预检', splitting: '拆卷匹配', confirming: '等待确认', completed: '处理完成', failed: '处理失败',
}

const toUploadBatch = (batch: UploadBatchRecord, examName: string): UploadBatch => ({
  id: batch.id,
  name: batch.name,
  examName,
  files: batch.fileCount,
  papers: batch.matchedCount,
  progress: batch.progress,
  exceptions: batch.exceptionCount,
  owner: batch.operator,
  stage: uploadStageLabels[batch.status],
  status: batch.status === 'completed' ? '完成' : batch.status === 'failed' ? '失败' : batch.status === 'confirming' ? '待确认' : '处理中',
  createdAt: new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(batch.createdAt)),
})

const toExportJob = (record: ExportRecord): ExportJob => ({
  id: record.id,
  name: `${record.examName}-${record.type}.${record.format}`,
  type: record.type,
  scope: `${record.rowCount} 条记录`,
  owner: record.createdBy,
  createdAt: new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(record.createdAt)),
  status: record.status === 'completed' ? '已完成' : record.status === 'failed' ? '失败' : '生成中',
})

const compatibilityRepository = new MockGradingRepository()

async function collectPages<T>(load: (page: number) => Promise<PageResult<T>>): Promise<T[]> {
  const first = await load(1)
  if (first.totalPages <= 1) return first.items
  const rest = await Promise.all(Array.from({ length: first.totalPages - 1 }, (_, index) => load(index + 2)))
  return [first, ...rest].flatMap(result => result.items)
}

export const repository = {
  async getWorkspace(): Promise<{
    exams: Exam[]
    submissions: Submission[]
    reviews: ReviewTask[]
    exceptions: ExceptionCase[]
    uploads: UploadBatch[]
    exports: ExportJob[]
    activities: Activity[]
  }> {
    const [examItems, submissions, reviews, exceptions, uploads, exports, activities] = await Promise.all([
      collectPages(page => compatibilityRepository.listExams({ page, pageSize: 100 })),
      collectPages(page => compatibilityRepository.listSubmissions({ page, pageSize: 100 })),
      collectPages(page => compatibilityRepository.listReviewTasks({ page, pageSize: 100 })),
      collectPages(page => compatibilityRepository.listExceptions({ page, pageSize: 100 })),
      compatibilityRepository.listUploadBatches(),
      compatibilityRepository.listExportRecords(),
      compatibilityRepository.listActivityLogs(),
    ])
    const examNames = new Map(examItems.map(exam => [exam.id, exam.name]))
    return {
      exams: examItems,
      submissions,
      reviews,
      exceptions,
      uploads: uploads.map(batch => toUploadBatch(batch, examNames.get(batch.examId) ?? '未命名考试')),
      exports: exports.map(toExportJob),
      activities: activities.map(toActivity),
    }
  },

  createExam(input: Omit<CreateExamInput, 'owner'>): Promise<Exam> {
    return compatibilityRepository.createExam({ ...input, owner: '张明远' })
  },

  async createUploadBatch(fileCount = 48, pageCount = fileCount * 4): Promise<UploadBatch> {
    if (!Number.isInteger(fileCount) || fileCount < 1 || fileCount > 500) throw new Error('文件数量必须在 1-500 之间')
    if (!Number.isInteger(pageCount) || pageCount < fileCount || pageCount > 10_000) throw new Error('答卷页数不合法')
    const exams = await collectPages(page => compatibilityRepository.listExams({ page, pageSize: 100 }))
    const exam = exams.find(item => item.status !== 'published' && item.status !== 'draft') ?? exams.find(item => item.status !== 'published')
    if (!exam) throw new Error('没有可上传答卷的考试')
    const batch = await compatibilityRepository.startUpload({ examId: exam.id, name: `${exam.grade}${exam.subject}答题卡-${new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`, fileCount, pageCount, operator: '张明远' })
    return toUploadBatch(batch, exam.name)
  },

  simulateUpload(id: string, onUpdate: (batch: UploadBatch) => void): void {
    requireText(id, '上传批次 ID')
    const poll = async (): Promise<void> => {
      const batch = await compatibilityRepository.getUploadBatchById(id)
      if (!batch) return
      const exam = await compatibilityRepository.getExamById(batch.examId)
      onUpdate(toUploadBatch(batch, exam?.name ?? '未命名考试'))
      if (batch.status !== 'completed' && batch.status !== 'failed') globalThis.setTimeout(() => void poll(), 900)
    }
    void poll()
  },

  submitReview(taskId: string, finalScore: number, reason: string): Promise<ReviewTask> {
    return compatibilityRepository.submitReview({ taskId, finalScore, reason, reviewer: '张明远' })
  },

  getSubmission(id: string): Promise<Submission | null> {
    return compatibilityRepository.getSubmissionById(id)
  },

  resolveException(exceptionId: string, resolution: string): Promise<ExceptionCase> {
    return compatibilityRepository.resolveException({ exceptionId, resolution, operator: '张明远' })
  },
}
