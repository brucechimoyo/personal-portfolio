/* Profile Header Component */

import { formatNumber } from '../utils/format.js';
import { createElement, append, html } from '../utils/dom.js';
import { icon, socialIcon } from '../utils/icons.js';
import { mountGlobe } from '../effects/globe.js';
import { initCountUp } from '../effects/interactions.js';

let destroyGlobe = null;

/* Best "contact me" link: LinkedIn, then email, then the first social link */
export function getPrimaryContact(socials = []) {
  const find = (needle) => socials.find(s => `${s.name} ${s.url}`.toLowerCase().includes(needle));
  return find('linkedin') || find('mailto') || find('email') || socials[0] || null;
}

function renderStat(stat) {
  const numeric = typeof stat.value === 'number' ? stat.value : parseFloat(stat.value);
  const display = Number.isFinite(numeric) ? formatNumber(numeric) : stat.value;
  const countAttrs = Number.isFinite(numeric) && numeric < 1000
    ? `data-count="${numeric}" data-display="${display}"`
    : '';
  return `
    <div class="profile-stat">
      <span class="profile-stat-value" ${countAttrs}>${countAttrs ? '0' : display}</span>
      <span class="profile-stat-label">${stat.label}</span>
    </div>
  `;
}

export function renderProfileHeader(profile) {
  if (!profile) return null;

  const socials = profile.social || [];
  const contact = getPrimaryContact(socials);
  const container = createElement('article', 'profile-header');

  const content = html(`
    <div class="profile-card">
      <div class="profile-cover">
        <canvas class="profile-globe" aria-hidden="true"></canvas>
        <span class="profile-cover-chip"><span class="pulse"></span>~/portfolio — live</span>
      </div>
      <div class="profile-content">
        <div class="profile-row">
          <div class="profile-avatar-wrap" data-tilt="8">
            <span class="profile-avatar-ring" aria-hidden="true"></span>
            <img
              src="img/hero.jpeg"
              alt="${profile.name} profile picture"
              class="profile-avatar no-lazy"
              width="150"
              height="150"
              style="max-width: 150px; max-height: 150px;"
              decoding="async"
            />
          </div>
          <div class="profile-actions">
            ${socials.map(link => `
              <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="social-button" data-magnetic aria-label="${link.name}" title="${link.name}">
                ${socialIcon(link, 18)}
              </a>
            `).join('')}
            ${contact ? `
              <a href="${contact.url}" target="_blank" rel="noopener noreferrer" class="btn-glow" data-magnetic aria-label="Let's talk">
                ${icon('send', 16)}<span>Let's talk</span>
              </a>
            ` : ''}
          </div>
        </div>

        <h1 class="profile-name">${profile.name}</h1>
        <p class="profile-bio"></p>

        <div class="profile-stats">
          ${(profile.stats || []).map(renderStat).join('')}
        </div>
      </div>
    </div>
  `);

  append(container, content);

  requestAnimationFrame(() => {
    if (destroyGlobe) destroyGlobe();
    destroyGlobe = mountGlobe(container.querySelector('.profile-globe'));
    initCountUp(container);
  });

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
    <div class="profile-card">
      <div class="profile-cover"></div>
      <div class="profile-content">
        <div class="profile-row">
          <div class="skeleton-avatar skeleton-avatar-circular" style="width: var(--avatar-size); height: var(--avatar-size); max-width: 150px; max-height: 150px; border-radius: 50%; border: 4px solid var(--surface-solid);"></div>
        </div>
        <div class="skeleton-line" style="width: 55%; height: 28px; margin-bottom: 12px;"></div>
        <div class="skeleton-line" style="width: 80%; height: 16px; margin-bottom: 20px;"></div>
        <div class="profile-stats">
          ${Array(3).fill(0).map(() => `
            <div class="profile-stat">
              <div class="skeleton-line" style="width: 40px; height: 22px; margin-bottom: 6px;"></div>
              <div class="skeleton-line" style="width: 90px; height: 12px;"></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `);
  append(container, content);
  return container;
}
