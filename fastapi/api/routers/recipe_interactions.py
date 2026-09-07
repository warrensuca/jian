from fastapi import APIRouter, HTTPException, status, Query
from pydantic import BaseModel, validator
from typing import Optional
from api.models import Recipe_Interactions
from api.deps import db_dependency, user_dependency

router = APIRouter(
    prefix='/recipe_interactions',
    tags=['recipe_interactions']
)

class InteractionCreate(BaseModel):
    recipe_name: str
    interaction_type: str
    recommendation_source: Optional[str] = None
    
    @validator('interaction_type')
    def validate_interaction_type(cls, v):
        valid_types = {"VIEW", "CLICK", "FAVORITE", "UNFAVORITE", "COOKED", "RATING"}
        if v not in valid_types:
            raise ValueError(f"interaction_type must be one of {valid_types}")
        return v
        
    @validator('recommendation_source')
    def validate_recommendation_source(cls, v):
        if v is not None:
            valid_sources = {"KNN", "NUTRITION", "CLUSTER", "SEARCH", "HOME"}
            if v not in valid_sources:
                raise ValueError(f"recommendation_source must be one of {valid_sources}")
        return v

@router.post('/', status_code=status.HTTP_201_CREATED)
def create_interaction(db: db_dependency, user: user_dependency, interaction: InteractionCreate):
    db_interaction = Recipe_Interactions(
        **interaction.model_dump(), user_id=user.get('id')
    )
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction

@router.get('/')
def get_interactions(db: db_dependency, user: user_dependency, limit: int = Query(50)):
    return db.query(Recipe_Interactions).filter(Recipe_Interactions.user_id == user.get('id')).order_by(Recipe_Interactions.created_at.desc()).limit(limit).all()

@router.get('/stats')
def get_interaction_stats(db: db_dependency, user: user_dependency):
    user_id = user.get('id')
    total_views = db.query(Recipe_Interactions).filter(
        Recipe_Interactions.user_id == user_id, 
        Recipe_Interactions.interaction_type == "VIEW"
    ).count()
    
    total_favorites = db.query(Recipe_Interactions).filter(
        Recipe_Interactions.user_id == user_id, 
        Recipe_Interactions.interaction_type == "FAVORITE"
    ).count()
    
    total_ratings = db.query(Recipe_Interactions).filter(
        Recipe_Interactions.user_id == user_id, 
        Recipe_Interactions.interaction_type == "RATING"
    ).count()
    
    recent_interactions = db.query(Recipe_Interactions).filter(
        Recipe_Interactions.user_id == user_id
    ).order_by(Recipe_Interactions.created_at.desc()).limit(5).all()
    
    recent_recipes = [{"recipe_name": i.recipe_name, "interaction_type": i.interaction_type, "created_at": i.created_at} for i in recent_interactions]
    
    return {
        "total_views": total_views,
        "total_favorites": total_favorites,
        "total_ratings": total_ratings,
        "recent_recipes": recent_recipes
    }
