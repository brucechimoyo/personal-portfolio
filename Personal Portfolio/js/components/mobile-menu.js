/* Mobile Menu Component */

import { query, queryAll, on } from '../utils/dom.js';
import { updateActiveNavItem } from './sidebar.js';

export function initMobileMenu() {
  const menuToggle = query('#mobile-menu-toggle');
  const mobileMenu = query('#mobile-menu');
  const mobileNavItems = queryAll('.mobile-nav-item');

  if (!menuToggle || !mobileMenu) return;

  // Toggle menu on button click
  on(menuToggle, 'click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    toggleMenu(!isExpanded);
  });

  // Close menu when a nav item is clicked
  mobileNavItems.forEach(item => {
    on(item, 'click', (e) => {
      e.preventDefault();
      
      // Update mobile nav active state
      updateActiveMobileNavItem(item);
      
      // Update desktop nav active state too
      const desktopItem = query(`.nav-item[href="${item.getAttribute('href')}"]`);
      if (desktopItem) {
        updateActiveNavItem(desktopItem);
      }

      // Navigate to the view
      const href = item.getAttribute('href');
      if (href) {
        window.location.hash = href.slice(1);
      }

      // Close menu after selection
      toggleMenu(false);
    });
  });
}

function toggleMenu(show) {
  const menuToggle = query('#mobile-menu-toggle');
  const mobileMenu = query('#mobile-menu');

  if (!menuToggle || !mobileMenu) return;

  if (show) {
    mobileMenu.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
  } else {
    mobileMenu.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
}

export function updateActiveMobileNavItem(item) {
  queryAll('.mobile-nav-item').forEach(el => {
    el.classList.remove('active');
  });
  item.classList.add('active');
}

export function setActiveMobileNavByView(view) {
  const item = query(`.mobile-nav-item[href="#${view}"]`);
  if (item) {
    updateActiveMobileNavItem(item);
  }
}

export function closeMobileMenu() {
  toggleMenu(false);
}
