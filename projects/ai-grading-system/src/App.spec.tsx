import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('AI 智能阅卷系统界面', () => {
  it('支持导航到考试管理并打开创建考试向导', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: '考试管理' }))
    expect(screen.getByRole('heading', { name: '考试管理' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '＋ 新建考试' }))
    expect(screen.getByRole('dialog', { name: '新建考试' })).toBeInTheDocument()
    expect(screen.getByDisplayValue('2026 年高一数学月考')).toBeInTheDocument()
  })

  it('人工复核入口展示三栏工作台语义', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /人工复核/ }))
    expect(screen.getByRole('heading', { name: '人工复核' })).toBeInTheDocument()
    expect(await screen.findByText(/OCR 识别答案/, {}, { timeout: 3000 })).toBeInTheDocument()
    expect(await screen.findByLabelText('最终得分', {}, { timeout: 3000 })).toBeInTheDocument()
  })
})
