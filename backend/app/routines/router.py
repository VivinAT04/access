import uuid
from datetime import date

from fastapi import (
    APIRouter,
    HTTPException,
    Query,
    Response,
    status,
)

from app.auth.dependencies import (
    CurrentUserDependency,
    DatabaseDependency,
)
from app.models.routine import (
    Routine,
    RoutineRun,
    RoutineRunStep,
    RoutineStep,
)
from app.routines.repository import (
    create_routine,
    create_routine_step,
    delete_routine,
    delete_routine_step,
    duplicate_routine,
    get_routine,
    get_routine_step,
    get_routine_summary,
    get_run,
    get_run_step,
    list_routines,
    list_runs,
    reorder_routine_steps,
    routine_to_dict,
    run_to_dict,
    set_run_step_completion,
    start_routine_run,
    update_routine,
    update_routine_step,
)
from app.routines.schemas import (
    RoutineCreate,
    RoutineResponse,
    RoutineRunResponse,
    RoutineStepCreate,
    RoutineStepReorderRequest,
    RoutineStepResponse,
    RoutineStepUpdate,
    RoutineSummaryResponse,
    RoutineUpdate,
)


router = APIRouter(
    prefix="/routines",
    tags=["Routines"],
)


def require_routine(
    database: DatabaseDependency,
    user_id: uuid.UUID,
    routine_id: uuid.UUID,
) -> Routine:
    routine = get_routine(
        database=database,
        user_id=user_id,
        routine_id=routine_id,
    )

    if routine is None:
        raise HTTPException(
            status_code=404,
            detail="Routine not found.",
        )

    return routine


def require_step(
    database: DatabaseDependency,
    user_id: uuid.UUID,
    step_id: uuid.UUID,
) -> RoutineStep:
    step = get_routine_step(
        database=database,
        user_id=user_id,
        step_id=step_id,
    )

    if step is None:
        raise HTTPException(
            status_code=404,
            detail="Routine step not found.",
        )

    return step


def require_run(
    database: DatabaseDependency,
    user_id: uuid.UUID,
    run_id: uuid.UUID,
) -> RoutineRun:
    run = get_run(
        database=database,
        user_id=user_id,
        run_id=run_id,
    )

    if run is None:
        raise HTTPException(
            status_code=404,
            detail="Routine run not found.",
        )

    return run


def require_run_step(
    database: DatabaseDependency,
    user_id: uuid.UUID,
    run_step_id: uuid.UUID,
) -> RoutineRunStep:
    run_step = get_run_step(
        database=database,
        user_id=user_id,
        run_step_id=run_step_id,
    )

    if run_step is None:
        raise HTTPException(
            status_code=404,
            detail="Routine-run step not found.",
        )

    return run_step


