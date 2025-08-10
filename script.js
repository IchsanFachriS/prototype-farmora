// Global Variables
let currentSection = 'home';
let currentStep = 1;
let maxSteps = 3;
let selectedCrop = '';
let tipsInterval;
let currentTip = 0;
let countAnimations = [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize animations
    initCountAnimation();
    initTipsCarousel();
    initFloatingParticles();
    
    // Initialize event listeners
    initEventListeners();
    
    // Start periodic updates
    startPeriodicUpdates();
    
    // Initialize form interactions
    initFormInteractions();
    
    console.log('Farmora App Initialized Successfully! 🌱');
}

// ===== SECTION MANAGEMENT =====
function showSection(sectionName) {
    // Hide all sections with fade out effect
    const sections = document.querySelectorAll('.content-section');
    const activeSection = document.querySelector('.content-section.active');
    
    if (activeSection) {
        activeSection.style.opacity = '0';
        activeSection.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            sections.forEach(section => section.classList.remove('active'));
            
            // Show target section with fade in effect
            const targetSection = document.getElementById(sectionName + '-section');
            if (targetSection) {
                targetSection.classList.add('active');
                setTimeout(() => {
                    targetSection.style.opacity = '1';
                    targetSection.style.transform = 'translateY(0)';
                }, 50);
            }
        }, 150);
    } else {
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(sectionName + '-section').classList.add('active');
    }
    
    // Update navigation with smooth transition
    updateNavigation(sectionName);
    
    currentSection = sectionName;
    
    // Special handling for different sections
    handleSectionSpecialCases(sectionName);
    
    // Add page view tracking (analytics placeholder)
    trackPageView(sectionName);
}

function updateNavigation(sectionName) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        // Add smooth transition effect
        item.style.transform = 'scale(1)';
    });
    
    // Find corresponding nav item
    const targetNav = Array.from(navItems).find(item => 
        item.onclick && item.onclick.toString().includes(sectionName)
    );
    
    if (targetNav) {
        targetNav.classList.add('active');
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
            break;
    }
}

// ===== ANIMATION FUNCTIONS =====
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
    const duration = 2000; // 2 seconds
    const increment = targetValue / (duration / 16); // 60fps
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
    
    // Auto-rotate tips
    tipsInterval = setInterval(() => {
        rotateTips();
    }, 5000);
    
    // Add click handlers to indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showTip(index);
        });
    });
}

function rotateTips() {
    const tips = document.querySelectorAll('.tip-card');
    const indicators = document.querySelectorAll('.indicator');
    
    if (tips.length === 0) return;
    
    // Remove active class from current tip
    tips[currentTip].classList.remove('active');
    indicators[currentTip].classList.remove('active');
    
    // Move to next tip
    currentTip = (currentTip + 1) % tips.length;
    
    // Add active class to new tip
    tips[currentTip].classList.add('active');
    indicators[currentTip].classList.add('active');
}

function showTip(index) {
    const tips = document.querySelectorAll('.tip-card');
    const indicators = document.querySelectorAll('.indicator');
    
    // Remove active from all
    tips.forEach(tip => tip.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Set current tip
    currentTip = index;
    tips[currentTip].classList.add('active');
    indicators[currentTip].classList.add('active');
    
    // Reset interval
    clearInterval(tipsInterval);
    tipsInterval = setInterval(rotateTips, 5000);
}

function initFloatingParticles() {
    // Create additional particles dynamically
    const particlesContainer = document.querySelector('.floating-particles');
    if (!particlesContainer) return;
    
    // Add more particles for better effect
    for (let i = 5; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// ===== MODAL MANAGEMENT =====
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        // Add entrance animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Close modal when clicking outside
function initModalCloseHandlers() {
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            const modalId = event.target.id;
            closeModal(modalId);
        }
    });
}

// ===== NOTIFICATION FUNCTIONS =====
function showNotifications() {
    showModal('notification-modal');
    
    // Simulate real-time notifications
    setTimeout(() => {
        addNotification('info', 'Cuaca Update', 'Prakiraan hujan sore hari, siapkan perlindungan tanaman');
    }, 3000);
}

