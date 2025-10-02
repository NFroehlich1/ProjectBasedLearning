# ElevenLabs AI Integration Guide

## Overview

This website includes a dedicated answer textbox that can be populated with responses from the ElevenLabs conversational AI assistant. Users can ask questions via voice or text, and detailed answers will appear in the textbox for easy reference and copying.

## Features

### Answer Textbox
- **Location**: Below the AI Assistant section on the main page
- **Functionality**: Displays AI responses with timestamps
- **Capacity**: Unlimited (with vertical scrolling)
- **Format**: Most recent answers appear at the top

### User Controls
1. **Copy to Clipboard**: One-click copying of all content
2. **Clear**: Remove all answers (with confirmation)
3. **Visual Feedback**: Border highlights when new content is added

## API Reference

### Writing to the Textbox

The website exposes global functions that can be called by ElevenLabs or any external integration:

#### Method 1: `window.writeToTextBox(text)`
```javascript
// Write a single answer to the textbox
window.writeToTextBox("Your AI response text here");
```

#### Method 2: `window.displayAIAnswer(answer)`
```javascript
// Alternative method with the same functionality
window.displayAIAnswer("Your AI response text here");
```

### Features of the Write Function

When text is written to the textbox:
1. **Automatic Timestamp**: Each answer is prefixed with the current date/time
2. **Separator**: Answers are separated by a line of equal signs (=)
3. **Newest First**: New answers appear at the top
4. **Visual Highlight**: Green border flash for 1 second to indicate new content
5. **Auto-scroll**: Textbox automatically scrolls to show the newest content

### Example Output Format

```
[10/2/2025, 2:30:45 PM]

Project-Based Learning (PBL) is an instructional approach where students gain knowledge and skills by working for an extended period to investigate and respond to authentic, engaging, and complex questions, problems, or challenges...

==================================================

[10/2/2025, 2:25:12 PM]

The key benefits of PBL include deeper understanding, increased motivation, development of 21st-century skills...

==================================================
```

## ElevenLabs Integration

### Setup Instructions

1. **Configure Your ElevenLabs Agent**
   - Agent ID: `agent_3701k6gsym8hfrzbzb4cz2g9r6xj`
   - The agent widget is already embedded on the page

2. **Custom Actions/Webhooks**
   If you want ElevenLabs to automatically populate the textbox:
   - Configure a custom action or webhook in your ElevenLabs agent settings
   - When generating a response, execute JavaScript on the page:
     ```javascript
     window.writeToTextBox(generatedResponse);
     ```

3. **Testing**
   Open the browser console and test manually:
   ```javascript
   window.writeToTextBox("This is a test response from the AI assistant.");
   ```

### User Workflow

1. User asks a question via the ElevenLabs chat widget
2. ElevenLabs generates a response (spoken and/or text)
3. If configured, the response is automatically written to the textbox
4. User can:
   - Read the full response in the textbox
   - Copy it to clipboard for use elsewhere
   - Clear it when done

## Technical Details

### HTML Elements
- **Textbox ID**: `aiAnswerBox`
- **Copy Button ID**: `copyBtn`
- **Clear Button ID**: `clearBtn`
- **Notification ID**: `copyNotification`

### Styling
- Professional, clean design matching the rest of the site
- Light gray background with blue accent on focus
- Responsive design for mobile devices
- Fixed notification appears bottom-right (or centered on mobile)

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Uses standard JavaScript APIs (no dependencies)
- Graceful fallback if clipboard API is unavailable

## Customization

### Modify Timestamp Format
Edit `script.js`, line 131:
```javascript
const timestamp = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
});
```

### Change Separator Style
Edit `script.js`, line 132:
```javascript
const formattedText = `[${timestamp}]\n\n${text}\n\n${'-'.repeat(50)}\n\n`;
```

### Adjust Textbox Height
Edit `styles.css`, line 369:
```css
.answer-textbox {
    min-height: 400px; /* Change from 300px */
}
```

## Troubleshooting

### Textbox Not Updating
1. Check browser console for errors
2. Verify the function exists: `console.log(typeof window.writeToTextBox)`
3. Test manually: `window.writeToTextBox("Test")`

### Copy Not Working
1. Ensure the textbox has content
2. Check browser permissions for clipboard access
3. Try using Ctrl+C / Cmd+C as fallback

### ElevenLabs Widget Not Appearing
1. Check internet connection (widget loads from CDN)
2. Verify agent ID is correct
3. Check browser console for loading errors

## Future Enhancements

Potential improvements:
- Export answers as PDF or text file
- Search/filter within answers
- Answer history with timestamps
- Integration with note-taking apps
- Voice-to-text transcription display

## Support

For questions about:
- **Website functionality**: Check the main README.md
- **ElevenLabs integration**: Visit [ElevenLabs Documentation](https://elevenlabs.io/docs)
- **Custom modifications**: Review the inline comments in `script.js`

---

**Last Updated**: October 2025  
**Version**: 1.0.0

