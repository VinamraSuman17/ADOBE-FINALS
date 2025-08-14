from sqlalchemy import Column, Integer, String, TIMESTAMP, DECIMAL, Text, ForeignKey, BigInteger, Boolean
from sqlalchemy.dialects.postgresql import JSONB  # ✅ PostgreSQL specific JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True)
    session_id = Column(String(255), unique=True, nullable=False)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    last_activity = Column(TIMESTAMP, default=datetime.utcnow)
    prior_docs_count = Column(Integer, default=0)
    has_current_doc = Column(Boolean, default=False)
    total_sections = Column(Integer, default=0)
    status = Column(String(50), default='active')
    
    # Relationships
    prior_documents = relationship("PriorDocument", back_populates="session")
    current_document = relationship("CurrentDocument", back_populates="session", uselist=False)

class PriorDocument(Base):
    __tablename__ = "prior_documents"
    
    id = Column(Integer, primary_key=True)
    session_id = Column(String(255), ForeignKey("user_sessions.session_id"))
    document_id = Column(String(255), nullable=False)
    filename = Column(String(500), nullable=False)
    file_hash = Column(String(64), nullable=False)
    file_size = Column(BigInteger)
    content_blob = Column(Text)  # Store base64 encoded content
    upload_timestamp = Column(TIMESTAMP, default=datetime.utcnow)
    total_sections = Column(Integer, default=0)
    outline_json = Column(JSONB)  # ✅ PostgreSQL JSONB
    embeddings_json = Column(JSONB)  # ✅ PostgreSQL JSONB
    
    # Relationships
    session = relationship("UserSession", back_populates="prior_documents")

class CurrentDocument(Base):
    __tablename__ = "current_documents"
    
    id = Column(Integer, primary_key=True)
    session_id = Column(String(255), ForeignKey("user_sessions.session_id"), unique=True)
    filename = Column(String(500), nullable=False)
    file_hash = Column(String(64), nullable=False)
    file_size = Column(BigInteger)
    content_blob = Column(Text)  # Store base64 encoded content
    upload_timestamp = Column(TIMESTAMP, default=datetime.utcnow)
    total_sections = Column(Integer, default=0)
    outline_json = Column(JSONB)  # ✅ PostgreSQL JSONB
    
    # Relationships
    session = relationship("UserSession", back_populates="current_document")

class TextSelection(Base):
    __tablename__ = "text_selections"
    
    id = Column(Integer, primary_key=True)
    session_id = Column(String(255), ForeignKey("user_sessions.session_id"))
    selection_text = Column(Text, nullable=False)
    page_number = Column(Integer)
    selection_timestamp = Column(TIMESTAMP, default=datetime.utcnow)
    coordinates_json = Column(JSONB)  # ✅ PostgreSQL JSONB
    analysis_completed = Column(Boolean, default=False)

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True)
    session_id = Column(String(255), ForeignKey("user_sessions.session_id"))
    selection_id = Column(Integer, ForeignKey("text_selections.id"))
    relevant_snippets_json = Column(JSONB)  # ✅ PostgreSQL JSONB
    insights_json = Column(JSONB)  # ✅ PostgreSQL JSONB
    podcast_script_json = Column(JSONB)  # ✅ PostgreSQL JSONB
    snippets_count = Column(Integer, default=0)
    processing_time_ms = Column(Integer)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

class DocumentSnippet(Base):
    __tablename__ = "document_snippets"
    
    id = Column(Integer, primary_key=True)
    document_id = Column(String(255), nullable=False)
    session_id = Column(String(255), ForeignKey("user_sessions.session_id"))
    section_text = Column(Text, nullable=False)
    page_number = Column(Integer)
    section_level = Column(Integer)
    section_index = Column(Integer)
    word_count = Column(Integer)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
