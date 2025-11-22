# AIcode 世界之窗小程序

一个示范性的“世界之窗”小程序后端原型，展示如何从网络抓取每日热点，组合成带 AI 图像提示的新闻卡片，并支持收藏。代码以 Python 编写，便于本地演示或扩展到真实小程序/服务器。

## 功能概览
- **热点获取**：默认从 Google News RSS 抓取最新资讯，无法联网时自动回落到内置示例数据。
- **AI 图像提示**：将多条新闻摘要融合成一段提示词，并生成稳定色板与种子，方便接入任意绘图 API。
- **动态卡片**：一次可拉取 5 条作为“今日卡片”，滑到第六张后可继续请求更多批次。
- **收藏夹**：将喜欢的卡片落地到 JSON 文件，便于在移动端或桌面端持久化。

## 本地运行
0️⃣ 快速体验（单条命令）

```bash
PYTHONPATH=src python -m world_window.cli daily --limit 3
```

命令会抓取新闻（离线自动用示例数据）、组装卡片并在终端输出包含 AI 图像提示的结果。

1️⃣ 详细步骤

1. 准备环境：使用 Python 3.11+，无需额外依赖或安装包。
2. 运行时设置 `PYTHONPATH=src` 让解释器找到模块。
3. 根据需求选择命令：

```bash
# 获取今日热点（默认 5 张卡片）
PYTHONPATH=src python -m world_window.cli daily --limit 5

# 模拟“滑到第六张后继续加载更多”
PYTHONPATH=src python -m world_window.cli more --offset 5 --batch 5

# 获取时顺便收藏指定序号的卡片
PYTHONPATH=src python -m world_window.cli daily --favorite 1 3

# 查看收藏夹内容
PYTHONPATH=src python -m world_window.cli favorites
```

默认收藏文件为 `world_window_favorites.json`，可通过 `--store` 参数自定义位置（便于在移动端或桌面端持久化收藏）。

2️⃣ 打开可视化界面

如果想看到“滑卡片 + 收藏”的完整视觉体验，可启动内置的轻量 Web 端：

```bash
PYTHONPATH=src python -m world_window.server --port 8000
```

然后在浏览器访问 `http://localhost:8000`，你会看到：

- 顶部区域：刷新今日卡片、加载更多、查看收藏按钮；
- 卡片流：每张卡片展示标题、摘要、AI 提示词、随机色板与原文链接；
- 右侧收藏栏：点击卡片上的“收藏”即可即时更新收藏夹（使用同一个 JSON 存储）。

同样可用 `--store` 参数重定向收藏文件，或通过 `--host/--port` 配置对外访问。

## 代码结构
- `src/world_window/news_fetcher.py`：RSS 抓取与离线示例数据。
- `src/world_window/image_generator.py`：根据新闻摘要生成图像提示、色板与随机种子。
- `src/world_window/card_service.py`：把新闻与图像提示整合为卡片数据。
- `src/world_window/storage.py`：JSON 文件存储与读写收藏夹。
- `src/world_window/cli.py`：命令行演示入口，模拟小程序的获取、加载更多与收藏流程。

要对接真实小程序，可在现有接口上替换新闻源与绘图 API 调用，保持卡片数据结构不变即可。
