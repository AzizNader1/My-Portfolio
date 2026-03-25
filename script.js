/* ============================================
   AZIZ NADER PORTFOLIO — Modern Interactive JS
   Particle System + Display Carousels + Tabs
   ============================================ */

// ==========================================
// 1. PARTICLE CANVAS SYSTEM (Increased Density)
// ==========================================
(function () {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let mouse = { x: -1000, y: -1000 };

    // Increased particle count and connection distance for a denser effect
    const PARTICLE_COUNT = 150;
    const CONNECTION_DISTANCE = 180;
    const MOUSE_RADIUS = 250;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.8, // Slightly faster
                vy: (Math.random() - 0.5) * 0.8,
                radius: Math.random() * 2.5 + 1,
                opacity: Math.random() * 0.6 + 0.2
            });
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, width, height);

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DISTANCE) {
                    const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.2; // Slightly more visible lines
                    ctx.strokeStyle = `rgba(108, 99, 255, ${opacity})`;
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        // Draw mouse connections & particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Mouse interaction
            const mdx = p.x - mouse.x;
            const mdy = p.y - mouse.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

            if (mDist < MOUSE_RADIUS) {
                const opacity = (1 - mDist / MOUSE_RADIUS) * 0.5;
                ctx.strokeStyle = `rgba(0, 212, 170, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();

                // Push particles away from cursor
                const force = (MOUSE_RADIUS - mDist) / MOUSE_RADIUS;
                p.vx += (mdx / mDist) * force * 0.4;
                p.vy += (mdy / mDist) * force * 0.4;
            }

            // Draw dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(108, 99, 255, ${p.opacity})`;
            ctx.fill();

            // Update position
            p.x += p.vx;
            p.y += p.vy;

            // Damping (friction)
            p.vx *= 0.99;
            p.vy *= 0.99;

            // Base gentle movement if slowed down too much
            if (Math.abs(p.vx) < 0.1) p.vx += (Math.random() - 0.5) * 0.1;
            if (Math.abs(p.vy) < 0.1) p.vy += (Math.random() - 0.5) * 0.1;

            // Bounds
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;
            p.x = Math.max(0, Math.min(width, p.x));
            p.y = Math.max(0, Math.min(height, p.y));
        }
    }

    function animate() {
        drawParticles();
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });

    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    // Touch support for particles
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    }, { passive: true });

    document.addEventListener('touchend', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    resize();
    createParticles();
    animate();
})();

// ==========================================
// 2. DISPLAY-BASED CAROUSEL SYSTEM (Show/Hide)
// ==========================================
function initCarousels() {
    const carousels = document.querySelectorAll('[data-carousel]');

    carousels.forEach(wrapper => {
        const slides = wrapper.querySelectorAll('.carousel-slide');
        const prevBtn = wrapper.querySelector('.carousel-arrow.prev');
        const nextBtn = wrapper.querySelector('.carousel-arrow.next');
        const counterCurrent = wrapper.querySelector('.carousel-counter .current');
        const counterTotal = wrapper.querySelector('.carousel-counter .total');
        const dotsContainer = wrapper.querySelector('.carousel-dots');

        if (slides.length === 0) return;

        let currentIndex = 0;
        const total = slides.length;

        // Ensure first slide is active
        slides.forEach((s, i) => {
            if (i === 0) s.classList.add('active');
            else s.classList.remove('active');
        });

        // Set counter total
        if (counterTotal) counterTotal.textContent = total;

        // Create dots
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            for (let i = 0; i < total; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            }
        }

        function goTo(index) {
            if (index < 0) index = total - 1;
            if (index >= total) index = 0;

            // Remove active from old
            slides[currentIndex].classList.remove('active');

            currentIndex = index;

            // Add active to new
            slides[currentIndex].classList.add('active');

            // Update counter
            if (counterCurrent) counterCurrent.textContent = currentIndex + 1;

            // Update dots
            if (dotsContainer) {
                dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
                    dot.classList.toggle('active', i === currentIndex);
                });
            }
        }

        if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        const viewport = wrapper.querySelector('.carousel-viewport') || wrapper;

        viewport.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        viewport.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchStartX - touchEndX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) goTo(currentIndex + 1);
                else goTo(currentIndex - 1);
            }
        }, { passive: true });
    });
}

// ==========================================
// 3. SKILLS TABS SYSTEM
// ==========================================
function initSkillsTabs() {
    const tabs = document.querySelectorAll('.skills-tab');
    const panels = document.querySelectorAll('.skills-panel');

    if (tabs.length === 0 || panels.length === 0) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs and panels
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Add active to clicked tab
            tab.classList.add('active');

            // Add active to corresponding panel
            const targetId = tab.getAttribute('data-target');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// ==========================================
// 4. TYPEWRITER EFFECT
// ==========================================
function typeWriterCycle(element, titles, speed = 80, pause = 2000) {
    let titleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentTitle = titles[titleIndex];
        if (!isDeleting) {
            element.textContent = currentTitle.substring(0, charIndex + 1);
            charIndex++;
            if (charIndex === currentTitle.length) {
                isDeleting = true;
                setTimeout(type, pause);
                return;
            }
        } else {
            element.textContent = currentTitle.substring(0, charIndex - 1);
            charIndex--;
            if (charIndex === 0) {
                isDeleting = false;
                titleIndex = (titleIndex + 1) % titles.length;
            }
        }
        setTimeout(type, isDeleting ? speed / 2 : speed);
    }
    type();
}

