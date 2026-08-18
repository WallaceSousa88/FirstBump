from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db

router = APIRouter(prefix="/diary", tags=["diary"])

@router.post("/", response_model=schemas.DiaryEntry)
def create_entry(entry: schemas.DiaryEntryCreate, db: Session = Depends(get_db)):
    db_entry = models.DiaryEntry(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("/", response_model=List[schemas.DiaryEntry])
def read_entries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    entries = db.query(models.DiaryEntry).order_by(models.DiaryEntry.date.desc()).offset(skip).limit(limit).all()
    return entries

@router.get("/{entry_id}", response_model=schemas.DiaryEntry)
def read_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(models.DiaryEntry).filter(models.DiaryEntry.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return db_entry

@router.delete("/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(models.DiaryEntry).filter(models.DiaryEntry.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    db.delete(db_entry)
    db.commit()
    return {"ok": True}
