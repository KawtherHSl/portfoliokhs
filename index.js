function initializePortfolio() {
    // Add js-enabled class to body for scroll-reveal animations
    document.body.classList.add('js-enabled');
    
    /* ==========================================================================
       LANGUAGE SELECTOR & TRANSLATION
       ========================================================================== */
    const langBtns = document.querySelectorAll('[data-lang-switch]');
    
    function setLanguage(lang) {
        document.body.setAttribute('data-lang', lang);
        
        // Toggle active button style
        langBtns.forEach(btn => {
            if (btn.getAttribute('data-lang-switch') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Translate all elements with data-fr and data-en
        document.querySelectorAll('[data-fr]').forEach(elem => {
            const translation = lang === 'en' ? elem.getAttribute('data-en') : elem.getAttribute('data-fr');
            if (translation !== null) {
                if (translation.includes('<') && translation.includes('>')) {
                    elem.innerHTML = translation;
                } else {
                    elem.textContent = translation;
                }
            }
        });
        
        // Translate all placeholders
        document.querySelectorAll('[data-placeholder-fr]').forEach(elem => {
            const placeholder = lang === 'en' ? elem.getAttribute('data-placeholder-en') : elem.getAttribute('data-placeholder-fr');
            if (placeholder !== null) {
                elem.setAttribute('placeholder', placeholder);
            }
        });
        
        localStorage.setItem('preferred-language', lang);
    }
    
    // Add event listeners to switch language
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang-switch');
            setLanguage(lang);
        });
    });
    
    // Load initial language preference
    const savedLang = localStorage.getItem('preferred-language') || 'fr';
    setLanguage(savedLang);
    
    /* ==========================================================================
       CUSTOM CURSOR
       ========================================================================== */
    const cursor = document.querySelector('.custom-cursor');
    const cursorGlow = document.querySelector('.custom-cursor-glow');
    
    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Instant position for the core cursor dot
        if (cursor) {
            cursor.style.left = `${mouseX}px`;
            cursor.style.top = `${mouseY}px`;
        }
    });
    
    // Physics-based lag (interpolation) for the glowing trail
    function animateCursor() {
        // Linear interpolation: glow position moves 15% closer to mouse position every frame
        glowX += (mouseX - glowX) * 0.15;
        glowY += (mouseY - glowY) * 0.15;
        
        if (cursorGlow) {
            cursorGlow.style.left = `${glowX}px`;
            cursorGlow.style.top = `${glowY}px`;
        }
        
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    // Expand cursor glow on hover of interactive elements
    const hoverElements = document.querySelectorAll('a, button, input, textarea, .filter-btn, .tab-btn, .project-card, .open-modal-btn');
    hoverElements.forEach(elem => {
        elem.addEventListener('mouseenter', () => {
            cursorGlow.classList.add('custom-cursor-hover');
        });
        elem.addEventListener('mouseleave', () => {
            cursorGlow.classList.remove('custom-cursor-hover');
        });
    });

    /* ==========================================================================
       NEURAL NETWORK CANVAS BACKGROUND
       ========================================================================== */
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        // Handle window resizing
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        }
        window.addEventListener('resize', resizeCanvas);

        // Mouse track inside canvas
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        // Particle class definition
        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 2 + 1;
                this.speedX = (Math.random() - 0.5) * 0.6;
                this.speedY = (Math.random() - 0.5) * 0.6;
                this.baseX = this.x;
                this.baseY = this.y;
            }

            update() {
                // Movement
                this.x += this.speedX;
                this.y += this.speedY;

                // Bounce off edges
                if (this.x < 0 || this.x > canvas.width) this.speedX = -this.speedX;
                if (this.y < 0 || this.y > canvas.height) this.speedY = -this.speedY;

                // Interactive mouse repulsion
                if (mouse.x != null && mouse.y != null) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.hypot(dx, dy);
                    if (distance < mouse.radius) {
                        let forceDirectionX = dx / distance;
                        let forceDirectionY = dy / distance;
                        let force = (mouse.radius - distance) / mouse.radius;
                        let directionX = forceDirectionX * force * 15;
                        let directionY = forceDirectionY * force * 15;
                        
                        this.x -= directionX;
                        this.y -= directionY;
                    }
                }
            }

            draw() {
                ctx.fillStyle = 'rgba(0, 210, 255, 0.4)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            // Scale density to viewport size
            const count = Math.floor((canvas.width * canvas.height) / 11000);
            for (let i = 0; i < Math.min(count, 150); i++) {
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.height;
                particles.push(new Particle(x, y));
            }
        }

        // Draw connections between particles
        function connectParticles() {
            let maxDistance = 110;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    let dx = particles[a].x - particles[b].x;
                    let dy = particles[a].y - particles[b].y;
                    let distance = Math.hypot(dx, dy);

                    if (distance < maxDistance) {
                        // Calculate opacity based on proximity
                        let alpha = (1 - (distance / maxDistance)) * 0.13;
                        ctx.strokeStyle = `rgba(157, 78, 221, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }

                // Connect to mouse too
                if (mouse.x != null && mouse.y != null) {
                    let dx = particles[a].x - mouse.x;
                    let dy = particles[a].y - mouse.y;
                    let distance = Math.hypot(dx, dy);
                    if (distance < mouse.radius) {
                        let alpha = (1 - (distance / mouse.radius)) * 0.2;
                        ctx.strokeStyle = `rgba(0, 210, 255, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            connectParticles();
            requestAnimationFrame(animateCanvas);
        }
        
        resizeCanvas();
        animateCanvas();
    }

    /* ==========================================================================
       SCROLL REVEAL & INTERSECTION OBSERVERS
       ========================================================================== */
    const revealItems = document.querySelectorAll('.reveal-item');
    
    // Basic elements entrance animations
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // If it's a skills card, trigger skill bars animations
                if (entry.target.classList.contains('skills-card')) {
                    animateSkillBars(entry.target);
                }
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealItems.forEach(item => {
        revealObserver.observe(item);
    });

    // Reset skill bars and animate them nicely on entrance
    function animateSkillBars(card) {
        const progressBars = card.querySelectorAll('.skill-progress-bar');
        progressBars.forEach(bar => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';
            // Force a reflow to restart transition
            void bar.offsetWidth;
            bar.style.width = targetWidth;
        });
    }

    // Scroll Spy for Header Active Link
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const spyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.4,
        rootMargin: '-20% 0px -40% 0px'
    });

    sections.forEach(section => {
        spyObserver.observe(section);
    });

    // Shrink header on scroll
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* ==========================================================================
       MOBILE NAVIGATION MENU
       ========================================================================== */
    const mobileMenuBtn = document.querySelector('.mobile-nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('open');
            navMenu.classList.toggle('open');
            // Toggle body overflow to prevent scroll behind overlay menu
            document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
        });

        // Close menu on link clicks
        const mobileLinks = navMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('open');
                navMenu.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    /* ==========================================================================
       TIMELINE TAB SWITCHER
       ========================================================================== */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active classes
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => {
                c.classList.remove('active-content');
                c.style.display = 'none';
            });
            
            // Add active classes
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(targetId);
            
            if (targetContent) {
                targetContent.style.display = 'block';
                // Small timeout to allow display block to apply before trigger opacity transition
                setTimeout(() => {
                    targetContent.classList.add('active-content');
                }, 10);
            }
        });
    });

    /* ==========================================================================
       PROJECTS FILTERING
       ========================================================================== */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    // Trigger fade/scale in
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.85)';
                    // Delay display:none to let fadeout transition finish
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 350);
                }
            });
        });
    });

    /* ==========================================================================
       PROJECT MODALS CONTROLLER
       ========================================================================== */
    const openModalButtons = document.querySelectorAll('.open-modal-btn');
    const closeModalButtons = document.querySelectorAll('.modal-close-btn');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    
    // Open Modal
    openModalButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });
    
    // Close Modal
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetModal = e.target.closest('.modal-overlay');
            if (targetModal) closeModal(targetModal);
        });
    });
    
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            // Only close if we clicked directly on the overlay background, not the container
            if (e.target === overlay) {
                closeModal(overlay);
            }
        });
    });
    
    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) closeModal(activeModal);
        }
    });

    /* ==========================================================================
       CONTACT FORM SUBMISSION WITH SIMULATED FEEDBACK
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    
    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            const currentLang = localStorage.getItem('preferred-language') || 'fr';
            
            // UI Loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <span>${currentLang === 'en' ? 'Sending...' : 'Envoi en cours...'}</span>
                <svg class="animate-spin" viewBox="0 0 24 24" width="18" height="18">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" stroke-dasharray="32" stroke-linecap="round"></circle>
                </svg>
            `;
            
            // Extract values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Simulate API fetch delay
            setTimeout(() => {
                // Perform simple email match check just in case
                if (name && email && subject && message) {
                    formStatus.className = 'form-status-message form-status-success';
                    formStatus.textContent = currentLang === 'en'
                        ? 'Your message has been sent successfully! Thank you, I will contact you shortly.'
                        : 'Votre message a bien été envoyé ! Merci, je vous recontacterai rapidement.';
                    contactForm.reset();
                } else {
                    formStatus.className = 'form-status-message form-status-error';
                    formStatus.textContent = currentLang === 'en'
                        ? 'An error occurred. Please fill in all fields.'
                        : 'Une erreur s\'est produite. Veuillez remplir tous les champs.';
                }
                
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                
                // Fade out status message after 6 seconds
                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 6000);
                
            }, 1800);
        });
    }
}

// Robust execution wrapper that handles modules and deferred execution
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePortfolio);
} else {
    initializePortfolio();
}
