"""
test_db_connection.py
─────────────────────
Run this FIRST before starting the server.
It verifies your DATABASE_URL is correct and creates all tables.

Usage:
    cd backend
    python test_db_connection.py
"""

import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

# Load .env before importing app modules
from dotenv import load_dotenv
load_dotenv()

from app.core.config import settings
from app.db.session import Base

# Import all models so Base.metadata has every table
from app.models import (       # noqa: F401
    User, HCP, Material, Sample,
    Interaction, InteractionMaterial, InteractionSample,
)


async def test_connection():
    print(f"\n{'─'*55}")
    print("  PharmaConnect CRM — Database Connection Test")
    print(f"{'─'*55}")
    print(f"  URL : {settings.DATABASE_URL}")
    print(f"{'─'*55}\n")

    engine = create_async_engine(settings.DATABASE_URL, echo=False)

    try:
        # ── Step 1: raw ping ──────────────────────────────────
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version()"))
            version = result.scalar()
            print(f"  ✓  Connected to PostgreSQL")
            print(f"     {version}\n")

        # ── Step 2: create all tables ─────────────────────────
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        print("  ✓  Tables created / verified:")
        for table in Base.metadata.sorted_tables:
            print(f"     • {table.name}")

        # ── Step 3: verify tables exist in DB ─────────────────
        async with engine.connect() as conn:
            result = await conn.execute(text("""
                SELECT tablename
                FROM   pg_tables
                WHERE  schemaname = 'public'
                ORDER  BY tablename
            """))
            db_tables = [row[0] for row in result]

        expected = {t.name for t in Base.metadata.sorted_tables}
        missing  = expected - set(db_tables)

        if missing:
            print(f"\n  ✗  Missing tables in DB: {missing}")
            sys.exit(1)
        else:
            print(f"\n  ✓  All {len(expected)} tables confirmed in database\n")

        print(f"{'─'*55}")
        print("  Database setup complete. You're good to go.")
        print(f"{'─'*55}\n")

    except Exception as e:
        print(f"\n  ✗  Connection FAILED\n")
        print(f"     Error : {type(e).__name__}: {e}\n")
        print("  Common fixes:")
        print("  1. Is PostgreSQL running?  →  docker-compose up -d db")
        print("  2. Is DATABASE_URL correct in .env?")
        print("  3. Does the database 'hcp_crm' exist?")
        print("     Create it:  CREATE DATABASE hcp_crm;")
        print()
        sys.exit(1)

    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(test_connection())