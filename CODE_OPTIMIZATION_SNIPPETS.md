# Code Optimization Snippets

## 1. Reduce Unused JavaScript (-349 KiB)

### Current Issue
All modules are imported at the top of main.js, even if not immediately needed.

### Solution: Lazy Load Routes

**Replace in js/main.js:**

```javascript
// OLD - Loads everything immediately
import { renderFeed } from './components/feed.js';
import { renderRightbar } from './components/rightbar.js';
import { renderProfileHeader } from './components/profile.js';

// NEW - Load only when needed
const routes = {
  home: async () => {
    const { renderFeed } = await import('./components/feed.js');
    const { renderProfileHeader } = await import('./components/profile.js');
    showHomeView();
  },
  projects: async () => {
    const { renderFeed } = await import('./components/feed.js');
    showProjectsView();
  },
  articles: async () => {
    const { renderFeed } = await import('./components/feed.js');
    showArticlesView();
  }
};
```

**Expected Savings:** 100-150 KiB

---

## 2. Reduce Unused CSS (-57 KiB)

### Current Issue
global.css contains many utility classes that aren't used.

### Solution: Remove Unused Utilities

**Identify unused classes:**
```bash
# Using PurgeCSS
npm install --save-dev purgecss

# Create purgecss.config.js
module.exports = {
  content: ['./index.html', './js/**/*.js'],
  css: ['./css/**/*.css'],
  output: './css/purged.css'
};

# Run
npx purgecss -c purgecss.config.js
```

**Or manually remove from css/global.css:**
```css
/* Remove unused spacing utilities */
.m-xs { margin: var(--spacing-xs); }  /* Not used */
.m-sm { margin: var(--spacing-sm); }  /* Not used */
.mt-xs { margin-top: var(--spacing-xs); }  /* Not used */
.mt-sm { margin-top: var(--spacing-sm); }  /* Not used */
.mb-xs { margin-bottom: var(--spacing-xs); }  /* Not used */
.mb-sm { margin-bottom: var(--spacing-sm); }  /* Not used */

/* Remove unused text utilities */
.text-xs { font-size: var(--font-size-xs); }  /* Not used */
.font-light { font-weight: 300; }  /* Not used */

/* Remove unused display utilities */
.inline { display: inline; }  /* Not used */
.inline-block { display: inline-block; }  /* Not used */
.items-end { align-items: flex-end; }  /* Not used */
.justify-end { justify-content: flex-end; }  /* Not used */

/* Remove unused gap utilities */
.gap-xs { gap: var(--spacing-xs); }  /* Not used */
.gap-sm { gap: var(--spacing-sm); }  /* Not used */

/* Remove unused border utilities */
.border-t { border-top: 1px solid var(--color-border); }  /* Not used */
.border-r { border-right: 1px solid var(--color-border); }  /* Not used */
.border-l { border-left: 1px solid var(--color-border); }  /* Not used */
.rounded-sm { border-radius: 4px; }  /* Not used */

/* Remove unused effect utilities */
.opacity-50 { opacity: 0.5; }  /* Not used */
.hover\:opacity-75:hover { opacity: 0.75; }  /* Not used */
.hover\:bg-secondary:hover { background-color: var(--color-bg-secondary); }  /* Not used */
```

**Expected Savings:** 30-40 KiB

---

## 3. Optimize Font Loading

### Current Issue
Google Fonts loaded synchronously, blocking render.

### Solution: Optimize Font Strategy

**In index.html <head>:**

```html
<!-- Preload only essential font weights -->
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap">
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap">

<!-- Actual font links -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap">

<!-- Fallback for slow connections -->
<noscript>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap">
</noscript>
```

**Expected Savings:** 200-300ms FCP improvement

---

## 4. Optimize Images

### Convert to WebP

```bash
# Install cwebp
# macOS: brew install webp
# Windows: Download from https://developers.google.com/speed/webp/download

# Convert images
cwebp -q 80 hero.jpeg -o hero.webp
cwebp -q 80 chat.png -o chat.webp

# Verify file sizes
ls -lh hero.* chat.*
```

**In HTML:**

```html
<!-- Use picture element for fallback -->
<picture>
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpeg" alt="Hero image" loading="lazy">
</picture>
```

