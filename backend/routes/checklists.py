from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db

router = APIRouter(prefix="/checklists", tags=["checklists"])

@router.post("/", response_model=schemas.ChecklistItem)
def create_item(item: schemas.ChecklistItemCreate, db: Session = Depends(get_db)):
    db_item = models.ChecklistItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/", response_model=List[schemas.ChecklistItem])
def read_items(skip: int = 0, limit: int = 100, category: str = None, db: Session = Depends(get_db)):
    query = db.query(models.ChecklistItem)
    if category:
        query = query.filter(models.ChecklistItem.category == category)
    items = query.offset(skip).limit(limit).all()
    return items

@router.patch("/{item_id}", response_model=schemas.ChecklistItem)
def update_item(item_id: int, item: schemas.ChecklistItemUpdate, db: Session = Depends(get_db)):
    db_item = db.query(models.ChecklistItem).filter(models.ChecklistItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(models.ChecklistItem).filter(models.ChecklistItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(db_item)
    db.commit()
    return {"ok": True}
