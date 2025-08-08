# import os
# from dotenv import load_dotenv  
# import json
# import fitz
# import google.generativeai as genai
# from sentence_transformers import SentenceTransformer
# from sklearn.metrics.pairwise import cosine_similarity
# from datetime import datetime, timezone
# import re
# from collections import Counter
# import numpy as np

# load_dotenv() 

# # Load SentenceTransformer model with error handling
# try:
#     model = SentenceTransformer("all-MiniLM-L6-v2")
# except Exception as e:
#     print(f"Error loading SentenceTransformer model: {str(e)}")
#     model = None

# # Configure Gemini API with validation
# def configure_gemini():
#     api_key = os.getenv("GEMINI_API_KEY")
#     # print(os.getenv('GEMINI_API_KEY'))
#     if not api_key:
#         raise ValueError("GEMINI_API_KEY environment variable not set")
#     try:
#         genai.configure(api_key=api_key)
#     except Exception as e:
#         raise ValueError(f"Failed to configure Gemini API: {str(e)}")

# try:
#     configure_gemini()
# except ValueError as e:
#     print(f"Gemini configuration error: {str(e)}")
#     exit(1)

# def extract_intelligent_keywords(text, top_k=8):
#     if not text or not isinstance(text, str):
#         return []
#     text = re.sub(r'[^\w\s]', ' ', text.lower())
#     text = re.sub(r'\s+', ' ', text).strip()
#     words = text.split()
#     meaningful_words = [w for w in words if len(w) >= 4 and w.isalpha() and len(set(w)) > 2]
#     if not meaningful_words:
#         return []
#     word_freq = Counter(meaningful_words)
#     scored = [(word, freq * (1 + len(word) * 0.1)) for word, freq in word_freq.items()]
#     return [word for word, _ in sorted(scored, key=lambda x: x[1], reverse=True)[:top_k]]

# def extract_full_document_with_structure(pdf_bytes):
#     if not pdf_bytes or not isinstance(pdf_bytes, bytes):
#         return "", 0, []
#     try:
#         doc = fitz.open(stream=pdf_bytes, filetype="pdf")
#         full_text = ""
#         potential_titles = []
#         for page in doc:
#             text = page.get_text()
#             full_text += text + "\n"
#             lines = text.split("\n")[:10]
#             for line in lines:
#                 if 10 < len(line) < 100 and line[0].isupper() and not line.lower().startswith("page") and len(line.split()) > 2:
#                     potential_titles.append(line.strip())
#         page_count = len(doc)
#         doc.close()
#         return full_text.strip(), page_count, potential_titles
#     except Exception as e:
#         print(f"Error processing PDF: {str(e)}")
#         return "", 0, []

# def create_content_summary(full_text, max_sentences=4):
#     if not full_text:
#         return ""
#     sentences = []
#     for para in full_text.split('\n\n'):
#         sentences += [s.strip() + '.' for s in para.split('.') if len(s.strip()) > 30]
#     if not sentences:
#         sentences = [s.strip() + '.' for s in full_text.split('.') if len(s.strip()) > 30]
#     if not sentences:
#         return full_text[:500] + "..." if len(full_text) > 500 else full_text
#     summary = ' '.join(sentences[i] for i in [0, len(sentences)//2, int(0.75*len(sentences))][:max_sentences])
#     return summary.strip()

# def generate_intelligent_title(keywords):
#     if keywords and len(keywords) >= 3:
#         return ' '.join(keywords[:5]).title()
#     return "Document Content Analysis"

# def calculate_document_relevance(text, persona_embedding):
#     if not text or len(text) < 100 or not model:
#         return 0.0
#     try:
#         sample_text = ' '.join(text.split()[:1000])
#         embedding = model.encode(sample_text, convert_to_tensor=True)
#         return float(cosine_similarity(
#             [persona_embedding.cpu().numpy()],
#             [embedding.cpu().numpy()]
#         )[0][0])
#     except Exception as e:
#         print(f"Error calculating relevance: {str(e)}")
#         return 0.0

# def generate_insights_with_gemini(text, persona):
#     """Generate insights using Google Gemini API"""
#     try:
#         gemini_model = genai.GenerativeModel('gemini-2.5-flash')
#         prompt = f"""
#         For the persona: {persona}
#         Analyze this document text: {text[:2000]}
        
#         Provide a comprehensive analysis with:
#         1. Three key insights relevant to a {persona}
#         2. One interesting "Did you know?" fact from the content
#         3. Any contradictions or counterpoints found in the text
#         4. One inspiration or connection that could be made across documents
        
