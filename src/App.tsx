import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Check, Play, Power } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import "./App.css";
import { Button } from "./components/ui/pixelact-ui/button";
import { Label } from "./components/ui/pixelact-ui/label";
import type { Locales, TranslationFunctions } from "./i18n/i18n-types";
import { i18nObject } from "./i18n/i18n-util";
import { loadAllLocales } from "./i18n/i18n-util.sync";

import catImage from "../assets/001.png";
import appLogo from "./assets/app-logo.png";

loadAllLocales();

type Settings = {
  delaySeconds: number;
  durationSeconds: number;
  locale: Locales;
};

type ScreensaverState = {
  isShowing: boolean;
  durationSeconds: number;
  endsAtMs: number;
  mode: "scheduled" | "manual" | "preview";
  generation: number;
};

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

const DEFAULT_SCREENSAVER_STATE: ScreensaverState = {
  isShowing: false,
  durationSeconds: 30,
  endsAtMs: 0,
  mode: "scheduled",
  generation: 0,
};

function isScreensaverRoute() {
  return new URLSearchParams(window.location.search).has("screensaver");
}

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

function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [screensaverState, setScreensaverState] = useState<ScreensaverState>(
    DEFAULT_SCREENSAVER_STATE,
  );
  const [isSaving, setIsSaving] = useState(false);
  const LL = useMemo(() => i18nObject(settings.locale), [settings.locale]);
  const delayChoices = useMemo(() => delayOptions(LL), [LL]);
  const durationChoices = useMemo(() => durationOptions(LL), [LL]);
  const languageChoices = useMemo(() => languageOptions(LL), [LL]);

  const refreshScreensaverState = useCallback(async () => {
    try {
      const next = await invoke<ScreensaverState>("get_screensaver_state");
      setScreensaverState(next);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    let unlistenScreensaver: (() => void) | undefined;
    let unlistenSettings: (() => void) | undefined;

    async function boot() {
      try {
        const [loadedSettings, overlay] = await Promise.all([
          invoke<Partial<Settings>>("get_settings"),
          invoke<ScreensaverState>("get_screensaver_state"),
        ]);
        setSettings(normalizeSettings(loadedSettings));
        setScreensaverState(overlay);
      } catch (error) {
        console.error(error);
      }

      unlistenScreensaver = await listen<ScreensaverState>(
        "screensaver://state",
        (event) => {
          setScreensaverState(event.payload);
        },
      );

      unlistenSettings = await listen<Partial<Settings>>(
        "settings://changed",
        (event) => {
          setSettings(normalizeSettings(event.payload));
        },
      );
    }

    boot();

    return () => {
      unlistenScreensaver?.();
      unlistenSettings?.();
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = settings.locale;
  }, [settings.locale]);

  const saveSettings = useCallback(
    async (next: Settings) => {
      setSettings(next);
      setIsSaving(true);

      try {
        const saved = await invoke<Settings>("save_settings", {
          settings: next,
        });
        setSettings(normalizeSettings(saved));
        await refreshScreensaverState();
      } catch (error) {
        console.error(error);
      } finally {
        setIsSaving(false);
      }
    },
    [refreshScreensaverState],
  );

  const preview = useCallback(async () => {
    await invoke("preview_screensaver");
    await refreshScreensaverState();
  }, [refreshScreensaverState]);

  if (isScreensaverRoute()) {
    return <ScreensaverView LL={LL} state={screensaverState} />;
  }

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
          <h1 className="settings-title" id="settings-title">
            Kitty Screen
          </h1>
        </header>

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

        <footer className="settings-actions">
          <Button
            disabled={isSaving}
            onClick={preview}
            size="lg"
            variant="warning"
          >
            <Play aria-hidden="true" />
            {LL.settings.preview()}
          </Button>
        </footer>
      </section>
    </main>
  );
}

function ScreensaverView({
  LL,
  state,
}: {
  LL: TranslationFunctions;
  state: ScreensaverState;
}) {
  const target = useMemo(() => {
    if (state.endsAtMs > Date.now()) {
      return state.endsAtMs;
    }

    return Date.now() + 1000;
  }, [state.endsAtMs, state.generation]);

  const close = useCallback(async () => {
    try {
      await invoke("hide_screensaver");
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <main
      className="screensaver"
      style={{ backgroundImage: `url(${catImage})` }}
    >
      <div className="screensaver__shade" />
      <section className="screensaver__content">
        <FlipClockCountdown
          key={`${state.generation}-${target}`}
          className="kitty-countdown"
          digitBlockStyle={{
            background: "#fbfaf1",
            borderRadius: 0,
            color: "#101014",
            fontFamily:
              '"Press Start 2P", ui-monospace, SFMono-Regular, Menlo, monospace',
            fontSize: "clamp(54px, 6vw, 86px)",
            height: "clamp(108px, 12vw, 168px)",
            width: "clamp(82px, 9vw, 128px)",
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
          onComplete={close}
          renderMap={[false, false, true, true]}
          separatorStyle={{ color: "#fbfaf1", size: "clamp(14px, 2vw, 26px)" }}
          showLabels={false}
          spacing={{ clock: 24, digitBlock: 9 }}
          to={target}
        />
      </section>
      <Button
        aria-label={String(LL.screensaver.close())}
        className="screensaver__close"
        onClick={close}
        size="icon"
        variant="destructive"
      >
        <Power aria-hidden="true" />
      </Button>
    </main>
  );
}

export default App;