@router.post(
    "",
    response_model=RoutineResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_routine(
    payload: RoutineCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> RoutineResponse:
    routine = create_routine(
        database=database,
        user_id=current_user.id,
        payload=payload,
    )

    return RoutineResponse(
        **routine_to_dict(
            database,
            routine,
        )
    )


@router.get(
    "",
    response_model=list[RoutineResponse],
)
def read_routines(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> list[RoutineResponse]:
    return [
        RoutineResponse(
            **routine_to_dict(
                database,
                routine,
            )
        )
        for routine in list_routines(
            database,
            current_user.id,
        )
    ]


@router.get(
    "/summary",
    response_model=RoutineSummaryResponse,
)
def read_summary(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    today: date = Query(
        default_factory=date.today
    ),
) -> RoutineSummaryResponse:
    return RoutineSummaryResponse(
        **get_routine_summary(
            database,
            current_user.id,
            today,
        )
    )


@router.get(
    "/runs",
    response_model=list[
        RoutineRunResponse
    ],
)
def read_runs(
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    limit: int = Query(
        default=30,
        ge=1,
        le=100,
    ),
) -> list[RoutineRunResponse]:
    return [
        RoutineRunResponse(
            **run_to_dict(
                database,
                run,
            )
        )
        for run in list_runs(
            database,
            current_user.id,
            limit,
        )
    ]


@router.put(
    "/{routine_id}",
    response_model=RoutineResponse,
)
def edit_routine(
    routine_id: uuid.UUID,
    payload: RoutineUpdate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> RoutineResponse:
    routine = require_routine(
        database,
        current_user.id,
        routine_id,
    )

    routine = update_routine(
        database,
        routine,
        payload,
    )

    return RoutineResponse(
        **routine_to_dict(
            database,
            routine,
        )
    )


@router.post(
    "/{routine_id}/duplicate",
    response_model=RoutineResponse,
    status_code=201,
)
def copy_routine(
    routine_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> RoutineResponse:
    routine = require_routine(
        database,
        current_user.id,
        routine_id,
    )

    duplicated = duplicate_routine(
        database,
        routine,
    )

    return RoutineResponse(
        **routine_to_dict(
            database,
            duplicated,
        )
    )


@router.post(
    "/{routine_id}/steps",
    response_model=RoutineStepResponse,
    status_code=201,
)
def add_routine_step(
    routine_id: uuid.UUID,
    payload: RoutineStepCreate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> RoutineStepResponse:
    routine = require_routine(
        database,
        current_user.id,
        routine_id,
    )

    return RoutineStepResponse.model_validate(
        create_routine_step(
            database,
            routine,
            payload,
        )
    )


@router.put(
    "/steps/{step_id}",
    response_model=RoutineStepResponse,
)
def edit_routine_step(
    step_id: uuid.UUID,
    payload: RoutineStepUpdate,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> RoutineStepResponse:
    step = require_step(
        database,
        current_user.id,
        step_id,
    )

    return RoutineStepResponse.model_validate(
        update_routine_step(
            database,
            step,
            payload,
        )
    )


@router.patch(
    "/{routine_id}/steps/reorder",
    response_model=list[
        RoutineStepResponse
    ],
)
def reorder_steps(
    routine_id: uuid.UUID,
    payload: RoutineStepReorderRequest,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> list[RoutineStepResponse]:
    routine = require_routine(
        database,
        current_user.id,
        routine_id,
    )

    try:
        steps = reorder_routine_steps(
            database,
            routine,
            payload,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    return [
        RoutineStepResponse.model_validate(
            step
        )
        for step in steps
    ]


@router.delete(
    "/steps/{step_id}",
    status_code=204,
)
def remove_routine_step(
    step_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> Response:
    step = require_step(
        database,
        current_user.id,
        step_id,
    )

    delete_routine_step(
        database,
        step,
    )

    return Response(status_code=204)


@router.post(
    "/{routine_id}/start",
    response_model=RoutineRunResponse,
    status_code=201,
)
def start_routine(
    routine_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    run_date: date = Query(
        default_factory=date.today
    ),
) -> RoutineRunResponse:
    routine = require_routine(
        database,
        current_user.id,
        routine_id,
    )

    run = start_routine_run(
        database,
        routine,
        run_date,
    )

    return RoutineRunResponse(
        **run_to_dict(
            database,
            run,
        )
    )


@router.patch(
    "/run-steps/{run_step_id}/complete",
    response_model=RoutineRunResponse,
)
def complete_run_step(
    run_step_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
    completed: bool = True,
) -> RoutineRunResponse:
    run_step = require_run_step(
        database,
        current_user.id,
        run_step_id,
    )

    set_run_step_completion(
        database,
        run_step,
        completed,
    )

    run = require_run(
        database,
        current_user.id,
        run_step.run_id,
    )

    return RoutineRunResponse(
        **run_to_dict(
            database,
            run,
        )
    )


@router.delete(
    "/{routine_id}",
    status_code=204,
)
def remove_routine(
    routine_id: uuid.UUID,
    current_user: CurrentUserDependency,
    database: DatabaseDependency,
) -> Response:
    routine = require_routine(
        database,
        current_user.id,
        routine_id,
    )

    delete_routine(
        database,
        routine,
    )

    return Response(status_code=204)
