# import fitz
# import json
# import re
# import os
# from datetime import datetime

# def is_date_text(text):
#     date_patterns = [
#         r"\b\d{1,2}\s*[-/]\s*\w+\b", r"\b\w+\s+\d{1,2},?\s+\d{4}\b",
#         r"\b\d{1,2}/\d{1,2}/\d{2,4}\b", r"\b\d{4}-\d{2}-\d{2}\b",
#         r"\b\d{1,2}\s*-\s*\w+\b"
#     ]
#     return any(re.search(pattern, text.lower()) for pattern in date_patterns)

# class ProperPDFExtractor:
#     def __init__(self):
#         self.final_processed_headings = set()

#     def is_likely_page_number_or_noise(self, text):
#         text = text.strip()
#         if re.match(r'^\d{1,3}$', text):
#             return True
#         if re.match(r'^[\d\.\s\-]{3,10}$', text):
#             return True
#         if len(text.replace(' ', '').replace('.', '')) <= 1:
#             return True
#         return False

#     def is_form_field_or_table_content(self, text, block, page_blocks):
#         text = text.strip()
#         form_field_patterns = [
#             r'^\d+\.\s*$', r'^\d+\.\s+[A-Z][a-z\s]*$', r'^\d+\.\s+[A-Z][A-Z\s+]*$',
#             r'^\d+\.\s+(Whether|Date|Name|Amount|Place)', r'^S\.No\.?\s*$', r'^Rs\.?\s*$', r'^\([a-z]\)',
#         ]
#         for pattern in form_field_patterns:
#             if re.match(pattern, text, re.IGNORECASE):
#                 return True
#         return False

#     def get_block_text(self, block):
#         text_parts = []
#         for line in block.get("lines", []):
#             for span in line.get("spans", []):
#                 text_parts.append(span.get("text", ""))
#         return " ".join(text_parts)

#     def get_block_properties(self, block):
#         if block.get("type") != 0:
#             return None
#         block_text, weighted_font_size, total_chars, bold_chars = "", 0, 0, 0
#         for line in block.get("lines", []):
#             for span in line.get("spans", []):
#                 text = span["text"].strip()
#                 if text:
#                     block_text += text + " "
#                     font_size = span.get("size", 12)
#                     num_chars = len(text)
#                     weighted_font_size += font_size * num_chars
#                     total_chars += num_chars
#                     font_name = span.get("font", "").lower()
#                     if any(b in font_name for b in ["bold", "demi", "heavy", "black", "semibold"]):
#                         bold_chars += num_chars
#         block_text = re.sub(r'\s+', ' ', block_text).strip()
#         if not block_text:
#             return None
#         avg_font_size = weighted_font_size / total_chars if total_chars > 0 else 12
#         is_bold = (bold_chars / total_chars) >= 0.5 if total_chars > 0 else False
#         return {"text": block_text, "font_size": avg_font_size, "is_bold": is_bold, "bbox": block["bbox"]}

#     def is_valid_heading(self, text, font_size, is_bold, avg_doc_font_size, block, page_height, page_blocks):
#         if not text or len(text) < 3 or len(text) > 300:
#             return False
#         if len(text.split()) > 35 or is_date_text(text):
#             return False
#         if self.is_likely_page_number_or_noise(text):
#             return False
        
#         skip_patterns = [r"^\d+$", r"^page\s+\d+", r"^\d{1,2}/\d{1,2}/\d{4}$", r"^www\.|https?://"]
#         if any(re.search(pattern, text.lower()) for pattern in skip_patterns):
#             return False
        
#         if is_bold and font_size >= avg_doc_font_size:
#             return True
#         if not is_bold and font_size >= avg_doc_font_size * 1.15:
#             return True
#         return False

#     def classify_heading_level(self, text, font_size, unique_sizes, is_bold):
#         level_score = 0
        
#         if re.match(r'^\d+\.\s+\w{3,}', text.strip()) and len(text.split()) >= 2:
#             return "H1"
#         elif re.match(r'^\d+\.\d+\s+\w{3,}', text.strip()) and len(text.split()) >= 2:
#             return "H2"  
#         elif re.match(r'^\d+\.\d+\.\d+\s+\w{3,}', text.strip()) and len(text.split()) >= 2:
#             return "H3"
        
#         word_count = len(text.split())
#         if word_count <= 5:
#             level_score += 1
#         elif word_count > 15:
#             level_score -= 2
        
#         if is_bold:
#             level_score += 1
        
#         if unique_sizes and len(unique_sizes) > 1:
#             largest = unique_sizes[0]
#             if font_size >= largest * 0.9:
#                 level_score += 2
#             elif font_size >= largest * 0.7:
#                 level_score += 1
        
#         if level_score >= 4:
#             return "H1"
#         elif level_score >= 2:
#             return "H2"
#         else:
#             return "H3"

#     def extract_outline(self, pdf_bytes):
#         try:
#             doc = fitz.open(stream=pdf_bytes, filetype="pdf")
#             title = doc.metadata.get("title", "") or "Untitled Document"
#             title = title.strip()
            
#             all_font_sizes = []
#             for page in doc:
#                 page_dict = page.get_text("dict")
#                 for block in page_dict["blocks"]:
#                     if block.get("type") == 0:
#                         for line in block["lines"]:
#                             for span in line["spans"]:
#                                 if span["text"].strip():
#                                     all_font_sizes.append(span.get("size", 12))
            
