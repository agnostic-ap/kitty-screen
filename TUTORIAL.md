# Kitty Screen – Complete Tutorial

[中文教程](TUTORIAL.zh.md) · [GitHub](https://github.com/elliothux/kitty-screen) · [Download Desktop App](https://github.com/elliothux/kitty-screen/releases)

---

## Table of Contents

1. [What Is Kitty Screen?](#1-what-is-kitty-screen)
2. [Installation](#2-installation)
   - [Desktop App (macOS / Windows)](#desktop-app-macos--windows)
   - [Browser Version (Web)](#browser-version-web)
3. [First-Time Setup](#3-first-time-setup)
4. [How It Works](#4-how-it-works)
   - [Desktop version](#desktop-version)
   - [Web version](#web-version)
5. [Customizing Your Own Cat](#5-customizing-your-own-cat)
   - [Step 1 – Prepare Reference Photos](#step-1--prepare-reference-photos)
   - [Step 2 – Generate Green-Screen Keyframes](#step-2--generate-green-screen-keyframes)
   - [Step 3 – Generate the Videos](#step-3--generate-the-videos)
   - [Step 4 – Convert to App Resources](#step-4--convert-to-app-resources)
   - [Step 5 – Preview and Tune](#step-5--preview-and-tune)
6. [Development Setup](#6-development-setup)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. What Is Kitty Screen?

Kitty Screen is a screen-break reminder. After you have looked at the screen for a configured amount of time, a cat animation appears and covers the screen until a countdown timer finishes. It is designed to interrupt long uninterrupted screen sessions and remind you to look away and rest your eyes.

The app comes in two forms:

| | Desktop App | Web Version |
|---|---|---|
| Platform | macOS, Windows | Any modern browser |
| Screen blocking | Full OS-level overlay | Full-viewport browser overlay |
| Transparent background | ✅ (cat floats above desktop) | ✅ (WebM with alpha) or dark bg (MP4 fallback) |
| Auto-activates | ✅ (OS idle detection) | ✅ (counts visible-tab time) |
| Settings persistence | Native app preferences | localStorage |

---

## 2. Installation

### Desktop App (macOS / Windows)

1. Go to [GitHub Releases](https://github.com/elliothux/kitty-screen/releases).
2. Download the latest file for your platform:
   - **macOS**: `Kitty.Screen_x.x.x_universal.dmg`
   - **Windows**: `Kitty.Screen_x.x.x_x64-setup.exe`
3. Open the file and follow the installer.
4. On macOS, drag the app into **Applications**. On first launch, right-click → Open if macOS shows a security warning.
5. The app lives in the system menu bar / tray. Look for the cat icon after launch.

### Browser Version (Web)

The web version runs directly in your browser — no installation required.

#### Option A: Use a hosted deployment

If you or someone else has deployed the web build, simply open the URL in any modern browser (Chrome, Firefox, Safari, Edge).

#### Option B: Run it locally from source

```bash
# 1. Clone the repo
git clone https://github.com/elliothux/kitty-screen.git
cd kitty-screen

# 2. Install dependencies
bun install

# 3. Copy your cat videos into the web public folder
bun run web:assets

# 4. Start the development server
bun run web:dev
# → Open http://localhost:5174 in your browser
```

For the best experience (cat with transparent background), first generate the transparent WebM:

```bash
# Requires FFmpeg installed — see Step 4 of the customization section
bun run videos -- --platform windows
bun run web:assets:webm   # copies the WebM to web-public/assets/
```

Then restart `bun run web:dev`.

---

## 3. First-Time Setup

Open the app (desktop) or the website (web). You will see a settings panel with three option groups.

### Show after (delay)

Choose how long you want to look at the screen before the cat appears. Options range from 15 minutes to 3 hours. A common starting point is 30 minutes.

### Duration

Choose how long the cat stays on screen before it dismisses itself. Options range from 15 seconds to 30 minutes. 30 seconds is a good minimum — long enough to actually look away.

### Language

Select your preferred language. Supported: English, 简体中文, 繁體中文 (HK/TW), 日本語, 한국어, Español, Français, Português.

### Preview

Click **Preview** to test the screensaver immediately. It plays a short 20-second session so you can check the animation and countdown without waiting for the full delay.

---

## 4. How It Works

### Desktop version

The Tauri app runs a background timer via the Rust backend. Once the configured delay is reached, the app creates a full-screen transparent window that sits above all other windows, plays the cat animation, and shows a countdown clock. Pressing the red Power button or waiting for the countdown dismisses the overlay.

A menu bar icon lets you manually trigger or dismiss the screensaver at any time.

### Web version

The web version uses JavaScript to count seconds while your browser tab is visible. When the tab is hidden or the screensaver is active, the timer pauses. Once the delay is reached, the app renders a full-viewport overlay and (if the browser allows it) requests fullscreen mode.

Because the web version counts tab-visible time rather than OS-level idle time, it will not trigger if you switch to another tab or application — this is intentional and prevents unnecessary interruptions.

---

## 5. Customizing Your Own Cat

The built-in cat is Furryball, Elliot's Norwegian Forest cat. You can replace her with your own cat by following these five steps.

### Step 1 – Prepare Reference Photos

Collect **clear, high-resolution** photos of your cat. The image model will use these to maintain a consistent identity across every generated frame. Aim for:

| Photo type | Why it helps |
|---|---|
| Front-facing face close-up | Face shape, eye color |
| Left and right side profiles | Ear shape, fur length |
| Full-body standing or walking | Body proportions, tail |
| Sitting pose | Paw placement |
| Lying / relaxed pose | Body silhouette |
| Detail shots of markings, paws, tail | Distinctive features |

**Tips:**
- Use the best-lit photos you have. Natural light or diffuse indoor light works well.
- Include at least one photo where the cat's distinctive markings (patches, tabby stripes, etc.) are clearly visible.
- Avoid: photos with other animals, busy backgrounds, heavy filters, costumes, extreme close-ups that cut off the body.
- 5–10 photos is a good starting point. More variety means better consistency across frames.

---

### Step 2 – Generate Green-Screen Keyframes

The animation is built from **12 ordered keyframes** that trace the cat's movement from entering the screen to lying down. You will use an AI image model to generate these frames with your cat substituted in.

#### Choosing a tool

| Tool | Notes |
|---|---|
| **GPT-4o Image** (recommended) | Excellent multi-image reference support, good identity consistency |
| **Ideogram 3** | Good for photorealistic cats with precise prompting |
| **Flux 1.1 Pro** | Strong realism, use with reference images via API or ComfyUI |
| **Midjourney** | Good results with `--cref` (character reference) flag |

#### Setup

1. Open `assets/raw-furryball/` in your file explorer. These 12 images (`001.png`–`012.png`) are the **pose references** — they show exactly the angle, framing, and body position each frame should have.
2. Collect your cat reference photos.
3. Choose your AI tool.

#### Generating the frames

Use the batch prompt from [PROMPTS.md](PROMPTS.md), or generate frames one at a time with the single-frame prompt template.

**Key things to get right:**
- Tell the model to use your cat photos as the identity reference and the numbered `raw-furryball` images as pose/motion references.
- Specify a **perfectly flat `#00ff00` green background** — no shadows, no floor plane, no gradients.
- Do not let the model use any green color on the cat itself (green ears, green collar, etc.).
- The cat should be fully visible — ears, paws, and tail should not be cropped.

**Saving the output:**

```text
assets/raw-<your-cat-name>/001.png
assets/raw-<your-cat-name>/002.png
...
assets/raw-<your-cat-name>/012.png
```

#### Verifying the output

Before generating videos, check each frame:

- Is the cat recognizably the same individual in every frame?
- Is the background a solid `#00ff00` with no shadows or floor reflections?
- Are there any green pixels on the cat's fur, ears, or whiskers?
- Are the ears, paws, and tail fully visible with some padding from the edge?

If identity drifts a lot between frames, regenerate the problematic ones and add more specific identity constraints to the prompt.

---

### Step 3 – Generate the Videos

You need two video clips from your keyframes:

| File | Content | Length |
|---|---|---|
| `assets/kitty.mp4` | Full entrance: walks in, settles into screen-blocking pose | ~10 s |
| `assets/kitty-loop.mp4` | Idle loop: subtle motion from the final settled pose | ~4–6 s |

#### Choosing a video generation tool

| Tool | Notes |
|---|---|
| **Runway Gen-4** | Reliable keyframe-to-video, good for short animal clips |
| **Kling 2.x** | Strong motion quality, supports start/end frame control |
| **Sora** | High quality but limited availability |
| **Vidu** | Good option, supports sequential keyframes |
| **Hailuo / MiniMax** | Fast generation, decent motion quality |

#### Entrance video (`assets/kitty.mp4`)

Upload all 12 keyframes in order. Use the video prompt template from [PROMPTS.md](PROMPTS.md).

**Timeline to aim for:**
- 0–3 s: cat enters from the right in a walking pose
- 3–5 s: slows down, turns slightly toward camera, lowers head
- 5–6.5 s: bends front legs, lowers body into a lying pose
- 6.5–10 s: stays still in the settled pose (subtle breathing only)

**Requirements:**
- 16:9 output
- Fixed camera — no zoom, pan, or tilt
- Solid `#00ff00` background throughout
- Same cat identity in every frame

#### Loop video (`assets/kitty-loop.mp4`)

Generate a shorter clip starting from the settled pose. Use only the last 2–3 keyframes as reference.

**Requirements:**
- Starts from the exact same settled pose as the end of the entrance video
- Contains only subtle motion: breathing, blinking, small tail movement
- Loops cleanly — the last frame should connect back to the first without a jump

**Testing for a clean loop:**
Play the clip and watch the first and last frames side by side. If the cat's position shifts significantly, regenerate or trim in a video editor before proceeding.

---

### Step 4 – Convert to App Resources

This step uses FFmpeg to remove the green background and create transparent video files the app can load.

#### Prerequisites

Install FFmpeg if you have not already:

```bash
# macOS
brew install ffmpeg

# Windows (via Scoop)
scoop install ffmpeg

# Windows (via Chocolatey)
choco install ffmpeg
```

Install project dependencies if you have not already:

```bash
bun install
```

#### Run the conversion

```bash
bun run videos
```

This reads `assets/kitty.mp4` and `assets/kitty-loop.mp4`, removes the `#00ff00` background with a chroma key filter, and writes:

```text
resources/videos/macos/kitty-screen.mov     ← macOS (ProRes 4444 with alpha)
resources/videos/windows/kitty-screen.webm  ← Windows (VP9 WebM with alpha)
```

To regenerate for one platform only:

```bash
bun run videos -- --platform macos
bun run videos -- --platform windows
```

#### Copy to web public folder (web version only)

If you are using the web version and want the transparent background:

```bash
bun run web:assets:webm   # copies the WebM to web-public/assets/kitty.webm
```

If you only want the MP4 fallback (no transparency):

```bash
bun run web:assets        # copies both MP4 files to web-public/assets/
```

---

### Step 5 – Preview and Tune

#### Desktop app

```bash
bun run app:dev
```

Click **Preview** in the settings panel. Check for:

| Issue | Likely cause |
|---|---|
| Green fringe around fur edges | `similarity` or `blend` too low in `generate-videos.mjs` |
| Cat body partially transparent | Green pixels on the cat; fix the source video or increase `similarity` carefully |
| Flickering background | Background not perfectly flat in the source video |
| Cat identity drifts between frames | Source footage inconsistency — regenerate keyframes or video |
| Loop jumps sharply | Source loop doesn't start/end in the same pose — trim or regenerate |

To tune the chroma key, open [scripts/generate-videos.mjs](scripts/generate-videos.mjs) and adjust these constants at the top of the file:

```js
const KEY_COLOR = "0x00ff00";  // the green to remove — leave this alone
const SIMILARITY = 0.30;        // how similar a pixel must be to be keyed (0–1, higher = more aggressive)
const BLEND = 0.1;              // feathering at the edge (0–1)
```

After each change, run `bun run videos` again and re-check in the app.

#### Web version

```bash
bun run web:dev
# → http://localhost:5174
```

Click **Preview** in the settings panel. The web version shows the cat on a dark background. If you copied the WebM file, the background should be transparent against the dark overlay.

---

## 6. Development Setup

### Requirements

- [Bun](https://bun.sh) ≥ 1.1
- [Node.js](https://nodejs.org) ≥ 20 (for some scripts)
- [Rust](https://rustup.rs) + [Tauri CLI](https://tauri.app/start/prerequisites/) (for desktop app only)
- [FFmpeg](https://ffmpeg.org) (for video conversion)

### Commands

```bash
bun install          # install dependencies

# Desktop app
bun run dev          # Vite dev server (web frontend only, no Tauri)
bun run app:dev      # full Tauri desktop app

# Web version
bun run web:dev      # web dev server on http://localhost:5174
bun run web:assets   # copy MP4 videos into web-public/assets/
bun run web:build    # production web build → dist-web/

# Shared
bun run videos       # generate transparent video resources from assets/
bun run build        # production Vite build (Tauri)
bun run check        # format + typecheck + lint
```

---

## 7. Troubleshooting

### The screensaver does not appear

**Desktop:** Make sure the app is running (look for the icon in the menu bar / tray). Check that the delay is not set too long. Use **Preview** to test immediately.

**Web:** Make sure the tab stays in the foreground. The web timer only counts while the tab is visible. Use **Preview** to test immediately.

### Green edges around the cat

This is a chroma key tuning problem. Increase `SIMILARITY` slightly in `scripts/generate-videos.mjs`, then re-run `bun run videos`. If increasing `SIMILARITY` removes too much of the cat, the source footage has inconsistent background — consider regenerating the video with tighter prompt constraints.

### The cat looks different in each frame

This is a source video consistency problem. Go back to Step 2 and regenerate the keyframes with stricter identity locking instructions. Make sure to pass your cat reference photos with every prompt, not just the first one.

### The loop video jumps at the seam

The first and last frames of `kitty-loop.mp4` are too different. Options:
1. Re-generate the loop video with more explicit instructions to end in the same pose it starts.
2. Trim a few frames from the end in a video editor (e.g. DaVinci Resolve, ffmpeg trim).

### FFmpeg not found

```bash
# Verify FFmpeg is installed
ffmpeg -version

# macOS
brew install ffmpeg

# Windows (Scoop)
scoop install ffmpeg
```

### Bun not found

Install Bun from [bun.sh](https://bun.sh):

```bash
curl -fsSL https://bun.sh/install | bash
```

### The web version shows a green background on the cat

This means the browser loaded the MP4 fallback (no alpha channel). To get a transparent background:
1. Run `bun run videos -- --platform windows` to generate the WebM.
2. Run `bun run web:assets:webm` to copy it to `web-public/assets/kitty.webm`.
3. Restart `bun run web:dev`.

The browser will automatically prefer the WebM with transparency over the MP4.
