// ============================================
// PRELOADER И ОПТИМИЗАЦИЯ ПРОИЗВОДИТЕЛЬНОСТИ
// ============================================

// Утилиты для оптимизации
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Preloader
class Preloader {
    constructor() {
        this.preloader = document.getElementById('preloader');
        this.progressBar = document.getElementById('preloaderProgress');
        this.progress = 0;
        this.resources = [];
        this.loadedResources = 0;

        this.init();
    }

    init() {
        // Собираем все ресурсы для загрузки
        this.collectResources();

        // Начинаем отслеживание загрузки
        this.startLoading();

        // Минимальное время показа preloader (для эстетики)
        this.minDisplayTime = 1000;
        this.startTime = Date.now();
    }

    collectResources() {
        // Изображения
        const images = Array.from(document.images);

        // Видео
        const videos = Array.from(document.querySelectorAll('video'));

        // CSS
        const stylesheets = Array.from(document.styleSheets);

        this.resources = [...images, ...videos];
    }

    startLoading() {
        // Симуляция прогресса
        const simulateProgress = setInterval(() => {
            if (this.progress < 90) {
                this.progress += Math.random() * 10;
                this.updateProgress(this.progress);
            } else {
                clearInterval(simulateProgress);
            }
        }, 200);

        // Реальная загрузка
        if (document.readyState === 'complete') {
            this.onLoadComplete();
        } else {
            window.addEventListener('load', () => this.onLoadComplete());
        }
    }

    updateProgress(value) {
        this.progress = Math.min(value, 100);
        if (this.progressBar) {
            this.progressBar.style.width = this.progress + '%';
        }
    }

    async onLoadComplete() {
        // Дожидаемся минимального времени показа
        const elapsed = Date.now() - this.startTime;
        if (elapsed < this.minDisplayTime) {
            await new Promise(resolve => setTimeout(resolve, this.minDisplayTime - elapsed));
        }

        // Завершаем загрузку
        this.updateProgress(100);

        // Убираем preloader
        setTimeout(() => {
            this.hide();
        }, 300);
    }

    hide() {
        if (this.preloader) {
            this.preloader.classList.add('hidden');

            // Удаляем из DOM после анимации
            setTimeout(() => {
                this.preloader.remove();
                document.body.style.overflow = 'visible';
            }, 500);
        }
    }
}

// Запускаем preloader
document.body.style.overflow = 'hidden';
const preloader = new Preloader();

// Lazy Loading для видео (ОПТИМИЗИРОВАННЫЙ)
class LazyVideoLoader {
    constructor() {
        this.videos = document.querySelectorAll('video.lazy-video');
        this.observer = null;
        this.loadedVideos = new Set();
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    rootMargin: '100px', // Увеличил для предзагрузки
                    threshold: 0.01 // Уменьшил порог
                }
            );

            this.videos.forEach(video => {
                this.observer.observe(video);
            });

            console.log(`📹 Найдено ${this.videos.length} видео для lazy loading`);
        } else {
            console.warn('⚠️ IntersectionObserver не поддерживается');
        }
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.loadedVideos.has(entry.target)) {
                this.loadVideo(entry.target);
                this.loadedVideos.add(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }

    loadVideo(video) {
        const source = video.querySelector('source');
        const dataSrc = source?.getAttribute('data-src') || video.getAttribute('data-src');

        if (dataSrc && !this.loadedVideos.has(video)) {
            console.log(`📹 Загрузка видео: ${dataSrc.split('/').pop()}`);

            if (source) {
                source.setAttribute('src', dataSrc);
                source.removeAttribute('data-src');
            }

            video.setAttribute('src', dataSrc);
            video.removeAttribute('data-src');

            // Добавляем обработчики
            video.addEventListener('loadeddata', () => {
                console.log(`✅ Видео загружено: ${dataSrc.split('/').pop()}`);
            });

            video.addEventListener('error', (e) => {
                console.error(`❌ Ошибка загрузки видео: ${dataSrc.split('/').pop()}`, e);
            });

            video.load();

            // Автоплей только когда видео в зоне видимости
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log(`▶️ Видео запущено: ${dataSrc.split('/').pop()}`);
                    })
                    .catch(err => {
                        console.log(`⏸️ Автоплей заблокирован для: ${dataSrc.split('/').pop()}`);
                        // Пытаемся воспроизвести при клике
                        video.addEventListener('click', () => {
                            video.play();
                        }, { once: true });
                    });
            }
        }
    }
}

