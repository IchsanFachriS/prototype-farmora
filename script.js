// Global Variables
let currentSection = 'home';
let currentStep = 1;
let maxSteps = 3;
let selectedCrop = '';
let tipsInterval;
let currentTip = 0;
let mapInstance = null; // Leaflet map instance
const API_KEY_WEATHER = 'YOUR_OPENWEATHERMAP_API_KEY'; // Placeholder for real API Key

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Apply Tailwind CSS class updates
    updateInitialDesignClasses();
    
    // Initialize advanced features
    initCountAnimation();
    initTipsCarousel();
    initEventListeners();
    initFormInteractions();
    initLeafletMap('route-map');

    // Start periodic and real-time updates
    startPeriodicUpdates();
    fetchRealTimeWeather(); // New feature: Fetch weather based on location
    
    console.log('Farmora App Initialized Successfully! 🌱');
}

// --- DESIGN & UTILITY FUNCTIONS ---

// Function to update initial design classes for Tailwind conversion consistency
function updateInitialDesignClasses() {
    // Initial active section/nav styling
    const activeNav = document.querySelector(`.nav-item[onclick*='home']`);
    if (activeNav) {
        activeNav.classList.add('text-green-600', 'bg-green-50');
        activeNav.classList.remove('text-gray-500');
    }
    document.getElementById('home-section').classList.add('active');

    // Initial tip card styling
    const firstTip = document.querySelector('.tip-card[data-tip-index="0"]');
    if (firstTip) {
        firstTip.classList.remove('scale-95', 'opacity-70');
    }
}

// --- SECTION MANAGEMENT ---
function showSection(sectionName) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
    });
    
    // Show target section with smooth fade-in
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
        setTimeout(() => {
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
        }, 50);
    }
    
    // Update navigation
    updateNavigation(sectionName);
    
    currentSection = sectionName;
    
    // Special handling
    handleSectionSpecialCases(sectionName);
    trackPageView(sectionName);
}

function updateNavigation(sectionName) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('text-green-600', 'bg-green-50');
        item.classList.add('text-gray-500');
    });
    
    const targetNav = Array.from(navItems).find(item => 
        item.onclick && item.onclick.toString().includes(sectionName)
    );
    
    if (targetNav) {
        targetNav.classList.add('text-green-600', 'bg-green-50');
        targetNav.classList.remove('text-gray-500');
        // Add subtle animation for active state
        targetNav.style.transform = 'scale(1.05)';
        setTimeout(() => {
            targetNav.style.transform = 'scale(1)';
        }, 200);
    }
}

function handleSectionSpecialCases(sectionName) {
    switch(sectionName) {
        case 'calculator':
            resetCalculator();
            break;
        case 'education':
            initEducationFilters();
            break;
        case 'market':
            initMarketFilters();
            break;
        case 'community':
            startTypingSimulation();
            break;
        case 'route':
            resetRouteForm();
            // Ensure map is visible/re-initialized
            initLeafletMap('route-map'); 
            break;
    }
}

// --- ANIMATION FUNCTIONS ---
function initCountAnimation() {
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                if (!target.classList.contains('animated')) {
                    animateCount(target);
                    target.classList.add('animated');
                }
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.count-animation').forEach(counter => {
        observer.observe(counter);
    });
}

function animateCount(element) {
    const targetValue = parseInt(element.dataset.target);
    const duration = 2000;
    const increment = targetValue / (duration / 16);
    let currentValue = 0;
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
        }
        element.textContent = Math.floor(currentValue).toLocaleString();
    }, 16);
}

function initTipsCarousel() {
    const tips = document.querySelectorAll('.tip-card');
    const indicators = document.querySelectorAll('.indicator');
    
    if (tips.length === 0) return;
    
    // Clear old interval
    if (tipsInterval) clearInterval(tipsInterval);

    // Auto-rotate tips
    tipsInterval = setInterval(rotateTips, 5000);
    
    // Add click handlers to indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showTip(index);
        });
    });
}

function rotateTips() {
    const tips = document.querySelectorAll('.tip-card');
    
    if (tips.length === 0) return;
    
    // Move to next tip
    const nextTipIndex = (currentTip + 1) % tips.length;
    showTip(nextTipIndex);
    
    // Scroll carousel to next tip (advanced effect)
    const carousel = document.querySelector('.tips-carousel');
    if (carousel) {
        const nextTipElement = tips[nextTipIndex];
        carousel.scrollTo({
            left: nextTipElement.offsetLeft - carousel.offsetLeft,
            behavior: 'smooth'
        });
    }
}

function showTip(index) {
    const tips = document.querySelectorAll('.tip-card');
    const indicators = document.querySelectorAll('.indicator');
    
    // Remove active styling from all
    tips.forEach(tip => {
        tip.classList.add('scale-95', 'opacity-70');
        tip.classList.remove('shadow-xl');
    });
    indicators.forEach(indicator => {
        indicator.classList.remove('bg-green-500');
        indicator.classList.add('bg-gray-300', 'hover:bg-gray-400');
    });
    
    // Set current tip
    currentTip = index;
    
    // Add active styling to new tip
    tips[currentTip].classList.remove('scale-95', 'opacity-70');
    tips[currentTip].classList.add('shadow-xl');
    indicators[currentTip].classList.add('bg-green-500');
    indicators[currentTip].classList.remove('bg-gray-300', 'hover:bg-gray-400');
    
    // Reset interval
    clearInterval(tipsInterval);
    tipsInterval = setInterval(rotateTips, 5000);
}

// --- REAL-TIME DATA (WEATHER) ---

function fetchRealTimeWeather() {
    if (!navigator.geolocation) {
        updateWeatherDisplay('28°C', 'Clear, perfect for farming activities', 'fas fa-sun', 'Location Blocked');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // --- MOCK API CALL START ---
            // In a real application, you would use: 
            // const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY_WEATHER}&units=metric`;
            // fetch(url).then(res => res.json()).then(data => parseWeatherData(data, lat, lon));

            // MOCK DATA for prototype
            const mockWeather = getMockWeather(lat, lon);
            parseMockWeatherData(mockWeather, lat, lon);
            // --- MOCK API CALL END ---
        },
        (error) => {
            console.error('Geolocation Error:', error);
            updateWeatherDisplay('28°C', 'Clear, perfect for farming activities', 'fas fa-sun', 'Location Denied');
        }
    );
}