function addNotification(type, title, message) {
    const notificationContainer = document.querySelector('#notification-modal .modal-body');
    if (!notificationContainer) return;
    
    const notification = document.createElement('div');
    notification.className = 'notification-item';
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(-20px)';
    
    const iconClass = {
        success: 'fas fa-check-circle',
        info: 'fas fa-info-circle',
        warning: 'fas fa-exclamation-triangle',
        error: 'fas fa-times-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-icon ${type}">
            <i class="${iconClass[type]}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-desc">${message}</div>
            <div class="notification-time">Baru saja</div>
        </div>
    `;
    
    notificationContainer.insertBefore(notification, notificationContainer.firstChild);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Update notification badge
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        const currentCount = parseInt(badge.textContent) || 0;
        badge.textContent = currentCount + 1;
        
        // Animate badge
        badge.style.transform = 'scale(1.3)';
        setTimeout(() => {
            badge.style.transform = 'scale(1)';
        }, 200);
    }
}

// ===== EDUCATION FUNCTIONS =====
function initEducationFilters() {
    const categoryCards = document.querySelectorAll('.category-card');
    const educationCards = document.querySelectorAll('.education-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            filterEducationContent(category, card);
        });
    });
}

function filterEducationContent(category, activeCard) {
    // Update active category
    document.querySelectorAll('.category-card').forEach(card => {
        card.classList.remove('active');
    });
    activeCard.classList.add('active');
    
    // Filter education cards
    const educationCards = document.querySelectorAll('.education-card');
    educationCards.forEach(card => {
        const cardCategory = card.dataset.category;
        
        if (category === 'all' || cardCategory === category) {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
            card.style.display = 'block';
        } else {
            card.style.opacity = '0.3';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                if (card.style.opacity === '0.3') {
                    card.style.display = 'none';
                }
            }, 300);
        }
    });
}

function showEducationDetail(topic) {
    const content = document.getElementById('education-detail-content');
    const detailData = getEducationDetailData(topic);
    
    content.innerHTML = `
        <div class="education-detail">
            <div class="detail-header">
                <div class="detail-icon ${topic}">
                    <i class="${detailData.icon}"></i>
                </div>
                <h3>${detailData.title}</h3>
            </div>
            <div class="detail-content">
                ${detailData.content}
            </div>
            <div class="detail-footer">
                <button class="btn-primary" onclick="bookmarkEducation('${topic}')">
                    <i class="fas fa-bookmark"></i> Bookmark
                </button>
                <button class="btn-secondary" onclick="shareEducation('${topic}')">
                    <i class="fas fa-share"></i> Bagikan
                </button>
            </div>
        </div>
    `;
    
    showModal('education-detail-modal');
}

function getEducationDetailData(topic) {
    const data = {
        irrigation: {
            title: 'Teknik Irigasi Tetes',
            icon: 'fas fa-tint',
            content: `
                <div class="detail-section">
                    <h4><i class="fas fa-star"></i> Keuntungan</h4>
                    <ul>
                        <li>Hemat air hingga 50% dibanding sistem konvensional</li>
                        <li>Mengurangi pertumbuhan gulma karena air terfokus</li>
                        <li>Nutrisi lebih terpadu dan efisien</li>
                        <li>Mengurangi penyakit tanaman akibat kelembaban berlebih</li>
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-tools"></i> Cara Pemasangan</h4>
                    <ol>
                        <li>Siapkan pipa utama dari sumber air</li>
                        <li>Pasang pipa cabang sejajar dengan barisan tanaman</li>
                        <li>Pasang emitter setiap 30-40 cm atau sesuai jarak tanaman</li>
                        <li>Atur pressure regulator untuk tekanan 1-2 bar</li>
                        <li>Test sistem dengan air bersih sebelum tanam</li>
                    </ol>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-wrench"></i> Perawatan</h4>
                    <ul>
                        <li>Bersihkan filter air secara rutin (mingguan)</li>
                        <li>Periksa dan bersihkan emitter yang tersumbat</li>
                        <li>Ganti selang yang rusak atau bocor</li>
                        <li>Lakukan flushing sistem setiap bulan</li>
                    </ul>
                </div>
                
                <div class="tip-box">
                    <i class="fas fa-lightbulb"></i>
                    <strong>Pro Tips:</strong> Pasang timer otomatis untuk penyiraman rutin dan gunakan sensor kelembaban tanah untuk efisiensi maksimal.
                </div>
            `
        },
        compost: {
            title: 'Pengolahan Limbah Organik',
            icon: 'fas fa-recycle',
            content: `
                <div class="detail-section">
                    <h4><i class="fas fa-seedling"></i> Bahan yang Diperlukan</h4>
                    <ul>
                        <li>Limbah hijau: daun segar, sisa sayuran, rumput (60%)</li>
                        <li>Limbah coklat: daun kering, ranting, kertas (30%)</li>
                        <li>Aktivator: EM4 atau mikroorganisme lokal (10%)</li>
                        <li>Air secukupnya untuk kelembaban optimal</li>
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-list-ol"></i> Langkah Pembuatan</h4>
                    <ol>
                        <li>Potong limbah organik menjadi ukuran 2-5 cm</li>
                        <li>Campurkan bahan hijau dan coklat dengan rasio 3:1</li>
                        <li>Tambahkan aktivator dan aduk rata</li>
                        <li>Siram hingga kelembaban 50-60% (tidak menetes saat diperas)</li>
                        <li>Tutup dengan terpal atau karung basah</li>
                        <li>Aduk setiap 2 minggu dan cek suhu (50-60°C optimal)</li>
                        <li>Kompos matang dalam 2-3 bulan (berwarna coklat kehitaman)</li>
                    </ol>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-thermometer-half"></i> Monitoring Proses</h4>
                    <ul>
                        <li>Suhu: 50-60°C (fase aktif), turun ke 30°C (matang)</li>
                        <li>Kelembaban: 50-60% (tidak terlalu basah/kering)</li>
                        <li>Aerasi: Aduk rutin untuk oksigen yang cukup</li>
                        <li>pH: 6.5-7.5 (netral untuk pertumbuhan mikroba optimal)</li>
                    </ul>
                </div>
                
                <div class="tip-box">
                    <i class="fas fa-lightbulb"></i>
                    <strong>Pro Tips:</strong> Tambahkan kapur pertanian jika terlalu asam, dan pastikan ventilasi yang baik untuk mencegah bau tidak sedap.
                </div>
            `
        },
        pest: {
            title: 'Pengendalian Hama Alami',
            icon: 'fas fa-shield-alt',
            content: `
                <div class="detail-section">
                    <h4><i class="fas fa-leaf"></i> Pestisida Nabati</h4>
                    <ul>
                        <li><strong>Ekstrak Nimba:</strong> Efektif untuk kutu daun, thrips, ulat</li>
                        <li><strong>Air Sabun:</strong> 2 sdm sabun cuci piring + 1L air untuk serangga kecil</li>
                        <li><strong>Ekstrak Bawang Putih:</strong> Anti jamur dan bakteri alami</li>
                        <li><strong>Larutan Tembakau:</strong> Untuk mengendalikan serangga penghisap</li>
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-bug"></i> Predator Alami</h4>
                    <ul>
                        <li><strong>Kepik:</strong> Memakan kutu daun dan serangga kecil</li>
                        <li><strong>Laba-laba:</strong> Mengendalikan lalat dan serangga terbang</li>
                        <li><strong>Burung:</strong> Pemakan ulat dan serangga besar</li>
                        <li><strong>Kodok:</strong> Mengendalikan serangga malam hari</li>
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-shield-virus"></i> Teknik Pencegahan</h4>
                    <ul>
                        <li>Rotasi tanaman setiap musim</li>
                        <li>Tanaman perangkap (marigold, basil) di pinggir lahan</li>
                        <li>Menjaga kebersihan kebun dari sisa tanaman</li>
                        <li>Mulsa organic untuk mengurangi hama tanah</li>
                        <li>Monitoring rutin dan deteksi dini</li>
                    </ul>
                </div>
                
                <div class="tip-box">
                    <i class="fas fa-lightbulb"></i>
                    <strong>Pro Tips:</strong> Aplikasikan pestisida alami di pagi atau sore hari untuk efektivitas maksimal, dan selalu uji pada area kecil terlebih dahulu.
                </div>
            `
        }
    };
    
    return data[topic] || { title: 'Detail tidak ditemukan', content: '', icon: 'fas fa-question' };
}

function bookmarkEducation(topic) {
    showToast('Artikel berhasil di-bookmark!', 'success');
    // Save to localStorage or backend
    const bookmarks = JSON.parse(localStorage.getItem('farmora_bookmarks') || '[]');
    if (!bookmarks.includes(topic)) {
        bookmarks.push(topic);
        localStorage.setItem('farmora_bookmarks', JSON.stringify(bookmarks));
    }
}

function shareEducation(topic) {
    if (navigator.share) {
        navigator.share({
            title: 'Farmora - Tips Pertanian',
            text: `Pelajari teknik pertanian: ${topic}`,
            url: window.location.href
        });
    } else {
        // Fallback untuk browser yang tidak support Web Share API
        const url = `${window.location.href}?share=${topic}`;
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link berhasil disalin!', 'info');
        });
    }
}

// ===== MARKET FUNCTIONS =====
function initMarketFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            filterProducts(filter, btn);
        });
    });
}

function filterProducts(filter, activeBtn) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    activeBtn.classList.add('active');
    
    // Filter products with animation
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        const category = card.dataset.category;
        
        if (filter === 'all' || category === filter) {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, index * 100);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

function orderProduct(productId) {
    // Simulate order process
    showToast('Menghubungkan dengan penjual...', 'info');
    
    setTimeout(() => {
        showToast('Pesanan berhasil dikirim ke penjual!', 'success');
        
        // Add to notification
        addNotification('success', 'Pesanan Terkirim', 'Penjual akan segera menghubungi Anda');
    }, 2000);
}

function showAddProduct() {
    showModal('add-product-modal');
}

function addProduct(event) {
    event.preventDefault();
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        showToast('Produk berhasil ditambahkan!', 'success');
        closeModal('add-product-modal');
        
        // Reset form
        event.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Add notification
        addNotification('info', 'Produk Baru', 'Produk Anda sedang dalam proses verifikasi');
    }, 2000);
}

// ===== COMMUNITY FUNCTIONS =====
function startTypingSimulation() {
    if (currentSection !== 'community') return;
    
    const typingIndicators = [
        'Pak Ahmad sedang mengetik...',
        'Bu Siti sedang mengetik...',
        'Petani Muda sedang mengetik...'
    ];
    
    setTimeout(() => {
        if (currentSection === 'community' && Math.random() < 0.3) {
            const randomIndicator = typingIndicators[Math.floor(Math.random() * typingIndicators.length)];
            showTypingIndicator(randomIndicator);
        }
    }, Math.random() * 10000 + 5000);
}

function showTypingIndicator(text) {
    const postsContainer = document.querySelector('.community-posts');
    if (!postsContainer) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="post-card" style="opacity: 0.7; border-left: 3px solid #3498db;">
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem;">
                <div class="post-avatar" style="background: #3498db;">
                    <i class="fas fa-user"></i>
                </div>
                <div style="flex: 1; color: #7f8c8d;">
                    <div class="typing-dots">
                        <i class="fas fa-pencil-alt"></i>
                        <span>${text}</span>
                        <div class="dots">
                            <span>.</span>
                            <span>.</span>
                            <span>.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    postsContainer.appendChild(typingDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (typingDiv.parentNode) {
            typingDiv.style.opacity = '0';
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
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memposting...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showToast('Post berhasil dibuat!', 'success');
        closeModal('new-post-modal');
        
        // Reset form
        event.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Simulate new post appearance
        addNewPost();
    }, 1500);
}

function addNewPost() {
    const postsContainer = document.querySelector('.community-posts');
    if (!postsContainer) return;
    
    const newPost = document.createElement('div');
    newPost.innerHTML = `
        <div class="post-card" style="opacity: 0; transform: translateY(-20px);">
            <div class="post-header">
                <div class="post-avatar" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                    AN
                </div>
                <div class="post-user-info">
                    <div class="post-user-name">Anda</div>
                    <div class="post-meta">
                        <span><i class="fas fa-clock"></i> Baru saja</span>
                        <span class="post-category tips">Tips</span>
                    </div>
                </div>
                <div class="post-menu">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            <div class="post-content">
                <h4>Post baru dari komunitas</h4>
                <p>Terima kasih telah berbagi dengan komunitas petani Farmora!</p>
            </div>
            <div class="post-actions">
                <button class="action-btn">
                    <i class="fas fa-heart"></i>
                    <span>0</span>
                </button>
                <button class="action-btn">
                    <i class="fas fa-comment"></i>
                    <span>0</span>
                </button>
                <button class="action-btn">
                    <i class="fas fa-share"></i>
                    <span>0</span>
                </button>
                <button class="action-btn">
                    <i class="fas fa-bookmark"></i>
                </button>
            </div>
        </div>
    `;
    
    postsContainer.insertBefore(newPost, postsContainer.firstChild);
    
    // Animate in
    setTimeout(() => {
        const postCard = newPost.querySelector('.post-card');
        postCard.style.opacity = '1';
        postCard.style.transform = 'translateY(0)';
    }, 100);
}

// ===== CALCULATOR FUNCTIONS =====
function showCalculator() {
    document.getElementById('calculator-options').style.display = 'none';
    document.getElementById('calculator-form').style.display = 'block';
    resetCalculatorForm();
}

function hideCalculator() {
    document.getElementById('calculator-form').style.display = 'none';
    document.getElementById('calculator-options').style.display = 'grid';
    resetCalculator();
}

function resetCalculator() {
    currentStep = 1;
    selectedCrop = '';
    updateCalculatorStep();
    hideResult();
    
    // Reset form
    const form = document.getElementById('calculator-form');
    if (form) {
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
        
        // Reset crop selection
        document.querySelectorAll('.crop-option').forEach(option => {
            option.classList.remove('selected');
        });
    }
}

function resetCalculatorForm() {
    currentStep = 1;
    selectedCrop = '';
    updateCalculatorStep();
    
    // Initialize crop selection
    document.querySelectorAll('.crop-option').forEach(option => {
        option.addEventListener('click', () => {
            selectCrop(option.dataset.crop, option);
        });
    });
}

function selectCrop(crop, element) {
    selectedCrop = crop;
    
    // Update visual selection
    document.querySelectorAll('.crop-option').forEach(option => {
        option.classList.remove('selected');
    });
    element.classList.add('selected');
    
    // Auto-advance to next step
    setTimeout(() => {
        nextStep();
    }, 500);
}

function nextStep() {
    if (currentStep === 1 && !selectedCrop) {
        showToast('Pilih jenis tanaman terlebih dahulu', 'warning');
        return;
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
    }
}

function updateCalculatorStep() {
    // Hide all steps
    document.querySelectorAll('.calc-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show current step
    document.getElementById(`step-${currentStep}`).classList.add('active');
    
    // Update navigation buttons
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
    
    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        if (index < currentStep) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

function calculateFarming() {
    const landArea = parseFloat(document.getElementById('land-area').value);
    const fertilizerPrice = parseFloat(document.getElementById('fertilizer-price').value);
    const sellingPrice = parseFloat(document.getElementById('selling-price').value);
    
    if (!landArea || !fertilizerPrice || !sellingPrice) {
        showToast('Harap lengkapi semua field!', 'warning');
        return;
    }
    
    // Show loading
    const calculateBtn = document.getElementById('calculate-btn');
    const originalText = calculateBtn.innerHTML;
    calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menghitung...';
    calculateBtn.disabled = true;
    
    setTimeout(() => {
        const results = performCalculation(selectedCrop, landArea, fertilizerPrice, sellingPrice);
        displayResults(results);
        
        calculateBtn.innerHTML = originalText;
        calculateBtn.disabled = false;
    }, 2000);
}

function performCalculation(cropType, landArea, fertilizerPrice, sellingPrice) {
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
    const profitMargin = ((netProfit / grossIncome) * 100).toFixed(1);
    
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
    const isProfit = results.netProfit >= 0;
    
    resultContent.innerHTML = `
        <div class="calculation-results">
            <div class="result-summary ${isProfit ? 'profit' : 'loss'}">
                <div class="summary-item">
                    <span class="label">Jenis Tanaman:</span>
                    <span class="value">${getCropName(results.cropType)}</span>
                </div>
                <div class="summary-item">
                    <span class="label">Luas Lahan:</span>
                    <span class="value">${results.landArea} Ha</span>
                </div>
            </div>
            
            <div class="result-details">
                <h4>Detail Perhitungan</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Kebutuhan Pupuk:</span>
                        <span class="detail-value">${results.fertilizerNeeded.toLocaleString()} kg</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Perkiraan Hasil Panen:</span>
                        <span class="detail-value">${results.expectedYield.toLocaleString()} kg</span>
                    </div>
                </div>
            </div>
            
            <div class="cost-breakdown">
                <h4>Rincian Biaya Produksi</h4>
                <div class="breakdown-item">
                    <span>Biaya Pupuk:</span>
                    <span>Rp ${results.breakdown.fertilizer.toLocaleString()}</span>
                </div>
                <div class="breakdown-item">
                    <span>Biaya Bibit:</span>
                    <span>Rp ${results.breakdown.seed.toLocaleString()}</span>
                </div>
                <div class="breakdown-item">
                    <span>Biaya Tenaga Kerja:</span>
                    <span>Rp ${results.breakdown.labor.toLocaleString()}</span>
                </div>
                <div class="breakdown-item">
                    <span>Biaya Lain-lain:</span>
                    <span>Rp ${results.breakdown.other.toLocaleString()}</span>
                </div>
                <div class="breakdown-total">
                    <span>Total Biaya:</span>
                    <span>Rp ${results.totalCost.toLocaleString()}</span>
                </div>
            </div>
            
            <div class="profit-analysis">
                <div class="analysis-item">
                    <span class="analysis-label">Perkiraan Pendapatan:</span>
                    <span class="analysis-value income">Rp ${results.grossIncome.toLocaleString()}</span>
                </div>
                <div class="analysis-item final">
                    <span class="analysis-label">Keuntungan Bersih:</span>
                    <span class="analysis-value ${isProfit ? 'profit' : 'loss'}">
                        Rp ${results.netProfit.toLocaleString()}
                    </span>
                </div>
                <div class="analysis-item">
                    <span class="analysis-label">Margin Keuntungan:</span>
                    <span class="analysis-value ${isProfit ? 'profit' : 'loss'}">
                        ${results.profitMargin}%
                    </span>
                </div>
            </div>
            
            ${!isProfit ? `
                <div class="warning-box">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>Perhatian:</strong>
                        <p>Perhitungan menunjukkan potensi kerugian. Pertimbangkan untuk:</p>
                        <ul>
                            <li>Mengurangi biaya produksi</li>
                            <li>Meningkatkan harga jual</li>
                            <li>Mencari pasar yang lebih menguntungkan</li>
                            <li>Mempertimbangkan jenis tanaman lain</li>
                        </ul>
                    </div>
                </div>
            ` : `
                <div class="success-box">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <strong>Potensi Menguntungkan!</strong>
                        <p>Perhitungan menunjukkan potensi keuntungan yang baik. Tips untuk memaksimalkan:</p>
                        <ul>
                            <li>Jaga kualitas hasil panen</li>
                            <li>Cari pembeli dengan harga terbaik</li>
                            <li>Pertimbangkan penjualan langsung ke konsumen</li>
                            <li>Kelola biaya produksi dengan efisien</li>
                        </ul>
                    </div>
                </div>
            `}
        </div>
    `;
    
    document.getElementById('calculation-result').style.display = 'block';
    
    // Smooth scroll to result
    document.getElementById('calculation-result').scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
    });
}

function getCropName(cropType) {
    const names = {
        rice: 'Padi',
        corn: 'Jagung', 
        tomato: 'Tomat',
        chili: 'Cabai'
    };
    return names[cropType] || cropType;
}

function hideResult() {
    document.getElementById('calculation-result').style.display = 'none';
}

function saveCalculation() {
    // Simulate saving to profile/history
    showToast('Hasil perhitungan berhasil disimpan!', 'success');
    
    // Save to localStorage
    const savedCalculations = JSON.parse(localStorage.getItem('farmora_calculations') || '[]');
    const newCalculation = {
        id: Date.now(),
        date: new Date().toLocaleDateString('id-ID'),
        crop: selectedCrop,
        landArea: document.getElementById('land-area').value,
        timestamp: Date.now()
    };
    
    savedCalculations.unshift(newCalculation);
    if (savedCalculations.length > 10) savedCalculations.pop(); // Keep only last 10
    
    localStorage.setItem('farmora_calculations', JSON.stringify(savedCalculations));
}

function showCalculatorTips() {
    showModal('calculator-tips-modal');
}

// ===== ROUTE FUNCTIONS =====
function resetRouteForm() {
    document.getElementById('origin').value = '';
    document.getElementById('destination').value = '';
    
    // Reset route options
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.option-btn[data-option="fastest"]').classList.add('active');
}

function getCurrentLocation(inputId) {
    const input = document.getElementById(inputId);
    
    if (navigator.geolocation) {
        showToast('Mencari lokasi Anda...', 'info');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Simulate reverse geocoding
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Mock address (in real app, use reverse geocoding API)
                const mockAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)} (Lokasi Saat Ini)`;
                input.value = mockAddress;
                
                showToast('Lokasi berhasil didapatkan!', 'success');
            },
            (error) => {
                showToast('Gagal mendapatkan lokasi. Periksa izin lokasi browser.', 'error');
            }
        );
    } else {
        showToast('Geolocation tidak didukung browser ini.', 'error');
    }
}

