/* Main Application Entry Point */

import { initTheme } from './theme.js';
import { initRouter } from './router.js';
import { initSidebar, setActiveNavByView } from './components/sidebar.js';
import { initMobileMenu, setActiveMobileNavByView } from './components/mobile-menu.js';
import { renderFeed, renderFeedSkeleton, renderFilteredFeed, searchFeed } from './components/feed.js';
import { createCard, getItemHref } from './components/card.js';
import { renderRightbar, renderRightbarSkeleton } from './components/rightbar.js';
import { renderProfileHeader, createProfileSkeleton, getPrimaryContact } from './components/profile.js';
import { showErrorState, createExperienceDetailSkeleton, createProjectDetailSkeleton, createArticleDetailSkeleton } from './components/skeleton.js';
import { optimizeImages } from './utils/image-optimization.js';
import { deferNonCriticalScripts } from './utils/code-splitting.js';
import { 
  getPosts, 
  getProjects, 
  getProfile,
  setPosts, 
  setProjects, 
  setProfile,
  setLoading,
  setLoadingHome,
  setLoadingProjects,
  setLoadingArticles,
  isLoadingHome,
  isLoadingProjects,
  isLoadingArticles,
  subscribe,
  getCurrentFilter,
  getCurrentView,
  setCurrentFilter
} from './state.js';
import { 
  fetchPosts, 
  fetchProjects,
  fetchHeroText,
  fetchAboutMeStats,
  fetchAboutMeContent,
  fetchSocials,
  fetchExpertise,
  fetchExperience,
  fetchAcknowledgements,
  fetchPopularTags,
  fetchSkillTags,
  testConnection,
  getMockProfile,
  getMockPosts,
  getMockProjects,
  getMockTestimonials,
  getMockTimeline,
  getMockSkillsDetailed
} from './api/contentful.js';
import { query, queryAll, on, addClass, removeClass } from './utils/dom.js';
import { 
  fadeInPageSection, 
  initScrollAnimations
} from './utils/animations.js';
import { parseMarkdown, parseRichText } from './utils/markdown.js';
import { icon } from './utils/icons.js';
import { initPointerEffects, initScrollProgress, shareLink, toast } from './effects/interactions.js';


// Typing effect for hero text
function initTypingEffect(element, text) {
  if (!element) return;
  const typeSpeed = 3000 / text.length;
  const displayDuration = 8000;
  const eraseSpeed = 1500 / text.length;
  let charIndex = 0;
  let isTyping = true;
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  cursor.textContent = '|';
  cursor.style.cssText = 'color: var(--color-accent); animation: blink 0.7s infinite; margin-left: 2px;';
  
  const style = document.createElement('style');
  if (!document.querySelector('style[data-typing-cursor]')) {
    style.setAttribute('data-typing-cursor', 'true');
    style.textContent = `
      @keyframes blink {
        0%, 49% { opacity: 1; }
        50%, 100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  function type() {
    if (charIndex < text.length) {
      element.textContent = text.substring(0, charIndex + 1);
      element.appendChild(cursor);
      charIndex++;
      setTimeout(type, typeSpeed);
    } else {
      isTyping = false;
      setTimeout(erase, displayDuration);
    }
  }
  
  function erase() {
    if (charIndex > 1) {
      element.textContent = text.substring(0, charIndex - 1);
      element.appendChild(cursor);
      charIndex--;
      setTimeout(erase, eraseSpeed);
    } else {
      element.textContent = text.substring(0, 1);
      element.appendChild(cursor);
      isTyping = true;
      setTimeout(type, 500);
    }
  }
  
  type();
}

window.__initTypingEffect = initTypingEffect;

// 3D testimonial carousel
const carousels = {};
function initCarousel(name) {
  if (carousels[name]) clearInterval(carousels[name].interval);
  const container = document.querySelector('[data-carousel="' + name + '"]');
  if (!container) return;
  const slides = Array.from(container.querySelectorAll('.testimonial-slide'));
  const dots = Array.from(container.querySelectorAll('.carousel-dot'));
  const count = slides.length;
  if (!count) return;

  const state = { interval: null, current: 0 };
  carousels[name] = state;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const show = (index) => {
    state.current = (index + count) % count;
    const prev = (state.current - 1 + count) % count;
    const next = (state.current + 1) % count;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === state.current);
      slide.classList.toggle('is-prev', count > 1 && i === prev && i !== state.current);
      slide.classList.toggle('is-next', count > 2 && i === next);
      slide.setAttribute('aria-hidden', i === state.current ? 'false' : 'true');
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === state.current);
      dot.setAttribute('aria-current', i === state.current ? 'true' : 'false');
    });
  };

  const stop = () => clearInterval(state.interval);
  const start = () => {
    stop();
    if (count < 2 || reduceMotion) return;
    state.interval = setInterval(() => {
      if (!container.isConnected) return stop();
      show(state.current + 1);
    }, 7000);
  };

  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));
  container.querySelector('.carousel-arrow.prev')?.addEventListener('click', () => { show(state.current - 1); start(); });
  container.querySelector('.carousel-arrow.next')?.addEventListener('click', () => { show(state.current + 1); start(); });
  container.addEventListener('mouseenter', stop);
  container.addEventListener('mouseleave', start);
  container.addEventListener('focusin', stop);
  container.addEventListener('focusout', start);

  let startX = null;
  container.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  container.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 40) { show(state.current + (diff > 0 ? 1 : -1)); start(); }
    startX = null;
  });

  show(0);
  start();
}

// Sticky feed header title (social-app style)
const BASE_TITLE = 'Bruce Takura Chimoyo - Developer Portfolio';
function setViewTitle(title, subtitle = '') {
  const titleEl = query('#view-title');
  const subtitleEl = query('#view-subtitle');
  if (titleEl && titleEl.textContent !== title) {
    titleEl.textContent = title;
    titleEl.style.animation = 'none';
    void titleEl.offsetWidth;
    titleEl.style.animation = '';
  }
  if (subtitleEl) subtitleEl.textContent = subtitle;
  document.title = title === 'Home' ? BASE_TITLE : `${title} · Bruce Takura Chimoyo`;
}

function hideProfileHeader() {
  const profileHeader = query('#profile-header');
  if (profileHeader) {
    profileHeader.style.display = 'none';
    profileHeader.classList.remove('active');
  }
}

function rerunCurrentRoute() {
  const hash = window.location.hash.slice(1) || 'home';
  const [view, param] = hash.split('/');
  const routes = window.__routes;
  if (routes && routes[view]) routes[view](param);
}

// Point the sidebar "Let's talk" CTA at the best available contact link
function updateContactLinks(socials = []) {
  const contact = getPrimaryContact(socials);
  const cta = query('#nav-cta');
  if (!cta) return;
  if (contact) {
    cta.href = contact.url;
  } else {
    cta.hidden = true;
  }
}

// On tablets/phones the search box lives in a collapsible slot at the top of the feed;
// on desktop it sits at the top of the right sidebar.
const desktopLayout = window.matchMedia('(min-width: 64rem)');

function setCompactSearchOpen(open) {
  const slot = query('#compact-search');
  if (!slot) return;
  slot.hidden = !open;
  queryAll('[data-search-toggle]').forEach(btn => btn.setAttribute('aria-expanded', String(open)));
  if (open) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    query('#site-search')?.focus({ preventScroll: true });
  }
}

function placeSearchBox() {
  const box = query('.search-box');
  const slot = query('#compact-search');
  const rightbar = query('#rightbar');
  if (!box || !slot || !rightbar) return;
  if (desktopLayout.matches) {
    rightbar.prepend(box);
    setCompactSearchOpen(false);
  } else {
    slot.appendChild(box);
  }
}

function focusSearch() {
  if (desktopLayout.matches) query('#site-search')?.focus();
  else setCompactSearchOpen(true);
}

// Live search over projects and stories
function initSearch() {
  const input = query('#site-search');
  if (!input) return;
  let timer;

  placeSearchBox();
  desktopLayout.addEventListener('change', placeSearchBox);
  queryAll('[data-search-toggle]').forEach(btn => {
    btn.addEventListener('click', () => setCompactSearchOpen(query('#compact-search').hidden));
  });

  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => runSearch(input.value), 160);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      runSearch('');
      input.blur();
      if (!desktopLayout.matches) setCompactSearchOpen(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    const active = document.activeElement;
    const typing = active && (/^(input|textarea|select)$/i.test(active.tagName) || active.isContentEditable);
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      focusSearch();
    }
  });

  window.addEventListener('hashchange', () => {
    if (input.value) input.value = '';
  });
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function runSearch(value) {
  const term = value.trim();
  if (!term) {
    rerunCurrentRoute();
    return;
  }
  hideProfileHeader();
  setWideLayout(true);
  setViewTitle('Search', `“${term}”`);
  const results = searchFeed([
    ...allProjects.map(p => ({ ...p, type: 'project' })),
    ...allPosts
  ], term);
  if (!results.length) {
    const feedContainer = query('#feed-container');
    if (feedContainer) {
      feedContainer.innerHTML = `
        <div class="empty-state view-enter">
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">No results for “${escapeHtml(term)}”</h3>
          <p class="empty-state-text">Try a technology, tag or project name.</p>
        </div>`;
    }
    return;
  }
  renderFeed(results, `<span>Results for <strong>“${escapeHtml(term)}”</strong></span><span>${results.length} ${results.length === 1 ? 'match' : 'matches'}</span>`);
}

// Share buttons on cards (native share sheet on touch, clipboard elsewhere)
function initShareButtons() {
  document.addEventListener('click', async (e) => {
    const button = e.target.closest('[data-share]');
    if (!button) return;
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}${button.dataset.share}`;
    toast(await shareLink(url, button.dataset.shareTitle || document.title));
  });
}

