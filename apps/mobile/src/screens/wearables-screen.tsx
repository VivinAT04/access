import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Text,
} from "react-native";

import {
  wearableDashboardRequest,
} from "../api/wearables";

import {
  Screen,
} from "../components/screen";

import {
  Card,
  Message,
  SecondaryButton,
  Subtitle,
  Title,
} from "../components/ui";

import type {
  WearableDashboard,
} from "../types";

export function WearablesScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const [
    dashboard,
    setDashboard,
  ] =
    useState<
      WearableDashboard
      | null
    >(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  const load =
    useCallback(
      async () => {
        try {
          const data =
            await wearableDashboardRequest();

          setDashboard(
            data,
          );
        } catch (
          caughtError
        ) {
          setError(
            caughtError
            instanceof Error
              ? caughtError.message
              : "Wearable information could not be loaded.",
          );
        } finally {
          setLoading(false);
        }
      },
      [],
    );

  useEffect(() => {
    const timeoutId =
      setTimeout(() => {
        void load();
      }, 0);

    return () => {
      clearTimeout(
        timeoutId,
      );
    };
  }, [
    load,
  ]);

  return (
    <Screen>
      <SecondaryButton
        label="Back"
        onPress={
          onBack
        }
      />

      <Title>
        Wearables
      </Title>

      <Subtitle>
        Heart-rate signals are informational and
        are not a medical diagnosis.
      </Subtitle>

      {loading ? (
        <ActivityIndicator />
      ) : null}

      {error ? (
        <Message error>
          {error}
        </Message>
      ) : null}

      {dashboard ? (
        <>
          <Card>
            <Text>
              Wearable consent:{" "}
              {
                dashboard
                  .privacy_enabled
                  ? "Enabled"
                  : "Disabled"
              }
            </Text>
          </Card>

          <Card>
            <Text>
              Baseline BPM:{" "}
              {
                dashboard
                  .baseline
                  .baseline_bpm
                ?? "Not ready"
              }
            </Text>

            <Text>
              Samples:{" "}
              {
                dashboard
                  .baseline
                  .sample_count
              }
            </Text>
          </Card>

          <Card>
            <Text>
              Recent elevated signals:{" "}
              {
                dashboard
                  .recent_signals
                  .length
              }
            </Text>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}
