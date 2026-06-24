from datetime import timedelta, datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt 
from dotenv import load_dotenv
import os
from api.models import User
from api.deps import db_dependency, bcrypt_context

load_dotenv()