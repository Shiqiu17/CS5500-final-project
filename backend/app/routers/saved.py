from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.user import User
from app.models.saved_event import SavedEvent
from app.schemas.saved import SavedEventCreate, SavedEventResponse
from app.middleware.auth import get_current_user

router = APIRouter(prefix="/saved", tags=["Saved Events"])

@router.get("", response_model=List[SavedEventResponse])
def get_saved_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    events = db.query(SavedEvent).filter(
        SavedEvent.user_id == current_user.id
    ).order_by(SavedEvent.saved_at.desc()).all()
    
    return events

@router.post("", response_model=SavedEventResponse, status_code=status.HTTP_201_CREATED)
def save_event(
    event_data: SavedEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_event = SavedEvent(
        user_id=current_user.id,
        **event_data.dict()
    )
    
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    
    return new_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    event = db.query(SavedEvent).filter(
        SavedEvent.id == event_id,
        SavedEvent.user_id == current_user.id
    ).first()
    
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    db.delete(event)
    db.commit()
    
    return None