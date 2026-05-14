import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";
import { Check, ExternalLink, Play, Power, Timer } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import "./App.css";
import "./WebApp.css";
import { Button } from "./components/ui/pixelact-ui/button";
import { Label } from "./components/ui/pixelact-ui/label";
import type { Locales, TranslationFunctions } from "./i18n/i18n-types";
import { i18nObject } from "./i18n/i18n-util";
import { loadAllLocales } from "./i18n/i18n-util.sync";
import pkg from "../package.json";

import appLogo from "./assets/app-logo.png";

loadAllLocales();

// ── Types ──────────────────────────────────────────────────────────────────

type Settings = {
  delaySeconds: number;
  durationSeconds: number;
  locale: Locales;
};

type ScreensaverMode = "scheduled" | "manual" | "preview";

type GitHubRelease = {
  draft?: boolean;
  html_url?: string;
  prerelease?: boolean;
  tag_name?: string;
};

type ReleasePackageJson = {
  version?: string;
};

type UpdateInfo = {
  url: string;
  version: string;
};

type UpdateCheckCache = {
  checkedAt: number;
  release: UpdateInfo | null;
};

// ── Constants ──────────────────────────────────────────────────────────────

const APP_VERSION = pkg.version ?? "0.0.0";
const SETTINGS_STORAGE_KEY = "kitty-screen:settings";
const GITHUB_REPOSITORY = "elliothux/kitty-screen";
const GITHUB_URL = "https://github.com/elliothux/kitty-screen";
const GITHUB_RELEASES_URL = `${GITHUB_URL}/releases`;
const GITHUB_LATEST_RELEASE_API_URL = `https://api.github.com/repos/${GITHUB_REPOSITORY}/releases/latest`;
const JSDELIVR_LATEST_PACKAGE_URL = `https://cdn.jsdelivr.net/gh/${GITHUB_REPOSITORY}@latest/package.json`;
const UPDATE_CHECK_CACHE_KEY = "kitty-screen:update-check";
const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const UPDATE_CHECK_TIMEOUT_MS = 8_000;
const CLOCK_REVEAL_DELAY_MS = 10_000;
const PREVIEW_DURATION_SECONDS = 20;

const SUPPORTED_LOCALES = [
  "en",
  "zh-CN",
  "zh-HK",
  "zh-TW",
  "ja",
  "ko",
  "es",
  "fr",
  "pt",
] as const satisfies readonly Locales[];

const DEFAULT_LOCALE: Locales = "zh-CN";

const DEFAULT_SETTINGS: Settings = {
  delaySeconds: 30 * 60,
  durationSeconds: 30,
  locale: DEFAULT_LOCALE,
};

// ── Setting utilities ──────────────────────────────────────────────────────

function isSupportedLocale(locale: string): locale is Locales {
  return SUPPORTED_LOCALES.includes(locale as Locales);
}

function normalizeSettings(settings: Partial<Settings>): Settings {
  return {
    delaySeconds: settings.delaySeconds ?? DEFAULT_SETTINGS.delaySeconds,
    durationSeconds:
      settings.durationSeconds ?? DEFAULT_SETTINGS.durationSeconds,
    locale:
      settings.locale && isSupportedLocale(settings.locale)
        ? settings.locale
        : DEFAULT_LOCALE,
  };
}

function loadWebSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return normalizeSettings(JSON.parse(raw) as Partial<Settings>);
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

function persistSettings(settings: Settings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore quota errors
  }
}

// ── Version / update utilities ─────────────────────────────────────────────

function normalizeVersion(version: string) {
  return version.trim().replace(/^v/i, "").split(/[+-]/)[0] ?? "";
}

function parseVersion(version: string) {
  const normalized = normalizeVersion(version);
  if (!/^\d+(?:\.\d+){0,2}$/.test(normalized)) return null;
  const parts = normalized.split(".").map(Number);
  while (parts.length < 3) parts.push(0);
  return parts;
}

function compareVersions(left: string, right: string) {
  const l = parseVersion(left);
  const r = parseVersion(right);
  if (!l || !r) return 0;
  for (let i = 0; i < 3; i++) {
    const diff = l[i] - r[i];
    if (diff !== 0) return diff;
  }
  return 0;
}

