// Navigation functionality
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for anchor links
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Form handling
document.addEventListener('DOMContentLoaded', function() {
    // Booking form
    const bookingForm = document.querySelector('.reservation-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Booking request submitted! We\'ll contact you soon.', 'success');
            // Reset spin wheel when booking
            localStorage.removeItem('spinUsed');
            updateSpinButton();
        });
    }

    // Contact form
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        });
    }
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Add CSS for notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
    }
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
`;
document.head.appendChild(style);

// Spin Wheel Game
class SpinWheel {
    constructor() {
        this.canvas = document.getElementById('wheel');
        this.ctx = this.canvas.getContext('2d');
        this.isSpinning = false;
        this.prizes = [
            '50% Off Room Rate',
            'Free Breakfast',
            'Spa Treatment',
            '25% Off Room Rate',
            'Free Welcome Drink',
            '15% Off Room Rate',
            'Free Valet Parking',
            '10% Off Room Rate'
        ];
        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ];
        this.init();
    }

    init() {
        this.drawWheel();
        this.updateSpinButton();
    }

    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 180;
        const sliceAngle = (2 * Math.PI) / this.prizes.length;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.prizes.length; i++) {
            const startAngle = i * sliceAngle;
            const endAngle = startAngle + sliceAngle;

            // Draw slice
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = this.colors[i];
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw text
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(startAngle + sliceAngle / 2);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText(this.prizes[i], radius - 20, 4);
            this.ctx.restore();
        }

        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#c8a27d';
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
    }

    spin() {
        if (this.isSpinning) return;

        const spinUsed = localStorage.getItem('spinUsed');
        if (spinUsed) {
            showNotification('You\'ve already used your spin for this stay!', 'error');
            return;
        }

        this.isSpinning = true;
        const spinButton = document.getElementById('spin-btn');
        spinButton.disabled = true;
        spinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SPINNING...';

        const spins = 5 + Math.random() * 5;
        const duration = 3000;
        const startTime = Date.now();
        const startRotation = 0;
        const endRotation = startRotation + (spins * 360) + (Math.random() * 360);

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentRotation = startRotation + (endRotation - startRotation) * easeOut;

            this.canvas.style.transform = `rotate(${currentRotation}deg)`;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.handleSpinResult(endRotation);
            }
        };

        animate();
    }

    handleSpinResult(finalRotation) {
        const sliceAngle = 360 / this.prizes.length;
        const normalizedRotation = (360 - (finalRotation % 360)) % 360;
        const prizeIndex = Math.floor(normalizedRotation / sliceAngle);
        const prize = this.prizes[prizeIndex];

        // Save spin usage
        localStorage.setItem('spinUsed', 'true');
        this.updateSpinButton();

        // Update prize display
        const prizeResult = document.getElementById('prize-result');
        prizeResult.innerHTML = `
            <i class="fas fa-gift"></i>
            <p>${prize}</p>
        `;
        prizeResult.classList.add('prize-won');

        showNotification(`Congratulations! You won: ${prize}`, 'success');

        this.isSpinning = false;
        const spinButton = document.getElementById('spin-btn');
        spinButton.disabled = true;
        spinButton.innerHTML = '<i class="fas fa-check"></i> SPIN USED';
    }

    updateSpinButton() {
        const spinButton = document.getElementById('spin-btn');
        const spinUsed = localStorage.getItem('spinUsed');
        
        if (spinUsed) {
            spinButton.disabled = true;
            spinButton.innerHTML = '<i class="fas fa-check"></i> SPIN USED';
        } else {
            spinButton.disabled = false;
            spinButton.innerHTML = '<i class="fas fa-play"></i> SPIN THE WHEEL';
        }
    }
}

// Memory Game
class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameStarted = false;
        this.difficulty = 'easy';
        this.cardIcons = [
            'fas fa-bed', 'fas fa-utensils', 'fas fa-spa', 'fas fa-swimming-pool',
            'fas fa-wifi', 'fas fa-car', 'fas fa-concierge-bell', 'fas fa-dumbbell',
            'fas fa-umbrella-beach', 'fas fa-wine-glass', 'fas fa-coffee', 'fas fa-tv',
            'fas fa-bath', 'fas fa-couch', 'fas fa-home', 'fas fa-user-tie',
            'fas fa-glass-martini', 'fas fa-parking', 'fas fa-percentage', 'fas fa-star',
            'fas fa-heart', 'fas fa-gem', 'fas fa-crown', 'fas fa-trophy',
            'fas fa-music', 'fas fa-camera', 'fas fa-plane', 'fas fa-ship',
            'fas fa-bicycle', 'fas fa-hiking', 'fas fa-fish', 'fas fa-tree'
        ];
        this.rewards = [
            'Free Room Upgrade',
            'Complimentary Spa Session',
            'Free Breakfast for 2',
            'Late Checkout',
            'Welcome Gift Basket',
            'Free Parking',
            'Room Service Credit',
            'Fitness Class Pass'
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createBoard();
        this.updateDisplay();
    }

    setupEventListeners() {
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.newGame());
        }

        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
                this.newGame();
            });
        });
    }

    createBoard() {
        const board = document.getElementById('memory-board');
        if (!board) return;

        board.innerHTML = '';
        
        const gridSizes = {
            easy: { cols: 4, rows: 4 },
            medium: { cols: 6, rows: 6 },
            hard: { cols: 8, rows: 8 }
        };

        const size = gridSizes[this.difficulty];
        const totalCards = size.cols * size.rows;
        const pairs = totalCards / 2;

        // Create card pairs
        this.cards = [];
        for (let i = 0; i < pairs; i++) {
            const icon = this.cardIcons[i % this.cardIcons.length];
            this.cards.push(
                { id: i * 2, icon: icon, isFlipped: false, isMatched: false }
            );
        }

        // Shuffle cards
        this.shuffleCards();

        // Create card elements
        board.style.gridTemplateColumns = `repeat(${size.cols}, 1fr)`;
        
        this.cards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.id = card.id;
            cardElement.innerHTML = `<i class="${card.icon}"></i>`;
            
            cardElement.addEventListener('click', () => this.flipCard(card.id));
            
            board.appendChild(cardElement);
        });
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    flipCard(cardId) {
        if (!this.gameStarted) {
            this.startGame();
        }

        const card = this.cards.find(c => c.id === cardId);
        if (!card || card.isFlipped || card.isMatched || this.flippedCards.length >= 2) {
            return;
        }

        card.isFlipped = true;
        this.flippedCards.push(card);
        
        const cardElement = document.querySelector(`[data-id="${cardId}"]`);
        cardElement.classList.add('flipped');

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.checkMatch();
        }

        this.updateDisplay();
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        setTimeout(() => {
            if (card1.icon === card2.icon) {
                // Match found
                card1.isMatched = card2.isMatched = true;
                this.matchedPairs++;
                this.score += 100;
                
                const card1Element = document.querySelector(`[data-id="${card1.id}"]`);
                const card2Element = document.querySelector(`[data-id="${card2.id}"]`);
                
                card1Element.classList.add('matched');
                card2Element.classList.add('matched');

                if (this.matchedPairs === this.cards.length / 2) {
                    this.gameWon();
                }
            } else {
                // No match
                card1.isFlipped = card2.isFlipped = false;
                
                const card1Element = document.querySelector(`[data-id="${card1.id}"]`);
                const card2Element = document.querySelector(`[data-id="${card2.id}"]`);
                
                card1Element.classList.remove('flipped');
                card2Element.classList.remove('flipped');
            }
            
            this.flippedCards = [];
            this.updateDisplay();
        }, 1000);
    }

    startGame() {
        this.gameStarted = true;
        this.timer = 0;
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateDisplay();
        }, 1000);
    }

    gameWon() {
        clearInterval(this.timerInterval);
        
        const timeBonus = Math.max(0, 120 - this.timer) * 10;
        const moveBonus = Math.max(0, 50 - this.moves) * 5;
        this.score += timeBonus + moveBonus;

        const reward = this.rewards[Math.floor(Math.random() * this.rewards.length)];
        
        const rewardDisplay = document.getElementById('memory-reward');
        rewardDisplay.innerHTML = `
            <i class="fas fa-trophy"></i>
            <p>${reward}</p>
            <small>Score: ${this.score}</small>
        `;
        rewardDisplay.classList.add('prize-won');

        showNotification(`Congratulations! You won: ${reward}`, 'success');
        
        // Save game completion
        localStorage.setItem('memoryGameCompleted', 'true');
    }

    newGame() {
        clearInterval(this.timerInterval);
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.timer = 0;
        this.gameStarted = false;
        
        this.createBoard();
        this.updateDisplay();
        
        const rewardDisplay = document.getElementById('memory-reward');
        rewardDisplay.innerHTML = `
            <i class="fas fa-gamepad"></i>
            <p>Complete the game to win a special reward!</p>
        `;
        rewardDisplay.classList.remove('prize-won');
    }

    updateDisplay() {
        const timerElement = document.getElementById('timer');
        const movesElement = document.getElementById('moves');
        const scoreElement = document.getElementById('score');

        if (timerElement) {
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        if (movesElement) {
            movesElement.textContent = this.moves;
        }

        if (scoreElement) {
            scoreElement.textContent = this.score;
        }
    }
}

// Initialize games when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize spin wheel
    const spinWheel = new SpinWheel();
    
    // Add spin button event listener
    const spinButton = document.getElementById('spin-btn');
    if (spinButton) {
        spinButton.addEventListener('click', () => spinWheel.spin());
    }

    // Initialize memory game
    const memoryGame = new MemoryGame();
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.feature-card, .room-card, .amenity-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Date validation for booking form
document.addEventListener('DOMContentLoaded', () => {
    const checkInInput = document.getElementById('check-in');
    const checkOutInput = document.getElementById('check-out');
    
    if (checkInInput && checkOutInput) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        checkInInput.min = today;
        
        checkInInput.addEventListener('change', () => {
            const checkInDate = new Date(checkInInput.value);
            const nextDay = new Date(checkInDate);
            nextDay.setDate(nextDay.getDate() + 1);
            checkOutInput.min = nextDay.toISOString().split('T')[0];
            
            // If checkout date is before checkin date, clear it
            if (checkOutInput.value && new Date(checkOutInput.value) <= checkInDate) {
                checkOutInput.value = '';
            }
        });
        
        checkOutInput.addEventListener('change', () => {
            const checkInDate = new Date(checkInInput.value);
            const checkOutDate = new Date(checkOutInput.value);
            
            if (checkOutDate <= checkInDate) {
                showNotification('Check-out date must be after check-in date', 'error');
                checkOutInput.value = '';
            }
        });
    }
});

// Lazy loading for images
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.opacity = '1';
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
        imageObserver.observe(img);
    });
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroImage = document.querySelector('.hero-image');
    
    if (heroImage) {
        const rate = scrolled * -0.5;
        heroImage.style.transform = `translateY(${rate}px)`;
    }
});

// Counter animation for stats
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// Animate stats when they come into view
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statElements = entry.target.querySelectorAll('.stat h3');
            statElements.forEach(stat => {
                const text = stat.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                if (number) {
                    stat.textContent = text.replace(number, '0');
                    setTimeout(() => {
                        animateCounter(stat, number);
                    }, 500);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', () => {
    const statsSection = document.querySelector('.about-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
});

// Add loading state to buttons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.type === 'submit') {
                const originalText = this.textContent;
                this.textContent = 'Processing...';
                this.disabled = true;
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.disabled = false;
                }, 2000);
            }
        });
    });
});

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close mobile menu
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        // Close notifications
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => notification.remove());
    }
});

// Accessibility improvements
document.addEventListener('DOMContentLoaded', () => {
    // Add ARIA labels
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        if (!button.getAttribute('aria-label')) {
            button.setAttribute('aria-label', button.textContent.trim());
        }
    });
    
    // Add skip link for accessibility
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: #c8a27d;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 10001;
    `;
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content landmark
    const mainContent = document.querySelector('.hero');
    if (mainContent) {
        mainContent.id = 'main-content';
    }
});

console.log('Grand Luxe Hotel - Luxury Accommodations');
console.log('Spin & Win game with one-time limit loaded successfully!'); 