from datetime import timedelta, datetime, timezone
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt 
from dotenv import load_dotenv
import os
from api.models import User, Favorited_Recipes
from api.deps import db_dependency, user_dependency

load_dotenv()

router = APIRouter(
    prefix='/favorited_recipes',
    tags=['favorited_recipes']
)

class Favorited_RecipesBase(BaseModel):
    recipe_name: str
    
  
class Favorited_RecipesCreate(Favorited_RecipesBase):
    pass

@router.get('/{favorited_recipe_id}')
def get_favorited_recipe(db: db_dependency, user: user_dependency, favorited_recipe_id: int):
    
    db_favorited_recipe = db.query(Favorited_Recipes).filter(
        Favorited_Recipes.id == favorited_recipe_id,
        Favorited_Recipes.user_id == user.get('id')
    ).first() 
    
    if db_favorited_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found") # FIXED detail message
    return db_favorited_recipe

@router.get('/') #get all
def get_favorited_recipes(db: db_dependency, user: user_dependency):
    db_favorited_recipes =  db.query(Favorited_Recipes).all() 
    if db_favorited_recipes is None:
        raise HTTPException(status_code=404, detail="{Model} not found")
    return db_favorited_recipes

@router.post('/', status_code=status.HTTP_201_CREATED)
def create_favorited_recipe(db: db_dependency, user: user_dependency, recipe: Favorited_RecipesCreate):
    db_favorited_recipe = Favorited_Recipes(**recipe.model_dump(), user_id = user.get('id'))
    if db_favorited_recipe is None:
        raise HTTPException(status_code=204)
    db.add(db_favorited_recipe)
    db.commit()
    db.refresh(db_favorited_recipe)
    return db_favorited_recipe

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