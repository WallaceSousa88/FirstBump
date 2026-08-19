from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models, schemas
from database import get_db

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/{key}", response_model=schemas.AppSetting)
def get_setting(key: str, db: Session = Depends(get_db)):
    setting = db.query(models.AppSetting).filter(models.AppSetting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting

@router.post("/", response_model=schemas.AppSetting)
def set_setting(setting: schemas.AppSettingCreate, db: Session = Depends(get_db)):
    db_setting = db.query(models.AppSetting).filter(models.AppSetting.key == setting.key).first()
    if db_setting:
        db_setting.value = setting.value
    else:
        db_setting = models.AppSetting(key=setting.key, value=setting.value)
        db.add(db_setting)
    
    db.commit()
    db.refresh(db_setting)
    return db_setting