function releaseToUpdateInfo(release: GitHubRelease): UpdateInfo | null {
  const version = release.tag_name?.trim();
  if (!version || release.draft || release.prerelease) return null;
  return { url: release.html_url ?? GITHUB_RELEASES_URL, version };
}

function versionToReleaseTag(version: string) {
  const normalized = normalizeVersion(version);
  return normalized ? `v${normalized}` : "";
}

function packageJsonToUpdateInfo(
  packageJson: ReleasePackageJson,
): UpdateInfo | null {
  const tag = versionToReleaseTag(packageJson.version ?? "");
  if (!tag) return null;
  return { url: `${GITHUB_RELEASES_URL}/tag/${tag}`, version: tag };
}

function readUpdateCheckCache(): UpdateCheckCache | null {
  try {
    const raw = localStorage.getItem(UPDATE_CHECK_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UpdateCheckCache>;
    if (typeof parsed.checkedAt !== "number") return null;
    return { checkedAt: parsed.checkedAt, release: parsed.release ?? null };
  } catch {
    return null;
  }
}

function writeUpdateCheckCache(release: UpdateInfo | null) {
  try {
    localStorage.setItem(
      UPDATE_CHECK_CACHE_KEY,
      JSON.stringify({ checkedAt: Date.now(), release }),
    );
  } catch {
    // ignore
  }
}

function availableUpdateFromRelease(
  release: UpdateInfo | null,
  currentVersion: string,
) {
  if (!release) return null;
  return compareVersions(release.version, currentVersion) > 0 ? release : null;
}

async function fetchJson<T>(
  url: string,
  headers: Record<string, string> = { Accept: "application/json" },
): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    UPDATE_CHECK_TIMEOUT_MS,
  );
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function fetchLatestUpdateInfo() {
  try {
    return releaseToUpdateInfo(
      await fetchJson<GitHubRelease>(GITHUB_LATEST_RELEASE_API_URL, {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      }),
    );
  } catch (primaryError) {
    console.error(primaryError);
  }
  return packageJsonToUpdateInfo(
    await fetchJson<ReleasePackageJson>(JSDELIVR_LATEST_PACKAGE_URL),
  );
}

async function checkForAvailableUpdate() {
  const cached = readUpdateCheckCache();
  if (cached && Date.now() - cached.checkedAt < UPDATE_CHECK_INTERVAL_MS) {
    return availableUpdateFromRelease(cached.release, APP_VERSION);
  }
  try {
    const release = await fetchLatestUpdateInfo();
    writeUpdateCheckCache(release);
    return availableUpdateFromRelease(release, APP_VERSION);
  } catch (error) {
    console.error(error);
    return availableUpdateFromRelease(cached?.release ?? null, APP_VERSION);
  }
}

// ── Time formatting ────────────────────────────────────────────────────────

