from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import engine
from database import models
from routers import auth, events, tasks, finances, habits, ai_chat, ranking

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Secretar.IA API",
    description="Backend do secretário pessoal com IA",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(events.router)
app.include_router(tasks.router)
app.include_router(finances.router)
app.include_router(habits.router)
app.include_router(ai_chat.router)
app.include_router(ranking.router)

@app.get("/")
def root():
    return {"status": "Secretar.IA online 🤖"}