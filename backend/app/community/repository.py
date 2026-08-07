import os
import uuid

from sqlalchemy import (
    or_,
    select,
)
from sqlalchemy.orm import Session

from app.community.moderation import (
    screen_community_content,
)
from app.community.schemas import (
    CommunityAuthor,
    CommunityCommentCreate,
    CommunityCommentResponse,
    CommunityModerationItem,
    CommunityModerationUpdate,
    CommunityPostCreate,
    CommunityPostResponse,
    CommunityReactionResponse,
    CommunityReportCreate,
    CommunityReportResponse,
)
from app.models.community import (
    CommunityComment,
    CommunityModerationAction,
    CommunityPost,
    CommunityReaction,
    CommunityReport,
)
from app.models.user import User


AUTO_HIDE_REPORT_THRESHOLD = 3


def anonymous_name(
    user_id: uuid.UUID,
) -> str:
    return (
        "Community member "
        + str(user_id)[
            :6
        ].upper()
    )


def display_author(
    user: User,
    anonymous: bool,
    current_user_id: uuid.UUID,
) -> CommunityAuthor:
    if anonymous:
        return CommunityAuthor(
            display_name=anonymous_name(
                user.id
            ),
            is_anonymous=True,
            is_current_user=(
                user.id
                == current_user_id
            ),
        )

    return CommunityAuthor(
        display_name=user.full_name,
        is_anonymous=False,
        is_current_user=(
            user.id
            == current_user_id
        ),
    )


def moderator_emails() -> set[str]:
    raw = os.getenv(
        "AKSESS_MODERATOR_EMAILS",
        "",
    )

    return {
        email.strip().lower()
        for email in raw.split(",")
        if email.strip()
    }


def is_moderator(
    user: User,
) -> bool:
    return (
        user.email.lower()
        in moderator_emails()
    )


def viewer_supported_post(
    database: Session,
    user_id: uuid.UUID,
    post_id: uuid.UUID,
) -> bool:
    statement = select(
        CommunityReaction.id
    ).where(
        CommunityReaction.user_id
        == user_id,
        CommunityReaction.post_id
        == post_id,
        CommunityReaction.reaction_type
        == "support",
    )

    return (
        database.scalar(
            statement
        )
        is not None
    )


def viewer_supported_comment(
    database: Session,
    user_id: uuid.UUID,
    comment_id: uuid.UUID,
) -> bool:
    statement = select(
        CommunityReaction.id
    ).where(
        CommunityReaction.user_id
        == user_id,
        CommunityReaction.comment_id
        == comment_id,
        CommunityReaction.reaction_type
        == "support",
    )

    return (
        database.scalar(
            statement
        )
        is not None
    )


def comment_response(
    database: Session,
    comment: CommunityComment,
    current_user_id: uuid.UUID,
) -> CommunityCommentResponse:
    user = database.get(
        User,
        comment.user_id,
    )

    if user is None:
        raise RuntimeError(
            "Community comment author was not found."
        )

    return CommunityCommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        parent_comment_id=(
            comment.parent_comment_id
        ),
        body=comment.body,
        author=display_author(
            user=user,
            anonymous=comment.anonymous,
            current_user_id=current_user_id,
        ),
        moderation_status=(
            comment.moderation_status
        ),
        support_count=(
            comment.support_count
        ),
        viewer_supported=(
            viewer_supported_comment(
                database=database,
                user_id=current_user_id,
                comment_id=comment.id,
            )
        ),
        created_at=comment.created_at,
    )


