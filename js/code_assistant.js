/**
 * Code Assistant Container JavaScript
 * Handles interactive functionality for the code assistant component
 */

$(document).ready(function() {
    const CodeAssistant = {
        // Configuration
        config: {
            maxCharCount: 2000,
            autoScrollDelay: 100,
            typingSpeed: 30
        },

        // DOM Elements
        elements: {
            container: $('.code-assistant-container'),
            chatMessages: $('#chatMessages'),
            userInput: $('#userInput'),
            sendBtn: $('#sendMessage'),
            charCount: $('.char-count'),
            quickActions: $('.quick-action-btn'),
            copyBtns: $('.copy-btn'),
            minimizeBtn: $('.btn-minimize'),
            expandBtn: $('.btn-expand'),
            attachBtn: $('.attach-code-btn')
        },

        // State
        state: {
            isMinimized: false,
            isExpanded: false,
            isTyping: false,
            messageCount: 0
        },

        // Initialize the component
        init: function() {
            this.bindEvents();
            this.initializeTextarea();
            this.updateCharCount();
            this.addWelcomeMessage();
        },

        // Bind all event handlers
        bindEvents: function() {
            const self = this;

            // Send message events
            this.elements.sendBtn.on('click', function() {
                self.sendMessage();
            });

            this.elements.userInput.on('keydown', function(e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    self.sendMessage();
                }
            });

            // Input handling
            this.elements.userInput.on('input', function() {
                self.handleInputChange();
            });

            // Quick action buttons
            this.elements.quickActions.on('click', function() {
                const action = $(this).data('action');
                self.handleQuickAction(action);
            });

            // Copy code functionality
            $(document).on('click', '.copy-btn', function() {
                const codeType = $(this).data('copy');
                self.copyCode($(this));
            });

            // Minimize/Expand functionality
            this.elements.minimizeBtn.on('click', function() {
                self.toggleMinimize();
            });

            this.elements.expandBtn.on('click', function() {
                self.toggleExpand();
            });

            // Attach code functionality
            this.elements.attachBtn.on('click', function() {
                self.handleAttachCode();
            });

            // Auto-resize textarea
            this.elements.userInput.on('input', function() {
                self.autoResizeTextarea($(this));
            });
        },

        // Initialize textarea functionality
        initializeTextarea: function() {
            this.autoResizeTextarea(this.elements.userInput);
        },

        // Auto-resize textarea based on content
        autoResizeTextarea: function(textarea) {
            textarea[0].style.height = 'auto';
            textarea[0].style.height = Math.min(textarea[0].scrollHeight, 120) + 'px';
        },

        // Handle input changes
        handleInputChange: function() {
            this.updateCharCount();
            this.updateSendButton();
        },

        // Update character count
        updateCharCount: function() {
            const currentLength = this.elements.userInput.val().length;
            this.elements.charCount.text(`${currentLength}/${this.config.maxCharCount}`);
            
            if (currentLength > this.config.maxCharCount * 0.9) {
                this.elements.charCount.css('color', '#ef4444');
            } else {
                this.elements.charCount.css('color', '#64748b');
            }
        },

        // Update send button state
        updateSendButton: function() {
            const hasText = this.elements.userInput.val().trim().length > 0;
            this.elements.sendBtn.prop('disabled', !hasText || this.state.isTyping);
        },

        // Send user message
        sendMessage: function() {
            const message = this.elements.userInput.val().trim();
            if (!message || this.state.isTyping) return;

            this.addUserMessage(message);
            this.elements.userInput.val('');
            this.handleInputChange();
            this.autoResizeTextarea(this.elements.userInput);
            
            // Simulate AI response
            setTimeout(() => {
                this.simulateAIResponse(message);
            }, 500);
        },

        // Add user message to chat
        addUserMessage: function(message) {
            const messageHtml = this.createMessageHTML(message, 'user');
            this.elements.chatMessages.append(messageHtml);
            this.scrollToBottom();
            this.state.messageCount++;
        },

        // Add assistant message to chat
        addAssistantMessage: function(message, isTyping = false) {
            const messageHtml = this.createMessageHTML(message, 'assistant', isTyping);
            this.elements.chatMessages.append(messageHtml);
            this.scrollToBottom();
            this.state.messageCount++;
        },

        // Create message HTML
        createMessageHTML: function(message, sender, isTyping = false) {
            const timestamp = this.getTimestamp();
            const messageId = `msg-${Date.now()}`;
            
            const avatarIcon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
            const messageClass = sender === 'user' ? 'user-message' : 'assistant-message';
            
            return `
                <div class="message ${messageClass}" id="${messageId}">
                    ${sender === 'assistant' ? `
                        <div class="message-avatar">
                            <i class="${avatarIcon}"></i>
                        </div>
                    ` : ''}
                    <div class="message-content">
                        <div class="message-bubble">
                            ${isTyping ? '<div class="typing-indicator">AI is thinking...</div>' : `<p>${this.formatMessage(message)}</p>`}
                        </div>
                        <div class="message-time">${timestamp}</div>
                    </div>
                    ${sender === 'user' ? `
                        <div class="message-avatar">
                            <i class="${avatarIcon}"></i>
                        </div>
                    ` : ''}
                </div>
            `;
        },

        // Format message content
        formatMessage: function(message) {
            // Basic message formatting
            return message
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                .replace(/\n/g, '<br>');
        },

        // Get current timestamp
        getTimestamp: function() {
            const now = new Date();
            return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },

        // Scroll chat to bottom
        scrollToBottom: function() {
            setTimeout(() => {
                const chatContainer = this.elements.chatMessages[0];
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }, this.config.autoScrollDelay);
        },

        // Simulate AI response based on user message
        simulateAIResponse: function(userMessage) {
            this.state.isTyping = true;
            this.updateSendButton();

            // Add typing indicator
            const typingMessage = this.createMessageHTML('', 'assistant', true);
            this.elements.chatMessages.append(typingMessage);
            this.scrollToBottom();

            setTimeout(() => {
                // Remove typing indicator
                this.elements.chatMessages.find('.message').last().remove();
                
                // Generate response based on message content
                const response = this.generateAIResponse(userMessage);
                this.addAssistantMessage(response);
                
                this.state.isTyping = false;
                this.updateSendButton();
            }, 1500 + Math.random() * 1000);
        },

        // Generate AI response
        generateAIResponse: function(userMessage) {
            const lowerMessage = userMessage.toLowerCase();
            
            if (lowerMessage.includes('function') || lowerMessage.includes('code')) {
                return this.getCodeResponse();
            } else if (lowerMessage.includes('debug') || lowerMessage.includes('error')) {
                return this.getDebugResponse();
            } else if (lowerMessage.includes('optimize') || lowerMessage.includes('performance')) {
                return this.getOptimizeResponse();
            } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
                return this.getHelpResponse();
            } else {
                return this.getGenericResponse();
            }
        },

        // Code-related response
        getCodeResponse: function() {
            return `I'd be happy to help you with your code! Here are some ways I can assist:

• **Code Review**: I can analyze your code for best practices and potential improvements
• **Optimization**: Suggest performance improvements and cleaner implementations  
• **Bug Detection**: Help identify and fix common programming issues
• **Documentation**: Generate comments and documentation for your code

Feel free to paste your code snippet, and I'll provide specific feedback!`;
        },

        // Debug-related response
        getDebugResponse: function() {
            return `Let's debug this together! 🔍 Here's how I can help:

• **Error Analysis**: Explain what error messages mean and how to fix them
• **Step-by-step Debugging**: Guide you through troubleshooting processes
• **Common Issues**: Identify patterns in bugs and their solutions
• **Testing Strategies**: Suggest ways to test and validate your fixes

Share the error message or describe the unexpected behavior, and I'll help you track it down!`;
        },

        // Optimization response
        getOptimizeResponse: function() {
            return `Great! Let's optimize your code for better performance 🚀

I can help with:
• **Algorithm Efficiency**: Suggest more efficient algorithms and data structures
• **Memory Usage**: Identify memory leaks and optimization opportunities
• **Code Readability**: Make code more maintainable and easier to understand
• **Performance Metrics**: Analyze time and space complexity

Share your code, and I'll provide specific optimization recommendations!`;
        },

        // Help response
        getHelpResponse: function() {
            return `I'm here to help! 👋 Here are some things you can ask me:

• "**Review this function**" - I'll analyze your code for improvements
• "**How do I [specific task]**" - Get step-by-step guidance
• "**Explain this error**" - Understand what went wrong and how to fix it
• "**Optimize this code**" - Get performance improvement suggestions

You can also use the quick action buttons below for common tasks. What would you like to work on?`;
        },

        // Generic response
        getGenericResponse: function() {
            return `I understand you'd like assistance with your development work. I'm designed to help with:

• Code review and improvements
• Debugging and error resolution  
• Performance optimization
• Best practices and clean code

Could you share more details about what you're working on or paste a code snippet? The more specific you are, the better I can help! 💡`;
        },

        // Handle quick action clicks
        handleQuickAction: function(action) {
            const quickMessages = {
                'review': 'I have some code I\'d like you to review for best practices and potential improvements.',
                'debug': 'I\'m encountering an error in my code. Can you help me debug it?',
                'optimize': 'Can you help me optimize this code for better performance?',
                'explain': 'Can you explain how this code works and what it does?'
            };

            const message = quickMessages[action];
            if (message) {
                this.elements.userInput.val(message);
                this.handleInputChange();
                this.autoResizeTextarea(this.elements.userInput);
                this.elements.userInput.focus();
            }
        },

        // Copy code to clipboard
        copyCode: function(button) {
            const codeBlock = button.closest('.code-snippet').find('code');
            const codeText = codeBlock.text();
            
            navigator.clipboard.writeText(codeText).then(() => {
                // Show feedback
                const originalIcon = button.find('i').attr('class');
                button.find('i').attr('class', 'fas fa-check');
                button.css('color', '#22c55e');
                
                setTimeout(() => {
                    button.find('i').attr('class', originalIcon);
                    button.css('color', '');
                }, 2000);
            }).catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = codeText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                
                button.find('i').attr('class', 'fas fa-check');
                setTimeout(() => {
                    button.find('i').attr('class', 'fas fa-copy');
                }, 2000);
            });
        },

        // Toggle minimize state
        toggleMinimize: function() {
            this.state.isMinimized = !this.state.isMinimized;
            this.elements.container.toggleClass('minimized', this.state.isMinimized);
            
            const icon = this.elements.minimizeBtn.find('i');
            if (this.state.isMinimized) {
                icon.attr('class', 'fas fa-plus');
            } else {
                icon.attr('class', 'fas fa-minus');
            }
        },

        // Toggle expand state
        toggleExpand: function() {
            this.state.isExpanded = !this.state.isExpanded;
            this.elements.container.toggleClass('expanded', this.state.isExpanded);
            
            const icon = this.elements.expandBtn.find('i');
            if (this.state.isExpanded) {
                icon.attr('class', 'fas fa-compress');
            } else {
                icon.attr('class', 'fas fa-expand');
            }
        },

        // Handle attach code functionality
        handleAttachCode: function() {
            // Create file input dynamically
            const fileInput = $('<input type="file" accept=".js,.ts,.jsx,.tsx,.css,.scss,.html,.php,.py,.java,.cpp,.c,.h" style="display:none">');
            
            fileInput.on('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const content = e.target.result;
                        const fileType = file.name.split('.').pop();
                        const message = `I've attached a ${fileType.toUpperCase()} file (${file.name}). Can you review it?\n\n\`\`\`${fileType}\n${content}\n\`\`\``;
                        
                        this.elements.userInput.val(message);
                        this.handleInputChange();
                        this.autoResizeTextarea(this.elements.userInput);
                    };
                    reader.readAsText(file);
                }
            });
            
            $('body').append(fileInput);
            fileInput.click();
            fileInput.remove();
        },

        // Add welcome message (called on init)
        addWelcomeMessage: function() {
            // Welcome message is already in HTML, so we just need to set up any dynamic content
            setTimeout(() => {
                this.scrollToBottom();
            }, 500);
        }
    };

    // Initialize the Code Assistant when document is ready
    CodeAssistant.init();

    // Make CodeAssistant globally available for debugging
    window.CodeAssistant = CodeAssistant;
});