// Инициализируем lazy loading после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new LazyVideoLoader();
    });
} else {
    new LazyVideoLoader();
}

// Gallery Slider
let currentSlide = 0;
const gallerySlider = document.querySelector('.gallery-slider');

if (gallerySlider) {
    const wrapper = gallerySlider.querySelector('.gallery-slides-wrapper');
    const slides = gallerySlider.querySelectorAll('.gallery-slide');
    const dots = gallerySlider.querySelectorAll('.gallery-dot');
    const prevBtn = gallerySlider.querySelector('.gallery-prev');
    const nextBtn = gallerySlider.querySelector('.gallery-next');

    function showSlide(index) {
        // Wrap around
        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }

        // Remove active class from all dots
        dots.forEach(dot => dot.classList.remove('active'));

        // Add active to current dot
        dots[currentSlide].classList.add('active');

        // Move wrapper
        wrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    // Navigation buttons
    prevBtn.addEventListener('click', () => {
        showSlide(currentSlide - 1);
    });

    nextBtn.addEventListener('click', () => {
        showSlide(currentSlide + 1);
    });

    // Dots navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });

    // Auto-slide every 5 seconds
    let autoSlideInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5000);

    // Pause auto-slide on hover
    gallerySlider.addEventListener('mouseenter', () => {
        clearInterval(autoSlideInterval);
    });

    gallerySlider.addEventListener('mouseleave', () => {
        autoSlideInterval = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            showSlide(currentSlide - 1);
        } else if (e.key === 'ArrowRight') {
            showSlide(currentSlide + 1);
        }
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    gallerySlider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    gallerySlider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            showSlide(currentSlide + 1);
        }
        if (touchEndX > touchStartX + 50) {
            showSlide(currentSlide - 1);
        }
    }
}

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');

    // Animate hamburger icon
    const spans = menuToggle.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translateY(12px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-12px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

// Close mobile menu when clicking on a link
navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = menuToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// Smooth scroll with offset for fixed header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header scroll effect (оптимизировано с throttle)
let lastScroll = 0;
const header = document.querySelector('.header');

const handleHeaderScroll = throttle(() => {
    const currentScroll = window.pageYOffset;

    if (currentScroll <= 0) {
        header.style.boxShadow = 'none';
    } else {
        header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
    }

    // Hide/show header on scroll
    if (currentScroll > lastScroll && currentScroll > 500) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }

    lastScroll = currentScroll;
}, 100);

window.addEventListener('scroll', handleHeaderScroll, { passive: true });

// Intersection Observer for fade-in animations
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

// Observe all cards and sections
document.querySelectorAll('.service-card, .gallery-item, .stat-card, .contact-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Form submission
const orderForms = document.querySelectorAll('.order-form');

orderForms.forEach(orderForm => {
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(orderForm);
        const data = Object.fromEntries(formData);

        // Here you would typically send data to a server
        console.log('Form submitted:', data);

        // Show success message
        const button = orderForm.querySelector('button[type="submit"]');
        const originalText = button.textContent;
        button.textContent = 'Заявка отправлена!';
        button.style.background = 'linear-gradient(135deg, #10b981, #059669)';

        // Reset form
        orderForm.reset();

        // Reset button after 3 seconds
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
        }, 3000);
    });
});

// Parallax effect удален - используется оптимизированная версия ниже

// Gallery item click effect
document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.width = '20px';
        ripple.style.height = '20px';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';

        item.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(20);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Counter animation for stats
const animateCounter = (element, target) => {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + (element.textContent.includes('%') ? '%' : '+');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + (element.textContent.includes('%') ? '%' : '+');
        }
    }, 30);
};

