from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import checklists, diary, agenda

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FirstBump API")

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(checklists.router)
app.include_router(diary.router)
app.include_router(agenda.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to FirstBump API"}