// ==========================================
// 5. SCROLL ANIMATIONS (IntersectionObserver)
// ==========================================
function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
}

// ==========================================
// 6. NAVBAR SCROLL EFFECT
// ==========================================
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;

                // Navbar background
                if (navbar) {
                    if (scrollY > 50) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                }

                // Active link detection
                let current = '';
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.clientHeight;
                    // Adjusted offset for better detection
                    if (scrollY >= (sectionTop - 250)) {
                        current = section.getAttribute('id');
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    const href = link.getAttribute('href');
                    if (href && href.substring(1) === current) {
                        link.classList.add('active');
                    }
                });

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// ==========================================
// 7. BACK TO TOP
// ==========================================
function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }, { passive: true });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ==========================================
// 8. SMOOTH SCROLL FOR NAV LINKS
// ==========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });

                // Close mobile nav if open
                const navCollapse = document.querySelector('.navbar-collapse');
                if (navCollapse && navCollapse.classList.contains('show') && typeof bootstrap !== 'undefined') {
                    const bsCollapse = bootstrap.Collapse.getInstance(navCollapse);
                    if (bsCollapse) bsCollapse.hide();
                }
            }
        });
    });
}

// ==========================================
// 9. FORM HANDLING
// ==========================================
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Remove any existing messages
        const existingAlert = this.querySelector('.alert');
        if (existingAlert) existingAlert.remove();

        const btn = this.querySelector('button[type="submit"]');
        const originalBtnText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Sending...';
        btn.disabled = true;

        const formData = new FormData(this);

        try {
            const response = await fetch(this.action, {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                const successMsg = document.createElement('div');
                successMsg.className = 'alert alert-success mt-3';
                successMsg.style.background = 'rgba(0, 212, 170, 0.15)';
                successMsg.style.border = '1px solid rgba(0, 212, 170, 0.3)';
                successMsg.style.color = '#00D4AA';
                successMsg.style.borderRadius = '10px';
                successMsg.innerHTML = '<i class="fas fa-check-circle me-2"></i> Thank you! Your message has been sent successfully.';

                this.appendChild(successMsg);
                this.reset();

                setTimeout(() => {
                    successMsg.style.opacity = '0';
                    successMsg.style.transition = 'opacity 0.5s ease-out';
                    setTimeout(() => successMsg.remove(), 500);
                }, 5000);
            } else {
                throw new Error("Form submission failed");
            }
        } catch (error) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'alert alert-danger mt-3';
            errorMsg.style.background = 'rgba(255, 107, 157, 0.15)';
            errorMsg.style.border = '1px solid rgba(255, 107, 157, 0.3)';
            errorMsg.style.color = '#FF6B9D';
            errorMsg.style.borderRadius = '10px';
            errorMsg.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i> Oops! Something went wrong. Please try again or email me directly.';
            this.appendChild(errorMsg);

            setTimeout(() => {
                errorMsg.style.opacity = '0';
                errorMsg.style.transition = 'opacity 0.5s ease-out';
                setTimeout(() => errorMsg.remove(), 500);
            }, 5000);
        } finally {
            btn.innerHTML = originalBtnText;
            btn.disabled = false;
        }
    });
}

// ==========================================
// 10. RIPPLE EFFECT ON BUTTONS
// ==========================================
function initRippleEffect() {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function (e) {
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
            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// ==========================================
// 11. PARALLAX ON HERO
// ==========================================
function initParallax() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    let pTicking = false;
    window.addEventListener('scroll', () => {
        if (!pTicking && window.scrollY < window.innerHeight) {
            requestAnimationFrame(() => {
                const scrolled = window.scrollY;
                const content = hero.querySelector('.container');
                if (content) {
                    content.style.transform = `translate3d(0, ${scrolled * 0.15}px, 0)`;
                    content.style.opacity = Math.max(0, 1 - (scrolled / 700));
                }
                pTicking = false;
            });
            pTicking = true;
        }
    }, { passive: true });
}

// ==========================================
// INIT ALL ON DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
    // 1. Init UI Components
    initCarousels();
    initSkillsTabs();

    // 2. Typing effect
    const typedTitle = document.querySelector('.typed-title');
    if (typedTitle) {
        typeWriterCycle(typedTitle, [
            'Engineering Scalable Enterprise Solutions',
            'C# .NET Developer',
            'ASP.NET Core Developer',
            'Full-Stack Software Engineer',
            'Building Scalable and Secure Web Applications',
            'Architecting High-Performance .NET Systems',
            'Transforming Ideas into Production-Ready Code',
            'Delivering Excellence in Software Engineering',
            'Building the Future with Clean Architecture',
        ], 60, 2000);
    }

    // 3. Animations & interactions
    initScrollAnimations();
    initNavbar();
    initBackToTop();
    initSmoothScroll();
    initContactForm();
    initRippleEffect();
    initParallax();
});