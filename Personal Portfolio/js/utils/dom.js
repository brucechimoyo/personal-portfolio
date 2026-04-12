/* DOM Utilities - Helpers for DOM manipulation */

export function createElement(tag, classes = '', attributes = {}) {
  const element = document.createElement(tag);
  if (classes) {
    element.className = classes;
  }
  Object.entries(attributes).forEach(([key, value]) => {
    if (key.startsWith('data-')) {
      element.setAttribute(key, value);
    } else if (key === 'innerHTML') {
      element.innerHTML = value;
    } else {
      element[key] = value;
    }
  });
  return element;
}

export function html(str) {
  const div = document.createElement('div');
  div.innerHTML = str.trim();
  return div.firstElementChild;
}

export function addClass(element, ...classes) {
  element.classList.add(...classes.filter(Boolean));
}

export function removeClass(element, ...classes) {
  element.classList.remove(...classes.filter(Boolean));
}

export function toggleClass(element, className) {
  element.classList.toggle(className);
}

export function hasClass(element, className) {
  return element.classList.contains(className);
}

export function setAttributes(element, attrs) {
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, value);
    }
  });
}

export function on(element, event, handler) {
  element.addEventListener(event, handler);
  return () => element.removeEventListener(event, handler);
}

export function onOnce(element, event, handler) {
  element.addEventListener(event, handler, { once: true });
}

export function query(selector, parent = document) {
  return parent.querySelector(selector);
}

export function queryAll(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function append(parent, ...children) {
  parent.append(...children);
}

export function prepend(parent, ...children) {
  parent.prepend(...children);
}

export function removeElement(element) {
  element?.remove?.();
}

export function clear(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function showElement(element) {
  element.style.display = '';
}

export function hideElement(element) {
  element.style.display = 'none';
}

export function isVisible(element) {
  return element.style.display !== 'none' && window.getComputedStyle(element).display !== 'none';
}

export function scrollToTop(element = window) {
  if (element === window) {
    window.scrollTo(0, 0);
  } else {
    element.scrollTop = 0;
  }
}

export function getViewportHeight() {
  return window.innerHeight || document.documentElement.clientHeight;
}

export function getScrollPosition() {
  return window.scrollY || document.documentElement.scrollTop;
}

export function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom > 0
  );
}

export function lazyLoadImage(img) {
  if (!img.dataset.src) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });
  
  observer.observe(img);
}
