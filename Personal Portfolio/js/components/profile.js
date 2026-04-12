/* Profile Header Component */

import { formatNumber } from '../utils/format.js';
import { createElement, append, html } from '../utils/dom.js';

export function renderProfileHeader(profile) {
  if (!profile) return null;

  const container = createElement('article', 'profile-header');
  
  const content = html(`
    <div class="profile-content">
      <img 
        src="img/hero.jpeg" 
        alt="${profile.name} profile picture" 
        class="profile-avatar"
        loading="lazy"
      />
      <h1 class="profile-name">${profile.name}</h1>
      <p class="profile-bio"></p>
      
      <div class="profile-stats">
        ${(profile.stats || [])
          .map(stat => `
            <div class="profile-stat">
              <span class="profile-stat-value">${formatNumber(stat.value)}</span>
              <span class="profile-stat-label">${stat.label}</span>
            </div>
          `)
          .join('')}
      </div>

      <div class="profile-links">
        ${(profile.social || [])
          .map(link => `
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="profile-link">
              ${link.name}
            </a>
          `)
          .join('')}
      </div>
    </div>
  `);

  append(container, content);
  
  setTimeout(() => {
    const bioElement = container.querySelector('.profile-bio');
    if (bioElement && profile.bio && window.__initTypingEffect) {
      window.__initTypingEffect(bioElement, profile.bio);
    }
  }, 100);
  
  return container;
}

export function updateProfileHeader(profile) {
  const existing = document.querySelector('#profile-header');
  const newHeader = renderProfileHeader(profile);
  
  if (existing && newHeader) {
    existing.replaceWith(newHeader);
  } else if (newHeader) {
    const feed = document.querySelector('#feed');
    if (feed) feed.prepend(newHeader);
  }
}

export function createProfileSkeleton() {
  const container = createElement('article', 'profile-header');
  const content = html(`
    <div class="profile-content">
      <div class="skeleton-avatar skeleton-avatar-circular" style="width: 88px; height: 88px; margin-bottom: var(--spacing-lg);"></div>
      <div class="skeleton-line" style="width: 60%; height: 28px; margin-bottom: var(--spacing-md); margin-left: auto; margin-right: auto;"></div>
      <div class="skeleton-line" style="width: 80%; height: 16px; margin-bottom: var(--spacing-lg); margin-left: auto; margin-right: auto;"></div>
      
      <div class="profile-stats" style="margin-bottom: var(--spacing-lg);">
        ${Array(3).fill(0).map(() => `
          <div class="profile-stat" style="text-align: center;">
            <div class="skeleton-line" style="width: 40px; height: 20px; margin-bottom: var(--spacing-xs); margin-left: auto; margin-right: auto;"></div>
            <div class="skeleton-line" style="width: 60px; height: 12px; margin-left: auto; margin-right: auto;"></div>
          </div>
        `).join('')}
      </div>

      <div class="profile-links">
        ${Array(4).fill(0).map(() => `
          <div class="skeleton-line" style="width: 80px; height: 32px; border-radius: 20px;"></div>
        `).join('')}
      </div>
    </div>
  `);
  append(container, content);
  return container;
}
