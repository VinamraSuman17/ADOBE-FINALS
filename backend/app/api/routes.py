from fastapi import APIRouter, UploadFile, Form, HTTPException
from app.models.outline_extractor import ProperPDFExtractor
from app.models.persona_analyzer import analyze_with_persona
from app.models.section_highlighter import SectionHighlighter
import json
from typing import List


router = APIRouter()


@router.post("/upload-multiple/")
async def upload_and_analyze_multiple(files: list[UploadFile], persona: str = Form(...)):
    """Multiple PDF upload with comparison and ranking"""
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")
        
        print(f"Received {len(files)} files for persona: {persona}")
        
        results = []
        extractor = ProperPDFExtractor()
        
        # ✅ Process each PDF individually
        for index, file in enumerate(files):
            if not file.filename.endswith('.pdf'):
                raise HTTPException(status_code=400, detail=f"File {file.filename} must be a PDF")
            
            print(f"Processing file {index + 1}: {file.filename}")
            
            # Read file content
            content = await file.read()
            
            # Round 1A: Extract outline
            outline_result = extractor.extract_outline(content)
            
            # Round 1B: Persona analysis
            analysis_result = analyze_with_persona(content, persona)
            
            # Store individual result
            file_result = {
                "file_index": index + 1,
                "filename": file.filename,
                "file_size": len(content),
                "outline": outline_result,
                "analysis": analysis_result,
                "connections": generate_connections(outline_result, analysis_result)
            }
            
            results.append(file_result)
        
        # ✅ Generate comparison and ranking
        comparison_analysis = generate_comparison_analysis(results, persona)
        
        return {
            "success": True,
            "total_files": len(files),
            "persona": persona,
            "individual_results": results,
            "comparison": comparison_analysis,
            "ranking": generate_ranking(results, persona)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

def generate_comparison_analysis(results, persona):
    """Generate comparative analysis across multiple PDFs"""
    comparison = {
        "overview": "",
        "common_themes": [],
        "unique_insights": [],
        "content_distribution": [],
        "persona_relevance_comparison": []
    }
    
    # Extract all keywords from all documents
    all_keywords = []
    relevance_scores = []
    page_counts = []
    
    for result in results:
        if result["analysis"].get("document_info", {}).get("keywords"):
            all_keywords.extend(result["analysis"]["document_info"]["keywords"])
        
        if result["analysis"].get("metadata", {}).get("relevance_score"):
            relevance_scores.append({
                "filename": result["filename"],
                "score": result["analysis"]["metadata"]["relevance_score"]
            })
        
        page_counts.append({
            "filename": result["filename"],
            "pages": result["analysis"].get("document_info", {}).get("page_count", 0)
        })
    
    # Find common themes (keywords appearing in multiple documents)
    from collections import Counter
    keyword_counts = Counter(all_keywords)
    common_themes = [keyword for keyword, count in keyword_counts.items() if count > 1]
    
    comparison["common_themes"] = common_themes[:10]  # Top 10 common themes
    comparison["persona_relevance_comparison"] = relevance_scores
    comparison["content_distribution"] = page_counts
    
    # Generate overview
    avg_relevance = sum([r["score"] for r in relevance_scores]) / len(relevance_scores) if relevance_scores else 0
    total_pages = sum([p["pages"] for p in page_counts])
    
    comparison["overview"] = f"Analyzed {len(results)} documents with {total_pages} total pages. Average relevance for {persona} persona: {avg_relevance:.2%}. Found {len(common_themes)} common themes across documents."
    
    return comparison

def generate_ranking(results, persona):
    """Rank documents based on persona relevance and content quality"""
    rankings = []
    
    for result in results:
        score_components = {
            "relevance_score": result["analysis"].get("metadata", {}).get("relevance_score", 0) * 0.4,
            "content_density": min(len(result["analysis"].get("document_info", {}).get("keywords", [])) / 10, 1) * 0.3,
            "structure_score": min(len(result["outline"].get("outline", [])) / 10, 1) * 0.2,
            "insights_quality": min(len(result["analysis"].get("insights", {}).get("insights", [])) / 5, 1) * 0.1
        }
        
        final_score = sum(score_components.values())
        
        rankings.append({
            "rank": 0,  # Will be set after sorting
            "filename": result["filename"],
            "final_score": final_score,
            "score_breakdown": score_components,
            "key_strengths": [],
            "persona_fit": result["analysis"].get("metadata", {}).get("persona", "")
        })
    
    # Sort by final score (descending)
    rankings.sort(key=lambda x: x["final_score"], reverse=True)
    
    # Assign ranks
    for index, ranking in enumerate(rankings):
        ranking["rank"] = index + 1
        
        # Add key strengths based on highest scoring components
        strengths = []
        breakdown = ranking["score_breakdown"]
        if breakdown["relevance_score"] > 0.3:
            strengths.append("High persona relevance")
        if breakdown["content_density"] > 0.2:
            strengths.append("Rich content")
        if breakdown["structure_score"] > 0.15:
            strengths.append("Well-structured")
        if breakdown["insights_quality"] > 0.08:
            strengths.append("Quality insights")
        
        ranking["key_strengths"] = strengths
    
    return rankings





@router.post("/upload/")
async def upload_and_analyze(file: UploadFile, persona: str = Form(...)):
    # print('hey')
    """Enhanced upload with Gemini API analysis"""
    try:
        # Check if file is PDF
        # return {
        #     "sucess": "hey"
        # }
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="File must be a PDF")
        # print('100')
        # Read file content
        content = await file.read()
        
        # Round 1A: Extract outline using existing logic
        extractor = ProperPDFExtractor()
        outline_result = extractor.extract_outline(content)
        
        # Round 1B: Perform persona analysis using Gemini API
        analysis_result = analyze_with_persona(content, persona)
        
        # NEW: Connect the Dots Analysis
        connections = generate_connections(outline_result, analysis_result)
        
        highlighter = SectionHighlighter()
        highlighted_sections = highlighter.identify_relevant_sections(
            outline_result, analysis_result, persona
        )

        return {
            "success": True,
            "filename": file.filename,
            "outline": outline_result,
            "analysis": analysis_result,
            "connections": connections,
            "enhanced_insights": generate_enhanced_insights(outline_result, analysis_result, connections)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

def generate_connections(outline_result, analysis_result):
    """Generate connections between outline and analysis"""
    connections = {
        "section_keyword_matches": [],
        "heading_insight_links": [],
        "page_content_correlation": [],
        "semantic_clusters": []
    }
    
    if not outline_result.get("outline") or not analysis_result.get("document_info"):
        return connections
    
    outline_sections = outline_result["outline"]
    keywords = analysis_result.get("document_info", {}).get("keywords", [])
    insights = analysis_result.get("insights", {}).get("insights", [])
    
    # Section-Keyword Matching
    for section in outline_sections:
        matching_keywords = []
        for keyword in keywords:
            if keyword.lower() in section["text"].lower():
                matching_keywords.append(keyword)
        
        if matching_keywords:
            connections["section_keyword_matches"].append({
                "section": section["text"],
                "page": section["page"],
                "level": section["level"],
                "keywords": matching_keywords,
                "relevance_score": len(matching_keywords) / len(keywords) if keywords else 0
            })
    
    # Heading-Insight Links
    for section in outline_sections:
        related_insights = []
        for insight in insights:
            if any(word in insight.lower() for word in section["text"].lower().split()):
                related_insights.append(insight)
        
        if related_insights:
            connections["heading_insight_links"].append({
                "heading": section["text"],
                "page": section["page"],
                "insights": related_insights
            })
    
    # Page Content Correlation
    page_groups = {}
    for section in outline_sections:
        page = section["page"]
        if page not in page_groups:
            page_groups[page] = []
        page_groups[page].append(section)
    
    for page, sections in page_groups.items():
        if len(sections) > 1:
            connections["page_content_correlation"].append({
                "page": page,
                "sections": [s["text"] for s in sections],
                "density_score": len(sections)
            })
    
    return connections

def generate_enhanced_insights(outline_result, analysis_result, connections):
    """Generate enhanced insights from connections"""
    enhanced = {
        "document_structure_analysis": "",
        "content_flow_patterns": [],
        "key_focus_areas": [],
        "missing_connections": [],
        "ai_model_used": analysis_result.get("metadata", {}).get("ai_model", "gemini-2.5-flash")
    }
    
    total_sections = len(outline_result.get("outline", []))
    connected_sections = len(connections.get("section_keyword_matches", []))
    
    if total_sections > 0:
        connection_ratio = connected_sections / total_sections
        if connection_ratio > 0.7:
            enhanced["document_structure_analysis"] = "Well-structured document with strong thematic coherence (Gemini Analysis)"
        elif connection_ratio > 0.4:
            enhanced["document_structure_analysis"] = "Moderately structured document with some thematic gaps (Gemini Analysis)"
        else:
            enhanced["document_structure_analysis"] = "Document may benefit from better structural organization (Gemini Analysis)"
    
    # Content flow patterns
    if connections.get("page_content_correlation"):
        dense_pages = [p for p in connections["page_content_correlation"] if p["density_score"] > 2]
        enhanced["content_flow_patterns"] = [f"Page {p['page']} has high content density" for p in dense_pages]
    
    return enhanced

@router.get("/health/")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "message": "PDF AI Assistant API with Gemini AI is running",
        "ai_model": "gemini-2.5-flash"
    }
