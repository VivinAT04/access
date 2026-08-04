import uuid
from datetime import date, datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.routine import (
    Routine,
    RoutineRun,
    RoutineRunStep,
    RoutineStep,
)
from app.routines.schemas import (
    RoutineCreate,
    RoutineStepCreate,
    RoutineStepReorderRequest,
    RoutineStepUpdate,
    RoutineUpdate,
)


def get_routine(
    database: Session,
    user_id: uuid.UUID,
    routine_id: uuid.UUID,
) -> Routine | None:
    return database.scalar(
        select(Routine).where(
            Routine.id == routine_id,
            Routine.user_id == user_id,
        )
    )


def get_routine_step(
    database: Session,
    user_id: uuid.UUID,
    step_id: uuid.UUID,
) -> RoutineStep | None:
    return database.scalar(
        select(RoutineStep).where(
            RoutineStep.id == step_id,
            RoutineStep.user_id == user_id,
        )
    )


def get_run(
    database: Session,
    user_id: uuid.UUID,
    run_id: uuid.UUID,
) -> RoutineRun | None:
    return database.scalar(
        select(RoutineRun).where(
            RoutineRun.id == run_id,
            RoutineRun.user_id == user_id,
        )
    )


def get_run_step(
    database: Session,
    user_id: uuid.UUID,
    run_step_id: uuid.UUID,
) -> RoutineRunStep | None:
    return database.scalar(
        select(RoutineRunStep).where(
            RoutineRunStep.id == run_step_id,
            RoutineRunStep.user_id == user_id,
        )
    )


def list_routine_steps(
    database: Session,
    user_id: uuid.UUID,
    routine_id: uuid.UUID,
) -> list[RoutineStep]:
    return list(
        database.scalars(
            select(RoutineStep)
            .where(
                RoutineStep.routine_id == routine_id,
                RoutineStep.user_id == user_id,
            )
            .order_by(
                RoutineStep.position.asc(),
                RoutineStep.created_at.asc(),
            )
        ).all()
    )


def list_routines(
    database: Session,
    user_id: uuid.UUID,
) -> list[Routine]:
    return list(
        database.scalars(
            select(Routine)
            .where(
                Routine.user_id == user_id,
                Routine.is_active.is_(True),
            )
            .order_by(
                Routine.created_at.desc()
            )
        ).all()
    )


def routine_to_dict(
    database: Session,
    routine: Routine,
) -> dict[str, object]:
    steps = list_routine_steps(
        database=database,
        user_id=routine.user_id,
        routine_id=routine.id,
    )

    return {
        "id": routine.id,
        "user_id": routine.user_id,
        "title": routine.title,
        "description": routine.description,
        "category": routine.category,
        "is_active": routine.is_active,
        "created_at": routine.created_at,
        "updated_at": routine.updated_at,
        "steps": steps,
    }


def create_routine(
    database: Session,
    user_id: uuid.UUID,
    payload: RoutineCreate,
) -> Routine:
    routine = Routine(
        user_id=user_id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        is_active=True,
    )

    database.add(routine)
    database.flush()

    for index, step_payload in enumerate(
        payload.steps
    ):
        position = (
            step_payload.position
            if step_payload.position is not None
            else index
        )

        database.add(
            RoutineStep(
                routine_id=routine.id,
                user_id=user_id,
                title=step_payload.title,
                description=step_payload.description,
                position=position,
                estimated_minutes=(
                    step_payload.estimated_minutes
                ),
            )
        )

    database.commit()
    database.refresh(routine)

    return routine


def update_routine(
    database: Session,
    routine: Routine,
    payload: RoutineUpdate,
) -> Routine:
    values = payload.model_dump(
        exclude_unset=True,
    )

    for field, value in values.items():
        setattr(routine, field, value)

    database.add(routine)
    database.commit()
    database.refresh(routine)

    return routine


