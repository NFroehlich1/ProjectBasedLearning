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

// Configuration - USER NEEDS TO SET THIS
const ELEVENLABS_CONFIG = {
    apiKey: '', // USER MUST ADD THEIR API KEY HERE
    agentId: 'agent_3701k6gsym8hfrzbzb4cz2g9r6xj'
};

/**
 * Load the last completed conversation from ElevenLabs
 */
async function loadLastConversation() {
    const archiveBox = document.getElementById('conversationArchive');
    const loadingNotification = document.getElementById('loadingNotification');
    
    // Check if API key is set
    if (!ELEVENLABS_CONFIG.apiKey || ELEVENLABS_CONFIG.apiKey === '') {
        alert('Please set your ElevenLabs API key in script.js (ELEVENLABS_CONFIG.apiKey)');
        console.error('API key not configured');
        return;
    }
    
    // Show loading
    loadingNotification.classList.remove('hidden');
    
    try {
        console.log('📥 Fetching conversations...');
        
        // Step 1: Get list of conversations
        const conversationsResponse = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversations?agent_id=${ELEVENLABS_CONFIG.agentId}`,
            {
                headers: {
                    'xi-api-key': ELEVENLABS_CONFIG.apiKey
                }
            }
        );
        
        if (!conversationsResponse.ok) {
            throw new Error(`Failed to fetch conversations: ${conversationsResponse.status}`);
        }
        
        const conversationsData = await conversationsResponse.json();
        console.log('✅ Conversations fetched:', conversationsData);
        
        if (!conversationsData.conversations || conversationsData.conversations.length === 0) {
            archiveBox.value = 'No conversations found yet. Start a conversation with the AI assistant first!';
            loadingNotification.classList.add('hidden');
            return;
        }
        
        // Get the most recent conversation
        const lastConversation = conversationsData.conversations[0];
        const conversationId = lastConversation.conversation_id;
        
        console.log(`📥 Fetching conversation details: ${conversationId}`);
        
        // Step 2: Get full conversation details
        const conversationResponse = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
            {
                headers: {
                    'xi-api-key': ELEVENLABS_CONFIG.apiKey
                }
            }
        );
        
        if (!conversationResponse.ok) {
            throw new Error(`Failed to fetch conversation details: ${conversationResponse.status}`);
        }
        
        const conversation = await conversationResponse.json();
        console.log('✅ Conversation details fetched:', conversation);
        
        // Step 3: Format and display the conversation
        const formattedConversation = formatConversation(conversation);
        archiveBox.value = formattedConversation;
        
        // Success notification
        showNotification('Conversation loaded successfully!');
        
    } catch (error) {
        console.error('❌ Error loading conversation:', error);
        archiveBox.value = `Error loading conversation: ${error.message}\n\nPlease check:\n1. Your API key is correct\n2. You have conversations in ElevenLabs\n3. Your internet connection`;
    } finally {
        loadingNotification.classList.add('hidden');
    }
}

/**
 * Format conversation data into readable text
 */
function formatConversation(conversation) {
    const date = new Date(conversation.start_time_unix_secs * 1000);
    const formattedDate = date.toLocaleString();
    
    let formatted = `========================================\n`;
    formatted += `PROJECT-BASED LEARNING CONSULTATION\n`;
    formatted += `========================================\n\n`;
    formatted += `Date: ${formattedDate}\n`;
    formatted += `Conversation ID: ${conversation.conversation_id}\n`;
    formatted += `Status: ${conversation.status}\n\n`;
    formatted += `========================================\n`;
    formatted += `CONVERSATION TRANSCRIPT\n`;
    formatted += `========================================\n\n`;
    
    // Format each message in the conversation
    if (conversation.transcript && conversation.transcript.length > 0) {
        conversation.transcript.forEach((message, index) => {
            const role = message.role === 'user' ? 'USER' : 'AI ASSISTANT';
            const timestamp = message.timestamp ? new Date(message.timestamp * 1000).toLocaleTimeString() : '';
            
            formatted += `[${timestamp}] ${role}:\n`;
            formatted += `${message.message}\n\n`;
        });
    } else {
        formatted += 'No transcript available.\n\n';
    }
    
    formatted += `========================================\n`;
    formatted += `END OF CONVERSATION\n`;
    formatted += `========================================\n`;
    
    return formatted;
}

/**
 * Clear the archive textbox
 */
function clearArchive() {
    const archiveBox = document.getElementById('conversationArchive');
    if (confirm('Are you sure you want to clear the conversation archive?')) {
        archiveBox.value = '';
        showNotification('Archive cleared');
    }
}

// Console welcome message
console.log('%cProject-Based Learning Website', 'color: #2563eb; font-size: 18px; font-weight: 600;');
console.log('%cPowered by modern web technologies and ElevenLabs AI.', 'color: #4a5568; font-size: 13px;');
console.log('%cAPI Available: window.writeToTextBox(text) - Write answers to the textbox', 'color: #10b981; font-size: 12px;');
console.log('%cAPI Available: window.captureToTextBox(text) - Capture and write to textbox', 'color: #10b981; font-size: 12px;');
console.log('%cListening for messages from ElevenLabs widget...', 'color: #10b981; font-size: 12px;');

