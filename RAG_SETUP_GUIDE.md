# RAG System Setup Guide

Complete guide to implement Retrieval-Augmented Generation (RAG) with PDF vectorization and source citations.

## 🎯 Overview

This system implements:
- **PDF Vectorization** using OpenAI embeddings
- **Similarity Search** with pgvector in Supabase
- **Source Citations** with hyperlinks to exact PDF locations
- **Text Fragment Navigation** for pinpoint accuracy

---

## 📋 Prerequisites

### Required API Keys:
1. **Supabase Service Role Key** - For database operations
2. **OpenAI API Key** - For embeddings
3. **Gemini API Key** - Already configured

### Required Software:
- Python 3.8+ (for vectorization script)
- Supabase CLI (already installed)

---

## 🚀 Step-by-Step Implementation

### **Step 1: Set up Database**

Run the migration to create the documents table with pgvector:

```bash
supabase db push
```

Or manually run the SQL in:
`supabase/migrations/20250104_create_documents_table.sql`

### **Step 2: Create Storage Bucket**

1. Go to: https://supabase.com/dashboard/project/rcfgpdrrnhltozrnsgic/storage/buckets
2. Click **"New Bucket"**
3. Name: `pdfs`
4. Make it **public** for easy access
5. Click **"Create Bucket"**

### **Step 3: Configure Environment Variables**

Create a `.env` file in the project root:

```bash
# Supabase
SUPABASE_URL=https://rcfgpdrrnhltozrnsgic.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Gemini (already in Supabase Secrets)
# GEMINI_API_KEY=already_configured
```

**Get your Supabase Service Role Key:**
- Go to: https://supabase.com/dashboard/project/rcfgpdrrnhltozrnsgic/settings/api
- Copy the **`service_role`** key (NOT the `anon` key!)

**Get OpenAI API Key:**
- Go to: https://platform.openai.com/api-keys
- Create a new key

### **Step 4: Install Python Dependencies**

```bash
pip install -r requirements.txt
```

### **Step 5: Vectorize PDFs**

Run the vectorization script:

```bash
# Set environment variables
export SUPABASE_SERVICE_KEY="your_key_here"
export OPENAI_API_KEY="your_key_here"

# Run vectorization
python vectorize-pdfs.py
```

This will:
1. Upload PDFs to Supabase Storage
2. Extract text from each page
3. Chunk text into manageable pieces
4. Generate embeddings for each chunk
5. Store everything in the `documents` table

**Expected output:**
```
🚀 Starting PDF Vectorization...
📚 Processing: Krajcik & Blumenfeld 2006_PBL in Handbook of the Learning Sciences.pdf
  ✅ Uploaded to storage
  📄 Extracting 45 pages...
  ✓ Page 1, Chunk 0
  ✓ Page 1, Chunk 1
  ...
  ✅ Completed: 234 chunks stored
```

### **Step 6: Configure Supabase Secrets**

Add the OpenAI API key to Supabase Secrets:

1. Go to: https://supabase.com/dashboard/project/rcfgpdrrnhltozrnsgic/functions/secrets
2. Add new secret:
   - Name: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
3. Add another secret:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Your Supabase service role key
4. Save

### **Step 7: Deploy RAG Edge Function**

```bash
supabase functions deploy rag-chat --project-ref rcfgpdrrnhltozrnsgic --no-verify-jwt
```

### **Step 8: Test the System**

1. Open your website
2. Scroll to "AI Research Assistant"
3. Ask a question: "What is Project-Based Learning?"
4. The AI should respond with citations [1], [2], etc.
5. Click on the citations to jump to the PDF source!

---

## 🔍 How It Works

### **1. Question Flow**

```
User Question → Generate Embedding → Similarity Search → 
Find Top 5 Chunks → Build Context → Send to Gemini → 
Process Response → Add Hyperlinks → Display with Sources
```

### **2. Citation Format**

**In Answer:**
```
Project-Based Learning is an approach... [1] 
Students work on authentic projects... [2]
```

**Hyperlink Structure:**
```
https://your-storage-url/pdf-name.pdf#:~:text=exact%20text%20snippet
```

This uses the **Text Fragment** specification to navigate directly to the quoted text in the PDF.

### **3. Source Display**

At the end of each answer:
```
---
Sources:

[1] Krajcik & Blumenfeld 2006_PBL in Handbook.pdf - Page 12
[2] Thomas 2000_Review PBL.pdf - Page 5
```

Each source is clickable and opens the PDF at the exact location.

---

## 🛠️ Troubleshooting

### **Problem: "No matches found"**

**Solution:** Check if PDFs are vectorized:

```sql
SELECT count(*) FROM documents;
```

Should return > 0. If not, run the vectorization script again.

### **Problem: "Embedding API error"**

**Solution:** Verify OpenAI API key:
- Check it's set in environment
- Check it has credits
- Test with: `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`

### **Problem: "PDF links don't navigate"**

**Solution:** 
- Text Fragment API is supported in Chrome, Edge, Safari 16.4+
- Some PDFs may not support in-page search
- Try clicking the citation to at least open the PDF

### **Problem: "Search returns wrong results"**

**Solution:** Adjust the similarity threshold:
- In `rag-chat/index.ts`, change `match_threshold` from 0.7 to 0.75 or 0.8
- Higher = more strict, fewer results
- Lower = more lenient, more results

---

## 📊 Performance Optimization

### **Chunking Strategy**

Current: 1000 chars with 200 overlap
- Increase for longer context (1500/300)
- Decrease for more granular results (500/100)

### **Top-K Results**

Current: 5 chunks
- Increase for more context (10)
- Decrease for faster responses (3)

### **Embedding Model**

Current: `text-embedding-3-small` (1536 dimensions)
- Upgrade to `text-embedding-3-large` (3072 dimensions) for better quality
- **Don't forget to update:**
  - Database schema (vector dimension)
  - match_documents function
  - Vectorization script

---

## 🎓 Adding New PDFs

1. Place PDF in project root
2. Add filename to `PDF_FILES` list in `vectorize-pdfs.py`
3. Run: `python vectorize-pdfs.py`
4. Done! New PDFs are now searchable

---

## 💰 Cost Estimate

### **One-time Vectorization:**
- 5 PDFs × ~300 pages × 3 chunks/page = ~4,500 chunks
- Cost: ~$0.01 per 1M tokens with `text-embedding-3-small`
- Estimated: **< $0.10 total**

### **Per Query:**
- 1 embedding + 1 Gemini call
- Estimated: **< $0.001 per query**

---

## 🔒 Security Best Practices

1. **Never commit** `.env` file (already in `.gitignore`)
2. **Use Service Role Key** only in backend/scripts, never in frontend
3. **Enable RLS** on `documents` table if you add user authentication
4. **Regenerate keys** if accidentally exposed

---

## ✅ Verification Checklist

- [ ] Database migration applied
- [ ] Storage bucket created (`pdfs`)
- [ ] Environment variables set
- [ ] Python dependencies installed
- [ ] PDFs vectorized successfully
- [ ] Supabase secrets configured
- [ ] RAG Edge Function deployed
- [ ] Test query returns results with citations
- [ ] Citation links open PDFs correctly

---

**System Ready!** 🎉

Your RAG system is now fully operational with source citations and PDF navigation!
