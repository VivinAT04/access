import AsyncStorage from "@react-native-async-storage/async-storage";

const OFFLINE_TASK_KEY =
  "aksess_mobile_offline_tasks";

export interface LocalTaskDraft {
  id: string;
  title: string;
  created_at: string;
}

export async function readLocalTaskDrafts(): Promise<
  LocalTaskDraft[]
> {
  const raw =
    await AsyncStorage.getItem(
      OFFLINE_TASK_KEY,
    );

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown =
      JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as LocalTaskDraft[];
  } catch {
    return [];
  }
}

export async function saveLocalTaskDraft(
  draft: LocalTaskDraft,
): Promise<void> {
  const current =
    await readLocalTaskDrafts();

  await AsyncStorage.setItem(
    OFFLINE_TASK_KEY,
    JSON.stringify([
      ...current,
      draft,
    ]),
  );
}

export async function clearLocalTaskDrafts(): Promise<void> {
  await AsyncStorage.removeItem(
    OFFLINE_TASK_KEY,
  );
}
