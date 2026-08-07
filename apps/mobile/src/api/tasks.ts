import {
  apiRequest,
} from "./client";

import type {
  Task,
} from "../types";

export async function listTasksRequest(): Promise<Task[]> {
  return apiRequest<Task[]>(
    "/tasks",
  );
}

export async function createTaskRequest(
  title: string,
): Promise<Task> {
  return apiRequest<Task>(
    "/tasks",
    {
      method: "POST",

      body:
        JSON.stringify({
          title,
          description: null,
          priority: "medium",
          status: "pending",
          due_date: null,
        }),
    },
  );
}

export async function completeTaskRequest(
  taskId: string,
  completed: boolean,
): Promise<Task> {
  return apiRequest<Task>(
    (
      `/tasks/${taskId}`
      + `/complete?completed=${completed}`
    ),
    {
      method: "PATCH",
    },
  );
}