def duplicate_routine(
    database: Session,
    routine: Routine,
) -> Routine:
    source_steps = list_routine_steps(
        database=database,
        user_id=routine.user_id,
        routine_id=routine.id,
    )

    duplicated = Routine(
        user_id=routine.user_id,
        title=f"{routine.title} copy",
        description=routine.description,
        category=routine.category,
        is_active=True,
    )

    database.add(duplicated)
    database.flush()

    for step in source_steps:
        database.add(
            RoutineStep(
                routine_id=duplicated.id,
                user_id=routine.user_id,
                title=step.title,
                description=step.description,
                position=step.position,
                estimated_minutes=(
                    step.estimated_minutes
                ),
            )
        )

    database.commit()
    database.refresh(duplicated)

    return duplicated


def delete_routine(
    database: Session,
    routine: Routine,
) -> None:
    database.delete(routine)
    database.commit()


def next_step_position(
    database: Session,
    user_id: uuid.UUID,
    routine_id: uuid.UUID,
) -> int:
    maximum = database.scalar(
        select(
            func.max(RoutineStep.position)
        ).where(
            RoutineStep.user_id == user_id,
            RoutineStep.routine_id == routine_id,
        )
    )

    return 0 if maximum is None else int(maximum) + 1


def create_routine_step(
    database: Session,
    routine: Routine,
    payload: RoutineStepCreate,
) -> RoutineStep:
    position = payload.position

    if position is None:
        position = next_step_position(
            database=database,
            user_id=routine.user_id,
            routine_id=routine.id,
        )

    step = RoutineStep(
        routine_id=routine.id,
        user_id=routine.user_id,
        title=payload.title,
        description=payload.description,
        position=position,
        estimated_minutes=(
            payload.estimated_minutes
        ),
    )

    database.add(step)
    database.commit()
    database.refresh(step)

    return step


def update_routine_step(
    database: Session,
    step: RoutineStep,
    payload: RoutineStepUpdate,
) -> RoutineStep:
    values = payload.model_dump(
        exclude_unset=True,
    )

    for field, value in values.items():
        setattr(step, field, value)

    database.add(step)
    database.commit()
    database.refresh(step)

    return step


def delete_routine_step(
    database: Session,
    step: RoutineStep,
) -> None:
    routine_id = step.routine_id
    user_id = step.user_id

    database.delete(step)
    database.commit()

    steps = list_routine_steps(
        database=database,
        user_id=user_id,
        routine_id=routine_id,
    )

    for position, remaining_step in enumerate(
        steps
    ):
        remaining_step.position = position

    database.commit()


def reorder_routine_steps(
    database: Session,
    routine: Routine,
    payload: RoutineStepReorderRequest,
) -> list[RoutineStep]:
    steps = list_routine_steps(
        database=database,
        user_id=routine.user_id,
        routine_id=routine.id,
    )

    steps_by_id = {
        step.id: step
        for step in steps
    }

    for item in payload.items:
        if item.id not in steps_by_id:
            raise ValueError(
                "One or more routine steps do not belong to this routine."
            )

        steps_by_id[item.id].position = (
            item.position
        )

    database.commit()

    return list_routine_steps(
        database=database,
        user_id=routine.user_id,
        routine_id=routine.id,
    )


def start_routine_run(
    database: Session,
    routine: Routine,
    run_date: date,
) -> RoutineRun:
    existing = database.scalar(
        select(RoutineRun).where(
            RoutineRun.routine_id == routine.id,
            RoutineRun.user_id == routine.user_id,
            RoutineRun.run_date == run_date,
        )
    )

    if existing is not None:
        return existing

    steps = list_routine_steps(
        database=database,
        user_id=routine.user_id,
        routine_id=routine.id,
    )

    run = RoutineRun(
        routine_id=routine.id,
        user_id=routine.user_id,
        run_date=run_date,
        status="in-progress",
    )

    database.add(run)
    database.flush()

    for step in steps:
        database.add(
            RoutineRunStep(
                run_id=run.id,
                routine_step_id=step.id,
                user_id=routine.user_id,
                title=step.title,
                position=step.position,
                is_completed=False,
            )
        )

    database.commit()
    database.refresh(run)

    return run


