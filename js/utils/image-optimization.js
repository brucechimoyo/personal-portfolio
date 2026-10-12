/* Image Optimization Module */

export function optimizeImages() {
  // Lazy load all images
  const images = document.querySelectorAll('img:not([loading="lazy"]):not(.no-lazy)');
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
