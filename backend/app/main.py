"""This is the main entry point for the FastAPI application.
It sets up the application and configures CORS middleware to allow requests from specified origins.
"""
from fastapi import FastAPI
from .middleware.cors import add_cors_middleware
app = FastAPI()
add_cors_middleware(app)

@app.get("/")
def root():
    """A simple root endpoint to verify that the API is running."""
    return {"app": "WhatToDo API"}