function swapLocations() {
    const origin = document.getElementById('origin');
    const destination = document.getElementById('destination');
    
    const temp = origin.value;
    origin.value = destination.value;
    destination.value = temp;
    
    // Animate swap button
    const swapBtn = document.querySelector('.swap-btn');
    swapBtn.style.transform = 'rotate(180deg) scale(1.1)';
    setTimeout(() => {
        swapBtn.style.transform = 'rotate(0deg) scale(1)';
    }, 300);
}

function findRoute() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    
    if (!origin || !destination) {
        showToast('Harap isi lokasi asal dan tujuan', 'warning');
        return;
    }
    
    const findBtn = document.querySelector('.find-route-btn');
    const originalText = findBtn.innerHTML;
    findBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mencari rute...';
    findBtn.disabled = true;
    
    // Simulate route finding
    setTimeout(() => {
        showToast('Rute optimal ditemukan!', 'success');
        updateRouteInfo();
        
        findBtn.innerHTML = originalText;
        findBtn.disabled = false;
    }, 3000);
}

function updateRouteInfo() {
    // Update route information with random realistic data
    const distances = ['15 km', '23 km', '31 km', '28 km'];
    const times = ['25 menit', '35 menit', '45 menit', '38 menit'];
    const traffics = ['Lancar', 'Sedang', 'Padat'];
    const weathers = ['Cerah', 'Berawan', 'Hujan Ringan'];
    
    const randomDistance = distances[Math.floor(Math.random() * distances.length)];
    const randomTime = times[Math.floor(Math.random() * times.length)];
    const randomTraffic = traffics[Math.floor(Math.random() * traffics.length)];
    const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
    
    // Update info display
    const infoItems = document.querySelectorAll('.info-item');
    infoItems[1].querySelector('.info-value').textContent = randomTraffic;
    infoItems[2].querySelector('.info-value').textContent = randomTime;
    infoItems[3].querySelector('.info-value').textContent = randomDistance;
    
    // Animate info update
    infoItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.transform = 'scale(1.05)';
            setTimeout(() => {
                item.style.transform = 'scale(1)';
            }, 200);
        }, index * 100);
    });
}

