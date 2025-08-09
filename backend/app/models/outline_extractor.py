# # import fitz
# # import json
# # import re
# # import os
# # from datetime import datetime

# # def is_date_text(text):
# #     date_patterns = [
# #         r"\b\d{1,2}\s*[-/]\s*\w+\b", r"\b\w+\s+\d{1,2},?\s+\d{4}\b",
# #         r"\b\d{1,2}/\d{1,2}/\d{2,4}\b", r"\b\d{4}-\d{2}-\d{2}\b",
# #         r"\b\d{1,2}\s*-\s*\w+\b"
# #     ]
# #     return any(re.search(pattern, text.lower()) for pattern in date_patterns)

# # class ProperPDFExtractor:
# #     def __init__(self):
# #         self.final_processed_headings = set()

# #     def is_likely_page_number_or_noise(self, text):
# #         text = text.strip()
# #         if re.match(r'^\d{1,3}$', text):
# #             return True
# #         if re.match(r'^[\d\.\s\-]{3,10}$', text):
# #             return True
# #         if len(text.replace(' ', '').replace('.', '')) <= 1:
# #             return True
# #         return False

# #     def is_form_field_or_table_content(self, text, block, page_blocks):
# #         text = text.strip()
# #         form_field_patterns = [
# #             r'^\d+\.\s*$', r'^\d+\.\s+[A-Z][a-z\s]*$', r'^\d+\.\s+[A-Z][A-Z\s+]*$',
# #             r'^\d+\.\s+(Whether|Date|Name|Amount|Place)', r'^S\.No\.?\s*$', r'^Rs\.?\s*$', r'^\([a-z]\)',
# #         ]
# #         for pattern in form_field_patterns:
# #             if re.match(pattern, text, re.IGNORECASE):
# #                 return True
# #         return False

# #     def get_block_text(self, block):
# #         text_parts = []
# #         for line in block.get("lines", []):
# #             for span in line.get("spans", []):
# #                 text_parts.append(span.get("text", ""))
# #         return " ".join(text_parts)

# #     def get_block_properties(self, block):
# #         if block.get("type") != 0:
# #             return None
# #         block_text, weighted_font_size, total_chars, bold_chars = "", 0, 0, 0
# #         for line in block.get("lines", []):
# #             for span in line.get("spans", []):
# #                 text = span["text"].strip()
# #                 if text:
# #                     block_text += text + " "
# #                     font_size = span.get("size", 12)
# #                     num_chars = len(text)
# #                     weighted_font_size += font_size * num_chars
# #                     total_chars += num_chars
# #                     font_name = span.get("font", "").lower()
# #                     if any(b in font_name for b in ["bold", "demi", "heavy", "black", "semibold"]):
# #                         bold_chars += num_chars
# #         block_text = re.sub(r'\s+', ' ', block_text).strip()
# #         if not block_text:
# #             return None
# #         avg_font_size = weighted_font_size / total_chars if total_chars > 0 else 12
# #         is_bold = (bold_chars / total_chars) >= 0.5 if total_chars > 0 else False
# #         return {"text": block_text, "font_size": avg_font_size, "is_bold": is_bold, "bbox": block["bbox"]}

# #     def is_valid_heading(self, text, font_size, is_bold, avg_doc_font_size, block, page_height, page_blocks):
# #         if not text or len(text) < 3 or len(text) > 300:
# #             return False
# #         if len(text.split()) > 35 or is_date_text(text):
# #             return False
# #         if self.is_likely_page_number_or_noise(text):
# #             return False
        
# #         skip_patterns = [r"^\d+$", r"^page\s+\d+", r"^\d{1,2}/\d{1,2}/\d{4}$", r"^www\.|https?://"]
# #         if any(re.search(pattern, text.lower()) for pattern in skip_patterns):
# #             return False
        
# #         if is_bold and font_size >= avg_doc_font_size:
# #             return True
# #         if not is_bold and font_size >= avg_doc_font_size * 1.15:
# #             return True
# #         return False

# #     def classify_heading_level(self, text, font_size, unique_sizes, is_bold):
# #         level_score = 0
        
