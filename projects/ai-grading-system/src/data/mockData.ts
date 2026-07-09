import type {
  Exam,
  ExceptionCase,
  ReviewTask,
  Submission,
} from '../domain/models'

export type UploadBatchStatus =
  | 'waiting'
  | 'uploading'
  | 'validating'
  | 'splitting'
  | 'confirming'
  | 'completed'
  | 'failed'

export type GradingJobStatus =
  | 'queued'
  | 'image-processing'
  | 'recognizing'
  | 'grading'
  | 'quality-check'
  | 'completed'
  | 'failed'

export interface UploadBatch {
  id: string
  examId: string
  name: string
  fileCount: number
  pageCount: number
  matchedCount: number
  exceptionCount: number
  progress: number
  status: UploadBatchStatus
  operator: string
  createdAt: string
  updatedAt: string
}

export interface GradingJob {
  id: string
  examId: string
  name: string
  total: number
  completed: number
  failed: number
  lowConfidence: number
  progress: number
  status: GradingJobStatus
  modelVersion: string
  createdAt: string
  updatedAt: string
}

export interface ExportRecord {
  id: string
  examId: string
  examName: string
  type: '成绩明细' | '班级分析' | '学生报告' | '异常清单'
  format: 'xlsx' | 'csv' | 'pdf'
  status: 'processing' | 'completed' | 'failed'
  rowCount: number
  createdBy: string
  createdAt: string
  downloadUrl?: string
}

export interface ActivityLog {
  id: string
  examId?: string
  actor: string
  action: string
  target: string
  detail: string
  level: 'info' | 'success' | 'warning'
  createdAt: string
}

export const mockExams: Exam[] = [
  { id: 'exam-2025-mid-math', name: '2025-2026 学年第一学期期中考试', subject: '数学', grade: '高一', classes: ['高一(1)班', '高一(2)班', '高一(3)班', '高一(4)班'], date: '2025-11-12', students: 186, submissions: 184, progress: 87, status: 'review', owner: '张明远', average: 78.6 },
  { id: 'exam-2025-month-physics', name: '高二年级 12 月月考', subject: '物理', grade: '高二', classes: ['高二(1)班', '高二(2)班', '高二(3)班'], date: '2025-12-18', students: 142, submissions: 142, progress: 64, status: 'grading', owner: '李婉清', average: null },
  { id: 'exam-2025-final-chinese', name: '初三语文期末质量检测', subject: '语文', grade: '初三', classes: ['初三(1)班', '初三(2)班', '初三(3)班', '初三(4)班', '初三(5)班'], date: '2026-01-16', students: 228, submissions: 0, progress: 0, status: 'uploading', owner: '周静', average: null },
  { id: 'exam-2025-english', name: '高一英语单元综合测评', subject: '英语', grade: '高一', classes: ['高一(1)班', '高一(2)班'], date: '2025-10-25', students: 94, submissions: 94, progress: 100, status: 'published', owner: '王雅婷', average: 82.4 },
  { id: 'exam-2026-chemistry', name: '高二化学寒假前诊断考试', subject: '化学', grade: '高二', classes: ['高二(1)班', '高二(2)班', '高二(3)班'], date: '2026-01-22', students: 141, submissions: 141, progress: 98, status: 'ready', owner: '陈启航', average: 73.9 },
  { id: 'exam-2026-biology-draft', name: '高一生物必修一阶段检测', subject: '生物', grade: '高一', classes: ['高一(3)班', '高一(4)班'], date: '2026-02-28', students: 92, submissions: 0, progress: 0, status: 'draft', owner: '赵欣怡', average: null },
]

