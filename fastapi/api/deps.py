from typing import Annotated
import os
from dotenv import load_dotenv, find_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from .database import SessionLocal

# Find and load .env regardless of working directory
dotenv_path = find_dotenv()
if dotenv_path:
    load_dotenv(dotenv_path)
    print(f"[AUTH DEPS] Loaded .env from: {dotenv_path}")
else:
    load_dotenv()
    print("[AUTH DEPS] Warning: find_dotenv() did not find a .env file, checked default environment.")

SECRET_KEY = os.getenv('AUTH_SECRET_KEY') or "jian_fallback_auth_secret_key_2026_dev_mode"
ALGORITHM = os.getenv('AUTH_AlGORITHM') or os.getenv('AUTH_ALGORITHM') or "HS256"

print(f"[AUTH DEPS] Auth initialized with SECRET_KEY (length={len(SECRET_KEY)}), ALGORITHM='{ALGORITHM}'")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/token')
oath2_bearer_dependency = Annotated[str, Depends(oauth2_bearer)]

async def get_current_user(token: oath2_bearer_dependency):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub')
        user_id: int = payload.get('id')
        if username is None or user_id is None:
            print(f"[AUTH DEPS] Token decoded but payload missing sub or id: {payload}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate user credentials')
        
        print(f"[AUTH DEPS] Successfully validated token for user='{username}' (id={user_id})")
        return {'username': username, 'id': user_id}

    except JWTError as e:
        print(f"[AUTH DEPS] JWT decoding error: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Could not validate user credentials')

user_dependency = Annotated[dict, Depends(get_current_user)]