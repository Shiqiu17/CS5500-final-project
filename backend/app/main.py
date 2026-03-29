from fastapi import FastAPI
from .middleware.cors import add_cors_middleware
from .routers import health, events, planner
from .routers.auth import router as auth_router
from .routers.saved import router as saved_router
from .routers.users import router as users_router
from .db.database import init_db

init_db()

app = FastAPI()
add_cors_middleware(app)

@app.get("/")
def root():
    return {"app": "WhatToDo API"}

app.include_router(health.router)
app.include_router(events.router)
app.include_router(auth_router)
app.include_router(saved_router)
app.include_router(planner.router)
app.include_router(users_router)