def post_response(
    database: Session,
    post: CommunityPost,
    current_user_id: uuid.UUID,
) -> CommunityPostResponse:
    user = database.get(
        User,
        post.user_id,
    )

    if user is None:
        raise RuntimeError(
            "Community post author was not found."
        )

    comments_statement = (
        select(
            CommunityComment
        )
        .where(
            CommunityComment.post_id
            == post.id,
            CommunityComment.moderation_status
            == "published",
        )
        .order_by(
            CommunityComment.created_at.asc()
        )
    )

    comments = list(
        database.scalars(
            comments_statement
        )
    )

    return CommunityPostResponse(
        id=post.id,
        title=post.title,
        body=post.body,
        category=post.category,
        author=display_author(
            user=user,
            anonymous=post.anonymous,
            current_user_id=current_user_id,
        ),
        moderation_status=(
            post.moderation_status
        ),
        moderation_reason=(
            post.moderation_reason
        ),
        support_count=(
            post.support_count
        ),
        viewer_supported=(
            viewer_supported_post(
                database=database,
                user_id=current_user_id,
                post_id=post.id,
            )
        ),
        comment_count=len(
            comments
        ),
        comments=[
            comment_response(
                database=database,
                comment=comment,
                current_user_id=(
                    current_user_id
                ),
            )
            for comment
            in comments
        ],
        created_at=post.created_at,
    )


def list_posts(
    database: Session,
    current_user_id: uuid.UUID,
    category: str | None = None,
) -> list[
    CommunityPostResponse
]:
    conditions = [
        CommunityPost.moderation_status
        == "published",
    ]

    if category:
        conditions.append(
            CommunityPost.category
            == category
        )

    statement = (
        select(
            CommunityPost
        )
        .where(
            *conditions
        )
        .order_by(
            CommunityPost.created_at.desc()
        )
    )

    posts = list(
        database.scalars(
            statement
        )
    )

    return [
        post_response(
            database=database,
            post=post,
            current_user_id=(
                current_user_id
            ),
        )
        for post
        in posts
    ]


def create_post(
    database: Session,
    user: User,
    payload: CommunityPostCreate,
) -> CommunityPostResponse:
    screening = (
        screen_community_content(
            (
                payload.title
                + "\n"
                + payload.body
            )
        )
    )

    post = CommunityPost(
        user_id=user.id,
        title=payload.title.strip(),
        body=payload.body.strip(),
        category=payload.category,
        anonymous=payload.anonymous,
        moderation_status=(
            screening.status
        ),
        moderation_reason=(
            screening.reason
        ),
    )

    database.add(
        post
    )

    database.commit()
    database.refresh(
        post
    )

    return post_response(
        database=database,
        post=post,
        current_user_id=user.id,
    )


def create_comment(
    database: Session,
    user: User,
    post_id: uuid.UUID,
    payload: CommunityCommentCreate,
) -> CommunityCommentResponse:
    post = database.get(
        CommunityPost,
        post_id,
    )

    if (
        post is None
        or post.moderation_status
        != "published"
    ):
        raise ValueError(
            "Community post not found."
        )

    if (
        payload.parent_comment_id
        is not None
    ):
        parent = database.get(
            CommunityComment,
            payload.parent_comment_id,
        )

        if (
            parent is None
            or parent.post_id
            != post_id
        ):
            raise ValueError(
                "Parent comment not found."
            )

    screening = (
        screen_community_content(
            payload.body
        )
    )

    comment = CommunityComment(
        post_id=post_id,
        user_id=user.id,
        parent_comment_id=(
            payload.parent_comment_id
        ),
        body=payload.body.strip(),
        anonymous=payload.anonymous,
        moderation_status=(
            screening.status
        ),
        moderation_reason=(
            screening.reason
        ),
    )

    database.add(
        comment
    )

    database.commit()
    database.refresh(
        comment
    )

    return comment_response(
        database=database,
        comment=comment,
        current_user_id=user.id,
    )


def toggle_post_support(
    database: Session,
    user: User,
    post_id: uuid.UUID,
) -> CommunityReactionResponse:
    post = database.get(
        CommunityPost,
        post_id,
    )

    if (
        post is None
        or post.moderation_status
        != "published"
    ):
        raise ValueError(
            "Community post not found."
        )

    statement = select(
        CommunityReaction
    ).where(
        CommunityReaction.user_id
        == user.id,
        CommunityReaction.post_id
        == post_id,
        CommunityReaction.reaction_type
        == "support",
    )

    reaction = database.scalar(
        statement
    )

    if reaction is not None:
        database.delete(
            reaction
        )

        post.support_count = max(
            0,
            post.support_count - 1,
        )

        supported = False
    else:
        reaction = CommunityReaction(
            user_id=user.id,
            post_id=post_id,
            reaction_type="support",
        )

        database.add(
            reaction
        )

        post.support_count += 1

        supported = True

    database.add(
        post
    )

    database.commit()
    database.refresh(
        post
    )

    return CommunityReactionResponse(
        supported=supported,
        support_count=post.support_count,
    )


