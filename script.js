/**
 * Project-Based Learning Website
 * Main JavaScript functionality
 */

// Download all PDFs function
function downloadAll() {
    const pdfFiles = [
        'Blimenfeld et al. 1991_Motivating_project_based_learning_Sustai.pdf',
        'Condlife et al. 2017_PBL Review.pdf',
        'Guo et al. 2020_PBL Review.pdf',
        'Krajcik & Blumenfeld 2006_PBL in Handbook of the Learning Sciences.pdf',
        'Thomas 2000_Review PBL.pdf'
    ];

    // Create a small delay between downloads to avoid browser blocking
    pdfFiles.forEach((file, index) => {
        setTimeout(() => {
            const link = document.createElement('a');
            link.href = file;
            link.download = file;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, index * 300); // 300ms delay between each download
    });

    // Show confirmation message
    showNotification('Downloading all PDF files... Please check your downloads folder.');
}

// Show notification function
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2d3748;
        color: white;
        padding: 16px 24px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
        max-width: 350px;
        border-left: 4px solid #2563eb;
    `;

    document.body.appendChild(notification);

    // Remove notification after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Add animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .notification {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
`;
document.head.appendChild(style);

// Smooth scroll for anchor links (if any are added later)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Track download clicks for analytics (optional)
document.querySelectorAll('.download-btn').forEach(button => {
    button.addEventListener('click', function() {
        const fileName = this.getAttribute('href') || 'All PDFs';
        console.log(`Download initiated: ${fileName}`);
        // You can add analytics tracking here if needed
    });
});

// ============================================
// AI Answer Box Functions
// ============================================

/**
 * Writes text to the answer textbox
 * This function can be called by ElevenLabs or other integrations
 */
function writeToTextBox(text) {
    console.log('✅ writeToTextBox called with text:', text);
    const answerBox = document.getElementById('aiAnswerBox');
    
    if (!answerBox) {
        console.error('❌ Answer box not found!');
        return;
    }
    
    console.log('✅ Answer box found');
    
    // Add timestamp to the answer
    const timestamp = new Date().toLocaleString();
    const formattedText = `[${timestamp}]\n\n${text}\n\n${'='.repeat(50)}\n\n`;
    
    // Append to existing content or set new content
    if (answerBox.value.trim()) {
        answerBox.value = formattedText + answerBox.value;
    } else {
        answerBox.value = formattedText;
    }
    
    console.log('✅ Text written to box');
    
    // Scroll to top to show new content
    answerBox.scrollTop = 0;
    
    // Show brief highlight effect
    answerBox.style.borderColor = '#10b981';
    setTimeout(() => {
        answerBox.style.borderColor = '#e2e8f0';
    }, 1000);
    
    // Show success notification
    showNotification('Answer added to textbox!');
}

/**
 * Copy answer to clipboard
 */
function copyAnswer() {
    const answerBox = document.getElementById('aiAnswerBox');
    const notification = document.getElementById('copyNotification');
    
    if (answerBox && answerBox.value.trim()) {
        // Copy to clipboard
        answerBox.select();
        document.execCommand('copy');
        
        // Show notification
        notification.classList.remove('hidden');
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 2000);
    }
}

/**
 * Clear the answer textbox
 */
function clearAnswer() {
    const answerBox = document.getElementById('aiAnswerBox');
    if (answerBox && confirm('Are you sure you want to clear all answers?')) {
        answerBox.value = '';
    }
}

/**
 * Global function that ElevenLabs can call to display answers
 */
window.displayAIAnswer = function(answer) {
    writeToTextBox(answer);
};

// Make writeToTextBox globally accessible for ElevenLabs integration
window.writeToTextBox = writeToTextBox;

// ============================================
// ElevenLabs Client Tool Registration
// ============================================

/**
 * Register the writeToTextBox tool with ElevenLabs
 * This makes it available as a client_action tool
 */
