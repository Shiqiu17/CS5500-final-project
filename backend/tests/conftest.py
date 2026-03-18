"""Shared test configuration.

Override DATABASE_URL so tests connect to the Postgres container
via localhost instead of the Docker-internal 'database' hostname.
"""

import os

os.environ["DATABASE_URL"] = os.getenv("DATABASE_URL", "sqlite:///./whattodo.db")