function getMockWeather(lat, lon) {
    const locations = [
        { temp: 28, desc: 'Clear sky, excellent for field work', icon: 'fas fa-sun', loc: 'Bandung, West Java', wind: 5, humidity: 65, visibility: 10 },
        { temp: 25, desc: 'Overcast, good conditions for harvesting', icon: 'fas fa-cloud-sun', loc: 'Yogyakarta, Java', wind: 8, humidity: 75, visibility: 8 },
        { temp: 23, desc: 'Light rain, protect young plants', icon: 'fas fa-cloud-rain', loc: 'Bogor, West Java', wind: 10, humidity: 85, visibility: 5 },
    ];
    // Simple mock selection based on latitude for variety
    let index = 0;
    if (lat < -7) index = 1;
    if (lat < -6) index = 2;

    return locations[index % locations.length];
}

function parseMockWeatherData(data, lat, lon) {
    const temp = `${data.temp}°C`;
    const desc = data.desc;
    const icon = data.icon;
    const location = data.loc;
    
    updateWeatherDisplay(temp, desc, icon, location, data.wind, data.humidity, data.visibility);
}

function updateWeatherDisplay(temp, desc, icon, location, wind = 5, humidity = 65, visibility = 10) {
    const tempElement = document.querySelector('.weather-temp');
    const descElement = document.querySelector('.weather-desc');
    const iconElement = document.querySelector('.weather-icon i');
    const locationElement = document.querySelector('.weather-location');
    
    // Update details
    document.querySelector('.weather-details .weather-item:nth-child(1) span').textContent = `Wind: ${wind}km/h`;
    document.querySelector('.weather-details .weather-item:nth-child(2) span').textContent = `Humidity: ${humidity}%`;
    document.querySelector('.weather-details .weather-item:nth-child(3) span').textContent = `Visibility: ${visibility}km`;
    
    if (tempElement && descElement && iconElement && locationElement) {
        // Animate change
        [tempElement, descElement, iconElement, locationElement].forEach(el => el.style.opacity = '0.5');
        
        setTimeout(() => {
            tempElement.textContent = temp;
            descElement.textContent = desc;
            iconElement.className = icon;
            locationElement.textContent = location;
            
            [tempElement, descElement, iconElement, locationElement].forEach(el => el.style.opacity = '1');
        }, 300);
    }
}

// --- MODAL MANAGEMENT ---
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        // Add entrance animation
        setTimeout(() => {
            modal.classList.add('show');
            const content = modal.querySelector('.modal-content');
            if (content) {
                content.classList.remove('translate-y-full', 'opacity-0');
                content.classList.add('translate-y-0', 'opacity-100');
            }
        }, 10);
        
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.classList.remove('translate-y-0', 'opacity-100');
            content.classList.add('translate-y-full', 'opacity-0');
        }

        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

function initModalCloseHandlers() {
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            const modalId = event.target.id;
            closeModal(modalId);
        }
    });
}

// --- NOTIFICATION FUNCTIONS ---
function showNotifications() {
    showModal('notification-modal');
    
    // Simulate a new real-time notification
    setTimeout(() => {
        addNotification('info', 'Weather Update', 'Rain forecast for the afternoon, prepare plant cover.');
    }, 3000);
}

function addNotification(type, title, message) {
    const notificationContainer = document.querySelector('#notification-modal .modal-body');
    if (!notificationContainer) return;
    
    const notification = document.createElement('div');
    notification.className = 'notification-item flex space-x-3 py-4 border-b border-gray-100 transform -translate-x-full opacity-0';
    
    const iconClass = {
        success: 'fas fa-check-circle bg-green-500',
        info: 'fas fa-info-circle bg-blue-500',
        warning: 'fas fa-exclamation-triangle bg-yellow-500',
        error: 'fas fa-times-circle bg-red-500'
    };
    
    notification.innerHTML = `
        <div class="notification-icon w-10 h-10 text-white rounded-full flex items-center justify-center text-lg flex-shrink-0 ${iconClass[type]}">
            <i class="${iconClass[type].split(' ')[0]}"></i>
        </div>
        <div class="flex-1">
            <div class="font-semibold text-gray-700">${title}</div>
            <div class="text-sm text-gray-600">${message}</div>
            <div class="text-xs text-gray-400 mt-1">Just now</div>
        </div>
    `;
    
    // Insert at the top
    notificationContainer.insertBefore(notification, notificationContainer.firstChild);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('-translate-x-full', 'opacity-0');
        notification.classList.add('translate-x-0', 'opacity-100', 'transition', 'duration-300');
    }, 100);
    
    // Update notification badge
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + 1;
        
        // Advanced animation
        badge.classList.remove('animate-pulse');
        badge.classList.add('ring-4', 'ring-red-300', 'ring-opacity-75', 'animate-ping');
        setTimeout(() => {
            badge.classList.remove('animate-ping');
            badge.classList.add('animate-pulse');
        }, 500);
    }
}

// --- EDUCATION FUNCTIONS ---
function initEducationFilters() {
    // Re-select elements after section switch if necessary, or rely on existing listeners
}

function filterEducationContent(category, activeCard) {
    // Update active category class
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('bg-green-600', 'text-white', 'shadow-md', 'border', 'border-gray-200');
        card.classList.add('bg-white', 'text-gray-600', 'hover:bg-gray-100', 'border', 'border-gray-200');
    });
    activeCard.classList.remove('bg-white', 'text-gray-600', 'hover:bg-gray-100', 'border', 'border-gray-200');
    activeCard.classList.add('bg-green-600', 'text-white', 'shadow-md');
    
    // Filter education cards with animation
    const educationCards = document.querySelectorAll('.education-card');
    educationCards.forEach((card, index) => {
        const cardCategory = card.dataset.category;
        
        if (category === 'all' || cardCategory === category) {
            // Show with fade-in and scale up
            card.style.display = 'block';
            setTimeout(() => {
                card.classList.remove('opacity-0', 'scale-90');
                card.classList.add('opacity-100', 'scale-100', 'transition', 'duration-300');
            }, index * 100);
        } else {
            // Hide with fade-out and scale down
            card.classList.remove('opacity-100', 'scale-100');
            card.classList.add('opacity-0', 'scale-90', 'transition', 'duration-300');
            setTimeout(() => {
                // Ensure it's fully hidden after animation
                if (card.classList.contains('opacity-0')) {
                    card.style.display = 'none';
                }
            }, 300 + index * 50);
        }
    });
}

