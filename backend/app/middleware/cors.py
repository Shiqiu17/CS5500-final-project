"""Contains middleware for handling CORS 
(Cross-Origin Resource Sharing) in the 
FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
]

def add_cors_middleware(app: FastAPI):
    """Adds CORS middleware to the FastAPI application to allow requests from specified origins."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
