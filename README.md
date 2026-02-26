# 世界之窗 World Window

> AI 驱动的新闻卡片聚合应用 — 抓取全球热点，融合为带配图的可视化卡片，支持收藏管理与中英双语切换。

## 功能

- **热点聚合** — 从 Google News RSS 实时抓取资讯，离线时自动回落至内置示例数据
- **新闻配图** — 每条新闻基于内容 hash 自动生成稳定配图（via picsum.photos）
- **AI 图像提示** — 为每条新闻独立生成提示词 + 色板，便于对接任意绘图 API
- **收藏管理** — 一键收藏 / 取消收藏 / 收藏夹移除，数据持久化到本地 JSON 文件
- **收藏夹跳转** — 收藏夹中的新闻标题可直接点击跳转原文
- **多语言** — 中文 / English 一键切换，全部 UI 文案本地化
- **瀑布流布局** — 响应式多列卡片展示，图片卡片杂志风格
- **稳定 ID** — 同一新闻跨请求保持相同 ID，收藏状态刷新后不丢失

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | React 19 · TypeScript · Vite · CSS Modules |
| 后端 | Python 3.11+ 标准库（零外部依赖） |
| 国际化 | React Context + 本地化文件（zh / en） |
| 测试 | Python unittest（42 个用例） |

## 快速开始

```bash
# 1. 启动后端 API（端口 8000）
PYTHONPATH=src python3 -m world_window.server --port 8000

# 2. 启动前端开发服务器（端口 5173，自动代理 /api → 后端）
cd frontend && npm install && npx vite
```

打开 http://localhost:5173 即可体验。

## 运行测试

```bash
# 后端单元测试（42 个用例）
PYTHONPATH=src python3 -m unittest discover -s tests -v

# 前端类型检查
cd frontend && npx tsc --noEmit
```

## 命令行工具

```bash
# 获取今日热点（终端输出）
PYTHONPATH=src python3 -m world_window.cli daily --limit 5

# 加载更多
PYTHONPATH=src python3 -m world_window.cli more --offset 5 --batch 5

# 收藏指定卡片
PYTHONPATH=src python3 -m world_window.cli daily --favorite 1 3

# 查看收藏
PYTHONPATH=src python3 -m world_window.cli favorites
```

## 项目结构

```
├── src/world_window/       # Python 后端
│   ├── server.py           # HTTP 服务器 + REST API
│   ├── cli.py              # 命令行入口
│   ├── card_service.py     # 卡片组装（稳定 ID + 独立 prompt）
│   ├── news_fetcher.py     # RSS 抓取 + 离线回落
│   ├── image_generator.py  # AI 图像提示 + 配图 URL 生成
│   └── storage.py          # JSON 收藏存储（兼容旧数据）
├── tests/                  # 后端单元测试
│   ├── test_news_fetcher.py
│   ├── test_image_generator.py
│   ├── test_card_service.py
│   ├── test_storage.py
│   └── test_server.py
├── frontend/               # React + TypeScript 前端
│   ├── src/
│   │   ├── components/     # 模块化 React 组件
│   │   │   ├── Hero/       # 顶部 Hero 区域
│   │   │   ├── CardGrid/   # 瀑布流卡片网格
│   │   │   ├── NewsCard/   # 带配图的新闻卡片
│   │   │   ├── FavoritesPanel/ # 收藏侧边栏（可跳转原文）
│   │   │   ├── Toast/      # 消息提示
│   │   │   └── LanguageSwitcher/ # 语言切换
│   │   ├── hooks/          # 自定义 Hooks（useCards / useFavorites / useToast）
│   │   ├── api/            # API 请求封装（含 DELETE 取消收藏）
│   │   ├── i18n/           # 国际化（中/英）
│   │   ├── types/          # TypeScript 类型定义
│   │   └── utils/          # 工具函数
│   └── vite.config.ts      # Vite 配置 + /api 代理
└── AGENTS.md               # AI 开发助手说明
```

## API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/daily?limit=5` | 获取今日热点卡片 |
| GET | `/api/more?offset=5&batch=3` | 加载更多卡片 |
| GET | `/api/favorites` | 获取收藏列表 |
| POST | `/api/favorites` | 添加收藏 `{ "card": { ... } }` |
| DELETE | `/api/favorites` | 删除收藏 `{ "id": "card_id" }` |