function showEducationDetail(topic) {
    const content = document.getElementById('education-detail-content');
    const detailData = getEducationDetailData(topic);
    
    content.innerHTML = `
        <div class="education-detail p-4">
            <div class="detail-header text-center mb-6">
                <div class="detail-icon w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl text-white mb-3 bg-${topic === 'irrigation' ? 'blue' : topic === 'compost' ? 'green' : 'red'}-500">
                    <i class="${detailData.icon}"></i>
                </div>
                <h3 class="text-3xl font-extrabold text-gray-800">${detailData.title}</h3>
            </div>
            <div class="detail-content space-y-8">
                ${detailData.content}
            </div>
            <div class="detail-footer flex justify-center space-x-4 mt-8 pt-4 border-t border-gray-100">
                <button class="btn-primary py-3 px-6 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition flex items-center space-x-2" onclick="bookmarkEducation('${topic}')">
                    <i class="fas fa-bookmark"></i> <span>Bookmark</span>
                </button>
                <button class="btn-secondary py-3 px-6 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition flex items-center space-x-2" onclick="shareEducation('${topic}')">
                    <i class="fas fa-share"></i> <span>Share</span>
                </button>
            </div>
        </div>
    `;
    
    // Apply detail section styling
    content.querySelectorAll('.detail-section').forEach(section => {
        section.classList.add('p-4', 'bg-gray-50', 'rounded-lg', 'shadow-inner');
        section.querySelector('h4').classList.add('text-xl', 'font-bold', 'mb-3', 'text-gray-700', 'flex', 'items-center', 'space-x-2');
        section.querySelector('ul, ol').classList.add('list-inside', 'list-disc', 'marker:text-green-500', 'text-gray-600', 'space-y-1', 'pl-5');
        section.querySelector('li').classList.add('mb-1');
    });

    content.querySelectorAll('.tip-box').forEach(box => {
        box.classList.add('bg-indigo-50', 'p-4', 'rounded-xl', 'border-l-4', 'border-indigo-500', 'flex', 'space-x-3');
        box.querySelector('i').classList.add('text-2xl', 'text-indigo-500', 'mt-1');
        box.querySelector('strong').classList.add('font-bold', 'text-indigo-600');
        box.querySelector('div').classList.add('text-sm');
    });

    showModal('education-detail-modal');
}

function getEducationDetailData(topic) {
    // Note: The content itself is translated in the returned string
    const data = {
        irrigation: {
            title: 'Drip Irrigation Technique',
            icon: 'fas fa-tint',
            content: `
                <div class="detail-section">
                    <h4><i class="fas fa-star text-yellow-500"></i> Benefits</h4>
                    <ul>
                        <li>Saves up to 50% water compared to conventional systems.</li>
                        <li>Reduces weed growth as water is focused only on plants.</li>
                        <li>More unified and efficient nutrient delivery.</li>
                        <li>Minimizes plant diseases caused by excess humidity.</li>
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-tools text-blue-500"></i> Installation Guide</h4>
                    <ol>
                        <li>Prepare the main pipe from the water source.</li>
                        <li>Install branch pipes parallel to the plant rows.</li>
                        <li>Attach emitters every 30-40 cm or based on plant spacing.</li>
                        <li>Adjust the pressure regulator for 1-2 bar pressure.</li>
                        <li>Test the system with clean water before planting.</li>
                    </ol>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-wrench text-gray-500"></i> Maintenance</h4>
                    <ul>
                        <li>Clean the water filter regularly (weekly).</li>
                        <li>Inspect and clean clogged emitters.</li>
                        <li>Replace damaged or leaking hoses.</li>
                        <li>Perform system flushing monthly.</li>
                    </ul>
                </div>
                
                <div class="tip-box">
                    <i class="fas fa-lightbulb"></i>
                    <div>
                        <strong>Pro Tips:</strong> Install an automatic timer for routine watering and use soil moisture sensors for maximum efficiency.
                    </div>
                </div>
            `
        },
        compost: {
            title: 'Organic Waste Processing',
            icon: 'fas fa-recycle',
            content: `
                <div class="detail-section">
                    <h4><i class="fas fa-seedling text-green-500"></i> Required Materials</h4>
                    <ul>
                        <li>Green waste: fresh leaves, vegetable scraps, grass (60%).</li>
                        <li>Brown waste: dry leaves, twigs, paper (30%).</li>
                        <li>Activator: EM4 or local microorganisms (10%).</li>
                        <li>Sufficient water for optimal moisture.</li>
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-list-ol text-green-500"></i> Steps to Make Compost</h4>
                    <ol>
                        <li>Cut organic waste into 2-5 cm pieces.</li>
                        <li>Mix green and brown materials at a 3:1 ratio.</li>
                        <li>Add activator and mix thoroughly.</li>
                        <li>Water until moisture reaches 50-60% (no dripping when squeezed).</li>
                        <li>Cover with a tarp or wet sack.</li>
                        <li>Turn over every 2 weeks and check temperature (50-60°C optimal).</li>
                        <li>Compost matures in 2-3 months (dark brown to black color).</li>
                    </ol>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-thermometer-half text-red-500"></i> Process Monitoring</h4>
                    <ul>
                        <li>Temperature: 50-60°C (active phase), dropping to 30°C (mature).</li>
                        <li>Moisture: 50-60% (not too wet/dry).</li>
                        <li>Aeration: Turn regularly for sufficient oxygen.</li>
                        <li>pH: 6.5-7.5 (neutral for optimal microbial growth).</li>
                    </ul>
                </div>
                
                <div class="tip-box">
                    <i class="fas fa-lightbulb"></i>
                    <div>
                        <strong>Pro Tips:</strong> Add agricultural lime if it's too acidic, and ensure good ventilation to prevent unpleasant odors.
                    </div>
                </div>
            `
        },
        pest: {
            title: 'Natural Pest Management',
            icon: 'fas fa-shield-alt',
            content: `
                <div class="detail-section">
                    <h4><i class="fas fa-leaf text-green-500"></i> Botanical Pesticides</h4>
                    <ul>
                        <li><strong>Neem Extract:</strong> Effective for aphids, thrips, caterpillars.</li>
                        <li><strong>Soapy Water:</strong> 2 tbsp dish soap + 1L water for small insects.</li>
                        <li><strong>Garlic Extract:</strong> Natural fungicide and bactericide.</li>
                        <li><strong>Tobacco Solution:</strong> For controlling sucking insects.</li>
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-bug text-red-500"></i> Natural Predators</h4>
                    <ul>
                        <li><strong>Ladybugs:</strong> Feed on aphids and small insects.</li>
                        <li><strong>Spiders:</strong> Control flies and flying insects.</li>
                        <li><strong>Birds:</strong> Feed on caterpillars and large insects.</li>
                        <li><strong>Frogs:</strong> Control nocturnal insects.</li>
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-shield-virus text-blue-500"></i> Prevention Techniques</h4>
                    <ul>
                        <li>Crop rotation every season.</li>
                        <li>Trap crops (marigold, basil) around the field edges.</li>
                        <li>Maintain clean fields by removing plant residue.</li>
                        <li>Organic mulch to reduce soil pests.</li>
                        <li>Routine monitoring and early detection.</li>
                    </ul>
                </div>
                
                <div class="tip-box">
                    <i class="fas fa-lightbulb"></i>
                    <div>
                        <strong>Pro Tips:</strong> Apply natural pesticides in the morning or evening for maximum effectiveness, and always test on a small area first.
                    </div>
                </div>
            `
        }
    };
    
    return data[topic] || { title: 'Detail not found', content: '', icon: 'fas fa-question' };
}