window.addEventListener('DOMContentLoaded', function() {
    // Wait for ElevenLabs widget to load
    setTimeout(function() {
        // Register the client tool
        if (window.ElevenLabsConvAI) {
            window.ElevenLabsConvAI.registerClientTool('writeToTextBox', function(params) {
                console.log('✅ ElevenLabs called writeToTextBox with:', params);
                if (params && params.text) {
                    writeToTextBox(params.text);
                }
            });
            console.log('✅ Client tool "writeToTextBox" registered with ElevenLabs');
        } else {
            console.log('⚠️ ElevenLabs ConvAI not found yet, will try alternative method');
            
            // Alternative: Make tool available globally for ElevenLabs to find
            window.clientTools = window.clientTools || {};
            window.clientTools.writeToTextBox = function(params) {
                console.log('✅ Client tool called via window.clientTools:', params);
                if (params && params.text) {
                    writeToTextBox(params.text);
                } else if (typeof params === 'string') {
                    writeToTextBox(params);
                }
            };
            console.log('✅ Client tool registered via window.clientTools');
        }
    }, 2000);
});

// ============================================
// ElevenLabs Cross-Frame Communication
// ============================================

/**
 * Listen for messages from ElevenLabs iframe
 * This handles cross-origin communication from the AI widget
 */
window.addEventListener('message', function(event) {
    // Log ALL messages for debugging
    console.log('📨 Message received from:', event.origin);
    console.log('📨 Message data:', event.data);
    console.log('📨 Message type:', typeof event.data);
    
    try {
        // Handle different message formats
        let messageData = event.data;
        
        // If data is a string, try to parse it as JSON
        if (typeof messageData === 'string') {
            console.log('📨 String message, attempting to parse...');
            try {
                messageData = JSON.parse(messageData);
                console.log('📨 Parsed to:', messageData);
            } catch (e) {
                console.log('📨 Not JSON, treating as plain text');
                // If not JSON, treat as plain text
                messageData = { text: messageData };
            }
        }
        
        // Check for writeToTextBox action
        if (messageData && messageData.action === 'writeToTextBox' && messageData.text) {
            console.log('✅ Found writeToTextBox action with text:', messageData.text);
            writeToTextBox(messageData.text);
            return;
        }
        
        // Also check for direct text property
        if (messageData && messageData.text && !messageData.action) {
            console.log('✅ Found direct text property:', messageData.text);
            writeToTextBox(messageData.text);
            return;
        }
        
        // Handle if entire message is just the text
        if (typeof event.data === 'string' && event.data.length > 20) {
            // Only write if it looks like actual content (not control messages)
            if (!event.data.includes('elevenlabs') && !event.data.includes('convai')) {
                console.log('✅ Writing long string message');
                writeToTextBox(event.data);
                return;
            }
        }
        
        console.log('⚠️ Message format not recognized, ignoring');
        
    } catch (error) {
        console.error('❌ Error processing message:', error);
    }
});

// ============================================
// Auto-detect and capture ElevenLabs responses
// ============================================

/**
 * Monitor for ElevenLabs conversation events
 * Automatically capture responses that should go to textbox
 */
let captureNextResponse = false;

// Listen for any indication that user wants textbox output
document.addEventListener('DOMContentLoaded', function() {
    // Check if there's a way to hook into ElevenLabs events
    console.log('🔍 Looking for ElevenLabs widget...');
    
    // Try to find the ElevenLabs widget element
    const checkForWidget = setInterval(function() {
        const widget = document.querySelector('elevenlabs-convai');
        if (widget) {
            console.log('✅ ElevenLabs widget found:', widget);
            clearInterval(checkForWidget);
            
            // Try to observe mutations in the widget
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    console.log('📝 Widget mutation detected:', mutation);
                });
            });
            
            // Observe the widget for changes
            observer.observe(widget, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
    }, 500);
    
    setTimeout(function() {
        clearInterval(checkForWidget);
    }, 10000);
});

// ============================================
// ElevenLabs Conversation Archive
// ============================================

// Configuration - Supabase Edge Functions (API Keys secured in Supabase Secrets)
const ELEVENLABS_CONFIG = {
    functionUrl: 'https://rcfgpdrrnhltozrnsgic.supabase.co/functions/v1/get-elevenlabs-conversations',
    agentId: 'agent_3701k6gsym8hfrzbzb4cz2g9r6xj'
};

const GEMINI_CONFIG = {
    functionUrl: 'https://rcfgpdrrnhltozrnsgic.supabase.co/functions/v1/gemini-chat'
};

/**
 * Load the last completed conversation from ElevenLabs
 */
