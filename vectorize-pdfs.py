#!/usr/bin/env python3
"""
Script to vectorize PDFs and store embeddings in Supabase
Uses OpenAI embeddings and PyPDF2 for text extraction
"""

import os
import sys
from pathlib import Path
import PyPDF2
from openai import OpenAI
from supabase import create_client, Client
from typing import List, Dict
import time

# Configuration
SUPABASE_URL = "https://rcfgpdrrnhltozrnsgic.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Service role key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
STORAGE_BUCKET = "pdfs"  # Supabase storage bucket name

# Initialize clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# PDF files to process
PDF_FILES = [
    "Krajcik & Blumenfeld 2006_PBL in Handbook of the Learning Sciences.pdf",
    "Guo et al. 2020_PBL Review.pdf",
    "Condlife et al. 2017_PBL Review.pdf",
    "Blimenfeld et al. 1991_Motivating_project_based_learning_Sustai.pdf",
    "Thomas 2000_Review PBL.pdf"
]

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
    """Split text into overlapping chunks"""
    chunks = []
    start = 0
    text_len = len(text)
    
    while start < text_len:
        end = start + chunk_size
        chunk = text[start:end]
        
        # Try to break at sentence boundary
        if end < text_len:
            last_period = chunk.rfind('.')
            if last_period > chunk_size * 0.5:  # Only if period is in latter half
                end = start + last_period + 1
                chunk = text[start:end]
        
        chunks.append(chunk.strip())
        start = end - overlap
    
    return chunks

def extract_text_from_pdf(pdf_path: str) -> Dict[int, str]:
    """Extract text from PDF, return dict of page_number: text"""
    pages_text = {}
    
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        num_pages = len(pdf_reader.pages)
        
        print(f"  📄 Extracting {num_pages} pages...")
        
        for page_num in range(num_pages):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            pages_text[page_num + 1] = text  # 1-indexed pages
    
    return pages_text

def generate_embedding(text: str) -> List[float]:
    """Generate embedding using OpenAI API"""
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",  # or "text-embedding-ada-002"
        input=text
    )
    return response.data[0].embedding

def upload_pdf_to_storage(pdf_path: str, document_name: str) -> str:
    """Upload PDF to Supabase storage and return public URL"""
    try:
        with open(pdf_path, 'rb') as file:
            file_data = file.read()
            
        # Upload to storage
        response = supabase.storage.from_(STORAGE_BUCKET).upload(
            document_name,
            file_data,
            file_options={"content-type": "application/pdf", "upsert": "true"}
        )
        
        # Get public URL
        public_url = supabase.storage.from_(STORAGE_BUCKET).get_public_url(document_name)
        
        print(f"  ✅ Uploaded to storage: {public_url}")
        return public_url
        
    except Exception as e:
        print(f"  ❌ Storage upload error: {e}")
        # Return a fallback URL if upload fails
        return f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}/{document_name}"

def process_pdf(pdf_path: str):
    """Process a single PDF: extract, chunk, embed, and store"""
    document_name = Path(pdf_path).name
    print(f"\n📚 Processing: {document_name}")
    
    # Upload PDF to storage first
    document_url = upload_pdf_to_storage(pdf_path, document_name)
    
    # Extract text from each page
    pages_text = extract_text_from_pdf(pdf_path)
    
    # Process each page
    total_chunks = 0
    for page_num, page_text in pages_text.items():
        if not page_text.strip():
            continue
            
        # Chunk the page text
        chunks = chunk_text(page_text)
        
        for chunk_index, chunk in enumerate(chunks):
            if len(chunk) < 50:  # Skip very small chunks
                continue
            
            try:
                # Generate embedding
                embedding = generate_embedding(chunk)
                
                # Insert into database
                supabase.table("documents").insert({
                    "content": chunk,
                    "embedding": embedding,
                    "document_name": document_name,
                    "document_url": document_url,
                    "page_number": page_num,
                    "chunk_index": chunk_index,
                    "metadata": {
                        "total_pages": len(pages_text),
                        "chunk_length": len(chunk)
                    }
                }).execute()
                
                total_chunks += 1
                print(f"  ✓ Page {page_num}, Chunk {chunk_index}")
                
                # Rate limiting
                time.sleep(0.1)
                
            except Exception as e:
                print(f"  ❌ Error processing page {page_num}, chunk {chunk_index}: {e}")
    
    print(f"  ✅ Completed: {total_chunks} chunks stored")

def main():
    """Main execution"""
    print("🚀 Starting PDF Vectorization...")
    print(f"   Supabase: {SUPABASE_URL}")
    print(f"   Storage Bucket: {STORAGE_BUCKET}")
    
    if not SUPABASE_KEY:
        print("❌ Error: SUPABASE_SERVICE_KEY environment variable not set")
        sys.exit(1)
    
    if not OPENAI_API_KEY:
        print("❌ Error: OPENAI_API_KEY environment variable not set")
        sys.exit(1)
    
    # Process all PDFs
    for pdf_file in PDF_FILES:
        if not Path(pdf_file).exists():
            print(f"⚠️  Skipping {pdf_file} (not found)")
            continue
        
        try:
            process_pdf(pdf_file)
        except Exception as e:
            print(f"❌ Failed to process {pdf_file}: {e}")
    
    print("\n✅ Vectorization complete!")

if __name__ == "__main__":
    main()
