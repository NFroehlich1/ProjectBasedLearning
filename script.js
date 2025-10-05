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
    functionUrl: 'https://rcfgpdrrnhltozrnsgic.supabase.co/functions/v1/gemini-chat',
    ragFunctionUrl: 'https://rcfgpdrrnhltozrnsgic.supabase.co/functions/v1/rag-chat'
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
// AI Chat with Conversation History (Agentic RAG)
// ============================================

// Store conversation history
let aiChatHistory = [];

/**
 * Extract conversation text from ElevenLabs chat view
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
 * Add a message to the AI chat view
 */
function addAiChatMessage(role, content) {
    const chatView = document.getElementById('aiChatView');
    
    // Remove placeholder if exists
    const placeholder = chatView.querySelector('.chat-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-chat-message ${role}`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'ai-message-bubble';
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'ai-message-label';
    labelDiv.textContent = role === 'user' ? 'You' : 'AI Assistant';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-message-content';
    
    if (role === 'assistant') {
        // Parse Markdown for assistant messages
        contentDiv.innerHTML = marked.parse(content);
    } else {
        contentDiv.textContent = content;
    }
    
    bubbleDiv.appendChild(labelDiv);
    bubbleDiv.appendChild(contentDiv);
    messageDiv.appendChild(bubbleDiv);
    chatView.appendChild(messageDiv);
    
    // Scroll to bottom
    chatView.scrollTop = chatView.scrollHeight;
}

/**
 * Add a message with pre-rendered HTML to the AI chat view
 */
function addAiChatMessageHtml(role, htmlContent) {
    const chatView = document.getElementById('aiChatView');
    
    // Remove placeholder if exists
    const placeholder = chatView.querySelector('.chat-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-chat-message ${role}`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'ai-message-bubble';
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'ai-message-label';
    labelDiv.textContent = role === 'user' ? 'You' : 'AI Assistant';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'ai-message-content';
    contentDiv.innerHTML = htmlContent; // Direct HTML injection
    
    bubbleDiv.appendChild(labelDiv);
    bubbleDiv.appendChild(contentDiv);
    messageDiv.appendChild(bubbleDiv);
    chatView.appendChild(messageDiv);
    
    // Scroll to bottom
    chatView.scrollTop = chatView.scrollHeight;
}

/**
 * PDF Viewer State
 */
const pdfViewerState = {
    pdfDoc: null,
    pageNum: 1,
    pageRendering: false,
    pageNumPending: null,
    scale: 1.5,
    canvas: null,
    ctx: null,
    highlightText: ''
};

/**
 * Initialize PDF.js worker
 */
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

/**
 * Generate PDF hyperlink that opens in-app viewer
 */
function generatePdfLink(source, index) {
    // Use full content from source, not just snippet
    const fullText = source.content || source.text_snippet || '';
    const textSnippet = fullText.trim();
    return {
        url: source.document_url,
        page: source.page_number,
        snippet: textSnippet, // Full text for display in citation box
        display: `[${index}]`,
        title: `${source.document_name} - Page ${source.page_number}`,
        docName: source.document_name
    };
}

/**
 * Process grounded response with source citations
 */
function processGroundedResponse(generatedText, sources) {
    // Store sources for later HTML injection
    const sourcesData = sources.map((source, index) => generatePdfLink(source, index + 1));
    
    // Add sources section at the end in markdown
    if (sources.length > 0) {
        generatedText += '\n\n---\n\n**Sources:**\n\n';
        sources.forEach((source, index) => {
            generatedText += `**[${index + 1}]** ${source.document_name} - Page ${source.page_number}\n\n`;
        });
    }
    
    // Parse markdown first
    let htmlContent = marked.parse(generatedText);
    
    // Now inject clickable links for citations
    sourcesData.forEach((link, index) => {
        const citationIndex = index + 1;
        const citationPattern = new RegExp(`\\[${citationIndex}\\]`, 'g');
        const linkHtml = `<a href="#" 
            class="source-link pdf-viewer-link" 
            data-pdf-url="${link.url}" 
            data-pdf-page="${link.page}" 
            data-pdf-snippet="${escapeHtml(link.snippet)}" 
            data-pdf-title="${escapeHtml(link.docName)}" 
            title="${link.title}">[${citationIndex}]</a>`;
        htmlContent = htmlContent.replace(citationPattern, linkHtml);
    });
    
    return htmlContent;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Send AI question with RAG (Retrieval-Augmented Generation)
 */
async function sendAiQuestion() {
    const questionInput = document.getElementById('aiQuestionInput');
    const loadingIndicator = document.getElementById('aiChatLoading');
    const sendButton = document.getElementById('sendAiQuestion');
    
    const question = questionInput.value.trim();
    
    if (!question) {
        showNotification('Please enter a question');
        return;
    }
    
    // Add user message to chat
    addAiChatMessage('user', question);
    aiChatHistory.push({ role: 'user', content: question });
    
    // Clear input
    questionInput.value = '';
    
    // Show loading
    loadingIndicator.classList.remove('hidden');
    sendButton.disabled = true;
    
    try {
        console.log('🤖 Sending question to RAG system...');
        
        // Use RAG function for research-backed answers
        const response = await fetch(GEMINI_CONFIG.ragFunctionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userQuestion: question,
                chatHistory: aiChatHistory.slice(0, -1) // Send all history except current question
            })
        });
        
        if (!response.ok) {
            // Fallback to regular chat if RAG fails
            console.log('⚠️ RAG failed, using fallback to regular chat...');
            
            const fallbackResponse = await fetch(GEMINI_CONFIG.functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversationContext: '',
                    userQuestion: question,
                    chatHistory: aiChatHistory.slice(0, -1)
                })
            });
            
            if (!fallbackResponse.ok) {
                throw new Error('Both RAG and fallback failed');
            }
            
            const fallbackData = await fallbackResponse.json();
            addAiChatMessage('assistant', fallbackData.answer);
            aiChatHistory.push({ role: 'assistant', content: fallbackData.answer });
            return;
        }
        
        const data = await response.json();
        console.log('✅ RAG response received with', data.num_sources, 'sources');
        
        // If no sources, use regular answer without citations
        if (!data.sources || data.sources.length === 0) {
            console.log('ℹ️ No sources found, displaying answer without citations');
            addAiChatMessage('assistant', data.generated_text);
            aiChatHistory.push({ role: 'assistant', content: data.generated_text });
        } else {
            // Process response with source citations (returns HTML)
            const processedAnswer = processGroundedResponse(data.generated_text, data.sources);
            addAiChatMessageHtml('assistant', processedAnswer);
            aiChatHistory.push({ role: 'assistant', content: data.generated_text });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        addAiChatMessage('assistant', `**Error:** ${error.message}\n\nPlease check your connection and try again.`);
    } finally {
        loadingIndicator.classList.add('hidden');
        sendButton.disabled = false;
        questionInput.focus();
    }
}

