# 知阅 AI 智能阅卷系统

面向教师、阅卷组长和教务人员的完整前端业务系统，覆盖考试创建、答卷上传、AI 识别批阅、人工复核、异常闭环、成绩分析和安全导出。

## 技术栈

- React 19 + TypeScript
- Vite
- Recharts
- Lucide Icons
- Vitest + Testing Library

## 本地运行

```bash
bun install
bun run dev
```

打开终端显示的本地地址。

## 测试与构建

```bash
bun run test
bun run build
```

构建产物会输出到仓库根目录的 `ai-grading-system/`，用于 GitHub Pages 发布。

## 架构

- `src/domain/`：领域模型、统计和状态规则
- `src/api/`：Repository 接口、Mock Adapter、导出服务
- `src/data/`：Mock 数据
- `src/components/`：共享组件与图标
- `src/styles/`：设计系统与业务页面样式

页面只依赖 Repository，不直接读取 Mock 数据。后续接入真实后端时，可新增 HTTP Repository 并替换默认实现。