function bookmarkEducation(topic) {
    showToast('Article successfully bookmarked!', 'success');
    // Save to localStorage
    const bookmarks = JSON.parse(localStorage.getItem('farmora_bookmarks') || '[]');
    if (!bookmarks.includes(topic)) {
        bookmarks.push(topic);
        localStorage.setItem('farmora_bookmarks', JSON.stringify(bookmarks));
    }
}

function shareEducation(topic) {
    if (navigator.share) {
        navigator.share({
            title: 'Farmora - Farming Tips',
            text: `Learn farming techniques: ${topic}`,
            url: window.location.href
        });
    } else {
        const url = `${window.location.href}?share=${topic}`;
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link successfully copied!', 'info');
        });
    }
}

// --- MARKET FUNCTIONS ---
function initMarketFilters() {
    // Re-select elements after section switch if necessary, or rely on existing listeners
}

function filterProducts(filter, activeBtn) {
    // Update active filter button class
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-green-600', 'text-white', 'shadow-md');
        btn.classList.add('bg-white', 'text-gray-600', 'hover:bg-gray-100', 'border', 'border-gray-200');
    });
    activeBtn.classList.remove('bg-white', 'text-gray-600', 'hover:bg-gray-100', 'border', 'border-gray-200');
    activeBtn.classList.add('bg-green-600', 'text-white', 'shadow-md');
    
    // Filter products with animation
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        const category = card.dataset.category;
        
        if (filter === 'all' || category === filter) {
            // Show with fade-in
            card.style.display = 'block';
            setTimeout(() => {
                card.classList.remove('opacity-0', 'scale-90');
                card.classList.add('opacity-100', 'scale-100', 'transition', 'duration-300');
            }, index * 100);
        } else {
            // Hide with fade-out
            card.classList.remove('opacity-100', 'scale-100');
            card.classList.add('opacity-0', 'scale-90', 'transition', 'duration-300');
            setTimeout(() => {
                if (card.classList.contains('opacity-0')) {
                    card.style.display = 'none';
                }
            }, 300);
        }
    });
}

function orderProduct(productId) {
    showToast('Connecting with seller...', 'info');
    
    setTimeout(() => {
        showToast('Order successfully sent to seller!', 'success');
        addNotification('success', 'Order Sent', 'The seller will contact you shortly');
    }, 2000);
}

function showAddProduct() {
    showModal('add-product-modal');
}

function addProduct(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Processing...';
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75');
    
    setTimeout(() => {
        showToast('Product successfully added!', 'success');
        closeModal('add-product-modal');
        
        event.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75');

        addNotification('info', 'New Product', 'Your product is under verification process');
    }, 2000);
}

// --- COMMUNITY FUNCTIONS ---
function startTypingSimulation() {
    if (currentSection !== 'community') return;
    
    const typingIndicators = [
        'Mr. Ahmad is typing...',
        'Ms. Siti is typing...',
        'Young Farmer is typing...'
    ];
    
    // Clear previous timer to prevent multiple simulations
    if (window.typingTimer) clearTimeout(window.typingTimer);

    window.typingTimer = setTimeout(() => {
        if (currentSection === 'community' && Math.random() < 0.4) {
            const randomIndicator = typingIndicators[Math.floor(Math.random() * typingIndicators.length)];
            showTypingIndicator(randomIndicator);
        }
        startTypingSimulation(); // Loop the simulation
    }, Math.random() * 10000 + 5000);
}

function showTypingIndicator(text) {
    const postsContainer = document.querySelector('.community-posts');
    if (!postsContainer) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="post-card bg-white rounded-xl shadow-lg border-l-4 border-blue-500 transition duration-300 opacity-70">
            <div class="flex items-center space-x-4 p-4 text-gray-500">
                <div class="post-avatar w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
                    <i class="fas fa-user"></i>
                </div>
                <div class="flex-1">
                    <div class="typing-dots flex items-center space-x-2 text-sm">
                        <i class="fas fa-pencil-alt"></i>
                        <span class="font-semibold">${text}</span>
                        <div class="dots flex space-x-1">
                            <span class="text-xl leading-none">.</span>
                            <span class="text-xl leading-none">.</span>
                            <span class="text-xl leading-none">.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insert at the top and animate in
    postsContainer.insertBefore(typingDiv, postsContainer.firstChild);
    typingDiv.style.maxHeight = '100px';
    typingDiv.style.overflow = 'hidden';
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (typingDiv.parentNode) {
            typingDiv.style.maxHeight = '0';
            typingDiv.style.opacity = '0';
            typingDiv.classList.add('transition', 'duration-300', 'ease-out');
            setTimeout(() => {
                typingDiv.remove();
            }, 300);
        }
    }, 3000);
}

function showNewPost() {
    showModal('new-post-modal');
}

function createPost(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Posting...';
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75');
    
    setTimeout(() => {
        showToast('Post successfully created!', 'success');
        closeModal('new-post-modal');
        
        event.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-75');

        addNewPost();
    }, 1500);
}

