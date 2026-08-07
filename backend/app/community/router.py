import uuid

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    status,
)

from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.community.repository import (
    create_comment,
    create_post,
    is_moderator,
    list_posts,
    moderate_content,
    moderation_queue,
    report_comment,
    report_post,
    toggle_comment_support,
    toggle_post_support,
)
from app.community.schemas import (
    CommunityCommentCreate,
    CommunityCommentResponse,
    CommunityGuidelinesResponse,
    CommunityModerationItem,
    CommunityModerationUpdate,
    CommunityModeratorStatusResponse,
    CommunityPostCreate,
    CommunityPostResponse,
    CommunityReactionResponse,
    CommunityReportCreate,
    CommunityReportResponse,
)


router = APIRouter(
    prefix="/community",
    tags=["Community"],
)


@router.get(
    "/guidelines",
    response_model=CommunityGuidelinesResponse,
)
def read_guidelines(
    current_user: CurrentUserDependency,
) -> CommunityGuidelinesResponse:
    del current_user

    return CommunityGuidelinesResponse(
        title="Aksess community guidelines",
        rules=[
            (
                "Be supportive and respectful. "
                "Different people experience focus, "
                "wellbeing and neurodiversity differently."
            ),
            (
                "Do not diagnose other members or present "
                "personal experience as medical advice."
            ),
            (
                "Do not encourage self-harm, harassment, "
                "hate, threats or dangerous behaviour."
            ),
            (
                "Protect privacy. Do not post another "
                "person's private information."
            ),
            (
                "Avoid spam, scams and promotional "
                "content."
            ),
            (
                "Use reporting tools when content feels "
                "unsafe rather than escalating an "
                "argument."
            ),
        ],
        safety_message=(
            "The community is peer support, not an "
            "emergency or professional clinical service."
        ),
        moderation_message=(
            "Some content may be held automatically for "
            "human review. Reported content can also be "
            "temporarily removed from the public feed."
        ),
    )


@router.get(
    "/moderator-status",
    response_model=CommunityModeratorStatusResponse,
)
def read_moderator_status(
    current_user: CurrentUserDependency,
) -> CommunityModeratorStatusResponse:
    return CommunityModeratorStatusResponse(
        is_moderator=(
            is_moderator(
                current_user
            )
        ),
    )


@router.get(
    "/posts",
    response_model=list[
        CommunityPostResponse
    ],
)
def read_posts(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    category: str | None = Query(
        default=None,
    ),
) -> list[
    CommunityPostResponse
]:
    return list_posts(
        database=database,
        current_user_id=(
            current_user.id
        ),
        category=category,
    )


@router.post(
    "/posts",
    response_model=CommunityPostResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_post(
    payload: CommunityPostCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> CommunityPostResponse:
    return create_post(
        database=database,
        user=current_user,
        payload=payload,
    )


@router.post(
    "/posts/{post_id}/comments",
    response_model=CommunityCommentResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_comment(
    post_id: uuid.UUID,
    payload: CommunityCommentCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> CommunityCommentResponse:
    try:
        return create_comment(
            database=database,
            user=current_user,
            post_id=post_id,
            payload=payload,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error


@router.patch(
    "/posts/{post_id}/support",
    response_model=CommunityReactionResponse,
)
def support_post(
    post_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> CommunityReactionResponse:
    try:
        return toggle_post_support(
            database=database,
            user=current_user,
            post_id=post_id,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error


@router.patch(
    "/comments/{comment_id}/support",
    response_model=CommunityReactionResponse,
)
def support_comment(
    comment_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> CommunityReactionResponse:
    try:
        return toggle_comment_support(
            database=database,
            user=current_user,
            comment_id=comment_id,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error


@router.post(
    "/posts/{post_id}/report",
    response_model=CommunityReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def report_community_post(
    post_id: uuid.UUID,
    payload: CommunityReportCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> CommunityReportResponse:
    try:
        return report_post(
            database=database,
            user=current_user,
            post_id=post_id,
            payload=payload,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error


@router.post(
    "/comments/{comment_id}/report",
    response_model=CommunityReportResponse,
    status_code=status.HTTP_201_CREATED,
)
def report_community_comment(
    comment_id: uuid.UUID,
    payload: CommunityReportCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> CommunityReportResponse:
    try:
        return report_comment(
            database=database,
            user=current_user,
            comment_id=comment_id,
            payload=payload,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error


@router.get(
    "/moderation",
    response_model=list[
        CommunityModerationItem
    ],
)
def read_moderation_queue(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> list[
    CommunityModerationItem
]:
    if not is_moderator(
        current_user
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "Moderator access required."
            ),
        )

    return moderation_queue(
        database=database,
    )


@router.patch(
    "/moderation/{content_type}/{content_id}",
    response_model=CommunityModerationItem,
)
def moderate_community_content(
    content_type: str,
    content_id: uuid.UUID,
    payload: CommunityModerationUpdate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> CommunityModerationItem:
    if not is_moderator(
        current_user
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "Moderator access required."
            ),
        )

    try:
        return moderate_content(
            database=database,
            moderator=current_user,
            content_type=content_type,
            content_id=content_id,
            payload=payload,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error
