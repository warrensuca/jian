from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from api.models import Favorited_Recipes
from api.deps import db_dependency, user_dependency

router = APIRouter(
    prefix='/favorited_recipes',
    tags=['favorited_recipes']
)

class Favorited_RecipesBase(BaseModel):
    recipe_name: str
    
class Favorited_RecipesCreate(Favorited_RecipesBase):
    pass

@router.get('/check/{recipe_name}')
def check_favorited_recipe(db: db_dependency, user: user_dependency, recipe_name: str):
    db_favorited_recipe = db.query(Favorited_Recipes).filter(
        Favorited_Recipes.recipe_name == recipe_name,
        Favorited_Recipes.user_id == user.get('id')
    ).first()
    return {"is_favorited": db_favorited_recipe is not None}

@router.get('/{favorited_recipe_id}')
def get_favorited_recipe(db: db_dependency, user: user_dependency, favorited_recipe_id: int):
    
    db_favorited_recipe = db.query(Favorited_Recipes).filter(
        Favorited_Recipes.id == favorited_recipe_id,
        Favorited_Recipes.user_id == user.get('id')
    ).first() 
    
    if db_favorited_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return db_favorited_recipe

@router.get('/')
def get_favorited_recipes(db: db_dependency, user: user_dependency):
    db_favorited_recipes =  db.query(Favorited_Recipes).filter(Favorited_Recipes.user_id == user.get('id')).all() 
    if db_favorited_recipes is None:
        raise HTTPException(status_code=404, detail="{Model} not found")
    return db_favorited_recipes

@router.post('/', status_code=status.HTTP_201_CREATED)
def create_favorited_recipe(db: db_dependency, user: user_dependency, recipe: Favorited_RecipesCreate):
    db_favorited_recipe = Favorited_Recipes(**recipe.model_dump(), user_id = user.get('id'))
    try:
        db.add(db_favorited_recipe)
        db.commit()
        db.refresh(db_favorited_recipe)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Recipe already favorited")
    return db_favorited_recipe

@router.delete('/by-name/{recipe_name}', status_code=status.HTTP_204_NO_CONTENT)
def delete_favorited_recipe_by_name(db: db_dependency, user: user_dependency, recipe_name: str): 
    db_favorited_recipe = db.query(Favorited_Recipes).filter(
        Favorited_Recipes.recipe_name == recipe_name,
        Favorited_Recipes.user_id == user.get('id')
    ).first()
    
    if db_favorited_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
        
    db.delete(db_favorited_recipe)
    db.commit()

@router.delete('/{favorited_recipe_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_favorited_recipe(db: db_dependency, user: user_dependency, favorited_recipe_id: int): 
    
    db_favorited_recipe = db.query(Favorited_Recipes).filter(
        Favorited_Recipes.id == favorited_recipe_id,
        Favorited_Recipes.user_id == user.get('id')
    ).first()
    
    if db_favorited_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
        
    db.delete(db_favorited_recipe)
    db.commit()