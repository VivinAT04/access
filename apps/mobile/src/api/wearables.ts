import {
  apiRequest,
} from "./client";

import type {
  WearableDashboard,
} from "../types";

export async function wearableDashboardRequest(): Promise<
  WearableDashboard
> {
  return apiRequest<
    WearableDashboard
  >(
    "/wearables/dashboard",
  );
}
