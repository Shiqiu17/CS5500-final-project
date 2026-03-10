"""This is the main entry point for the FastAPI application.
It sets up the application and configures CORS middleware to allow requests from specified origins.

Routers:
- health: Provides a simple health check endpoint to 
          verify that the API is running.
          
"""
from fastapi import FastAPI
from .middleware.cors import add_cors_middleware
from .routers import health


app = FastAPI()
add_cors_middleware(app)

@app.get("/")
def root():
    """A simple root endpoint to verify that the API is running."""
    return {"app": "WhatToDo API"}
app.include_router(health.router)
