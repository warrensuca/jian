from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from api.deps import db_dependency, user_dependency
from api.models import Recipe_Ratings


router = APIRouter(
    prefix="/recipe_ratings",
    tags=["recipe_ratings"],
)


class RecipeRatingBase(BaseModel):
    recipe_name: str
    rating: int


class RecipeRatingCreate(RecipeRatingBase):
    pass


@router.get("/{recipe_rating_id}")
def get_recipe_rating(
    db: db_dependency, user: user_dependency, recipe_rating_id: int
):
    db_recipe_rating = (
        db.query(Recipe_Ratings)
        .filter(
            Recipe_Ratings.id == recipe_rating_id,
            Recipe_Ratings.user_id == user.get("id"),
        )
        .first()
    )

    if db_recipe_rating is None:
        raise HTTPException(status_code=404, detail="Recipe rating not found")

    return db_recipe_rating


@router.get("/")
def get_recipe_ratings(db: db_dependency, user: user_dependency):
    return (
        db.query(Recipe_Ratings)
        .filter(Recipe_Ratings.user_id == user.get("id"))
        .all()
    )


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_recipe_rating(
    db: db_dependency, user: user_dependency, recipe_rating: RecipeRatingCreate
):
    db_recipe_rating = Recipe_Ratings(
        **recipe_rating.model_dump(), user_id=user.get("id")
    )

    db.add(db_recipe_rating)
    db.commit()
    db.refresh(db_recipe_rating)

    return db_recipe_rating


@router.put("/{recipe_rating_id}")
def update_recipe_rating(
    db: db_dependency,
    user: user_dependency,
    recipe_rating_id: int,
    recipe_rating: RecipeRatingCreate,
):
    db_recipe_rating = (
        db.query(Recipe_Ratings)
        .filter(
            Recipe_Ratings.id == recipe_rating_id,
            Recipe_Ratings.user_id == user.get("id"),
        )
        .first()
    )

    if db_recipe_rating is None:
        raise HTTPException(status_code=404, detail="Recipe rating not found")

    for field, value in recipe_rating.model_dump().items():
        setattr(db_recipe_rating, field, value)

    db.commit()
    db.refresh(db_recipe_rating)

    return db_recipe_rating


@router.delete("/{recipe_rating_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe_rating(
    db: db_dependency, user: user_dependency, recipe_rating_id: int
):
    db_recipe_rating = (
        db.query(Recipe_Ratings)
        .filter(
            Recipe_Ratings.id == recipe_rating_id,
            Recipe_Ratings.user_id == user.get("id"),
        )
        .first()
    )

    if db_recipe_rating is None:
        raise HTTPException(status_code=404, detail="Recipe rating not found")

    db.delete(db_recipe_rating)
    db.commit()
