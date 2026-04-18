/* Client-Side Router */

import { setCurrentView, getCurrentView } from './state.js';

export function initRouter(routes) {
  window.__routes = routes;
  
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'home';
    const [view, param] = hash.split('/');
    
    handleRoute(view, param, routes);
  });

  const hash = window.location.hash.slice(1) || 'home';
  const [view, param] = hash.split('/');
  handleRoute(view, param, routes);
}

function handleRoute(view, param, routes) {
  setCurrentView(view);
  
  // Scroll to top when changing routes
  window.scrollTo(0, 0);
  
  const route = routes[view];
  if (route && typeof route === 'function') {
    route(param);
  }
}

export function navigateTo(view, param = '') {
  const hash = param ? `#${view}/${param}` : `#${view}`;
  window.location.hash = hash;
}

export function getCurrentRoute() {
  return window.location.hash.slice(1) || 'home';
}

export function getRouteParam() {
  const hash = window.location.hash.slice(1) || '';
  const [, param] = hash.split('/');
  return param || null;
}
