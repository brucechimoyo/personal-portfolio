/* Sidebar Navigation Component */

import { createElement, append, query, queryAll, on } from '../utils/dom.js';
import { getCurrentView } from '../state.js';

export function initSidebar() {
  const navItems = queryAll('.nav-item');
  
  navItems.forEach(item => {
    on(item, 'click', (e) => {
      e.preventDefault();
      updateActiveNavItem(item);
      
      // Navigate to the view
      const href = item.getAttribute('href');
      if (href) {
        window.location.hash = href.slice(1); // Remove the # from href
      }
    });
  });

  // Set initial active state
  const currentView = getCurrentView();
  const activeItem = query(`.nav-item[href="#${currentView}"]`);
  if (activeItem) {
    updateActiveNavItem(activeItem);
  }
}

export function updateActiveNavItem(item) {
  queryAll('.nav-item').forEach(el => {
    el.classList.remove('active');
  });
  item.classList.add('active');
}

export function setActiveNavByView(view) {
  const item = query(`.nav-item[href="#${view}"]`);
  if (item) {
    updateActiveNavItem(item);
  }
}

export function navigateToView(view) {
  window.location.hash = `#${view}`;
}