# #         if re.match(r'^\d+\.\s+\w{3,}', text.strip()) and len(text.split()) >= 2:
# #             return "H1"
# #         elif re.match(r'^\d+\.\d+\s+\w{3,}', text.strip()) and len(text.split()) >= 2:
# #             return "H2"  
# #         elif re.match(r'^\d+\.\d+\.\d+\s+\w{3,}', text.strip()) and len(text.split()) >= 2:
# #             return "H3"
        
# #         word_count = len(text.split())
# #         if word_count <= 5:
# #             level_score += 1
# #         elif word_count > 15:
# #             level_score -= 2
        
# #         if is_bold:
# #             level_score += 1
        
# #         if unique_sizes and len(unique_sizes) > 1:
# #             largest = unique_sizes[0]
# #             if font_size >= largest * 0.9:
# #                 level_score += 2
# #             elif font_size >= largest * 0.7:
# #                 level_score += 1
        
# #         if level_score >= 4:
# #             return "H1"
# #         elif level_score >= 2:
# #             return "H2"
# #         else:
# #             return "H3"

# #     def extract_outline(self, pdf_bytes):
# #         try:
# #             doc = fitz.open(stream=pdf_bytes, filetype="pdf")
# #             title = doc.metadata.get("title", "") or "Untitled Document"
# #             title = title.strip()
            
# #             all_font_sizes = []
# #             for page in doc:
# #                 page_dict = page.get_text("dict")
# #                 for block in page_dict["blocks"]:
# #                     if block.get("type") == 0:
# #                         for line in block["lines"]:
# #                             for span in line["spans"]:
# #                                 if span["text"].strip():
# #                                     all_font_sizes.append(span.get("size", 12))
            
# #             avg_doc_font_size = sum(all_font_sizes) / len(all_font_sizes) if all_font_sizes else 12
# #             unique_sizes = sorted(list(set(all_font_sizes)), reverse=True)
# #             potential_headings = []
            
# #             for page_num, page in enumerate(doc):
# #                 page_height = page.mediabox[3]
# #                 page_blocks = page.get_text("dict")["blocks"]
                
# #                 for block in page_blocks:
# #                     props = self.get_block_properties(block)
# #                     if props and self.is_valid_heading(
# #                         props["text"], props["font_size"], props["is_bold"],
# #                         avg_doc_font_size, block, page_height, page_blocks
# #                     ):
# #                         props.update({"page": page_num + 1})
# #                         potential_headings.append(props)
            
# #             outline = []
# #             self.final_processed_headings.clear()
# #             self.final_processed_headings.add(title.lower().strip())
            
# #             for heading in potential_headings:
# #                 text_key = heading["text"].lower().strip()
# #                 if not text_key or text_key in self.final_processed_headings:
# #                     continue
# #                 self.final_processed_headings.add(text_key)
                
# #                 level = self.classify_heading_level(
# #                     heading["text"], heading["font_size"], unique_sizes, heading["is_bold"]
# #                 )
# #                 outline.append({
# #                     "level": level, 
# #                     "text": heading["text"], 
# #                     "page": heading["page"]
# #                 })
            
# #             doc.close()
# #             return {"title": title, "outline": outline}
# #         except Exception as e:
# #             return {"title": f"Error: {str(e)}", "outline": []}



# import fitz  # PyMuPDF
# import re
# from collections import defaultdict

# class ProperPDFExtractor:
#     def __init__(self):
#         self.heading_patterns = [
#             r'^[A-Z][A-Z\s]+$',  # ALL CAPS
#             r'^\d+\.\s+[A-Z].*',  # 1. Chapter
#             r'^Chapter\s+\d+',    # Chapter 1
#             r'^Section\s+\d+',    # Section 1
#             r'^\d+\.\d+\s+.*',    # 1.1 Subsection
#         ]
    
#     def extract_outline(self, pdf_bytes):
#         """Extract document structure and headings"""
#         try:
#             doc = fitz.open(stream=pdf_bytes, filetype="pdf")
#             outline_data = {
#                 "title": "Document Analysis",
#                 "outline": []
#             }
            
