from datetime import timedelta, datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt 
from api.models import User
from api.deps import (
    db_dependency,
    bcrypt_context,
    user_dependency,
    SECRET_KEY,
    ALGORITHM,
)

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

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
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str


def authenticate_user(login_identifier: str, password: str, db):
    print(f"[AUTH ROUTER] Authenticating attempt with identifier='{login_identifier}'")
    # Support logging in with EITHER username OR email
    user = db.query(User).filter(
        (User.username == login_identifier) | (User.email == login_identifier)
    ).first()

    if not user:
        print(f"[AUTH ROUTER] No user found matching username or email: '{login_identifier}'")
        return False
    
    if not bcrypt_context.verify(password, user.hashed_password):
        print(f"[AUTH ROUTER] Password mismatch for user '{user.username}' (id={user.id})")
        return False

    print(f"[AUTH ROUTER] User '{user.username}' (id={user.id}, email='{user.email}') authenticated successfully")
    return user


def create_access_token(username: str, user_id: int, expires_delta: timedelta):
    encode = {'sub': username, 'id': user_id}
    expires = datetime.now(timezone.utc) + expires_delta
    encode.update({'exp': expires})
    token = jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)
    print(f"[AUTH ROUTER] Generated access token for user='{username}' (expires in {expires_delta})")
    return token


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=UserPublic)
@router.post("", status_code=status.HTTP_201_CREATED, response_model=UserPublic, include_in_schema=False)
async def create_user(db: db_dependency, create_user_request: UserCreateRequest):
    req_username = create_user_request.username.strip()
    req_email = create_user_request.email.strip().lower()

    print(f"[AUTH ROUTER] Registration requested for username='{req_username}', email='{req_email}'")

    existing_user = db.query(User).filter(
        (User.username == req_username) | (User.email == req_email)
    ).first()

    if existing_user:
        conflict_field = "Username" if existing_user.username.lower() == req_username.lower() else "Email"
        print(f"[AUTH ROUTER] Conflict on registration: {conflict_field} '{req_username if conflict_field == 'Username' else req_email}' is already taken")
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{conflict_field} is already taken. Please choose another or sign in."
        )

    create_user_model = User(
        username = req_username,
        email = req_email,
        hashed_password = bcrypt_context.hash(create_user_request.password)
    )

    db.add(create_user_model)
    db.commit()
    db.refresh(create_user_model)
    print(f"[AUTH ROUTER] New user created successfully! id={create_user_model.id}, username='{create_user_model.username}'")
    return create_user_model


@router.get('/me', response_model=UserPublic)
async def get_current_user_profile(user: user_dependency, db: db_dependency):
    print(f"[AUTH ROUTER] GET /auth/me requested by user_id={user.get('id')}")
    db_user = db.query(User).filter(User.id == user.get('id')).first()
    if not db_user:
        print(f"[AUTH ROUTER] GET /auth/me user id={user.get('id')} not found in DB")
        raise HTTPException(status_code=404, detail="User not found")
    
    print(f"[AUTH ROUTER] GET /auth/me returning data for user='{db_user.username}' (email='{db_user.email}')")
    return db_user


@router.post('/token', response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: db_dependency):
    print(f"[AUTH ROUTER] POST /auth/token login attempt with username='{form_data.username}'")
    user = authenticate_user(form_data.username.strip(), form_data.password, db)
    if not user:
        print(f"[AUTH ROUTER] Invalid credentials for login identifier: '{form_data.username}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password"
        )
    
    # 7-day token so user sessions remain active
    token = create_access_token(user.username, user.id, timedelta(days=7))
    print(f"[AUTH ROUTER] Returning token to client for user='{user.username}'")
    return {'access_token': token, 'token_type': 'bearer'}
