"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  AnxietyExerciseType,
  AnxietySession,
  AnxietySummary,
} from "@/lib/types";


interface BreathingPhase {
  label: string;
  seconds: number;
  instruction: string;
}


interface BreathingExercise {
  id:
    | "box_breathing"
    | "four_seven_eight";
  name: string;
  description: string;
  phases: BreathingPhase[];
}


type SoundType =
  | "rain"
  | "ocean"
  | "forest"
  | "white_noise";


const exercises: BreathingExercise[] = [
  {
    id: "box_breathing",
    name: "Box breathing",
    description:
      "A balanced 4–4–4–4 rhythm for steadiness and focus.",
    phases: [
      {
        label: "Inhale",
        seconds: 4,
        instruction:
          "Breathe in gently through your nose.",
      },
      {
        label: "Hold",
        seconds: 4,
        instruction:
          "Hold without straining.",
      },
      {
        label: "Exhale",
        seconds: 4,
        instruction:
          "Breathe out slowly.",
      },
      {
        label: "Hold",
        seconds: 4,
        instruction:
          "Rest before the next breath.",
      },
    ],
  },
  {
    id: "four_seven_eight",
    name: "4-7-8 breathing",
    description:
      "A slower breathing pattern for settling the body.",
    phases: [
      {
        label: "Inhale",
        seconds: 4,
        instruction:
          "Breathe in gently through your nose.",
      },
      {
        label: "Hold",
        seconds: 7,
        instruction:
          "Hold softly and relax your shoulders.",
      },
      {
        label: "Exhale",
        seconds: 8,
        instruction:
          "Release the breath slowly.",
      },
    ],
  },
];


const groundingSteps = [
  {
    count: 5,
    sense: "see",
    prompt:
      "Name five things you can see.",
  },
  {
    count: 4,
    sense: "touch",
    prompt:
      "Notice four things you can touch or feel.",
  },
  {
    count: 3,
    sense: "hear",
    prompt:
      "Listen for three things you can hear.",
  },
  {
    count: 2,
    sense: "smell",
    prompt:
      "Notice two things you can smell.",
  },
  {
    count: 1,
    sense: "taste",
    prompt:
      "Notice one thing you can taste.",
  },
];


const emptySummary: AnxietySummary = {
  sessions_today: 0,
  minutes_today: 0,
  total_sessions: 0,
  total_minutes: 0,
  favourite_exercise: null,
};


