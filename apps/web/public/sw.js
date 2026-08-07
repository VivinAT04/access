const CACHE_NAME =
  "aksess-shell-v1";

const SHELL_URLS = [
  "/",
  "/login",
  "/dashboard",
  "/offline",
];


self.addEventListener(
  "install",
  (event) => {
    event.waitUntil(
      caches
        .open(
          CACHE_NAME,
        )
        .then(
          (cache) =>
            cache.addAll(
              SHELL_URLS,
            ),
        ),
    );

    self.skipWaiting();
  },
);


self.addEventListener(
  "activate",
  (event) => {
    event.waitUntil(
      self.clients.claim(),
    );
  },
);


self.addEventListener(
  "fetch",
  (event) => {
    if (
      event.request.method
      !== "GET"
    ) {
      return;
    }

    const url =
      new URL(
        event.request.url,
      );

    if (
      url.origin
      !== self.location.origin
    ) {
      return;
    }

    event.respondWith(
      fetch(
        event.request,
      )
        .then(
          (response) => {
            const copy =
              response.clone();

            caches
              .open(
                CACHE_NAME,
              )
              .then(
                (cache) => {
                  void cache.put(
                    event.request,
                    copy,
                  );
                },
              );

            return response;
          },
        )
        .catch(
          async () => {
            const cached =
              await caches.match(
                event.request,
              );

            if (cached) {
              return cached;
            }

            const fallback =
              await caches.match(
                "/offline",
              );

            if (fallback) {
              return fallback;
            }

            return new Response(
              "Offline",
              {
                status:
                  503,

                headers: {
                  "Content-Type":
                    "text/plain",
                },
              },
            );
          },
        ),
    );
  },
);
