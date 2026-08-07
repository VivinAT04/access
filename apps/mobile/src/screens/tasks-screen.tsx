import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

import {
  completeTaskRequest,
  createTaskRequest,
  listTasksRequest,
} from "../api/tasks";

import {
  Screen,
} from "../components/screen";

import {
  Card,
  Input,
  Message,
  PrimaryButton,
  SecondaryButton,
  Title,
} from "../components/ui";

import {
  colors,
} from "../theme/colors";

import type {
  Task,
} from "../types";

export function TasksScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const [
    tasks,
    setTasks,
  ] =
    useState<Task[]>([]);

  const [
    title,
    setTitle,
  ] =
    useState("");

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

  const loadTasks =
    useCallback(
      async () => {
        try {
          const result =
            await listTasksRequest();

          setTasks(
            result,
          );
        } catch (
          caughtError
        ) {
          setError(
            caughtError
            instanceof Error
              ? caughtError.message
              : "Tasks could not be loaded.",
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
        void loadTasks();
      }, 0);

    return () => {
      clearTimeout(
        timeoutId,
      );
    };
  }, [
    loadTasks,
  ]);

  async function addTask() {
    const cleaned =
      title.trim();

    if (!cleaned) {
      return;
    }

    try {
      await createTaskRequest(
        cleaned,
      );

      setTitle("");

      await loadTasks();
    } catch (
      caughtError
    ) {
      setError(
        caughtError
        instanceof Error
          ? caughtError.message
          : "Task could not be created.",
      );
    }
  }

  async function toggle(
    task: Task,
  ) {
    const completed =
      !(
        task.is_completed
        || task.status
        === "completed"
      );

    try {
      await completeTaskRequest(
        task.id,
        completed,
      );

      await loadTasks();
    } catch (
      caughtError
    ) {
      setError(
        caughtError
        instanceof Error
          ? caughtError.message
          : "Task could not be updated.",
      );
    }
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
        Tasks
      </Title>

      <Input
        onChangeText={
          setTitle
        }
        placeholder="What needs doing?"
        value={
          title
        }
      />

      <PrimaryButton
        label="Add task"
        onPress={() =>
          void addTask()
        }
      />

      {error ? (
        <Message error>
          {error}
        </Message>
      ) : null}

      {loading ? (
        <ActivityIndicator />
      ) : null}

      {!loading
      && tasks.length === 0 ? (
        <Card>
          <Text>
            No tasks yet.
          </Text>
        </Card>
      ) : null}

      {tasks.map(
        (
          task,
        ) => {
          const completed =
            Boolean(
              task.is_completed
              || task.status
              === "completed",
            );

          return (
            <Pressable
              key={
                task.id
              }
              onPress={() =>
                void toggle(
                  task,
                )
              }
            >
              <Card>
                <Text
                  style={[
                    styles.task,
                    completed
                      ? styles.completed
                      : null,
                  ]}
                >
                  {
                    completed
                      ? "✓ "
                      : ""
                  }
                  {
                    task.title
                  }
                </Text>
              </Card>
            </Pressable>
          );
        },
      )}
    </Screen>
  );
}

const styles =
  StyleSheet.create({
    task: {
      color:
        colors.text,

      fontSize:
        17,

      fontWeight:
        "700",
    },

    completed: {
      color:
        colors.muted,

      textDecorationLine:
        "line-through",
    },
  });
