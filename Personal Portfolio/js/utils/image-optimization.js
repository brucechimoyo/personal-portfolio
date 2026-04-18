/* Image Optimization Module */

export function optimizeImages() {
  // Optimize hero image
  const heroImg = document.querySelector('img[alt*="hero"], img[src*="hero"]');
  if (heroImg) {
    // Set actual display dimensions instead of loading full size
    heroImg.style.maxWidth = '100%';
    heroImg.style.height = 'auto';
    heroImg.loading = 'lazy';
    
    // Add srcset for responsive images
    if (!heroImg.srcset) {
      const src = heroImg.src;
      heroImg.srcset = `${src}?w=400 400w, ${src}?w=800 800w`;
      heroImg.sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    }
  }

  // Lazy load all images
  const images = document.querySelectorAll('img:not([loading="lazy"])');
  images.forEach(img => {
    if (!img.classList.contains('no-lazy')) {
      img.loading = 'lazy';
    }
  });

  // Use Intersection Observer for additional optimization
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', optimizeImages);
} else {
  optimizeImages();
}