/**
 * Clear AI chat history
 */
function clearAiChat() {
    if (aiChatHistory.length === 0) {
        showNotification('Chat is already empty');
        return;
    }
    
    if (confirm('Clear all chat messages?')) {
        aiChatHistory = [];
        const chatView = document.getElementById('aiChatView');
        chatView.innerHTML = '<div class="chat-placeholder">Start a conversation by asking a question about Project-Based Learning...</div>';
        showNotification('Chat cleared');
    }
}

/**
 * Handle Enter key in textarea
 */
document.addEventListener('DOMContentLoaded', () => {
    const questionInput = document.getElementById('aiQuestionInput');
    if (questionInput) {
        questionInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAiQuestion();
            }
        });
    }
    
    // Initialize PDF viewer
    initializePdfViewer();
});

/* ================================
   PDF VIEWER FUNCTIONALITY
   ================================ */

/**
 * Initialize PDF viewer event listeners
 */
function initializePdfViewer() {
    // Canvas and context
    pdfViewerState.canvas = document.getElementById('pdfCanvas');
    pdfViewerState.ctx = pdfViewerState.canvas?.getContext('2d');
    
    // Close button
    const closeBtn = document.getElementById('closePdfModal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePdfModal);
    }
    
    // Navigation buttons
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (pdfViewerState.pageNum > 1) {
                pdfViewerState.pageNum--;
                queuePageRender(pdfViewerState.pageNum);
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (pdfViewerState.pdfDoc && pdfViewerState.pageNum < pdfViewerState.pdfDoc.numPages) {
                pdfViewerState.pageNum++;
                queuePageRender(pdfViewerState.pageNum);
            }
        });
    }
    
    // Close modal on background click
    const modal = document.getElementById('pdfModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closePdfModal();
            }
        });
    }
    
    
    // Delegate event for PDF links
    document.body.addEventListener('click', (e) => {
        const pdfLink = e.target.closest('.pdf-viewer-link');
        if (pdfLink) {
            e.preventDefault();
            const url = pdfLink.dataset.pdfUrl;
            const page = parseInt(pdfLink.dataset.pdfPage) || 1;
            const snippet = pdfLink.dataset.pdfSnippet || '';
            const title = pdfLink.dataset.pdfTitle || 'Document';
            openPdfViewer(url, page, snippet, title);
        }
    });
}

