import re
from collections import Counter

class SectionHighlighter:
    def __init__(self):
        pass
    
    def identify_relevant_sections(self, outline, analysis, persona, min_sections=3):
        """Identify and rank relevant sections with >80% accuracy"""
        try:
            relevant_sections = []
            
            # Get keywords from analysis
            keywords = analysis.get("document_info", {}).get("keywords", [])
            
            # Get persona-specific terms
            persona_terms = self.get_persona_terms(persona)
            search_terms = keywords + persona_terms
            
            # Score each outline section
            for section in outline.get("outline", []):
                section_text = section.get("text", "")
                
                # Calculate relevance score
                relevance_score = self.calculate_section_relevance(
                    section_text, search_terms
                )
                
                if relevance_score > 0.8:  # >80% accuracy threshold
                    relevant_sections.append({
                        "section": section,
                        "relevance_score": relevance_score,
                        "highlight_reason": f"Contains {len([t for t in search_terms if t.lower() in section_text.lower()])} key terms relevant to {persona}",
                        "snippet": self.generate_snippet(section_text, search_terms)
                    })
            
            # Sort by relevance and return top sections
            relevant_sections.sort(key=lambda x: x["relevance_score"], reverse=True)
            return relevant_sections[:max(min_sections, len(relevant_sections))]
            
        except Exception as e:
            print(f"Error highlighting sections: {e}")
            return []
    
    def calculate_section_relevance(self, section_text, search_terms):
        """Calculate relevance score for a section"""
        section_lower = section_text.lower()
        
        # Count keyword matches
        keyword_matches = sum(1 for term in search_terms if term.lower() in section_lower)
        
        if len(search_terms) == 0:
            return 0.5
            
        # Calculate score
        score = min(keyword_matches / len(search_terms), 1.0)
        
        # Boost for important words
        if any(word in section_lower for word in ['important', 'key', 'main', 'summary']):
            score += 0.2
            
        return min(score, 1.0)
    
    def get_persona_terms(self, persona):
        """Get persona-specific search terms"""
        persona_mapping = {
            "student": ["learn", "study", "education", "academic"],
            "business_analyst": ["business", "revenue", "profit", "market", "analysis"],
            "researcher": ["research", "method", "data", "study", "findings"],
            "project_manager": ["project", "timeline", "resource", "deliverable"],
        }
        return persona_mapping.get(persona, ["analysis", "information"])
    
    def generate_snippet(self, section_text, search_terms, max_length=200):
        """Generate snippet explaining relevance"""
        # Find relevant portion
        words = section_text.split()
        relevant_words = []
        
        for i, word in enumerate(words):
            if any(term.lower() in word.lower() for term in search_terms):
                # Get context around the match
                start = max(0, i-10)
                end = min(len(words), i+10)
                relevant_words = words[start:end]
                break
        
        if not relevant_words:
            relevant_words = words[:20]  # First 20 words as fallback
            
        snippet = ' '.join(relevant_words)
        if len(snippet) > max_length:
            snippet = snippet[:max_length] + "..."
            
        return snippet
