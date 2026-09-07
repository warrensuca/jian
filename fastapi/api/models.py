from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key = True, index = True)
    username = Column(String, unique=False, index = True)
    email = Column(String, unique=True, index = True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    favorited_recipes = relationship("Favorited_Recipes", back_populates="user", cascade="all, delete-orphan")
    recipe_ratings = relationship("Recipe_Ratings", back_populates="user", cascade="all, delete-orphan")
    recipe_interactions = relationship("Recipe_Interactions", back_populates="user", cascade="all, delete-orphan")

class Favorited_Recipes(Base):
    __tablename__ = "favorited_recipes"
    id = Column(Integer, primary_key = True, index = True)
    user_id = Column(Integer, ForeignKey('user.id'))
    recipe_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    __table_args__ = (UniqueConstraint('user_id', 'recipe_name', name='uq_user_recipe_favorite'),)

    user = relationship("User", back_populates="favorited_recipes")
    
class Recipe_Ratings(Base):
    __tablename__ = "recipe_ratings"
    id = Column(Integer, primary_key = True, index = True)
    user_id = Column(Integer, ForeignKey('user.id'))
    recipe_name = Column(String, index=True)
    rating = Column(Integer, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (UniqueConstraint('user_id', 'recipe_name', name='uq_user_recipe_rating'),)

    user = relationship("User", back_populates="recipe_ratings")
    
class Recipe_Interactions(Base):
    __tablename__ = "recipe_interactions"
    id = Column(Integer, primary_key = True, index = True)
    user_id = Column(Integer, ForeignKey('user.id'))
    recipe_name = Column(String, index=True)
    interaction_type = Column(String, index=True)
    recommendation_source = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    user = relationship("User", back_populates="recipe_interactions")