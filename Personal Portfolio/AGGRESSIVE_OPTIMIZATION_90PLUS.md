# Aggressive Performance Optimization - Target 90+

## Current Bottlenecks

| Issue | Current | Target | Gap |
|-------|---------|--------|-----|
| LCP | 4.4s | < 2.5s | -1.9s |
| FCP | 2.0s | < 1.5s | -0.5s |
| Unused CSS | 51 KiB | < 10 KiB | -41 KiB |
| Unused JS | 33 KiB | < 5 KiB | -28 KiB |
| CLS | 0.164 | < 0.1 | -0.064 |
| Main-thread | 2.5s | < 1.5s | -1.0s |

---

## Solution 1: Inline Critical CSS (Saves 51 KiB)

The biggest issue: CSS files are still loading. Inline critical styles directly in HTML.

### Step 1: Extract Critical CSS

Create `css/critical-inline.css` with only above-the-fold styles:

```css
/* CRITICAL STYLES ONLY - Inline in <head> */

:root {
  --color-bg: #ffffff;
  --color-text-primary: #0f1419;
  --color-accent: #1d9bf0;
  --font-family-primary: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-size-base: clamp(0.849rem, 1.5vw, 1rem);
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #000000;
    --color-text-primary: #efefef;
  }
}

html[data-theme="dark"] {
  --color-bg: #000000;
  --color-text-primary: #efefef;
}

html[data-theme="light"] {
  --color-bg: #ffffff;
  --color-text-primary: #0f1419;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  background-color: var(--color-bg);
  overflow-x: hidden;
}

h1, h2, h3 {
  font-weight: 700;
  margin-bottom: var(--spacing-md);
}

a {
  color: var(--color-accent);
  text-decoration: none;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

body {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
}

@media (min-width: 48rem) {
  body {
    grid-template-columns: 250px 1fr;
    grid-template-rows: 1fr;
  }
}

@media (min-width: 64rem) {
  body {
    grid-template-columns: 250px 1fr 300px;
  }
}

header {
  grid-column: 1 / -1;
  border-bottom: 1px solid #eeeeee;
  padding: var(--spacing-md);
  background-color: var(--color-bg);
  position: sticky;
  top: 0;
  z-index: 50;
}

@media (min-width: 48rem) {
  header {
    display: none;
  }
}

nav#sidebar {
  display: none;
}

@media (min-width: 48rem) {
  nav#sidebar {
    display: flex;
    flex-direction: column;
    border-right: 1px solid #eeeeee;
    padding: var(--spacing-lg);
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    background-color: var(--color-bg);
  }
}

main#feed {
  grid-column: 1;
  border-right: 1px solid #eeeeee;
  min-height: 100vh;
  overflow-x: hidden;
  box-sizing: border-box;
}

@media (min-width: 48rem) {
  main#feed {
    grid-column: 2;
  }
}

@media (min-width: 64rem) {
  main#feed {
    grid-column: 2;
    border-right: 1px solid #eeeeee;
  }
}

aside#rightbar {
  display: none;
}

@media (min-width: 64rem) {
  aside#rightbar {
    display: block;
    padding: var(--spacing-lg);
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    background-color: var(--color-bg);
  }
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #eeeeee;
  border-radius: 4px;
}
```

### Step 2: Update index.html

Replace the `<style>` tag with minified critical CSS:

