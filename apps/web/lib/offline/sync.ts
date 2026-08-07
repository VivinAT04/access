import {
  deleteQueueItem,
  readQueue,
  saveQueueItem,
} from "@/lib/offline/database";

import type {
  OfflineQueueItem,
} from "@/lib/types";


export interface SyncResult {
  synced:
    number;

  failed:
    number;
}


export async function syncOfflineQueue(): Promise<
  SyncResult
> {
  if (
    typeof navigator
    !== "undefined"
    && !navigator.onLine
  ) {
    return {
      synced: 0,
      failed: 0,
    };
  }

  const queue =
    await readQueue();

  if (
    queue.length
    === 0
  ) {
    return {
      synced: 0,
      failed: 0,
    };
  }

  const result:
    SyncResult = {
      synced: 0,
      failed: 0,
    };

  for (
    const item
    of queue
  ) {
    const syncingItem:
      OfflineQueueItem = {
        ...item,
        status:
          "syncing",
    };

    await saveQueueItem(
      syncingItem,
    );

    try {
      const response =
        await fetch(
          "/api/offline-sync/batch",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                items: [
                  {
                    client_operation_id:
                      item
                        .client_operation_id,

                    resource_type:
                      item
                        .resource_type,

                    operation:
                      item.operation,

                    resource_id:
                      item.resource_id,

                    payload:
                      item.payload,

                    client_created_at:
                      item
                        .client_created_at,
                  },
                ],
              }),
          },
        );

      if (!response.ok) {
        throw new Error(
          "Sync request failed.",
        );
      }

      await deleteQueueItem(
        item.id,
      );

      result.synced += 1;
    } catch {
      const failedItem:
        OfflineQueueItem = {
          ...item,

          retry_count:
            item.retry_count
            + 1,

          status:
            "failed",
      };

      await saveQueueItem(
        failedItem,
      );

      result.failed += 1;
    }
  }

  return result;
}
