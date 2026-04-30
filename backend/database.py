from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment or use default
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/smartlab?schema=public")

# Create engine (with error handling)
try:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db_available = True
except Exception as e:
    print(f"Database connection failed: {e}")
    engine = None
    SessionLocal = None
    db_available = False

# Create base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    if not db_available:
        raise Exception("Database not available")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