/**
 * Scroll to the highlighted text in the PDF viewer
 */
function scrollToHighlight() {
    const highlightLayer = document.getElementById('highlightLayer');
    const firstHighlight = highlightLayer?.querySelector('.pdf-highlight');
    
    if (firstHighlight) {
        firstHighlight.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
        });
        
        // Flash animation to draw attention
        firstHighlight.style.animation = 'none';
        setTimeout(() => {
            firstHighlight.style.animation = 'highlightPulse 1.5s ease-in-out 3';
        }, 10);
    }
}

/**
 * Open PDF viewer with specific page and highlight
 */
async function openPdfViewer(pdfUrl, pageNumber, highlightText, docTitle) {
    console.log('📄 Opening PDF viewer:', { pdfUrl, pageNumber, highlightText, docTitle });
    
    const modal = document.getElementById('pdfModal');
    const titleEl = document.getElementById('pdfTitle');
    const highlightInfo = document.getElementById('highlightInfo');
    const highlightTextEl = document.getElementById('highlightText');
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Set title
    if (titleEl) {
        titleEl.textContent = docTitle;
    }
    
    // Show highlight info
    if (highlightText && highlightInfo && highlightTextEl) {
        highlightTextEl.textContent = highlightText;
        highlightInfo.classList.remove('hidden');
        pdfViewerState.highlightText = highlightText;
    } else if (highlightInfo) {
        highlightInfo.classList.add('hidden');
        pdfViewerState.highlightText = '';
    }
    
    try {
        // Load PDF
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        pdfViewerState.pdfDoc = pdf;
        pdfViewerState.pageNum = pageNumber;
        
        // Update total pages
        document.getElementById('totalPages').textContent = pdf.numPages;
        
        // Render the specified page
        await renderPage(pageNumber);
        
    } catch (error) {
        console.error('❌ Error loading PDF:', error);
        alert('Failed to load PDF. Please try again.');
        closePdfModal();
    }
}

/**
 * Render a specific page with text layer and highlighting
 */
