from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pathlib import Path

# Manually set DATABASE_URL - no dotenv needed
DATABASE_URL = "postgresql://cafe_admin:cafe123@localhost:5432/cafe_pos"

print(f"🔍 Database URL: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()