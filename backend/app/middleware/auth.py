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

    print("AUTH DEBUG token:", token)
    print("AUTH DEBUG SECRET_KEY:", SECRET_KEY)
    print("AUTH DEBUG ALGORITHM:", ALGORITHM)

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("AUTH DEBUG payload:", payload)

        user_id = payload.get("sub")
        print("AUTH DEBUG user_id:", user_id)

        if user_id is None:
            raise credentials_exception
    except JWTError as e:
        print("AUTH DEBUG decode error:", str(e))
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    print("AUTH DEBUG db user:", user)

    if user is None:
        raise credentials_exception

    return user