function addNewPost() {
    const postsContainer = document.querySelector('.community-posts');
    if (!postsContainer) return;
    
    const newPost = document.createElement('div');
    newPost.className = 'post-card bg-white rounded-xl shadow-lg opacity-0 transform -translate-y-4 transition duration-500';

    newPost.innerHTML = `
        <div class="p-5">
            <div class="post-header flex items-start space-x-3 mb-3">
                <div class="post-avatar w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">AN</div>
                <div class="flex-1">
                    <div class="font-bold text-gray-800">You</div>
                    <div class="flex items-center space-x-3 text-xs text-gray-500">
                        <span><i class="fas fa-clock"></i> Just now</span>
                        <span class="post-category bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-semibold">Tips</span>
                    </div>
                </div>
                <i class="fas fa-ellipsis-h text-gray-400 p-2 hover:bg-gray-100 rounded-full cursor-pointer"></i>
            </div>
            <div class="post-content">
                <h4 class="text-xl font-bold mb-2 text-gray-700">New post from the community</h4>
                <p class="text-gray-600 mb-3">Thank you for sharing with the Farmora farmer community!</p>
            </div>
            <div class="post-actions flex justify-between border-t border-gray-100 pt-3 mt-4">
                <button class="action-btn text-red-500 font-semibold flex items-center space-x-1 p-2 rounded-lg hover:bg-red-50 transition duration-300"><i class="fas fa-heart"></i><span>0</span></button>
                <button class="action-btn text-blue-500 font-semibold flex items-center space-x-1 p-2 rounded-lg hover:bg-blue-50 transition duration-300"><i class="fas fa-comment"></i><span>0</span></button>
                <button class="action-btn text-gray-500 font-semibold flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-50 transition duration-300"><i class="fas fa-share"></i><span>0</span></button>
                <button class="action-btn text-gray-500 p-2 rounded-full hover:bg-gray-50 transition duration-300"><i class="fas fa-bookmark text-lg"></i></button>
            </div>
        </div>
    `;
    
    postsContainer.insertBefore(newPost, postsContainer.firstChild);
    
    // Animate in
    setTimeout(() => {
        newPost.classList.remove('opacity-0', '-translate-y-4');
        newPost.classList.add('opacity-100', 'translate-y-0');
    }, 100);
}

// --- CALCULATOR FUNCTIONS ---
function showCalculator() {
    document.getElementById('calculator-options').style.display = 'none';
    document.getElementById('calculator-form').style.display = 'block';
    resetCalculatorForm();
}

function hideCalculator() {
    document.getElementById('calculator-form').style.display = 'none';
    document.getElementById('calculator-options').style.display = 'grid';
    resetCalculator();
    hideResult();
}

function resetCalculator() {
    currentStep = 1;
    selectedCrop = '';
    updateCalculatorStep();
    hideResult();
    
    const form = document.getElementById('calculator-form');
    if (form) {
        form.querySelectorAll('input').forEach(input => input.value = '');
        document.querySelectorAll('.crop-option').forEach(option => {
            option.classList.remove('bg-green-600', 'text-white', 'border-green-500');
            option.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
            option.querySelector('.crop-icon').classList.remove('text-white');
            option.querySelector('.crop-icon').classList.add('text-gray-500');
        });
    }
}

function resetCalculatorForm() {
    currentStep = 1;
    selectedCrop = '';
    updateCalculatorStep();
    
    document.querySelectorAll('.crop-option').forEach(option => {
        option.onclick = () => selectCrop(option.dataset.crop, option);
    });
}

function selectCrop(crop, element) {
    selectedCrop = crop;
    
    // Update visual selection (Tailwind)
    document.querySelectorAll('.crop-option').forEach(option => {
        option.classList.remove('bg-green-600', 'text-white', 'border-green-500');
        option.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
        option.querySelector('.crop-icon').classList.remove('text-white');
        option.querySelector('.crop-icon').classList.add('text-gray-500');
    });
    
    element.classList.add('bg-green-600', 'text-white', 'border-green-500');
    element.classList.remove('bg-white', 'text-gray-700', 'border-gray-200');
    element.querySelector('.crop-icon').classList.remove('text-gray-500');
    element.querySelector('.crop-icon').classList.add('text-white');
    
    // Auto-advance
    setTimeout(nextStep, 500);
}

function nextStep() {
    if (currentStep === 1 && !selectedCrop) {
        showToast('Please select a crop type first', 'warning');
        return;
    }

    // Advanced: Basic validation for current step fields before moving on
    if (currentStep === 2) {
        const landArea = document.getElementById('land-area').value;
        const fertilizerPrice = document.getElementById('fertilizer-price').value;
        if (!landArea || isNaN(parseFloat(landArea)) || parseFloat(landArea) <= 0 || !fertilizerPrice || isNaN(parseFloat(fertilizerPrice)) || parseFloat(fertilizerPrice) <= 0) {
            showToast('Please complete all required fields with valid numbers in this step', 'error');
            return;
        }
    }
    
    if (currentStep < maxSteps) {
        currentStep++;
        updateCalculatorStep();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateCalculatorStep();
        hideResult(); // Hide results when navigating back
    }
}

function updateCalculatorStep() {
    document.querySelectorAll('.calc-step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step-${currentStep}`).classList.add('active');
    
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    
    prevBtn.style.display = currentStep === 1 ? 'none' : 'flex';
    nextBtn.style.display = currentStep === maxSteps ? 'none' : 'flex';
    calculateBtn.style.display = currentStep === maxSteps ? 'flex' : 'none';
    
    // Update progress
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = (currentStep / maxSteps) * 100;
    progressFill.style.width = progressPercentage + '%';
    
    // Update step indicators (Tailwind)
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        indicator.classList.remove('bg-green-500', 'text-white');
        indicator.classList.add('bg-gray-200', 'text-gray-500');

        if (index < currentStep) {
            indicator.classList.add('bg-green-500', 'text-white');
            indicator.classList.remove('bg-gray-200', 'text-gray-500');
        }
    });
}

function calculateFarming() {
    const landArea = parseFloat(document.getElementById('land-area').value);
    const fertilizerPrice = parseFloat(document.getElementById('fertilizer-price').value);
    const sellingPrice = parseFloat(document.getElementById('selling-price').value);
    
    if (!landArea || !fertilizerPrice || !sellingPrice || landArea <= 0 || fertilizerPrice <= 0 || sellingPrice <= 0) {
        showToast('Please complete all required fields with valid numbers!', 'error');
        return;
    }
    
    const calculateBtn = document.getElementById('calculate-btn');
    const originalText = calculateBtn.innerHTML;
    calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Calculating...';
    calculateBtn.disabled = true;
    calculateBtn.classList.add('opacity-75');
    
    setTimeout(() => {
        const results = performCalculation(selectedCrop, landArea, fertilizerPrice, sellingPrice);
        displayResults(results);
        
        calculateBtn.innerHTML = originalText;
        calculateBtn.disabled = false;
        calculateBtn.classList.remove('opacity-75');
    }, 2000);
}