// Observe stat numbers
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            const text = entry.target.textContent;
            // Handle different number formats
            if (text.includes('-')) {
                // For ranges like "6-55", just show as is
                entry.target.classList.add('animated');
            } else if (text.includes('.')) {
                // For decimals like "2.5"
                entry.target.classList.add('animated');
            } else {
                const number = parseInt(text.replace(/\D/g, ''));
                if (!isNaN(number)) {
                    entry.target.classList.add('animated');
                    animateCounter(entry.target, number);
                }
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(stat => {
    statObserver.observe(stat);
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// FAQ Accordion
document.querySelectorAll(".faq-question").forEach(question => {
    question.addEventListener("click", () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains("active");
        
        // Close all FAQ items
        document.querySelectorAll(".faq-item").forEach(item => {
            item.classList.remove("active");
        });
        
        // Toggle current item
        if (!isActive) {
            faqItem.classList.add("active");
        }
    });
});

// ============================================
// UX Improvements
// ============================================

// Auto-scroll to order form after 15 seconds
let autoScrollTriggered = false;

setTimeout(() => {
    if (!autoScrollTriggered) {
        const orderSection = document.getElementById('order');
        if (orderSection) {
            const headerOffset = 80;
            const elementPosition = orderSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            autoScrollTriggered = true;
        }
    }
}, 15000); // 15 seconds

// Progress Bar on Scroll (оптимизировано с throttle)
const progressBar = document.getElementById('progressBar');

const updateProgressBar = throttle(() => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;

    if (progressBar) {
        progressBar.style.width = scrollPercent + '%';
    }
}, 50);

window.addEventListener('scroll', updateProgressBar, { passive: true });
window.addEventListener('resize', debounce(updateProgressBar, 200));

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');

function toggleBackToTop() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (backToTopBtn) {
        if (scrollTop > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
}

window.addEventListener('scroll', toggleBackToTop);

if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Sticky CTA Button (Show after hero section)
const stickyCta = document.getElementById('stickyCta');
const heroSection = document.querySelector('.hero');

function toggleStickyCta() {
    if (!stickyCta || !heroSection) return;

    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > heroBottom) {
        stickyCta.style.transform = 'translateY(0)';
    } else {
        stickyCta.style.transform = 'translateY(100%)';
    }
}

window.addEventListener('scroll', toggleStickyCta);

// Form Validation
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');

    inputs.forEach(input => {
        const formGroup = input.closest('.form-group');
        if (!formGroup) return;

        // Remove previous states
        formGroup.classList.remove('error', 'success');

        // Check if empty
        if (!input.value.trim()) {
            formGroup.classList.add('error');
            let errorMsg = formGroup.querySelector('.form-error');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.className = 'form-error';
                formGroup.appendChild(errorMsg);
            }
            errorMsg.textContent = 'Это поле обязательно для заполнения';
            isValid = false;
        } else if (input.type === 'email') {
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                formGroup.classList.add('error');
                let errorMsg = formGroup.querySelector('.form-error');
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.className = 'form-error';
                    formGroup.appendChild(errorMsg);
                }
                errorMsg.textContent = 'Введите корректный email';
                isValid = false;
            } else {
                formGroup.classList.add('success');
            }
        } else if (input.type === 'tel') {
            // Validate phone (simple check for digits)
            const phoneRegex = /^[\d\s\+\-\(\)]+$/;
            if (!phoneRegex.test(input.value) || input.value.replace(/\D/g, '').length < 10) {
                formGroup.classList.add('error');
                let errorMsg = formGroup.querySelector('.form-error');
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.className = 'form-error';
                    formGroup.appendChild(errorMsg);
                }
                errorMsg.textContent = 'Введите корректный номер телефона';
                isValid = false;
            } else {
                formGroup.classList.add('success');
            }
        } else {
            formGroup.classList.add('success');
        }
    });

    return isValid;
}

