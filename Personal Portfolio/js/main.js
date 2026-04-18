/* Main Application Entry Point */

import { initTheme } from './theme.js';
import { initRouter } from './router.js';
import { initSidebar, setActiveNavByView } from './components/sidebar.js';
import { initMobileMenu, setActiveMobileNavByView } from './components/mobile-menu.js';
import { renderFeed, renderFeedSkeleton, renderFilteredFeed } from './components/feed.js';
import { renderRightbar, renderRightbarSkeleton } from './components/rightbar.js';
import { renderProfileHeader, createProfileSkeleton } from './components/profile.js';
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
import { query, on, addClass, removeClass } from './utils/dom.js';
import { 
  fadeInPageSection, 
  initScrollAnimations,
  addCardHoverAnimations 
} from './utils/animations.js';
import { parseMarkdown, parseRichText } from './utils/markdown.js';


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

// Carousel initialization
const carousels = {};
function initCarousel(name) {
  if (carousels[name] && carousels[name].interval) clearInterval(carousels[name].interval);
  const container = document.querySelector('[data-carousel="' + name + '"]');
  if (!container) return;
  const track = container.querySelector('.carousel-track');
  const dots = container.querySelectorAll('.carousel-dot');
  if (!track || !dots.length) return;
  let current = 0, count = dots.length;
  const show = function(i) {
    track.style.transform = 'translateX(-' + (i * 100) + '%)';
    dots.forEach(function(d, j) { d.style.background = (j === i) ? 'var(--color-accent)' : 'var(--color-text-tertiary)'; });
    current = i;
  };
  var nextSlide = function() { show((current + 1) % count); };
  var prevSlide = function() { show((current - 1 + count) % count); };
  dots.forEach(function(d, i) { d.addEventListener('click', function() { 
      if (carousels[name] && carousels[name].interval) clearInterval(carousels[name].interval); 
      show(i); 
      carousels[name].interval = setInterval(nextSlide, 8000); 
    }); 
  });
  track.addEventListener('touchstart', function(e) { 
    if (carousels[name] && carousels[name].interval) clearInterval(carousels[name].interval);
    track.__startX = e.touches[0].clientX; 
  });
  track.addEventListener('touchend', function(e) { 
    const endX = e.changedTouches[0].clientX;
    const diff = track.__startX - endX;
    if (Math.abs(diff) > 50) { if (diff > 0) nextSlide(); else prevSlide(); }
    carousels[name].interval = setInterval(nextSlide, 8000);
  });
  if (count > 1) { show(0); carousels[name] = { interval: setInterval(nextSlide, 8000) }; }
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
     addCardHoverAnimations();
   }, 100);

   // Initialize back to top button
   const backToTopBtn = query('#back-to-top');
   if (backToTopBtn) {
     on(window, 'scroll', () => {
       if (window.scrollY > 300) {
         addClass(backToTopBtn, 'visible');
       } else {
         removeClass(backToTopBtn, 'visible');
       }
     });
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

function showHomeView() {
  setActiveNavByView('home');
  setActiveMobileNavByView('home');
  const profileHeader = query('#profile-header');
  if (profileHeader) {
    profileHeader.style.display = 'block';
    profileHeader.style.visibility = 'visible';
    profileHeader.style.opacity = '1';
    profileHeader.classList.add('active');
  }
  
  const profile = getProfile();
  const isLoading = isLoadingHome();
  
  if (!profile || isLoading) {
    const feedContainer = query('#feed-container');
    if (feedContainer) {
      feedContainer.innerHTML = `
        <div style="width: 100%; max-width: 100%; padding: 0; overflow-x: hidden;">
          <section style="padding: clamp(var(--spacing-md), 4vw, var(--spacing-xl)) clamp(var(--spacing-md), 3vw, var(--spacing-lg)); width: 100%; box-sizing: border-box;">
            <h2 style="margin-bottom: var(--spacing-lg); font-size: clamp(var(--font-size-lg), 5vw, var(--font-size-2xl)); word-wrap: break-word;">About Me</h2>
            <div class="skeleton-line" style="width: 100%; height: 16px; margin-bottom: var(--spacing-sm);"></div>
            <div class="skeleton-line" style="width: 95%; height: 16px; margin-bottom: var(--spacing-sm);"></div>
            <div class="skeleton-line" style="width: 90%; height: 16px; margin-bottom: var(--spacing-lg);"></div>
            
            <div class="skeleton-line" style="width: 100%; height: 16px; margin-bottom: var(--spacing-sm);"></div>
            <div class="skeleton-line" style="width: 95%; height: 16px; margin-bottom: var(--spacing-lg);"></div>
            
            <div class="skeleton-line" style="width: 100%; height: 16px; margin-bottom: var(--spacing-sm);"></div>
            <div class="skeleton-line" style="width: 90%; height: 16px; margin-bottom: var(--spacing-xl);"></div>
            
            <h3 style="margin-bottom: var(--spacing-lg); font-size: clamp(var(--font-size-base), 4vw, var(--font-size-xl)); word-wrap: break-word;">Skills & Expertise</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(clamp(180px, 40vw, 250px), 1fr)); gap: clamp(var(--spacing-md), 3vw, var(--spacing-lg)); margin-bottom: var(--spacing-xl);">
              ${Array(3).fill(0).map(() => `
                <div style="padding: var(--spacing-lg); background: var(--color-bg-secondary); border-radius: 12px; border: 1px solid var(--color-border);">
                  <div class="skeleton-line" style="width: 60%; height: 16px; margin-bottom: var(--spacing-md);"></div>
                  <div class="skeleton-line" style="width: 100%; height: 12px; margin-bottom: var(--spacing-sm);"></div>
                  <div class="skeleton-line" style="width: 80%; height: 12px;"></div>
                </div>
              `).join('')}
            </div>
            
            <h3 style="margin-bottom: var(--spacing-md); margin-top: var(--spacing-xl); font-size: clamp(var(--font-size-base), 3vw, var(--font-size-lg)); word-wrap: break-word;">Experience</h3>
            <div style="position: relative; padding: var(--spacing-xl) var(--spacing-lg);">
              ${Array(3).fill(0).map(() => `
                <div style="margin-bottom: var(--spacing-xl); margin-left: var(--spacing-2xl); position: relative;">
                  <div style="position: absolute; left: -52px; top: 0; width: 20px; height: 20px; border-radius: 50%; background-color: var(--color-bg-secondary);"></div>
                  <div style="background-color: var(--color-bg-secondary); padding: var(--spacing-lg); border-radius: 8px;">
                    <div class="skeleton-line" style="width: 30%; height: 12px; margin-bottom: var(--spacing-sm);"></div>
                    <div class="skeleton-line" style="width: 60%; height: 16px; margin-bottom: var(--spacing-sm);"></div>
                    <div class="skeleton-line" style="width: 40%; height: 12px;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <h3 style="margin-bottom: var(--spacing-md); margin-top: var(--spacing-lg); font-size: clamp(var(--font-size-base), 3vw, var(--font-size-lg)); word-wrap: break-word;">Acknowledgements</h3>
            <div style="position: relative; overflow: hidden; margin-bottom: var(--spacing-lg); min-height: 120px; width: 100%; box-sizing: border-box;">
              <div style="padding: clamp(var(--spacing-md), 3vw, var(--spacing-lg)); background: var(--color-bg-secondary); border-radius: 12px; border-left: 3px solid var(--color-accent); box-sizing: border-box;">
                <div class="skeleton-line" style="width: 100%; height: 16px; margin-bottom: var(--spacing-sm);"></div>
                <div class="skeleton-line" style="width: 90%; height: 16px; margin-bottom: var(--spacing-md);"></div>
                <div class="skeleton-line" style="width: 40%; height: 12px; margin-bottom: var(--spacing-xs);"></div>
                <div class="skeleton-line" style="width: 50%; height: 12px;"></div>
              </div>
            </div>
          </section>
        </div>
      `;
    }
    return;
  }
  
  const skillsData = window.__expertise || Object.values(getMockSkillsDetailed());
  const timeline = window.__experience || getMockTimeline();
  const acknowledgements = window.__acknowledgements || getMockTestimonials();
  
  const feedContainer = query('#feed-container');
  if (!feedContainer) return;

  const aboutMeContent = window.__aboutMeContent || {};
  const headline = aboutMeContent.headline || 'I\'m passionate about building performant, accessible web experiences that delight users.';
  const description = aboutMeContent.description || 'My focus is on creating scalable architectures and optimizing every byte. With expertise in modern web standards and a deep understanding of performance optimization, I help teams deliver exceptional digital experiences.';

  const aboutHTML = `
    <div style="width: 100%; max-width: 100%; padding: 0; overflow-x: hidden;">
      <section style="padding: clamp(var(--spacing-md), 4vw, var(--spacing-xl)) clamp(var(--spacing-md), 3vw, var(--spacing-lg)); width: 100%; box-sizing: border-box;">
        <h2 style="margin-bottom: var(--spacing-lg); font-size: clamp(var(--font-size-lg), 5vw, var(--font-size-2xl)); word-wrap: break-word;">About Me</h2>
        
        <p style="margin-bottom: var(--spacing-md); line-height: var(--line-height-relaxed); color: var(--color-text-secondary); font-weight: 500; word-wrap: break-word;">
          ${headline}
        </p>
        <p style="margin-bottom: var(--spacing-xl); line-height: var(--line-height-relaxed); color: var(--color-text-secondary); word-wrap: break-word;">
          ${description}
        </p>

        <!-- Skills Grid -->
        <h3 style="margin-bottom: var(--spacing-lg); font-size: clamp(var(--font-size-base), 4vw, var(--font-size-xl)); word-wrap: break-word;">Skills & Expertise</h3>
        <div style="display: grid; grid-template-columns: 1fr; gap: clamp(var(--spacing-md), 3vw, var(--spacing-lg)); margin-bottom: var(--spacing-xl); width: 100%; box-sizing: border-box; @media (min-width: 768px) { grid-template-columns: repeat(auto-fit, minmax(clamp(180px, 40vw, 250px), 1fr)); }">
          ${skillsData.map((skillGroup, index) => `
            <div class="skill-card observe-fade-in" style="animation-delay: ${index * 100}ms; width: 100%; box-sizing: border-box;">
              <h4 style="margin-bottom: var(--spacing-md); color: var(--color-accent); font-weight: 600; word-wrap: break-word;">${skillGroup.category}</h4>
              <div style="display: flex; flex-wrap: wrap; gap: var(--spacing-sm); margin-bottom: var(--spacing-md);">
                ${skillGroup.skills.map(skill => `
                  <span class="skill-tag">${skill}</span>
                `).join('')}
              </div>
              <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin: 0; word-wrap: break-word;">
                <strong>Proficiency:</strong> ${skillGroup.proficiency}
              </p>
            </div>
          `).join('')}
        </div>

        <!-- Timeline -->
        <h3 style="margin-bottom: var(--spacing-md); margin-top: var(--spacing-xl); font-size: clamp(var(--font-size-base), 3vw, var(--font-size-lg)); word-wrap: break-word;">Experience</h3>
        <div class="timeline" style="margin-bottom: var(--spacing-lg); padding: clamp(var(--spacing-md), 2vw, var(--spacing-lg)) 0; width: 100%; box-sizing: border-box;">
          ${timeline.map((item, index) => `
            <a href="#experience/${item.id}" class="timeline-item observe-fade-in" style="animation-delay: ${index * 100}ms; text-decoration: none; color: inherit; display: block; width: 100%; box-sizing: border-box;">
              <div class="timeline-marker"></div>
              <div class="timeline-content" style="word-wrap: break-word;">
                <div class="timeline-date">${item.date}</div>
                <div class="timeline-title">${item.title}</div>
                ${item.organization ? `<div class="timeline-organization" style="font-size: var(--font-size-xs); color: var(--color-text-tertiary);">${item.organization}</div>` : ''}
              </div>
            </a>
          `).join('')}
        </div>

        <!-- Acknowledgements -->
        <h3 style="margin-bottom: var(--spacing-md); margin-top: var(--spacing-lg); font-size: clamp(var(--font-size-base), 3vw, var(--font-size-lg)); word-wrap: break-word;">Acknowledgements</h3>
        <div class="carousel-container" data-carousel="acknowledgements" style="position: relative; overflow: hidden; margin-bottom: var(--spacing-lg); min-height: 120px; width: 100%; box-sizing: border-box;">
          <div class="carousel-track" style="display: flex; transition: transform 0.5s ease-in-out; width: 100%; box-sizing: border-box;">
            ${acknowledgements.map((item, index) => `
              <div class="carousel-slide" style="min-width: 100%; padding: clamp(var(--spacing-md), 3vw, var(--spacing-lg)); background: var(--color-bg-secondary); border-radius: 12px; border-left: 3px solid var(--color-accent); box-sizing: border-box;">
                <div style="font-size: clamp(var(--font-size-sm), 2.5vw, var(--font-size-base)); color: var(--color-text-secondary); line-height: 1.6; word-wrap: break-word;">
                  "${item.quote}"
                </div>
                <div style="margin-top: var(--spacing-md); font-size: clamp(var(--font-size-sm), 2vw, var(--font-size-base)); font-weight: 600; word-wrap: break-word;">${item.author}</div>
                <div style="font-size: clamp(var(--font-size-xs), 1.5vw, var(--font-size-sm)); color: var(--color-text-tertiary); word-wrap: break-word;">${item.role}</div>
              </div>
            `).join('')}
          </div>
          <div class="carousel-dots" style="display: flex; justify-content: center; gap: clamp(6px, 2vw, 10px); margin-top: var(--spacing-md);">
            ${acknowledgements.map((_, i) => `<span class="carousel-dot" data-index="${i}" style="width: clamp(8px, 2vw, 10px); height: clamp(8px, 2vw, 10px); border-radius: 50%; background: var(--color-text-tertiary); cursor: pointer;"></span>`).join('')}
          </div>
        </div>
      </section>
    </div>
  `;

  feedContainer.innerHTML = aboutHTML;
  initCarousel('acknowledgements');
  fadeInPageSection(feedContainer);
  setTimeout(() => {
    initScrollAnimations();
    addCardHoverAnimations();
  }, 100);
}

function showProjectsView() {
  setActiveNavByView('projects');
  setActiveMobileNavByView('projects');
  const profileHeader = query('#profile-header');
  if (profileHeader) {
    profileHeader.style.display = 'none';
    profileHeader.classList.remove('active');
  }
  
  const feedContainer = query('#feed-container');
  if (!feedContainer) return;

  const isLoading = isLoadingProjects();
  if (allProjects.length === 0 || isLoading) {
    feedContainer.innerHTML = `
      <section style="padding: var(--spacing-xl) var(--spacing-lg);">
        <h2 style="margin-bottom: var(--spacing-lg); font-size: var(--font-size-2xl);">My Projects</h2>
        <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
          ${Array(3).fill(0).map(() => `
            <div class="skeleton-card">
              <div style="display: flex; gap: var(--spacing-md);">
                <div class="skeleton-avatar skeleton-avatar-circular" style="width: 48px; height: 48px;"></div>
                <div style="flex: 1;">
                  <div class="skeleton-line" style="width: 60%;"></div>
                  <div class="skeleton-line" style="width: 40%; height: 12px;"></div>
                </div>
              </div>
              <div class="skeleton-line" style="margin-top: var(--spacing-md); height: 20px; width: 80%;"></div>
              <div class="skeleton-line" style="margin-top: var(--spacing-sm); height: 16px; width: 100%;"></div>
              <div class="skeleton-line" style="margin-top: var(--spacing-sm); height: 16px; width: 90%;"></div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
    return;
  }

  const projectsHTML = `
    <section style="padding: var(--spacing-xl) var(--spacing-lg);">
      <h2 style="margin-bottom: var(--spacing-lg); font-size: var(--font-size-2xl);">My Projects</h2>
      <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
        ${allProjects.map((project, index) => `
          <a href="#project/${project.id}" style="text-decoration: none; color: inherit;">
            <article class="card observe-fade-in" style="animation-delay: ${index * 100}ms; cursor: pointer;">
              <div class="card-header">
                <img 
                  src="../img/hero.jpeg" 
                  alt="${project.author} avatar" 
                  class="card-avatar"
                  loading="lazy"
                />
                <div class="card-meta">
                  <div class="card-author">${project.author || 'Project'}</div>
<div class="card-date">${project.date ? new Date(project.date).toLocaleDateString() : ''}</div>
                </div>
              </div>
              <h3 class="card-title">${project.title}</h3>
              ${project.image ? `<img src="${project.image}" alt="${project.title}" class="card-image" loading="lazy"/>` : ''}
              <p class="card-description">${project.description}</p>
              <div class="card-footer">
                <div class="card-tags">
                  ${(project.tags || []).map(tag => `
                    <a href="#tag/${tag}" class="tag" data-tag="${tag}" onclick="event.stopPropagation();">${tag}</a>
                  `).join('')}
                </div>
              </div>
            </article>
          </a>
        `).join('')}
      </div>
    </section>
  `;

  feedContainer.innerHTML = projectsHTML;
  fadeInPageSection(feedContainer);
  setTimeout(() => {
    initScrollAnimations();
    addCardHoverAnimations();
  }, 100);
}

function showArticlesView() {
  setActiveNavByView('articles');
  setActiveMobileNavByView('articles');
  const profileHeader = query('#profile-header');
  if (profileHeader) {
    profileHeader.style.display = 'none';
    profileHeader.classList.remove('active');
  }
  
  const feedContainer = query('#feed-container');
  if (!feedContainer) return;

  const isLoading = isLoadingArticles();
  if (allPosts.length === 0 || isLoading) {
    feedContainer.innerHTML = `
      <section style="padding: var(--spacing-xl) var(--spacing-lg);">
        <h2 style="margin-bottom: var(--spacing-lg); font-size: var(--font-size-2xl);">Stories and Articles</h2>
        <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
          ${Array(3).fill(0).map(() => `
            <div class="skeleton-card">
              <div style="display: flex; gap: var(--spacing-md);">
                <div class="skeleton-avatar skeleton-avatar-circular" style="width: 48px; height: 48px;"></div>
                <div style="flex: 1;">
                  <div class="skeleton-line" style="width: 60%;"></div>
                  <div class="skeleton-line" style="width: 40%; height: 12px;"></div>
                </div>
              </div>
              <div class="skeleton-line" style="margin-top: var(--spacing-md); height: 20px; width: 80%;"></div>
              <div class="skeleton-line" style="margin-top: var(--spacing-sm); height: 16px; width: 100%;"></div>
              <div class="skeleton-line" style="margin-top: var(--spacing-sm); height: 16px; width: 90%;"></div>
            </div>
          `).join('')}
        </div>
      </section>
    `;
    return;
  }

  const articlesHTML = `
    <section style="padding: var(--spacing-xl) var(--spacing-lg);">
      <h2 style="margin-bottom: var(--spacing-lg); font-size: var(--font-size-2xl);">Stories and Articles</h2>
      <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
        ${allPosts.map((post, index) => `
          <a href="#article/${post.id}" style="text-decoration: none; color: inherit;">
            <article class="card observe-fade-in" style="animation-delay: ${index * 100}ms; cursor: pointer;">
              <div class="card-header">
                <img 
                  src="../img/hero.jpeg" 
                  alt="${post.author} avatar" 
                  class="card-avatar"
                  loading="lazy"
                />
                <div class="card-meta">
                  <div class="card-author">${post.author || 'Author'}</div>
                  <div class="card-date">${new Date(post.createdAt).toLocaleDateString()} · ${post.readTime || '5 min read'}</div>
                </div>
              </div>
              <h3 class="card-title">${post.title}</h3>
              ${post.image ? `<img src="../img/hero.jpeg" class="card-image" loading="lazy"/>` : ''}
              <p class="card-description">${post.description}</p>
              <div class="card-footer">
                <div class="card-tags">
                  ${(post.tags || []).map(tag => `
                    <a href="#tag/${tag}" class="tag" data-tag="${tag}" onclick="event.stopPropagation();">${tag}</a>
                  `).join('')}
                </div>
              </div>
            </article>
          </a>
        `).join('')}
      </div>
    </section>
  `;

  feedContainer.innerHTML = articlesHTML;
  fadeInPageSection(feedContainer);
  setTimeout(() => {
    initScrollAnimations();
    addCardHoverAnimations();
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
  const profileHeader = query('#profile-header');
  if (profileHeader) {
    profileHeader.style.display = 'none';
    profileHeader.classList.remove('active');
  }

  setCurrentFilter(tag);
  const combinedItems = [...allPosts, ...allProjects];
  renderFilteredFeed(combinedItems, tag);
}

function showProjectDetailView(id) {
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

  const feedContainer = query('#feed-container');
  if (!feedContainer) return;

  // Show skeleton while loading
  feedContainer.innerHTML = createProjectDetailSkeleton().innerHTML;

  // Simulate loading delay for better UX
  setTimeout(() => {
    // Scroll to top before rendering content
    window.scrollTo(0, 0);

    const projectDetailHTML = `
      <section style="padding: var(--spacing-lg) var(--spacing-md);">
        <div style="margin-bottom: var(--spacing-lg);">
          <button onclick="history.back()" style="background: none; border: none; color: var(--color-accent); cursor: pointer; font-size: var(--font-size-sm); margin-bottom: var(--spacing-lg);">← Back to Projects</button>
        </div>

        <article class="card observe-fade-in">
          <div class="card-header">
            <img
              src="../img/hero.jpeg"
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
    setTimeout(() => {
      initScrollAnimations();
    }, 100);
  }, 800);
}

function showArticleDetailView(id) {
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

  const feedContainer = query('#feed-container');
  if (!feedContainer) return;

  // Show skeleton while loading
  feedContainer.innerHTML = createArticleDetailSkeleton().innerHTML;

  // Simulate loading delay for better UX
  setTimeout(() => {
    // Scroll to top before rendering content
    window.scrollTo(0, 0);

    const articleDetailHTML = `
      <section style="padding: var(--spacing-lg) var(--spacing-md);">
        <div style="margin-bottom: var(--spacing-lg);">
          <button onclick="history.back()" style="background: none; border: none; color: var(--color-accent); cursor: pointer; font-size: var(--font-size-sm); margin-bottom: var(--spacing-lg);">← Back to list</button>
        </div>

        <article class="card observe-fade-in">
          <div class="card-header">
            <img
              src="../img/hero.jpeg"
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