**Expected Savings:** 30-50 KiB per image

---

## 5. Implement Service Worker

**Create js/service-worker.js:**

```javascript
const CACHE_NAME = 'portfolio-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/global.css',
  '/css/components.css',
  '/js/main.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    }).catch(() => {
      return caches.match('/index.html');
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

**Register in main.js:**

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/js/service-worker.js')
    .then(reg => console.log('Service Worker registered'))
    .catch(err => console.log('Service Worker registration failed'));
}
```

**Expected Benefits:**
- Offline support
- Faster repeat visits
- Reduced bandwidth usage

---

## 6. Minify CSS Files

```bash
# Install cssnano
npm install --save-dev cssnano postcss postcss-cli

# Create postcss.config.js
module.exports = {
  plugins: [
    require('cssnano')({
      preset: ['default', {
        discardComments: {
          removeAll: true,
        },
      }]
    })
  ]
};

# Minify
postcss css/global.css -o css/global.min.css
postcss css/components.css -o css/components.min.css
```

**Expected Savings:** 20-30% file size reduction

---

## 7. Minify JavaScript

```bash
# Install terser
npm install --save-dev terser

# Minify
terser js/main.js -o js/main.min.js -c -m
terser js/theme.js -o js/theme.min.js -c -m
```

**Expected Savings:** 30-40% file size reduction

---

## 8. Enable Gzip Compression

**Already configured in:**
- vercel.json ✓
- .htaccess ✓
- web.config ✓

**Verify in DevTools:**
1. Open Network tab
2. Check Response Headers
3. Look for: `Content-Encoding: gzip`

**Expected Savings:** 60-70% file size reduction

---

## 9. Implement Image Lazy Loading with Blur-Up

**Create js/utils/image-loader.js:**

```javascript
export function setupImageLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}
```

**In HTML:**

```html
<!-- Low quality placeholder -->
<img 
  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3C/svg%3E"
  data-src="hero.webp"
  alt="Hero image"
  class="lazy-image"
>
```

**CSS:**

```css
.lazy-image {
  filter: blur(10px);
  transition: filter 0.3s ease-out;
}

.lazy-image.loaded {
  filter: blur(0);
}
```

---

## 10. Add Web Vitals Monitoring

**Create js/utils/web-vitals.js:**

```javascript
export function initWebVitals() {
  // Largest Contentful Paint
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('LCP:', entry.renderTime || entry.loadTime);
    }
  });
  observer.observe({entryTypes: ['largest-contentful-paint']});
  
  // Cumulative Layout Shift
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
        console.log('CLS:', clsValue);
      }
    }
  });
  clsObserver.observe({entryTypes: ['layout-shift']});
  
  // First Input Delay
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log('FID:', entry.processingDuration);
    }
  });
  fidObserver.observe({entryTypes: ['first-input']});
}
```

---

## Implementation Priority

1. **High Impact (Do First)**
   - Lazy load routes (saves 100+ KiB)
   - Remove unused CSS (saves 30+ KiB)
   - Optimize images to WebP (saves 30+ KiB per image)

2. **Medium Impact (Do Second)**
   - Minify CSS/JS (saves 20-30%)
   - Implement service worker (offline support)
   - Add Web Vitals monitoring

3. **Low Impact (Do Last)**
   - Image lazy loading with blur-up (UX improvement)
   - Font subsetting (saves 10-20 KiB)
   - Advanced caching strategies

---

## Testing After Implementation

```bash
# Run Lighthouse
npm install -g lighthouse
lighthouse https://personal-portfolio-gamma-nine-22.vercel.app/ --view

# Check bundle size
npm install -g webpack-bundle-analyzer
# Add to build process and analyze

# Monitor performance
npm install --save web-vitals
```

---

## Expected Final Results

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Performance | 71 | 90+ | +19 |
| SEO | 71 | 95+ | +24 |
| FCP | 2.3s | 1.2s | -1.1s |
| LCP | 3.6s | 1.8s | -1.8s |
| Total JS | 349 KiB | 150 KiB | -57% |
| Total CSS | 57 KiB | 15 KiB | -74% |
| Total Size | 500+ KiB | 250 KiB | -50% |

---

**Start with the high-impact items for fastest results!**
