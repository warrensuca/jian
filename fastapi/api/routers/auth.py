from datetime import timedelta, datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt 
from dotenv import load_dotenv
import os
from api.models import User
from api.deps import db_dependency, bcrypt_context, user_dependency

load_dotenv()

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

SECRET_KEY = os.getenv('AUTH_SECRET_KEY')
ALGORITHM = os.getenv('AUTH_AlGORITHM')

class UserCreateRequest(BaseModel):
    username: str
    email: str
    password: str

class UserPublic(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str


def authenticate_user(username: str, password: str, db):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(username: str, user_id: int, expires_delta: timedelta):
    encode = {'sub': username, 'id': user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=UserPublic)
async def create_user(db: db_dependency, create_user_request: UserCreateRequest):
    existing_user = db.query(User).filter((User.username == create_user_request.username) | (User.email == create_user_request.email)).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username or email already exists")

    create_user_model = User(
        username = create_user_request.username,
        email = create_user_request.email,
        hashed_password = bcrypt_context.hash(create_user_request.password)
    )

    db.add(create_user_model)
    db.commit()
    db.refresh(create_user_model)
    return create_user_model

@router.get('/me', response_model=UserPublic)
async def get_current_user(user: user_dependency, db: db_dependency):
    db_user = db.query(User).filter(User.id == user.get('id')).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.post('/token', response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: db_dependency):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail = "Could not validate user")
    token = create_access_token(user.username, user.id, timedelta(minutes = 20))

    return {'access_token': token, 'token_type': 'bearer'}
