/* Code Splitting & Lazy Loading Module */

const componentCache = {};

export async function lazyLoadComponent(componentName) {
  if (componentCache[componentName]) {
    return componentCache[componentName];
  }

  try {
    let component;
    switch(componentName) {
      case 'carousel':
        component = await import('./carousel.js');
        break;
      case 'animations':
        component = await import('./animations.js');
        break;
      case 'markdown':
        component = await import('./markdown.js');
        break;
      default:
        return null;
    }
    
    componentCache[componentName] = component;
    return component;
  } catch (error) {
    console.warn(`Failed to load component: ${componentName}`, error);
    return null;
  }
}

export function deferNonCriticalScripts() {
  // Defer support chat initialization
  if (window.location.hash !== '#support') {
    setTimeout(() => {
      const supportToggle = document.querySelector('#support-toggle-desktop');
      if (supportToggle) {
        supportToggle.style.display = 'flex';
      }
    }, 3000);
  }

  // Defer scroll animations
  setTimeout(() => {
    lazyLoadComponent('animations').then(mod => {
      if (mod && mod.initScrollAnimations) {
        mod.initScrollAnimations();
      }
    });
  }, 2000);
}

// Initialize deferred loading
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', deferNonCriticalScripts);
} else {
  deferNonCriticalScripts();
}
