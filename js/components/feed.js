/* Feed Component */

import { createCard, createCardSkeleton, createEmptyState } from './card.js';
import { createElement, append, clear, query } from '../utils/dom.js';
import { getPosts, getProjects, getCurrentFilter } from '../state.js';
import { initScrollAnimations } from '../utils/animations.js';

export function renderFeed(items = [], intro = '') {
  const feedContainer = query('#feed-container');
  if (!feedContainer) return;

  clear(feedContainer);

  if (!items || items.length === 0) {
    append(feedContainer, createEmptyState());
    return;
  }

  const section = createElement('section', 'feed-list view-enter');
  if (intro) {
    const header = createElement('div', 'feed-list-intro');
    header.innerHTML = intro;
    append(section, header);
  }
  const list = createElement('div', 'feed-cards');
  items.forEach((item, index) => append(list, createCard(item, index)));
  append(section, list);
  append(feedContainer, section);
  initScrollAnimations();
}

export function renderFeedSkeleton(count = 3) {
  const feedContainer = query('#feed-container');
  if (!feedContainer) return;

  clear(feedContainer);

  for (let i = 0; i < count; i++) {
    append(feedContainer, createCardSkeleton());
  }
}

export function filterFeedByTag(items = [], tag) {
  if (!tag) return items;
  return items.filter(item => 
    (item.tags || []).some(t => t.toLowerCase() === tag.toLowerCase())
  );
}

export function searchFeed(items = [], query) {
  if (!query) return items;
  
  const lowerQuery = query.toLowerCase();
  return items.filter(item =>
    (item.title || '').toLowerCase().includes(lowerQuery) ||
    (item.description || '').toLowerCase().includes(lowerQuery) ||
    (item.tags || []).some(tag => String(tag).toLowerCase().includes(lowerQuery))
  );
}

export function renderFilteredFeed(allItems, filter) {
  if (!filter) {
    renderFeed(allItems);
    return;
  }

  const filtered = filterFeedByTag(allItems, filter);
  
  if (filtered.length === 0) {
    const feedContainer = query('#feed-container');
    if (feedContainer) {
      clear(feedContainer);
      append(feedContainer, createEmptyState('🏷️', `No items with tag "${filter}"`, 'Try a different tag'));
    }
  } else {
    renderFeed(filtered, `<span>Tagged <strong>#${filter}</strong></span><span>${filtered.length} ${filtered.length === 1 ? 'result' : 'results'}</span>`);
  }
}

export function getAllTags(items = []) {
  const tagsSet = new Set();
  items.forEach(item => {
    (item.tags || []).forEach(tag => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
}

export function getFeaturedItems(items = []) {
  return items.filter(item => item.featured).slice(0, 3);
}
