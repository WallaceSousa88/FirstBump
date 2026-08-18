from sqlalchemy import Column, Integer, String, Boolean, Date
from database import Base

class ChecklistItem(Base):
    __tablename__ = "checklists"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String, index=True) # e.g., 'enxoval', 'maternidade'
    is_completed = Column(Boolean, default=False)

class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    title = Column(String)
    content = Column(String)
    symptoms = Column(String, nullable=True) # Comma separated or simple text

class AgendaEvent(Base):
    __tablename__ = "agenda_events"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    type = Column(String) # e.g., 'consulta', 'exame'
