export interface UploadFileLike { name: string; size: number; type: string }
export interface ValidatedUpload { files: UploadFileLike[]; totalBytes: number }

const allowedExtensions = new Set(['pdf', 'jpg', 'jpeg', 'png', 'zip'])
const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'application/zip', 'application/x-zip-compressed'])
const maxFileSize = 50 * 1024 * 1024
const maxFiles = 500

export function validateUploadFiles(input: readonly UploadFileLike[]): ValidatedUpload {
  if (input.length === 0) throw new Error('请选择答卷文件')
  if (input.length > maxFiles) throw new Error(`单次最多上传 ${maxFiles} 个文件`)
  const files = input.map((file) => {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(file.type)) throw new Error(`不支持的文件格式：${file.name}`)
    if (file.size <= 0) throw new Error(`文件内容为空：${file.name}`)
    if (file.size > maxFileSize) throw new Error(`文件超过 50 MB：${file.name}`)
    return { name: file.name.slice(0, 180), size: file.size, type: file.type }
  })
  const unique = new Set(files.map((file) => `${file.name.toLowerCase()}:${file.size}`))
  if (unique.size !== files.length) throw new Error('检测到重复文件，请移除后重试')
  return { files, totalBytes: files.reduce((sum, file) => sum + file.size, 0) }
}
