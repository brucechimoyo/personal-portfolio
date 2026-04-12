/* Theme Management */

import { getTheme, setTheme, toggleTheme as toggleThemeState, getColorAccent, setColorAccent, applyColorAccent } from './state.js';
import { query, queryAll, on } from './utils/dom.js';

function updateColorIndicators() {
  const colorAccent = getColorAccent();
  const colorMap = {
    blue: '#1d9bf0',
    orange: '#ff9500',
    green: '#17bf63',
    red: '#e74c3c',
    purple: '#9b59b6'
  };
  const color = colorMap[colorAccent] || colorMap.blue;
  const indicators = queryAll('.color-indicator');
  indicators.forEach(indicator => {
    indicator.style.backgroundColor = color;
  });
}

export function initTheme() {
  const theme = getTheme();
  applyTheme(theme);
  
  const colorAccent = getColorAccent();
  applyColorAccent(colorAccent);
  updateColorIndicators();
  
  const themeButtons = queryAll('.theme-toggle, .theme-toggle-desktop');
  themeButtons.forEach(btn => {
    on(btn, 'click', toggleTheme);
  });

  // Color toggle
  const colorToggle = query('#color-toggle');
  const colorMenu = query('#color-menu');
  const colorToggleMobile = query('#color-toggle-mobile');
  const colorMenuMobile = query('#color-menu-mobile');
  
  const setupColorToggle = (toggle, menu) => {
    if (toggle && menu) {
      on(toggle, 'click', (e) => {
        e.stopPropagation();
        menu.toggleAttribute('hidden');
      });

      menu.querySelectorAll('.color-option').forEach(option => {
        on(option, 'click', (e) => {
          e.stopPropagation();
          const color = option.dataset.color;
          setColorAccent(color);
          updateColorIndicators();
          menu.setAttribute('hidden', '');
        });
      });

      on(document, 'click', () => {
        menu.setAttribute('hidden', '');
      });
    }
  };
  
  setupColorToggle(colorToggle, colorMenu);
  setupColorToggle(colorToggleMobile, colorMenuMobile);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      const theme = e.matches ? 'dark' : 'light';
      applyTheme(theme);
    }
  });
}

export function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

export function toggleTheme() {
  toggleThemeState();
  const newTheme = getTheme();
  applyTheme(newTheme);
}

export function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
