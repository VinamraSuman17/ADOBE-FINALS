"""
Adobe Challenge - PostgreSQL Database Setup Script
Creates PostgreSQL database with proper schema for Adobe requirements
"""

import psycopg2
import os
from pathlib import Path
from urllib.parse import urlparse

# Your database connection string
DATABASE_URL = "postgresql://postgres:vinamra@localhost:5432/pdfai_db"

def parse_database_url(database_url):
    """Parse PostgreSQL URL into connection parameters"""
    parsed = urlparse(database_url)
    return {
        'host': parsed.hostname,
        'port': parsed.port or 5432,
        'database': parsed.path[1:],  # Remove leading '/'
        'user': parsed.username,
        'password': parsed.password
    }

def create_database():
    """Create PostgreSQL database with Adobe challenge schema"""
    
    print(f"🗄️ Connecting to PostgreSQL: {DATABASE_URL}")
    
    try:
        # Parse connection parameters
        conn_params = parse_database_url(DATABASE_URL)
        print(f"📡 Connection params: {conn_params['host']}:{conn_params['port']}/{conn_params['database']}")
        
        # Connect to PostgreSQL
        conn = psycopg2.connect(**conn_params)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("✅ Connected to PostgreSQL successfully!")
        
        # 1. Users/Sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_sessions (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                prior_docs_count INTEGER DEFAULT 0,
                has_current_doc BOOLEAN DEFAULT FALSE,
                total_sections INTEGER DEFAULT 0,
                status VARCHAR(50) DEFAULT 'active'
            )
        """)
        
        # 2. Prior documents table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS prior_documents (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(255) NOT NULL,
                document_id VARCHAR(255) NOT NULL,
                filename VARCHAR(500) NOT NULL,
                file_hash VARCHAR(64) NOT NULL,
                file_size BIGINT,
                content_blob BYTEA,
                upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_sections INTEGER DEFAULT 0,
                outline_json JSONB,
                embeddings_json JSONB,
                FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE
            )
        """)
        
        # 3. Current documents table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS current_documents (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(255) UNIQUE NOT NULL,
                filename VARCHAR(500) NOT NULL,
                file_hash VARCHAR(64) NOT NULL,
                file_size BIGINT,
                content_blob BYTEA,
                upload_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_sections INTEGER DEFAULT 0,
                outline_json JSONB,
                FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE
            )
        """)
        
        # 4. Text selections table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS text_selections (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(255) NOT NULL,
                selection_text TEXT NOT NULL,
                page_number INTEGER,
                selection_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                coordinates_json JSONB,
                analysis_completed BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE
            )
        """)
        
        # 5. Analysis results table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analysis_results (
                id SERIAL PRIMARY KEY,
                session_id VARCHAR(255) NOT NULL,
                selection_id INTEGER NOT NULL,
                relevant_snippets_json JSONB,
                insights_json JSONB,
                podcast_script_json JSONB,
                snippets_count INTEGER DEFAULT 0,
                processing_time_ms INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE,
                FOREIGN KEY (selection_id) REFERENCES text_selections(id) ON DELETE CASCADE
            )
        """)
        
        # 6. Document snippets table (for faster retrieval)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS document_snippets (
                id SERIAL PRIMARY KEY,
                document_id VARCHAR(255) NOT NULL,
                session_id VARCHAR(255) NOT NULL,
                section_text TEXT NOT NULL,
                page_number INTEGER,
                section_level INTEGER,
                section_index INTEGER,
                word_count INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES user_sessions(session_id) ON DELETE CASCADE
            )
        """)
        
        # Create indexes for better performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_id ON user_sessions(session_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_prior_docs_session ON prior_documents(session_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_prior_docs_hash ON prior_documents(file_hash);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_selections_session ON text_selections(session_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_analysis_session ON analysis_results(session_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_snippets_session ON document_snippets(session_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_snippets_text ON document_snippets USING GIN (to_tsvector('english', section_text));")
        
        # Insert sample data for testing
        cursor.execute("""
            INSERT INTO user_sessions (session_id, prior_docs_count, status) 
            VALUES ('test_session_123', 0, 'active')
            ON CONFLICT (session_id) DO NOTHING
        """)
        
        print("✅ Database schema created successfully!")
        
        # Show table info
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
        tables = cursor.fetchall()
        print(f"📋 Created tables: {[table[0] for table in tables]}")
        
        # Show table sizes
        cursor.execute("""
            SELECT 
                schemaname,
                tablename,
                attname,
                typename,
                char_maximum_length
            FROM pg_tables t
            LEFT JOIN pg_attribute a ON a.attrelid = t.tablename::regclass
            LEFT JOIN pg_type y ON y.oid = a.atttypid
            WHERE schemaname = 'public' 
            AND tablename IN ('user_sessions', 'prior_documents', 'current_documents', 'text_selections', 'analysis_results', 'document_snippets')
            ORDER BY tablename, attname;
        """)
        
        print("\n📊 Database schema verification:")
        for row in cursor.fetchall():
            if row[2]:  # Only show columns with names
                print(f"  {row[1]}.{row[2]}: {row[3]}")
        
    except psycopg2.Error as e:
        print(f"❌ PostgreSQL error: {e}")
        print("💡 Make sure PostgreSQL is running and credentials are correct")
    except Exception as e:
        print(f"❌ Database creation failed: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

def create_storage_directories():
    """Create necessary storage directories"""
    
    directories = [
        "storage/pdfs",
        "storage/sessions", 
        "storage/temp",
        "storage/audio",
        "storage/embeddings"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"📁 Created directory: {directory}")

def test_connection():
    """Test PostgreSQL connection"""
    try:
        conn_params = parse_database_url(DATABASE_URL)
        conn = psycopg2.connect(**conn_params)
        cursor = conn.cursor()
        
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"🐘 PostgreSQL version: {version[0]}")
        
        cursor.execute("SELECT current_database();")
        db_name = cursor.fetchone()
        print(f"📊 Connected to database: {db_name[0]}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Setting up Adobe Challenge PostgreSQL Database...")
    print(f"🔗 Database URL: {DATABASE_URL}")
    
    # Test connection first
    if test_connection():
        create_storage_directories()
        create_database()
        
        print("\n✅ PostgreSQL database setup completed!")
        print("\n📋 Next steps:")
        print("1. Start your FastAPI server: uvicorn app.main:app --reload --port 8080")
        print("2. Upload 20-30 prior PDFs")
        print("3. Upload 1 current PDF") 
        print("4. Select text to find insights!")
        print("\n🎯 Adobe Challenge ready with PostgreSQL!")
    else:
        print("\n❌ Setup failed - fix connection issues first")
        print("\n🔧 Troubleshooting:")
        print("1. Make sure PostgreSQL is running: sudo service postgresql start")
        print("2. Check if database 'pdfai_db' exists")
        print("3. Verify username 'postgres' and password 'vinamra'")
        print("4. Test connection: psql -U postgres -d pdfai_db -h localhost")
