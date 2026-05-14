# Kitty Screen

[English README](README.md) · [完整教程](TUTORIAL.zh.md) · [GitHub](https://github.com/elliothux/kitty-screen) · [下载](https://github.com/elliothux/kitty-screen/releases)

Kitty Screen 是一个护眼提醒工具，在你长时间看屏幕之后弹出一只猫咪动画。它有两种形态：用 Tauri + React 构建的**桌面应用**（macOS / Windows），可以将透明猫咪浮层覆盖在所有窗口之上；以及无需安装、在任意浏览器里直接运行的**浏览器版**。

<p align="center">
  <img src="assets/icon.png" alt="Kitty Screen 应用图标" width="180" />
</p>

## 预览

<p>
  <img src="assets/preview-0.png" alt="Kitty Screen 遮挡效果预览 1" width="360" />
  <img src="assets/preview-1.png" alt="Kitty Screen 遮挡效果预览 2" width="360" />
</p>

## 桌面版 vs 浏览器版

| | 桌面应用 | 浏览器版 |
|---|---|---|
| 平台 | macOS、Windows | 任意现代浏览器 |
| 安装 | 下载安装包 | 无需安装 |
| 屏幕遮挡 | OS 级别透明窗口 | 浏览器全屏覆盖 |
| 透明猫咪 | ✅ | ✅（WebM）/ 深色背景兜底 |
| 自动触发 | ✅ OS 级别检测 | ✅ 统计标签页可见时长 |
| 设置保存 | 原生应用偏好 | localStorage |

---

## 下载桌面版

从 [GitHub Releases](https://github.com/elliothux/kitty-screen/releases) 下载最新版本：

- **macOS**：`Kitty.Screen_x.x.x_universal.dmg`
- **Windows**：`Kitty.Screen_x.x.x_x64-setup.exe`

---

## 运行浏览器版

无需安装，克隆仓库后直接启动：

```bash
git clone https://github.com/elliothux/kitty-screen.git
cd kitty-screen
npm install
npm run web:assets   # 把猫咪视频复制到 web 公共目录
npm run web:dev      # 打开 http://localhost:5174/web.html
```

如果想要透明背景效果（猫咪没有绿色背景），先生成 WebM 文件：

```bash
brew install ffmpeg        # macOS，已安装可跳过
npm run videos -- --platform windows
npm run web:assets:webm
```

然后重启 `npm run web:dev`。

---

## 换成你自己的猫

你可以把内置猫咪替换成任意一只猫——真实的或 AI 生成的都行。整体流程：

1. **准备参考照片** — 收集多角度的清晰猫咪照片。
2. **生成 12 张绿幕关键帧** — 用 GPT-4o Image 或 Midjourney，以你的猫咪照片为身份参考，以 `assets/raw-furryball/001–012.png` 为动作参考。
3. **生成两段绿幕视频** — 用 Runway Gen-4、Kling 或 Sora。
4. **转换成透明资源** — `npm run videos` 通过 FFmpeg 去掉绿幕背景。
5. **预览和调参** — 启动应用，按需调整色度键参数。

详细的分步教程请看 [TUTORIAL.zh.md](TUTORIAL.zh.md)，包含完整 prompt 和工具推荐。

图片和视频生成的 **Prompt 模板**在 [PROMPTS.md](PROMPTS.md)。

---

## 开发

### 前置要求

- [Node.js](https://nodejs.org) ≥ 20 或 [Bun](https://bun.sh) ≥ 1.1
- [Rust](https://rustup.rs) + [Tauri CLI](https://tauri.app/start/prerequisites/)（仅桌面版需要）
- [FFmpeg](https://ffmpeg.org)（仅视频转换需要）

### 常用命令

```bash
npm install          # 安装依赖

# 桌面版
npm run dev          # Vite 开发服务器（仅前端）
npm run app:dev      # 完整 Tauri 桌面应用（需要 Rust）

# 浏览器版
npm run web:dev      # Web 开发服务器 → http://localhost:5174/web.html
npm run web:build    # 生产构建 → dist-web/
npm run web:assets       # 把源 MP4 视频复制到 web-public/assets/
npm run web:assets:webm  # 把透明 WebM 复制到 web-public/assets/

# 素材
npm run videos       # 从 assets/ 生成透明视频资源
npm run icons        # 从 assets/icon.png 重新生成应用图标

# 代码质量
npm run check        # 格式化 + 类型检查 + lint
```

---

## 致谢

原作者 [Elliot](https://github.com/elliothux) 和他的女儿"毛球"（一只 4 岁的挪威森林猫）。