async function renderPage(num) {
    pdfViewerState.pageRendering = true;
    
    try {
        const page = await pdfViewerState.pdfDoc.getPage(num);
        
        const viewport = page.getViewport({ scale: pdfViewerState.scale });
        pdfViewerState.canvas.height = viewport.height;
        pdfViewerState.canvas.width = viewport.width;
        
        // Render PDF page
        const renderContext = {
            canvasContext: pdfViewerState.ctx,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Render text layer for highlighting
        await renderTextLayer(page, viewport);
        
        // Highlight the search text if available
        if (pdfViewerState.highlightText) {
            await highlightText(page, viewport, pdfViewerState.highlightText);
        }
        
        pdfViewerState.pageRendering = false;
        
        // Update page number display
        document.getElementById('currentPage').textContent = num;
        
        // Update button states
        document.getElementById('prevPage').disabled = (num <= 1);
        document.getElementById('nextPage').disabled = (num >= pdfViewerState.pdfDoc.numPages);
        
        // If there's a pending page, render it
        if (pdfViewerState.pageNumPending !== null) {
            renderPage(pdfViewerState.pageNumPending);
            pdfViewerState.pageNumPending = null;
        }
        
    } catch (error) {
        console.error('❌ Error rendering page:', error);
        pdfViewerState.pageRendering = false;
    }
}

/**
 * Render text layer for the PDF page
 */
async function renderTextLayer(page, viewport) {
    const textLayer = document.getElementById('textLayer');
    textLayer.innerHTML = '';
    textLayer.style.width = viewport.width + 'px';
    textLayer.style.height = viewport.height + 'px';
    
    try {
        const textContent = await page.getTextContent();
        
        textContent.items.forEach(item => {
            const tx = pdfjsLib.Util.transform(
                viewport.transform,
                item.transform
            );
            
            const span = document.createElement('span');
            span.textContent = item.str;
            span.style.left = tx[4] + 'px';
            span.style.top = (tx[5] - item.height) + 'px';
            span.style.fontSize = (item.height * viewport.scale) + 'px';
            span.style.fontFamily = item.fontName;
            
            textLayer.appendChild(span);
        });
    } catch (error) {
        console.error('Error rendering text layer:', error);
    }
}

/**
 * Highlight specific text in the PDF
 */
async function highlightText(page, viewport, searchText) {
    const highlightLayer = document.getElementById('highlightLayer');
    highlightLayer.innerHTML = '';
    highlightLayer.style.width = viewport.width + 'px';
    highlightLayer.style.height = viewport.height + 'px';
    
    try {
        const textContent = await page.getTextContent();
        
        // Build full text string with positions
        let fullText = '';
        const positions = [];
        
        textContent.items.forEach(item => {
            const startPos = fullText.length;
            fullText += item.str;
            positions.push({
                text: item.str,
                startPos: startPos,
                endPos: fullText.length,
                transform: item.transform,
                width: item.width,
                height: item.height
            });
            fullText += ' '; // Add space between items
        });
        
        // Find the search text (case-insensitive, flexible matching)
        const searchTextClean = searchText.toLowerCase().replace(/\s+/g, ' ').trim();
        const fullTextClean = fullText.toLowerCase();
        
        let searchIndex = fullTextClean.indexOf(searchTextClean);
        
        // If exact match not found, try first 50 characters
        if (searchIndex === -1 && searchTextClean.length > 50) {
            const shortSearch = searchTextClean.substring(0, 50);
            searchIndex = fullTextClean.indexOf(shortSearch);
        }
        
        // If still not found, try first 30 characters
        if (searchIndex === -1 && searchTextClean.length > 30) {
            const shortSearch = searchTextClean.substring(0, 30);
            searchIndex = fullTextClean.indexOf(shortSearch);
        }
        
        if (searchIndex !== -1) {
            const searchEndIndex = searchIndex + Math.min(searchTextClean.length, fullText.length - searchIndex);
            
            // Find all text items that overlap with the search range
            positions.forEach(pos => {
                if (pos.endPos > searchIndex && pos.startPos < searchEndIndex) {
                    const tx = pdfjsLib.Util.transform(viewport.transform, pos.transform);
                    
                    const highlight = document.createElement('div');
                    highlight.className = 'pdf-highlight';
                    highlight.style.left = tx[4] + 'px';
                    highlight.style.top = (tx[5] - pos.height) + 'px';
                    highlight.style.width = (pos.width * viewport.scale) + 'px';
                    highlight.style.height = (pos.height * viewport.scale) + 'px';
                    
                    highlightLayer.appendChild(highlight);
                }
            });
            
            // Scroll to the first highlight
            const firstHighlight = highlightLayer.querySelector('.pdf-highlight');
            if (firstHighlight) {
                setTimeout(() => {
                    firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
            
            console.log('✅ Text highlighted successfully');
        } else {
            console.log('⚠️ Text not found on this page');
        }
        
    } catch (error) {
        console.error('Error highlighting text:', error);
    }
}

/**
 * Queue page render if another render is in progress
 */
function queuePageRender(num) {
    if (pdfViewerState.pageRendering) {
        pdfViewerState.pageNumPending = num;
    } else {
        renderPage(num);
    }
}

/**
 * Close PDF modal
 */
function closePdfModal() {
    const modal = document.getElementById('pdfModal');
    modal.classList.add('hidden');
    
    // Reset state
    pdfViewerState.pdfDoc = null;
    pdfViewerState.pageNum = 1;
    pdfViewerState.highlightText = '';
    
    // Clear canvas
    if (pdfViewerState.ctx && pdfViewerState.canvas) {
        pdfViewerState.ctx.clearRect(0, 0, pdfViewerState.canvas.width, pdfViewerState.canvas.height);
    }
    
    // Clear layers
    const textLayer = document.getElementById('textLayer');
    const highlightLayer = document.getElementById('highlightLayer');
    if (textLayer) textLayer.innerHTML = '';
    if (highlightLayer) highlightLayer.innerHTML = '';
}

// Console welcome message
console.log('%cProject-Based Learning Website', 'color: #2563eb; font-size: 18px; font-weight: 600;');
console.log('%cPowered by modern web technologies and AI.', 'color: #4a5568; font-size: 13px;');
console.log('%cFeatures: Conversation Archive, AI Q&A, PDF Viewer', 'color: #10b981; font-size: 12px;');
console.log('%cAPI Available: window.captureToTextBox(text) - Capture and write to textbox', 'color: #10b981; font-size: 12px;');
console.log('%cListening for messages from ElevenLabs widget...', 'color: #10b981; font-size: 12px;');