function formatCountdown(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

// ── Option data ────────────────────────────────────────────────────────────

function delayOptions(LL: TranslationFunctions) {
  return [
    { label: LL.durations.minutes15(), value: 15 * 60 },
    { label: LL.durations.minutes30(), value: 30 * 60 },
    { label: LL.durations.hours1(), value: 60 * 60 },
    { label: LL.durations.hours1_5(), value: 90 * 60 },
    { label: LL.durations.hours2(), value: 120 * 60 },
    { label: LL.durations.hours3(), value: 180 * 60 },
  ];
}

function durationOptions(LL: TranslationFunctions) {
  return [
    { label: LL.durations.seconds15(), value: 15 },
    { label: LL.durations.seconds30(), value: 30 },
    { label: LL.durations.minutes1(), value: 60 },
    { label: LL.durations.minutes1_5(), value: 90 },
    { label: LL.durations.minutes2(), value: 120 },
    { label: LL.durations.minutes3(), value: 180 },
    { label: LL.durations.minutes5(), value: 300 },
    { label: LL.durations.minutes10(), value: 600 },
    { label: LL.durations.minutes15(), value: 900 },
    { label: LL.durations.minutes30(), value: 1800 },
  ];
}

function languageOptions(LL: TranslationFunctions) {
  return [
    { label: LL.languages.en(), value: "en" },
    { label: LL.languages.zhCN(), value: "zh-CN" },
    { label: LL.languages.zhHK(), value: "zh-HK" },
    { label: LL.languages.zhTW(), value: "zh-TW" },
    { label: LL.languages.ja(), value: "ja" },
    { label: LL.languages.ko(), value: "ko" },
    { label: LL.languages.es(), value: "es" },
    { label: LL.languages.fr(), value: "fr" },
    { label: LL.languages.pt(), value: "pt" },
  ] satisfies Array<{ label: ReactNode; value: Locales }>;
}

// ── OptionGroup component ──────────────────────────────────────────────────

type OptionValue = number | string;

type OptionGroupProps<T extends OptionValue> = {
  id: string;
  label: ReactNode;
  value: T;
  options: Array<{ label: ReactNode; value: T }>;
  onChange: (value: T) => void;
  variant?: "default" | "language";
};

function OptionGroup<T extends OptionValue>({
  id,
  label,
  value,
  options,
  onChange,
  variant = "default",
}: OptionGroupProps<T>) {
  return (
    <section className="setting-row" aria-labelledby={`${id}-label`}>
      <div className="setting-row__header">
        <Label id={`${id}-label`}>{label}</Label>
      </div>
      <div
        className={`option-grid option-grid--${variant}`}
        role="group"
        aria-labelledby={`${id}-label`}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Button
              key={option.value}
              aria-pressed={active}
              data-active={active ? "true" : undefined}
              data-option-value={option.value}
              onClick={() => onChange(option.value)}
              size="sm"
              variant={active ? "success" : "default"}
            >
              {active && <Check aria-hidden="true" />}
              {option.label}
            </Button>
          );
        })}
      </div>
    </section>
  );
}

// ── UpdateNotice component ─────────────────────────────────────────────────

