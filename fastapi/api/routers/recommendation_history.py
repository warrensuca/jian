from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from api.deps import db_dependency, user_dependency
from api.models import Recommendation_History


router = APIRouter(
    prefix="/recommendation_history",
    tags=["recommendation_history"],
)


class RecommendationHistoryBase(BaseModel):
    recipe_name: str


class RecommendationHistoryCreate(RecommendationHistoryBase):
    pass


@router.get("/{recommendation_history_id}")
def get_recommendation_history_entry(
    db: db_dependency, user: user_dependency, recommendation_history_id: int
):
    db_recommendation_history = (
        db.query(Recommendation_History)
        .filter(
            Recommendation_History.id == recommendation_history_id,
            Recommendation_History.user_id == user.get("id"),
        )
        .first()
    )

    if db_recommendation_history is None:
        raise HTTPException(
            status_code=404, detail="Recommendation history entry not found"
        )

    return db_recommendation_history


@router.get("/")
def get_recommendation_history(db: db_dependency, user: user_dependency):
    return (
        db.query(Recommendation_History)
        .filter(Recommendation_History.user_id == user.get("id"))
        .all()
    )


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_recommendation_history_entry(
    db: db_dependency,
    user: user_dependency,
    recommendation_history: RecommendationHistoryCreate,
):
    db_recommendation_history = Recommendation_History(
        **recommendation_history.model_dump(), user_id=user.get("id")
    )

    db.add(db_recommendation_history)
    db.commit()
    db.refresh(db_recommendation_history)

    return db_recommendation_history


@router.put("/{recommendation_history_id}")
def update_recommendation_history_entry(
    db: db_dependency,
    user: user_dependency,
    recommendation_history_id: int,
    recommendation_history: RecommendationHistoryCreate,
):
    db_recommendation_history = (
        db.query(Recommendation_History)
        .filter(
            Recommendation_History.id == recommendation_history_id,
            Recommendation_History.user_id == user.get("id"),
        )
        .first()
    )

    if db_recommendation_history is None:
        raise HTTPException(
            status_code=404, detail="Recommendation history entry not found"
        )

    for field, value in recommendation_history.model_dump().items():
        setattr(db_recommendation_history, field, value)

    db.commit()
    db.refresh(db_recommendation_history)

    return db_recommendation_history


@router.delete(
    "/{recommendation_history_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_recommendation_history_entry(
    db: db_dependency, user: user_dependency, recommendation_history_id: int
):
    db_recommendation_history = (
        db.query(Recommendation_History)
        .filter(
            Recommendation_History.id == recommendation_history_id,
            Recommendation_History.user_id == user.get("id"),
        )
        .first()
    )

    if db_recommendation_history is None:
        raise HTTPException(
            status_code=404, detail="Recommendation history entry not found"
        )

    db.delete(db_recommendation_history)
    db.commit()