```html
<style>
/* MINIFIED CRITICAL CSS - Paste minified version here */
:root{--color-bg:#fff;--color-text-primary:#0f1419;--color-accent:#1d9bf0;--font-family-primary:"Poppins",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;--font-size-base:clamp(.849rem,1.5vw,1rem);--spacing-md:1rem;--spacing-lg:1.5rem}@media (prefers-color-scheme:dark){:root{--color-bg:#000;--color-text-primary:#efefef}}html[data-theme=dark]{--color-bg:#000;--color-text-primary:#efefef}html[data-theme=light]{--color-bg:#fff;--color-text-primary:#0f1419}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}body{font-family:var(--font-family-primary);font-size:var(--font-size-base);color:var(--color-text-primary);background-color:var(--color-bg);overflow-x:hidden}h1,h2,h3{font-weight:700;margin-bottom:var(--spacing-md)}a{color:var(--color-accent);text-decoration:none}img{max-width:100%;height:auto;display:block}body{display:grid;grid-template-columns:1fr;grid-template-rows:auto 1fr;min-height:100vh}@media (min-width:48rem){body{grid-template-columns:250px 1fr;grid-template-rows:1fr}}@media (min-width:64rem){body{grid-template-columns:250px 1fr 300px}}header{grid-column:1/-1;border-bottom:1px solid #eee;padding:var(--spacing-md);background-color:var(--color-bg);position:sticky;top:0;z-index:50}@media (min-width:48rem){header{display:none}}nav#sidebar{display:none}@media (min-width:48rem){nav#sidebar{display:flex;flex-direction:column;border-right:1px solid #eee;padding:var(--spacing-lg);position:sticky;top:0;height:100vh;overflow-y:auto;background-color:var(--color-bg)}}main#feed{grid-column:1;border-right:1px solid #eee;min-height:100vh;overflow-x:hidden;box-sizing:border-box}@media (min-width:48rem){main#feed{grid-column:2}}@media (min-width:64rem){main#feed{grid-column:2;border-right:1px solid #eee}}aside#rightbar{display:none}@media (min-width:64rem){aside#rightbar{display:block;padding:var(--spacing-lg);position:sticky;top:0;height:100vh;overflow-y:auto;background-color:var(--color-bg)}}::-webkit-scrollbar{width:8px}::-webkit-scrollbar-track{background:0}::-webkit-scrollbar-thumb{background:#eee;border-radius:4px}
</style>
```

**Expected Savings:** 51 KiB unused CSS eliminated

---

## Solution 2: Defer Non-Critical JavaScript (Saves 33 KiB)

### Step 1: Split main.js

Create `js/main-critical.js` with only essential code:

```javascript
// CRITICAL ONLY - Theme initialization
(function() {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

// Defer rest of app
window.addEventListener('load', () => {
  const script = document.createElement('script');
  script.type = 'module';
  script.src = 'js/main.js';
  document.body.appendChild(script);
});
```

### Step 2: Update index.html

```html
<!-- Replace: <script type="module" src="js/main.js" defer></script> -->
<!-- With: -->
<script src="js/main-critical.js"></script>
```

**Expected Savings:** 33 KiB deferred until after page load

---

## Solution 3: Optimize LCP Image (Saves 1.9s)

LCP is 4.4s because images load too late.

### Step 1: Preload LCP Image

Add to `<head>`:

```html
<!-- Preload the largest image that will be visible -->
<link rel="preload" as="image" href="img/hero.webp" imagesrcset="img/hero-small.webp 480w, img/hero-medium.webp 800w, img/hero.webp 1200w" imagesizes="(max-width: 480px) 480px, (max-width: 800px) 800px, 1200px">
```

### Step 2: Use WebP with Fallback

```html
<picture>
  <source srcset="img/hero.webp" type="image/webp">
  <img src="img/hero.jpeg" alt="Hero" loading="eager" fetchpriority="high">
</picture>
```

### Step 3: Optimize Image Size

```bash
# Create responsive images
cwebp -q 80 img/hero.jpeg -o img/hero.webp
cwebp -q 75 img/hero.jpeg -resize 480 0 -o img/hero-small.webp
cwebp -q 75 img/hero.jpeg -resize 800 0 -o img/hero-medium.webp

# Verify sizes
ls -lh img/hero*
```

**Expected Savings:** 1.9s LCP improvement

---

## Solution 4: Fix Layout Shifts (CLS: 0.164 → 0.1)

### Step 1: Add Size Attributes to Images

```html
<!-- Add width and height to prevent layout shift -->
<img src="img/hero.webp" alt="Hero" width="1200" height="600" loading="eager">
```

### Step 2: Reserve Space for Dynamic Content

```html
<!-- Add container with fixed aspect ratio -->
<div style="aspect-ratio: 16/9; background: #f0f0f0;">
  <img src="img/hero.webp" alt="Hero" style="width: 100%; height: 100%; object-fit: cover;">
</div>
```

### Step 3: Avoid Animated Elements

Remove or optimize animations that cause layout shifts:

```css
/* Instead of: */
.card {
  transform: scale(1);
  transition: transform 0.3s;
}
.card:hover {
  transform: scale(1.05); /* Causes layout shift */
}

/* Use: */
.card {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.3s;
}
.card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.2); /* No layout shift */
}
```