async function loadLastConversation() {
    const chatView = document.getElementById('conversationChatView');
    const loadingNotification = document.getElementById('loadingNotification');
    
    // Show loading
    loadingNotification.classList.remove('hidden');
    
    try {
        console.log('📥 Fetching conversations via Supabase Edge Function...');
        
        // Step 1: Get list of conversations via Supabase Edge Function
        const conversationsResponse = await fetch(
            `${ELEVENLABS_CONFIG.functionUrl}?agent_id=${ELEVENLABS_CONFIG.agentId}`
        );
        
        if (!conversationsResponse.ok) {
            const errorData = await conversationsResponse.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch conversations: ${conversationsResponse.status}`);
        }
        
        const conversationsData = await conversationsResponse.json();
        console.log('✅ Conversations fetched:', conversationsData);
        
        if (!conversationsData.conversations || conversationsData.conversations.length === 0) {
            chatView.innerHTML = '<div class="chat-placeholder">No conversations found yet. Start a conversation with the AI assistant first!</div>';
            loadingNotification.classList.add('hidden');
            return;
        }
        
        // Get the most recent conversation
        const lastConversation = conversationsData.conversations[0];
        const conversationId = lastConversation.conversation_id;
        
        console.log(`📥 Fetching conversation details: ${conversationId}`);
        
        // Step 2: Get full conversation details via Supabase Edge Function
        const conversationResponse = await fetch(
            `${ELEVENLABS_CONFIG.functionUrl}?agent_id=${ELEVENLABS_CONFIG.agentId}&conversation_id=${conversationId}`
        );
        
        if (!conversationResponse.ok) {
            const errorData = await conversationResponse.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch conversation details: ${conversationResponse.status}`);
        }
        
        const conversation = await conversationResponse.json();
        console.log('✅ Conversation details fetched:', conversation);
        
        // Step 3: Display the conversation as chat bubbles
        displayChatConversation(conversation);
        
        // Success notification
        showNotification('Conversation loaded successfully!');
        
    } catch (error) {
        console.error('❌ Error loading conversation:', error);
        chatView.innerHTML = `
            <div class="chat-placeholder" style="color: #e53e3e;">
                Error loading conversation: ${error.message}<br><br>
                Please check:<br>
                1. The Supabase Edge Function is deployed<br>
                2. The ELEVENLABS_API_KEY secret is set in Supabase<br>
                3. You have conversations in ElevenLabs<br>
                4. Your internet connection
            </div>
        `;
    } finally {
        loadingNotification.classList.add('hidden');
    }
}

/**
 * Display conversation as chat bubbles (Social Media Style)
 */
function displayChatConversation(conversation) {
    const chatView = document.getElementById('conversationChatView');
    let html = '';
    
    // Add date header
    if (conversation.start_time_unix_secs) {
        const date = new Date(conversation.start_time_unix_secs * 1000);
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
        const timeStr = date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        html += `<div class="chat-date-header">${dateStr} · ${timeStr}</div>`;
    }
    
    // Display each message as a chat bubble
    if (conversation.transcript && conversation.transcript.length > 0) {
        conversation.transcript.forEach((message, index) => {
            const isUser = message.role === 'user';
            const role = isUser ? 'user' : 'assistant';
            const label = isUser ? 'Speaker' : 'AI Assistant';
            
            html += `
                <div class="chat-message ${role}">
                    <div class="message-bubble">
                        <div class="message-label">${label}</div>
                        <div class="message-text">${escapeHtml(message.message)}</div>
                    </div>
                </div>
            `;
        });
        
        // Add end marker
        html += '<div class="chat-end">End of conversation</div>';
    } else {
        html += '<div class="chat-placeholder">No transcript available</div>';
    }
    
    chatView.innerHTML = html;
    
    // Scroll to bottom
    chatView.scrollTop = chatView.scrollHeight;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Clear the chat view
 */
function clearArchive() {
    const chatView = document.getElementById('conversationChatView');
    if (confirm('Are you sure you want to clear the conversation archive?')) {
        chatView.innerHTML = '<div class="chat-placeholder">Click "Load Last Conversation" to display your conversation history here.</div>';
        showNotification('Archive cleared');
    }
}

/**
 * Copy all conversation text to clipboard
 */
function copyArchiveText() {
    const chatView = document.getElementById('conversationChatView');
    const messages = chatView.querySelectorAll('.chat-message');
    
    if (messages.length === 0) {
        showNotification('No conversation to copy');
        return;
    }
    
    let text = '';
    
    // Get date header if exists
    const dateHeader = chatView.querySelector('.chat-date-header');
    if (dateHeader) {
        text += `${dateHeader.textContent}\n\n`;
        text += '─'.repeat(60) + '\n\n';
    }
    
    // Get all messages
    messages.forEach(msg => {
        const label = msg.querySelector('.message-label').textContent;
        const messageText = msg.querySelector('.message-text').textContent;
        text += `${label}:\n${messageText}\n\n`;
    });
    
    text += '─'.repeat(60) + '\n';
    text += 'End of conversation\n';
    
    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Conversation copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy to clipboard');
    });
}

