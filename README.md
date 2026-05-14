# Kitty Screen

[中文说明](README.zh.md) · [Detailed Tutorial](TUTORIAL.md) · [GitHub](https://github.com/elliothux/kitty-screen) · [Download](https://github.com/elliothux/kitty-screen/releases)

Kitty Screen is a screen-break reminder app that displays a cat animation after extended screen time. It comes in two forms: a **desktop app** (macOS / Windows) built with Tauri + React that overlays a transparent animated cat on top of all windows, and a **browser version** that works in any modern browser without installation.

<p align="center">
  <img src="assets/icon.png" alt="Kitty Screen app icon" width="180" />
</p>

## Preview

<p>
  <img src="assets/preview-0.png" alt="Kitty Screen overlay preview 1" width="360" />
  <img src="assets/preview-1.png" alt="Kitty Screen overlay preview 2" width="360" />
</p>

## Desktop vs Web

| | Desktop App | Web Version |
|---|---|---|
| Platform | macOS, Windows | Any modern browser |
| Installation | Download & install | No install needed |
| Screen overlay | OS-level transparent window | Full-viewport browser overlay |
| Transparent cat | ✅ | ✅ (WebM) / dark bg fallback |
| Auto-activates | ✅ OS idle detection | ✅ Counts visible-tab time |
| Settings | Native app preferences | localStorage |

---

## Download Desktop App

Download the latest build from [GitHub Releases](https://github.com/elliothux/kitty-screen/releases).

- **macOS**: `Kitty.Screen_x.x.x_universal.dmg`
- **Windows**: `Kitty.Screen_x.x.x_x64-setup.exe`

---

## Run the Web Version

No installation required. Clone the repo and start the dev server:

```bash
git clone https://github.com/elliothux/kitty-screen.git
cd kitty-screen
npm install
npm run web:assets   # copy cat videos into the web public folder
npm run web:dev      # open http://localhost:5174/web.html
```

For a transparent cat background (WebM with alpha), first generate the transparent video:

```bash
brew install ffmpeg        # macOS — skip if already installed
npm run videos -- --platform windows
npm run web:assets:webm
```

Then restart `npm run web:dev`.

---

## Customizing Your Own Cat

You can replace the built-in cat with any cat — real or AI-generated. The workflow:

1. **Prepare reference photos** — collect clear photos of your cat from multiple angles.
2. **Generate 12 green-screen keyframes** — use GPT-4o Image or Midjourney with your cat photos as identity references and `assets/raw-furryball/001–012.png` as pose guides.
3. **Generate two green-screen videos** — use Runway Gen-4, Kling, or Sora.
4. **Convert to transparent resources** — `npm run videos` removes the green background via FFmpeg.
5. **Preview and tune** — run the app and adjust chroma-key parameters if needed.

See [TUTORIAL.md](TUTORIAL.md) for step-by-step instructions with exact prompts and tool recommendations.

**Prompt templates** for image and video generation are in [PROMPTS.md](PROMPTS.md).

---

## Development

### Requirements

- [Node.js](https://nodejs.org) ≥ 20 or [Bun](https://bun.sh) ≥ 1.1
- [Rust](https://rustup.rs) + [Tauri CLI](https://tauri.app/start/prerequisites/) (desktop app only)
- [FFmpeg](https://ffmpeg.org) (video conversion only)

### Commands

```bash
npm install          # install dependencies

# Desktop app
npm run dev          # Vite dev server (frontend only)
npm run app:dev      # full Tauri desktop app (requires Rust)

# Web version
npm run web:dev      # web dev server → http://localhost:5174/web.html
npm run web:build    # production build → dist-web/
npm run web:assets   # copy source MP4 videos to web-public/assets/
npm run web:assets:webm  # copy transparent WebM to web-public/assets/

# Assets
npm run videos       # generate transparent video resources from assets/
npm run icons        # regenerate app icons from assets/icon.png

# Quality
npm run check        # format + typecheck + lint
```

---

## Credits

Originally made by [Elliot](https://github.com/elliothux) and his daughter "毛球" (a 4-year-old Norwegian Forest cat).
