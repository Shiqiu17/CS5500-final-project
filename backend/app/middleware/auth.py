from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    # print("AUTH DEBUG token:", token)
    # print("AUTH DEBUG SECRET_KEY:", SECRET_KEY)
    # print("AUTH DEBUG ALGORITHM:", ALGORITHM)

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # print("AUTH DEBUG payload:", payload)

        user_id = payload.get("sub")
        # print("AUTH DEBUG user_id:", user_id)

        if user_id is None:
            raise credentials_exception
        user_id = int(user_id)
    except JWTError as e:
        # print("AUTH DEBUG decode error:", str(e))
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    # print("AUTH DEBUG db user:", user)

    if user is None:
        raise credentials_exception

    return user

security_optional = HTTPBearer(auto_error=False)
def get_optional_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_optional),
    db: Session = Depends(get_db)
) -> User | None:
    if credentials is None:
        return None
    token = credentials.credentials
    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        user_id = int(user_id)
    except JWTError:
        return None 
    return db.query(User).filter(User.id == user_id).first()
