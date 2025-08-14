import os
import psycopg2
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

# PostgreSQL connection URL
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:vinamra@localhost:5432/pdfai_db")

# Create SQLAlchemy engine for PostgreSQL
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,
    echo=False  # Set to True for SQL debug logging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Database dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection():
    """Test PostgreSQL connection"""
    try:
        from urllib.parse import urlparse
        parsed = urlparse(DATABASE_URL)
        
        conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port or 5432,
            database=parsed.path[1:],
            user=parsed.username,
            password=parsed.password
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        conn.close()
        
        print("✅ PostgreSQL connection successful")
        return True
        
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        return False

if __name__ == "__main__":
    test_connection()