export const mockSubmissions: Submission[] = [
  { id: 'sub-001', examId: 'exam-2025-mid-math', studentId: '20250101', studentName: '林晓雨', className: '高一(1)班', status: 'completed', aiScore: 91, finalScore: 93, confidence: 0.97, updatedAt: '2025-11-13T15:31:00+08:00' },
  { id: 'sub-002', examId: 'exam-2025-mid-math', studentId: '20250102', studentName: '周明哲', className: '高一(1)班', status: 'review', aiScore: 78, finalScore: 78, confidence: 0.68, updatedAt: '2025-11-13T15:29:00+08:00' },
  { id: 'sub-003', examId: 'exam-2025-mid-math', studentId: '20250103', studentName: '陈一诺', className: '高一(1)班', status: 'exception', aiScore: null, finalScore: null, confidence: 0.41, updatedAt: '2025-11-13T15:24:00+08:00' },
  { id: 'sub-004', examId: 'exam-2025-mid-math', studentId: '20250104', studentName: '许嘉宁', className: '高一(1)班', status: 'completed', aiScore: 84, finalScore: 84, confidence: 0.95, updatedAt: '2025-11-13T15:20:00+08:00' },
  { id: 'sub-005', examId: 'exam-2025-mid-math', studentId: '20250105', studentName: '沈知夏', className: '高一(1)班', status: 'completed', aiScore: 96, finalScore: 96, confidence: 0.99, updatedAt: '2025-11-13T15:18:00+08:00' },
  { id: 'sub-006', examId: 'exam-2025-mid-math', studentId: '20250201', studentName: '顾辰安', className: '高一(2)班', status: 'review', aiScore: 72, finalScore: 72, confidence: 0.61, updatedAt: '2025-11-13T15:13:00+08:00' },
  { id: 'sub-007', examId: 'exam-2025-mid-math', studentId: '20250202', studentName: '陆星河', className: '高一(2)班', status: 'completed', aiScore: 88, finalScore: 89, confidence: 0.93, updatedAt: '2025-11-13T15:08:00+08:00' },
  { id: 'sub-008', examId: 'exam-2025-mid-math', studentId: '20250203', studentName: '唐可心', className: '高一(2)班', status: 'absent', aiScore: null, finalScore: null, confidence: null, updatedAt: '2025-11-13T14:58:00+08:00' },
  { id: 'sub-009', examId: 'exam-2025-mid-math', studentId: '20250301', studentName: '宋言澈', className: '高一(3)班', status: 'exception', aiScore: 65, finalScore: null, confidence: 0.52, updatedAt: '2025-11-13T14:49:00+08:00' },
  { id: 'sub-010', examId: 'exam-2025-mid-math', studentId: '20250302', studentName: '夏清和', className: '高一(3)班', status: 'completed', aiScore: 81, finalScore: 82, confidence: 0.94, updatedAt: '2025-11-13T14:42:00+08:00' },
  { id: 'sub-011', examId: 'exam-2025-mid-math', studentId: '20250401', studentName: '江予白', className: '高一(4)班', status: 'review', aiScore: 69, finalScore: 69, confidence: 0.66, updatedAt: '2025-11-13T14:36:00+08:00' },
  { id: 'sub-012', examId: 'exam-2025-mid-math', studentId: '20250402', studentName: '叶书宁', className: '高一(4)班', status: 'completed', aiScore: 90, finalScore: 92, confidence: 0.96, updatedAt: '2025-11-13T14:31:00+08:00' },
  { id: 'sub-p001', examId: 'exam-2025-month-physics', studentId: '20240101', studentName: '何慕远', className: '高二(1)班', status: 'completed', aiScore: 86, finalScore: 86, confidence: 0.95, updatedAt: '2025-12-19T11:30:00+08:00' },
  { id: 'sub-p002', examId: 'exam-2025-month-physics', studentId: '20240102', studentName: '季南乔', className: '高二(1)班', status: 'review', aiScore: 74, finalScore: 74, confidence: 0.64, updatedAt: '2025-12-19T11:28:00+08:00' },
  { id: 'sub-p003', examId: 'exam-2025-month-physics', studentId: '20240201', studentName: '程望舒', className: '高二(2)班', status: 'exception', aiScore: null, finalScore: null, confidence: 0.38, updatedAt: '2025-12-19T11:21:00+08:00' },
]