function performCalculation(cropType, landArea, fertilizerPrice, sellingPrice) {
    // Advanced: Use a more detailed cost structure
    const cropData = {
        rice: {
            fertilizerNeeded: 250, // kg per ha
            expectedYield: 5000, // kg per ha
            seedCost: 500000, // per ha
            laborCost: 2000000, // per ha
            otherCosts: 1000000 // per ha
        },
        corn: {
            fertilizerNeeded: 350,
            expectedYield: 4000,
            seedCost: 600000,
            laborCost: 1800000,
            otherCosts: 1200000
        },
        tomato: {
            fertilizerNeeded: 200,
            expectedYield: 15000,
            seedCost: 800000,
            laborCost: 3000000,
            otherCosts: 1500000
        },
        chili: {
            fertilizerNeeded: 180,
            expectedYield: 2000,
            seedCost: 700000,
            laborCost: 2500000,
            otherCosts: 1300000
        }
    };
    
    const data = cropData[cropType] || cropData.rice;
    
    const fertilizerNeeded = landArea * data.fertilizerNeeded;
    const expectedYield = landArea * data.expectedYield;
    const fertilizerCost = fertilizerNeeded * fertilizerPrice;
    const seedCost = landArea * data.seedCost;
    const laborCost = landArea * data.laborCost;
    const otherCosts = landArea * data.otherCosts;
    
    const totalCost = fertilizerCost + seedCost + laborCost + otherCosts;
    const grossIncome = expectedYield * sellingPrice;
    const netProfit = grossIncome - totalCost;
    const profitMargin = (grossIncome > 0) ? ((netProfit / grossIncome) * 100).toFixed(1) : 0;
    
    return {
        cropType,
        landArea,
        fertilizerNeeded,
        expectedYield,
        breakdown: {
            fertilizer: fertilizerCost,
            seed: seedCost,
            labor: laborCost,
            other: otherCosts
        },
        totalCost,
        grossIncome,
        netProfit,
        profitMargin
    };
}

function displayResults(results) {
    const resultContent = document.getElementById('result-content');
    const resultCard = document.getElementById('calculation-result');
    const isProfit = results.netProfit >= 0;
    
    // Update card theme
    resultCard.classList.remove('bg-red-100', 'border-red-500', 'bg-green-100', 'border-green-500');
    resultCard.classList.add(isProfit ? 'bg-green-100' : 'bg-red-100', isProfit ? 'border-green-500' : 'border-red-500', 'border-t-4');
    
    resultContent.innerHTML = `
        <div class="space-y-4">
            <div class="p-3 rounded-lg border-l-4 ${isProfit ? 'border-green-600 bg-green-50' : 'border-red-600 bg-red-50'}">
                <div class="flex justify-between font-bold text-gray-800 mb-1">
                    <span>Crop Type:</span>
                    <span class="text-green-700">${getCropName(results.cropType)}</span>
                </div>
                <div class="flex justify-between text-sm text-gray-600">
                    <span>Land Area:</span>
                    <span>${results.landArea} Ha</span>
                </div>
            </div>
            
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <h4 class="text-lg font-bold mb-3 text-gray-700">Calculation Details</h4>
                <div class="grid grid-cols-2 gap-3 text-sm text-gray-600">
                    <div class="flex justify-between p-2 bg-gray-50 rounded-md border-l-2 border-blue-500">
                        <span class="font-medium">Fertilizer Needed:</span>
                        <span class="text-blue-600 font-bold">${results.fertilizerNeeded.toLocaleString()} kg</span>
                    </div>
                    <div class="flex justify-between p-2 bg-gray-50 rounded-md border-l-2 border-blue-500">
                        <span class="font-medium">Expected Yield:</span>
                        <span class="text-blue-600 font-bold">${results.expectedYield.toLocaleString()} kg</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-white p-4 rounded-lg shadow-sm">
                <h4 class="text-lg font-bold mb-3 text-gray-700">Production Cost Breakdown</h4>
                <div class="divide-y divide-gray-100 text-sm text-gray-600">
                    ${renderCostItem('Fertilizer Cost', results.breakdown.fertilizer)}
                    ${renderCostItem('Seed Cost', results.breakdown.seed)}
                    ${renderCostItem('Labor Cost', results.breakdown.labor)}
                    ${renderCostItem('Other Costs', results.breakdown.other)}
                    <div class="flex justify-between pt-3 font-extrabold text-base text-gray-800">
                        <span>Total Cost:</span>
                        <span>Rp ${results.totalCost.toLocaleString()}</span>
                    </div>
                </div>
            </div>
            
            <div class="p-4 rounded-lg border-2 ${isProfit ? 'border-green-500' : 'border-red-500'} bg-white">
                <div class="flex justify-between pb-3 text-gray-700 border-b border-gray-100">
                    <span class="text-base font-medium">Gross Income:</span>
                    <span class="text-blue-600 font-bold text-lg">Rp ${results.grossIncome.toLocaleString()}</span>
                </div>
                <div class="flex justify-between py-3 text-gray-800 font-extrabold text-xl">
                    <span>Net Profit:</span>
                    <span class="${isProfit ? 'text-green-600' : 'text-red-600'}">
                        Rp ${results.netProfit.toLocaleString()}
                    </span>
                </div>
                <div class="flex justify-between pt-3 text-gray-700 border-t border-gray-100">
                    <span class="text-base font-medium">Profit Margin:</span>
                    <span class="${isProfit ? 'text-green-600' : 'text-red-600'} font-bold text-lg">
                        ${results.profitMargin}%
                    </span>
                </div>
            </div>

            ${isProfit ? renderAdviceBox('success', 'Potentially Profitable!', [
                'Maintain harvest quality.',
                'Seek buyers with the best prices.',
                'Consider selling directly to consumers.',
                'Manage production costs efficiently.'
            ]) : renderAdviceBox('warning', 'Attention: Potential Loss', [
                'Reduce production costs.',
                'Increase the selling price target.',
                'Find a more profitable market.',
                'Consider other crop types.'
            ])}
        </div>
    `;
    
    resultCard.style.display = 'block';
    
    // Smooth scroll to result
    resultCard.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
}

function renderCostItem(label, amount) {
    return `
        <div class="flex justify-between py-2">
            <span>${label}:</span>
            <span>Rp ${amount.toLocaleString()}</span>
        </div>
    `;
}

