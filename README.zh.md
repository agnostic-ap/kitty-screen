# Kitty Screen

[English README](README.md) · [GitHub](https://github.com/elliothux/kitty-screen) · [下载](https://github.com/elliothux/kitty-screen/releases)

Kitty Screen 是一个 Tauri + React 屏幕保护程序，会用猫咪动画作为屏幕遮挡层。它会在屏幕连续开启达到你设置的时间后自动启用，用来打断长时间不间断看屏幕的状态。

动画素材先通过绿幕猫咪视频生成，再用 FFmpeg 转成带透明通道的 WebM，供应用使用。

<p align="center">
  <img src="assets/icon.png" alt="Kitty Screen 应用图标" width="200" />
</p>

## 预览

<p>
  <img src="assets/preview-0.png" alt="Kitty Screen 遮挡效果预览 1" width="380" />
  <img src="assets/preview-1.png" alt="Kitty Screen 遮挡效果预览 2" width="380" />
</p>

## 下载

从 [GitHub Releases](https://github.com/elliothux/kitty-screen/releases) 下载最新应用构建。

## Prompt 模板

图片和视频生成用的可复用 prompt 放在 [PROMPTS.md](PROMPTS.md)。

后续生成新的猫咪形象，或者重新生成屏保动画序列时，优先参考这个文件。

## 素材生成流程

### 1. 找猫咪素材图

先准备目标猫咪的高清照片。

建议至少覆盖这些角度和状态：

- 正脸高清近照。
- 左右侧脸。
- 全身站立或行走姿态。
- 坐姿。
- 躺姿或放松姿态。
- 能看清毛色、花纹、爪子、尾巴、眼睛和毛发长度的照片。

这些照片只用于锁定猫咪身份。生成时最重要的是让每一帧都保持同一只猫。

### 2. 用 GPT Image 生成绿幕关键帧

使用 GPT Image 生成一组有顺序的猫咪关键帧。

参考序列：

- 使用 `assets/raw-furryball/001.png` 到 `assets/raw-furryball/012.png` 作为动作和姿态参考。
- 使用新猫咪照片作为形象参考。
- 动作参考只控制姿态、镜头角度、身体位置和动画节奏。
- 新猫咪照片控制脸型、毛色、花纹、体型、毛长、爪子、尾巴和整体形象。

输出约定：

```text
assets/raw-<cat-name>/001.png
assets/raw-<cat-name>/002.png
...
assets/raw-<cat-name>/012.png
```

每张图都应该使用纯 `#00ff00` 绿幕背景，不要阴影、地面、渐变、道具、文字、UI 或其他动物。

完整可复用 prompt 见 [PROMPTS.md](PROMPTS.md)。

### 3. 用视频生成 AI 生成视频

使用任何支持首尾帧或有序关键帧控制的视频生成 AI，例如 Kling AI。把按顺序生成的绿幕关键帧上传进去，生成连续猫咪视频。

建议输出：

- 16:9 视频。
- 镜头固定。
- 全程保持同一只猫的形象。
- 全程保持均匀绿幕背景。
- 动作节奏为缓慢入画、停下、趴低、最后稳定挡住屏幕。
- 不要镜头缩放、平移、俯仰、跟随、房间背景、文字、UI、阴影、道具或第二只猫。

生成后保存为：

```text
assets/kitty.mp4
assets/kitty-loop.mp4
```

`kitty.mp4` 是完整入场动画。`kitty-loop.mp4` 是较短的循环/待机片段，用于主动画结束后的持续展示。

### 4. 用 FFmpeg 去掉绿幕背景

使用项目里已有的转换脚本：

```bash
bun run videos
```

这个命令会运行 [scripts/green-screen-to-webm.mjs](scripts/green-screen-to-webm.mjs)，它会：

- 读取 `assets/kitty.mp4` 和 `assets/kitty-loop.mp4`。
- 使用 FFmpeg `chromakey` 去掉绿色背景。
- 做绿色溢色处理。
- 输出带透明通道的 WebM 到 `src/assets/kitty.webm` 和 `src/assets/kitty-loop.webm`。
- 使用 `ffprobe` 检查输出是否带 alpha 通道。

如果视频生成工具导出的绿幕颜色和脚本当前 key color 不接近，需要调整 `scripts/green-screen-to-webm.mjs` 里的 `keyColor`、`similarity` 和 `blend` 常量。

## 开发

安装依赖：

```bash
bun install
```

运行 Web 应用：

```bash
bun run dev
```

运行 Tauri 应用：

```bash
bun run app:dev
```

构建：

```bash
bun run build
```
