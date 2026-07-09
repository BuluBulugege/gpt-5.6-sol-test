import { describe, expect, it } from 'vitest'
import { validateUploadFiles } from './upload'

describe('validateUploadFiles', () => {
  it('接受受支持且不重复的答卷文件', () => {
    expect(validateUploadFiles([{ name: '一班.pdf', size: 1024, type: 'application/pdf' }]).totalBytes).toBe(1024)
  })
  it('拒绝伪造格式、空文件、超大与重复文件', () => {
    expect(() => validateUploadFiles([{ name: '恶意.exe', size: 1, type: 'application/pdf' }])).toThrow('不支持')
    expect(() => validateUploadFiles([{ name: '空.pdf', size: 0, type: 'application/pdf' }])).toThrow('为空')
    expect(() => validateUploadFiles([{ name: '大.pdf', size: 51 * 1024 * 1024, type: 'application/pdf' }])).toThrow('50 MB')
    expect(() => validateUploadFiles([{ name: 'a.pdf', size: 10, type: 'application/pdf' }, { name: 'a.pdf', size: 10, type: 'application/pdf' }])).toThrow('重复')
  })
})