function renderAdviceBox(type, title, items) {
    const isSuccess = type === 'success';
    const icon = isSuccess ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
    const color = isSuccess ? 'green' : 'red';
    
    return `
        <div class="p-4 rounded-xl border-l-4 border-${color}-500 bg-${color}-50 flex space-x-3 mt-4">
            <i class="${icon} text-2xl text-${color}-500 mt-1"></i>
            <div>
                <strong class="text-lg font-bold text-${color}-600">${title}</strong>
                <ul class="list-disc list-inside text-sm text-gray-600 mt-2 ml-4 space-y-1">
                    ${items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function getCropName(cropType) {
    const names = {
        rice: 'Rice',
        corn: 'Corn', 
        tomato: 'Tomato',
        chili: 'Chili'
    };
    return names[cropType] || cropType;
}

function hideResult() {
    document.getElementById('calculation-result').style.display = 'none';
}

function saveCalculation() {
    showToast('Calculation results successfully saved!', 'success');
    
    const savedCalculations = JSON.parse(localStorage.getItem('farmora_calculations') || '[]');
    const newCalculation = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US'),
        crop: selectedCrop,
        landArea: document.getElementById('land-area').value,
        timestamp: Date.now()
    };
    
    savedCalculations.unshift(newCalculation);
    if (savedCalculations.length > 10) savedCalculations.pop();
    
    localStorage.setItem('farmora_calculations', JSON.stringify(savedCalculations));
}

function showCalculatorTips() {
    showModal('calculator-tips-modal');
}

// --- ROUTE & MAP FUNCTIONS (Leaflet.js Integration) ---
let routeLayer = null;

function initLeafletMap(mapId) {
    if (mapInstance) {
        mapInstance.remove(); // Remove existing map instance
        mapInstance = null;
    }
    
    const mapElement = document.getElementById(mapId);
    if (!mapElement) return;

    // Show the map container and hide placeholder
    mapElement.classList.remove('bg-gradient-to-br', 'from-indigo-500', 'to-purple-600', 'text-gray-400');
    mapElement.innerHTML = '';
    
    // Default coordinates (e.g., center of Java, Indonesia)
    const initialLat = -7.25;
    const initialLng = 112.75;

    mapInstance = L.map(mapId).setView([initialLat, initialLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapInstance);

    // Initial Marker (Center)
    L.marker([initialLat, initialLng]).addTo(mapInstance)
        .bindPopup('Initial Location (e.g., Bandung)')
        .openPopup();
}

function resetRouteForm() {
    document.getElementById('origin').value = '';
    document.getElementById('destination').value = '';
    
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('border-green-500', 'bg-green-50', 'text-green-700');
        btn.classList.add('border-gray-200', 'text-gray-600', 'hover:border-blue-500');
    });
    document.querySelector('.option-btn[data-option="fastest"]').classList.remove('border-gray-200', 'text-gray-600', 'hover:border-blue-500');
    document.querySelector('.option-btn[data-option="fastest"]').classList.add('border-green-500', 'bg-green-50', 'text-green-700');

    // Clear previous route/markers from map
    if (mapInstance && routeLayer) {
        mapInstance.removeLayer(routeLayer);
        routeLayer = null;
    }
}

function getCurrentLocation(inputId) {
    const input = document.getElementById(inputId);
    
    if (navigator.geolocation) {
        showToast('Fetching your location...', 'info');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Mock address (In a real app, use a Geocoding API)
                const mockAddress = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (Current Location)`;
                input.value = mockAddress;
                
                showToast('Location successfully retrieved!', 'success');

                // Advanced: Pan map to current location
                if (mapInstance) {
                    mapInstance.setView([lat, lng], 14);
                    // Add a temporary marker
                    L.marker([lat, lng], {icon: L.divIcon({className: 'bg-blue-500 w-3 h-3 rounded-full border-2 border-white shadow-lg'})}).addTo(mapInstance)
                        .bindPopup('Your Current Location')
                        .openPopup();
                }
            },
            (error) => {
                showToast('Failed to get location. Check browser location permissions.', 'error');
            }
        );
    } else {
        showToast('Geolocation is not supported by this browser.', 'error');
    }
}

function swapLocations() {
    const origin = document.getElementById('origin');
    const destination = document.getElementById('destination');
    
    const temp = origin.value;
    origin.value = destination.value;
    destination.value = temp;
    
    // Animate swap button (Tailwind)
    const swapBtn = document.querySelector('.swap-btn');
    swapBtn.classList.add('rotate-180', 'scale-110');
    setTimeout(() => {
        swapBtn.classList.remove('rotate-180', 'scale-110');
    }, 300);
}

function findRoute() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    
    if (!origin || !destination) {
        showToast('Please fill in both origin and destination locations', 'warning');
        return;
    }
    
    const findBtn = document.querySelector('.find-route-btn');
    const originalText = findBtn.innerHTML;
    findBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Finding route...';
    findBtn.disabled = true;
    findBtn.classList.add('opacity-75');
    
    // Simulate route finding
    setTimeout(() => {
        showToast('Optimal route found!', 'success');
        
        // Mock data for route visualization and info
        const mockOrigin = { lat: -6.9174, lng: 107.6191 }; // Bandung
        const mockDestination = { lat: -6.8922, lng: 107.6075 }; // Near Bandung

        updateRouteInfo();
        displayRouteOnMap(mockOrigin, mockDestination);
        
        findBtn.innerHTML = originalText;
        findBtn.disabled = false;
        findBtn.classList.remove('opacity-75');
    }, 3000);
}

function displayRouteOnMap(origin, destination) {
    if (!mapInstance) return;

    // Clear previous route/markers
    mapInstance.eachLayer(layer => {
        if (layer.options.customType === 'route-marker') {
            mapInstance.removeLayer(layer);
        }
    });

    if (routeLayer) {
        mapInstance.removeLayer(routeLayer);
        routeLayer = null;
    }

    // Add origin and destination markers
    const originMarker = L.marker([origin.lat, origin.lng], {customType: 'route-marker'}).addTo(mapInstance)
        .bindPopup('Origin: ' + document.getElementById('origin').value);
    const destMarker = L.marker([destination.lat, destination.lng], {customType: 'route-marker'}).addTo(mapInstance)
        .bindPopup('Destination: ' + document.getElementById('destination').value);

    // Fit map bounds to show both markers
    const bounds = L.latLngBounds(originMarker.getLatLng(), destMarker.getLatLng());
    mapInstance.fitBounds(bounds, { padding: [50, 50] });

    // Mock polyline (route) visualization
    const routeCoordinates = [
        [origin.lat, origin.lng],
        [origin.lat + (destination.lat - origin.lat) * 0.3, origin.lng + (destination.lng - origin.lng) * 0.1],
        [origin.lat + (destination.lat - origin.lat) * 0.7, destination.lng - (destination.lng - origin.lng) * 0.2],
        [destination.lat, destination.lng]
    ];
    
    routeLayer = L.polyline(routeCoordinates, {color: 'red', weight: 5, opacity: 0.8, dashArray: '10, 5'}).addTo(mapInstance);
}

