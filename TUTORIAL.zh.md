# Kitty Screen 完整教程

[English Tutorial](TUTORIAL.md) · [GitHub](https://github.com/elliothux/kitty-screen) · [下载桌面版](https://github.com/elliothux/kitty-screen/releases)

---

## 目录

1. [Kitty Screen 是什么](#1-kitty-screen-是什么)
2. [安装](#2-安装)
   - [桌面应用（macOS / Windows）](#桌面应用macos--windows)
   - [浏览器版（Web）](#浏览器版web)
3. [初次设置](#3-初次设置)
4. [工作原理](#4-工作原理)
   - [桌面版](#桌面版)
   - [浏览器版](#浏览器版)
5. [换成你自己的猫](#5-换成你自己的猫)
   - [第一步 · 准备参考照片](#第一步--准备参考照片)
   - [第二步 · 用 AI 生成绿幕关键帧](#第二步--用-ai-生成绿幕关键帧)
   - [第三步 · 生成绿幕视频](#第三步--生成绿幕视频)
   - [第四步 · 转换成应用资源](#第四步--转换成应用资源)
   - [第五步 · 预览和调参](#第五步--预览和调参)
6. [开发环境搭建](#6-开发环境搭建)
7. [常见问题](#7-常见问题)

---

## 1. Kitty Screen 是什么

Kitty Screen 是一个护眼提醒工具。当你在屏幕前坐了一段时间之后，一只猫咪动画会出现并遮住屏幕，直到倒计时结束才自动退出。目的是强迫你暂时离开屏幕，让眼睛休息一下。

项目有两种形态：

| | 桌面应用 | 浏览器版 |
|---|---|---|
| 平台 | macOS、Windows | 任意现代浏览器 |
| 屏幕遮挡方式 | OS 级别全屏透明窗口 | 浏览器全屏覆盖 |
| 透明背景 | ✅（猫咪浮在桌面上） | ✅（WebM 带 alpha）或深色背景（MP4 兜底） |
| 自动触发 | ✅（OS 级别计时） | ✅（统计标签页可见时长） |
| 设置保存 | 原生应用偏好 | localStorage |

---

## 2. 安装

### 桌面应用（macOS / Windows）

1. 打开 [GitHub Releases](https://github.com/elliothux/kitty-screen/releases)。
2. 下载最新版本对应的文件：
   - **macOS**：`Kitty.Screen_x.x.x_universal.dmg`
   - **Windows**：`Kitty.Screen_x.x.x_x64-setup.exe`
3. 打开安装包，按提示完成安装。
4. macOS 用户：将应用拖入**应用程序**文件夹。首次打开时如果遇到安全提示，右键点击应用 → 打开。
5. 应用运行后会在菜单栏（macOS）或系统托盘（Windows）显示猫咪图标。

### 浏览器版（Web）

浏览器版无需安装，直接在浏览器里打开即可。

#### 方式 A：使用已部署的地址

如果已经有人部署了 Web 版，直接在 Chrome、Firefox、Safari 或 Edge 里打开对应地址就行。

#### 方式 B：从源码本地运行

```bash
# 1. 克隆仓库
git clone https://github.com/elliothux/kitty-screen.git
cd kitty-screen

# 2. 安装依赖
bun install

# 3. 把猫咪视频复制到 Web 公共目录
bun run web:assets

# 4. 启动开发服务器
bun run web:dev
# → 在浏览器里打开 http://localhost:5174
```

如果想要透明背景效果（猫咪没有绿色背景），先生成 WebM 文件：

```bash
# 需要先安装 FFmpeg，见第四步
bun run videos -- --platform windows
bun run web:assets:webm   # 把 WebM 复制到 web-public/assets/
```

然后重启 `bun run web:dev`。

---

## 3. 初次设置

打开应用（桌面版）或网页（浏览器版），会看到一个设置面板，包含三组选项。

### 多久后出现（触发延迟）

选择在屏幕前待多久之后猫咪会出现。选项从 15 分钟到 3 小时不等。新手推荐从 30 分钟开始试试。

### 持续多久（显示时长）

选择猫咪出现后挡住屏幕多长时间。选项从 15 秒到 30 分钟不等。至少选 30 秒，这样才有足够时间让眼睛真正休息一下。

### 语言

选择界面语言。支持：English、简体中文、繁體中文（香港/台灣）、日本語、한국어、Español、Français、Português。

### 预览

点击**预览**可以立即测试屏保效果，不用等完整的触发延迟。预览模式会播放一段 20 秒的效果，方便确认动画和倒计时是否正常。

---

## 4. 工作原理

### 桌面版

Tauri 应用在后台通过 Rust 运行一个计时器，统计屏幕持续开启时长。当计时超过设定的触发延迟后，应用会创建一个全屏透明窗口，覆盖在所有其他窗口上方，播放猫咪动画并显示倒计时。点击红色电源按钮或等倒计时结束会自动关闭。

系统菜单栏/托盘图标支持随时手动触发或关闭屏保。

### 浏览器版

浏览器版用 JavaScript 统计标签页可见时长。当标签页被切到后台或屏保正在显示时，计时暂停。当计时达到设定的触发延迟后，应用在当前页面渲染一个全屏覆盖层，并（如果浏览器允许）请求进入全屏模式。

注意：浏览器版统计的是标签页可见时长，而不是 OS 级别的屏幕使用时长。如果你切换到其他标签页或应用程序，计时会暂停——这是故意设计的，避免不必要的打扰。

---

## 5. 换成你自己的猫

内置的猫咪是毛球，Elliot 的挪威森林猫。你可以按照下面五个步骤把她换成你自己的猫。

### 第一步 · 准备参考照片

收集你的猫的**清晰、高分辨率**照片。AI 模型需要这些照片来在每一帧中保持同一只猫的稳定身份。建议准备以下类型：

| 照片类型 | 作用 |
|---|---|
| 正脸高清近照 | 脸型、眼睛颜色 |
| 左右侧脸 | 耳朵形状、毛发长度 |
| 全身站立或行走 | 身体比例、尾巴 |
| 坐姿 | 爪子摆放 |
| 躺姿或放松姿态 | 身体轮廓 |
| 毛色、花纹、爪子等细节图 | 独特特征 |

**建议：**
- 光线清晰的照片效果最好。自然光或漫反射室内光都可以。
- 如果你的猫有明显花纹（比如虎斑、橘白、玳瑁），至少准备一张能清楚看到这些花纹的照片。
- 避免：有其他动物的照片、复杂背景、重度滤镜、服装道具、只有头部特写（看不到身体）的照片。
- 5–10 张照片是个好起点，种类越多，生成的帧之间一致性越好。

---

### 第二步 · 用 AI 生成绿幕关键帧

动画由 **12 张有序关键帧**构成，描述了猫咪从走入画面到趴下挡屏幕的完整动作。你需要用 AI 图片模型，以你的猫为身份基础，生成这 12 张关键帧。

#### 工具选择

| 工具 | 说明 |
|---|---|
| **GPT-4o Image**（推荐） | 多图参考支持好，身份一致性强 |
| **Ideogram 3** | 写实猫咪效果好，需要精准 prompt |
| **Flux 1.1 Pro** | 写实感强，可通过 API 或 ComfyUI 加入参考图 |
| **Midjourney** | 用 `--cref`（角色参考）标签效果不错 |

#### 准备工作

1. 打开 `assets/raw-furryball/` 文件夹。里面的 12 张图（`001.png`–`012.png`）是**动作参考**，规定了每一帧的角度、构图和身体位置。
2. 准备好你的猫咪参考照片。
3. 选好 AI 工具。

#### 生成关键帧

使用 [PROMPTS.md](PROMPTS.md) 里的批量 prompt 模板，或者用单帧 prompt 模板逐张生成。

**必须做对的几点：**
- 明确告诉模型：你的猫咪照片是**身份参考**，`raw-furryball` 里的编号图是**动作/姿态参考**。
- 要求背景是**纯 `#00ff00` 绿幕**，不能有阴影、地面、渐变。
- 不要在猫咪本身的任何部分出现绿色（比如绿色耳朵、绿色项圈）。
- 猫咪要完整出现，耳朵、爪子、尾巴不能被截断，四周要留出足够的边距。

**保存方式：**

```text
assets/raw-<你的猫咪名字>/001.png
assets/raw-<你的猫咪名字>/002.png
...
assets/raw-<你的猫咪名字>/012.png
```

#### 验收生成结果

生成视频之前，先逐张检查：

- 每一帧是不是同一只猫（脸型、毛色、花纹是否一致）？
- 背景是不是纯 `#00ff00`，没有阴影或地面反光？
- 猫咪的毛发、耳朵、胡须上有没有绿色像素？
- 耳朵、爪子、尾巴是否完整可见，四周有没有足够边距？

如果身份漂移严重，重新生成问题帧，并在 prompt 里加强身份锁定描述。

---

### 第三步 · 生成绿幕视频

你需要从关键帧生成两段视频：

| 文件 | 内容 | 建议时长 |
|---|---|---|
| `assets/kitty.mp4` | 完整入场动画：走进来，趴下挡住屏幕 | ~10 秒 |
| `assets/kitty-loop.mp4` | 待机循环：从趴好的姿势开始，轻微动作 | ~4–6 秒 |

#### 工具选择

| 工具 | 说明 |
|---|---|
| **Runway Gen-4** | 可靠的关键帧驱动，动物短视频效果好 |
| **Kling 2.x** | 动作质量强，支持首尾帧控制 |
| **Sora** | 质量高但可用性有限 |
| **Vidu** | 支持有序关键帧，效果稳定 |
| **即梦 / MiniMax Hailuo** | 生成速度快，动作质量尚可 |

#### 入场视频（`assets/kitty.mp4`）

按顺序上传全部 12 张关键帧，使用 [PROMPTS.md](PROMPTS.md) 里的视频生成 prompt 模板。

**时间线参考：**
- 0–3 秒：猫咪从右侧走入，侧身行走姿态
- 3–5 秒：放慢脚步，稍微转向镜头，低头
- 5–6.5 秒：前腿弯曲，身体缓慢降低，进入趴卧姿态
- 6.5–10 秒：维持趴好的姿势（只允许轻微呼吸动作）

**必须满足的要求：**
- 16:9 输出
- 镜头完全固定，不能有缩放、平移或俯仰
- 全程保持纯 `#00ff00` 绿幕背景
- 全程同一只猫的身份

#### 待机循环视频（`assets/kitty-loop.mp4`）

从趴好的姿势开始，只用最后 2–3 张关键帧作为参考，生成较短的循环片段。

**必须满足的要求：**
- 从入场视频结尾的完全相同姿势开始
- 只包含轻微动作：呼吸、眨眼、尾巴小幅移动
- 循环过渡自然——最后一帧能和第一帧接上，不能有明显跳变

**检验循环是否干净：**
用视频播放器把首尾帧并排看。如果猫咪位置偏移明显，需要重新生成或在视频编辑软件里剪掉末尾几帧。

---

### 第四步 · 转换成应用资源

这一步用 FFmpeg 去掉绿幕背景，生成带透明通道的视频文件供应用加载。

#### 前置条件

如果还没安装 FFmpeg：

```bash
# macOS
brew install ffmpeg

# Windows（通过 Scoop）
scoop install ffmpeg

# Windows（通过 Chocolatey）
choco install ffmpeg
```

还没安装项目依赖的话：

```bash
bun install
```

#### 运行转换

```bash
bun run videos
```

这条命令读取 `assets/kitty.mp4` 和 `assets/kitty-loop.mp4`，用色度键（chroma key）滤镜去掉 `#00ff00` 背景，输出：

```text
resources/videos/macos/kitty-screen.mov     ← macOS（ProRes 4444 带 alpha）
resources/videos/windows/kitty-screen.webm  ← Windows（VP9 WebM 带 alpha）
```

只生成某个平台：

```bash
bun run videos -- --platform macos
bun run videos -- --platform windows
```

#### 复制到 Web 公共目录（仅浏览器版）

如果你要用浏览器版并且希望有透明背景：

```bash
bun run web:assets:webm   # 把 WebM 复制到 web-public/assets/kitty.webm
```

如果只要 MP4 兜底（不透明，猫咪有绿色背景）：

```bash
bun run web:assets        # 把两个 MP4 复制到 web-public/assets/
```

---

### 第五步 · 预览和调参

#### 桌面版预览

```bash
bun run app:dev
```

在设置面板里点击**预览**。重点检查：

| 问题 | 可能原因 |
|---|---|
| 毛发边缘残留绿色 | `generate-videos.mjs` 里 `SIMILARITY` 或 `BLEND` 太低 |
| 猫咪身体出现透明区域 | 猫咪本身有绿色像素，或 `SIMILARITY` 设太高——适当降低 |
| 背景闪烁 | 源视频背景不够纯净 |
| 不同帧之间猫咪形象漂移 | 源素材一致性问题——重新生成关键帧或视频 |
| 循环片段重复时跳变明显 | 循环视频首尾帧差异过大——重新生成或在视频编辑器里剪辑 |

调整色度键参数，打开 [scripts/generate-videos.mjs](scripts/generate-videos.mjs)，修改文件顶部的常量：

```js
const KEY_COLOR = "0x00ff00";  // 要去掉的绿色——一般不用改
const SIMILARITY = 0.30;        // 判断为绿色的相似度阈值（0–1，越大去得越多）
const BLEND = 0.1;              // 边缘羽化（0–1）
```

每次改完之后重新运行 `bun run videos`，然后在应用里再次预览。

如果调 FFmpeg 参数不解决问题，说明源视频本身有问题，需要回第三步重新生成。FFmpeg 参数只能处理抠像，修不了源视频的不一致。

#### 浏览器版预览

```bash
bun run web:dev
# → http://localhost:5174
```

在设置面板里点击**预览**。浏览器版的猫咪显示在深色背景上。如果复制了 WebM 文件，背景应该是透明的（猫咪浮在深色覆盖层上）；如果是 MP4 兜底，猫咪会带着绿色背景——效果次一些，但功能完整。

---

## 6. 开发环境搭建

### 前置要求

- [Bun](https://bun.sh) ≥ 1.1
- [Node.js](https://nodejs.org) ≥ 20（部分脚本需要）
- [Rust](https://rustup.rs) + [Tauri CLI](https://tauri.app/start/prerequisites/)（仅桌面版需要）
- [FFmpeg](https://ffmpeg.org)（视频转换需要）

### 常用命令

```bash
bun install          # 安装依赖

# 桌面版
bun run dev          # Vite 开发服务器（仅前端，不含 Tauri）
bun run app:dev      # 完整 Tauri 桌面应用

# 浏览器版
bun run web:dev      # Web 开发服务器 http://localhost:5174
bun run web:assets   # 把 MP4 复制到 web-public/assets/
bun run web:build    # 生产构建 → dist-web/

# 通用
bun run videos       # 从 assets/ 生成透明视频资源
bun run build        # Tauri 生产构建
bun run check        # 格式化 + 类型检查 + lint
```

---

## 7. 常见问题

### 屏保没有出现

**桌面版**：确认应用正在运行（检查菜单栏/托盘图标是否存在）。检查触发延迟是不是设得太长。用**预览**功能立即测试。

**浏览器版**：确认浏览器标签页保持在前台。Web 版只统计标签页可见时长。用**预览**功能立即测试。

### 猫咪毛发边缘有绿色残留

这是色度键调参问题。在 `scripts/generate-videos.mjs` 里适当提高 `SIMILARITY`，然后重新运行 `bun run videos`。如果提高 `SIMILARITY` 之后猫咪本身也开始透明，说明源视频背景不够纯，需要回第三步重新生成视频。

### 不同帧之间猫咪长相差异很大

这是源素材一致性问题。回到第二步，在生成关键帧时加强身份锁定描述，并确保每次生成都传入你的猫咪参考照片（不只是第一帧）。

### 循环视频重复时跳变明显

`kitty-loop.mp4` 的首帧和尾帧差异过大。解决方案：
1. 重新生成循环视频，在 prompt 里明确要求"结束姿势与开始姿势完全一致"。
2. 在视频编辑软件（如 DaVinci Resolve、剪映）里裁掉末尾几帧，直到循环衔接自然。

### FFmpeg 找不到

```bash
# 验证是否安装
ffmpeg -version

# macOS
brew install ffmpeg

# Windows（Scoop）
scoop install ffmpeg
```

### Bun 找不到

从 [bun.sh](https://bun.sh) 安装：

```bash
curl -fsSL https://bun.sh/install | bash
```

### 浏览器版猫咪有绿色背景

说明浏览器加载的是 MP4 兜底版本（不带透明通道）。要修复：
1. 运行 `bun run videos -- --platform windows` 生成 WebM 文件。
2. 运行 `bun run web:assets:webm` 把 WebM 复制到 `web-public/assets/kitty.webm`。
3. 重启 `bun run web:dev`。

浏览器会自动优先加载带透明通道的 WebM，MP4 只作为兜底。
