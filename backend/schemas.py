from pydantic import BaseModel
from typing import Optional
from datetime import date

# Checklist
class ChecklistItemBase(BaseModel):
    title: str
    category: str
    is_completed: bool = False

class ChecklistItemCreate(ChecklistItemBase):
    pass

class ChecklistItemUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    is_completed: Optional[bool] = None

class ChecklistItem(ChecklistItemBase):
    id: int

    class Config:
        from_attributes = True

# Diary
class DiaryEntryBase(BaseModel):
    date: date
    title: str
    content: str
    symptoms: Optional[str] = None

class DiaryEntryCreate(DiaryEntryBase):
    pass

class DiaryEntry(DiaryEntryBase):
    id: int

    class Config:
        from_attributes = True

# Agenda
class AgendaEventBase(BaseModel):
    date: date
    title: str
    description: Optional[str] = None
    type: str

class AgendaEventCreate(AgendaEventBase):
    pass

class AgendaEvent(AgendaEventBase):
    id: int

    class Config:
        from_attributes = True