// ===== UTILITY FUNCTIONS =====
function showToast(message, type = 'success') {
    const toast = document.getElementById('success-toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon i');
    
    // Update content
    toastMessage.textContent = message;
    
    // Update icon based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toastIcon.className = icons[type] || icons.success;
    
    // Update colors based on type
    toast.className = `toast ${type}`;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function startPeriodicUpdates() {
    // Update weather every 30 seconds (demo)
    setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance to update
            updateWeather();
        }
    }, 30000);
    
    // Update stats occasionally
    setInterval(() => {
        if (Math.random() < 0.05) { // 5% chance to update
            updateStats();
        }
    }, 60000);
}

function updateWeather() {
    const weatherData = [
        { temp: '28°C', desc: 'Cerah, cocok untuk menyiram tanaman', icon: 'fas fa-sun' },
        { temp: '25°C', desc: 'Berawan, kondisi baik untuk panen', icon: 'fas fa-cloud-sun' },
        { temp: '23°C', desc: 'Hujan ringan, lindungi tanaman muda', icon: 'fas fa-cloud-rain' },
        { temp: '30°C', desc: 'Panas, pastikan irigasi cukup', icon: 'fas fa-sun' },
        { temp: '26°C', desc: 'Sejuk, waktu ideal untuk bekerja', icon: 'fas fa-cloud' }
    ];
    
    const randomWeather = weatherData[Math.floor(Math.random() * weatherData.length)];
    
    const tempElement = document.querySelector('.weather-temp');
    const descElement = document.querySelector('.weather-desc');
    const iconElement = document.querySelector('.weather-icon i');
    
    if (tempElement && descElement && iconElement) {
        // Animate change
        tempElement.style.opacity = '0.5';
        descElement.style.opacity = '0.5';
        iconElement.style.opacity = '0.5';
        
        setTimeout(() => {
            tempElement.textContent = randomWeather.temp;
            descElement.textContent = randomWeather.desc;
            iconElement.className = randomWeather.icon;
            
            tempElement.style.opacity = '1';
            descElement.style.opacity = '1';
            iconElement.style.opacity = '1';
        }, 300);
    }
}

