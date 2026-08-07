"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";


import {
  sensoryText,
} from "@/components/i18n/sensory-translations";
import {
  useLanguage,
} from "@/components/language/language-provider";

type Soundscape =
  | "none"
  | "rain"
  | "ocean"
  | "forest"
  | "cafe"
  | "white-noise"
  | "brown-noise";

type BrightnessPreset =
  | "soft"
  | "balanced"
  | "bright";

type InterfacePreset =
  | "calm"
  | "standard"
  | "high-clarity";

type ReadingWidth =
  | "narrow"
  | "comfortable"
  | "wide";

type LineSpacing =
  | "normal"
  | "relaxed"
  | "spacious";


interface SensorySettings {
  soundscape: Soundscape;
  volume: number;
  brightness: BrightnessPreset;
  interfacePreset: InterfacePreset;
  readingWidth: ReadingWidth;
  lineSpacing: LineSpacing;
  reducedStimulation: boolean;
}


const defaultSettings: SensorySettings = {
  soundscape: "none",
  volume: 0.35,
  brightness: "balanced",
  interfacePreset: "standard",
  readingWidth: "comfortable",
  lineSpacing: "normal",
  reducedStimulation: false,
};


const soundscapes: Array<{
  id: Soundscape;
  label: string;
  symbol: string;
  description: string;
}> = [
  {
    id: "rain",
    label: "Gentle rain",
    symbol: "🌧️",
    description:
      "Soft filtered noise for a steady background.",
  },
  {
    id: "ocean",
    label: "Ocean waves",
    symbol: "🌊",
    description:
      "Slow rising and falling ambient sound.",
  },
  {
    id: "forest",
    label: "Quiet forest",
    symbol: "🌲",
    description:
      "A light natural texture with softer frequencies.",
  },
  {
    id: "cafe",
    label: "Calm café",
    symbol: "☕",
    description:
      "Low, blurred background activity.",
  },
  {
    id: "white-noise",
    label: "White noise",
    symbol: "⚪",
    description:
      "Even sound across the frequency range.",
  },
  {
    id: "brown-noise",
    label: "Brown noise",
    symbol: "🟤",
    description:
      "A deeper and softer noise profile.",
  },
];


