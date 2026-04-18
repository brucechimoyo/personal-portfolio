/* Feed Component */

import { createCard, createCardSkeleton, createEmptyState } from './card.js';
import { createElement, append, clear, query } from '../utils/dom.js';
import { getPosts, getProjects, getCurrentFilter } from '../state.js';

export function renderFeed(items = []) {
  const feedContainer = query('#feed-container');
  if (!feedContainer) return;

  clear(feedContainer);

  if (!items || items.length === 0) {
    append(feedContainer, createEmptyState());
    return;
  }

  items.forEach(item => {
    const card = createCard(item);
    append(feedContainer, card);
  });
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
    item.title.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery) ||
    (item.tags || []).some(tag => tag.toLowerCase().includes(lowerQuery))
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
    renderFeed(filtered);
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
