/* Right Sidebar Component */

import { createElement, append, clear, query, html } from '../utils/dom.js';
import { getAllTags, getFeaturedItems } from './feed.js';

export function renderRightbar(projects = [], popularTags = [], skillTags = [], socials = []) {
  console.log('Rendering rightbar - projects:', projects.length, 'popularTags:', popularTags, 'skillTags:', skillTags, 'socials:', socials);
  const rightbarContent = query('#rightbar-content');
  if (!rightbarContent) {
    console.warn('Rightbar content element not found');
    return;
  }

  try {
    clear(rightbarContent);

  // Latest Projects Widget - Top 3 latest
  const latestProjects = projects
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 3);
  
  if (latestProjects.length > 0) {
    const latestWidget = html(`
      <div class="rightbar-widget">
        <h3 class="widget-title">Latest Projects</h3>
        <div class="featured-projects-list">
          ${latestProjects
            .map(project => `
              <a href="#project/${project.id}" class="featured-project">
                <div class="featured-project-title">${project.title}</div>
                <div class="featured-project-desc">${project.description}</div>
              </a>
            `)
            .join('')}
        </div>
      </div>
    `);
    append(rightbarContent, latestWidget);
  }

  // Tags Widget - use Contentful popularTags or fallback to empty
  const displayTags = popularTags.length > 0 ? popularTags : [];
  if (displayTags.length > 0) {
    const tagsWidget = html(`
      <div class="rightbar-widget">
        <h3 class="widget-title">Popular Tags</h3>
        <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap;">
          ${displayTags
            .map(tag => `
              <a href="#tag/${tag}" class="tag">
                ${tag}
              </a>
            `)
            .join('')}
        </div>
      </div>
    `);
    append(rightbarContent, tagsWidget);
  }

  // Skills Widget - use Contentful skillTags or fallback to hardcoded
  const displaySkills = skillTags.length > 0 ? skillTags : ['JavaScript', 'TypeScript', 'React', 'Vue.js', 'CSS', 'Performance', 'Accessibility', 'Web APIs'];
  const skillsWidget = html(`
    <div class="rightbar-widget">
      <h3 class="widget-title">Skills</h3>
      <div class="skill-grid">
        ${displaySkills.slice(0, 8).map(skill => `
          <div class="skill-item">${skill}</div>
        `).join('')}
      </div>
    </div>
  `);
  append(rightbarContent, skillsWidget);

  // Links Widget - use Contentful socials or fallback to hardcoded
  const displayLinks = socials.length > 0 ? socials : [
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'LinkedIn', url: 'https://linkedin.com' },
    { name: 'Twitter', url: 'https://twitter.com' },
    { name: 'Email', url: 'mailto:hello@example.com' }
  ];
  const linksWidget = html(`
    <div class="rightbar-widget">
      <h3 class="widget-title">Links</h3>
      <ul class="widget-list">
        ${displayLinks.map(link => `
          <li class="widget-item">
            <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="widget-item-link">
              ${link.name} →
            </a>
          </li>
        `).join('')}
      </ul>
    </div>
  `);
    append(rightbarContent, linksWidget);
  } catch (error) {
    console.error('Error rendering rightbar:', error);
  }
}

export function updateRightbar(projects, popularTags = [], skillTags = [], socials = []) {
  renderRightbar(projects, popularTags, skillTags, socials);
}

export function renderRightbarSkeleton() {
  const rightbarContent = query('#rightbar-content');
  if (!rightbarContent) {
    console.warn('Rightbar content element not found');
    return;
  }

  try {

  clear(rightbarContent);

  const skeleton = html(`
    <div class="rightbar-widget">
      <h3 class="widget-title">Latest Projects</h3>
      <div class="featured-projects-list">
        ${Array(3).fill(0).map(() => `
          <div style="padding: var(--spacing-md); background: var(--color-bg-secondary); border-radius: 8px; margin-bottom: var(--spacing-md); border-left: 3px solid transparent;">
            <div class="skeleton-line" style="width: 70%; height: 14px; margin-bottom: var(--spacing-sm);"></div>
            <div class="skeleton-line" style="width: 100%; height: 12px; margin-bottom: var(--spacing-xs);"></div>
            <div class="skeleton-line" style="width: 90%; height: 12px;"></div>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="rightbar-widget">
      <h3 class="widget-title">Popular Tags</h3>
      <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap;">
        ${Array(12).fill(0).map(() => `
          <div class="skeleton-line" style="width: 60px; height: 28px; border-radius: 20px; display: inline-block;"></div>
        `).join('')}
      </div>
    </div>
    <div class="rightbar-widget">
      <h3 class="widget-title">Skills</h3>
      <div class="skill-grid">
        ${Array(8).fill(0).map(() => `
          <div class="skeleton-line" style="width: 100%; height: 36px; border-radius: 8px;"></div>
        `).join('')}
      </div>
    </div>
    <div class="rightbar-widget">
      <h3 class="widget-title">Links</h3>
      <ul class="widget-list">
        ${Array(4).fill(0).map(() => `
          <li class="widget-item">
            <div class="skeleton-line" style="width: 85%; height: 16px;"></div>
          </li>
        `).join('')}
      </ul>
    </div>
  `);
    append(rightbarContent, skeleton);
    console.log('Rightbar skeleton rendered successfully');
  } catch (error) {
    console.error('Error rendering rightbar skeleton:', error);
  }
}
