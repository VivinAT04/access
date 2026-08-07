"use client";

import Link from "next/link";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Logo,
} from "@/components/layout/logo";

import type {
  CommunityCategory,
  CommunityGuidelines,
  CommunityModerationItem,
  CommunityPost,
} from "@/lib/types";


const categories:
  CommunityCategory[] = [
    "general",
    "focus",
    "study",
    "work",
    "wellbeing",
    "sensory",
    "routines",
    "wins",
  ];


interface PostForm {
  title: string;
  body: string;
  category:
    CommunityCategory;
  anonymous: boolean;
}


const emptyPost:
  PostForm = {
    title: "",
    body: "",
    category:
      "general",
    anonymous:
      false,
  };


function formatDate(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle:
        "medium",
      timeStyle:
        "short",
    },
  ).format(
    new Date(
      value,
    ),
  );
}


async function messageFromResponse(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const data: {
      message?: string;
      detail?: string;
    } =
      await response.json();

    return (
      data.message
      ?? data.detail
      ?? fallback
    );
  } catch {
    return fallback;
  }
}


export function CommunityCentre() {
  const [
    posts,
    setPosts,
  ] =
    useState<
      CommunityPost[]
    >([]);

  const [
    guidelines,
    setGuidelines,
  ] =
    useState<
      CommunityGuidelines
      | null
    >(null);

  const [
    moderator,
    setModerator,
  ] =
    useState(false);

  const [
    moderationQueue,
    setModerationQueue,
  ] =
    useState<
      CommunityModerationItem[]
    >([]);

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<
      "all"
      | CommunityCategory
    >("all");

  const [
    postForm,
    setPostForm,
  ] =
    useState<
      PostForm
    >(
      emptyPost,
    );

  const [
    commentDrafts,
    setCommentDrafts,
  ] =
    useState<
      Record<
        string,
        string
      >
    >({});

  const [
    commentAnonymous,
    setCommentAnonymous,
  ] =
    useState<
      Record<
        string,
        boolean
      >
    >({});

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    isSaving,
    setIsSaving,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");


  const loadCommunity =
    useCallback(
      async () => {
        setIsLoading(
          true,
        );

        setError("");

        try {
          const query =
            selectedCategory
            === "all"
              ? ""
              : (
                  `?category=${
                    encodeURIComponent(
                      selectedCategory,
                    )
                  }`
                );

          const [
            postsResponse,
            guidelinesResponse,
            moderatorResponse,
          ] =
            await Promise.all([
              fetch(
                (
                  "/api/community/posts"
                  + query
                ),
                {
                  cache:
                    "no-store",
                },
              ),

              fetch(
                "/api/community/guidelines",
                {
                  cache:
                    "no-store",
                },
              ),

              fetch(
                "/api/community/moderator-status",
                {
                  cache:
                    "no-store",
                },
              ),
            ]);

          if (
            !postsResponse.ok
            || !guidelinesResponse.ok
          ) {
            throw new Error(
              "Community information could not be loaded.",
            );
          }

          const postsData:
            CommunityPost[] =
              await postsResponse.json();

          const guidelinesData:
            CommunityGuidelines =
              await guidelinesResponse.json();

          setPosts(
            postsData,
          );

          setGuidelines(
            guidelinesData,
          );

          if (
            moderatorResponse.ok
          ) {
            const moderatorData:
              {
                is_moderator:
                  boolean;
              } =
                await moderatorResponse.json();

            setModerator(
              moderatorData
                .is_moderator,
            );

            if (
              moderatorData
                .is_moderator
            ) {
              const queueResponse =
                await fetch(
                  "/api/community/moderation",
                  {
                    cache:
                      "no-store",
                  },
                );

              if (
                queueResponse.ok
              ) {
                const queueData:
                  CommunityModerationItem[] =
                    await queueResponse.json();

                setModerationQueue(
                  queueData,
                );
              }
            }
          }
        } catch (
          caughtError
        ) {
          setError(
            caughtError
            instanceof Error
              ? caughtError.message
              : (
                  "Community information "
                  + "could not be loaded."
                ),
          );
        } finally {
          setIsLoading(
            false,
          );
        }
      },
      [
        selectedCategory,
      ],
    );


  useEffect(() => {
    const id =
      window.setTimeout(
        () => {
          void loadCommunity();
        },
        0,
      );

    return () =>
      window.clearTimeout(
        id,
      );
  }, [
    loadCommunity,
  ]);


  async function createPost(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !postForm.title.trim()
      || !postForm.body.trim()
    ) {
      setError(
        "Add a title and message before posting.",
      );

      return;
    }

    setIsSaving(
      true,
    );

    setMessage("");
    setError("");

    try {
      const response =
        await fetch(
          "/api/community/posts",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                ...postForm,

                title:
                  postForm
                    .title
                    .trim(),

                body:
                  postForm
                    .body
                    .trim(),
              }),
          },
        );

      if (!response.ok) {
        throw new Error(
          await messageFromResponse(
            response,
            "The post could not be created.",
          ),
        );
      }

      const created:
        CommunityPost =
          await response.json();

      if (
        created
          .moderation_status
        === "pending_review"
      ) {
        setMessage(
          "Your post was saved and is waiting for moderation before appearing publicly.",
        );
      } else {
        setMessage(
          "Your post was published.",
        );
      }

      setPostForm(
        emptyPost,
      );

      await loadCommunity();
    } catch (
      caughtError
    ) {
      setError(
        caughtError
        instanceof Error
          ? caughtError.message
          : (
              "The post could not "
              + "be created."
            ),
      );
    } finally {
      setIsSaving(
        false,
      );
    }
  }


  async function createComment(
    postId: string,
  ) {
    const body =
      (
        commentDrafts[
          postId
        ]
        ?? ""
      ).trim();

    if (!body) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response =
        await fetch(
          (
            `/api/community/posts/`
            + `${postId}/comments`
          ),
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                body,

                anonymous:
                  Boolean(
                    commentAnonymous[
                      postId
                    ],
                  ),
              }),
          },
        );

      if (!response.ok) {
        throw new Error(
          await messageFromResponse(
            response,
            "The reply could not be posted.",
          ),
        );
      }

      const comment: {
        moderation_status:
          string;
      } =
        await response.json();

      setCommentDrafts(
        (
          current,
        ) => ({
          ...current,
          [postId]:
            "",
        }),
      );

      if (
        comment
          .moderation_status
        === "pending_review"
      ) {
        setMessage(
          "Your reply is waiting for moderation.",
        );
      } else {
        setMessage(
          "Reply added.",
        );
      }

      await loadCommunity();
    } catch (
      caughtError
    ) {
      setError(
        caughtError
        instanceof Error
          ? caughtError.message
          : (
              "The reply could not "
              + "be posted."
            ),
      );
    }
  }


  async function toggleSupport(
    postId: string,
  ) {
    setError("");

    const response =
      await fetch(
        (
          `/api/community/posts/`
          + `${postId}/support`
        ),
        {
          method:
            "PATCH",
        },
      );

    if (!response.ok) {
      setError(
        "The supportive reaction could not be updated.",
      );

      return;
    }

    await loadCommunity();
  }


  async function toggleCommentSupport(
    commentId: string,
  ) {
    setError("");

    const response =
      await fetch(
        (
          `/api/community/comments/`
          + `${commentId}/support`
        ),
        {
          method:
            "PATCH",
        },
      );

    if (!response.ok) {
      setError(
        "The supportive reaction could not be updated.",
      );

      return;
    }

    await loadCommunity();
  }


  async function reportContent(
    kind:
      | "posts"
      | "comments",
    id: string,
  ) {
    const reason =
      window.prompt(
        (
          "Why are you reporting this? "
          + "Enter: harassment, unsafe-content, "
          + "misinformation, spam, privacy or other."
        ),
        "other",
      );

    if (!reason) {
      return;
    }

    const allowed = [
      "harassment",
      "unsafe-content",
      "misinformation",
      "spam",
      "privacy",
      "other",
    ];

    if (
      !allowed.includes(
        reason,
      )
    ) {
      setError(
        "Please choose one of the listed report reasons.",
      );

      return;
    }

    const details =
      window.prompt(
        (
          "Optional: add a short "
          + "explanation for moderators."
        ),
        "",
      );

    const response =
      await fetch(
        (
          `/api/community/${kind}/`
          + `${id}/report`
        ),
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              reason,
              details:
                details
                || null,
            }),
        },
      );

    if (!response.ok) {
      setError(
        await messageFromResponse(
          response,
          "The report could not be submitted.",
        ),
      );

      return;
    }

    setMessage(
      "Thank you. The report was sent to moderation.",
    );

    await loadCommunity();
  }


  async function moderate(
    item:
      CommunityModerationItem,
    action:
      | "approve"
      | "hide"
      | "restore",
  ) {
    const note =
      window.prompt(
        "Optional moderator note:",
        "",
      );

    const response =
      await fetch(
        (
          `/api/community/moderation/`
          + `${item.content_type}/`
          + item.content_id
        ),
        {
          method:
            "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify({
              action,
              note:
                note
                || null,
            }),
        },
      );

    if (!response.ok) {
      setError(
        "Moderation action could not be completed.",
      );

      return;
    }

    setMessage(
      "Moderation action saved.",
    );

    await loadCommunity();
  }


  return (
    <main className="community-page">
      <header className="phase3-header">
        <Logo />

        <Link
          className="button button-secondary"
          href="/dashboard"
        >
          Back to dashboard
        </Link>
      </header>


      <section className="community-hero">
        <p className="eyebrow">
          Peer community
        </p>

        <h1>
          A supportive space to share small steps
        </h1>

        <p>
          Share experiences, strategies and wins
          with other members without pressure to
          perform or compare yourself.
        </p>

        <div className="phase3-safety-banner">
          <strong>
            Peer support, not clinical care
          </strong>

          <span>
            The community cannot provide diagnosis,
            emergency intervention or professional
            mental-health treatment.
          </span>
        </div>
      </section>


      {guidelines ? (
        <details className="community-guidelines">
          <summary>
            {guidelines.title}
          </summary>

          <ul>
            {guidelines.rules.map(
              (
                rule,
              ) => (
                <li
                  key={
                    rule
                  }
                >
                  {rule}
                </li>
              ),
            )}
          </ul>

          <p>
            {
              guidelines
                .safety_message
            }
          </p>

          <p>
            {
              guidelines
                .moderation_message
            }
          </p>
        </details>
      ) : null}


      <section className="community-create-card">
        <p className="eyebrow">
          Share with the community
        </p>

        <h2>
          Create a post
        </h2>

        <form
          className="community-post-form"
          onSubmit={
            createPost
          }
        >
          <label>
            <span>
              Title
            </span>

            <input
              maxLength={180}
              onChange={(
                event,
              ) =>
                setPostForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    title:
                      event
                        .target
                        .value,
                  }),
                )
              }
              placeholder="What would you like to share?"
              required
              value={
                postForm.title
              }
            />
          </label>

          <label>
            <span>
              Category
            </span>

            <select
              onChange={(
                event,
              ) => {
                const category =
                  event.target.value as CommunityCategory;

                setPostForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    category,
                  }),
                );
              }}
              value={
                postForm.category
              }
            >
              {categories.map(
                (
                  category,
                ) => (
                  <option
                    key={
                      category
                    }
                    value={
                      category
                    }
                  >
                    {
                      category
                    }
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            <span>
              Message
            </span>

            <textarea
              maxLength={5000}
              onChange={(
                event,
              ) =>
                setPostForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    body:
                      event
                        .target
                        .value,
                  }),
                )
              }
              placeholder="Share an experience, idea, strategy or small win."
              required
              rows={6}
              value={
                postForm.body
              }
            />
          </label>

          <label className="community-checkbox">
            <input
              checked={
                postForm
                  .anonymous
              }
              onChange={(
                event,
              ) =>
                setPostForm(
                  (
                    current,
                  ) => ({
                    ...current,
                    anonymous:
                      event
                        .target
                        .checked,
                  }),
                )
              }
              type="checkbox"
            />

            <span>
              Post with an anonymous community name
            </span>
          </label>

          <button
            className="button button-primary"
            disabled={
              isSaving
            }
            type="submit"
          >
            {
              isSaving
                ? "Posting..."
                : "Publish post"
            }
          </button>
        </form>
      </section>


      <section className="community-feed-section">
        <div className="community-feed-heading">
          <div>
            <p className="eyebrow">
              Community feed
            </p>

            <h2>
              Recent posts
            </h2>
          </div>

          <label>
            <span>
              Category
            </span>

            <select
              onChange={(
                event,
              ) => {
                const category =
                  event.target.value as (
                    "all"
                    | CommunityCategory
                  );

                setSelectedCategory(
                  category,
                );
              }}
              value={
                selectedCategory
              }
            >
              <option value="all">
                All
              </option>

              {categories.map(
                (
                  category,
                ) => (
                  <option
                    key={
                      category
                    }
                    value={
                      category
                    }
                  >
                    {
                      category
                    }
                  </option>
                ),
              )}
            </select>
          </label>
        </div>


        {message ? (
          <p
            className="task-message task-success"
            role="status"
          >
            {message}
          </p>
        ) : null}


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
            Loading community...
          </p>
        ) : null}


        {
          !isLoading
          && posts.length
          === 0
            ? (
              <div className="community-empty">
                <h3>
                  No posts yet
                </h3>

                <p>
                  You can be the first person to
                  share a supportive idea or small win.
                </p>
              </div>
            )
            : null
        }


        <div className="community-feed">
          {posts.map(
            (
              post,
            ) => (
              <article
                className="community-post"
                key={
                  post.id
                }
              >
                <div className="community-post-header">
                  <div>
                    <span className="status-pill">
                      {
                        post.category
                      }
                    </span>

                    <h3>
                      {
                        post.title
                      }
                    </h3>

                    <small>
                      {
                        post.author
                          .display_name
                      }
                      {" · "}
                      {
                        formatDate(
                          post.created_at,
                        )
                      }
                    </small>
                  </div>

                  <button
                    className="community-report-button"
                    onClick={() =>
                      void reportContent(
                        "posts",
                        post.id,
                      )
                    }
                    type="button"
                  >
                    Report
                  </button>
                </div>

                <p className="community-post-body">
                  {
                    post.body
                  }
                </p>

                <div className="community-post-actions">
                  <button
                    className={
                      post
                        .viewer_supported
                        ? "community-support-active"
                        : ""
                    }
                    onClick={() =>
                      void toggleSupport(
                        post.id,
                      )
                    }
                    type="button"
                  >
                    ♡ Support {
                      post
                        .support_count
                    }
                  </button>

                  <span>
                    {
                      post
                        .comment_count
                    } replies
                  </span>
                </div>


                {
                  post.comments
                    .length
                  > 0
                    ? (
                      <div className="community-comments">
                        {
                          post.comments.map(
                            (
                              comment,
                            ) => (
                              <article
                                className="community-comment"
                                key={
                                  comment.id
                                }
                              >
                                <div>
                                  <strong>
                                    {
                                      comment
                                        .author
                                        .display_name
                                    }
                                  </strong>

                                  <small>
                                    {
                                      formatDate(
                                        comment
                                          .created_at,
                                      )
                                    }
                                  </small>
                                </div>

                                <p>
                                  {
                                    comment
                                      .body
                                  }
                                </p>

                                <div className="community-comment-actions">
                                  <button
                                    className={
                                      comment
                                        .viewer_supported
                                        ? "community-support-active"
                                        : ""
                                    }
                                    onClick={() =>
                                      void toggleCommentSupport(
                                        comment.id,
                                      )
                                    }
                                    type="button"
                                  >
                                    ♡ {
                                      comment
                                        .support_count
                                    }
                                  </button>

                                  <button
                                    onClick={() =>
                                      void reportContent(
                                        "comments",
                                        comment.id,
                                      )
                                    }
                                    type="button"
                                  >
                                    Report
                                  </button>
                                </div>
                              </article>
                            ),
                          )
                        }
                      </div>
                    )
                    : null
                }


                <div className="community-reply-box">
                  <textarea
                    maxLength={3000}
                    onChange={(
                      event,
                    ) =>
                      setCommentDrafts(
                        (
                          current,
                        ) => ({
                          ...current,

                          [post.id]:
                            event
                              .target
                              .value,
                        }),
                      )
                    }
                    placeholder="Write a supportive reply..."
                    rows={3}
                    value={
                      commentDrafts[
                        post.id
                      ]
                      ?? ""
                    }
                  />

                  <label className="community-checkbox">
                    <input
                      checked={
                        Boolean(
                          commentAnonymous[
                            post.id
                          ],
                        )
                      }
                      onChange={(
                        event,
                      ) =>
                        setCommentAnonymous(
                          (
                            current,
                          ) => ({
                            ...current,

                            [post.id]:
                              event
                                .target
                                .checked,
                          }),
                        )
                      }
                      type="checkbox"
                    />

                    Anonymous reply
                  </label>

                  <button
                    className="button button-secondary"
                    onClick={() =>
                      void createComment(
                        post.id,
                      )
                    }
                    type="button"
                  >
                    Reply
                  </button>
                </div>
              </article>
            ),
          )}
        </div>
      </section>


      {
        moderator
          ? (
            <section className="community-moderation-section">
              <p className="eyebrow">
                Moderator tools
              </p>

              <h2>
                Moderation queue
              </h2>

              {
                moderationQueue
                  .length
                === 0
                  ? (
                    <p>
                      Nothing currently needs review.
                    </p>
                  )
                  : (
                    <div className="community-moderation-list">
                      {
                        moderationQueue.map(
                          (
                            item,
                          ) => (
                            <article
                              className="community-moderation-item"
                              key={
                                (
                                  item
                                    .content_type
                                  + "-"
                                  + item
                                    .content_id
                                )
                              }
                            >
                              <div>
                                <span className="status-pill">
                                  {
                                    item
                                      .content_type
                                  }
                                </span>

                                {
                                  item.title
                                    ? (
                                      <h3>
                                        {
                                          item
                                            .title
                                        }
                                      </h3>
                                    )
                                    : null
                                }

                                <p>
                                  {
                                    item
                                      .body
                                  }
                                </p>

                                <small>
                                  Reports: {
                                    item
                                      .report_count
                                  }
                                </small>

                                {
                                  item
                                    .moderation_reason
                                    ? (
                                      <p>
                                        <strong>
                                          Screening:
                                        </strong>{" "}
                                        {
                                          item
                                            .moderation_reason
                                        }
                                      </p>
                                    )
                                    : null
                                }
                              </div>

                              <div className="community-moderation-actions">
                                <button
                                  className="button button-primary"
                                  onClick={() =>
                                    void moderate(
                                      item,
                                      "approve",
                                    )
                                  }
                                  type="button"
                                >
                                  Approve
                                </button>

                                <button
                                  className="button button-secondary"
                                  onClick={() =>
                                    void moderate(
                                      item,
                                      "hide",
                                    )
                                  }
                                  type="button"
                                >
                                  Hide
                                </button>
                              </div>
                            </article>
                          ),
                        )
                      }
                    </div>
                  )
              }
            </section>
          )
          : null
      }
    </main>
  );
}
