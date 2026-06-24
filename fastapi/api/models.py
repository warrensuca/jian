from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key = True, index = True)
    username = Column(String, unique=True, index = True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    favorited_recipes = relationship("Favorited_Recipes", back_populates="user", cascade="all, delete-orphan")
    recipe_ratings = relationship("Recipe_Ratings", back_populates="user", cascade="all, delete-orphan")
    recommendation_history = relationship("Recommendation_History", back_populates="user", cascade="all, delete-orphan")

class Favorited_Recipes(Base):
    __tablename__ = "favorited_recipes"
    id = Column(Integer, primary_key = True, index = True)
    user_id = Column(Integer, ForeignKey('user.id'))
    recipe_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="favorited_recipes")
class Recipe_Ratings(Base):
    __tablename__ = "recipe_ratings"
    id = Column(Integer, primary_key = True, index = True)
    user_id = Column(Integer, ForeignKey('user.id'))
    recipe_name = Column(String, index=True)
    rating = Column(Integer, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    user = relationship("User", back_populates="recipe_ratings")
class Recommendation_History(Base):
    __tablename__ = "reccomendation_history"
    id = Column(Integer, primary_key = True, index = True)
    user_id = Column(Integer, ForeignKey('user.id'))
    recipe_name = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    user = relationship("User", back_populates="recommendation_history")