def toggle_comment_support(
    database: Session,
    user: User,
    comment_id: uuid.UUID,
) -> CommunityReactionResponse:
    comment = database.get(
        CommunityComment,
        comment_id,
    )

    if (
        comment is None
        or comment.moderation_status
        != "published"
    ):
        raise ValueError(
            "Community comment not found."
        )

    statement = select(
        CommunityReaction
    ).where(
        CommunityReaction.user_id
        == user.id,
        CommunityReaction.comment_id
        == comment_id,
        CommunityReaction.reaction_type
        == "support",
    )

    reaction = database.scalar(
        statement
    )

    if reaction is not None:
        database.delete(
            reaction
        )

        comment.support_count = max(
            0,
            comment.support_count - 1,
        )

        supported = False
    else:
        reaction = CommunityReaction(
            user_id=user.id,
            comment_id=comment_id,
            reaction_type="support",
        )

        database.add(
            reaction
        )

        comment.support_count += 1

        supported = True

    database.add(
        comment
    )

    database.commit()
    database.refresh(
        comment
    )

    return CommunityReactionResponse(
        supported=supported,
        support_count=(
            comment.support_count
        ),
    )


def report_post(
    database: Session,
    user: User,
    post_id: uuid.UUID,
    payload: CommunityReportCreate,
) -> CommunityReportResponse:
    post = database.get(
        CommunityPost,
        post_id,
    )

    if post is None:
        raise ValueError(
            "Community post not found."
        )

    existing = database.scalar(
        select(
            CommunityReport.id
        ).where(
            CommunityReport.reporter_user_id
            == user.id,
            CommunityReport.post_id
            == post_id,
            CommunityReport.status
            == "open",
        )
    )

    if existing is not None:
        raise ValueError(
            "You have already reported this post."
        )

    report = CommunityReport(
        reporter_user_id=user.id,
        post_id=post_id,
        reason=payload.reason,
        details=payload.details,
    )

    database.add(
        report
    )

    post.report_count += 1

    if (
        post.report_count
        >= AUTO_HIDE_REPORT_THRESHOLD
    ):
        post.moderation_status = (
            "pending_review"
        )

        post.moderation_reason = (
            "Automatically held after "
            "multiple community reports."
        )

    database.add(
        post
    )

    database.commit()
    database.refresh(
        report
    )

    return CommunityReportResponse(
        id=report.id,
        status=report.status,
        message=(
            "Thank you. Your report has been "
            "submitted for moderation."
        ),
    )


def report_comment(
    database: Session,
    user: User,
    comment_id: uuid.UUID,
    payload: CommunityReportCreate,
) -> CommunityReportResponse:
    comment = database.get(
        CommunityComment,
        comment_id,
    )

    if comment is None:
        raise ValueError(
            "Community comment not found."
        )

    existing = database.scalar(
        select(
            CommunityReport.id
        ).where(
            CommunityReport.reporter_user_id
            == user.id,
            CommunityReport.comment_id
            == comment_id,
            CommunityReport.status
            == "open",
        )
    )

    if existing is not None:
        raise ValueError(
            "You have already reported this comment."
        )

    report = CommunityReport(
        reporter_user_id=user.id,
        comment_id=comment_id,
        reason=payload.reason,
        details=payload.details,
    )

    database.add(
        report
    )

    comment.report_count += 1

    if (
        comment.report_count
        >= AUTO_HIDE_REPORT_THRESHOLD
    ):
        comment.moderation_status = (
            "pending_review"
        )

        comment.moderation_reason = (
            "Automatically held after "
            "multiple community reports."
        )

    database.add(
        comment
    )

    database.commit()
    database.refresh(
        report
    )

    return CommunityReportResponse(
        id=report.id,
        status=report.status,
        message=(
            "Thank you. Your report has been "
            "submitted for moderation."
        ),
    )