def list_run_steps(
    database: Session,
    user_id: uuid.UUID,
    run_id: uuid.UUID,
) -> list[RoutineRunStep]:
    return list(
        database.scalars(
            select(RoutineRunStep)
            .where(
                RoutineRunStep.run_id == run_id,
                RoutineRunStep.user_id == user_id,
            )
            .order_by(
                RoutineRunStep.position.asc()
            )
        ).all()
    )


def synchronise_run(
    database: Session,
    run: RoutineRun,
) -> None:
    steps = list_run_steps(
        database=database,
        user_id=run.user_id,
        run_id=run.id,
    )

    if (
        steps
        and all(
            step.is_completed
            for step in steps
        )
    ):
        run.status = "completed"
        run.completed_at = (
            datetime.now(timezone.utc)
        )
    else:
        run.status = "in-progress"
        run.completed_at = None

    database.add(run)
    database.commit()


def set_run_step_completion(
    database: Session,
    run_step: RoutineRunStep,
    completed: bool,
) -> RoutineRunStep:
    run_step.is_completed = completed

    run_step.completed_at = (
        datetime.now(timezone.utc)
        if completed
        else None
    )

    database.add(run_step)
    database.commit()
    database.refresh(run_step)

    run = get_run(
        database=database,
        user_id=run_step.user_id,
        run_id=run_step.run_id,
    )

    if run is not None:
        synchronise_run(
            database=database,
            run=run,
        )

    return run_step


def run_to_dict(
    database: Session,
    run: RoutineRun,
) -> dict[str, object]:
    routine = get_routine(
        database=database,
        user_id=run.user_id,
        routine_id=run.routine_id,
    )

    steps = list_run_steps(
        database=database,
        user_id=run.user_id,
        run_id=run.id,
    )

    total_steps = len(steps)

    completed_steps = sum(
        1
        for step in steps
        if step.is_completed
    )

    percentage = (
        round(
            completed_steps
            / total_steps
            * 100
        )
        if total_steps
        else 0
    )

    return {
        "id": run.id,
        "routine_id": run.routine_id,
        "user_id": run.user_id,
        "run_date": run.run_date,
        "status": run.status,
        "started_at": run.started_at,
        "completed_at": run.completed_at,
        "routine_title": (
            routine.title
            if routine
            else "Deleted routine"
        ),
        "progress_percentage": percentage,
        "completed_steps": completed_steps,
        "total_steps": total_steps,
        "steps": steps,
    }


def list_runs(
    database: Session,
    user_id: uuid.UUID,
    limit: int = 30,
) -> list[RoutineRun]:
    return list(
        database.scalars(
            select(RoutineRun)
            .where(
                RoutineRun.user_id == user_id
            )
            .order_by(
                RoutineRun.run_date.desc(),
                RoutineRun.started_at.desc(),
            )
            .limit(limit)
        ).all()
    )


def get_routine_summary(
    database: Session,
    user_id: uuid.UUID,
    today: date,
) -> dict[str, int]:
    total_routines = database.scalar(
        select(func.count(Routine.id)).where(
            Routine.user_id == user_id,
            Routine.is_active.is_(True),
        )
    ) or 0

    active_runs_today = database.scalar(
        select(
            func.count(RoutineRun.id)
        ).where(
            RoutineRun.user_id == user_id,
            RoutineRun.run_date == today,
            RoutineRun.status
            == "in-progress",
        )
    ) or 0

    completed_runs_today = database.scalar(
        select(
            func.count(RoutineRun.id)
        ).where(
            RoutineRun.user_id == user_id,
            RoutineRun.run_date == today,
            RoutineRun.status
            == "completed",
        )
    ) or 0

    total_completed_runs = database.scalar(
        select(
            func.count(RoutineRun.id)
        ).where(
            RoutineRun.user_id == user_id,
            RoutineRun.status
            == "completed",
        )
    ) or 0

    return {
        "total_routines": int(
            total_routines
        ),
        "active_runs_today": int(
            active_runs_today
        ),
        "completed_runs_today": int(
            completed_runs_today
        ),
        "total_completed_runs": int(
            total_completed_runs
        ),
    }
