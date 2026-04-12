/* Animation utilities for scroll and page transitions */

/**
 * Initialize intersection observer for scroll animations
 */
export function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Use requestAnimationFrame to prevent layout thrashing
        requestAnimationFrame(() => {
          entry.target.classList.add('visible');
        });
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe all elements with observe-fade-in class
  document.querySelectorAll('.observe-fade-in').forEach(el => {
    observer.observe(el);
  });

  return observer;
}

/**
 * Add fade-in animation to element
 */
export function animateFadeInUp(element) {
  element.classList.add('animate-fade-in-up');
}

/**
 * Add slide-in section animation
 */
export function animateSectionEntry(element) {
  element.classList.add('animate-slide-in-section');
}

/**
 * Stagger animate children elements
 */
export function staggerAnimateChildren(parentElement) {
  const children = parentElement.children;
  Array.from(children).forEach((child, index) => {
    child.style.opacity = '0';
    child.style.transform = 'translateY(20px)';
    child.style.animation = `fadeInUp 600ms ease-out ${index * 100}ms forwards`;
  });
}

/**
 * Smooth scroll to element
 */
export function smoothScrollTo(element) {
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Add hover animation to cards
 */
export function addCardHoverAnimations() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-4px)';
      this.style.boxShadow = 'var(--shadow-lg)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'var(--shadow-sm)';
    });
  });
}

/**
 * Fade in page section
 */
export function fadeInPageSection(container) {
  if (!container) return;
  
  container.style.opacity = '0';
  container.style.transform = 'translateY(10px)';
  
  // Trigger reflow to ensure animation starts
  void container.offsetWidth;
  
  container.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';
  container.style.opacity = '1';
  container.style.transform = 'translateY(0)';
  
  // Clean up inline styles after animation
  setTimeout(() => {
    container.style.transition = '';
    container.style.transform = '';
  }, 300);
}

/**
 * Fade out and in page section (for route transitions)
 */
export function transitionPageSection(container) {
  return new Promise(resolve => {
    container.style.opacity = '0';
    container.style.transform = 'scale(0.95)';
    container.style.transition = 'opacity 300ms ease-in, transform 300ms ease-in';
    
    setTimeout(() => {
      container.innerHTML = '';
      container.style.opacity = '1';
      container.style.transform = 'scale(1)';
      container.style.transition = 'opacity 400ms ease-out, transform 400ms ease-out';
      resolve();
    }, 300);
  });
}
