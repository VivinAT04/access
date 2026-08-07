import type {
  OfflineQueueItem,
} from "@/lib/types";


const DATABASE_NAME =
  "aksess-offline";

const DATABASE_VERSION =
  1;

const QUEUE_STORE =
  "sync-queue";


function openDatabase(): Promise<IDBDatabase> {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const request =
        indexedDB.open(
          DATABASE_NAME,
          DATABASE_VERSION,
        );

      request.onupgradeneeded =
        () => {
          const database =
            request.result;

          if (
            !database
              .objectStoreNames
              .contains(
                QUEUE_STORE,
              )
          ) {
            database.createObjectStore(
              QUEUE_STORE,
              {
                keyPath:
                  "id",
              },
            );
          }
        };

      request.onsuccess =
        () =>
          resolve(
            request.result,
          );

      request.onerror =
        () =>
          reject(
            request.error,
          );
    },
  );
}


export async function readQueue(): Promise<
  OfflineQueueItem[]
> {
  const database =
    await openDatabase();

  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const transaction =
        database.transaction(
          QUEUE_STORE,
          "readonly",
        );

      const store =
        transaction.objectStore(
          QUEUE_STORE,
        );

      const request =
        store.getAll();

      request.onsuccess =
        () => {
          const items: OfflineQueueItem[] =
            request.result;

          resolve(
            items,
          );
        };

      request.onerror =
        () =>
          reject(
            request.error,
          );
    },
  );
}


export async function saveQueueItem(
  item:
    OfflineQueueItem,
): Promise<void> {
  const database =
    await openDatabase();

  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const transaction =
        database.transaction(
          QUEUE_STORE,
          "readwrite",
        );

      const store =
        transaction.objectStore(
          QUEUE_STORE,
        );

      store.put(
        item,
      );

      transaction.oncomplete =
        () =>
          resolve();

      transaction.onerror =
        () =>
          reject(
            transaction.error,
          );
    },
  );
}


export async function deleteQueueItem(
  id:
    string,
): Promise<void> {
  const database =
    await openDatabase();

  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const transaction =
        database.transaction(
          QUEUE_STORE,
          "readwrite",
        );

      transaction
        .objectStore(
          QUEUE_STORE,
        )
        .delete(
          id,
        );

      transaction.oncomplete =
        () =>
          resolve();

      transaction.onerror =
        () =>
          reject(
            transaction.error,
          );
    },
  );
}


export async function clearQueue(): Promise<void> {
  const database =
    await openDatabase();

  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const transaction =
        database.transaction(
          QUEUE_STORE,
          "readwrite",
        );

      transaction
        .objectStore(
          QUEUE_STORE,
        )
        .clear();

      transaction.oncomplete =
        () =>
          resolve();

      transaction.onerror =
        () =>
          reject(
            transaction.error,
          );
    },
  );
}


export function createOfflineQueueItem(
  resourceType:
    string,
  operation:
    "create"
    | "update"
    | "delete",
  payload:
    Record<
      string,
      unknown
    >,
  resourceId:
    string | null = null,
): OfflineQueueItem {
  const id =
    crypto.randomUUID();

  return {
    id,
    client_operation_id:
      id,
    resource_type:
      resourceType,
    operation,
    resource_id:
      resourceId,
    payload,
    client_created_at:
      new Date()
        .toISOString(),
    retry_count:
      0,
    status:
      "pending",
  };
}
