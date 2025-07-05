/**
 * KAANI Perfume - AI Chatbot Functions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Chatbot elements
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('chatbot-container');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    
    // Chatbot state
    let chatHistory = [];
    let isTyping = false;
    
    // Welcome messages
    const welcomeMessages = [
        "Hello! I am KAANI Perfume's AI assistant. How can I help you choose a perfume?",
        "If you tell me which scent notes you like or what gender or season you are looking for a perfume for, I can make recommendations."
    ];
    
    // Predefined chatbot responses for common questions
    const predefinedResponses = {
        "merhaba": "Merhaba! Size nasıl yardımcı olabilirim?",
        "selam": "Selam! Parfüm seçiminizde size nasıl yardımcı olabilirim?",
        "yardım": "Size parfüm önerilerinde bulunabilirim. Hangi koku notalarını sevdiğinizi, hangi mevsim için parfüm aradığınızı veya tercih ettiğiniz markayı söylerseniz size özel önerilerde bulunabilirim.",
        "teşekkür": "Rica ederim! Başka bir konuda yardıma ihtiyacınız olursa bana sorabilirsiniz.",
        "teşekkürler": "Rica ederim! Başka bir konuda yardıma ihtiyacınız olursa bana sorabilirsiniz.",
        "hello": "Hello! How can I help you?",
        "hi": "Hi! How can I help you with your perfume selection?",
        "help": "I can give you perfume suggestions. If you tell me which fragrance notes you like, what season you are looking for perfume for, or your preferred brand, I can make special recommendations to you.",
        "thanks": "You're welcome! If you need help with anything else, you can ask me.",
        "thank you": "You're welcome! If you need help with anything else, you can ask me."
    };
    
    // Toggle chatbot
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', function() {
            toggleChatbot();
        });
    }
    
    // Close chatbot
    if (chatbotClose) {
        chatbotClose.addEventListener('click', function() {
            closeChatbot();
        });
    }
    
    // Send message on form submit
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }
    
    // Send message on button click
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', function() {
            sendMessage();
        });
    }
    
    // Send message on enter key
    if (chatInput) {
        // Using "keydown" ensures the event fires consistently across browsers.
        chatInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Open chatbot
    function toggleChatbot() {
        if (chatbotContainer) {
            chatbotContainer.classList.toggle('open');
            
            // Show welcome message if first time opening
            if (chatbotContainer.classList.contains('open') && chatHistory.length === 0) {
                showWelcomeMessage();
            }
        }
    }
    
    // Close chatbot
    function closeChatbot() {
        if (chatbotContainer) {
            chatbotContainer.classList.remove('open');
        }
    }
    
    // Show welcome message
    function showWelcomeMessage() {
        // Add delay for natural feel
        setTimeout(() => {
            addBotMessage(welcomeMessages[0]);
            
            setTimeout(() => {
                addBotMessage(welcomeMessages[1]);
            }, 1000);
        }, 500);
    }
    
    // Send user message
    function sendMessage() {
        if (!chatInput || !chatMessages) return;
        
        const message = chatInput.value.trim();
        if (message === '') return;
        
        // Add user message to chat
        addUserMessage(message);
        
        // Clear input
        chatInput.value = '';
        
        // Process message and get response
        processMessage(message);
    }
    
    // Add user message to chat
    function addUserMessage(message) {
        if (!chatMessages) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message user-message';
        messageElement.innerHTML = `
            <div class="message-content">
                <p>${formatMessage(message)}</p>
            </div>
        `;
        
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add to chat history
        chatHistory.push({
            role: 'user',
            content: message
        });
    }
    
    // Add bot message to chat
    function addBotMessage(message) {
        if (!chatMessages) return;
        
        // Show typing indicator
        showTypingIndicator();
        
        // Simulate typing delay based on message length
        const typingDelay = Math.min(1000, message.length * 20);
        
        setTimeout(() => {
            // Remove typing indicator
            hideTypingIndicator();
            
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message bot-message';
            messageElement.innerHTML = `
                <div class="message-avatar">
                    <img class="width: 40px;" src="img/chatbot-avatar.png" alt="AI Assistant">
                </div>
                <div class="message-content">
                    <p>${formatMessage(message)}</p>
                </div>
            `;
            
            chatMessages.appendChild(messageElement);
            
            // Scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Add to chat history
            chatHistory.push({
                role: 'assistant',
                content: message
            });
        }, typingDelay);
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        if (!chatMessages || isTyping) return;
        
        isTyping = true;
        
        const typingElement = document.createElement('div');
        typingElement.className = 'chat-message bot-message typing-indicator';
        typingElement.id = 'typing-indicator';
        typingElement.innerHTML = `
            <div class="message-avatar">
                <img class="width: 40px;" src="img/chatbot-avatar.png" alt="AI Assistant">
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Hide typing indicator
    function hideTypingIndicator() {
        if (!chatMessages) return;
        
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        isTyping = false;
    }
    
    // Process message and get response
    function processMessage(message) {
        // Check for predefined responses
        const lowerMessage = message.toLowerCase();
        
        for (const [key, response] of Object.entries(predefinedResponses)) {
            if (lowerMessage.includes(key)) {
                addBotMessage(response);
                return;
            }
        }
        
        // Check for perfume recommendation request
        if (lowerMessage.includes('offer') || 
            lowerMessage.includes('advice') || 
            lowerMessage.includes('suggestion') || 
            lowerMessage.includes('perfume') || 
            lowerMessage.includes('note')) {
            
            // Send to API for processing
            getPerfumeRecommendation(message);
            return;
        }
        
        // Default response for unknown queries
        addBotMessage("I'm sorry, I don't quite understand. I can give you some perfume recommendations. If you tell me what scent notes you like, what season you are looking for perfume for, your gender, or your preferred brand, I can give you personalized recommendations.");
    }
    
    // Get perfume recommendation from API
    function getPerfumeRecommendation(message) {
        // Show typing indicator
        showTypingIndicator();
        
        // Send request to API
        fetch('api/get_recommendation.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                history: chatHistory
            })
        })
            .then(response => response.json())
            .then(data => {
                // Hide typing indicator
                hideTypingIndicator();
                
                if (data.success) {
                    // Add recommendation message
                    addBotMessage(data.message);
                    
                    // Add perfume recommendations
                    if (data.perfumes && data.perfumes.length > 0) {
                        setTimeout(() => {
                            addPerfumeRecommendations(data.perfumes);
                        }, 1000);
                    }
                } else {
                    // Add error message
                    addBotMessage("Sorry, I can't generate a suggestion right now. Please try again later.");
                }
            })
            .catch(error => {
                console.error('Error getting perfume recommendation:', error);
                
                // Hide typing indicator
                hideTypingIndicator();
                
                // Add error message
                addBotMessage("Sorry, an error occurred. Please try again later.");
            });
    }
    
    // Add perfume recommendations to chat
    function addPerfumeRecommendations(perfumes) {
        if (!chatMessages) return;
        
        console.log('Chatbot - Received perfumes:', perfumes); // Hata ayıklama için log
        
        const recommendationsElement = document.createElement('div');
        recommendationsElement.className = 'chat-message bot-message';
        
        let recommendationsHtml = `
            <div class="message-avatar">
                <img src="img/chatbot-avatar.png" alt="AI Assistant" style="width: 40px;">
            </div>
            <div class="message-content">
                <div class="perfume-recommendations">
        `;
        
        perfumes.forEach(perfume => {
            // Parfüm verilerini kontrol et ve varsayılan değerler ata
            const name = perfume.name || perfume.Name || 'Unkown Perfume';
            const brand = perfume.brand || perfume.Brand || 'Unkown Brand';
            const id = perfume.id || '';
            
            // Resim URL'sini kontrol et
            let imageUrl = perfume.image_url || perfume['Image URL'] || perfume.Image || perfume.image || 'https://via.placeholder.com/300x300?text=Parfum';
            
            // Fiyat bilgisini kontrol et
            const price_of_50ml = perfume.price_of_50ml || perfume.price_of_30ml || 0;
            const price_of_30ml = perfume.price_of_30ml || 0;
            
            // Rating bilgisini kontrol et
            const rating = perfume.rating || 0;
            
            console.log(`Chatbot - Perfume: ${name}, Resim: ${imageUrl}`); // Hata ayıklama için log
            
            recommendationsHtml += `
                <div class="recommendation-item" onclick="openPerfumeModal('${id}')">
                    <div class="recommendation-img">
                        <img src="${imageUrl}" alt="${name}" onerror="this.src='https://via.placeholder.com/300x300?text=Parfum'">
                    </div>
                    <div class="recommendation-info">
                        <h5>${name}</h5>
                        <p>${brand}</p>
                        
                        <div class="price">

                        <p>30ml: ${price_of_30ml ? price_of_30ml + ' TL' : ''}</p>
                        <p>50ml: ${price_of_50ml ? price_of_50ml + ' TL' : ''}</p>
                        
                            
                        </div>
                    </div>
                </div>
            `;
        });
        
        recommendationsHtml += `
                </div>
            </div>
        `;
        
        recommendationsElement.innerHTML = recommendationsHtml;
        chatMessages.appendChild(recommendationsElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Yıldız derecelendirme oluşturma fonksiyonu
    function generateStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        let starsHtml = '';

        // Dolu yıldızlar
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<i class="fas fa-star"></i>';
        }

        // Yarım yıldız
        if (halfStar) {
            starsHtml += '<i class="fas fa-star-half-alt"></i>';
        }

        // Boş yıldızlar
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<i class="far fa-star"></i>';
        }

        return starsHtml;
    }
    
    // Format message with line breaks and links
    function formatMessage(message) {
        if (!message) return '';
        
        // Convert line breaks to <br>
        let formattedMessage = message.replace(/\n/g, '<br>');
        
        // Convert URLs to links
        formattedMessage = formattedMessage.replace(
            /(https?:\/\/[^\s]+)/g, 
            '<a href="$1" target="_blank">$1</a>'
        );
        
        return formattedMessage;
    }
    
    // Generate rating stars HTML
    function generateRatingStars(rating) {
        let starsHtml = '';
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHtml += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && halfStar) {
                starsHtml += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHtml += '<i class="far fa-star"></i>';
            }
        }

        return starsHtml;
    }
});
