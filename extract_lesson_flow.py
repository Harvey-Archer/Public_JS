#!/usr/bin/env python3
"""
PDF Lesson Flow Extractor for i-Teacher Timer
Extracts lesson flow tables from PDF files and converts them to timer text files.
"""

import os
import re
import subprocess
from pathlib import Path

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file using pdftotext."""
    result = subprocess.run(
        ['pdftotext', pdf_path, '-'],
        capture_output=True,
        text=True
    )
    return result.stdout

def parse_lesson_flow(text):
    """
    Parse the lesson flow table from extracted PDF text.
    Returns list of (activity_name, minutes) tuples.
    
    The PDF text has a structure like:
    Lesson Flow
    In Class
    [Activity Name]
    Timing
    5m
    [Activity Name]
    7m
    ...
    """
    lines = text.split('\n')
    activities = []
    
    # Find the "Lesson Flow" section and "In Class" subsection
    in_lesson_flow = False
    in_in_class = False
    
    i = 0
    pending_activity = None  # Store activity name waiting for its timing
    
    while i < len(lines):
        line = lines[i].strip()
        
        # Detect start of Lesson Flow section
        if 'Lesson Flow' in line:
            in_lesson_flow = True
            i += 1
            continue
        
        # Detect "In Class" subsection
        if in_lesson_flow and line == 'In Class':
            in_in_class = True
            i += 1
            continue
        
        # Stop when we reach content outside In Class (Homework, Key Colour, Content)
        if in_in_class and any(keyword in line for keyword in ['Homework', 'Key Colour', 'Content']):
            break
        
        # If we're in the In Class section, parse activities
        if in_in_class:
            # Skip the "Timing" header
            if line == 'Timing':
                i += 1
                continue
            
            # Check if this line looks like a timing value (e.g., "5m", "10m", "15m")
            timing_match = re.match(r'^(\d+)m$', line)
            
            if timing_match:
                minutes = int(timing_match.group(1))
                
                # Use the pending activity if we have one
                if pending_activity:
                    activities.append((pending_activity, minutes))
                    pending_activity = None
            else:
                # This might be an activity name
                # Check if it's not empty and not a section marker
                if line and line not in ['In Class']:
                    # Handle "Break (5m)" format - extract timing from parenthesis
                    break_match = re.match(r'^(.+?)\s*\((\d+)m?\)$', line)
                    if break_match:
                        activity_name = break_match.group(1).strip()
                        minutes = int(break_match.group(2))
                        activities.append((activity_name, minutes))
                    else:
                        # Store as pending activity for next timing
                        pending_activity = re.sub(r'\s+', ' ', line).strip()
        
        i += 1
    
    return activities

def generate_filename(pdf_filename):
    """
    Generate output TXT filename from PDF filename.
    Example: CK_Phonics_2_i-story_4_Day_1_Guide.pdf_1770175043.pdf -> CK_Phonics_2_i-story_4_Day_1.txt
    """
    # Remove the timestamp suffix (_1770175043.pdf)
    name = pdf_filename
    name = re.sub(r'_\d+\.pdf$', '', name)
    
    # Remove _Guide if present
    name = name.replace('_Guide', '')
    
    # Remove .pdf extension
    name = re.sub(r'\.pdf$', '', name)
    
    # Ensure underscores instead of spaces
    name = name.replace(' ', '_')
    
    # Add .txt extension
    return name + '.txt'

def write_timer_file(activities, output_path):
    """Write activities to timer file in the required format."""
    with open(output_path, 'w', encoding='utf-8') as f:
        for activity_name, minutes in activities:
            f.write(f"{activity_name}|{minutes}\n")

def validate_timer_file(filepath):
    """
    Validate the generated timer file.
    Returns (is_valid, total_minutes, warnings)
    """
    warnings = []
    total_minutes = 0
    is_valid = True
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    for line_num, line in enumerate(lines, 1):
        line = line.strip()
        if not line:
            continue
        
        # Check for exactly one pipe
        parts = line.split('|')
        if len(parts) != 2:
            warnings.append(f"Line {line_num}: Expected exactly one '|' separator")
            is_valid = False
            continue
        
        activity_name, timing_str = parts
        
        # Check activity name is non-empty
        if not activity_name.strip():
            warnings.append(f"Line {line_num}: Empty activity name")
            is_valid = False
            continue
        
        # Check timing is a valid number
        try:
            minutes = int(timing_str.strip())
            total_minutes += minutes
        except ValueError:
            warnings.append(f"Line {line_num}: Invalid timing value '{timing_str}'")
            is_valid = False
    
    # Check total minutes (should be 90 for these lessons)
    if total_minutes != 90:
        warnings.append(f"Total minutes ({total_minutes}) does not equal expected 90 minutes")
    
    return is_valid, total_minutes, warnings

def process_pdfs(input_folder, output_folder):
    """Process all PDFs in the input folder and generate timer files."""
    results = []
    
    input_path = Path(input_folder)
    output_path = Path(output_folder)
    output_path.mkdir(parents=True, exist_ok=True)
    
    pdf_files = sorted(input_path.glob('*.pdf'))
    
    for pdf_file in pdf_files:
        print(f"Processing: {pdf_file.name}")
        
        # Extract text from PDF
        text = extract_text_from_pdf(str(pdf_file))
        
        # Parse lesson flow
        activities = parse_lesson_flow(text)
        
        # Generate output filename
        output_filename = generate_filename(pdf_file.name)
        output_filepath = output_path / output_filename
        
        # Write timer file
        write_timer_file(activities, output_filepath)
        
        # Validate
        is_valid, total_minutes, warnings = validate_timer_file(output_filepath)
        
        results.append({
            'pdf_filename': pdf_file.name,
            'txt_filename': output_filename,
            'activities': activities,
            'num_sections': len(activities),
            'total_minutes': total_minutes,
            'is_valid': is_valid,
            'warnings': warnings
        })
        
        print(f"  -> Created: {output_filename}")
        print(f"     Sections: {len(activities)}, Total minutes: {total_minutes}")
        if warnings:
            for w in warnings:
                print(f"     Warning: {w}")
    
    return results

def generate_report(results, report_path):
    """Generate a markdown report of the extraction process."""
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# Extraction Report\n\n")
        
        # Summary
        f.write("## Summary\n\n")
        f.write("Processed folder:\n")
        f.write("i-Teacher_Timer/CK_Phonics_2_Rawi/All_i-story_i_explore_6\n\n")
        f.write(f"Total PDFs processed:\n{len(results)}\n\n")
        f.write(f"Total timer files created:\n{len(results)}\n\n")
        
        # Files section
        f.write("## Files\n\n")
        
        for result in results:
            f.write(f"### {result['pdf_filename']}\n\n")
            f.write(f"Output:\n{result['txt_filename']}\n\n")
            f.write("Extracted lesson flow:\n\n")
            f.write("```text\n")
            for activity_name, minutes in result['activities']:
                f.write(f"{activity_name}|{minutes}\n")
            f.write("```\n\n")
            
            f.write(f"**Sections:** {result['num_sections']}\n\n")
            f.write(f"**Total minutes:** {result['total_minutes']}\n\n")
            
            equals_90 = "Yes" if result['total_minutes'] == 90 else "No"
            f.write(f"**Equals 90 minutes:** {equals_90}\n\n")
            
            if result['warnings']:
                f.write("**Warnings:**\n")
                for warning in result['warnings']:
                    f.write(f"- {warning}\n")
                f.write("\n")
            
            f.write("---\n\n")

if __name__ == '__main__':
    input_folder = '/workspace/i-Teacher_Timer/CK_Phonics_2_Rawi/All_i-story_i_explore_6'
    output_folder = '/workspace/i-Teacher_Timer/CK_Phonics_2_Rawi/All_i-story_i_explore_6/timer_files'
    report_path = '/workspace/i-Teacher_Timer/CK_Phonics_2_Rawi/All_i-story_i_explore_6/extraction_report.md'
    
    results = process_pdfs(input_folder, output_folder)
    generate_report(results, report_path)
    
    print(f"\nExtraction complete!")
    print(f"Timer files saved to: {output_folder}")
    print(f"Report saved to: {report_path}")
