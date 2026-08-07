"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Logo,
} from "@/components/layout/logo";

import type {
  VoiceGuide,
  VoicePreference,
  VoicePrivacyStatus,
} from "@/lib/types";


interface BrowserVoice {
  name:
    string;

  lang:
    string;

  default:
    boolean;

  voiceURI:
    string;
}


function browserSupportsSpeech(): boolean {
  return (
    typeof window
    !== "undefined"
    && "speechSynthesis"
    in window
    && "SpeechSynthesisUtterance"
    in window
  );
}


export function VoiceGuidanceCentre() {
  const [
    preferences,
    setPreferences,
  ] =
    useState<
      VoicePreference
      | null
    >(null);

  const [
    privacy,
    setPrivacy,
  ] =
    useState<
      VoicePrivacyStatus
      | null
    >(null);

  const [
    guides,
    setGuides,
  ] =
    useState<
      VoiceGuide[]
    >([]);

  const [
    voices,
    setVoices,
  ] =
    useState<
      BrowserVoice[]
    >([]);

  const [
    selectedGuideId,
    setSelectedGuideId,
  ] =
    useState("");

  const [
    customText,
    setCustomText,
  ] =
    useState(
      "",
    );

  const [
    isSpeaking,
    setIsSpeaking,
  ] =
    useState(
      false,
    );

  const [
    isPaused,
    setIsPaused,
  ] =
    useState(
      false,
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(
      true,
    );

  const [
    error,
    setError,
  ] =
    useState(
      "",
    );

  const [
    message,
    setMessage,
  ] =
    useState(
      "",
    );


  const selectedGuide =
    useMemo(
      () =>
        guides.find(
          (
            guide,
          ) =>
            guide.id
            === selectedGuideId,
        )
        ?? null,
      [
        guides,
        selectedGuideId,
      ],
    );


  const loadData =
    useCallback(
      async () => {
        setIsLoading(
          true,
        );

        setError(
          "",
        );

        try {
          const [
            privacyResponse,
            preferenceResponse,
            guidesResponse,
          ] =
            await Promise.all([
              fetch(
                "/api/voice/privacy",
                {
                  cache:
                    "no-store",
                },
              ),

              fetch(
                "/api/voice/preferences",
                {
                  cache:
                    "no-store",
                },
              ),

              fetch(
                "/api/voice/guides",
                {
                  cache:
                    "no-store",
                },
              ),
            ]);

          if (
            !privacyResponse.ok
            || !preferenceResponse.ok
            || !guidesResponse.ok
          ) {
            throw new Error(
              "Voice guidance could not be loaded.",
            );
          }

          const privacyData:
            VoicePrivacyStatus =
              await privacyResponse.json();

          const preferenceData:
            VoicePreference =
              await preferenceResponse.json();

          const guideData: {
            guides:
              VoiceGuide[];
          } =
            await guidesResponse.json();

          setPrivacy(
            privacyData,
          );

          setPreferences(
            preferenceData,
          );

          setGuides(
            guideData.guides,
          );

          if (
            guideData.guides.length
            > 0
          ) {
            setSelectedGuideId(
              (
                current,
              ) =>
                current
                || guideData
                  .guides[
                    0
                  ].id,
            );
          }
        } catch (
          caughtError
        ) {
          setError(
            caughtError
            instanceof Error
              ? caughtError.message
              : (
                  "Voice guidance "
                  + "could not be loaded."
                ),
          );
        } finally {
          setIsLoading(
            false,
          );
        }
      },
      [],
    );


  useEffect(() => {
    const id =
      window.setTimeout(
        () => {
          void loadData();

          if (
            browserSupportsSpeech()
          ) {
            const loadVoices =
              () => {
                const available =
                  window.speechSynthesis
                    .getVoices()
                    .map(
                      (
                        voice,
                      ) => ({
                        name:
                          voice.name,

                        lang:
                          voice.lang,

                        default:
                          voice.default,

                        voiceURI:
                          voice.voiceURI,
                      }),
                    );

                setVoices(
                  available,
                );
              };

            loadVoices();

            window.speechSynthesis
              .addEventListener(
                "voiceschanged",
                loadVoices,
              );
          }
        },
        0,
      );

    return () => {
      window.clearTimeout(
        id,
      );

      if (
        browserSupportsSpeech()
      ) {
        window.speechSynthesis
          .cancel();
      }
    };
  }, [
    loadData,
  ]);


  async function updatePreference(
    changes:
      Partial<
        VoicePreference
      >,
  ) {
    if (
      !preferences
    ) {
      return;
    }

    const previous =
      preferences;

    setPreferences({
      ...preferences,
      ...changes,
    });

    setMessage(
      "",
    );

    setError(
      "",
    );

    try {
      const response =
        await fetch(
          "/api/voice/preferences",
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                changes,
              ),
          },
        );

      if (!response.ok) {
        throw new Error(
          "Voice preferences could not be saved.",
        );
      }

      const updated:
        VoicePreference =
          await response.json();

      setPreferences(
        updated,
      );

      setMessage(
        "Voice preferences saved.",
      );
    } catch (
      caughtError
    ) {
      setPreferences(
        previous,
      );

      setError(
        caughtError
        instanceof Error
          ? caughtError.message
          : (
              "Voice preferences "
              + "could not be saved."
            ),
      );
    }
  }


  function stopSpeech() {
    if (
      !browserSupportsSpeech()
    ) {
      return;
    }

    window.speechSynthesis
      .cancel();

    setIsSpeaking(
      false,
    );

    setIsPaused(
      false,
    );
  }


  function speak(
    text:
      string,
  ) {
    if (
      !privacy
        ?.enabled
    ) {
      setError(
        (
          "Voice guidance is disabled "
          + "in your privacy settings."
        ),
      );

      return;
    }

    if (
      !browserSupportsSpeech()
    ) {
      setError(
        (
          "Speech synthesis is not "
          + "supported by this browser."
        ),
      );

      return;
    }

    if (
      !preferences
      || !text.trim()
    ) {
      return;
    }

    stopSpeech();

    const utterance =
      new SpeechSynthesisUtterance(
        text.trim(),
      );

    utterance.lang =
      preferences.language;

    utterance.rate =
      preferences.speech_rate;

    utterance.pitch =
      preferences.speech_pitch;

    utterance.volume =
      preferences.speech_volume;

    const selected =
      voices.find(
        (
          voice,
        ) =>
          voice.name
          === preferences.voice_name,
      );

    if (selected) {
      const nativeVoice =
        window.speechSynthesis
          .getVoices()
          .find(
            (
              voice,
            ) =>
              voice.name
              === selected.name,
          );

      if (nativeVoice) {
        utterance.voice =
          nativeVoice;
      }
    }

    utterance.onstart =
      () => {
        setIsSpeaking(
          true,
        );

        setIsPaused(
          false,
        );
      };

    utterance.onend =
      () => {
        setIsSpeaking(
          false,
        );

        setIsPaused(
          false,
        );
      };

    utterance.onerror =
      () => {
        setIsSpeaking(
          false,
        );

        setIsPaused(
          false,
        );

        setError(
          "Speech playback stopped.",
        );
      };

    window.speechSynthesis
      .speak(
        utterance,
      );
  }


  function pauseSpeech() {
    if (
      !browserSupportsSpeech()
      || !isSpeaking
    ) {
      return;
    }

    window.speechSynthesis
      .pause();

    setIsPaused(
      true,
    );
  }


  function resumeSpeech() {
    if (
      !browserSupportsSpeech()
      || !isPaused
    ) {
      return;
    }

    window.speechSynthesis
      .resume();

    setIsPaused(
      false,
    );
  }


  function speakSelectedGuide() {
    if (
      selectedGuide
    ) {
      speak(
        selectedGuide.text,
      );
    }
  }


  function readPageAloud() {
    const main =
      document.querySelector(
        "main",
      );

    if (!main) {
      return;
    }

    const text =
      main.textContent
        ?.replace(
          /\s+/g,
          " ",
        )
        .trim()
      ?? "";

    speak(
      text,
    );
  }


  if (isLoading) {
    return (
      <main className="voice-page">
        <p role="status">
          Loading voice guidance...
        </p>
      </main>
    );
  }


  return (
    <main className="voice-page">
      <header className="phase3-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>


      <section className="voice-hero">
        <p className="eyebrow">
          Voice-guided support
        </p>

        <h1>
          Listen instead of reading
        </h1>

        <p>
          Use spoken guidance for focus,
          grounding, breathing and calm support.
          You can pause or stop the voice at
          any time.
        </p>
      </section>


      {privacy ? (
        <section className="voice-privacy-card">
          <div>
            <p className="eyebrow">
              Privacy
            </p>

            <h2>
              {
                privacy.enabled
                  ? "Voice guidance enabled"
                  : "Voice guidance disabled"
              }
            </h2>

            <p>
              {
                privacy.explanation
              }
            </p>
          </div>

          {!privacy.enabled ? (
            <Link
              className="button button-primary"
              href="/privacy"
            >
              Enable in privacy centre
            </Link>
          ) : null}
        </section>
      ) : null}


      {message ? (
        <p
          className="task-message task-success"
          role="status"
        >
          {message}
        </p>
      ) : null}


      {error ? (
        <p
          className="task-message task-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}


      <section className="voice-controls-card">
        <p className="eyebrow">
          Voice settings
        </p>

        <h2>
          Choose how the voice sounds
        </h2>


        {preferences ? (
          <div className="voice-settings-grid">
            <label>
              <span>
                Voice
              </span>

              <select
                onChange={(
                  event,
                ) =>
                  void updatePreference({
                    voice_name:
                      event.target.value
                      || null,
                  })
                }
                value={
                  preferences
                    .voice_name
                  ?? ""
                }
              >
                <option value="">
                  System default
                </option>

                {voices.map(
                  (
                    voice,
                  ) => (
                    <option
                      key={
                        voice.voiceURI
                      }
                      value={
                        voice.name
                      }
                    >
                      {
                        `${voice.name} (${voice.lang})`
                      }
                    </option>
                  ),
                )}
              </select>
            </label>


            <label>
              <span>
                Language
              </span>

              <select
                onChange={(
                  event,
                ) =>
                  void updatePreference({
                    language:
                      event.target.value,
                  })
                }
                value={
                  preferences.language
                }
              >
                <option value="en-GB">
                  English — United Kingdom
                </option>

                <option value="en-US">
                  English — United States
                </option>

                <option value="ta-IN">
                  Tamil
                </option>

                <option value="hi-IN">
                  Hindi
                </option>

                <option value="te-IN">
                  Telugu
                </option>

                <option value="ml-IN">
                  Malayalam
                </option>

                <option value="kn-IN">
                  Kannada
                </option>

                <option value="fr-FR">
                  French
                </option>

                <option value="de-DE">
                  German
                </option>

                <option value="es-ES">
                  Spanish
                </option>

                <option value="ar-SA">
                  Arabic
                </option>

                <option value="zh-CN">
                  Chinese
                </option>

                <option value="ja-JP">
                  Japanese
                </option>
              </select>
            </label>


            <label>
              <span>
                Speed
                {" — "}
                {
                  preferences
                    .speech_rate
                }
              </span>

              <input
                max={2}
                min={0.5}
                onChange={(
                  event,
                ) =>
                  void updatePreference({
                    speech_rate:
                      Number(
                        event.target.value,
                      ),
                  })
                }
                step={0.05}
                type="range"
                value={
                  preferences
                    .speech_rate
                }
              />
            </label>


            <label>
              <span>
                Pitch
                {" — "}
                {
                  preferences
                    .speech_pitch
                }
              </span>

              <input
                max={2}
                min={0.5}
                onChange={(
                  event,
                ) =>
                  void updatePreference({
                    speech_pitch:
                      Number(
                        event.target.value,
                      ),
                  })
                }
                step={0.05}
                type="range"
                value={
                  preferences
                    .speech_pitch
                }
              />
            </label>


            <label>
              <span>
                Volume
                {" — "}
                {
                  Math.round(
                    preferences
                      .speech_volume
                    * 100,
                  )
                }%
              </span>

              <input
                max={1}
                min={0}
                onChange={(
                  event,
                ) =>
                  void updatePreference({
                    speech_volume:
                      Number(
                        event.target.value,
                      ),
                  })
                }
                step={0.05}
                type="range"
                value={
                  preferences
                    .speech_volume
                }
              />
            </label>
          </div>
        ) : null}


        <div className="voice-playback-controls">
          <button
            className="button button-primary"
            disabled={
              !privacy?.enabled
              || isSpeaking
            }
            onClick={() =>
              speak(
                (
                  "Welcome to Aksess. "
                  + "This is a preview "
                  + "of your selected voice."
                ),
              )
            }
            type="button"
          >
            Test voice
          </button>


          <button
            className="button button-secondary"
            disabled={
              !isSpeaking
              || isPaused
            }
            onClick={
              pauseSpeech
            }
            type="button"
          >
            Pause
          </button>


          <button
            className="button button-secondary"
            disabled={
              !isPaused
            }
            onClick={
              resumeSpeech
            }
            type="button"
          >
            Resume
          </button>


          <button
            className="button button-secondary"
            disabled={
              !isSpeaking
            }
            onClick={
              stopSpeech
            }
            type="button"
          >
            Stop
          </button>


          <button
            className="button button-secondary"
            disabled={
              !privacy?.enabled
            }
            onClick={
              readPageAloud
            }
            type="button"
          >
            Read this page aloud
          </button>
        </div>
      </section>


      <section className="voice-guides-card">
        <p className="eyebrow">
          Guided support
        </p>

        <h2>
          Choose a spoken guide
        </h2>


        <div className="voice-guide-grid">
          {guides.map(
            (
              guide,
            ) => (
              <button
                className={
                  selectedGuideId
                  === guide.id
                    ? (
                        "voice-guide-card "
                        + "voice-guide-card-active"
                      )
                    : "voice-guide-card"
                }
                key={
                  guide.id
                }
                onClick={() =>
                  setSelectedGuideId(
                    guide.id,
                  )
                }
                type="button"
              >
                <span className="status-pill">
                  {
                    guide.category
                  }
                </span>

                <strong>
                  {
                    guide.title
                  }
                </strong>

                <small>
                  {
                    guide.text
                  }
                </small>
              </button>
            ),
          )}
        </div>


        {selectedGuide ? (
          <div className="voice-selected-guide">
            <h3>
              {
                selectedGuide.title
              }
            </h3>

            <p>
              {
                selectedGuide.text
              }
            </p>

            <button
              className="button button-primary"
              disabled={
                !privacy?.enabled
              }
              onClick={
                speakSelectedGuide
              }
              type="button"
            >
              Play guide
            </button>
          </div>
        ) : null}
      </section>


      <section className="voice-custom-card">
        <p className="eyebrow">
          Read custom text
        </p>

        <h2>
          Listen to your own text
        </h2>

        <textarea
          maxLength={
            5000
          }
          onChange={(
            event,
          ) =>
            setCustomText(
              event.target.value,
            )
          }
          placeholder={
            "Paste or type text you want Aksess to read aloud."
          }
          rows={
            8
          }
          value={
            customText
          }
        />

        <button
          className="button button-primary"
          disabled={
            !privacy?.enabled
            || !customText.trim()
          }
          onClick={() =>
            speak(
              customText,
            )
          }
          type="button"
        >
          Read aloud
        </button>
      </section>


      {preferences ? (
        <section className="voice-options-card">
          <p className="eyebrow">
            Voice behaviour
          </p>

          <h2>
            Optional spoken support
          </h2>


          <label className="voice-toggle">
            <span>
              <strong>
                Timer announcements
              </strong>

              <small>
                Allow spoken focus timer events.
              </small>
            </span>

            <input
              checked={
                preferences
                  .announce_timer_events
              }
              onChange={(
                event,
              ) =>
                void updatePreference({
                  announce_timer_events:
                    event.target.checked,
                })
              }
              type="checkbox"
            />
          </label>


          <label className="voice-toggle">
            <span>
              <strong>
                Guided breathing
              </strong>

              <small>
                Enable spoken breathing support.
              </small>
            </span>

            <input
              checked={
                preferences
                  .guided_breathing_enabled
              }
              onChange={(
                event,
              ) =>
                void updatePreference({
                  guided_breathing_enabled:
                    event.target.checked,
                })
              }
              type="checkbox"
            />
          </label>


          <label className="voice-toggle">
            <span>
              <strong>
                Companion voice
              </strong>

              <small>
                Allow your focus companion to use spoken encouragement.
              </small>
            </span>

            <input
              checked={
                preferences
                  .companion_voice_enabled
              }
              onChange={(
                event,
              ) =>
                void updatePreference({
                  companion_voice_enabled:
                    event.target.checked,
                })
              }
              type="checkbox"
            />
          </label>
        </section>
      ) : null}
    </main>
  );
}
