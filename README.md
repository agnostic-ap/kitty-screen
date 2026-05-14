# Kitty Screen

[中文说明](README.zh.md) · [Detailed Tutorial](TUTORIAL.md) · [GitHub](https://github.com/elliothux/kitty-screen) · [Download](https://github.com/elliothux/kitty-screen/releases)

Kitty Screen is a screen-break reminder desktop app built with Tauri + React. After you have been looking at the screen for a configured amount of time, a transparent animated cat appears on top of all your windows and stays until a countdown finishes — reminding you to look away and rest your eyes.

> Looking for the **browser extension** version? → [kitty-screen-extension](https://github.com/agnostic-ap/kitty-screen-extension)

<p align="center">
  <img src="assets/icon.png" alt="Kitty Screen app icon" width="180" />
</p>

## Preview

<p>
  <img src="assets/preview-0.png" alt="Kitty Screen overlay preview 1" width="360" />
  <img src="assets/preview-1.png" alt="Kitty Screen overlay preview 2" width="360" />
</p>

---

## Download

Download the latest build from [GitHub Releases](https://github.com/elliothux/kitty-screen/releases).

- **macOS**: `Kitty.Screen_x.x.x_universal.dmg`
- **Windows**: `Kitty.Screen_x.x.x_x64-setup.exe`

---

## Customizing Your Own Cat

You can replace the built-in cat with any cat — real or AI-generated. The workflow:

1. **Prepare reference photos** — collect clear photos of your cat from multiple angles.
2. **Generate 12 green-screen keyframes** — use GPT-4o Image or Midjourney with your cat photos as identity references and `assets/raw-furryball/001–012.png` as pose guides.
3. **Generate two green-screen videos** — use Runway Gen-4, Kling, or Sora.
4. **Convert to transparent resources** — `bun run videos` removes the green background via FFmpeg.
5. **Preview and tune** — run the app and adjust chroma-key parameters if needed.

See [TUTORIAL.md](TUTORIAL.md) for step-by-step instructions with exact prompts and tool recommendations.

**Prompt templates** for image and video generation are in [PROMPTS.md](PROMPTS.md).

---

## Development

### Requirements

- [Bun](https://bun.sh) ≥ 1.1
- [Rust](https://rustup.rs) + [Tauri CLI](https://tauri.app/start/prerequisites/)
- [FFmpeg](https://ffmpeg.org) (for video conversion)

### Commands

```bash
bun install          # install dependencies
bun run dev          # Vite dev server (frontend only)
bun run app:dev      # full Tauri desktop app
bun run videos       # generate transparent video resources from assets/
bun run build        # production build
bun run check        # format + typecheck + lint
```

---

## Credits

Originally made by [Elliot](https://github.com/elliothux) and his daughter "毛球" (a 4-year-old Norwegian Forest cat).