// Render a list of feed cards with a small intro line
function renderCardList(items, intro) {
  const feedContainer = query('#feed-container');
  if (!feedContainer) return;
  feedContainer.innerHTML = `
    <section class="feed-list">
      <div class="feed-list-intro">${intro}</div>
      <div class="feed-cards"></div>
    </section>
  `;
  const list = feedContainer.querySelector('.feed-cards');
  items.forEach((item, index) => list.appendChild(createCard(item, index)));
}

function renderCardListSkeleton() {
  const feedContainer = query('#feed-container');
  if (!feedContainer) return;
  feedContainer.innerHTML = `
    <section class="feed-list">
      <div class="feed-cards">
        ${Array(3).fill(0).map(() => `
          <div class="skeleton-card">
            <div style="display: flex; gap: var(--spacing-md);">
              <div class="skeleton-avatar" style="width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;"></div>
              <div style="flex: 1;">
                <div class="skeleton-line" style="width: 45%; height: 14px; margin-bottom: 10px;"></div>
                <div class="skeleton-line" style="width: 80%; height: 20px; margin-bottom: 10px;"></div>
                <div class="skeleton-line" style="width: 100%; height: 14px; margin-bottom: 6px;"></div>
                <div class="skeleton-line" style="width: 90%; height: 14px;"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

// Application state
let allPosts = [];
let allProjects = [];

// Initialize application
async function initApp() {
  // Initialize theme system
  initTheme();

  // Optimize images early
  optimizeImages();

  // Defer non-critical scripts
  deferNonCriticalScripts();



  // Initialize navigation
  initSidebar();
  initMobileMenu();

  // Pointer effects (3D tilt, spotlight, magnetic), scroll progress, search and share
  initPointerEffects();
  initScrollProgress();
  initSearch();
  initShareButtons();

  // Subscribe to state changes
  subscribe(() => {});
  const routes = {
  home: () => showHomeView(),
  projects: () => showProjectsView(),
  articles: () => showArticlesView(),
  tag: (tag) => showTagView(tag),
  project: (id) => showProjectDetailView(id),
  article: (id) => showArticleDetailView(id),
  experience: (id) => showExperienceDetailView(id)
  };

  initRouter(routes);

  // Load initial data
  await loadContent();

   // Initialize scroll animations
   setTimeout(() => {
     initScrollAnimations();
   }, 100);

   // Back to top button (visibility + progress ring handled by initScrollProgress)
   const backToTopBtn = query('#back-to-top');
   if (backToTopBtn) {
     on(backToTopBtn, 'click', () => {
       window.scrollTo({ top: 0, behavior: 'smooth' });
     });
   }

   // Initialize support chat widget
   const supportToggleDesktop = query('#support-toggle-desktop');
   const supportToggleMobile = query('#support-toggle');
   const supportChat = query('#support-chat');
   const supportClose = query('#support-close');
   const supportForm = query('#support-form');
   const supportThanks = query('#support-thanks');

   // Ensure chat starts closed
   if (supportChat) {
     supportChat.classList.remove('open');
     supportChat.style.visibility = 'hidden';
     supportChat.style.opacity = '0';
   }
   if (supportToggleDesktop) {
     supportToggleDesktop.classList.remove('active');
   }
   if (supportToggleMobile) {
     supportToggleMobile.classList.remove('active');
   }

    const toggleSupport = () => {
      if (supportChat && supportChat.classList.contains('open')) {
        removeClass(supportChat, 'open');
        if (supportToggleDesktop) removeClass(supportToggleDesktop, 'active');
        if (supportToggleMobile) removeClass(supportToggleMobile, 'active');
      } else {
        if (supportChat) addClass(supportChat, 'open');
        if (supportToggleDesktop) addClass(supportToggleDesktop, 'active');
        if (supportToggleMobile) addClass(supportToggleMobile, 'active');
      }
    };

    if (supportToggleDesktop) {
      on(supportToggleDesktop, 'click', toggleSupport);
    }

    if (supportToggleMobile) {
      on(supportToggleMobile, 'click', toggleSupport);
    }

    if (supportClose) {
      on(supportClose, 'click', () => {
        if (supportChat) removeClass(supportChat, 'open');
        if (supportToggleDesktop) removeClass(supportToggleDesktop, 'active');
        if (supportToggleMobile) removeClass(supportToggleMobile, 'active');
      });
    }

    if (supportForm) {
      on(supportForm, 'submit', (e) => {
        e.preventDefault();
        const nameInput = query('#support-name');
        const messageInput = query('#support-message');
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();
        if (name && message) {
          if (window.submitSupportMessage) {
            window.submitSupportMessage(name, message);
          }
          addClass(supportForm, 'hidden');
          removeClass(supportThanks, 'hidden');
          supportForm.reset();
          setTimeout(() => {
            removeClass(supportForm, 'hidden');
            addClass(supportThanks, 'hidden');
            if (supportChat) removeClass(supportChat, 'open');
            if (supportToggleDesktop) removeClass(supportToggleDesktop, 'active');
            if (supportToggleMobile) removeClass(supportToggleMobile, 'active');
          }, 3000);
        }
      });
    }

   // Define extensible support message handler
   window.submitSupportMessage = (name, message) => {
     console.log('Support message submitted:', { name, message });
     // TODO: Integrate with backend API
   };
}

async function loadContent() {
  setLoading(true);
  setLoadingHome(true);
  setLoadingProjects(true);
  setLoadingArticles(true);
  renderRightbarSkeleton();
  
  const profileContainer = document.querySelector('#profile-header');
  if (profileContainer) {
    profileContainer.innerHTML = '';
    const profileSkeleton = createProfileSkeleton();
    if (profileSkeleton) {
      profileContainer.appendChild(profileSkeleton);
    }
  }

  // Initialize environment variables if not already set
  if (!window.__ENV) {
    window.__ENV = {};
  }

  try {
    let isConnected = false;
    try {
      const connectionPromise = testConnection();
      const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(false), 3000));
      isConnected = await Promise.race([connectionPromise, timeoutPromise]);
    } catch (e) {
      console.warn('Connection test failed, using mock data:', e.message);
      isConnected = false;
    }
    
    let profile = getMockProfile();
    let posts = getMockPosts();
    let projects = getMockProjects();
    let heroText = null;
    let aboutMeStats = [];
    let aboutMeContent = null;
    let socials = [];
    let expertise = [];
    let experience = getMockTimeline();
    let acknowledgements = [];
    let popularTags = [];
    let skillTags = [];

    if (isConnected) {
      try { const d = await Promise.race([fetchPosts(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 3000))]); if (d?.length) posts = d; } catch (e) {}
      try { const d = await Promise.race([fetchProjects(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 3000))]); if (d?.length) projects = d; } catch (e) {}
      try { const d = await Promise.race([fetchExperience(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 3000))]); if (d?.length) experience = d; } catch (e) {}
      try { const d = await Promise.race([fetchHeroText(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 3000))]); if (d?.content) heroText = d.content; } catch (e) {}
      try { const d = await Promise.race([fetchAboutMeStats(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 3000))]); if (d?.length) aboutMeStats = d; } catch (e) {}
      try { const d = await Promise.race([fetchAboutMeContent(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 3000))]); if (d) aboutMeContent = d; } catch (e) {}
      try { const d = await Promise.race([fetchSocials(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 3000))]); if (d) socials = d; } catch (e) {}
      try { const d = await Promise.race([fetchExpertise(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 3000))]); if (d?.length) expertise = d; } catch (e) {}
      try { const d = await Promise.race([fetchAcknowledgements(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 3000))]); if (d?.length) acknowledgements = d; } catch (e) {}
      try { const d = await Promise.race([fetchPopularTags(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 3000))]); if (d?.length) popularTags = d; } catch (e) {}
      try { const d = await Promise.race([fetchSkillTags(), new Promise((_, r) => setTimeout(() => r(new Error('timeout')), 3000))]); if (d?.length) skillTags = d; } catch (e) {}
    }

    if (heroText) {
      profile = { ...profile, bio: heroText };
    }

    if (aboutMeStats.length > 0) {
      profile = { ...profile, stats: aboutMeStats };
    }

    if (socials.length > 0) {
      profile = { ...profile, social: socials };
    }

    window.__aboutMeContent = aboutMeContent;
    window.__expertise = expertise;
    window.__experience = experience;
    window.__acknowledgements = acknowledgements;
    window.__popularTags = popularTags;
    window.__skillTags = skillTags;

    setProfile(profile);
    setPosts(posts);
    setProjects(projects);

    allPosts = posts;
    allProjects = projects;

  const profileContainer = document.querySelector('#profile-header');
    if (profileContainer && profile) {
      profileContainer.innerHTML = '';
      profileContainer.style.display = 'block';
      profileContainer.style.visibility = 'visible';
      profileContainer.style.opacity = '1';
      const profileHeader = renderProfileHeader(profile);
      if (profileHeader) {
        profileContainer.appendChild(profileHeader);
      }
    }

    renderRightbar(allProjects, popularTags, skillTags, socials);
    updateContactLinks(profile.social || socials);

    console.log('✅ Portfolio loaded - popularTags:', popularTags.length, 'skillTags:', skillTags.length, 'socials:', socials.length);

  } catch (error) {
    console.error('Error loading content:', error);
    showErrorState('Failed to load content. Please check your connection and try again.');
  } finally {
    setLoading(false);
    setLoadingHome(false);
    setLoadingProjects(false);
    setLoadingArticles(false);
    
    // Trigger the current route after content is loaded
    const hash = window.location.hash.slice(1) || 'home';
    const [view, param] = hash.split('/');
    const routes = window.__routes;
    if (routes && routes[view]) {
      routes[view](param);
    }
  }
}