function updateRouteInfo() {
    const distances = ['15 km', '23 km', '31 km', '28 km'];
    const times = ['25 minutes', '35 minutes', '45 minutes', '38 minutes'];
    const traffics = ['Light', 'Moderate', 'Heavy'];
    const weathers = ['Clear, good conditions', 'Cloudy, minor delay possible', 'Light Rain, proceed with caution'];
    
    const randomDistance = distances[Math.floor(Math.random() * distances.length)];
    const randomTime = times[Math.floor(Math.random() * times.length)];
    const randomTraffic = traffics[Math.floor(Math.random() * traffics.length)];
    const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
    
    // Update info display
    const infoItems = document.querySelectorAll('.route-info .info-item');
    infoItems[0].querySelector('.info-value').textContent = randomWeather;
    infoItems[1].querySelector('.info-value').textContent = randomTraffic;
    infoItems[2].querySelector('.info-value').textContent = randomTime;
    infoItems[3].querySelector('.info-value').textContent = randomDistance;
    
    // Animate info update
    infoItems.forEach((item, index) => {
        item.classList.add('scale-105');
        setTimeout(() => {
            item.classList.remove('scale-105');
        }, 200);
    });
}

// --- UTILITY FUNCTIONS ---
function showToast(message, type = 'success') {
    const toast = document.getElementById('success-toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon i');
    
    toastMessage.textContent = message;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-yellow-600',
        info: 'bg-blue-600'
    };

    toastIcon.className = icons[type] || icons.success;
    toast.className = `toast fixed bottom-20 right-4 p-4 rounded-xl shadow-lg text-white transition-transform duration-300 transform translate-x-full ${colors[type]}`;
    
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function startPeriodicUpdates() {
    // Update weather hourly (in a real app) or mock for demo every 30s
    setInterval(() => {
        if (Math.random() < 0.2) { 
            fetchRealTimeWeather();
        }
    }, 30000);
    
    // Update stats occasionally
    setInterval(() => {
        if (Math.random() < 0.05) {
            updateStats();
        }
    }, 60000);
}

function updateStats() {
    // Simulate minor, random increase in stats numbers
    document.querySelectorAll('.stat-number:not(.animated)').forEach(stat => {
        const currentValue = parseInt(stat.dataset.target);
        const increment = Math.floor(Math.random() * 5) + 1; // Increase by 1-5
        const newValue = currentValue + increment;
        stat.dataset.target = newValue; // Update target for next load/animation trigger
        
        let current = currentValue;
        const timer = setInterval(() => {
            current += 1;
            if (current >= newValue) {
                current = newValue;
                clearInterval(timer);
            }
            stat.textContent = current.toLocaleString();
        }, 50);
    });
}

function initEventListeners() {
    initModalCloseHandlers();
    initFormValidation();
    initButtonEffects();
    initKeyboardShortcuts();
}

function initFormValidation() {
    document.querySelectorAll('form').forEach(form => {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', validateInput);
            input.addEventListener('input', clearValidationError);
        });
    });
}

function validateInput(event) {
    const input = event.target;
    const value = input.value.trim();
    
    input.classList.remove('border-red-500');
    
    if (input.hasAttribute('required') && !value) {
        showInputError(input, 'This field is required');
        return false;
    }
    
    if (input.type === 'email' && value && !isValidEmail(value)) {
        showInputError(input, 'Invalid email format');
        return false;
    }
    
    if (input.type === 'number' && value && (isNaN(value) || parseFloat(value) < 0)) {
        showInputError(input, 'Enter a valid positive number');
        return false;
    }
    
    return true;
}

function showInputError(input, message) {
    input.classList.add('border-red-500', 'ring-2', 'ring-red-200');
    
    let errorElement = input.parentNode.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message text-xs text-red-500 mt-1';
        input.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

function clearValidationError(event) {
    const input = event.target;
    input.classList.remove('border-red-500', 'ring-2', 'ring-red-200');
    
    const errorElement = input.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Advanced: Custom ripple effect using JS (compatible with Tailwind buttons)
function initButtonEffects() {
    document.querySelectorAll('.btn-primary, .btn-secondary, .calc-btn, .add-product-btn, .create-post-btn').forEach(btn => {
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        
        btn.addEventListener('click', function(e) {
            // Check if element is disabled (or currently processing)
            if (this.disabled) return;
            
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            // Remove previous ripple
            this.querySelector('.ripple')?.remove();
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal[style*="flex"]');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
        
        if (e.key >= '1' && e.key <= '5' && !e.target.matches('input, textarea, select')) {
            const sections = ['home', 'education', 'market', 'community', 'calculator'];
            const sectionIndex = parseInt(e.key) - 1;
            if (sections[sectionIndex]) {
                showSection(sections[sectionIndex]);
            }
        }
    });
}

function initFormInteractions() {
    // Route option buttons
    document.querySelectorAll('.route-options .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.route-options .option-btn').forEach(b => {
                b.classList.remove('border-green-500', 'bg-green-50', 'text-green-700');
                b.classList.add('border-gray-200', 'text-gray-600', 'hover:border-blue-500');
            });
            btn.classList.add('border-green-500', 'bg-green-50', 'text-green-700');
            btn.classList.remove('border-gray-200', 'text-gray-600', 'hover:border-blue-500');
        });
    });
    
    // Product filter buttons
    document.querySelectorAll('.market-filters .filter-btn').forEach(btn => {
        btn.onclick = () => filterProducts(btn.dataset.filter, btn);
    });
    
    // Category filter buttons
    document.querySelectorAll('.education-categories .category-card').forEach(btn => {
        btn.onclick = () => filterEducationContent(btn.dataset.category, btn);
    });
}

// --- ANALYTICS (Placeholder) ---
function trackPageView(sectionName) {
    console.log(`Analytics: Page view: ${sectionName}`);
}

function trackEvent(category, action, label) {
    console.log(`Analytics: Event: ${category} - ${action} - ${label}`);
}

// Initialize offline capabilities (PWA ready setup)
document.addEventListener('DOMContentLoaded', () => {
    // registerServiceWorker(); // Requires sw.js file
    // handleOnlineStatus(); // Basic online/offline handler
});