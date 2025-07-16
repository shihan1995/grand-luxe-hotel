// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Navbar background change on scroll
window.addEventListener('scroll', () => {
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
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.feature-card, .room-card, .amenity-item');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Spin Wheel Game with One-Time Limit
class SpinWheel {
    constructor() {
        this.canvas = document.getElementById('wheel');
        this.ctx = this.canvas.getContext('2d');
        this.spinBtn = document.getElementById('spin-btn');
        this.prizeResult = document.getElementById('prize-result');
        
        this.prizes = [
            { name: '50% Off Room Rate', color: '#e74c3c', icon: 'fas fa-percentage' },
            { name: 'Free Breakfast', color: '#f39c12', icon: 'fas fa-utensils' },
            { name: 'Spa Treatment', color: '#9b59b6', icon: 'fas fa-spa' },
            { name: '25% Off Room Rate', color: '#3498db', icon: 'fas fa-percentage' },
            { name: 'Free Welcome Drink', color: '#1abc9c', icon: 'fas fa-glass-martini' },
            { name: '15% Off Room Rate', color: '#e67e22', icon: 'fas fa-percentage' },
            { name: 'Free Valet Parking', color: '#34495e', icon: 'fas fa-parking' },
            { name: '10% Off Room Rate', color: '#95a5a6', icon: 'fas fa-percentage' }
        ];
        
        this.isSpinning = false;
        this.currentRotation = 0;
        this.segments = this.prizes.length;
        this.segmentAngle = (2 * Math.PI) / this.segments;
        
        // One-time spin tracking
        this.sessionKey = 'grandLuxeSpinSession';
        this.hasSpun = this.checkIfAlreadySpun();
        
        this.init();
    }
    
    checkIfAlreadySpun() {
        const sessionData = localStorage.getItem(this.sessionKey);
        if (sessionData) {
            const data = JSON.parse(sessionData);
            const now = new Date();
            const spinTime = new Date(data.timestamp);
            
            // Check if it's been more than 24 hours (new stay)
            const hoursDiff = (now - spinTime) / (1000 * 60 * 60);
            if (hoursDiff < 24) {
                return true;
            } else {
                // Clear old session data
                localStorage.removeItem(this.sessionKey);
                return false;
            }
        }
        return false;
    }
    
    markAsSpun() {
        const sessionData = {
            timestamp: new Date().toISOString(),
            hasSpun: true
        };
        localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    }
    
    init() {
        this.drawWheel();
        this.updateSpinButton();
        this.spinBtn.addEventListener('click', () => this.handleSpinClick());
        
        // Add hover effect to spin button
        this.spinBtn.addEventListener('mouseenter', () => {
            if (!this.isSpinning && !this.hasSpun) {
                this.spinBtn.style.transform = 'translateY(-3px) scale(1.05)';
            }
        });
        
        this.spinBtn.addEventListener('mouseleave', () => {
            if (!this.isSpinning && !this.hasSpun) {
                this.spinBtn.style.transform = 'translateY(0) scale(1)';
            }
        });
    }
    
    updateSpinButton() {
        if (this.hasSpun) {
            this.spinBtn.disabled = true;
            this.spinBtn.innerHTML = '<i class="fas fa-check-circle"></i> ALREADY SPUN';
            this.spinBtn.style.background = 'linear-gradient(135deg, #95a5a6, #7f8c8d)';
            this.spinBtn.style.cursor = 'not-allowed';
            
            // Show already spun message
            this.prizeResult.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <p>You've already used your spin for this stay. Book a room to spin again!</p>
            `;
        } else {
            this.spinBtn.disabled = false;
            this.spinBtn.innerHTML = '<i class="fas fa-play"></i> SPIN THE WHEEL';
            this.spinBtn.style.background = 'linear-gradient(135deg, #c8a27d, #8b6f47)';
            this.spinBtn.style.cursor = 'pointer';
            
            // Show default message
            this.prizeResult.innerHTML = `
                <i class="fas fa-gift"></i>
                <p>Spin to win amazing rewards! (One spin per stay)</p>
            `;
        }
    }
    
    handleSpinClick() {
        if (this.hasSpun) {
            showNotification('You\'ve already used your spin for this stay. Book a room to spin again!', 'info');
            return;
        }
        
        if (this.isSpinning) return;
        
        this.spin();
    }
    
    drawWheel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw segments
        for (let i = 0; i < this.segments; i++) {
            const startAngle = i * this.segmentAngle + this.currentRotation;
            const endAngle = (i + 1) * this.segmentAngle + this.currentRotation;
            
            // Draw segment
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = this.prizes[i].color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            // Draw text
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(startAngle + this.segmentAngle / 2);
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 12px Inter';
            this.ctx.fillText(this.prizes[i].name, radius * 0.7, 0);
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
        if (this.isSpinning || this.hasSpun) return;
        
        this.isSpinning = true;
        this.spinBtn.disabled = true;
        this.spinBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SPINNING...';
        
        // Random number of full rotations (3-5) plus random segment
        const fullRotations = 3 + Math.random() * 2;
        const randomSegment = Math.floor(Math.random() * this.segments);
        const targetAngle = fullRotations * 2 * Math.PI + (randomSegment * this.segmentAngle);
        
        // Calculate final rotation
        const finalRotation = this.currentRotation + targetAngle;
        
        // Animate the spin
        const startTime = performance.now();
        const duration = 3000; // 3 seconds
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth deceleration
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            this.currentRotation = this.currentRotation + (targetAngle * easeOut);
            this.drawWheel();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.onSpinComplete(randomSegment);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    onSpinComplete(segmentIndex) {
        const prize = this.prizes[segmentIndex];
        
        // Mark as spun
        this.hasSpun = true;
        this.markAsSpun();
        
        // Update prize display
        this.prizeResult.innerHTML = `
            <i class="${prize.icon}"></i>
            <p>Congratulations! You won: ${prize.name}</p>
            <small style="color: #ecf0f1; font-size: 0.9rem;">One spin per stay - Book now to claim your prize!</small>
        `;
        
        // Add winning animation
        this.prizeResult.classList.add('prize-won');
        
        // Show notification
        showNotification(`🎉 You won: ${prize.name}! Book now to claim your prize.`, 'success');
        
        // Update button state
        setTimeout(() => {
            this.updateSpinButton();
            this.prizeResult.classList.remove('prize-won');
        }, 2000);
        
        this.isSpinning = false;
        
        // Save prize to localStorage for future reference
        this.savePrize(prize);
    }
    
    savePrize(prize) {
        const savedPrizes = JSON.parse(localStorage.getItem('grandLuxePrizes') || '[]');
        savedPrizes.push({
            ...prize,
            wonAt: new Date().toISOString(),
            sessionId: this.sessionKey
        });
        localStorage.setItem('grandLuxePrizes', JSON.stringify(savedPrizes));
    }
    
    // Method to reset spin (for testing or admin purposes)
    resetSpin() {
        localStorage.removeItem(this.sessionKey);
        this.hasSpun = false;
        this.updateSpinButton();
        showNotification('Spin reset! You can spin again.', 'info');
    }
}

// Initialize spin wheel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const spinWheel = new SpinWheel();
    
    // Add confetti effect for big wins
    window.spinWheel = spinWheel;
    
    // Add reset functionality for development (remove in production)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Development mode: Use window.spinWheel.resetSpin() to reset the spin');
    }
});

// Form handling
document.addEventListener('DOMContentLoaded', () => {
    // Booking form
    const bookingForm = document.querySelector('.reservation-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const checkIn = document.getElementById('check-in').value;
            const checkOut = document.getElementById('check-out').value;
            const guests = document.getElementById('guests').value;
            const roomType = document.getElementById('room-type').value;
            
            if (!checkIn || !checkOut || !guests || !roomType) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Simulate booking process
            showNotification('Checking availability...', 'info');
            
            setTimeout(() => {
                showNotification('Availability checked! We\'ll contact you soon.', 'success');
                bookingForm.reset();
                
                // Reset spin wheel for new booking
                if (window.spinWheel) {
                    window.spinWheel.resetSpin();
                }
            }, 2000);
        });
    }
    
    // Contact form
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const name = contactForm.querySelector('input[type="text"]').value;
            const email = contactForm.querySelector('input[type="email"]').value;
            const subject = contactForm.querySelectorAll('input[type="text"]')[1].value;
            const message = contactForm.querySelector('textarea').value;
            
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Simulate sending message
            showNotification('Sending message...', 'info');
            
            setTimeout(() => {
                showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
                contactForm.reset();
            }, 2000);
        });
    }
});

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(notificationStyles);

// Room booking buttons
document.addEventListener('DOMContentLoaded', () => {
    const bookButtons = document.querySelectorAll('.room-card .btn-primary');
    
    bookButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const roomCard = button.closest('.room-card');
            const roomName = roomCard.querySelector('h3').textContent;
            const roomPrice = roomCard.querySelector('.price').textContent;
            
            // Scroll to booking section
            scrollToSection('booking');
            
            // Pre-fill room type
            setTimeout(() => {
                const roomTypeSelect = document.getElementById('room-type');
                if (roomTypeSelect) {
                    const roomType = roomName.toLowerCase().includes('deluxe') ? 'deluxe' :
                                   roomName.toLowerCase().includes('executive') ? 'executive' :
                                   roomName.toLowerCase().includes('presidential') ? 'presidential' : '';
                    
                    if (roomType) {
                        roomTypeSelect.value = roomType;
                    }
                }
                
                showNotification(`Selected ${roomName} (${roomPrice})`, 'success');
            }, 1000);
        });
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