// ============================================
// Gemini AI Q&A Integration
// ============================================

/**
 * Extract conversation text from the chat view
 */
function extractConversationText() {
    const chatView = document.getElementById('conversationChatView');
    const messages = chatView.querySelectorAll('.chat-message');
    
    if (messages.length === 0) {
        return '';
    }
    
    let text = '';
    
    // Get date header if exists
    const dateHeader = chatView.querySelector('.chat-date-header');
    if (dateHeader) {
        text += `Conversation Date: ${dateHeader.textContent}\n\n`;
    }
    
    // Get all messages
    messages.forEach(msg => {
        const label = msg.querySelector('.message-label').textContent;
        const messageText = msg.querySelector('.message-text').textContent;
        text += `${label}: ${messageText}\n\n`;
    });
    
    return text;
}

/**
 * Ask Gemini AI a question about the conversation
 */
async function askGemini() {
    const questionInput = document.getElementById('questionInput');
    const geminiResponse = document.getElementById('geminiResponse');
    const geminiAnswerText = document.getElementById('geminiAnswerText');
    const geminiLoading = document.getElementById('geminiLoading');
    const askButton = document.getElementById('askGemini');
    
    const question = questionInput.value.trim();
    
    if (!question) {
        showNotification('Please enter a question');
        return;
    }
    
    // Get conversation context
    const conversationContext = extractConversationText();
    
    if (!conversationContext) {
        if (confirm('No conversation loaded yet. Do you want to ask a general question about Project-Based Learning?')) {
            // Continue without context
        } else {
            showNotification('Please load a conversation first');
            return;
        }
    }
    
    // Show loading
    geminiLoading.classList.remove('hidden');
    geminiResponse.classList.add('hidden');
    askButton.disabled = true;
    
    try {
        console.log('🤖 Asking Gemini AI...');
        
        const response = await fetch(GEMINI_CONFIG.functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversationContext: conversationContext,
                userQuestion: question
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to get response: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Gemini response received');
        
        // Parse Markdown and display the answer
        const markdownAnswer = data.answer;
        const htmlAnswer = marked.parse(markdownAnswer);
        geminiAnswerText.innerHTML = htmlAnswer;
        geminiResponse.classList.remove('hidden');
        
        // Scroll to response
        geminiResponse.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
    } catch (error) {
        console.error('❌ Error asking Gemini:', error);
        geminiAnswerText.textContent = `Error: ${error.message}\n\nPlease check:\n1. The Supabase Edge Function is deployed\n2. The GEMINI_API_KEY secret is set in Supabase\n3. Your internet connection`;
        geminiResponse.classList.remove('hidden');
    } finally {
        geminiLoading.classList.add('hidden');
        askButton.disabled = false;
    }
}

// Console welcome message
console.log('%cProject-Based Learning Website', 'color: #2563eb; font-size: 18px; font-weight: 600;');
console.log('%cPowered by modern web technologies and AI.', 'color: #4a5568; font-size: 13px;');
console.log('%cFeatures: Conversation Archive, AI Q&A', 'color: #10b981; font-size: 12px;');
console.log('%cAPI Available: window.captureToTextBox(text) - Capture and write to textbox', 'color: #10b981; font-size: 12px;');
console.log('%cListening for messages from ElevenLabs widget...', 'color: #10b981; font-size: 12px;');

