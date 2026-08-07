"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Logo,
} from "@/components/layout/logo";

import type {
  ExpertSupportEntry,
  SafeguardingGuide,
  SupportResource,
} from "@/lib/types";


async function readJson(
  response: Response,
): Promise<unknown> {
  const text =
    await response.text();

  if (!text) {
    return null;
  }

  return JSON.parse(
    text,
  );
}


export function SupportCentre() {
  const [
    resources,
    setResources,
  ] =
    useState<
      SupportResource[]
    >([]);

  const [
    experts,
    setExperts,
  ] =
    useState<
      ExpertSupportEntry[]
    >([]);

  const [
    safeguarding,
    setSafeguarding,
  ] =
    useState<
      SafeguardingGuide
      | null
    >(null);

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");


  const loadData =
    useCallback(
      async () => {
        setIsLoading(
          true,
        );

        setError("");

        try {
          const [
            resourcesResponse,
            expertsResponse,
            safeguardingResponse,
          ] =
            await Promise.all([
              fetch(
                "/api/support/resources",
                {
                  cache:
                    "no-store",
                },
              ),

              fetch(
                "/api/support/experts",
                {
                  cache:
                    "no-store",
                },
              ),

              fetch(
                "/api/support/safeguarding",
                {
                  cache:
                    "no-store",
                },
              ),
            ]);

          if (
            !resourcesResponse.ok
            || !expertsResponse.ok
            || !safeguardingResponse.ok
          ) {
            throw new Error(
              "Support information could not be loaded.",
            );
          }

          setResources(
            (
              await readJson(
                resourcesResponse,
              )
            ) as SupportResource[],
          );

          setExperts(
            (
              await readJson(
                expertsResponse,
              )
            ) as ExpertSupportEntry[],
          );

          setSafeguarding(
            (
              await readJson(
                safeguardingResponse,
              )
            ) as SafeguardingGuide,
          );
        } catch (
          caughtError
        ) {
          setError(
            caughtError
            instanceof Error
              ? caughtError.message
              : "Support information could not be loaded.",
          );
        } finally {
          setIsLoading(
            false,
          );
        }
      },
      [],
    );


  useEffect(() => {
    const id =
      window.setTimeout(
        () => {
          void loadData();
        },
        0,
      );

    return () =>
      window.clearTimeout(
        id,
      );
  }, [
    loadData,
  ]);


  return (
    <main className="phase3-page">
      <header className="phase3-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>

      <section className="phase3-hero">
        <p className="eyebrow">
          Wellbeing support
        </p>

        <h1>
          Resources and professional support
        </h1>

        <p>
          Explore practical wellbeing guides
          and understand which types of
          professional support may be useful.
        </p>

        <div className="phase3-safety-banner">
          <strong>
            Aksess is not a medical or
            emergency service.
          </strong>

          <span>
            If you or someone else is in
            immediate danger, contact local
            emergency services or seek urgent
            professional help.
          </span>
        </div>
      </section>

      {error ? (
        <p
          className="task-message task-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <p role="status">
          Loading support resources...
        </p>
      ) : null}

      {!isLoading ? (
        <>
          <section className="phase3-section">
            <p className="eyebrow">
              Self-support library
            </p>

            <h2>
              Mental-health resources
            </h2>

            <div className="phase3-card-grid">
              {resources.map(
                (
                  resource,
                ) => (
                  <article
                    className="phase3-card"
                    key={
                      resource.id
                    }
                  >
                    <span className="status-pill">
                      {
                        resource.category
                      }
                    </span>

                    <h3>
                      {
                        resource.title
                      }
                    </h3>

                    <p>
                      {
                        resource.summary
                      }
                    </p>

                    <ul>
                      {
                        resource.content.map(
                          (
                            item,
                          ) => (
                            <li
                              key={
                                item
                              }
                            >
                              {
                                item
                              }
                            </li>
                          ),
                        )
                      }
                    </ul>

                    {
                      resource
                        .professional_support_recommended
                        ? (
                          <small>
                            Professional support
                            may also be useful if
                            this continues or
                            worsens.
                          </small>
                        )
                        : null
                    }
                  </article>
                ),
              )}
            </div>
          </section>


          <section className="phase3-section">
            <p className="eyebrow">
              Expert directory
            </p>

            <h2>
              Finding professional support
            </h2>

            <p>
              This directory explains types of
              professional support rather than
              recommending a specific clinician.
            </p>

            <div className="phase3-card-grid">
              {experts.map(
                (
                  expert,
                ) => (
                  <article
                    className="phase3-card"
                    key={
                      expert.id
                    }
                  >
                    <span className="status-pill">
                      {
                        expert.profession
                      }
                    </span>

                    <h3>
                      {
                        expert.title
                      }
                    </h3>

                    <p>
                      {
                        expert.description
                      }
                    </p>

                    <strong>
                      May help with
                    </strong>

                    <ul>
                      {
                        expert.suitable_for.map(
                          (
                            item,
                          ) => (
                            <li
                              key={
                                item
                              }
                            >
                              {
                                item
                              }
                            </li>
                          ),
                        )
                      }
                    </ul>

                    <p>
                      <strong>
                        Access:
                      </strong>{" "}
                      {
                        expert.route
                      }
                    </p>
                  </article>
                ),
              )}
            </div>
          </section>


          {
            safeguarding
              ? (
                <section className="phase3-section phase3-safeguarding">
                  <p className="eyebrow">
                    Safeguarding
                  </p>

                  <h2>
                    {
                      safeguarding
                        .title
                    }
                  </h2>

                  <ul>
                    {
                      safeguarding
                        .principles
                        .map(
                          (
                            principle,
                          ) => (
                            <li
                              key={
                                principle
                              }
                            >
                              {
                                principle
                              }
                            </li>
                          ),
                        )
                    }
                  </ul>

                  <div className="phase3-safety-banner">
                    {
                      safeguarding
                        .urgent_message
                    }
                  </div>
                </section>
              )
              : null
          }
        </>
      ) : null}
    </main>
  );
}