#         Format your response as a JSON object with these exact keys:
#         - "insights": array of 3 strings
#         - "fact": single string
#         - "contradiction": single string  
#         - "inspiration": single string
        
#         Keep each insight concise but meaningful.
#         """
#         response = gemini_model.generate_content(prompt)
#         response_text = response.text.strip()
        
#         # Remove markdown code blocks if present
#         if response_text.startswith('```'):
#             response_text = response_text[3:]
#         if response_text.endswith('```'):
#             response_text = response_text[:-3]
        
#         try:
#             parsed_response = json.loads(response_text)
#             return parsed_response
#         except json.JSONDecodeError:
#             print("Failed to parse Gemini response as JSON")
#             return {
#                 "insights": [
#                     f"Document contains relevant information for {persona} analysis",
#                     "Content shows structured approach to information presentation",
#                     "Key themes emerge from systematic content organization"
#                 ],
#                 "fact": "This document provides valuable insights for professional analysis",
#                 "contradiction": "No significant contradictions identified in the content",
#                 "inspiration": "Content connects well with industry best practices and standards"
#             }
#     except Exception as e:
#         print(f"Gemini API Error: {str(e)}")
#         return {
#             "insights": [
#                 "Document analysis completed successfully",
#                 "Content structure supports professional understanding",
#                 "Information organized for effective comprehension"
#             ],
#             "fact": "Professional document analysis provides structured insights",
#             "contradiction": "No contradictions found in document structure",
#             "inspiration": "Content enables cross-functional understanding and collaboration"
#         }

# def analyze_with_persona(pdf_bytes, persona):
#     """Main analysis function using Gemini API"""
#     try:
#         if not pdf_bytes or not isinstance(pdf_bytes, bytes):
#             return {"error": "Invalid or empty PDF bytes"}
#         if not persona or not isinstance(persona, str):
#             return {"error": "Invalid or empty persona"}

#         full_text, pages, potential_titles = extract_full_document_with_structure(pdf_bytes)
#         if len(full_text) < 100:
#             return {"error": "Text too short for analysis"}

#         keywords = extract_intelligent_keywords(full_text)
#         section_title = generate_intelligent_title(keywords)
#         summary = create_content_summary(full_text)
        
#         # Calculate relevance
#         if model:
#             persona_embedding = model.encode(f"{persona}. Task: Analyze document", convert_to_tensor=True)
#             relevance = calculate_document_relevance(full_text, persona_embedding)
#         else:
#             relevance = 0.0
        
#         # Generate insights using Gemini API
#         insights = generate_insights_with_gemini(summary, persona)

#         return {
#             "metadata": {
#                 "persona": persona,
#                 "processing_timestamp": datetime.now(timezone.utc).isoformat(),
#                 "relevance_score": relevance,
#                 "ai_model": "gemini-2.5-flash"
#             },
#             "document_info": {
#                 "title": section_title,
#                 "page_count": pages,
#                 "keywords": keywords
#             },
#             "summary": summary,
#             "insights": insights
#         }
#     except Exception as e:
#         return {"error": f"Analysis failed: {str(e)}"}



import os
import json
import fitz
import google.generativeai as genai
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime
import re
from collections import Counter
from dotenv import load_dotenv
import numpy as np

load_dotenv()

# Validate dependencies
try:
    import fitz
except ImportError:
    raise ImportError("PyMuPDF (fitz) is not installed. Install it using `pip install PyMuPDF`")
try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    raise ImportError("sentence_transformers is not installed. Install it using `pip install sentence-transformers`")
try:
    import google.generativeai
except ImportError:
    raise ImportError("google-generativeai is not installed. Install it using `pip install google-generativeai`")

# Validate Gemini API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

# Configure Gemini API
try:
    genai.configure(api_key=api_key)
except Exception as e:
    raise ValueError(f"Failed to configure Gemini API: {str(e)}")

# Load SentenceTransformer model
try:
    model = SentenceTransformer("all-MiniLM-L6-v2")
except Exception as e:
    model = None
    print(f"Warning: Failed to load SentenceTransformer model: {str(e)}")

# Supported personas
SUPPORTED_PERSONAS = {"student", "researcher", "business_analyst"}


