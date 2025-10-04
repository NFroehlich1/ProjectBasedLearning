# Google Gemini AI Integration Setup

This guide explains how to set up the Google Gemini AI integration for the conversation Q&A feature.

## 🔑 Step 1: Configure the API Key in Supabase

The Gemini API key must be stored as a secret in Supabase:

1. **Go to Supabase Secrets:**
   - Open: https://supabase.com/dashboard/project/rcfgpdrrnhltozrnsgic/functions/secrets

2. **Add New Secret:**
   - **Secret Name:** `GEMINI_API_KEY` (exactly as shown, case-sensitive!)
   - **Secret Value:** `AIzaSyAG2op2CcMbHXiWH1DDVM7MklTN97hhpzI`

3. **Save the Secret**

## 🚀 Step 2: Deploy the Edge Function

The Gemini Edge Function has already been deployed:

```bash
supabase functions deploy gemini-chat --project-ref rcfgpdrrnhltozrnsgic --no-verify-jwt
```

**Status:** ✅ Deployed

**Function URL:** https://rcfgpdrrnhltozrnsgic.supabase.co/functions/v1/gemini-chat

## 📋 Step 3: Verify the Setup

1. **Load the website**
2. **Load a conversation** using "📥 Load Last Conversation"
3. **Scroll down** to the "Ask Questions About This Conversation" section
4. **Enter a question** (e.g., "What were the main topics discussed?")
5. **Click "✨ Ask Gemini"**

If everything is set up correctly, Gemini will respond with an answer!

## 🔍 How It Works

1. **User loads a conversation** from ElevenLabs
2. **User asks a question** in the Gemini Q&A box
3. **The conversation transcript** is automatically extracted and sent to Gemini
4. **Gemini analyzes** the conversation context
5. **Gemini responds** with an answer based on the conversation

## 🛠️ Technical Details

### Edge Function: `gemini-chat`

**Location:** `supabase/functions/gemini-chat/index.ts`

**API Endpoint:** POST request with JSON body:
```json
{
  "conversationContext": "string (conversation transcript)",
  "userQuestion": "string (user's question)"
}
```

**Response:**
```json
{
  "answer": "string (Gemini's response)",
  "model": "gemini-1.5-flash"
}
```

### Security

- ✅ API Key is stored securely in Supabase Secrets
- ✅ NOT exposed in frontend code
- ✅ Only accessible via Supabase Edge Function
- ✅ CORS configured for web access

### Frontend Integration

**Config in `script.js`:**
```javascript
const GEMINI_CONFIG = {
    functionUrl: 'https://rcfgpdrrnhltozrnsgic.supabase.co/functions/v1/gemini-chat'
};
```

**Main Function:** `askGemini()`
- Extracts conversation context
- Sends request to Gemini Edge Function
- Displays response in UI

## 🎨 Features

- ✨ **Context-aware responses** - Gemini analyzes the loaded conversation
- ✨ **General questions** - Works even without loaded conversation
- ✨ **Smooth animations** - Loading spinner and slide-in effects
- ✨ **Error handling** - Clear error messages
- ✨ **Responsive design** - Works on mobile and desktop

## 📝 Example Questions

With a loaded conversation:
- "What were the main topics discussed?"
- "Summarize the key points"
- "What questions did the speaker ask?"
- "What advice did the AI assistant provide?"

Without a loaded conversation:
- "What is Project-Based Learning?"
- "How do I implement PBL in my classroom?"
- "What are the benefits of PBL?"

## 🐛 Troubleshooting

### Error: "Failed to get response: 500"
- **Solution:** Check that the `GEMINI_API_KEY` secret is set in Supabase
- **Verify:** Go to Supabase Secrets and confirm the key exists

### Error: "Failed to get response: 401"
- **Solution:** The API key might be invalid
- **Verify:** Check that the API key is correct in Supabase Secrets

### No response or loading forever
- **Solution:** Check browser console for errors
- **Verify:** Ensure internet connection is stable
- **Check:** Supabase Function logs for errors

## 📊 Monitoring

View function logs in Supabase:
- **URL:** https://supabase.com/dashboard/project/rcfgpdrrnhltozrnsgic/functions/logs
- **Select:** `gemini-chat` function
- **View:** Real-time logs and errors

## 🔄 Updating the Function

To update the Gemini Edge Function:

```bash
# Edit the function
# File: supabase/functions/gemini-chat/index.ts

# Deploy the update
supabase functions deploy gemini-chat --project-ref rcfgpdrrnhltozrnsgic --no-verify-jwt
```

---

**Integration Complete!** 🎉

The Gemini AI Q&A feature is now ready to use!
