"""Shared test configuration.

Set DATABASE_URL to an in-memory SQLite database before any app modules
are imported, so that tests can run without a live PostgreSQL instance.
"""

import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"