export const mockReviewTasks: ReviewTask[] = [
  { id: 'review-001', submissionId: 'sub-002', studentName: '周明哲', className: '高一(1)班', question: '第 18 题（2）', maxScore: 12, aiScore: 8, finalScore: 8, confidence: 0.63, answer: '设函数在区间内单调递增，由导数大于零可得参数范围为 a≥1。', reference: '先求导并讨论零点，再根据区间端点验证参数范围。', scoringPoints: ['正确求出导函数（3分）', '分类讨论导数符号（5分）', '验证端点并写出范围（4分）'], completed: false },
  { id: 'review-002', submissionId: 'sub-006', studentName: '顾辰安', className: '高一(2)班', question: '第 20 题', maxScore: 14, aiScore: 9, finalScore: 9, confidence: 0.58, answer: '连接 AC，证明两个三角形全等，因此角 BDC 等于角 BAC。', reference: '添加辅助线后利用圆周角定理及相似三角形求证。', scoringPoints: ['正确添加辅助线（2分）', '写出关键角关系（4分）', '证明三角形相似（5分）', '得出结论（3分）'], completed: false },
  { id: 'review-003', submissionId: 'sub-011', studentName: '江予白', className: '高一(4)班', question: '第 17 题（1）', maxScore: 6, aiScore: 3, finalScore: 3, confidence: 0.66, answer: '数列首项为 2，公差为 3，所以通项是 3n-1。', reference: '由相邻项关系判断等差数列，再代入首项求通项。', scoringPoints: ['判断数列类型（2分）', '求出公差（2分）', '写出通项公式（2分）'], completed: false },
  { id: 'review-004', submissionId: 'sub-p002', studentName: '季南乔', className: '高二(1)班', question: '第 15 题', maxScore: 10, aiScore: 6, finalScore: 6, confidence: 0.64, answer: '物体先做匀加速运动，达到最大速度后做匀速运动。', reference: '结合速度时间图像，分段计算加速度和位移。', scoringPoints: ['判断运动阶段（3分）', '计算加速度（3分）', '计算总位移（4分）'], completed: false },
  { id: 'review-005', submissionId: 'sub-001', studentName: '林晓雨', className: '高一(1)班', question: '第 19 题', maxScore: 12, aiScore: 10, finalScore: 12, confidence: 0.79, answer: '利用余弦定理求出边长，再由面积公式得到结果。', reference: '余弦定理与三角形面积公式联合求解。', scoringPoints: ['正确使用余弦定理（5分）', '求出边长（3分）', '面积计算正确（4分）'], reason: '等价解法，步骤完整', completed: true },
  { id: 'review-006', submissionId: 'sub-007', studentName: '陆星河', className: '高一(2)班', question: '第 21 题（2）', maxScore: 8, aiScore: 6, finalScore: 7, confidence: 0.72, answer: '概率为 7/12。', reference: '列出所有基本事件并统计满足条件的事件数。', scoringPoints: ['列出样本空间（3分）', '筛选有效事件（3分）', '概率结论（2分）'], reason: 'AI 漏识别一个有效事件', completed: true },
]