// Add validation to all forms
document.querySelectorAll('.order-form').forEach(form => {
    const submitBtn = form.querySelector('button[type="submit"]');

    // Real-time validation on blur
    form.querySelectorAll('input, select, textarea').forEach(input => {
        input.addEventListener('blur', () => {
            const formGroup = input.closest('.form-group');
            if (!formGroup) return;

            formGroup.classList.remove('error', 'success');

            if (input.hasAttribute('required') && !input.value.trim()) {
                formGroup.classList.add('error');
                let errorMsg = formGroup.querySelector('.form-error');
                if (!errorMsg) {
                    errorMsg = document.createElement('div');
                    errorMsg.className = 'form-error';
                    formGroup.appendChild(errorMsg);
                }
                errorMsg.textContent = 'Это поле обязательно для заполнения';
            } else if (input.value.trim()) {
                formGroup.classList.add('success');
            }
        });
    });

    // Override existing form submission
    const oldSubmitHandler = form.onsubmit;
    form.onsubmit = null;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateForm(form)) {
            // Scroll to first error
            const firstError = form.querySelector('.form-group.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return false;
        }

        // If valid, proceed with original handler or default
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        console.log('Form submitted:', data);

        const button = submitBtn || form.querySelector('button[type="submit"]');
        if (button) {
            const originalText = button.textContent;
            button.textContent = 'Заявка отправлена!';
            button.style.background = 'linear-gradient(135deg, #10b981, #059669)';

            form.reset();

            // Clear validation states
            form.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('error', 'success');
            });

            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
            }, 3000);
        }
    });
});

// ============================================
// НОВЫЕ АНИМАЦИИ И ЭФФЕКТЫ
// ============================================

// 1. АНИМИРОВАННЫЕ СЧЕТЧИКИ С ПРОГРЕСС-БАРАМИ
const animateCounterNew = (element, target, duration = 2000) => {
    const isDecimal = target.toString().includes('.');
    const start = 0;
    const startTime = performance.now();

    const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const easeOutQuad = progress * (2 - progress);
        const current = start + (target - start) * easeOutQuad;

        if (isDecimal) {
            element.textContent = current.toFixed(1);
        } else {
            element.textContent = Math.floor(current).toLocaleString('ru-RU');
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString('ru-RU');
        }
    };

    requestAnimationFrame(animate);
};

// Intersection Observer для анимации статистики
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('visible', 'counted');

            // Анимация счетчика
            const counter = entry.target.querySelector('.stat-number');
            if (counter && counter.hasAttribute('data-target')) {
                const target = parseFloat(counter.getAttribute('data-target'));
                animateCounterNew(counter, target);
            }

            // Анимация прогресс-бара
            const progressBar = entry.target.querySelector('.stat-progress-bar');
            if (progressBar) {
                const progress = progressBar.getAttribute('data-progress');
                setTimeout(() => {
                    progressBar.style.width = progress + '%';
                }, 200);
            }
        }
    });
}, {
    threshold: 0.3
});

// Наблюдаем за карточками статистики
document.querySelectorAll('.stat-card.animate-on-scroll').forEach(card => {
    statsObserver.observe(card);
});

// 2. ПАРАЛЛАКС ЭФФЕКТЫ (ОПТИМИЗИРОВАННЫЕ)
let ticking = false;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