#             # Try to get document title
#             metadata = doc.metadata
#             if metadata and metadata.get('title'):
#                 outline_data["title"] = metadata['title']
            
#             # Extract headings from each page
#             for page_num in range(len(doc)):
#                 page = doc.load_page(page_num)
                
#                 # Get text with formatting info
#                 blocks = page.get_text("dict")
                
#                 for block in blocks.get("blocks", []):
#                     if block.get("type") == 0:  # Text block
#                         for line in block.get("lines", []):
#                             for span in line.get("spans", []):
#                                 text = span.get("text", "").strip()
#                                 font_size = span.get("size", 0)
#                                 font_flags = span.get("flags", 0)
                                
#                                 # Identify potential headings
#                                 if self._is_heading(text, font_size, font_flags):
#                                     heading_level = self._determine_heading_level(text, font_size, font_flags)
                                    
#                                     outline_data["outline"].append({
#                                         "text": text,
#                                         "page": page_num + 1,
#                                         "level": heading_level,
#                                         "font_size": font_size
#                                     })
            
#             doc.close()
            
#             # If no headings found, extract first few lines from each page
#             if not outline_data["outline"]:
#                 outline_data = self._extract_fallback_structure(pdf_bytes)
            
#             return outline_data
            
#         except Exception as e:
#             print(f"Error in extract_outline: {e}")
#             return {
#                 "title": "Error Processing Document",
#                 "outline": []
#             }
    
#     def _is_heading(self, text, font_size, font_flags):
#         """Determine if text is likely a heading"""
#         if len(text) < 3 or len(text) > 200:
#             return False
        
#         # Font-based detection
#         if font_size > 12:  # Larger font
#             return True
        
#         if font_flags & 16:  # Bold text
#             return True
        
#         # Pattern-based detection
#         for pattern in self.heading_patterns:
#             if re.match(pattern, text):
#                 return True
        
#         return False
    
#     def _determine_heading_level(self, text, font_size, font_flags):
#         """Determine heading level (H1, H2, H3)"""
#         if font_size >= 18:
#             return "H1"
#         elif font_size >= 14:
#             return "H2"
#         elif font_flags & 16:  # Bold
#             return "H2"
#         else:
#             return "H3"
    
#     def _extract_fallback_structure(self, pdf_bytes):
#         """Fallback method if no headings detected"""
#         try:
#             doc = fitz.open(stream=pdf_bytes, filetype="pdf")
#             outline_data = {
#                 "title": "Document Content",
#                 "outline": []
#             }
            
#             for page_num in range(min(len(doc), 10)):  # First 10 pages max
#                 page = doc.load_page(page_num)
#                 text = page.get_text()
                
#                 # Get first meaningful line
#                 lines = [line.strip() for line in text.split('\n') if line.strip()]
#                 if lines:
#                     first_line = lines[0]
#                     if len(first_line) > 5 and len(first_line) < 100:
#                         outline_data["outline"].append({
#                             "text": first_line,
#                             "page": page_num + 1,
#                             "level": "H2"
#                         })
            
#             doc.close()
#             return outline_data
            
#         except Exception as e:
#             print(f"Error in fallback extraction: {e}")
#             return {
#                 "title": "Document",
#                 "outline": [{"text": "Content available", "page": 1, "level": "H2"}]
#             }


import fitz
import json
import re
import os