def moderation_queue(
    database: Session,
) -> list[
    CommunityModerationItem
]:
    post_statement = (
        select(
            CommunityPost
        )
        .where(
            or_(
                CommunityPost.moderation_status
                == "pending_review",
                CommunityPost.report_count
                > 0,
            )
        )
        .order_by(
            CommunityPost.created_at.asc()
        )
    )

    comment_statement = (
        select(
            CommunityComment
        )
        .where(
            or_(
                CommunityComment.moderation_status
                == "pending_review",
                CommunityComment.report_count
                > 0,
            )
        )
        .order_by(
            CommunityComment.created_at.asc()
        )
    )

    posts = list(
        database.scalars(
            post_statement
        )
    )

    comments = list(
        database.scalars(
            comment_statement
        )
    )

    queue = [
        CommunityModerationItem(
            content_type="post",
            content_id=post.id,
            title=post.title,
            body=post.body,
            moderation_status=(
                post.moderation_status
            ),
            moderation_reason=(
                post.moderation_reason
            ),
            report_count=(
                post.report_count
            ),
            created_at=post.created_at,
        )
        for post
        in posts
    ]

    queue.extend(
        CommunityModerationItem(
            content_type="comment",
            content_id=comment.id,
            title=None,
            body=comment.body,
            moderation_status=(
                comment.moderation_status
            ),
            moderation_reason=(
                comment.moderation_reason
            ),
            report_count=(
                comment.report_count
            ),
            created_at=comment.created_at,
        )
        for comment
        in comments
    )

    return sorted(
        queue,
        key=lambda item:
            item.created_at,
    )


def moderate_content(
    database: Session,
    moderator: User,
    content_type: str,
    content_id: uuid.UUID,
    payload: CommunityModerationUpdate,
) -> CommunityModerationItem:
    if content_type == "post":
        content = database.get(
            CommunityPost,
            content_id,
        )
    elif content_type == "comment":
        content = database.get(
            CommunityComment,
            content_id,
        )
    else:
        raise ValueError(
            "Unknown moderation content type."
        )

    if content is None:
        raise ValueError(
            "Community content not found."
        )

    if payload.action in (
        "approve",
        "restore",
    ):
        content.moderation_status = (
            "published"
        )

        content.moderation_reason = (
            payload.note
        )

    elif payload.action == "hide":
        content.moderation_status = (
            "hidden"
        )

        content.moderation_reason = (
            payload.note
            or "Hidden by moderator."
        )

    action = CommunityModerationAction(
        moderator_user_id=moderator.id,
        post_id=(
            content.id
            if content_type == "post"
            else None
        ),
        comment_id=(
            content.id
            if content_type
            == "comment"
            else None
        ),
        action=payload.action,
        note=payload.note,
    )

    database.add(
        content
    )

    database.add(
        action
    )

    open_reports = list(
        database.scalars(
            select(
                CommunityReport
            ).where(
                (
                    CommunityReport.post_id
                    == content_id
                    if content_type
                    == "post"
                    else (
                        CommunityReport.comment_id
                        == content_id
                    )
                ),
                CommunityReport.status
                == "open",
            )
        )
    )

    for report in open_reports:
        report.status = (
            "resolved"
        )

        database.add(
            report
        )

    database.commit()
    database.refresh(
        content
    )

    return CommunityModerationItem(
        content_type=content_type,
        content_id=content.id,
        title=(
            content.title
            if content_type
            == "post"
            else None
        ),
        body=content.body,
        moderation_status=(
            content.moderation_status
        ),
        moderation_reason=(
            content.moderation_reason
        ),
        report_count=(
            content.report_count
        ),
        created_at=content.created_at,
    )
