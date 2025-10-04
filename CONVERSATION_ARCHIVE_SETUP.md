# Conversation Archive Setup Guide

## Overview

The website now includes a **Conversation Archive** feature that allows you to automatically load and save completed conversations from your ElevenLabs AI assistant.

## How It Works

1. User has a conversation with the ElevenLabs AI assistant
2. After the conversation ends, user clicks "📥 Load Last Conversation"
3. The system:
   - Fetches all conversations for your agent from ElevenLabs API
   - Selects the most recent conversation
   - Retrieves the full transcript
   - Formats it nicely and displays it in the archive textbox
4. User can then copy, edit, or save the conversation

## Setup Instructions

### Step 1: Get Your ElevenLabs API Key

1. Go to [ElevenLabs Profile Settings](https://elevenlabs.io/app/settings/profile)
2. Navigate to the "API Key" section
3. Copy your API key

### Step 2: Add API Key to the Website

Open `script.js` and find this section (around line 352):

```javascript
const ELEVENLABS_CONFIG = {
    apiKey: '', // USER MUST ADD THEIR API KEY HERE
    agentId: 'agent_3701k6gsym8hfrzbzb4cz2g9r6xj'
};
```

Replace the empty string with your API key:

```javascript
const ELEVENLABS_CONFIG = {
    apiKey: 'sk_your_api_key_here', // YOUR ACTUAL API KEY
    agentId: 'agent_3701k6gsym8hfrzbzb4cz2g9r6xj'
};
```

⚠️ **Security Note:** Never commit your API key to a public repository!

### Step 3: Test the Feature

1. Have a conversation with the AI assistant on your website
2. End the conversation
3. Click the "📥 Load Last Conversation" button
4. The conversation should appear in the textbox below

## Features

### Load Last Conversation Button
- Automatically fetches the most recent conversation
- Shows loading indicator while fetching
- Formats the conversation with timestamps and roles

### Clear Button
- Clears the archive textbox
- Asks for confirmation before clearing

### Formatted Output
The conversation is formatted like this:

```
========================================
PROJECT-BASED LEARNING CONSULTATION
========================================

Date: 10/4/2025, 7:30:45 PM
Conversation ID: conv_abc123xyz
Status: completed

========================================
CONVERSATION TRANSCRIPT
========================================

[19:30:45] USER:
What is project-based learning?

[19:30:50] AI ASSISTANT:
Project-Based Learning (PBL) is an innovative teaching method...

========================================
END OF CONVERSATION
========================================
```

## API Endpoints Used

### 1. List Conversations
```
GET https://api.elevenlabs.io/v1/convai/conversations?agent_id={agent_id}
```

Returns a list of all conversations for the specified agent.

### 2. Get Conversation Details
```
GET https://api.elevenlabs.io/v1/convai/conversations/{conversation_id}
```

Returns the full transcript and details for a specific conversation.

## Troubleshooting

### "Please set your ElevenLabs API key"
- You haven't added your API key to `script.js`
- See Setup Step 2 above

### "No conversations found yet"
- You haven't had any conversations with the AI assistant yet
- Start a conversation first, then try loading it

### "Error loading conversation: 401"
- Your API key is incorrect or expired
- Get a new API key from ElevenLabs settings

### "Error loading conversation: 403"
- Your API key doesn't have permission to access conversations
- Check your ElevenLabs account permissions

### "Failed to fetch conversations: CORS error"
- This shouldn't happen with the ElevenLabs API
- Try running on a web server instead of opening `index.html` directly

## Security Best Practices

### For Development/Testing
If you're just testing locally, you can add the API key directly to `script.js`.

### For Production/Public Website
**Never expose your API key in client-side code!**

Instead, create a backend API endpoint:

1. Create a server-side endpoint (Node.js, PHP, Python, etc.)
2. Store the API key securely on the server (environment variables)
3. Have your frontend call YOUR endpoint
4. Your server calls the ElevenLabs API with the key

Example (Node.js):
```javascript
// Backend (server.js)
app.get('/api/conversations', async (req, res) => {
    const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations?agent_id=${AGENT_ID}`,
        { headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY } }
    );
    const data = await response.json();
    res.json(data);
});

// Frontend (script.js)
const response = await fetch('/api/conversations');
const data = await response.json();
```

## Customization

### Change the Formatting
Edit the `formatConversation()` function in `script.js` to customize how conversations are displayed.

### Load Different Conversations
Currently, it loads the most recent conversation. To load a specific one:

```javascript
// Instead of:
const lastConversation = conversationsData.conversations[0];

// You could add a dropdown to select:
const selectedConversation = conversationsData.conversations[selectedIndex];
```

### Auto-load After Conversation Ends
You could modify the code to automatically load the conversation when the AI widget detects the conversation has ended.

## Technical Details

- Uses `fetch()` API for HTTP requests
- Async/await for promise handling
- Monospace font (`Courier New`) for transcript readability
- Responsive design for mobile devices

## Future Enhancements

Potential improvements:
- List all conversations with selection dropdown
- Search/filter conversations by date or keyword
- Export conversations as PDF or text file
- Auto-load when conversation ends
- Summary generation using AI

---

**Last Updated:** October 2025  
**Version:** 1.0.0