class ProperPDFExtractor:
    def __init__(self):
        self.final_processed_headings = set()

    def is_date_text(self, text):
        date_patterns = [
            r"\b\d{1,2}\s*[-/]\s*\w+\b", r"\b\w+\s+\d{1,2},?\s+\d{4}\b",
            r"\b\d{1,2}/\d{1,2}/\d{2,4}\b", r"\b\d{4}-\d{2}-\d{2}\b",
            r"\b\d{1,2}\s*-\s*\w+\b"
        ]
        return any(re.search(pattern, text.lower()) for pattern in date_patterns)

    def is_likely_page_number_or_noise(self, text):
        text = text.strip()
        
        if re.match(r'^\d{1,3}$', text):
            return True
            
        if re.match(r'^[\d\.\s\-]{3,10}$', text):
            return True
            
        if len(text.replace(' ', '').replace('.', '')) <= 1:
            return True
            
        return False

    def is_form_field_or_table_content(self, text, block, page_blocks):
        text = text.strip()
        
        form_field_patterns = [
            r'^\d+\.\s*$',
            r'^\d+\.\s+[A-Z][a-z\s]*$',
            r'^\d+\.\s+[A-Z][A-Z\s+]*$',
            r'^\d+\.\s+(Whether|Date|Name|Amount|Place)',
            r'^S\.No\.?\s*$',
            r'^Rs\.?\s*$',
            r'^\([a-z]\)',
        ]
        
        for pattern in form_field_patterns:
            if re.match(pattern, text, re.IGNORECASE):
                return True
        
        if self.is_part_of_form_table_structure(text, block, page_blocks):
            return True
        
        if re.match(r'^\d+\.\s+.{1,50}$', text) and len(text.split()) <= 8:
            question_indicators = ['whether', 'name', 'date', 'amount', 'place', 'designation', 'pay']
            if any(indicator in text.lower() for indicator in question_indicators):
                return True
        
        if self.is_sequential_form_numbering(text, page_blocks):
            return True
            
        return False

    def is_part_of_form_table_structure(self, text, block, page_blocks):
        bbox = block["bbox"]
        y_center = (bbox[1] + bbox[3]) / 2
        
        nearby_blocks = []
        for other_block in page_blocks:
            if other_block.get("type") == 0 and other_block["bbox"] != bbox:
                other_y = (other_block["bbox"][1] + other_block["bbox"][3]) / 2
                if abs(other_y - y_center) < 200:
                    other_text = self.get_block_text(other_block)
                    if other_text:
                        nearby_blocks.append(other_text.strip())
        
        form_pattern_count = 0
        for nearby_text in nearby_blocks:
            if re.match(r'^\d+\.', nearby_text):
                form_pattern_count += 1
        
        return form_pattern_count >= 3

    def is_sequential_form_numbering(self, text, page_blocks):
        if not re.match(r'^\d+\.', text):
            return False
        
        match = re.match(r'^(\d+)\.', text)
        if not match:
            return False
        
        current_num = int(match.group(1))
        
        sequential_count = 0
        for block in page_blocks:
            if block.get("type") == 0:
                block_text = self.get_block_text(block)
                if block_text:
                    for check_num in range(max(1, current_num-2), current_num+3):
                        if re.match(rf'^{check_num}\.', block_text.strip()):
                            sequential_count += 1
        
        return sequential_count >= 3

    def get_block_text(self, block):
        text_parts = []
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                text_parts.append(span.get("text", ""))
        return " ".join(text_parts)

    def is_table_row_content(self, text, block, page_blocks):
        text = text.strip()
        
        if re.match(r'^(\d+\.\s*){2,}$', text):
            return True
        
        if len(text) <= 10 and re.match(r'^[\d\.\s]+$', text):
            return True
        
        bbox = block["bbox"]
        x_center = (bbox[0] + bbox[2]) / 2
        y_center = (bbox[1] + bbox[3]) / 2
        
        aligned_content = 0
        for other_block in page_blocks:
            if other_block.get("type") == 0 and other_block["bbox"] != bbox:
                other_bbox = other_block["bbox"]
                other_x = (other_bbox[0] + other_bbox[2]) / 2
                other_y = (other_bbox[1] + other_bbox[3]) / 2
                
                if abs(other_x - x_center) < 20 and abs(other_y - y_center) < 100:
                    aligned_content += 1
        
        return aligned_content >= 2

    def is_bold_single_number_pattern(self, text, is_bold):
        text = text.strip()
        
        if is_bold and re.match(r'^\d+\.$', text):
            return True
        
        if is_bold and re.match(r'^(\d+\.\s*){2,}$', text):
            return True
            
        return False

    def get_unique_line_y_positions(self, blocks, tolerance=5.0):
        y_positions = []
        for block in blocks:
            if block.get('type') != 0:
                continue
            bbox = block['bbox']
            y_center = (bbox[1] + bbox[3]) / 2
            close_found = False
            for i, y in enumerate(y_positions):
                if abs(y - y_center) < tolerance:
                    y_positions[i] = (y + y_center) / 2
                    close_found = True
                    break
            if not close_found:
                y_positions.append(y_center)
        y_positions.sort()
        return y_positions

    def is_in_last_n_lines(self, block, page_blocks, n=3, tolerance=5.0):
        y_positions = self.get_unique_line_y_positions(page_blocks, tolerance)
        if len(y_positions) < n:
            last_lines_y = y_positions
        else:
            last_lines_y = y_positions[-n:]
        block_y_center = (block['bbox'][1] + block['bbox'][3]) / 2
        for y in last_lines_y:
            if abs(block_y_center - y) < tolerance:
                return True
        return False

    def has_background_color_or_bold_formatting(self, block):
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                if span.get("bgcolor") is not None and span.get("bgcolor") != 0xFFFFFF:
                    bgcolor = span.get("bgcolor")
                    if bgcolor != 0xFFFFFF and bgcolor != 0:
                        return True
                font_name = span.get("font", "").lower()
                if any(b in font_name for b in ["bold", "demi", "heavy", "black", "semibold"]):
                    return True
                flags = span.get("flags", 0)
                if flags & 2**4:
                    return True
        return False

    def is_numbered_heading_bold_check(self, text, is_bold):
        text = text.strip()
        if re.match(r'^\d+\.\s+\w{3,}', text) and len(text.split()) >= 2:
            return is_bold
        return False

    def is_block_inside_table(self, block_bbox, page_blocks):
        x0, y0, x1, y1 = block_bbox
        for block in page_blocks:
            if block.get('type') == 5:
                bx0, by0, bx1, by1 = block['bbox']
                if x0 >= bx0 and y0 >= by0 and x1 <= bx1 and y1 <= by1:
                    return True
            elif block.get('type') == 0:
                text = "".join(span.get('text', '') for line in block.get('lines', []) for span in line.get('spans', []))
                if re.match(r'^(table|fig|figure)\s*\d+', text.strip().lower()):
                    bx0, by0, bx1, by1 = block['bbox']
                    if x0 >= bx0 and y0 >= by0 and x1 <= bx1 and y1 <= by1:
                        return True
        return False

    def is_universal_heading_pattern(self, text):
        text = text.strip()
        
        patterns = [
            r'^\d+[\.\)]\s+\w{3,}.{5,}',
            r'^\w+\s*:\s*.{3,}',
            r'^[A-Z][A-Z\s]{5,20}$'
        ]
        return any(re.match(pattern, text) for pattern in patterns)

    def is_numbered_heading(self, text):
        return self.is_universal_heading_pattern(text)

    def is_text_in_middle_of_paragraph(self, block, page_blocks):
        block_bbox = block["bbox"]
        block_y = block_bbox[1]
        block_height = block_bbox[3] - block_bbox[1]
        has_text_above = False
        has_text_below = False
        for other_block in page_blocks:
            if other_block["type"] == 0 and other_block["bbox"] != block_bbox:
                other_bbox = other_block["bbox"]
                other_y = other_bbox[1]
                if other_y < block_y and (block_y - other_bbox[3]) < block_height * 1.5:
                    has_text_above = True
                if other_y > block_bbox[3] and (other_y - block_bbox[3]) < block_height * 1.5:
                    has_text_below = True
        return has_text_above and has_text_below

    def is_single_line_colon_heading(self, text):
        text = text.strip()
        if text.endswith(':') and len(text.split('\n')) == 1 and 10 <= len(text) <= 100:
            if len(text.split()) >= 3:
                return True
        return False

    def is_table_title(self, text):
        table_patterns = [
            r"^table\s+\d+", r"^figure\s+\d+", r"^fig\s*\d+",
            r"source\s*:", r"note\s*:", r"^funding\s+source",
            r"^\w+\s*(20\d{2}|2017)$"
        ]
        return any(re.search(pattern, text.lower().strip()) for pattern in table_patterns)

    def is_numbered_subpoint(self, text):
        return bool(re.match(r'^\d+\.\d+\s+', text.strip()))

    def get_surrounding_blocks(self, current_block, page_blocks):
        current_y = current_block["bbox"][3]
        return [b for b in page_blocks 
                if b.get("type") == 0 and 
                b["bbox"][1] > current_y and 
                b["bbox"][1] < current_y + 100]

    def has_subsequent_indented_content(self, blocks):
        if not blocks:
            return False
        
        avg_left_margin = sum(b["bbox"][0] for b in blocks) / len(blocks)
        return avg_left_margin > 50

    def get_block_properties(self, block):
        if block.get("type") != 0:
            return None
        block_text, weighted_font_size, total_chars, bold_chars = "", 0, 0, 0
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                text = span["text"].strip()
                if text:
                    block_text += text + " "
                    font_size = span.get("size", 12)
                    num_chars = len(text)
                    weighted_font_size += font_size * num_chars
                    total_chars += num_chars
                    font_name = span.get("font", "").lower()
                    if any(b in font_name for b in ["bold", "demi", "heavy", "black", "semibold"]):
                        bold_chars += num_chars
        block_text = re.sub(r'\s+', ' ', block_text).strip()
        if not block_text:
            return None
        avg_font_size = weighted_font_size / total_chars if total_chars > 0 else 12
        is_bold = (bold_chars / total_chars) >= 0.5 if total_chars > 0 else False
        return {"text": block_text, "font_size": avg_font_size, "is_bold": is_bold, "bbox": block["bbox"]}

    def is_valid_heading(self, text, font_size, is_bold, avg_doc_font_size, block, page_height, page_blocks):
        if not text or len(text) < 3 or len(text) > 300:
            return False
        # ✅ Fixed: Added self. before is_date_text
        if len(text.split()) > 35 or self.is_table_title(text) or self.is_numbered_subpoint(text) or self.is_date_text(text):
            return False
        if self.is_likely_page_number_or_noise(text):
            return False
        
        if self.is_form_field_or_table_content(text, block, page_blocks):
            return False
        
        if self.is_table_row_content(text, block, page_blocks):
            return False
        
        if self.is_bold_single_number_pattern(text, is_bold):
            return False
        
        skip_patterns = [r"^\d+$", r"^page\s+\d+", r"^\d{1,2}/\d{1,2}/\d{4}$", r"^www\.|https?://", r"^\s*[.]{3,}\s*$"]
        if any(re.search(pattern, text.lower()) for pattern in skip_patterns):
            return False
        bottom_threshold = page_height * 0.9
        if block["bbox"][3] > bottom_threshold:
            return False
        if self.is_in_last_n_lines(block, page_blocks, n=3):
            return False
        if self.is_block_inside_table(block["bbox"], page_blocks):
            return False
        if self.is_numbered_heading_bold_check(text, is_bold):
            return True
        if self.has_background_color_or_bold_formatting(block):
            if not self.is_text_in_middle_of_paragraph(block, page_blocks):
                return True
        if self.is_single_line_colon_heading(text):
            return True
        if is_bold:
            block_y = block["bbox"][1]
            block_height = block["bbox"][3] - block["bbox"][1]
            nearby_blocks = [
                b for b in page_blocks if b["type"] == 0 and
                abs(b["bbox"][1] - block_y) < block_height * 3 and
                b["bbox"] != block["bbox"]
            ]
            for nearby_block in nearby_blocks:
                nearby_props = self.get_block_properties(nearby_block)
                if nearby_props and not nearby_props["is_bold"] and abs(nearby_props["font_size"] - font_size) < 1.5:
                    return False
        
        if self.is_universal_heading_pattern(text):
            return True
            
        if is_bold and font_size >= avg_doc_font_size:
            return True
        if not is_bold and font_size >= avg_doc_font_size * 1.15:
            return True
        return False

    def classify_heading_level_enhanced(self, text, font_size, unique_sizes, is_bold, block, page_blocks, avg_doc_font_size):
        level_score = 0
        
        if re.match(r'^\d+\.\s+\w{3,}', text.strip()) and len(text.split()) >= 2:
            return "H1"
        elif re.match(r'^\d+\.\d+\s+\w{3,}', text.strip()) and len(text.split()) >= 2:
            return "H2"  
        elif re.match(r'^\d+\.\d+\.\d+\s+\w{3,}', text.strip()) and len(text.split()) >= 2:
            return "H3"
        
        if page_blocks:
            page_height = max(b["bbox"][3] for b in page_blocks if b.get("type") == 0) if page_blocks else 800
            y_position = block["bbox"][1]
            
            if y_position < page_height * 0.2:
                level_score += 2
            elif y_position < page_height * 0.4:
                level_score += 1
        
        word_count = len(text.split())
        if word_count <= 5:
            level_score += 1
        elif word_count > 15:
            level_score -= 2
        
        if is_bold:
            level_score += 1
        
        if unique_sizes and len(unique_sizes) > 1:
            largest = unique_sizes[0]
            if font_size >= largest * 0.9:
                level_score += 2
            elif font_size >= largest * 0.7:
                level_score += 1
        elif font_size > avg_doc_font_size * 1.2:
            level_score += 1
        
        if text.isupper() and len(text.split()) <= 5:
            level_score += 1
        
        surrounding_blocks = self.get_surrounding_blocks(block, page_blocks)
        if self.has_subsequent_indented_content(surrounding_blocks):
            level_score += 1
        
        if level_score >= 4:
            return "H1"
        elif level_score >= 2:
            return "H2"
        else:
            return "H3"

    def validate_heading_hierarchy(self, outline):
        if not outline:
            return outline
            
        cleaned_outline = []
        
        for i, heading in enumerate(outline):
            if i == 0:
                cleaned_outline.append(heading)
                continue
                
            prev_level = cleaned_outline[-1]["level"]
            current_level = heading["level"]
            
            if prev_level == "H1" and current_level == "H3":
                heading["level"] = "H2"
                
            cleaned_outline.append(heading)
        
        return cleaned_outline

    def merge_adjacent_blocks(self, blocks):
        if not blocks:
            return []
        blocks.sort(key=lambda b: (b["page"], b["bbox"][1], b["bbox"][0]))
        merged = []
        if not blocks:
            return merged
        current_block = blocks[0]
        for i in range(1, len(blocks)):
            next_block = blocks[i]
            y_diff = abs(current_block["bbox"][1] - next_block["bbox"][1])
            font_size_diff = abs(current_block["font_size"] - next_block["font_size"])
            if current_block["page"] == next_block["page"] and y_diff < 2 and font_size_diff < 1:
                current_block["text"] += " " + next_block["text"]
                current_block["bbox"] = (
                    min(current_block["bbox"][0], next_block["bbox"][0]),
                    min(current_block["bbox"][1], next_block["bbox"][1]),
                    max(current_block["bbox"][2], next_block["bbox"][2]),
                    max(current_block["bbox"][3], next_block["bbox"][3])
                )
            else:
                merged.append(current_block)
                current_block = next_block
        merged.append(current_block)
        for block in merged:
            block["text"] = re.sub(r'\s+', ' ', block["text"]).strip()
        return merged

    def _find_title_on_first_page(self, doc):
        first_page_blocks = list(doc[0].get_text("blocks"))
        if not first_page_blocks:
            return None
        largest_font_size = 0
        potential_title = ""
        for block in first_page_blocks:
            if block[4] and block[6] == 0:
                props = self.get_block_properties({"type": 0, "bbox": block[:4], "lines": [{"spans": [{"text": block[4], "size": 0, "font": ""}]}]})
                try:
                    full_block = next(b for b in doc[0].get_text("dict")["blocks"] if b["bbox"] == tuple(block[:4]))
                    props = self.get_block_properties(full_block)
                    if (props and props["font_size"] > largest_font_size and not self.is_table_title(props["text"]) and not self.is_likely_page_number_or_noise(props["text"])):
                        largest_font_size = props["font_size"]
                        potential_title = props["text"]
                except StopIteration:
                    continue
        if potential_title and len(potential_title.split()) < 20 and not self.is_numbered_subpoint(potential_title):
            return potential_title
        return None

    def extract_outline(self, pdf_input):
        """
        Extract outline from PDF input
        pdf_input can be:
        - File path (string) for original functionality
        - PDF bytes (for backend integration)
        """
        try:
            # Handle both file path and bytes input
            if isinstance(pdf_input, (str, os.PathLike)):
                # Original file path functionality
                pdf_path = pdf_input
                doc = fitz.open(pdf_path)
                title = os.path.splitext(os.path.basename(pdf_path))[0]
            else:
                # New bytes functionality for backend
                doc = fitz.open(stream=pdf_input, filetype="pdf")
                title = "Document"
            
            visible_title = self._find_title_on_first_page(doc)
            title = visible_title or doc.metadata.get("title", "") or title
            title = title.strip()
            
            all_font_sizes = []
            for page in doc:
                page_dict = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE | fitz.TEXT_PRESERVE_LIGATURES)
                for block in page_dict["blocks"]:
                    if block.get("type") == 0:
                        for line in block["lines"]:
                            for span in line["spans"]:
                                if span["text"].strip():
                                    all_font_sizes.append(span.get("size", 12))
            
            avg_doc_font_size = sum(all_font_sizes) / len(all_font_sizes) if all_font_sizes else 12
            unique_sizes = sorted(list(set(all_font_sizes)), reverse=True)
            potential_headings = []
            
            for page_num, page in enumerate(doc):
                page_height = page.mediabox[3]
                page_blocks = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE | fitz.TEXT_PRESERVE_LIGATURES)["blocks"]
                
                for block in page_blocks:
                    props = self.get_block_properties(block)
                    if props and self.is_valid_heading(
                        props["text"], props["font_size"], props["is_bold"],
                        avg_doc_font_size, block, page_height, page_blocks
                    ):
                        props.update({"page": page_num + 1})  # 1-indexed pages
                        potential_headings.append(props)
            
            merged_headings = self.merge_adjacent_blocks(potential_headings)
            outline = []
            self.final_processed_headings.clear()
            self.final_processed_headings.add(title.lower().strip())
            
            for heading in merged_headings:
                text_key = heading["text"].lower().strip()
                if not text_key or text_key in self.final_processed_headings:
                    continue
                self.final_processed_headings.add(text_key)
                
                level = self.classify_heading_level_enhanced(
                    heading["text"], heading["font_size"], unique_sizes, 
                    heading["is_bold"], {"bbox": heading["bbox"]}, 
                    [], avg_doc_font_size
                )
                outline.append({"level": level, "text": heading["text"], "page": heading["page"]})
            
            outline = self.validate_heading_hierarchy(sorted(outline, key=lambda x: x["page"]))
            
            doc.close()
            return {"title": title, "outline": outline}
        except Exception as e:
            return {"title": f"Error: {e}", "outline": []}

# Keep original main functionality for standalone use
if __name__ == "__main__":
    input_dir = "input"
    output_dir = "output" 
    
    os.makedirs(output_dir, exist_ok=True)
    
    if not os.path.exists(input_dir):
        print(f"Error: '{input_dir}' directory not found!")
        print(f"Please create '{input_dir}' folder and add your PDF files there.")
        exit(1)
    
    pdf_files = [f for f in os.listdir(input_dir) if f.lower().endswith('.pdf')]
    
    if not pdf_files:
        print(f"No PDF files found in '{input_dir}' directory!")
        print(f"Please add PDF files to the '{input_dir}' folder.")
        exit(1)
    
    for filename in pdf_files:
        pdf_path = os.path.join(input_dir, filename)
        output_filename = os.path.join(output_dir, os.path.splitext(filename)[0] + ".json")
        
        try:
            extractor = ProperPDFExtractor()
            result = extractor.extract_outline(pdf_path)
            
            with open(output_filename, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            
            print(json.dumps(result, indent=2, ensure_ascii=False))
            
        except Exception as e:
            error_result = {"title": f"Error: {str(e)}", "outline": []}
            with open(output_filename, "w", encoding="utf-8") as f:
                json.dump(error_result, f, indent=2, ensure_ascii=False)