function formatDuration(
  seconds: number,
): string {
  const minutes = Math.floor(
    seconds / 60
  );

  const remainingSeconds =
    seconds % 60;

  return `${minutes}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}


function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    new Date(value)
  );
}


function exerciseName(
  exercise: string | null,
): string {
  const labels: Record<
    string,
    string
  > = {
    box_breathing:
      "Box breathing",
    four_seven_eight:
      "4-7-8 breathing",
    grounding_54321:
      "5-4-3-2-1 grounding",
    quick_calm:
      "Quick calm",
  };

  if (!exercise) {
    return "None yet";
  }

  return (
    labels[exercise] ??
    exercise.replaceAll("_", " ")
  );
}


async function readJson(
  response: Response,
): Promise<unknown> {
  const text =
    await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message:
        "The server returned an invalid response.",
    };
  }
}


function getMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data &&
    typeof data.detail === "string"
  ) {
    return data.detail;
  }

  return fallback;
}


export function AnxietyTools() {
  const [
    selectedExerciseId,
    setSelectedExerciseId,
  ] = useState<
    | "box_breathing"
    | "four_seven_eight"
  >("box_breathing");

  const [phaseIndex, setPhaseIndex] =
    useState(0);

  const [
    phaseSecondsRemaining,
    setPhaseSecondsRemaining,
  ] = useState(4);

  const [cycles, setCycles] =
    useState(4);

  const [completedCycles, setCompletedCycles] =
    useState(0);

  const [
    isBreathingActive,
    setIsBreathingActive,
  ] = useState(false);

  const [
    breathingStartedAt,
    setBreathingStartedAt,
  ] = useState<number | null>(
    null
  );

  const [
    groundingValues,
    setGroundingValues,
  ] = useState<string[]>(
    Array(5).fill("")
  );

  const [
    groundingStartedAt,
    setGroundingStartedAt,
  ] = useState<number | null>(
    null
  );

  const [activeSound, setActiveSound] =
    useState<SoundType | null>(
      null
    );

  const [summary, setSummary] =
    useState<AnxietySummary>(
      emptySummary
    );

  const [sessions, setSessions] =
    useState<AnxietySession[]>([]);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const audioContextRef =
    useRef<AudioContext | null>(
      null
    );

  const audioNodesRef =
    useRef<AudioNode[]>([]);

  const selectedExercise =
    exercises.find(
      (exercise) =>
        exercise.id ===
        selectedExerciseId
    ) ?? exercises[0];

  const currentPhase =
    selectedExercise.phases[
      phaseIndex
    ];

  const totalCycleSeconds =
    selectedExercise.phases.reduce(
      (total, phase) =>
        total + phase.seconds,
      0,
    );

  const completedGroundingSteps =
    groundingValues.filter(
      (value) =>
        value.trim().length > 0
    ).length;


  const loadData = useCallback(
    async () => {
      setIsLoading(true);
      setError("");

      try {
        const [
          sessionsResponse,
          summaryResponse,
        ] = await Promise.all([
          fetch(
            "/api/anxiety-sessions",
            {
              cache: "no-store",
            },
          ),
          fetch(
            "/api/anxiety-sessions/summary",
            {
              cache: "no-store",
            },
          ),
        ]);

        const sessionsData =
          await readJson(
            sessionsResponse
          );

        const summaryData =
          await readJson(
            summaryResponse
          );

        if (!sessionsResponse.ok) {
          throw new Error(
            getMessage(
              sessionsData,
              "Calm-session history could not be loaded.",
            ),
          );
        }

        if (!summaryResponse.ok) {
          throw new Error(
            getMessage(
              summaryData,
              "Calm-session statistics could not be loaded.",
            ),
          );
        }

        setSessions(
          sessionsData as AnxietySession[]
        );

        setSummary(
          summaryData as AnxietySummary
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Calm-session data could not be loaded.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );


  useEffect(() => {
    const timeoutId =
      window.setTimeout(() => {
        void loadData();
      }, 0);

    return () => {
      window.clearTimeout(
        timeoutId
      );
    };
  }, [loadData]);


  useEffect(() => {
    if (!isBreathingActive) {
      return;
    }

    const intervalId =
      window.setInterval(() => {
        setPhaseSecondsRemaining(
          (currentSeconds) => {
            if (
              currentSeconds > 1
            ) {
              return (
                currentSeconds - 1
              );
            }

            const nextPhaseIndex =
              (
                phaseIndex + 1
              ) %
              selectedExercise
                .phases.length;

            if (
              nextPhaseIndex === 0
            ) {
              const nextCompletedCycles =
                completedCycles + 1;

              if (
                nextCompletedCycles >=
                cycles
              ) {
                window.clearInterval(
                  intervalId
                );

                setIsBreathingActive(
                  false
                );

                setCompletedCycles(
                  cycles
                );

                const durationSeconds =
                  totalCycleSeconds *
                  cycles;

                void saveSession(
                  selectedExercise.id,
                  durationSeconds,
                );

                return currentPhase.seconds;
              }

              setCompletedCycles(
                nextCompletedCycles
              );
            }

            setPhaseIndex(
              nextPhaseIndex
            );

            return (
              selectedExercise
                .phases[
                  nextPhaseIndex
                ].seconds
            );
          },
        );
      }, 1000);

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [
    completedCycles,
    currentPhase.seconds,
    cycles,
    isBreathingActive,
    phaseIndex,
    selectedExercise,
    totalCycleSeconds,
  ]);


  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);


  async function saveSession(
    exerciseType:
      AnxietyExerciseType,
    durationSeconds: number,
  ) {
    setError("");

    try {
      const response = await fetch(
        "/api/anxiety-sessions",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            exercise_type:
              exerciseType,
            duration_seconds:
              durationSeconds,
            completed: true,
          }),
        },
      );

      const data =
        await readJson(response);

      if (!response.ok) {
        throw new Error(
          getMessage(
            data,
            "The calm session could not be saved.",
          ),
        );
      }

      setMessage(
        "Calm session completed."
      );

      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The calm session could not be saved.",
      );
    }
  }


  function chooseExercise(
    exerciseId:
      | "box_breathing"
      | "four_seven_eight",
  ) {
    if (isBreathingActive) {
      return;
    }

    const exercise =
      exercises.find(
        (item) =>
          item.id === exerciseId
      );

    if (!exercise) {
      return;
    }

    setSelectedExerciseId(
      exerciseId
    );

    setPhaseIndex(0);

    setPhaseSecondsRemaining(
      exercise.phases[0].seconds
    );

    setCompletedCycles(0);
    setMessage("");
    setError("");
  }


  function startBreathing() {
    setPhaseIndex(0);

    setPhaseSecondsRemaining(
      selectedExercise
        .phases[0].seconds
    );

    setCompletedCycles(0);

    setBreathingStartedAt(
      Date.now()
    );

    setMessage("");
    setError("");

    setIsBreathingActive(
      true
    );
  }


  function stopBreathing() {
    setIsBreathingActive(
      false
    );

    setPhaseIndex(0);

    setPhaseSecondsRemaining(
      selectedExercise
        .phases[0].seconds
    );

    setCompletedCycles(0);

    setBreathingStartedAt(
      null
    );
  }


  function updateGrounding(
    index: number,
    value: string,
  ) {
    setGroundingValues(
      (currentValues) =>
        currentValues.map(
          (
            currentValue,
            currentIndex,
          ) =>
            currentIndex === index
              ? value
              : currentValue,
        ),
    );

    if (
      groundingStartedAt ===
      null
    ) {
      setGroundingStartedAt(
        Date.now()
      );
    }
  }


  async function completeGrounding() {
    if (
      completedGroundingSteps <
      groundingSteps.length
    ) {
      setError(
        "Complete each grounding step before finishing."
      );

      return;
    }

    const durationSeconds =
      groundingStartedAt
        ? Math.max(
            1,
            Math.round(
              (
                Date.now() -
                groundingStartedAt
              ) /
                1000,
            ),
          )
        : 60;

    await saveSession(
      "grounding_54321",
      durationSeconds,
    );

    setGroundingValues(
      Array(5).fill("")
    );

    setGroundingStartedAt(
      null
    );
  }


  function stopSound() {
    for (
      const node of
      audioNodesRef.current
    ) {
      try {
        node.disconnect();
      } catch {
        // The node may already be disconnected.
      }
    }

    audioNodesRef.current = [];

    if (
      audioContextRef.current
    ) {
      void audioContextRef.current.close();

      audioContextRef.current =
        null;
    }

    setActiveSound(null);
  }


  function startSound(
    sound: SoundType,
  ) {
    stopSound();

    const AudioContextClass =
      window.AudioContext;

    const audioContext =
      new AudioContextClass();

    audioContextRef.current =
      audioContext;

    const gain =
      audioContext.createGain();

    gain.gain.value = 0.08;

    gain.connect(
      audioContext.destination
    );

    const bufferLength =
      audioContext.sampleRate *
      2;

    const buffer =
      audioContext.createBuffer(
        1,
        bufferLength,
        audioContext.sampleRate,
      );

    const data =
      buffer.getChannelData(0);

    for (
      let index = 0;
      index < bufferLength;
      index += 1
    ) {
      const noise =
        Math.random() * 2 - 1;

      if (
        sound === "rain" ||
        sound === "white_noise"
      ) {
        data[index] = noise;
      } else if (
        sound === "ocean"
      ) {
        const wave =
          Math.sin(
            (
              index /
              audioContext
                .sampleRate
            ) *
              Math.PI *
              2 *
              0.15,
          );

        data[index] =
          noise *
          (
            0.2 +
            Math.abs(wave) *
              0.8
          );
      } else {
        data[index] =
          noise * 0.35;
      }
    }

    const source =
      audioContext.createBufferSource();

    source.buffer = buffer;
    source.loop = true;

    if (sound === "forest") {
      const filter =
        audioContext.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.value =
        1200;

      source.connect(filter);
      filter.connect(gain);

      audioNodesRef.current = [
        source,
        filter,
        gain,
      ];
    } else if (
      sound === "ocean"
    ) {
      const filter =
        audioContext.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.value =
        800;

      source.connect(filter);
      filter.connect(gain);

      audioNodesRef.current = [
        source,
        filter,
        gain,
      ];
    } else {
      source.connect(gain);

      audioNodesRef.current = [
        source,
        gain,
      ];
    }

    source.start();

    setActiveSound(sound);
  }


  async function deleteSession(
    session: AnxietySession,
  ) {
    const confirmed =
      window.confirm(
        `Delete this ${exerciseName(
          session.exercise_type,
        )} session?`,
      );

    if (!confirmed) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/anxiety-sessions/${session.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data =
          await readJson(response);

        throw new Error(
          getMessage(
            data,
            "The calm session could not be deleted.",
          ),
        );
      }

      setMessage(
        "Calm session deleted."
      );

      await loadData();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The calm session could not be deleted.",
      );
    }
  }


  const breathingCircleStyle = {
    "--breathing-duration":
      `${currentPhase.seconds}s`,
  } as CSSProperties;


  return (
    <>
      <section className="anxiety-summary-grid">
        <article>
          <span>
            Sessions today
          </span>

          <strong>
            {summary.sessions_today}
          </strong>
        </article>

        <article>
          <span>
            Minutes today
          </span>

          <strong>
            {summary.minutes_today}
          </strong>
        </article>

        <article>
          <span>
            All sessions
          </span>

          <strong>
            {summary.total_sessions}
          </strong>
        </article>

        <article>
          <span>
            Favourite exercise
          </span>

          <strong className="anxiety-favourite">
            {exerciseName(
              summary.favourite_exercise
            )}
          </strong>
        </article>
      </section>

      <section className="anxiety-breathing-card">
        <div className="anxiety-card-heading">
          <div>
            <p className="eyebrow">
              Guided breathing
            </p>

            <h2>
              Follow one gentle breath
              at a time
            </h2>
          </div>

          <a
            className="button button-secondary"
            href="/calm"
          >
            Open Quick Calm
          </a>
        </div>

        <div className="anxiety-exercise-selector">
          {exercises.map(
            (exercise) => (
              <button
                aria-pressed={
                  selectedExerciseId ===
                  exercise.id
                }
                className={
                  selectedExerciseId ===
                  exercise.id
                    ? "anxiety-exercise-option anxiety-exercise-active"
                    : "anxiety-exercise-option"
                }
                disabled={
                  isBreathingActive
                }
                key={exercise.id}
                onClick={() =>
                  chooseExercise(
                    exercise.id
                  )
                }
                type="button"
              >
                <strong>
                  {exercise.name}
                </strong>

                <span>
                  {
                    exercise.description
                  }
                </span>
              </button>
            ),
          )}
        </div>

        <div className="anxiety-breathing-layout">
          <div className="breathing-guide">
            <div
              aria-label={`${currentPhase.label}. ${phaseSecondsRemaining} seconds remaining.`}
              className={`breathing-circle breathing-${currentPhase.label.toLowerCase()}`}
              style={
                breathingCircleStyle
              }
            >
              <div>
                <strong>
                  {currentPhase.label}
                </strong>

                <span>
                  {
                    phaseSecondsRemaining
                  }
                </span>
              </div>
            </div>

            <h3>
              {
                currentPhase.instruction
              }
            </h3>

            <p>
              Cycle{" "}
              {Math.min(
                completedCycles + 1,
                cycles,
              )}{" "}
              of {cycles}
            </p>
          </div>

          <div className="breathing-controls-panel">
            <label>
              <span>
                Number of cycles
              </span>

              <select
                disabled={
                  isBreathingActive
                }
                onChange={(event) =>
                  setCycles(
                    Number(
                      event.target.value
                    )
                  )
                }
                value={cycles}
              >
                <option value={2}>
                  2 cycles
                </option>

                <option value={4}>
                  4 cycles
                </option>

                <option value={6}>
                  6 cycles
                </option>

                <option value={8}>
                  8 cycles
                </option>
              </select>
            </label>

            <div className="breathing-pattern-list">
              {selectedExercise.phases.map(
                (
                  phase,
                  index,
                ) => (
                  <div
                    className={
                      index ===
                      phaseIndex
                        ? "breathing-pattern-active"
                        : ""
                    }
                    key={`${phase.label}-${index}`}
                  >
                    <span>
                      {index + 1}
                    </span>

                    <strong>
                      {phase.label}
                    </strong>

                    <small>
                      {
                        phase.seconds
                      }
                      s
                    </small>
                  </div>
                ),
              )}
            </div>

            {!isBreathingActive ? (
              <button
                className="button button-primary"
                onClick={
                  startBreathing
                }
                type="button"
              >
                Start breathing
              </button>
            ) : (
              <button
                className="button button-secondary"
                onClick={
                  stopBreathing
                }
                type="button"
              >
                Stop session
              </button>
            )}

            {breathingStartedAt ? (
              <p className="breathing-active-note">
                You can stop whenever you
                need to. There is no need
                to finish every cycle.
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="grounding-card">
        <div className="anxiety-card-heading">
          <div>
            <p className="eyebrow">
              5-4-3-2-1 grounding
            </p>

            <h2>
              Return to what is around you
            </h2>

            <p>
              Type one short response for
              each sense. The answers are
              not stored.
            </p>
          </div>

          <div className="grounding-progress">
            <strong>
              {
                completedGroundingSteps
              }
              /5
            </strong>

            <span>
              steps complete
            </span>
          </div>
        </div>

        <div className="grounding-steps">
          {groundingSteps.map(
            (step, index) => (
              <label
                className="grounding-step"
                key={step.sense}
              >
                <span className="grounding-number">
                  {step.count}
                </span>

                <span className="grounding-prompt">
                  <strong>
                    {step.prompt}
                  </strong>

                  <small>
                    Use a few words. There
                    is no perfect answer.
                  </small>
                </span>

                <input
                  onChange={(event) =>
                    updateGrounding(
                      index,
                      event.target.value
                    )
                  }
                  placeholder={`Something you can ${step.sense}`}
                  value={
                    groundingValues[
                      index
                    ]
                  }
                />
              </label>
            ),
          )}
        </div>

        <button
          className="button button-primary grounding-complete-button"
          onClick={() =>
            void completeGrounding()
          }
          type="button"
        >
          Complete grounding exercise
        </button>
      </section>

      <section className="soundscape-card">
        <div>
          <p className="eyebrow">
            Calming sounds
          </p>

          <h2>
            Choose a steady background sound
          </h2>

          <p>
            These sounds are generated in
            your browser. Use a comfortable
            volume.
          </p>
        </div>

        <div className="soundscape-grid">
          {[
            {
              id: "rain" as const,
              icon: "☂",
              title: "Rain",
              description:
                "Steady rainfall",
            },
            {
              id: "ocean" as const,
              icon: "≈",
              title: "Ocean",
              description:
                "Slow rolling waves",
            },
            {
              id: "forest" as const,
              icon: "♧",
              title: "Forest",
              description:
                "Soft filtered nature noise",
            },
            {
              id: "white_noise" as const,
              icon: "◌",
              title: "White noise",
              description:
                "Consistent neutral sound",
            },
          ].map((sound) => (
            <button
              aria-pressed={
                activeSound ===
                sound.id
              }
              className={
                activeSound ===
                sound.id
                  ? "soundscape-option soundscape-active"
                  : "soundscape-option"
              }
              key={sound.id}
              onClick={() => {
                if (
                  activeSound ===
                  sound.id
                ) {
                  stopSound();
                } else {
                  startSound(
                    sound.id
                  );
                }
              }}
              type="button"
            >
              <span
                aria-hidden="true"
                className="soundscape-icon"
              >
                {sound.icon}
              </span>

              <strong>
                {sound.title}
              </strong>

              <small>
                {sound.description}
              </small>

              <span className="soundscape-action">
                {activeSound ===
                sound.id
                  ? "Stop"
                  : "Play"}
              </span>
            </button>
          ))}
        </div>
      </section>

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

      <section className="anxiety-history-card">
        <div>
          <p className="eyebrow">
            Calm-session history
          </p>

          <h2>
            Recent exercises
          </h2>
        </div>

        {isLoading ? (
          <p>
            Loading sessions...
          </p>
        ) : null}

        {!isLoading &&
        sessions.length === 0 ? (
          <div className="anxiety-empty-state">
            <h3>
              No calm sessions yet
            </h3>

            <p>
              Complete a breathing or
              grounding exercise and it
              will appear here.
            </p>
          </div>
        ) : null}

        {sessions.length > 0 ? (
          <div className="anxiety-history-list">
            {sessions.map(
              (session) => (
                <article
                  key={session.id}
                >
                  <div>
                    <h3>
                      {exerciseName(
                        session.exercise_type
                      )}
                    </h3>

                    <p>
                      {formatDuration(
                        session.duration_seconds
                      )}
                    </p>

                    <small>
                      {formatDate(
                        session.created_at
                      )}
                    </small>
                  </div>

                  <button
                    onClick={() =>
                      void deleteSession(
                        session
                      )
                    }
                    type="button"
                  >
                    Delete
                  </button>
                </article>
              ),
            )}
          </div>
        ) : null}
      </section>
    </>
  );
}
