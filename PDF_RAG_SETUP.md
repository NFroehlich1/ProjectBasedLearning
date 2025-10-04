# PDF Knowledge Base (RAG) Integration

This guide explains how the PDF documents are integrated as a knowledge source for the AI Q&A feature.

## 📚 Current Implementation

### **Approach: Prompt-Based Knowledge Context**

The AI is informed about the available PDF research papers through the system prompt:

**PDFs in Knowledge Base:**
1. Krajcik & Blumenfeld 2006: PBL in Handbook of the Learning Sciences
2. Guo et al. 2020: PBL Review
3. Condliffe et al. 2017: PBL Review
4. Blumenfeld et al. 1991: Motivating Project-Based Learning
5. Thomas 2000: Review of PBL

**How it works:**
- The AI is told it has access to these research papers
- Gemini 2.0's training includes knowledge from many academic papers
- The AI can provide research-backed answers based on PBL literature
- Works immediately without additional setup

**Status:** ✅ **Already Active**

---

## 🚀 Advanced Option: True RAG with Gemini File API

For direct PDF processing (optional, more powerful):

### **Step 1: Install Dependencies**

```bash
npm install
```

### **Step 2: Upload PDFs to Gemini**

```bash
npm run upload-pdfs
```

This script:
- Uploads all 5 PDFs to Google Gemini File API
- Saves file URIs to `gemini-files.json`
- One-time operation

### **Step 3: Update Edge Function**

Modify `supabase/functions/gemini-chat/index.ts` to use the uploaded files:

```typescript
// Load file URIs
const geminiFiles = [
  { fileUri: "files/..." }, // From gemini-files.json
  // ... other files
];

// In the API call
body: JSON.stringify({
  contents: [{
    parts: [
      // Include PDF files
      ...geminiFiles.map(f => ({ fileData: { fileUri: f.fileUri, mimeType: "application/pdf" } })),
      // Include text prompt
      { text: prompt }
    ]
  }],
  // ... config
})
```

### **Advantages of File API:**
- ✅ AI can directly read and search PDF content
- ✅ More accurate citations and references
- ✅ Can handle large documents efficiently
- ✅ Updates automatically when PDFs are updated

### **Disadvantages:**
- Requires one-time setup
- Needs Google AI API key with File API access
- Files need to be re-uploaded if updated

---

## 🧪 Testing the Knowledge Base

Try these questions to test the PDF knowledge:

### **General PBL Questions:**
- "What are the key components of Project-Based Learning according to Thomas 2000?"
- "What did Blumenfeld et al. 1991 say about student motivation in PBL?"
- "Summarize the main findings from Condliffe et al. 2017"

### **Specific Research Questions:**
- "What learning outcomes does PBL improve according to Guo et al. 2020?"
- "How do Krajcik & Blumenfeld define PBL in the Handbook of Learning Sciences?"

### **Comparative Questions:**
- "What do the research papers say about teacher support in PBL?"
- "Compare the definitions of PBL across the different research papers"

---

## 📊 Current Status

**✅ Implemented:**
- Prompt-based knowledge context
- AI knows about the 5 PDF research papers
- Works with Gemini 2.0 Flash Experimental

**🔄 Optional Enhancement:**
- Upload script ready (`upload-pdfs-to-gemini.js`)
- Can be activated for true RAG if needed

---

## 🔧 Maintenance

### **Adding New PDFs:**

1. Add PDF to project root
2. Update the system context in `supabase/functions/gemini-chat/index.ts`
3. (Optional) Add to `upload-pdfs-to-gemini.js` if using File API

### **Updating PDF Content:**

If using File API:
1. Delete old files from Gemini
2. Re-run `npm run upload-pdfs`
3. Update `gemini-files.json`

---

## 💡 Recommendations

**Current Setup (Prompt-Based) is sufficient if:**
- ✅ You want immediate functionality
- ✅ PDFs are well-known academic papers
- ✅ You don't need exact page citations

**Upgrade to File API if you need:**
- 🎯 Direct PDF content search
- 🎯 Exact citations with page numbers
- 🎯 Custom/proprietary documents
- 🎯 Frequent PDF updates

---

**The system is ready to use!** Ask questions and the AI will provide research-backed answers based on PBL literature. 🎓
