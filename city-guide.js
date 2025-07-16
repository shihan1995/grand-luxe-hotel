// City Guide AI Chat Functionality
class CityGuideAI {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.imageUpload = document.getElementById('imageUpload');
        this.isProcessing = false;
        
        this.initializeEventListeners();
        this.loadChatHistory();
    }

    initializeEventListeners() {
        // Send message on button click
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Image upload handling
        this.imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
        });

        // Quick question chips
        document.querySelectorAll('.question-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const question = chip.getAttribute('data-question');
                this.userInput.value = question;
                this.sendMessage();
            });
        });
    }

    sendMessage() {
        const message = this.userInput.value.trim();
        if (!message || this.isProcessing) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.userInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate AI response
        setTimeout(() => {
            this.hideTypingIndicator();
            this.generateAIResponse(message);
        }, 1000 + Math.random() * 2000);
    }

    addMessage(content, sender, imageUrl = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = 'Uploaded image';
            img.className = 'uploaded-image';
            messageContent.appendChild(img);
        }

        if (typeof content === 'string') {
            messageContent.innerHTML = this.formatMessage(content);
        } else {
            messageContent.appendChild(content);
        }

        messageDiv.appendChild(messageContent);
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        // Save to localStorage
        this.saveChatHistory();
    }

    formatMessage(message) {
        // Convert URLs to clickable links
        message = message.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Convert line breaks to HTML
        message = message.replace(/\n/g, '<br>');
        
        return message;
    }

    generateAIResponse(userMessage) {
        const responses = this.getAIResponses(userMessage.toLowerCase());
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        this.addMessage(response, 'ai');
    }

    getAIResponses(userMessage) {
        const responses = {
            'attractions': [
                "🏛️ Here are the top attractions in our city:\n\n" +
                "• **Historic Downtown District** - Beautiful architecture and cobblestone streets\n" +
                "• **Central Park** - 50 acres of green space with walking trails and gardens\n" +
                "• **City Museum** - Fascinating exhibits on local history and culture\n" +
                "• **Riverside Walk** - Scenic 3-mile path along the river with cafes\n" +
                "• **Art Gallery District** - Home to 20+ galleries and street art\n\n" +
                "Most attractions are within 15 minutes of the hotel. Would you like specific directions to any of these?",
                
                "🌟 The must-see attractions include:\n\n" +
                "**Cultural Sites:**\n" +
                "• Grand Opera House (5 min walk)\n" +
                "• Contemporary Art Museum\n" +
                "• Historic Cathedral\n\n" +
                "**Outdoor Activities:**\n" +
                "• Botanical Gardens\n" +
                "• City Zoo\n" +
                "• Waterfront Promenade\n\n" +
                "I recommend starting with the Opera House - it's our most iconic landmark!"
            ],
            
            'restaurants': [
                "🍽️ Here are the best dining options:\n\n" +
                "**Fine Dining:**\n" +
                "• Le Grand (French cuisine, 2 blocks away)\n" +
                "• Ocean Blue (Seafood, waterfront)\n" +
                "• The Golden Fork (Italian, romantic)\n\n" +
                "**Local Favorites:**\n" +
                "• Market Street Bistro (Farm-to-table)\n" +
                "• Spice Garden (Authentic Indian)\n" +
                "• Brew & Bites (Craft beer + food)\n\n" +
                "**Budget-Friendly:**\n" +
                "• Food Truck Park (Various cuisines)\n" +
                "• Central Market (Local vendors)\n\n" +
                "What type of cuisine are you in the mood for?",
                
                "🥘 Top restaurant recommendations:\n\n" +
                "**Near the Hotel:**\n" +
                "• Café Luxe (Breakfast & brunch)\n" +
                "• The Corner (Casual dining)\n" +
                "• Wine & Dine (Wine bar with tapas)\n\n" +
                "**Downtown Area:**\n" +
                "• Fusion Kitchen (Asian fusion)\n" +
                "• Rustic Table (American comfort food)\n" +
                "• Sweet Dreams (Dessert café)\n\n" +
                "Most restaurants are open until 10-11 PM. Would you like me to check current availability?"
            ],
            
            'events': [
                "🎭 Current events this week:\n\n" +
                "**Tonight:**\n" +
                "• Jazz Night at Blue Note (8 PM)\n" +
                "• Food Festival at Central Square\n\n" +
                "**This Weekend:**\n" +
                "• Art Walk (Saturday 2-8 PM)\n" +
                "• Farmers Market (Sunday 9 AM-2 PM)\n" +
                "• Live Music at Riverside Park\n\n" +
                "**Ongoing:**\n" +
                "• Photography Exhibition at City Gallery\n" +
                "• Theater Production: 'City Lights'\n\n" +
                "Would you like tickets or more details about any of these events?",
                
                "📅 Here's what's happening:\n\n" +
                "**Cultural Events:**\n" +
                "• Classical Concert Series (Thursdays)\n" +
                "• Poetry Night (Fridays)\n" +
                "• Art Workshops (Weekends)\n\n" +
                "**Entertainment:**\n" +
                "• Comedy Club (Wednesday-Saturday)\n" +
                "• Live Band at The Grand (Fridays)\n" +
                "• Movie Night in the Park (Saturdays)\n\n" +
                "**Family-Friendly:**\n" +
                "• Children's Theater (Saturdays)\n" +
                "• Science Museum Workshops\n" +
                "• Story Time at Library\n\n" +
                "Most events are free or low-cost. Should I help you plan your itinerary?"
            ],
            
            'shopping': [
                "🛍️ Best shopping areas:\n\n" +
                "**Luxury Shopping:**\n" +
                "• Grand Avenue (High-end boutiques)\n" +
                "• The Plaza (Designer stores)\n\n" +
                "**Local Markets:**\n" +
                "• Central Market (Daily, 8 AM-6 PM)\n" +
                "• Artisan Market (Weekends)\n" +
                "• Antique District (Vintage finds)\n\n" +
                "**Malls & Centers:**\n" +
                "• City Center Mall (200+ stores)\n" +
                "• Riverside Shopping District\n" +
                "• Downtown Boutique Row\n\n" +
                "**Souvenirs:**\n" +
                "• Tourist Information Center\n" +
                "• Local Craft Shops\n" +
                "• Museum Gift Shops\n\n" +
                "Most shops are open 10 AM-8 PM. What are you looking to buy?",
                
                "💎 Shopping recommendations:\n\n" +
                "**Fashion & Accessories:**\n" +
                "• Fashion District (Trendy boutiques)\n" +
                "• Jewelry Row (Custom pieces)\n" +
                "• Shoe Street (Footwear heaven)\n\n" +
                "**Local Products:**\n" +
                "• Handmade Crafts Market\n" +
                "• Local Art Galleries\n" +
                "• Specialty Food Shops\n\n" +
                "**Budget Shopping:**\n" +
                "• Outlet Mall (20 min drive)\n" +
                "• Thrift Stores\n" +
                "• Student Discount Areas\n\n" +
                "Many stores offer hotel guest discounts. Should I help you find specific items?"
            ],
            
            'transportation': [
                "🚌 Getting around the city:\n\n" +
                "**Public Transport:**\n" +
                "• Metro: 6 lines, runs 5 AM-1 AM\n" +
                "• Buses: Extensive network, $2 per ride\n" +
                "• Streetcar: Historic route, scenic views\n\n" +
                "**Walking:**\n" +
                "• Downtown is very walkable\n" +
                "• Pedestrian-friendly streets\n" +
                "• Walking tours available\n\n" +
                "**Other Options:**\n" +
                "• Taxi: Available 24/7\n" +
                "• Ride-sharing: Uber/Lyft\n" +
                "• Bike rentals: $15/day\n\n" +
                "**From Hotel:**\n" +
                "• Metro station: 2 blocks away\n" +
                "• Bus stop: Right outside\n" +
                "• Walking to most attractions: 10-20 min\n\n" +
                "Would you like a transport map or specific directions?",
                
                "🚶 Transportation options:\n\n" +
                "**Near Hotel:**\n" +
                "• Central Station (5 min walk)\n" +
                "• Bus Routes: 1, 3, 7, 12\n" +
                "• Taxi Stand: Hotel entrance\n\n" +
                "**Getting Around:**\n" +
                "• Day Pass: $8 (unlimited rides)\n" +
                "• Weekly Pass: $25\n" +
                "• Tourist Card: $15 (includes attractions)\n\n" +
                "**Tips:**\n" +
                "• Download the city transport app\n" +
                "• Free hotel shuttle to downtown\n" +
                "• Walking tours depart from hotel lobby\n\n" +
                "The city is very accessible! What's your preferred way to explore?"
            ],
            
            'hidden gems': [
                "💎 Hidden gems loved by locals:\n\n" +
                "**Secret Spots:**\n" +
                "• Rooftop Garden Café (Amazing city views)\n" +
                "• Underground Jazz Club (Speakeasy vibe)\n" +
                "• Hidden Bookstore (Rare books, coffee)\n\n" +
                "**Local Favorites:**\n" +
                "• Grandma's Kitchen (Best comfort food)\n" +
                "• Artist's Alley (Street art, galleries)\n" +
                "• Sunset Point (Best photo spot)\n\n" +
                "**Off-the-Beaten-Path:**\n" +
                "• Secret Garden (Peaceful retreat)\n" +
                "• Vintage Record Store\n" +
                "• Local Brewery (Craft beer tasting)\n\n" +
                "These spots are where locals go to avoid tourist crowds. Want specific directions?",
                
                "🌟 Local secrets you'll love:\n\n" +
                "**Food & Drink:**\n" +
                "• The Hole in the Wall (Best burgers)\n" +
                "• Secret Wine Cellar (Reservation only)\n" +
                "• Morning Market (Fresh local produce)\n\n" +
                "**Culture & Art:**\n" +
                "• Underground Art Gallery\n" +
                "• Local Music Venue\n" +
                "• Community Theater\n\n" +
                "**Nature & Relaxation:**\n" +
                "• Hidden Park (Perfect for picnics)\n" +
                "• Meditation Garden\n" +
                "• Secret Beach Access\n\n" +
                "These are the places that make our city special. Should I help you discover them?"
            ]
        };

        // Check for keywords in user message
        for (const [keyword, responseArray] of Object.entries(responses)) {
            if (userMessage.includes(keyword) || 
                userMessage.includes('attraction') || 
                userMessage.includes('restaurant') || 
                userMessage.includes('food') || 
                userMessage.includes('eat') || 
                userMessage.includes('event') || 
                userMessage.includes('activity') || 
                userMessage.includes('shop') || 
                userMessage.includes('buy') || 
                userMessage.includes('transport') || 
                userMessage.includes('bus') || 
                userMessage.includes('metro') || 
                userMessage.includes('walk') || 
                userMessage.includes('hidden') || 
                userMessage.includes('local') || 
                userMessage.includes('secret')) {
                return responseArray;
            }
        }

        // Default responses for general questions
        return [
            "I'd be happy to help you explore our wonderful city! What specific information are you looking for? I can help with:\n\n" +
            "• 🏛️ Attractions and landmarks\n" +
            "• 🍽️ Restaurants and dining\n" +
            "• 🎭 Events and activities\n" +
            "• 🛍️ Shopping and markets\n" +
            "• 🚌 Transportation options\n" +
            "• 💎 Hidden gems and local secrets\n\n" +
            "Just ask me anything about the city!",
            
            "Great question! Our city has so much to offer. I can provide information about:\n\n" +
            "**Places to Visit:** Museums, parks, landmarks, galleries\n" +
            "**Where to Eat:** Fine dining, casual spots, local favorites\n" +
            "**Things to Do:** Events, activities, entertainment\n" +
            "**Getting Around:** Public transport, walking routes, taxis\n" +
            "**Shopping:** Markets, boutiques, malls\n\n" +
            "What interests you most? I'll give you the inside scoop!",
            
            "I'm here to help you discover the best of our city! Whether you're interested in:\n\n" +
            "• Cultural experiences and museums\n" +
            "• Outdoor activities and parks\n" +
            "• Nightlife and entertainment\n" +
            "• Family-friendly activities\n" +
            "• Romantic spots for couples\n" +
            "• Budget-friendly options\n\n" +
            "Just let me know what you're looking for, and I'll provide personalized recommendations!"
        ];
    }

    handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            this.addMessage('Please select a valid image file.', 'ai');
            return;
        }

        // Show uploaded image
        const reader = new FileReader();
        reader.onload = (e) => {
            this.addMessage('Analyzing your image...', 'user', e.target.result);
            
            // Simulate AI image analysis
            setTimeout(() => {
                this.analyzeImage(file.name);
            }, 2000);
        };
        reader.readAsDataURL(file);
    }

    analyzeImage(fileName) {
        const analyses = [
            "🔍 **Image Analysis Complete!**\n\n" +
            "I can see you've uploaded an image. Based on my analysis, this appears to be a city landmark or attraction. Here's what I can tell you:\n\n" +
            "**Location:** Downtown area\n" +
            "**Type:** Historical building/landmark\n" +
            "**Best Time to Visit:** Morning or late afternoon for best photos\n" +
            "**Nearby Attractions:** Several museums and cafes within walking distance\n" +
            "**Transportation:** Easily accessible by metro or bus\n\n" +
            "Would you like specific directions or more information about this area?",
            
            "📸 **Image Analysis Results:**\n\n" +
            "This looks like a beautiful architectural landmark! Here's what I found:\n\n" +
            "**Architecture Style:** Classical/Historic\n" +
            "**Significance:** Important cultural site\n" +
            "**Visitor Tips:**\n" +
            "• Visit during golden hour for amazing photos\n" +
            "• Guided tours available daily\n" +
            "• Café nearby for refreshments\n" +
            "• Free admission on certain days\n\n" +
            "This is definitely worth a visit! Should I help you plan your trip there?",
            
            "🎯 **Image Recognition Complete:**\n\n" +
            "I've identified this location! Here's what you should know:\n\n" +
            "**What It Is:** Popular tourist destination\n" +
            "**Why Visit:** Rich history and beautiful architecture\n" +
            "**Getting There:** 15-minute walk from the hotel\n" +
            "**Best Experience:**\n" +
            "• Go early to avoid crowds\n" +
            "• Take a guided tour for full history\n" +
            "• Visit the gift shop for souvenirs\n" +
            "• Check out the surrounding area\n\n" +
            "This is one of our city's highlights! Need help with directions?"
        ];

        const analysis = analyses[Math.floor(Math.random() * analyses.length)];
        this.addMessage(analysis, 'ai');
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
        this.isProcessing = true;
    }

    hideTypingIndicator() {
        const typingIndicator = this.chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        this.isProcessing = false;
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    saveChatHistory() {
        const messages = this.chatMessages.innerHTML;
        localStorage.setItem('cityGuideChat', messages);
    }

    loadChatHistory() {
        const savedChat = localStorage.getItem('cityGuideChat');
        if (savedChat) {
            this.chatMessages.innerHTML = savedChat;
            this.scrollToBottom();
        }
    }
}

// Initialize the AI chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CityGuideAI();
}); 