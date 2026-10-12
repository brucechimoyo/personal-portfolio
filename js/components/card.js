/* Card Component - Reusable for Posts and Projects */

import { formatDate } from '../utils/format.js';
import { createElement, append, html } from '../utils/dom.js';
import { icon } from '../utils/icons.js';

export function isProjectItem(item) {
  return item.type === 'project';
}

export function getItemHref(item) {
  return `#${isProjectItem(item) ? 'project' : 'article'}/${item.id}`;
}

function relativeDate(item) {
  const raw = item.date || item.createdAt;
  if (!raw) return '';
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? '' : formatDate(date);
}

export function createCard(item, index = 0) {
  const card = createElement('article', 'card observe-fade-in');
  card.setAttribute('data-tilt', '3');
  card.style.animationDelay = `${Math.min(index, 6) * 80}ms`;

  const isProject = isProjectItem(item);
  const href = getItemHref(item);
  const when = relativeDate(item);

  card.innerHTML = `
      <img
        src="img/hero.jpeg"
        alt=""
        class="card-avatar"
        width="44"
        height="44"
        loading="lazy"
      />
      <div class="card-body">
        <div class="card-header">
          <span class="card-author">${item.author || 'Bruce Takura Chimoyo'}</span>
          <span class="card-badge">${isProject ? 'Project' : 'Story'}</span>
          ${when ? `<span class="card-date">· ${when}</span>` : ''}
        </div>

        <h3 class="card-title"><a href="${href}" class="card-link">${item.title}</a></h3>
        <p class="card-description">${item.description || ''}</p>

        ${item.image ? `
          <div class="card-media">
            <img src="${item.image}" alt="" class="card-image" loading="lazy" />
          </div>
        ` : ''}

        ${(item.tags || []).length ? `
          <div class="card-tags">
            ${item.tags.map(tag => `<a href="#tag/${tag}" class="tag" data-tag="${tag}">${tag}</a>`).join('')}
          </div>
        ` : ''}

        <div class="card-actions">
          ${!isProject && item.readTime ? `<span class="card-meta-item">${icon('stories', 16)}${item.readTime}</span>` : ''}
          <button type="button" class="card-action-btn" data-share="${href}" data-share-title="${(item.title || '').replace(/"/g, '&quot;')}" aria-label="Share ${(item.title || '').replace(/"/g, '&quot;')}">
            ${icon('share', 16)}<span>Share</span>
          </button>
          <a href="${href}" class="card-action-btn push" tabindex="-1">
            <span>${isProject ? 'View project' : 'Read story'}</span>${icon('arrowUpRight', 16)}
          </a>
        </div>
      </div>
  `;

  return card;
}

export function createCardSkeleton() {
  const card = createElement('div', 'skeleton-card');

  const skeleton = html(`
    <div>
      <div style="display: flex; gap: var(--spacing-md);">
        <div class="skeleton-avatar skeleton-avatar-circular" style="width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;"></div>
        <div style="flex: 1;">
          <div class="skeleton-line" style="width: 45%; height: 14px; margin-bottom: 10px;"></div>
          <div class="skeleton-line" style="width: 80%; height: 20px; margin-bottom: 10px;"></div>
          <div class="skeleton-line" style="width: 100%; height: 14px; margin-bottom: 6px;"></div>
          <div class="skeleton-line" style="width: 90%; height: 14px;"></div>
        </div>
      </div>
    </div>
  `);

  append(card, skeleton);
  return card;
}

export function createProjectsListSkeleton(count = 3) {
  const skeletons = [];
  for (let i = 0; i < count; i++) {
    skeletons.push(createCardSkeleton());
  }
  return skeletons;
}

export function createArticlesListSkeleton(count = 3) {
  const skeletons = [];
  for (let i = 0; i < count; i++) {
    skeletons.push(createCardSkeleton());
  }
  return skeletons;
}

export function createEmptyState(icon = '📭', title = 'Nothing here yet', message = 'Check back soon!') {
  return html(`
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <h3 class="empty-state-title">${title}</h3>
      <p class="empty-state-text">${message}</p>
    </div>
  `);
}
