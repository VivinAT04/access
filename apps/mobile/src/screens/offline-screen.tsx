import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Text,
} from "react-native";

import {
  Screen,
} from "../components/screen";

import {
  Card,
  Input,
  Message,
  PrimaryButton,
  SecondaryButton,
  Subtitle,
  Title,
} from "../components/ui";

import {
  clearLocalTaskDrafts,
  LocalTaskDraft,
  readLocalTaskDrafts,
  saveLocalTaskDraft,
} from "../storage/local-storage";

export function OfflineScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const [
    drafts,
    setDrafts,
  ] =
    useState<
      LocalTaskDraft[]
    >([]);

  const [
    title,
    setTitle,
  ] =
    useState("");

  const [
    message,
    setMessage,
  ] =
    useState("");

  const load =
    useCallback(
      async () => {
        setDrafts(
          await readLocalTaskDrafts(),
        );
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

  async function save() {
    const cleaned =
      title.trim();

    if (!cleaned) {
      return;
    }

    await saveLocalTaskDraft({
      id:
        `${Date.now()}`,

      title:
        cleaned,

      created_at:
        new Date()
          .toISOString(),
    });

    setTitle("");

    setMessage(
      "Saved locally on this device.",
    );

    await load();
  }

  async function clear() {
    await clearLocalTaskDrafts();

    setMessage(
      "Local drafts cleared.",
    );

    await load();
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
        Offline mode
      </Title>

      <Subtitle>
        Keep useful task drafts locally when
        your connection is unavailable.
      </Subtitle>

      <Input
        onChangeText={
          setTitle
        }
        placeholder="Offline task draft"
        value={
          title
        }
      />

      <PrimaryButton
        label="Save locally"
        onPress={() =>
          void save()
        }
      />

      {message ? (
        <Message>
          {message}
        </Message>
      ) : null}

      {drafts.length === 0 ? (
        <Card>
          <Text>
            No local drafts.
          </Text>
        </Card>
      ) : null}

      {drafts.map(
        (
          draft,
        ) => (
          <Card
            key={
              draft.id
            }
          >
            <Text>
              {
                draft.title
              }
            </Text>
          </Card>
        ),
      )}

      <SecondaryButton
        label="Clear local drafts"
        onPress={() =>
          void clear()
        }
      />
    </Screen>
  );
}