export function SensoryManager() {
  const {
    locale,
  } = useLanguage();

  const text = (
    key: string,
    values: Record<
      string,
      string | number
    > = {},
  ) =>
    sensoryText(
      locale,
      key,
      values,
    );

  const [settings, setSettings] =
    useState<SensorySettings>(() => {
      if (
        typeof window
        === "undefined"
      ) {
        return defaultSettings;
      }

      const saved =
        window.localStorage.getItem(
          "aksess-sensory-settings",
        );

      if (!saved) {
        return defaultSettings;
      }

      try {
        return JSON.parse(
          saved,
        ) as SensorySettings;
      } catch {
        return defaultSettings;
      }
    });

  const [isPlaying, setIsPlaying] =
    useState(false);

  const audioContextRef =
    useRef<AudioContext | null>(
      null,
    );

  const sourceRef =
    useRef<AudioBufferSourceNode | null>(
      null,
    );

  const gainRef =
    useRef<GainNode | null>(
      null,
    );


  useEffect(() => {
    applySettings(
      settings,
    );
  }, [settings]);


  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);


  function applySettings(
    nextSettings:
      SensorySettings,
  ) {
    const root =
      document.documentElement;

    root.dataset.brightness =
      nextSettings.brightness;

    root.dataset.interfacePreset =
      nextSettings.interfacePreset;

    root.dataset.readingWidth =
      nextSettings.readingWidth;

    root.dataset.lineSpacing =
      nextSettings.lineSpacing;

    root.dataset.reducedStimulation =
      String(
        nextSettings
          .reducedStimulation,
      );
  }


  function saveSettings(
    updates:
      Partial<SensorySettings>,
  ) {
    const nextSettings = {
      ...settings,
      ...updates,
    };

    setSettings(nextSettings);

    window.localStorage.setItem(
      "aksess-sensory-settings",
      JSON.stringify(
        nextSettings,
      ),
    );

    applySettings(
      nextSettings,
    );
  }


  function createNoiseBuffer(
    context: AudioContext,
    type: "white" | "brown",
  ) {
    const durationSeconds = 4;

    const buffer =
      context.createBuffer(
        1,
        context.sampleRate
          * durationSeconds,
        context.sampleRate,
      );

    const channelData =
      buffer.getChannelData(0);

    let previousValue = 0;

    for (
      let index = 0;
      index < channelData.length;
      index += 1
    ) {
      const white =
        Math.random() * 2 - 1;

      if (type === "brown") {
        previousValue =
          (
            previousValue
            + 0.02 * white
          ) / 1.02;

        channelData[index] =
          previousValue * 3.5;
      } else {
        channelData[index] =
          white * 0.45;
      }
    }

    return buffer;
  }


  function stopSound() {
    try {
      sourceRef.current?.stop();
    } catch {
      // The source may already be stopped.
    }

    sourceRef.current = null;

    void audioContextRef.current
      ?.close();

    audioContextRef.current = null;
    gainRef.current = null;

    setIsPlaying(false);
  }


  function playSound(
    soundscape: Soundscape,
  ) {
    if (soundscape === "none") {
      stopSound();

      return;
    }

    stopSound();

    const context =
      new AudioContext();

    const gain =
      context.createGain();

    gain.gain.value =
      settings.volume;

    gain.connect(
      context.destination,
    );

    const source =
      context.createBufferSource();

    const useBrownNoise =
      soundscape === "brown-noise"
      || soundscape === "cafe"
      || soundscape === "ocean";

    source.buffer =
      createNoiseBuffer(
        context,
        useBrownNoise
          ? "brown"
          : "white",
      );

    source.loop = true;

    const filter =
      context.createBiquadFilter();

    if (soundscape === "rain") {
      filter.type = "bandpass";
      filter.frequency.value = 1800;
      filter.Q.value = 0.5;
    } else if (
      soundscape === "forest"
    ) {
      filter.type = "lowpass";
      filter.frequency.value = 900;
    } else if (
      soundscape === "ocean"
    ) {
      filter.type = "lowpass";
      filter.frequency.value = 420;
    } else if (
      soundscape === "cafe"
    ) {
      filter.type = "bandpass";
      filter.frequency.value = 500;
      filter.Q.value = 0.65;
    } else if (
      soundscape === "brown-noise"
    ) {
      filter.type = "lowpass";
      filter.frequency.value = 650;
    } else {
      filter.type = "allpass";
    }

    source.connect(filter);
    filter.connect(gain);

    source.start();

    audioContextRef.current =
      context;

    sourceRef.current =
      source;

    gainRef.current =
      gain;

    setIsPlaying(true);

    saveSettings({
      soundscape,
    });
  }


  function updateVolume(
    volume: number,
  ) {
    saveSettings({
      volume,
    });

    if (gainRef.current) {
      gainRef.current
        .gain.value = volume;
    }
  }


  return (
    <>
      <section className="sensory-section">
        <div className="sensory-section-heading">
          <div>
            <p className="eyebrow">
              {text("sound.eyebrow")}
            </p>

            <h2>
              {text("sound.title")}
            </h2>

            <p>
              {text("sound.description")}
            </p>
          </div>

          <button
            className="button button-secondary"
            onClick={() => {
              stopSound();

              saveSettings({
                soundscape:
                  "none",
              });
            }}
            type="button"
          >
            {text("sound.stop")}
          </button>
        </div>

        <div className="soundscape-grid">
          {soundscapes.map(
            (soundscape) => {
              const selected =
                settings.soundscape
                === soundscape.id;

              return (
                <button
                  aria-pressed={
                    selected
                    && isPlaying
                  }
                  className={
                    selected
                      ? "soundscape-card soundscape-card-selected"
                      : "soundscape-card"
                  }
                  key={soundscape.id}
                  onClick={() =>
                    playSound(
                      soundscape.id,
                    )
                  }
                  type="button"
                >
                  <span>
                    {soundscape.symbol}
                  </span>

                  <strong>
                    {text(
                      `sound.${soundscape.id}.label`,
                    )}
                  </strong>

                  <small>
                    {text(
                      `sound.${soundscape.id}.description`,
                    )}
                  </small>

                  <em>
                    {selected
                    && isPlaying
                      ? text("sound.playing")
                      : text("sound.play")}
                  </em>
                </button>
              );
            },
          )}
        </div>

        <label className="sensory-volume-control">
          <span>
            {text(
              "sound.volume",
              {
                value:
                  Math.round(
                    settings.volume
                    * 100,
                  ),
              },
            )}
          </span>

          <input
            max="1"
            min="0"
            onChange={(event) =>
              updateVolume(
                Number(
                  event.target.value,
                ),
              )
            }
            step="0.01"
            type="range"
            value={
              settings.volume
            }
          />
        </label>
      </section>

      <section className="sensory-setting-grid">
        <SettingGroup
          description={text(
            "brightness.description",
          )}
          label={text(
            "brightness.label",
          )}
          options={[
            [
              "soft",
              text(
                "brightness.soft",
              ),
            ],
            [
              "balanced",
              text(
                "brightness.balanced",
              ),
            ],
            [
              "bright",
              text(
                "brightness.bright",
              ),
            ],
          ]}
          selected={
            settings.brightness
          }
          update={(value) =>
            saveSettings({
              brightness:
                value as
                  BrightnessPreset,
            })
          }
        />

        <SettingGroup
          description={text(
            "interface.description",
          )}
          label={text(
            "interface.label",
          )}
          options={[
            [
              "calm",
              text(
                "interface.calm",
              ),
            ],
            [
              "standard",
              text(
                "interface.standard",
              ),
            ],
            [
              "high-clarity",
              text(
                "interface.high-clarity",
              ),
            ],
          ]}
          selected={
            settings.interfacePreset
          }
          update={(value) =>
            saveSettings({
              interfacePreset:
                value as
                  InterfacePreset,
            })
          }
        />

        <SettingGroup
          description={text(
            "width.description",
          )}
          label={text(
            "width.label",
          )}
          options={[
            [
              "narrow",
              text(
                "width.narrow",
              ),
            ],
            [
              "comfortable",
              text(
                "width.comfortable",
              ),
            ],
            [
              "wide",
              text(
                "width.wide",
              ),
            ],
          ]}
          selected={
            settings.readingWidth
          }
          update={(value) =>
            saveSettings({
              readingWidth:
                value as
                  ReadingWidth,
            })
          }
        />

        <SettingGroup
          description={text(
            "spacing.description",
          )}
          label={text(
            "spacing.label",
          )}
          options={[
            [
              "normal",
              text(
                "spacing.normal",
              ),
            ],
            [
              "relaxed",
              text(
                "spacing.relaxed",
              ),
            ],
            [
              "spacious",
              text(
                "spacing.spacious",
              ),
            ],
          ]}
          selected={
            settings.lineSpacing
          }
          update={(value) =>
            saveSettings({
              lineSpacing:
                value as
                  LineSpacing,
            })
          }
        />
      </section>

      <section className="reduced-stimulation-card">
        <div>
          <p className="eyebrow">
            {text("reduced.eyebrow")}
          </p>

          <h2>
            {text("reduced.title")}
          </h2>

          <p>
            {text("reduced.description")}
          </p>
        </div>

        <button
          aria-pressed={
            settings
              .reducedStimulation
          }
          className={
            settings
              .reducedStimulation
              ? "button button-primary"
              : "button button-secondary"
          }
          onClick={() =>
            saveSettings({
              reducedStimulation:
                !settings
                  .reducedStimulation,
            })
          }
          type="button"
        >
          {settings
            .reducedStimulation
            ? text("reduced.enabled")
            : text("reduced.enable")}
        </button>
      </section>

      <section className="sensory-preview">
        <p className="eyebrow">
          {text("preview.eyebrow")}
        </p>

        <h2>
          {text("preview.title")}
        </h2>

        <p>
          {text("preview.description")}
        </p>

        <button
          className="button button-primary"
          type="button"
        >
          {text("preview.action")}
        </button>
      </section>
    </>
  );
}


function SettingGroup({
  label,
  description,
  options,
  selected,
  update,
}: {
  label: string;
  description: string;
  options:
    Array<[string, string]>;
  selected: string;
  update: (
    value: string,
  ) => void;
}) {
  return (
    <section className="sensory-setting-card">
      <h2>
        {label}
      </h2>

      <p>
        {description}
      </p>

      <div className="sensory-option-row">
        {options.map(
          ([
            value,
            optionLabel,
          ]) => (
            <button
              aria-pressed={
                selected === value
              }
              className={
                selected === value
                  ? "sensory-option-selected"
                  : ""
              }
              key={value}
              onClick={() =>
                update(value)
              }
              type="button"
            >
              {optionLabel}
            </button>
          ),
        )}
      </div>
    </section>
  );
}