function updateParallax() {
    // Отключаем параллакс на слабых устройствах или при настройках accessibility
    if (prefersReducedMotion || isLowEndDevice) {
        return;
    }

    const scrollY = window.pageYOffset;

    // Параллакс только для hero-content (видео оставляем на месте)
    const heroContent = document.querySelector('.hero-content');

    if (heroContent && scrollY < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrollY * 0.1}px)`;
        heroContent.style.opacity = 1 - (scrollY / window.innerHeight * 0.6);
    }

    ticking = false;
}

// Используем throttle для параллакса
window.addEventListener('scroll', throttle(() => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            updateParallax();
        });
        ticking = true;
    }
}, 16), { passive: true }); // 60fps = 16ms

// 3D трансформация карточек при движении мыши (ОПТИМИЗИРОВАНО)
// Отключаем на слабых устройствах и mobile
if (!isLowEndDevice && !prefersReducedMotion && window.innerWidth > 768) {
    document.querySelectorAll('.service-card, .adventure-card, .challenge-card').forEach(card => {
        card.addEventListener('mousemove', throttle((e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 15; // Уменьшили интенсивность
            const rotateY = (centerX - x) / 15;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        }, 50)); // Throttle для производительности

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ============================================
// ОПТИМИЗАЦИЯ ВИДЕО
// ============================================

// Пауза видео когда они вне зоны видимости
// Исключаем hero-видео, так как оно должно играть всегда
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target;
        // Пропускаем hero-видео
        if (video.id === 'heroVideo') return;

        if (entry.isIntersecting) {
            // Видео в зоне видимости - играем
            if (video.paused) {
                video.play().catch(() => {});
            }
        } else {
            // Видео вне зоны видимости - ставим на паузу
            if (!video.paused) {
                video.pause();
            }
        }
    });
}, {
    threshold: 0.5 // Видео должно быть видно хотя бы на 50%
});

// Наблюдаем за всеми видео кроме hero
document.querySelectorAll('video').forEach(video => {
    videoObserver.observe(video);
});

console.log('📹 Оптимизация видео включена');

// 3. МИКРОАНИМАЦИИ (ОПТИМИЗИРОВАННЫЕ)

// КОНФЕТТИ ОТКЛЮЧЕНО для производительности
// Если хочешь включить - раскомментируй код ниже

// Волновой эффект при клике
function createRipple(e) {
    const button = e.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = diameter + 'px';
    circle.style.left = e.clientX - rect.left - radius + 'px';
    circle.style.top = e.clientY - rect.top - radius + 'px';
    circle.classList.add('ripple-effect');

    const ripple = button.getElementsByClassName('ripple-effect')[0];
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);

    setTimeout(() => circle.remove(), 600);
}

// Добавляем стили для волнового эффекта
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .btn, .btn-primary, .btn-outline, .btn-large {
        position: relative;
        overflow: hidden;
    }

    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Применяем волновой эффект ко всем кнопкам
document.querySelectorAll('.btn, .btn-primary, .btn-outline, .btn-large').forEach(btn => {
    btn.addEventListener('click', createRipple);
});

// ЧАСТИЦЫ НА ФОНЕ ОТКЛЮЧЕНЫ для производительности
// Если хочешь включить - раскомментируй код ниже

// ИСКРЫ ПРИ СКРОЛЛЕ ОТКЛЮЧЕНЫ для производительности
// Если хочешь включить - раскомментируй код ниже

console.log('🎉 Все анимации загружены!');

// ============================================
// SERVICE WORKER (ОТКЛЮЧЕН ДЛЯ РАЗРАБОТКИ)
// ============================================

// SERVICE WORKER ВРЕМЕННО ОТКЛЮЧЕН для избежания проблем с кэшированием
// Включи его в продакшене, раскомментировав код ниже

/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('✅ Service Worker зарегистрирован:', registration.scope);
            })
            .catch((error) => {
                console.log('❌ Ошибка регистрации Service Worker:', error);
            });
    });
}
*/

// Удаляем существующий Service Worker если есть
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
            registration.unregister();
            console.log('🗑️ Service Worker удален');
        });
    });
}

// ============================================
// PERFORMANCE MONITORING
// ============================================

// Мониторинг производительности
if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
            const renderTime = timing.domComplete - timing.domLoading;

            console.log('📊 Метрики производительности:');
            console.log(`  ⏱️ Полная загрузка: ${(loadTime / 1000).toFixed(2)}s`);
            console.log(`  ⏱️ DOM Ready: ${(domReadyTime / 1000).toFixed(2)}s`);
            console.log(`  ⏱️ Рендеринг: ${(renderTime / 1000).toFixed(2)}s`);

            // Если загрузка слишком медленная, логируем
            if (loadTime > 3000) {
                console.warn('⚠️ Медленная загрузка страницы!');
            }
        }, 0);
    });
}

// Lazy loading для изображений (native)
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    console.log(`🖼️ Найдено ${images.length} изображений с lazy loading`);
} else {
    // Fallback для старых браузеров
    console.log('⚠️ Браузер не поддерживает native lazy loading');
}

console.log('✅ Все оптимизации применены!');

// ============================================
// ГАЛЕРЕЯ С МОДАЛЬНЫМ ОКНОМ
// ============================================

class PhotoGallery {
    constructor() {
        this.modal = document.getElementById('galleryModal');
        this.modalImage = document.getElementById('galleryModalImage');
        this.modalCaption = document.getElementById('galleryModalCaption');
        this.counterElement = document.getElementById('galleryCounter');
        this.closeBtn = this.modal.querySelector('.gallery-modal-close');
        this.prevBtn = this.modal.querySelector('.gallery-nav-prev');
        this.nextBtn = this.modal.querySelector('.gallery-nav-next');

        this.currentCategory = null;
        this.currentIndex = 0;
        this.images = {
            children: [
                { src: 'assets/gallery/children/children-1.jpg', caption: 'Детский день рождения - квест приключение' },
                { src: 'assets/gallery/children/children-2.jpg', caption: 'Веселые испытания для детей' },
                { src: 'assets/gallery/children/children-3.jpg', caption: 'Поиск сокровищ Форт Боярд' },
                { src: 'assets/gallery/children/children-4.jpg', caption: 'Яркие моменты детского праздника' },
                { src: 'assets/gallery/children/children-5.jpg', caption: 'Команды детей проходят испытания' },
                { src: 'assets/gallery/children/children-6.jpg', caption: 'Детский квест в стиле Форт Боярд' },
                { src: 'assets/gallery/children/children-7.jpg', caption: 'Незабываемый день рождения' },
                { src: 'assets/gallery/children/children-8.jpg', caption: 'Дети в восторге от приключений' },
                { src: 'assets/gallery/children/children-9.jpg', caption: 'Веселые конкурсы для детей' },
                { src: 'assets/gallery/children/children-10.jpg', caption: 'Детский праздник Форт Боярд' },
                { src: 'assets/gallery/children/children-11.jpg', caption: 'Радость и эмоции на празднике' },
                { src: 'assets/gallery/children/children-12.jpg', caption: 'Увлекательные испытания для детей' },
                { src: 'assets/gallery/children/children-13.jpg', caption: 'Детский праздник в формате Форт Боярд' },
                { src: 'assets/gallery/children/children-14.jpg', caption: 'Дети решают головоломки' },
                { src: 'assets/gallery/children/children-15.jpg', caption: 'Квест-приключение для детей' },
                { src: 'assets/gallery/children/children-16.jpg', caption: 'Счастливые именинники' },
                { src: 'assets/gallery/children/children-17.jpg', caption: 'Командные игры и испытания' },
                { src: 'assets/gallery/children/children-18.jpg', caption: 'Веселье на детском празднике' },
                { src: 'assets/gallery/children/children-19.jpg', caption: 'Детский день рождения в стиле квеста' },
                { src: 'assets/gallery/children/children-20.jpg', caption: 'Яркие эмоции детей' },
                { src: 'assets/gallery/children/children-21.jpg', caption: 'Приключения в Форт Боярд' },
                { src: 'assets/gallery/children/children-22.jpg', caption: 'Дети проходят испытания' },
                { src: 'assets/gallery/children/children-23.jpg', caption: 'Незабываемые моменты праздника' },
                { src: 'assets/gallery/children/children-24.jpg', caption: 'Веселая компания на дне рождения' },
                { src: 'assets/gallery/children/children-25.jpg', caption: 'Детский квест-шоу Форт Боярд' }
            ],
            adults: [
                { src: 'assets/gallery/adults/adults-1.jpg', caption: 'Корпоративное мероприятие в Форт Боярд' },
                { src: 'assets/gallery/adults/adults-2.jpg', caption: 'Тимбилдинг - командные испытания' },
                { src: 'assets/gallery/adults/adults-3.jpg', caption: 'Взрослый квест-шоу с приключениями' },
                { src: 'assets/gallery/adults/adults-4.jpg', caption: 'Корпоратив - веселые конкурсы' },
                { src: 'assets/gallery/adults/adults-5.jpg', caption: 'Тимбилдинг для сплочения команды' },
                { src: 'assets/gallery/adults/adults-6.jpg', caption: 'Корпоративный праздник в стиле Форт Боярд' },
                { src: 'assets/gallery/adults/adults-7.jpg', caption: 'Взрослые участники проходят испытания' },
                { src: 'assets/gallery/adults/adults-8.jpg', caption: 'Незабываемый корпоратив' },
                { src: 'assets/gallery/adults/adults-9.jpg', caption: 'Командная работа в испытаниях' },
                { src: 'assets/gallery/adults/adults-10.jpg', caption: 'Корпоративное мероприятие Форт Боярд' },
                { src: 'assets/gallery/adults/adults-11.jpg', caption: 'Тимбилдинг - сплочение коллектива' },
                { src: 'assets/gallery/adults/adults-12.jpg', caption: 'Веселые моменты корпоратива' }
            ],
            school: [
                { src: 'assets/gallery/school/school-1.jpg', caption: 'Выпускной в стиле Форт Боярд' },
                { src: 'assets/gallery/school/school-2.jpg', caption: 'Незабываемый выпускной праздник' },
                { src: 'assets/gallery/school/school-3.jpg', caption: 'Класс на выпускном приключении' },
                { src: 'assets/gallery/school/school-4.jpg', caption: 'Выпускной квест для школьников' },
                { src: 'assets/gallery/school/school-5.jpg', caption: 'Веселый выпускной праздник' },
                { src: 'assets/gallery/school/school-6.jpg', caption: 'Выпускной в формате Форт Боярд' },
                { src: 'assets/gallery/school/school-7.jpg', caption: 'Школьники проходят испытания' },
                { src: 'assets/gallery/school/school-8.jpg', caption: 'Поход классом на квест' },
                { src: 'assets/gallery/school/school-9.jpg', caption: 'Выпускной с приключениями' },
                { src: 'assets/gallery/school/school-10.jpg', caption: 'Школьный праздник Форт Боярд' },
                { src: 'assets/gallery/school/school-11.jpg', caption: 'Класс в командных испытаниях' },
                { src: 'assets/gallery/school/school-12.jpg', caption: 'Выпускной для школьников' },
                { src: 'assets/gallery/school/school-13.jpg', caption: 'Поход классом в Форт Боярд' },
                { src: 'assets/gallery/school/school-14.jpg', caption: 'Дружный класс на выпускном' },
                { src: 'assets/gallery/school/school-15.jpg', caption: 'Школьный квест-шоу' },
                { src: 'assets/gallery/school/school-16.jpg', caption: 'Выпускной с испытаниями' },
                { src: 'assets/gallery/school/school-17.jpg', caption: 'Класс проходит квест' },
                { src: 'assets/gallery/school/school-18.jpg', caption: 'Веселый выпускной вечер' },
                { src: 'assets/gallery/school/school-19.jpg', caption: 'Школьники в Форт Боярд' },
                { src: 'assets/gallery/school/school-20.jpg', caption: 'Выпускной праздник под ключ' },
                { src: 'assets/gallery/school/school-21.jpg', caption: 'Незабываемый выпускной' },
                { src: 'assets/gallery/school/school-22.jpg', caption: 'Класс на приключении' },
                { src: 'assets/gallery/school/school-23.jpg', caption: 'Выпускной в стиле квеста' },
                { src: 'assets/gallery/school/school-24.jpg', caption: 'Поход классом Форт Боярд' },
                { src: 'assets/gallery/school/school-25.jpg', caption: 'Школьный выпускной квест' }
            ]
        };

        this.init();
    }

    init() {
        // Открытие галереи при клике на кнопки
        document.querySelectorAll('.gallery-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.gallery-card');
                const category = card.getAttribute('data-category');
                this.openGallery(category, 0);
            });
        });

        // Закрытие
        this.closeBtn.addEventListener('click', () => this.closeGallery());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeGallery();
            }
        });

        // Навигация
        this.prevBtn.addEventListener('click', () => this.navigate(-1));
        this.nextBtn.addEventListener('click', () => this.navigate(1));

        // Клавиатура
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('active')) return;

            if (e.key === 'Escape') this.closeGallery();
            if (e.key === 'ArrowLeft') this.navigate(-1);
            if (e.key === 'ArrowRight') this.navigate(1);
        });
    }

    openGallery(category, index = 0) {
        this.currentCategory = category;
        this.currentIndex = index;
        this.updateImage();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeGallery() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    navigate(direction) {
        const images = this.images[this.currentCategory];
        this.currentIndex = (this.currentIndex + direction + images.length) % images.length;
        this.updateImage();
    }

    updateImage() {
        const images = this.images[this.currentCategory];
        const current = images[this.currentIndex];

        this.modalImage.src = current.src;
        this.modalImage.alt = current.caption;
        this.modalCaption.textContent = current.caption;
        this.counterElement.textContent = `${this.currentIndex + 1} / ${images.length}`;
    }
}

// Инициализация галереи
new PhotoGallery();
