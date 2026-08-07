import {
  useEffect,
  useState,
} from "react";

import {
  StyleSheet,
  Text,
} from "react-native";

import {
  Screen,
} from "../components/screen";

import {
  Card,
  PrimaryButton,
  SecondaryButton,
  Subtitle,
  Title,
} from "../components/ui";

import {
  colors,
} from "../theme/colors";

const START_SECONDS =
  25 * 60;

function formatTime(
  seconds: number,
): string {
  const minutes =
    Math.floor(
      seconds / 60,
    );

  const remaining =
    seconds % 60;

  return (
    `${String(minutes).padStart(
      2,
      "0",
    )}:${String(remaining).padStart(
      2,
      "0",
    )}`
  );
}

export function FocusScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const [
    seconds,
    setSeconds,
  ] =
    useState(
      START_SECONDS,
    );

  const [
    running,
    setRunning,
  ] =
    useState(false);

  useEffect(() => {
    if (
      !running
      || seconds <= 0
    ) {
      return;
    }

    const interval =
      setInterval(
        () => {
          setSeconds(
            (
              current,
            ) =>
              Math.max(
                current - 1,
                0,
              ),
          );
        },
        1000,
      );

    return () => {
      clearInterval(
        interval,
      );
    };
  }, [
    running,
    seconds,
  ]);

  function reset() {
    setRunning(false);

    setSeconds(
      START_SECONDS,
    );
  }

  return (
    <Screen>
      <SecondaryButton
        label="Back"
        onPress={
          onBack
        }
      />

      <Title>
        Focus
      </Title>

      <Subtitle>
        One small step at a time.
      </Subtitle>

      <Card>
        <Text
          style={
            styles.timer
          }
        >
          {
            formatTime(
              seconds,
            )
          }
        </Text>

        <PrimaryButton
          label={
            running
              ? "Pause"
              : "Start focus"
          }
          onPress={() =>
            setRunning(
              (
                current,
              ) =>
                !current,
            )
          }
        />

        <SecondaryButton
          label="Reset"
          onPress={
            reset
          }
        />
      </Card>

      <Card>
        <Text
          style={
            styles.tip
          }
        >
          Your companion is here with you. Short
          sessions count too.
        </Text>
      </Card>
    </Screen>
  );
}

const styles =
  StyleSheet.create({
    timer: {
      color:
        colors.text,

      fontSize:
        54,

      fontWeight:
        "900",

      textAlign:
        "center",
    },

    tip: {
      color:
        colors.muted,

      fontSize:
        16,

      lineHeight:
        23,
    },
  });