**Expected Savings:** CLS 0.164 → 0.08

---

## Solution 5: Reduce Main-Thread Work (2.5s → 1.5s)

### Step 1: Defer Heavy Processing

```javascript
// Instead of processing all at once:
const items = [...allItems];
items.forEach(item => processItem(item));

// Use requestIdleCallback:
function processItemsIdly(items, index = 0) {
  if (index >= items.length) return;
  
  requestIdleCallback(() => {
    processItem(items[index]);
    processItemsIdly(items, index + 1);
  }, { timeout: 1000 });
}

processItemsIdly(allItems);
```

### Step 2: Use Web Workers for Heavy Tasks

```javascript
// Create js/worker.js
self.onmessage = (e) => {
  const result = heavyComputation(e.data);
  self.postMessage(result);
};

// Use in main.js
const worker = new Worker('js/worker.js');
worker.postMessage(largeDataset);
worker.onmessage = (e) => {
  console.log('Result:', e.data);
};
```

**Expected Savings:** 1.0s main-thread reduction

---

## Solution 6: Minify CSS & JS (Saves 19 KiB)

```bash
# Install tools
npm install --save-dev cssnano postcss postcss-cli terser

# Minify CSS
postcss css/global.css -o css/global.min.css
postcss css/components.css -o css/components.min.css

# Minify JS
terser js/main.js -o js/main.min.js -c -m
terser js/main-critical.js -o js/main-critical.min.js -c -m

# Update index.html to use .min files
```

**Expected Savings:** 19 KiB

---

## Implementation Order

### Phase 1: Critical (Do First) - 30 minutes
1. Inline critical CSS (saves 51 KiB)
2. Defer non-critical JS (saves 33 KiB)
3. Preload LCP image (saves 1.9s)

**Expected Result:** Performance 79 → 88

### Phase 2: Important (Do Second) - 20 minutes
4. Fix layout shifts (CLS 0.164 → 0.08)
5. Minify CSS/JS (saves 19 KiB)
6. Reduce main-thread work (saves 1.0s)

**Expected Result:** Performance 88 → 92

### Phase 3: Polish (Do Last) - 15 minutes
7. Optimize remaining images
8. Add service worker
9. Implement code splitting

**Expected Result:** Performance 92 → 95+

---

## Quick Implementation

### 1. Inline Critical CSS

Copy the minified critical CSS into `<style>` tag in index.html head.

### 2. Defer Non-Critical JS

Create `js/main-critical.js` with theme code, update script tag.

### 3. Preload LCP Image

Add preload link and picture element for hero image.

### 4. Fix Layout Shifts

Add width/height to images, use aspect-ratio containers.

### 5. Minify Files

Run minification commands above.

---

## Expected Final Results

| Metric | Before | After Phase 1 | After Phase 2 | After Phase 3 |
|--------|--------|---------------|---------------|---------------|
| Performance | 79 | 88 | 92 | 95+ |
| LCP | 4.4s | 2.5s | 2.2s | 1.8s |
| FCP | 2.0s | 1.5s | 1.2s | 1.0s |
| CLS | 0.164 | 0.1 | 0.08 | 0.05 |
| Main-thread | 2.5s | 2.0s | 1.5s | 1.0s |

---

## Deploy Strategy

```bash
# Phase 1
git add index.html js/main-critical.js js/main-critical.min.js
git commit -m "Phase 1: Inline critical CSS, defer JS, preload LCP image"
git push origin main

# Wait 5 minutes, run Lighthouse

# Phase 2
git add css/global.min.css js/main.min.js
git commit -m "Phase 2: Minify CSS/JS, fix layout shifts, reduce main-thread"
git push origin main

# Wait 5 minutes, run Lighthouse

# Phase 3
git add js/service-worker.js
git commit -m "Phase 3: Add service worker, optimize images"
git push origin main
```

---

## Success Criteria

- [ ] Performance score ≥ 90
- [ ] LCP < 2.5s
- [ ] FCP < 1.5s
- [ ] CLS < 0.1
- [ ] Main-thread work < 1.5s
- [ ] No console errors
- [ ] All styles load correctly
- [ ] Images display properly

---

**Start with Phase 1 for immediate 90+ performance!**