function handleStateChange(state) {
  // Handle state changes if needed
}

function setWideLayout(wide) {
  document.body.classList.toggle('page-wide', wide);
}

function sectionHead(number, title, id) {
  return `
    <div class="section-head">
      <span class="section-kicker">${String(number).padStart(2, '0')}</span>
      <h2 class="section-title" id="${id}">${title}</h2>
    </div>
  `;
}

function skillIconFor(category = '') {
  const name = category.toLowerCase();
  if (/front|ui|ux|design|web/.test(name)) return 'sparkles';
  if (/back|api|server|data|database/.test(name)) return 'projects';
  if (/devops|cloud|infra|ci|ops/.test(name)) return 'briefcase';
  return 'stories';
}

function homeSkeletonHTML() {
  return `
    <section class="feed-section">
      ${sectionHead(1, 'About me', 'about-title')}
      <div class="skeleton-line" style="width: 92%; height: 22px; margin-bottom: 10px;"></div>
      <div class="skeleton-line" style="width: 70%; height: 22px; margin-bottom: 18px;"></div>
      <div class="skeleton-line" style="width: 100%; height: 14px; margin-bottom: 8px;"></div>
      <div class="skeleton-line" style="width: 96%; height: 14px; margin-bottom: 8px;"></div>
      <div class="skeleton-line" style="width: 88%; height: 14px;"></div>
    </section>
    <section class="feed-section">
      ${sectionHead(2, 'Skills & expertise', 'skills-title')}
      <div class="skills-grid">
        ${Array(3).fill(0).map(() => `
          <div class="skill-card">
            <div class="skeleton-line" style="width: 38px; height: 38px; border-radius: 12px; margin-bottom: 12px;"></div>
            <div class="skeleton-line" style="width: 60%; height: 16px; margin-bottom: 12px;"></div>
            <div class="skeleton-line" style="width: 100%; height: 12px; margin-bottom: 6px;"></div>
            <div class="skeleton-line" style="width: 80%; height: 12px;"></div>
          </div>
        `).join('')}
      </div>
    </section>
    <section class="feed-section">
      ${sectionHead(3, 'Experience', 'experience-title')}
      <ol class="timeline">
        ${Array(3).fill(0).map(() => `
          <li>
            <div class="timeline-item">
              <span class="timeline-marker"></span>
              <div class="timeline-content">
                <div class="timeline-text">
                  <div class="skeleton-line" style="width: 30%; height: 10px; margin-bottom: 8px;"></div>
                  <div class="skeleton-line" style="width: 65%; height: 14px; margin-bottom: 6px;"></div>
                  <div class="skeleton-line" style="width: 40%; height: 10px;"></div>
                </div>
              </div>
            </div>
          </li>
        `).join('')}
      </ol>
    </section>
  `;
}