function UpdateNotice({
  LL,
  info,
  onOpen,
}: {
  LL: TranslationFunctions;
  info: UpdateInfo;
  onOpen: () => void;
}) {
  return (
    <section className="update-notice" aria-live="polite">
      <div className="update-notice__copy">
        <strong>
          {LL.settings.updateAvailable()} {info.version}
        </strong>
        <span>{LL.settings.updateDescription()}</span>
      </div>
      <div className="update-notice__actions">
        <Button
          aria-label={String(LL.settings.updateOpen())}
          onClick={onOpen}
          size="icon"
          variant="success"
        >
          <ExternalLink aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}

// ── WebScreensaverView component ───────────────────────────────────────────

function WebScreensaverView({
  LL,
  endsAt,
  generation,
  onDismiss,
}: {
  LL: TranslationFunctions;
  endsAt: number;
  generation: number;
  onDismiss: () => void;
}) {
  const [showClock, setShowClock] = useState(false);
  const [showingLoop, setShowingLoop] = useState(false);
  const entranceRef = useRef<HTMLVideoElement>(null);
  const loopRef = useRef<HTMLVideoElement>(null);

  // `generation` in deps forces re-computation on each new screensaver session
  // even when `endsAt` happens to be the same value.
  const target = useMemo(
    () => (endsAt > Date.now() ? endsAt : Date.now() + 1000),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [endsAt, generation],
  );

  // Start playback on each new screensaver session
  useEffect(() => {
    setShowClock(false);
    setShowingLoop(false);

    const entrance = entranceRef.current;
    if (entrance) {
      entrance.currentTime = 0;
      void entrance.play().catch(console.error);
    }

    const timer = window.setTimeout(
      () => setShowClock(true),
      CLOCK_REVEAL_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, [generation]);

  // Exit fullscreen dismisses the screensaver
  useEffect(() => {
    const handleChange = () => {
      if (!document.fullscreenElement) onDismiss();
    };
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, [onDismiss]);

  const switchToLoop = useCallback(() => {
    setShowingLoop(true);
    const loop = loopRef.current;
    if (loop) {
      loop.currentTime = 0;
      void loop.play().catch(console.error);
    }
  }, []);

  return (
    <div className="web-screensaver">
      {/* Entrance animation */}
      <video
        ref={entranceRef}
        aria-hidden="true"
        className="screensaver__video web-screensaver__video"
        data-active={!showingLoop ? "true" : undefined}
        muted
        onEnded={switchToLoop}
        playsInline
        preload="auto"
      >
        <source src="./assets/kitty.webm" type="video/webm" />
        <source src="./assets/kitty.mp4" type="video/mp4" />
      </video>

      {/* Idle loop */}
      <video
        ref={loopRef}
        aria-hidden="true"
        className="screensaver__video web-screensaver__video"
        data-active={showingLoop ? "true" : undefined}
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src="./assets/kitty-loop.webm" type="video/webm" />
        <source src="./assets/kitty-loop.mp4" type="video/mp4" />
      </video>

      {/* Countdown clock */}
      <section className="screensaver__content" data-visible={showClock}>
        <FlipClockCountdown
          key={`${generation}-${target}`}
          className="kitty-countdown"
          digitBlockStyle={{
            background: "#fbfaf1",
            borderRadius: 0,
            boxShadow: "0 0 0 2px #101014, 0 5px 0 rgba(16, 16, 20, 0.55)",
            color: "#101014",
            fontFamily:
              '"Press Start 2P", ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: "clamp(30px, 4vw, 58px)",
            height: "clamp(68px, 8vw, 116px)",
            width: "clamp(50px, 6vw, 90px)",
          }}
          dividerStyle={{ color: "#101014", height: 1 }}
          duration={0.55}
          hideOnComplete={false}
          labelStyle={{
            color: "#fbfaf1",
            fontFamily:
              '"Press Start 2P", ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: 9,
            textTransform: "uppercase",
          }}
          labels={["D", "H", "M", "S"]}
          onComplete={onDismiss}
          renderMap={[false, false, true, true]}
          separatorStyle={{
            color: "#fbfaf1",
            size: "clamp(13px, 1.8vw, 24px)",
          }}
          showLabels={false}
          spacing={{ clock: 16, digitBlock: 7 }}
          to={target}
        />
      </section>

      {/* Close button */}
      <Button
        aria-label={String(LL.screensaver.close())}
        className="screensaver__close"
        onClick={onDismiss}
        size="icon"
        variant="destructive"
      >
        <Power aria-hidden="true" />
      </Button>
    </div>
  );
}

// ── Main WebApp component ──────────────────────────────────────────────────

function WebApp() {
  const [settings, setSettings] = useState<Settings>(loadWebSettings);
  const [screensaverActive, setScreensaverActive] = useState(false);
  const [screensaverEndsAt, setScreensaverEndsAt] = useState(0);
  const [screensaverGeneration, setScreensaverGeneration] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  const LL = useMemo(() => i18nObject(settings.locale), [settings.locale]);
  const delayChoices = useMemo(() => delayOptions(LL), [LL]);
  const durationChoices = useMemo(() => durationOptions(LL), [LL]);
  const languageChoices = useMemo(() => languageOptions(LL), [LL]);

  // Sync lang attribute
  useEffect(() => {
    document.documentElement.lang = settings.locale;
  }, [settings.locale]);

  // Visible-time timer — pauses when tab is hidden or screensaver is active
  useEffect(() => {
    if (screensaverActive) return;

    const interval = window.setInterval(() => {
      if (!document.hidden) {
        setElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [screensaverActive]);

  // Auto-trigger scheduled screensaver
  useEffect(() => {
    if (
      !screensaverActive &&
      elapsedSeconds > 0 &&
      elapsedSeconds >= settings.delaySeconds
    ) {
      showScreensaver("scheduled");
    }
    // showScreensaver is stable; listing it would create a loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedSeconds, settings.delaySeconds, screensaverActive]);

  // Check for updates once on mount
  useEffect(() => {
    let cancelled = false;
    void checkForAvailableUpdate().then((update) => {
      if (!cancelled) setUpdateInfo(update);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const showScreensaver = useCallback(
    (mode: ScreensaverMode) => {
      const durationSeconds =
        mode === "preview" ? PREVIEW_DURATION_SECONDS : settings.durationSeconds;

      setScreensaverActive(true);
      setScreensaverEndsAt(Date.now() + durationSeconds * 1000);
      setScreensaverGeneration((g) => g + 1);

      void document.documentElement.requestFullscreen().catch(() => {
        // Fullscreen may be blocked without a user gesture (e.g. auto-trigger).
        // The screensaver still shows as a full-viewport overlay.
      });
    },
    [settings.durationSeconds],
  );

  const dismissScreensaver = useCallback(() => {
    setScreensaverActive(false);
    setElapsedSeconds(0);
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
    }
  }, []);

  const saveSettings = useCallback(
    (next: Settings) => {
      setSettings(next);
      persistSettings(next);
      // Reset elapsed so the new delay starts fresh
      setElapsedSeconds(0);
    },
    [],
  );

  const openExternalUrl = useCallback((url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const openGitHub = useCallback(
    () => openExternalUrl(GITHUB_URL),
    [openExternalUrl],
  );

  const openUpdate = useCallback(() => {
    if (updateInfo) openExternalUrl(updateInfo.url);
  }, [openExternalUrl, updateInfo]);

  // Render screensaver as full-viewport overlay
  if (screensaverActive) {
    return (
      <WebScreensaverView
        LL={LL}
        endsAt={screensaverEndsAt}
        generation={screensaverGeneration}
        onDismiss={dismissScreensaver}
      />
    );
  }

  const remainingSeconds = Math.max(0, settings.delaySeconds - elapsedSeconds);

  return (
    <main className="settings-shell" data-locale={settings.locale}>
      <section className="settings-panel" aria-labelledby="settings-title">
        <header className="settings-header">
          <img
            alt=""
            aria-hidden="true"
            className="settings-title-icon"
            src={appLogo}
          />
          <div>
            <h1 className="settings-title" id="settings-title">
              Kitty Screen
            </h1>
            <span className="web-badge">Web</span>
          </div>
        </header>

        {/* Timer status bar */}
        <div className="web-timer-bar" role="status" aria-live="polite">
          <Timer aria-hidden="true" className="web-timer-bar__icon" />
          <span className="web-timer-bar__label">
            {elapsedSeconds === 0
              ? LL.settings.delayLabel()
              : formatCountdown(remainingSeconds)}
          </span>
          <div
            className="web-timer-bar__track"
            role="progressbar"
            aria-valuenow={elapsedSeconds}
            aria-valuemin={0}
            aria-valuemax={settings.delaySeconds}
          >
            <div
              className="web-timer-bar__fill"
              style={{
                width: `${Math.min(100, (elapsedSeconds / settings.delaySeconds) * 100)}%`,
              }}
            />
          </div>
        </div>

        {updateInfo && (
          <UpdateNotice LL={LL} info={updateInfo} onOpen={openUpdate} />
        )}

        <OptionGroup
          id="delay"
          label={LL.settings.delayLabel()}
          onChange={(delaySeconds) =>
            saveSettings({ ...settings, delaySeconds })
          }
          options={delayChoices}
          value={settings.delaySeconds}
        />

        <OptionGroup
          id="duration"
          label={LL.settings.durationLabel()}
          onChange={(durationSeconds) =>
            saveSettings({ ...settings, durationSeconds })
          }
          options={durationChoices}
          value={settings.durationSeconds}
        />

        <OptionGroup
          id="language"
          label={LL.settings.languageLabel()}
          onChange={(locale) => saveSettings({ ...settings, locale })}
          options={languageChoices}
          value={settings.locale}
          variant="language"
        />

        <footer className="settings-footer">
          <div className="settings-actions">
            <Button
              onClick={() => showScreensaver("preview")}
              size="lg"
              variant="warning"
            >
              <Play aria-hidden="true" />
              {LL.settings.preview()}
            </Button>
            <Button onClick={openGitHub} size="lg" variant="secondary">
              <ExternalLink aria-hidden="true" />
              {LL.settings.github()}
            </Button>
          </div>
        </footer>
      </section>
      <p className="settings-credit">{LL.settings.credit()}</p>
    </main>
  );
}

export default WebApp;
