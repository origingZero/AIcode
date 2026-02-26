# 世界之窗 — 前端

React + TypeScript + Vite 构建的新闻卡片前端应用。

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器（需要先启动后端 API 在 :8000）
npx vite
```

开发服务器运行在 http://localhost:5173，`/api/*` 请求自动代理到后端。

## 构建

```bash
npx vite build    # 输出到 dist/
```

## 类型检查

```bash
npx tsc --noEmit
```

## 目录结构

```
src/
├── components/           # UI 组件（CSS Modules）
│   ├── Hero/             # 顶部 Hero 区域
│   ├── CardGrid/         # 卡片网格容器
│   ├── NewsCard/         # 新闻卡片
│   ├── FavoritesPanel/   # 收藏侧边栏
│   ├── Toast/            # 消息提示
│   ├── LanguageSwitcher/ # 语言切换
│   └── Icons.tsx         # SVG 图标组件
├── hooks/                # 自定义 Hooks
│   ├── useCards.ts       # 卡片数据管理
│   ├── useFavorites.ts   # 收藏管理
│   └── useToast.ts       # Toast 状态
├── api/cards.ts          # HTTP API 封装
├── i18n/                 # 国际化
│   ├── zh.ts             # 中文
│   └── en.ts             # English
├── types/index.ts        # TypeScript 类型
├── utils/helpers.ts      # 工具函数
├── global.css            # 全局样式 + CSS 变量
├── App.tsx               # 根组件
└── main.tsx              # 入口
```