export const mockExceptions: ExceptionCase[] = [
  { id: 'exception-001', examId: 'exam-2025-mid-math', studentName: '陈一诺', className: '高一(1)班', type: '页面缺失', severity: 'blocking', status: 'open', assignee: '未分配', createdAt: '2025-11-13T14:22:00+08:00', detail: '检测到第 2 页缺失，包含第 11 至 16 题，成绩发布已被阻止。' },
  { id: 'exception-002', examId: 'exam-2025-mid-math', studentName: '宋言澈', className: '高一(3)班', type: '学生匹配失败', severity: 'blocking', status: 'processing', assignee: '张明远', createdAt: '2025-11-13T14:28:00+08:00', detail: '考号区域存在涂改，候选学生相似度最高为 52%。' },
  { id: 'exception-003', examId: 'exam-2025-mid-math', studentName: '顾辰安', className: '高一(2)班', type: 'OCR 置信度低', severity: 'warning', status: 'open', assignee: '刘思远', createdAt: '2025-11-13T14:35:00+08:00', detail: '第 20 题手写内容有多处覆盖，关键公式识别置信度为 58%。' },
  { id: 'exception-004', examId: 'exam-2025-month-physics', studentName: '程望舒', className: '高二(2)班', type: '图像模糊', severity: 'blocking', status: 'open', assignee: '李婉清', createdAt: '2025-12-19T10:51:00+08:00', detail: '第 1 页存在严重运动模糊，选择题答题区域无法可靠识别。' },
  { id: 'exception-005', examId: 'exam-2025-month-physics', studentName: '方景行', className: '高二(3)班', type: '重复答卷', severity: 'warning', status: 'processing', assignee: '王睿', createdAt: '2025-12-19T10:43:00+08:00', detail: '发现两份文件指纹相似度 99.7%，需要确认保留版本。' },
  { id: 'exception-006', examId: 'exam-2025-mid-math', studentName: '许嘉宁', className: '高一(1)班', type: '总分校验异常', severity: 'warning', status: 'resolved', assignee: '张明远', createdAt: '2025-11-13T13:40:00+08:00', detail: '题目分数合计与总分相差 2 分。', resolution: '人工核对后确认第 18 题漏加 2 分，已修正。' },
  { id: 'exception-007', examId: 'exam-2025-final-chinese', studentName: '批次未匹配', className: '初三(4)班', type: '试卷倒置', severity: 'warning', status: 'open', assignee: '未分配', createdAt: '2026-01-17T09:10:00+08:00', detail: '上传批次中有 8 页方向异常，系统已自动旋转，等待确认。' },
]

export const mockUploadBatches: UploadBatch[] = [
  { id: 'upload-001', examId: 'exam-2025-mid-math', name: '高一数学答题卡 A 批次', fileCount: 96, pageCount: 384, matchedCount: 94, exceptionCount: 2, progress: 100, status: 'completed', operator: '张明远', createdAt: '2025-11-13T08:30:00+08:00', updatedAt: '2025-11-13T09:18:00+08:00' },
  { id: 'upload-002', examId: 'exam-2025-mid-math', name: '高一数学答题卡 B 批次', fileCount: 90, pageCount: 360, matchedCount: 90, exceptionCount: 1, progress: 100, status: 'completed', operator: '刘思远', createdAt: '2025-11-13T09:20:00+08:00', updatedAt: '2025-11-13T10:05:00+08:00' },
  { id: 'upload-003', examId: 'exam-2025-month-physics', name: '高二物理扫描件', fileCount: 142, pageCount: 568, matchedCount: 136, exceptionCount: 6, progress: 82, status: 'confirming', operator: '李婉清', createdAt: '2025-12-19T08:15:00+08:00', updatedAt: '2025-12-19T11:32:00+08:00' },
  { id: 'upload-004', examId: 'exam-2025-final-chinese', name: '初三语文第一考场', fileCount: 48, pageCount: 288, matchedCount: 0, exceptionCount: 0, progress: 31, status: 'validating', operator: '周静', createdAt: '2026-01-17T08:40:00+08:00', updatedAt: '2026-01-17T09:12:00+08:00' },
]

export const mockGradingJobs: GradingJob[] = [
  { id: 'grading-001', examId: 'exam-2025-mid-math', name: '高一数学 AI 阅卷任务', total: 184, completed: 160, failed: 2, lowConfidence: 12, progress: 87, status: 'quality-check', modelVersion: 'EduGrade-Math-3.2', createdAt: '2025-11-13T10:10:00+08:00', updatedAt: '2025-11-13T15:30:00+08:00' },
  { id: 'grading-002', examId: 'exam-2025-month-physics', name: '高二物理 AI 阅卷任务', total: 142, completed: 91, failed: 3, lowConfidence: 9, progress: 64, status: 'grading', modelVersion: 'EduGrade-Science-2.8', createdAt: '2025-12-19T09:25:00+08:00', updatedAt: '2025-12-19T11:35:00+08:00' },
  { id: 'grading-003', examId: 'exam-2025-english', name: '高一英语 AI 阅卷任务', total: 94, completed: 94, failed: 0, lowConfidence: 4, progress: 100, status: 'completed', modelVersion: 'EduGrade-English-3.0', createdAt: '2025-10-26T08:50:00+08:00', updatedAt: '2025-10-26T10:16:00+08:00' },
]

