# Kitty Screen

[English README](README.md) · [完整教程](TUTORIAL.zh.md) · [GitHub](https://github.com/elliothux/kitty-screen) · [下载](https://github.com/elliothux/kitty-screen/releases)

Kitty Screen 是用 Tauri + React 构建的桌面护眼提醒工具。在你连续盯着屏幕超过设定时间后，一只透明猫咪动画会浮现在所有窗口上方，直到倒计时结束才自动退出——提醒你暂时把视线移开、让眼睛休息一下。

> 想要**浏览器插件**版本？→ [kitty-screen-extension](https://github.com/agnostic-ap/kitty-screen-extension)

<p align="center">
  <img src="assets/icon.png" alt="Kitty Screen 应用图标" width="180" />
</p>

## 预览

<p>
  <img src="assets/preview-0.png" alt="Kitty Screen 遮挡效果预览 1" width="360" />
  <img src="assets/preview-1.png" alt="Kitty Screen 遮挡效果预览 2" width="360" />
</p>

---

## 下载

从 [GitHub Releases](https://github.com/elliothux/kitty-screen/releases) 下载最新版本：

- **macOS**：`Kitty.Screen_x.x.x_universal.dmg`
- **Windows**：`Kitty.Screen_x.x.x_x64-setup.exe`

---

## 换成你自己的猫

你可以把内置猫咪替换成任意一只猫——真实的或 AI 生成的都行。整体流程：

1. **准备参考照片** — 收集多角度的清晰猫咪照片。
2. **生成 12 张绿幕关键帧** — 用 GPT-4o Image 或 Midjourney，以你的猫咪照片为身份参考，以 `assets/raw-furryball/001–012.png` 为动作参考。
3. **生成两段绿幕视频** — 用 Runway Gen-4、Kling 或 Sora。
4. **转换成透明资源** — `bun run videos` 通过 FFmpeg 去掉绿幕背景。
5. **预览和调参** — 启动应用，按需调整色度键参数。

详细的分步教程请看 [TUTORIAL.zh.md](TUTORIAL.zh.md)，包含完整 prompt 和工具推荐。

图片和视频生成的 **Prompt 模板**在 [PROMPTS.md](PROMPTS.md)。

---

## 开发

### 前置要求

- [Bun](https://bun.sh) ≥ 1.1
- [Rust](https://rustup.rs) + [Tauri CLI](https://tauri.app/start/prerequisites/)
- [FFmpeg](https://ffmpeg.org)（视频转换需要）

### 常用命令

```bash
bun install          # 安装依赖
bun run dev          # Vite 开发服务器（仅前端）
bun run app:dev      # 完整 Tauri 桌面应用
bun run videos       # 从 assets/ 生成透明视频资源
bun run build        # 生产构建
bun run check        # 格式化 + 类型检查 + lint
```

---

## 致谢

原作者 [Elliot](https://github.com/elliothux) 和他的女儿"毛球"（一只 4 岁的挪威森林猫）。