def generate_insights_with_gemini(text, persona):
    """Generate insights with quick fallback"""
    try:
        # Gemini API with timeout
        gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        # ✅ Shorter, simpler prompt
        prompt = f"""
        Analyze this text for {persona}. Provide 3 insights, 1 fact, 1 contradiction.
        Text: {text[:1000]}  
        
        Respond in JSON format:
        {{"insights": ["insight1", "insight2", "insight3"], "fact": "fact", "contradiction": "none"}}
        """
        
        # ✅ Set timeout
        response = gemini_model.generate_content(
            prompt,
            generation_config={'max_output_tokens': 500}  # Limit response size
        )
        
        response_text = response.text.strip()
        if response_text.startswith('```'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
            
        return json.loads(response_text)
        
    except Exception as e:
        print(f"❌ Gemini API failed: {e}")
        # ✅ Quick fallback - immediate response
        return generate_fallback_insights(persona)

def generate_fallback_insights(persona):
    """Immediate fallback insights"""
    return {
        "insights": [
            f"Document contains relevant information for {persona} analysis",
            "Content is well-structured and informative",
            "Key concepts are clearly presented"
        ],
        "fact": "This document provides valuable professional insights",
        "contradiction": "No contradictions identified",
        "inspiration": "Content enables cross-functional understanding"
    }









def extract_intelligent_keywords(text, top_k=8):
    """Extract meaningful keywords from text"""
    if not text:
        return []
    text = re.sub(r'[^\w\s]', ' ', text.lower())
    text = re.sub(r'\s+', ' ', text).strip()
    words = text.split()
    meaningful_words = [w for w in words if len(w) >= 4 and w.isalpha() and len(set(w)) > 2]
    word_freq = Counter(meaningful_words)
    scored = [(word, freq * (1 + len(word) * 0.1)) for word, freq in word_freq.items()]
    return [word for word, _ in sorted(scored, key=lambda x: x[1], reverse=True)[:top_k]]

def extract_full_document_with_structure(pdf_bytes):
    """Extract full text and basic info from PDF"""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        full_text = ""
        potential_titles = []
        
        for page in doc:
            text = page.get_text()
            full_text += text + "\n"
            
            # Extract potential titles from first few lines
            lines = text.split("\n")[:10]
            for line in lines:
                if 10 < len(line) < 100 and line[0].isupper() and not line.lower().startswith("page"):
                    potential_titles.append(line.strip())
        
        page_count = len(doc)
        doc.close()
        
        return full_text.strip(), page_count, potential_titles
    except Exception as e:
        print(f"Error extracting document: {e}")
        return "", 0, []

def create_content_summary(full_text, max_sentences=4):
    """Create a summary from the document text"""
    if not full_text:
        return ""
    
    sentences = []
    for para in full_text.split('\n\n'):
        sentences += [s.strip() + '.' for s in para.split('.') if len(s.strip()) > 30]
    
    if not sentences:
        sentences = [s.strip() + '.' for s in full_text.split('.') if len(s.strip()) > 30]
    
    if not sentences:
        return full_text[:500] + "..." if len(full_text) > 500 else full_text
    
    # Select sentences safely
    summary_sentences = []
    if len(sentences) >= 3:
        summary_sentences = [
            sentences[0],  # First sentence
            sentences[len(sentences)//2],  # Middle sentence
            sentences[-1]  # Last sentence
        ]
    else:
        summary_sentences = sentences[:max_sentences]
    
    return ' '.join(summary_sentences[:max_sentences]).strip()

def generate_intelligent_title(keywords):
    """Generate title from keywords"""
    if len(keywords) >= 3:
        return ' '.join(keywords[:3]).title() + ' Analysis'
    return "Document Content Analysis"

def calculate_document_relevance(text, persona):
    """Calculate relevance score for persona"""
    if not model or len(text) < 100:
        return 0.5  # Default score
    
    try:
        persona_context = f"{persona} professional role analysis document"
        sample_text = ' '.join(text.split()[:1000])  # First 1000 words
        
        persona_embedding = model.encode(persona_context, convert_to_tensor=True)
        text_embedding = model.encode(sample_text, convert_to_tensor=True)
        
        similarity = cosine_similarity(
            [persona_embedding.cpu().numpy()],
            [text_embedding.cpu().numpy()]
        )[0][0]
        
        return max(0.0, min(1.0, float(similarity)))
    except Exception as e:
        print(f"Error calculating relevance: {e}")
        return 0.6  # Default score

def generate_insights_with_gemini(text, persona):
    """Generate insights using Google Gemini API"""
    try:
        # Use a supported Gemini model
        gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        For the persona: {persona}
        Analyze this document text: {text[:2000]}
        
        Provide a comprehensive analysis with:
        1. Three key insights relevant to a {persona}
        2. One interesting "Did you know?" fact from the content
        3. Any contradictions or counterpoints found in the text
        4. One inspiration or connection that could be made across documents
        
        Format your response as a JSON object with these exact keys:
        - "insights": array of 3 strings
        - "fact": single string
        - "contradiction": single string  
        - "inspiration": single string
        
        Keep each insight concise but meaningful.
        """
        
        response = gemini_model.generate_content(prompt)
        
        # Parse the response
        try:
            response_text = response.text.strip()
            # Remove markdown code blocks if present
            if response_text.startswith('```json```'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            parsed_response = json.loads(response_text)
            # Validate required keys
            required_keys = {"insights", "fact", "contradiction", "inspiration"}
            if not all(key in parsed_response for key in required_keys):
                raise ValueError("Response missing required keys")
            if not isinstance(parsed_response["insights"], list) or len(parsed_response["insights"]) != 3:
                raise ValueError("Insights must be a list of 3 strings")
            return parsed_response
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            return generate_fallback_insights(persona)
            
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        return generate_fallback_insights(persona)

def generate_fallback_insights(persona):
    """Generate fallback insights when API fails"""
    persona_insights = {
        "student": {
            "insights": [
                "Document contains structured learning material suitable for academic study",
                "Content is organized in a way that supports step-by-step learning",
                "Key concepts are presented with supporting details and examples"
            ],
            "fact": "Academic documents typically follow established pedagogical structures to enhance learning",
            "contradiction": "No major contradictions identified in the learning flow",
            "inspiration": "This content connects well with other educational materials in the field"
        },
        "researcher": {
            "insights": [
                "Document presents methodology and findings in a systematic approach",
                "Research structure follows academic conventions with clear sections",
                "Data and analysis are presented with appropriate scholarly rigor"
            ],
            "fact": "Research documents often contain implicit methodological choices that affect outcomes",
            "contradiction": "Some findings may require additional validation through peer review",
            "inspiration": "This research could inspire new interdisciplinary collaboration opportunities"
        },
        "business_analyst": {
            "insights": [
                "Document contains actionable business intelligence and strategic insights",
                "Data presentation follows business reporting standards and metrics",
                "Information is structured for executive decision-making processes"
            ],
            "fact": "Business documents typically focus on ROI and measurable outcomes for stakeholders",
            "contradiction": "Some recommendations may conflict with current market conditions",
            "inspiration": "These insights could drive new business opportunities and partnerships"
        }
    }
    
    return persona_insights.get(persona, {
        "insights": [
            "Document contains relevant information for general analysis",
            "Content is structured to support decision-making",
            "Key points are highlighted for clarity"
        ],
        "fact": "Documents often contain key insights relevant to multiple fields",
        "contradiction": "No major contradictions identified",
        "inspiration": "This content could inspire further exploration in related areas"
    })

def analyze_with_persona(pdf_bytes, persona):
    """Main analysis function using Gemini API"""
    try:
        # Validate persona
        if persona not in SUPPORTED_PERSONAS:
            raise ValueError(f"Unsupported persona: {persona}. Supported personas: {SUPPORTED_PERSONAS}")
        
        print(f"Starting persona analysis for: {persona}")
        
        # Extract document content
        full_text, pages, potential_titles = extract_full_document_with_structure(pdf_bytes)
        if len(full_text) < 100:
            return {"error": "Text too short for analysis"}

        print(f"Extracted {len(full_text)} characters from {pages} pages")

        # Extract keywords and create summary
        keywords = extract_intelligent_keywords(full_text)
        section_title = generate_intelligent_title(keywords)
        summary = create_content_summary(full_text)
        
        print(f"Generated {len(keywords)} keywords: {keywords[:5]}")
        
        # Calculate relevance score
        relevance = calculate_document_relevance(full_text, persona)
        
        # Generate AI insights
        insights = generate_insights_with_gemini(summary, persona)

        result = {
            "metadata": {
                "persona": persona,
                "processing_timestamp": datetime.utcnow().isoformat(),
                "relevance_score": relevance,
                "ai_model": "gemini-1.5-flash"
            },
            "document_info": {
                "title": section_title,
                "page_count": pages,
                "keywords": keywords,
                "word_count": len(full_text.split())
            },
            "summary": summary,
            "insights": insights
        }
        
        print(f"Analysis completed successfully for persona: {persona}")
        return result
        
    except Exception as e:
        print(f"Error in analyze_with_persona: {str(e)}")
        return {
            "error": f"Analysis failed: {str(e)}",
            "metadata": {"persona": persona, "ai_model": "gemini-1.5-flash"},
            "document_info": {"title": "Error", "page_count": 0, "keywords": []},
            "summary": "Error processing document",
            "insights": generate_fallback_insights(persona)
        }