export const mockExportRecords: ExportRecord[] = [
  { id: 'export-001', examId: 'exam-2025-english', examName: '高一英语单元综合测评', type: '成绩明细', format: 'xlsx', status: 'completed', rowCount: 94, createdBy: '王雅婷', createdAt: '2025-10-27T16:20:00+08:00', downloadUrl: '#mock-download' },
  { id: 'export-002', examId: 'exam-2025-english', examName: '高一英语单元综合测评', type: '班级分析', format: 'pdf', status: 'completed', rowCount: 2, createdBy: '王雅婷', createdAt: '2025-10-27T16:22:00+08:00', downloadUrl: '#mock-download' },
  { id: 'export-003', examId: 'exam-2026-chemistry', examName: '高二化学寒假前诊断考试', type: '成绩明细', format: 'csv', status: 'completed', rowCount: 141, createdBy: '陈启航', createdAt: '2026-01-23T09:12:00+08:00', downloadUrl: '#mock-download' },
  { id: 'export-004', examId: 'exam-2025-mid-math', examName: '2025-2026 学年第一学期期中考试', type: '异常清单', format: 'xlsx', status: 'processing', rowCount: 5, createdBy: '张明远', createdAt: '2025-11-13T15:35:00+08:00' },
]

export const mockActivityLogs: ActivityLog[] = [
  { id: 'log-001', examId: 'exam-2025-mid-math', actor: '张明远', action: '人工复核', target: '林晓雨 · 第 19 题', detail: '将 AI 建议分 10 分调整为 12 分，原因：等价解法，步骤完整。', level: 'success', createdAt: '2025-11-13T15:31:00+08:00' },
  { id: 'log-002', examId: 'exam-2025-mid-math', actor: '系统', action: '质量预警', target: '陈一诺 · 答卷', detail: '检测到第 2 页缺失，已阻止成绩发布。', level: 'warning', createdAt: '2025-11-13T14:22:00+08:00' },
  { id: 'log-003', examId: 'exam-2025-mid-math', actor: '刘思远', action: '上传完成', target: '高一数学答题卡 B 批次', detail: '90 份答卷拆分完成，发现 1 项待确认异常。', level: 'success', createdAt: '2025-11-13T10:05:00+08:00' },
  { id: 'log-004', examId: 'exam-2025-month-physics', actor: '李婉清', action: '启动阅卷', target: '高二物理 AI 阅卷任务', detail: '使用模型 EduGrade-Science-2.8，评分规则版本 v4。', level: 'info', createdAt: '2025-12-19T09:25:00+08:00' },
  { id: 'log-005', examId: 'exam-2025-month-physics', actor: '系统', action: '识别异常', target: '程望舒 · 第 1 页', detail: '图像清晰度低于阈值，已进入异常中心。', level: 'warning', createdAt: '2025-12-19T10:51:00+08:00' },
  { id: 'log-006', examId: 'exam-2025-english', actor: '王雅婷', action: '发布成绩', target: '高一英语单元综合测评', detail: '94 份成绩已发布，学生报告同步生成。', level: 'success', createdAt: '2025-10-27T15:50:00+08:00' },
  { id: 'log-007', examId: 'exam-2026-chemistry', actor: '陈启航', action: '完成复核', target: '高二化学寒假前诊断考试', detail: '抽检 28 份答卷，AI 评分一致率 96.4%。', level: 'success', createdAt: '2026-01-23T08:45:00+08:00' },
  { id: 'log-008', actor: '教务管理员', action: '更新规则', target: '主观题人工复核规则', detail: '低置信度阈值由 0.70 调整为 0.75。', level: 'info', createdAt: '2025-11-12T17:10:00+08:00' },
]