function updateStats() {
    const statNumbers = document.querySelectorAll('.stat-number:not(.animated)');
    
    statNumbers.forEach(stat => {
        const currentValue = parseInt(stat.textContent.replace(/,/g, ''));
        const increment = Math.floor(Math.random() * 10) + 1;
        const newValue = currentValue + increment;
        
        // Animate number change
        let current = currentValue;
        const timer = setInterval(() => {
            current += Math.ceil(increment / 10);
            if (current >= newValue) {
                current = newValue;
                clearInterval(timer);
            }
            stat.textContent = current.toLocaleString();
        }, 50);
    });
}

function initEventListeners() {
    // Modal close handlers
    initModalCloseHandlers();
    
    // Form validation handlers
    initFormValidation();
    
    // Button click effects
    initButtonEffects();
    
    // Keyboard shortcuts
    initKeyboardShortcuts();
}

function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
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
    
    // Remove existing error styling
    input.classList.remove('error');
    
    // Check if required field is empty
    if (input.hasAttribute('required') && !value) {
        showInputError(input, 'Field ini wajib diisi');
        return false;
    }
    
    // Validate specific input types
    if (input.type === 'email' && value && !isValidEmail(value)) {
        showInputError(input, 'Format email tidak valid');
        return false;
    }
    
    if (input.type === 'number' && value && (isNaN(value) || parseFloat(value) < 0)) {
        showInputError(input, 'Masukkan angka yang valid');
        return false;
    }
    
    return true;
}

