from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db

router = APIRouter(prefix="/agenda", tags=["agenda"])

@router.post("/", response_model=schemas.AgendaEvent)
def create_event(event: schemas.AgendaEventCreate, db: Session = Depends(get_db)):
    db_event = models.AgendaEvent(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/", response_model=List[schemas.AgendaEvent])
def read_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    events = db.query(models.AgendaEvent).order_by(models.AgendaEvent.date.asc()).offset(skip).limit(limit).all()
    return events

@router.delete("/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(models.AgendaEvent).filter(models.AgendaEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(db_event)
    db.commit()
    return {"ok": True}