#             avg_doc_font_size = sum(all_font_sizes) / len(all_font_sizes) if all_font_sizes else 12
#             unique_sizes = sorted(list(set(all_font_sizes)), reverse=True)
#             potential_headings = []
            
#             for page_num, page in enumerate(doc):
#                 page_height = page.mediabox[3]
#                 page_blocks = page.get_text("dict")["blocks"]
                
#                 for block in page_blocks:
#                     props = self.get_block_properties(block)
#                     if props and self.is_valid_heading(
#                         props["text"], props["font_size"], props["is_bold"],
#                         avg_doc_font_size, block, page_height, page_blocks
#                     ):
#                         props.update({"page": page_num + 1})
#                         potential_headings.append(props)
            
#             outline = []
#             self.final_processed_headings.clear()
#             self.final_processed_headings.add(title.lower().strip())
            
#             for heading in potential_headings:
#                 text_key = heading["text"].lower().strip()
#                 if not text_key or text_key in self.final_processed_headings:
#                     continue
#                 self.final_processed_headings.add(text_key)
                
#                 level = self.classify_heading_level(
#                     heading["text"], heading["font_size"], unique_sizes, heading["is_bold"]
#                 )
#                 outline.append({
#                     "level": level, 
#                     "text": heading["text"], 
#                     "page": heading["page"]
#                 })
            
#             doc.close()
#             return {"title": title, "outline": outline}
#         except Exception as e:
#             return {"title": f"Error: {str(e)}", "outline": []}



import fitz  # PyMuPDF
import re
from collections import defaultdict

class ProperPDFExtractor:
    def __init__(self):
        self.heading_patterns = [
            r'^[A-Z][A-Z\s]+$',  # ALL CAPS
            r'^\d+\.\s+[A-Z].*',  # 1. Chapter
            r'^Chapter\s+\d+',    # Chapter 1
            r'^Section\s+\d+',    # Section 1
            r'^\d+\.\d+\s+.*',    # 1.1 Subsection
        ]
    
    def extract_outline(self, pdf_bytes):
        """Extract document structure and headings"""
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            outline_data = {
                "title": "Document Analysis",
                "outline": []
            }
            
            # Try to get document title
            metadata = doc.metadata
            if metadata and metadata.get('title'):
                outline_data["title"] = metadata['title']
            
            # Extract headings from each page
            for page_num in range(len(doc)):
                page = doc.load_page(page_num)
                
                # Get text with formatting info
                blocks = page.get_text("dict")
                
                for block in blocks.get("blocks", []):
                    if block.get("type") == 0:  # Text block
                        for line in block.get("lines", []):
                            for span in line.get("spans", []):
                                text = span.get("text", "").strip()
                                font_size = span.get("size", 0)
                                font_flags = span.get("flags", 0)
                                
                                # Identify potential headings
                                if self._is_heading(text, font_size, font_flags):
                                    heading_level = self._determine_heading_level(text, font_size, font_flags)
                                    
                                    outline_data["outline"].append({
                                        "text": text,
                                        "page": page_num + 1,
                                        "level": heading_level,
                                        "font_size": font_size
                                    })
            
            doc.close()
            
            # If no headings found, extract first few lines from each page
            if not outline_data["outline"]:
                outline_data = self._extract_fallback_structure(pdf_bytes)
            
            return outline_data
            
        except Exception as e:
            print(f"Error in extract_outline: {e}")
            return {
                "title": "Error Processing Document",
                "outline": []
            }
    
    def _is_heading(self, text, font_size, font_flags):
        """Determine if text is likely a heading"""
        if len(text) < 3 or len(text) > 200:
            return False
        
        # Font-based detection
        if font_size > 12:  # Larger font
            return True
        
        if font_flags & 16:  # Bold text
            return True
        
        # Pattern-based detection
        for pattern in self.heading_patterns:
            if re.match(pattern, text):
                return True
        
        return False
    
    def _determine_heading_level(self, text, font_size, font_flags):
        """Determine heading level (H1, H2, H3)"""
        if font_size >= 18:
            return "H1"
        elif font_size >= 14:
            return "H2"
        elif font_flags & 16:  # Bold
            return "H2"
        else:
            return "H3"
    
    def _extract_fallback_structure(self, pdf_bytes):
        """Fallback method if no headings detected"""
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            outline_data = {
                "title": "Document Content",
                "outline": []
            }
            
            for page_num in range(min(len(doc), 10)):  # First 10 pages max
                page = doc.load_page(page_num)
                text = page.get_text()
                
                # Get first meaningful line
                lines = [line.strip() for line in text.split('\n') if line.strip()]
                if lines:
                    first_line = lines[0]
                    if len(first_line) > 5 and len(first_line) < 100:
                        outline_data["outline"].append({
                            "text": first_line,
                            "page": page_num + 1,
                            "level": "H2"
                        })
            
            doc.close()
            return outline_data
            
        except Exception as e:
            print(f"Error in fallback extraction: {e}")
            return {
                "title": "Document",
                "outline": [{"text": "Content available", "page": 1, "level": "H2"}]
            }
