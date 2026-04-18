/* Card Component - Reusable for Posts and Projects */

import { formatDate, getReadingTime } from '../utils/format.js';
import { createElement, append, html } from '../utils/dom.js';

export function createCard(item) {
  const card = createElement('article', 'card observe-fade-in');
  
  const isProject = item.type === 'project';
  const dateStr = formatDate(new Date(item.createdAt));
  const readTime = !isProject ? getReadingTime(item.content) : '';

  const cardHTML = html(`
    <div class="card-header">
      <img 
        src="${item.avatar || 'https://i.pravatar.cc/48?u=' + (item.author || 'project')}" 
        alt="${item.author || item.title} avatar" 
        class="card-avatar"
        loading="lazy"
      />
      <div class="card-meta">
        <div class="card-author">${item.author || 'Project'}</div>
        <div class="card-date">${dateStr} ${readTime ? '· ' + readTime : ''}</div>
      </div>
    </div>

    <h3 class="card-title">${item.title}</h3>
    
    ${item.image ? `
      <img 
        src="${item.image}" 
        alt="${item.title}" 
        class="card-image"
        loading="lazy"
      />
    ` : ''}

    <p class="card-description">${item.description}</p>

    <div class="card-footer">
      <div class="card-tags">
        ${(item.tags || [])
          .map(tag => `
            <a href="#tag/${tag}" class="tag" data-tag="${tag}">
              ${tag}
            </a>
          `)
          .join('')}
      </div>
      <a href="${item.link || '#'}" class="card-action">
        ${isProject ? 'View Project →' : 'Read More →'}
        →
      </a>
    </div>
  `);

  append(card, cardHTML);
  return card;
}

export function createCardSkeleton() {
  const card = createElement('div', 'skeleton-card');
  
  const skeleton = html(`
    <div style="display: flex; gap: var(--spacing-md);">
      <div class="skeleton-avatar skeleton-avatar-circular"></div>
      <div style="flex: 1;">
        <div class="skeleton-line" style="width: 60%;"></div>
        <div class="skeleton-line" style="width: 40%; height: 12px;"></div>
      </div>
    </div>
    <div class="skeleton-line" style="margin-top: var(--spacing-md); height: 20px; width: 80%;"></div>
    <div class="skeleton-line" style="margin-top: var(--spacing-sm); height: 16px; width: 100%;"></div>
    <div class="skeleton-line" style="margin-top: var(--spacing-sm); height: 16px; width: 90%;"></div>
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