function showHomeView() {
  setWideLayout(false);
  setActiveNavByView('home');
  setActiveMobileNavByView('home');
  setViewTitle('Home');
  const profileHeader = query('#profile-header');
  if (profileHeader) {
    profileHeader.style.display = 'block';
    profileHeader.style.visibility = 'visible';
    profileHeader.style.opacity = '1';
    profileHeader.classList.add('active');
  }

  const feedContainer = query('#feed-container');
  if (!feedContainer) return;

  const profile = getProfile();
  if (!profile || isLoadingHome()) {
    feedContainer.innerHTML = homeSkeletonHTML();
    return;
  }

  const skillsData = window.__expertise?.length ? window.__expertise : Object.values(getMockSkillsDetailed());
  const timeline = window.__experience || getMockTimeline();
  const acknowledgements = window.__acknowledgements?.length ? window.__acknowledgements : getMockTestimonials();

  const aboutMeContent = window.__aboutMeContent || {};
  const headline = aboutMeContent.headline || 'I\'m passionate about building performant, accessible web experiences that delight users.';
  const description = aboutMeContent.description || 'My focus is on creating scalable architectures and optimizing every byte. With expertise in modern web standards and a deep understanding of performance optimization, I help teams deliver exceptional digital experiences.';

  const aboutHTML = `
    <section class="feed-section" aria-labelledby="about-title">
      ${sectionHead(1, 'About me', 'about-title')}
      <p class="about-lead observe-fade-in">${headline}</p>
      <p class="about-text observe-fade-in" style="animation-delay: 120ms;">${description}</p>
    </section>

    <section class="feed-section" aria-labelledby="skills-title">
      ${sectionHead(2, 'Skills & expertise', 'skills-title')}
      <div class="skills-grid">
        ${skillsData.map((skillGroup, index) => `
          <article class="skill-card observe-fade-in" data-tilt="10" style="animation-delay: ${index * 90}ms;">
            <span class="skill-card-icon">${icon(skillIconFor(skillGroup.category), 18)}</span>
            <h3 class="skill-card-title">${skillGroup.category}</h3>
            <div class="skill-card-tags">
              ${(skillGroup.skills || []).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
            ${skillGroup.proficiency ? `
              <p class="skill-card-level"><span>Proficiency</span><strong>${skillGroup.proficiency}</strong></p>
            ` : ''}
          </article>
        `).join('')}
      </div>
    </section>

    <section class="feed-section" aria-labelledby="experience-title">
      ${sectionHead(3, 'Experience', 'experience-title')}
      <ol class="timeline">
        ${timeline.map((item, index) => `
          <li>
            <a href="#experience/${item.id}" class="timeline-item observe-fade-in" style="animation-delay: ${index * 90}ms;">
              <span class="timeline-marker" aria-hidden="true"></span>
              <div class="timeline-content" data-spotlight>
                <div class="timeline-text">
                  <div class="timeline-date">${item.date}</div>
                  <div class="timeline-title">${item.title}</div>
                  ${item.organization ? `<div class="timeline-organization">${item.organization}</div>` : ''}
                </div>
                <span class="timeline-arrow" aria-hidden="true">${icon('arrowUpRight', 16)}</span>
              </div>
            </a>
          </li>
        `).join('')}
      </ol>
    </section>

    ${acknowledgements.length ? `
      <section class="feed-section" aria-labelledby="ack-title">
        ${sectionHead(4, 'Acknowledgements', 'ack-title')}
        <div class="testimonial-carousel" data-carousel="acknowledgements" aria-roledescription="carousel" aria-label="Acknowledgements">
          <div class="testimonial-stage">
            ${acknowledgements.map((item, index) => `
              <figure class="testimonial-slide" aria-roledescription="slide" aria-label="${index + 1} of ${acknowledgements.length}">
                <span class="testimonial-quote-icon" aria-hidden="true">${icon('quote', 18)}</span>
                <blockquote class="testimonial-text">${item.quote}</blockquote>
                <figcaption class="testimonial-person">
                  <span class="testimonial-initial" aria-hidden="true">${(item.author || '?').trim().charAt(0)}</span>
                  <span>
                    <span class="testimonial-author" style="display: block;">${item.author}</span>
                    <span class="testimonial-role" style="display: block;">${item.role || ''}</span>
                  </span>
                </figcaption>
              </figure>
            `).join('')}
          </div>
          ${acknowledgements.length > 1 ? `
            <div class="carousel-controls">
              <div class="carousel-dots">
                ${acknowledgements.map((_, i) => `<button type="button" class="carousel-dot" aria-label="Show acknowledgement ${i + 1}"></button>`).join('')}
              </div>
              <div class="carousel-arrows">
                <button type="button" class="carousel-arrow prev" aria-label="Previous acknowledgement">${icon('arrowLeft', 16)}</button>
                <button type="button" class="carousel-arrow next" aria-label="Next acknowledgement">${icon('arrowLeft', 16)}</button>
              </div>
            </div>
          ` : ''}
        </div>
      </section>
    ` : ''}
  `;

  feedContainer.innerHTML = aboutHTML;
  initCarousel('acknowledgements');
  fadeInPageSection(feedContainer);
  setTimeout(() => {
    initScrollAnimations();
  }, 100);
}

function showProjectsView() {
  setWideLayout(true);
  setActiveNavByView('projects');
  setActiveMobileNavByView('projects');
  hideProfileHeader();

  const feedContainer = query('#feed-container');
  if (!feedContainer) return;

  if (allProjects.length === 0 || isLoadingProjects()) {
    setViewTitle('Projects');
    renderCardListSkeleton();
    return;
  }

  const count = allProjects.length;
  setViewTitle('Projects', `${count} ${count === 1 ? 'project' : 'projects'}`);
  renderCardList(
    allProjects.map(project => ({ ...project, type: 'project' })),
    `<span>Selected work</span><span>${count} ${count === 1 ? 'project' : 'projects'}</span>`
  );
  fadeInPageSection(feedContainer);
  setTimeout(() => {
    initScrollAnimations();
  }, 100);
}

function showArticlesView() {
  setWideLayout(true);
  setActiveNavByView('articles');
  setActiveMobileNavByView('articles');
  hideProfileHeader();

  const feedContainer = query('#feed-container');
  if (!feedContainer) return;

  if (allPosts.length === 0 || isLoadingArticles()) {
    setViewTitle('Stories');
    renderCardListSkeleton();
    return;
  }

  const count = allPosts.length;
  setViewTitle('Stories', `${count} ${count === 1 ? 'story' : 'stories'}`);
  renderCardList(
    allPosts,
    `<span>Writing &amp; notes</span><span>${count} ${count === 1 ? 'story' : 'stories'}</span>`
  );
  fadeInPageSection(feedContainer);
  setTimeout(() => {
    initScrollAnimations();
  }, 100);
}

function showAboutView() {
  setActiveNavByView('about');
  setActiveMobileNavByView('about');
  const profileHeader = query('#profile-header');
  if (profileHeader) {
    profileHeader.style.display = 'none';
    profileHeader.classList.remove('active');
  }
  
  const profile = getProfile();
  const testimonials = window.__acknowledgements || getMockTestimonials();
  const caseStudies = getMockCaseStudies();
  const timeline = window.__experience || getMockTimeline();
  const skillsDetailed = window.__expertise || Object.values(getMockSkillsDetailed());
  
  const feedContainer = query('#feed-container');
  if (!feedContainer) return;

  // Build comprehensive about page
  const aboutHTML = `
    <section style="padding: var(--spacing-xl) var(--spacing-lg);">
      <h2 style="margin-bottom: var(--spacing-lg); font-size: var(--font-size-2xl);">About Me</h2>
      <p style="margin-bottom: var(--spacing-lg); line-height: var(--line-height-relaxed);">
        ${profile.bio}
      </p>
      <p style="margin-bottom: var(--spacing-xl); line-height: var(--line-height-relaxed); color: var(--color-text-secondary);">
        I'm passionate about building performant, accessible web experiences that delight users. My focus is on creating scalable architectures and optimizing every byte. With expertise in modern web standards and a deep understanding of performance optimization, I help teams deliver exceptional digital experiences.
      </p>

      <!-- Skills Grid -->
      <h3 style="margin-bottom: var(--spacing-lg); font-size: var(--font-size-xl);">Skills & Expertise</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
        ${skillsDetailed.map((skillGroup, index) => `
          <div class="skill-card observe-fade-in" style="animation-delay: ${index * 100}ms;">
            <h4 style="margin-bottom: var(--spacing-md); color: var(--color-accent); font-weight: 600;">${skillGroup.category}</h4>
            <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-bottom: var(--spacing-md);">
              ${skillGroup.skills.map(skill => `
                <span class="skill-tag">${skill}</span>
              `).join('')}
            </div>
            <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0;">
              <strong>Proficiency:</strong> ${skillGroup.proficiency}
            </p>
          </div>
        `).join('')}
      </div>

      <!-- Timeline -->
      <h3 style="margin-bottom: var(--spacing-md); margin-top: var(--spacing-lg); font-size: var(--font-size-lg);">Experience</h3>
      <div class="timeline" style="margin-bottom: var(--spacing-lg);">
        ${timeline.map((item, index) => `
          <a href="#experience/${item.id}" class="timeline-item observe-fade-in" style="animation-delay: ${index * 100}ms; text-decoration: none; color: inherit; display: block;">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-date">${item.date}</div>
              <div class="timeline-title">${item.title}</div>
              ${item.organization ? `<div class="timeline-organization" style="font-size: var(--font-size-xs); color: var(--color-text-tertiary);">${item.organization}</div>` : ''}
            </div>
          </a>
        `).join('')}
      </div>

<!-- Acknowledgements -->
      <h3 style="margin-bottom: var(--spacing-md); margin-top: var(--spacing-lg); font-size: var(--font-size-lg);">Acknowledgements</h3>
      <div class="carousel-container" data-carousel="acknowledgements-about" style="position: relative; overflow: hidden; margin-bottom: var(--spacing-lg); min-height: 120px;">
        <div class="carousel-track" style="display: flex; transition: transform 0.5s ease-in-out;">
          ${testimonials.map((item, index) => `
            <div class="carousel-slide" style="min-width: 100%; padding: var(--spacing-lg); background: var(--color-bg-secondary); border-radius: 12px; border-left: 3px solid var(--color-accent); box-sizing: border-box;">
              <div style="font-size: var(--font-size-sm); color: var(--color-text-secondary); line-height: 1.6;">
                "${item.quote}"
              </div>
              <div style="margin-top: var(--spacing-md); font-size: var(--font-size-sm); font-weight: 600;">${item.author}</div>
              <div style="font-size: var(--font-size-xs); color: var(--color-text-tertiary);">${item.role}</div>
            </div>
          `).join('')}
        </div>
        <div class="carousel-dots" style="display: flex; justify-content: center; gap: 10px; margin-top: var(--spacing-md);">
          ${testimonials.map((_, i) => `<span class="carousel-dot" data-index="${i}" style="width: 10px; height: 10px; border-radius: 50%; background: var(--color-text-tertiary); cursor: pointer;"></span>`).join('')}
        </div>
      </div>

      <!-- Testimonials -->
      <h3 style="margin-bottom: var(--spacing-lg); font-size: var(--font-size-xl);">What Others Say</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
        ${testimonials.map((testimonial, index) => `
          <div class="testimonial-card observe-fade-in" style="animation-delay: ${index * 100}ms;">
            <div class="testimonial-quote">"${testimonial.quote}"</div>
            <div class="testimonial-author">${testimonial.author}</div>
            <div class="testimonial-role">${testimonial.role}</div>
          </div>
        `).join('')}
      </div>

      <!-- Contact -->
      <h3 style="margin-bottom: var(--spacing-lg); font-size: var(--font-size-xl);">Let's Connect</h3>
      <p style="margin-bottom: var(--spacing-lg); color: var(--color-text-secondary); line-height: var(--line-height-relaxed);">
        I'm always interested in discussing web performance, accessibility, and innovative solutions. Feel free to reach out!
      </p>
      <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-md);">
        <a href="mailto:${profile.email}" class="btn-primary observe-fade-in">
          ðŸ“§ Email Me
        </a>
        ${(profile.social || []).map((link, index) => `
          <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="btn-secondary observe-fade-in" style="animation-delay: ${index * 100}ms;">
            ${link.name}
          </a>
        `).join('')}
      </div>
    </section>
  `;

  feedContainer.innerHTML = aboutHTML;
  initCarousel('acknowledgements-about');
  fadeInPageSection(feedContainer);
  setTimeout(() => {
    initScrollAnimations();
  }, 100);
}

function showTagView(tag) {
  if (!tag) return showHomeView();
  hideProfileHeader();
  setWideLayout(true);
  setViewTitle(`#${decodeURIComponent(tag)}`, 'Tag');

  setCurrentFilter(tag);
  const combinedItems = [...allPosts, ...allProjects];
  renderFilteredFeed(combinedItems, tag);
}

function showProjectDetailView(id) {
  setWideLayout(true);
  setActiveNavByView('projects');
  setActiveMobileNavByView('projects');
  const profileHeader = query('#profile-header');
  if (profileHeader) {
    profileHeader.style.display = 'none';
    profileHeader.classList.remove('active');
  }

  const project = allProjects.find(p => p.id === id);
  if (!project) {
    showProjectsView();
    return;
  }
  setViewTitle('Project', project.title);

  const feedContainer = query('#feed-container');
  if (!feedContainer) return;

  // Scroll to top before rendering content
  window.scrollTo(0, 0);

  const projectDetailHTML = `
      <section class="detail-view">
        <a href="#projects" class="back-link">${icon('arrowLeft', 16)}Projects</a>

        <article class="card card-detail">
          <div class="card-header">
            <img
              src="img/hero.jpeg"
              alt="${project.author} avatar"
              class="card-avatar"
              loading="lazy"
            />
            <div class="card-meta">
              <div class="card-author">${project.author || 'Project'}</div>
              <div class="card-date">${project.date ? new Date(project.date).toLocaleDateString() : ''}</div>
            </div>
          </div>
          <h1 class="card-title">${project.title}</h1>
          ${project.image ? `<img src="${project.image}" alt="${project.title}" class="card-image" loading="lazy"/>` : ''}
          <p class="card-description" style="font-size: var(--font-size-base); line-height: var(--line-height-relaxed); margin-bottom: var(--spacing-xl);">
            ${project.description}
          </p>

          ${project.contentRaw ? `
            <div style="margin-bottom: var(--spacing-xl);">
              <div style="font-size: var(--font-size-base); line-height: var(--line-height-relaxed); margin-bottom: var(--spacing-lg);">
                ${parseRichText(project.contentRaw, project.assetMap)}
              </div>
            </div>
          ` : ''}

          ${(project.technologies && project.technologies.length) ? `
            <div style="margin-bottom: var(--spacing-xl);">
              <h3 style="margin-bottom: var(--spacing-md); color: var(--color-accent);">Technologies Used</h3>
              <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap;">
                ${project.technologies.map(tech => `
                  <span class="tag">${tech}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${(project.features && project.features.length) ? `
            <div style="margin-bottom: var(--spacing-xl);">
              <h3 style="margin-bottom: var(--spacing-md); color: var(--color-accent);">Key Features</h3>
              <ul style="padding-left: var(--spacing-lg);">
                ${project.features.map(feature => `<li style="margin-bottom: var(--spacing-sm);">${feature}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="card-footer">
            <div class="card-tags">
              ${(project.tags && project.tags.length) ? project.tags.map(tag => `
                <a href="#tag/${tag}" class="tag" data-tag="${tag}">${tag}</a>
              `).join('') : ''}
            </div>
            
          </div>
        </article>
      </section>
    `;

  feedContainer.innerHTML = projectDetailHTML;
  fadeInPageSection(feedContainer);
}

function showArticleDetailView(id) {
  setWideLayout(true);
  setActiveNavByView('articles');
  setActiveMobileNavByView('articles');
  const profileHeader = query('#profile-header');
  if (profileHeader) {
    profileHeader.style.display = 'none';
    profileHeader.classList.remove('active');
  }

  const article = allPosts.find(p => p.id === id);
  if (!article) {
    showArticlesView();
    return;
  }
  setViewTitle('Story', article.title);

  const feedContainer = query('#feed-container');
  if (!feedContainer) return;

  // Show skeleton while loading
  feedContainer.innerHTML = createArticleDetailSkeleton().innerHTML;

  // Simulate loading delay for better UX
  setTimeout(() => {
    // Scroll to top before rendering content
    window.scrollTo(0, 0);

    const articleDetailHTML = `
      <section class="detail-view">
        <a href="#articles" class="back-link">${icon('arrowLeft', 16)}Stories</a>

        <article class="card card-detail">
          <div class="card-header">
            <img
              src="img/hero.jpeg"
              alt="${article.author} avatar"
              class="card-avatar"
              loading="lazy"
            />
            <div class="card-meta">
              <div class="card-author">${article.author || 'Author'}</div>
              <div class="card-date">${new Date(article.createdAt).toLocaleDateString()} · ${article.readTime || '5 min read'}</div>
            </div>
          </div>
          <h1 class="card-title">${article.title}</h1>
          ${article.image ? `<img src="${article.image}" alt="${article.title}" class="card-image" loading="lazy"/>` : ''}
          <p class="card-description" style="font-size: var(--font-size-lg); line-height: var(--line-height-relaxed); margin-bottom: var(--spacing-xl); font-style: italic;">
            ${article.description}
          </p>

          <div style="font-size: var(--font-size-base); line-height: var(--line-height-relaxed); margin-bottom: var(--spacing-xl);">
            ${article.contentRaw ? parseRichText(article.contentRaw, article.assetMap) : (article.content || 'Article content would go here...')}
          </div>

          <div class="card-footer">
            <div class="card-tags">
              ${(article.tags || []).map(tag => `
                <a href="#tag/${tag}" class="tag" data-tag="${tag}">${tag}</a>
              `).join('')}
            </div>
            
          </div>
        </article>
      </section>
    `;

    feedContainer.innerHTML = articleDetailHTML;
    // Immediately show detail content (no scroll animation for detail views)
    feedContainer.querySelectorAll('.observe-fade-in').forEach(el => {
      el.classList.add('visible');
    });
    fadeInPageSection(feedContainer);
    setTimeout(() => {
      initScrollAnimations();
    }, 100);
  }, 800);
}

function showExperienceDetailView(id) {
  setActiveNavByView('home');
  setActiveMobileNavByView('home');
  const profileHeader = query('#profile-header');
  if (profileHeader) {
    profileHeader.style.display = 'none';
    profileHeader.classList.remove('active');
  }

  const timeline = window.__experience || getMockTimeline();
  const experience = timeline.find(item => item.id === id);
  
  if (!experience) {
    showHomeView();
    return;
  }
  setViewTitle('Experience', experience.organization || '');

  const feedContainer = query('#feed-container');
  if (!feedContainer) return;

  // Show skeleton while loading
  feedContainer.innerHTML = createExperienceDetailSkeleton().innerHTML;

  // Simulate loading delay for better UX
  setTimeout(() => {
    // Scroll to top before rendering content
    window.scrollTo(0, 0);

    const experienceDetailHTML = `
      <div class="experience-detail-wrapper">
        <div class="experience-detail-hero" style="position: relative; padding: var(--spacing-lg) var(--spacing-md); background: var(--color-bg-secondary); overflow: hidden; border-bottom: 1px solid var(--color-border);">
          <div class="experience-detail-hero-content" style="position: relative; z-index: 1; display: flex; flex-direction: column; gap: var(--spacing-md);">
            <a href="#home" class="experience-detail-back" style="display: inline-flex; align-items: center; gap: var(--spacing-sm); color: var(--color-accent); font-size: var(--font-size-sm); font-weight: 500; cursor: pointer; transition: all var(--transition-fast); background: none; padding: 0; border: none; text-decoration: none; width: fit-content;">← Back to Timeline</a>
            <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
              <h1 class="experience-detail-title" style="font-size: clamp(1.5rem, 4vw, 2.5rem); font-weight: 800; color: var(--color-text-primary); margin: 0; line-height: 1.2; text-shadow: none;">${experience.title}</h1>
              ${experience.organization ? `<div class="experience-detail-company" style="display: inline-flex; align-items: center; gap: var(--spacing-sm); color: var(--color-accent); font-size: var(--font-size-base); font-weight: 500;">🏢 ${experience.organization}</div>` : ''}
              <div class="experience-detail-date-badge" style="display: inline-flex; align-items: center; gap: var(--spacing-sm); background: transparent; backdrop-filter: none; padding: 0; border-radius: 0; color: var(--color-text-secondary); font-size: var(--font-size-sm); font-weight: 500; width: fit-content;">${experience.date}</div>
            </div>
          </div>
        </div>

        <div class="experience-detail-body" style="padding: var(--spacing-lg) var(--spacing-md); display: grid; grid-template-columns: 1fr; gap: var(--spacing-xl); width: 100%; max-width: 100%; background-color: var(--color-bg);">
          <div class="experience-detail-main" style="display: flex; flex-direction: column; gap: var(--spacing-lg); width: 100%;">
            <div class="experience-detail-description" style="font-size: var(--font-size-base); color: var(--color-text-secondary); line-height: 1.8; padding: 0; background: transparent; border-radius: 0; border: none;">
              ${experience.description}
            </div>

            ${experience.responsibilities && experience.responsibilities.length ? `
              <div class="experience-detail-section" style="background: transparent; border-radius: 0; padding: var(--spacing-md) 0; border: none; width: 100%;">
                <h3 class="experience-detail-section-title" style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--spacing-sm); display: flex; align-items: center; gap: var(--spacing-sm); padding-bottom: 0; border-bottom: none; text-transform: none; letter-spacing: 0;">Responsibilities</h3>
                <ul class="experience-detail-list" style="list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: var(--spacing-xs);">
                  ${experience.responsibilities.map((item, idx) => `<li style="padding: var(--spacing-xs) 0; position: relative; background: transparent; border-radius: 0; font-size: var(--font-size-sm); color: var(--color-text-secondary); transition: all var(--transition-fast); border: none; line-height: 1.5;"><span style="font-weight: 600; margin-right: var(--spacing-sm);">${String.fromCharCode(96 + idx + 1)}.</span>${item}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${experience.achievements && experience.achievements.length ? `
              <div class="experience-detail-section" style="background: transparent; border-radius: 0; padding: var(--spacing-md) 0; border: none; width: 100%;">
                <h3 class="experience-detail-section-title" style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--spacing-sm); display: flex; align-items: center; gap: var(--spacing-sm); padding-bottom: 0; border-bottom: none; text-transform: none; letter-spacing: 0;">Achievements</h3>
                <ul class="experience-detail-list" style="list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: var(--spacing-xs);">
                  ${experience.achievements.map((item, idx) => `<li style="padding: var(--spacing-xs) 0; position: relative; background: transparent; border-radius: 0; font-size: var(--font-size-sm); color: var(--color-text-secondary); transition: all var(--transition-fast); border: none; line-height: 1.5;"><span style="font-weight: 600; margin-right: var(--spacing-sm);">${String.fromCharCode(96 + idx + 1)}.</span>${item}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            ${experience.impact && experience.impact.length ? `
              <div class="experience-detail-section" style="background: transparent; border-radius: 0; padding: var(--spacing-md) 0; border: none; width: 100%;">
                <h3 class="experience-detail-section-title" style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--spacing-sm); display: flex; align-items: center; gap: var(--spacing-sm); padding-bottom: 0; border-bottom: none; text-transform: none; letter-spacing: 0;">Impact</h3>
                <ul class="experience-detail-list" style="list-style: none; padding-left: 0; margin: 0; display: flex; flex-direction: column; gap: var(--spacing-xs);">
                  ${experience.impact.map((item, idx) => `<li style="padding: var(--spacing-xs) 0; position: relative; background: transparent; border-radius: 0; font-size: var(--font-size-sm); color: var(--color-text-secondary); transition: all var(--transition-fast); border: none; line-height: 1.5;"><span style="font-weight: 600; margin-right: var(--spacing-sm);">${String.fromCharCode(96 + idx + 1)}.</span>${item}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>

          <div class="experience-detail-sidebar" style="display: flex; flex-direction: column; gap: var(--spacing-lg); width: 100%;">
            ${experience.technologies && experience.technologies.length ? `
              <div class="experience-detail-card" style="background: var(--color-bg); border-radius: 12px; padding: var(--spacing-lg); border: 1px solid var(--color-border); width: 100%;">
                <div class="experience-detail-card-title" style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-text-primary); text-transform: none; letter-spacing: 0; margin-bottom: var(--spacing-md);">Technologies</div>
                <div class="experience-detail-tags" style="display: flex; flex-wrap: wrap; gap: var(--spacing-sm);">
                  ${experience.technologies.map(tech => `<span class="tag" style="font-size: var(--font-size-sm); padding: var(--spacing-sm) var(--spacing-md); background: var(--color-bg-secondary); border: 1px solid var(--color-border); color: var(--color-accent); transition: all var(--transition-fast);">${tech}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;

    feedContainer.innerHTML = experienceDetailHTML;
    // Immediately show detail content (no scroll animation for detail views)
    feedContainer.querySelectorAll('.observe-fade-in').forEach(el => {
      el.classList.add('visible');
    });
    fadeInPageSection(feedContainer);
    setTimeout(() => {
      initScrollAnimations();
    }, 100);
  }, 800);
}

// Handle tag clicks
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('tag') && e.target.dataset.tag) {
    e.preventDefault();
    const tag = e.target.dataset.tag;
    setCurrentFilter(tag);
    const combinedItems = [...allPosts, ...allProjects];
    renderFilteredFeed(combinedItems, tag);
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Export for debugging
window.__portfolio = {
  getPosts,
  getProjects,
  getProfile,
  allPosts,
  allProjects
};