function showInputError(input, message) {
    input.classList.add('error');
    
    // Create or update error message
    let errorElement = input.parentNode.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        input.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.color = '#e74c3c';
    errorElement.style.fontSize = '0.8rem';
    errorElement.style.marginTop = '0.25rem';
}

function clearValidationError(event) {
    const input = event.target;
    input.classList.remove('error');
    
    const errorElement = input.parentNode.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function initButtonEffects() {
    document.querySelectorAll('.btn, .btn-primary, .btn-secondary').forEach(btn => {
        btn.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // ESC to close modals
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal[style*="block"]');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
        
        // Number keys for quick navigation (1-5)
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
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Product filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            if (filter) {
                filterProducts(filter, btn);
            }
        });
    });
    
    // Category filter buttons
    document.querySelectorAll('.category-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            if (category) {
                filterEducationContent(category, btn);
            }
        });
    });
}

// Track analytics (placeholder for real analytics)
function trackPageView(sectionName) {
    // In a real app, send to analytics service
    console.log(`Page view: ${sectionName}`);
}

function trackEvent(category, action, label) {
    // In a real app, send to analytics service
    console.log(`Event: ${category} - ${action} - ${label}`);
}

// Service Worker registration (for PWA capabilities)
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    }
}

// Offline status handling
function handleOnlineStatus() {
    function updateOnlineStatus() {
        if (navigator.onLine) {
            showToast('Koneksi internet tersambung kembali', 'success');
        } else {
            showToast('Koneksi internet terputus. Beberapa fitur mungkin terbatas.', 'warning');
        }
    }
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

// Initialize offline capabilities
document.addEventListener('DOMContentLoaded', () => {
    registerServiceWorker();
    handleOnlineStatus();
});

// Add CSS for ripple effect
const rippleStyles = `
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    pointer-events: none;
    transform: scale(0);
    animation: ripple 0.6s linear;
    z-index: 1;
}

@keyframes ripple {
    to {
        transform: scale(2);
        opacity: 0;
    }
}

.typing-dots {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.dots {
    display: flex;
    gap: 0.2rem;
}

.dots span {
    animation: typing 1.4s infinite;
}

.dots span:nth-child(2) {
    animation-delay: 0.2s;
}

.dots span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%, 60%, 100% {
        opacity: 0.3;
    }
    30% {
        opacity: 1;
    }
}

.form-input.error,
.form-select.error,
.form-textarea.error {
    border-color: #e74c3c;
    box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
}

.calculation-results {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.result-summary {
    padding: 1rem;
    border-radius: 8px;
    border-left: 4px solid;
}

.result-summary.profit {
    background: rgba(39, 174, 96, 0.1);
    border-left-color: #27ae60;
}

.result-summary.loss {
    background: rgba(231, 76, 60, 0.1);
    border-left-color: #e74c3c;
}

.summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}

.summary-item:last-child {
    margin-bottom: 0;
}

.detail-grid {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
}

.breakdown-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.breakdown-total {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-top: 2px solid rgba(255, 255, 255, 0.3);
    margin-top: 0.5rem;
    font-weight: bold;
    font-size: 1.1rem;
}

.analysis-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
}

.analysis-item.final {
    border-top: 2px solid rgba(255, 255, 255, 0.3);
    border-bottom: 2px solid rgba(255, 255, 255, 0.3);
    margin: 0.5rem 0;
    font-size: 1.2rem;
    font-weight: bold;
}

.analysis-value.profit {
    color: #2ecc71;
}

.analysis-value.loss {
    color: #e74c3c;
}

.analysis-value.income {
    color: #3498db;
}

.warning-box,
.success-box {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
}

.warning-box {
    background: rgba(231, 76, 60, 0.1);
    border-left: 4px solid #e74c3c;
}

.success-box {
    background: rgba(39, 174, 96, 0.1);
    border-left: 4px solid #27ae60;
}

.warning-box i,
.success-box i {
    font-size: 1.5rem;
    margin-top: 0.25rem;
}

.warning-box i {
    color: #e74c3c;
}

.success-box i {
    color: #27ae60;
}

.warning-box ul,
.success-box ul {
    margin: 0.5rem 0 0 1rem;
    padding: 0;
}

.warning-box li,
.success-box li {
    margin-bottom: 0.25rem;
}

.toast.success { background: linear-gradient(135deg, #27ae60, #2ecc71); }
.toast.error { background: linear-gradient(135deg, #e74c3c, #c0392b); }
.toast.warning { background: linear-gradient(135deg, #f39c12, #e67e22); }
.toast.info { background: linear-gradient(135deg, #3498db, #2980b9); }
`;

// Inject ripple styles
const styleElement = document.createElement('style');
styleElement.textContent = rippleStyles;
document.head.appendChild(styleElement);

// Export functions for global access (if needed)
window.FarmoraApp = {
    showSection,
    showModal,
    closeModal,
    showNotifications,
    showEducationDetail,
    showAddProduct,
    addProduct,
    showNewPost,
    createPost,
    orderProduct,
    showCalculator,
    hideCalculator,
    calculateFarming,
    showCalculatorTips,
    findRoute,
    getCurrentLocation,
    swapLocations,
    showToast
};