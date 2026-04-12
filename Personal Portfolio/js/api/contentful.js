/* Contentful API Client */

function getEnvVar(name, fallback = '') {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[name] || fallback;
  }
  return window.__ENV?.[name] || fallback;
}

const CONTENTFUL_SPACE_ID = getEnvVar('VITE_CONTENTFUL_SPACE_ID', 'pud4r27oprf4');
const CONTENTFUL_ACCESS_TOKEN = getEnvVar('VITE_CONTENTFUL_ACCESS_TOKEN') || getEnvVar('CONTENTFUL_TOKEN', 'XxZb6GZbJDyeNX06V168hBXbhVW4Q41UbLtEUSe0M84');
const CONTENTFUL_ENVIRONMENT = 'master';

console.log('Contentful config loaded:', { SPACE_ID: CONTENTFUL_SPACE_ID, TOKEN: CONTENTFUL_ACCESS_TOKEN ? 'set' : 'missing' });

const API_URL = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/${CONTENTFUL_ENVIRONMENT}`;

class ContentfulClient {
  constructor() {
    this.cache = {};
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  async fetch(url, options = {}) {
    const cacheKey = url;
    const cached = this.cache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${CONTENTFUL_ACCESS_TOKEN}`,
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`Contentful API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the response
      this.cache[cacheKey] = {
        data,
        timestamp: Date.now()
      };

      return data;
    } catch (error) {
      console.error('Contentful fetch error:', error);
      throw error;
    }
  }

  async getEntries(contentType, params = {}) {
    const query = new URLSearchParams({
      'content_type': contentType,
      'order': '-sys.createdAt',
      'limit': 100,
      ...params
    });

    const url = `${API_URL}/entries?${query}`;
    const response = await this.fetch(url);
    
    return this.processEntries(response);
  }

  async getEntry(id) {
    const url = `${API_URL}/entries/${id}`;
    const response = await this.fetch(url);
    
    return this.processEntry(response);
  }

  async getAsset(id) {
    const url = `${API_URL}/assets/${id}`;
    return await this.fetch(url);
  }

  processEntry(entry) {
    if (!entry) return null;
    
    return {
      id: entry.sys.id,
      type: entry.sys.contentType.sys.id,
      createdAt: entry.sys.createdAt,
      updatedAt: entry.sys.updatedAt,
      ...entry.fields
    };
  }

  processEntries(response) {
    if (!response.items) return [];
    
    return response.items.map(entry => this.processEntry(entry));
  }

  clearCache() {
    this.cache = {};
  }
}

const client = new ContentfulClient();

export async function testConnection() {
  const hasToken = CONTENTFUL_ACCESS_TOKEN && !CONTENTFUL_ACCESS_TOKEN.startsWith('YOUR_');
  const hasSpaceId = CONTENTFUL_SPACE_ID && !CONTENTFUL_SPACE_ID.startsWith('YOUR_') && CONTENTFUL_SPACE_ID !== '';
  
  if (!hasToken && !hasSpaceId) {
    console.log('⚠️ Contentful not configured - using mock data');
    return false;
  }
  
  if (hasToken && !hasSpaceId) {
    console.log('⚠️ Contentful token found but missing SPACE_ID - using mock data');
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/entries?limit=1`, {
      headers: {
        'Authorization': `Bearer ${CONTENTFUL_ACCESS_TOKEN}`
      }
    });

    if (response.ok) {
      console.log('✅ Successfully connected to Contentful');
      return true;
    } else {
      console.error('❌ Contentful connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Contentful connection error:', error.message);
    return false;
  }
}

export async function fetchPosts() {
  try {
    const response = await client.fetch(`${API_URL}/entries?content_type=article&order=-fields.date&limit=50&include=2`);
    const assetMap = {};
    
    if (response.includes && response.includes.Asset) {
      response.includes.Asset.forEach(asset => {
        assetMap[asset.sys.id] = 'https:' + asset.fields.file.url;
      });
    }
    
    const posts = (response.items || []).map(entry => {
      const fields = entry.fields || {};
      let imageUrl = null;
      
      if (fields.article_image && fields.article_image.sys && fields.article_image.sys.id) {
        const assetId = fields.article_image.sys.id;
        if (assetMap[assetId]) {
          imageUrl = assetMap[assetId];
        }
      }
      
      return {
        id: entry.sys.id,
        type: 'article',
        title: fields.title || '',
        description: fields.headline || '',
        content: fields.articleContent ? extractRichText(fields.articleContent) : '',
        contentRaw: fields.articleContent,
        assetMap: assetMap,
        tags: fields.tags || [],
        link: fields.articleLink || '',
        author: 'Bruce Takura Chimoyo',
        avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
        date: fields.date || entry.sys.createdAt,
        image: imageUrl,
        createdAt: entry.sys.createdAt,
        readTime: fields.readTime || '5 min read'
      };
    });
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function fetchProjects() {
  try {
    const response = await client.fetch(`${API_URL}/entries?content_type=project&order=-sys.createdAt&limit=50&include=2`);
    const assetMap = {};
    
    if (response.includes && response.includes.Asset) {
      response.includes.Asset.forEach(asset => {
        assetMap[asset.sys.id] = asset.fields.file.url;
      });
    }
    
    const projects = (response.items || []).map(entry => {
      const fields = entry.fields || {};
      let imageUrl = null;
      
      if (fields.projectImage && fields.projectImage.sys && fields.projectImage.sys.id) {
        const assetId = fields.projectImage.sys.id;
        if (assetMap[assetId]) {
          imageUrl = 'https:' + assetMap[assetId];
        }
      }
      
      return {
        id: entry.sys.id,
        type: 'project',
        title: fields.title || '',
        description: fields.headline || '',
        content: fields.projectDescription ? extractRichText(fields.projectDescription) : '',
        contentRaw: fields.projectDescription,
        assetMap: assetMap,
        technologies: fields.technologies || [],
        features: fields.keyFeatures || [],
        tags: fields.tags || [],
        link: fields.liveLink || '',
        author: 'Bruce Takura Chimoyo',
        avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
        date: fields.date || entry.sys.createdAt,
        image: imageUrl,
        createdAt: entry.sys.createdAt
      };
    });
    return projects.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

function extractRichText(richText) {
  if (!richText || !richText.content) return '';
  return richText.content
    .filter(block => block.nodeType === 'paragraph')
    .map(block => block.content
      .filter(node => node.nodeType === 'text')
      .map(node => node.value)
      .join('')
    )
    .join(' ')
    .substring(0, 300) + '...';
}

export async function fetchProjectById(id) {
  try {
    const response = await client.fetch(`${API_URL}/entries/${id}?include=2`);
    const assetMap = {};
    
    if (response.includes && response.includes.Asset) {
      response.includes.Asset.forEach(asset => {
        assetMap[asset.sys.id] = asset.fields.file.url;
      });
    }
    
    const entry = response;
    const fields = entry.fields || {};
    let imageUrl = null;
    
    if (fields.projectImage && fields.projectImage.sys && fields.projectImage.sys.id) {
      const assetId = fields.projectImage.sys.id;
      if (assetMap[assetId]) {
        imageUrl = 'https:' + assetMap[assetId];
      }
    }
    
    return {
      id: entry.sys.id,
      type: 'project',
      title: fields.title || '',
      description: fields.headline || '',
      content: fields.projectDescription ? extractRichText(fields.projectDescription) : '',
      contentRaw: fields.projectDescription,
      assetMap: assetMap,
      technologies: fields.technologies || [],
      features: fields.keyFeatures || [],
      tags: fields.tags || [],
      link: fields.liveLink || '',
      author: 'Bruce Takura Chimoyo',
      avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
      date: fields.date || entry.sys.createdAt,
      image: imageUrl,
      createdAt: entry.sys.createdAt
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

export async function fetchProfile() {
  try {
    const profiles = await client.getEntries('profile', { limit: 1 });
    return profiles[0] || null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function fetchHeroText() {
  try {
    const entries = await client.getEntries('heroText', { limit: 1 });
    return entries[0] || null;
  } catch (error) {
    console.error('Error fetching heroText:', error);
    return null;
  }
}

export async function fetchAboutMeStats() {
  try {
    const entries = await client.getEntries('aboutMeStats', { order: '-sys.createdAt' });
    return entries.map(entry => ({
      label: entry.title,
      value: entry.count
    }));
  } catch (error) {
    console.error('Error fetching aboutMeStats:', error);
    return [];
  }
}

export async function fetchAboutMeContent() {
  try {
    const entries = await client.getEntries('aboutMeContent', { limit: 1 });
    const entry = entries[0];
    return entry ? {
      headline: entry.headline,
      description: entry.description
    } : null;
  } catch (error) {
    console.error('Error fetching aboutMeContent:', error);
    return null;
  }
}

export async function fetchSocials(contentType = 'social') {
  console.log('Fetching socials...');
  try {
    const entries = await client.getEntries(contentType);
    console.log('socials entries:', entries);
    return entries.map(entry => ({
      name: entry.platform,
      url: entry.link
    }));
  } catch (error) {
    console.error('Error fetching socials:', error);
    return [];
  }
}

export async function fetchExpertise() {
  try {
    const entries = await client.getEntries('expertise');
    return entries.map(entry => ({
      category: entry.specialty,
      skills: entry.skills || [],
      proficiency: entry.proficiency
    }));
  } catch (error) {
    console.error('Error fetching expertise:', error);
    return [];
  }
}

export async function fetchPopularTags() {
  console.log('Fetching popularTags...');
  try {
    const entries = await client.getEntries('popularTags');
    console.log('popularTags entries:', entries);
    return entries.map(entry => entry.tags || []).flat();
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    return [];
  }
}

export async function fetchSkillTags() {
  console.log('Fetching skillTags...');
  try {
    const entries = await client.getEntries('skillTags');
    console.log('skillTags entries:', entries);
    return entries.map(entry => entry.skills || []).flat();
  } catch (error) {
    console.error('Error fetching skill tags:', error);
    return [];
  }
}

export async function fetchExperience() {
  console.log('Fetching experience from Contentful...');
  try {
    const response = await client.fetch(`${API_URL}/entries?content_type=experience&order=-fields.period&limit=100`);
    console.log('Experience API response:', response);
    
    const experiences = (response.items || []).map(entry => {
      const fields = entry.fields || {};
      return {
        id: entry.sys.id,
        date: fields.period || '',
        title: fields.position || '',
        description: fields.leading_text || '',
        organization: fields.organization || '',
        responsibilities: fields.responsibilities || [],
        achievements: fields.achievements || [],
        technologies: fields.technologies || [],
        impact: fields.impact || [],
        period: fields.period || ''
      };
    });
    console.log('Parsed experiences:', experiences);
    return experiences;
  } catch (error) {
    console.error('Error fetching experience:', error);
    return [];
  }
}

export async function fetchAcknowledgements() {
  try {
    const entries = await client.getEntries('acknowledgement');
    return entries.map(entry => ({
      quote: entry.acknowledgement,
      author: entry.author,
      role: entry.position
    }));
  } catch (error) {
    console.error('Error fetching acknowledgements:', error);
    return [];
  }
}

export function getContentfulClient() {
  return client;
}

// Mock data for development/testing
export function getMockProfile() {
  return {
    id: 'mock-profile',
    type: 'profile',
    name: 'Bruce Takura Chimoyo',
    bio: 'Full-stack developer & frontend architect specializing in performance and accessibility. Building fast, inclusive web experiences.',
    avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
    coverImage: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&h=400&fit=crop',
    email: 'bruce@example.com',
    location: 'San Francisco, CA',
    website: 'https://example.com',
    social: [
      { name: 'GitHub', url: 'https://github.com/brucechimoyo' },
      { name: 'LinkedIn', url: 'https://linkedin.com/in/brucechimoyo' },
      { name: 'Twitter', url: 'https://twitter.com/brucechimoyo' }
    ],
    stats: [
      { label: 'Articles', value: 28 },
      { label: 'Projects', value: 15 },
      { label: 'Followers', value: 2500 }
    ],
    skills: ['JavaScript', 'React', 'Vue.js', 'TypeScript', 'Node.js', 'CSS', 'Performance', 'Accessibility', 'Web APIs', 'GraphQL']
  };
}

export function getMockPosts() {
  return [
    {
      id: 'post-1',
      type: 'post',
      title: 'Building Lighthouse 98+ Web Applications',
      description: 'A comprehensive guide to achieving exceptional performance scores through critical CSS, lazy loading, and smart JavaScript deferring.',
      content: `Performance is not just a feature—it's a fundamental requirement for modern web applications. In this comprehensive guide, I'll walk you through proven strategies for achieving Lighthouse scores of 98 and above.

## The Foundation: Critical CSS

The first step to high Lighthouse scores is implementing critical CSS properly. Critical CSS is the CSS required to render the above-the-fold content. By inlining this CSS directly in the HTML head, we eliminate render-blocking resources.

Here's how to implement it:

\`\`\`javascript
// Critical CSS extraction script
const critical = require('critical');

critical.generate({
  inline: true,
  base: 'dist/',
  src: 'index.html',
  dest: 'index.html',
  width: 1300,
  height: 900
});
\`\`\`

## Lazy Loading Everything

Lazy loading is no longer optional. Modern browsers support native lazy loading for images, but we need to extend this to other resources.

### Images
\`\`\`html
<img loading="lazy" src="image.jpg" alt="Description">
\`\`\`

### JavaScript Modules
Defer non-critical JavaScript using dynamic imports:

\`\`\`javascript
// Load heavy components only when needed
const loadHeavyComponent = () => import('./heavy-component.js');
\`\`\`

## JavaScript Optimization

### Code Splitting
Split your bundle into logical chunks:

\`\`\`javascript
// webpack.config.js
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all'
      }
    }
  }
}
\`\`\`

### Tree Shaking
Ensure you're only shipping used code by enabling tree shaking in your bundler.

## Conclusion

Achieving 98+ Lighthouse scores requires attention to detail across multiple areas. Focus on critical rendering path optimization, efficient resource loading, and minimal JavaScript execution. The result is not just better scores, but genuinely faster user experiences.`,
      author: 'Bruce Takura Chimoyo',
      avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ['Performance', 'Lighthouse', 'Web Development'],
      readTime: '8 min read'
    },
    {
      id: 'post-2',
      type: 'post',
      title: 'Accessible Component Design: Beyond WCAG Compliance',
      description: 'Creating truly inclusive web experiences means going beyond checkbox accessibility. Learn how to design components that delight all users.',
      content: `Accessibility compliance is the baseline, not the finish line. Real inclusive design means considering edge cases, user preferences, and cognitive load. Let's explore practical patterns for building components that work beautifully for everyone.

## The Inclusive Mindset

Accessibility isn't just about following guidelines—it's about understanding diverse user needs and experiences. When we design with inclusion in mind, we create better experiences for all users.

## Focus Management Patterns

Proper focus management is crucial for keyboard navigation:

\`\`\`javascript
class AccessibleModal extends Component {
  componentDidMount() {
    // Store the currently focused element
    this.previouslyFocusedElement = document.activeElement;
    
    // Focus the modal
    this.modalRef.focus();
    
    // Trap focus within modal
    this.modalRef.addEventListener('keydown', this.handleKeyDown);
  }
  
  handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      this.props.onClose();
    }
    
    if (event.key === 'Tab') {
      // Implement focus trapping
      this.trapFocus(event);
    }
  }
}
\`\`\`

## Semantic HTML First

Always start with semantic HTML before adding ARIA:

\`\`\`html
<!-- Good: Uses semantic elements -->
<button aria-expanded="false" aria-controls="menu">
  Menu
</button>
<nav id="menu" hidden>
  <!-- Navigation content -->
</nav>

<!-- Avoid: Overusing ARIA when not needed -->
<div role="button" tabindex="0" aria-expanded="false">
  Menu
</div>
\`\`\`

## Color and Contrast

Beyond WCAG contrast ratios, consider color blindness and different lighting conditions:

\`\`\`css
/* Use CSS custom properties for consistent theming */
:root {
  --color-primary: #0066cc;
  --color-primary-hover: #0052a3;
  --color-text-on-primary: #ffffff;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  --color-primary: #000000;
  --color-text-on-primary: #ffffff;
}
\`\`\`

## Motion and Animation

Respect user motion preferences:

\`\`\`css
/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
\`\`\`

## Testing Strategies

Test with real users and assistive technologies:

- Screen readers (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- Voice control software
- Browser zoom and high contrast modes

## Conclusion

Building accessible components requires empathy, technical knowledge, and iterative testing. When done right, accessibility becomes invisible—users can accomplish their goals without friction or frustration.`,
      author: 'Bruce Takura Chimoyo',
      avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      tags: ['Accessibility', 'Web Standards', 'UX Design'],
      readTime: '10 min read'
    },
    {
      id: 'post-3',
      type: 'post',
      title: 'CSS Architecture for Large-Scale Applications',
      description: 'Practical patterns for organizing CSS at scale without sacrificing maintainability. Learn about utility classes, component scoping, and design tokens.',
      content: 'As your application grows, CSS maintenance becomes increasingly challenging. This guide covers battle-tested patterns I\'ve used in production applications handling millions of users...',
      author: 'Bruce Takura Chimoyo',
      avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      tags: ['CSS', 'Architecture', 'Scalability'],
      readTime: '9 min read'
    },
    {
      id: 'post-4',
      type: 'post',
      title: 'The Case for Vanilla JavaScript: When Frameworks Aren\'t Needed',
      description: 'Modern frameworks are powerful, but not every project needs them. Discover when vanilla JavaScript is the right choice and how to build maintainable apps without dependencies.',
      content: 'The JavaScript ecosystem is sometimes overwhelming with choices. But there\'s elegance and power in vanilla JavaScript when applied thoughtfully. Let me share my approach...',
      author: 'Bruce Takura Chimoyo',
      avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      tags: ['JavaScript', 'Best Practices', 'Web Development'],
      readTime: '12 min read'
    },
    {
      id: 'post-5',
      type: 'post',
      title: 'Image Optimization Techniques That Actually Work',
      description: 'Learn modern image formats, lazy loading strategies, and responsive image techniques that reduce bandwidth and improve Core Web Vitals.',
      content: 'Images are often the largest assets in web applications. Proper optimization can dramatically improve performance. Here are the techniques I use in production...',
      author: 'Bruce Takura Chimoyo',
      avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
      createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      tags: ['Performance', 'Images', 'Web Optimization'],
      readTime: '7 min read'
    },
    {
      id: 'post-6',
      type: 'post',
      title: 'State Management Without Redux: Lightweight Alternatives',
      description: 'Explore minimalist approaches to state management that scale better for many applications than heavyweight frameworks.',
      content: 'Redux revolutionized state management, but it\'s not always the right choice. Let me introduce you to lightweight alternatives that keep your bundle small while staying maintainable...',
      author: 'Bruce Takura Chimoyo',
      avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
      createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000),
      tags: ['State Management', 'JavaScript', 'Architecture'],
      readTime: '11 min read'
    }
  ];
}

export function getMockProjects() {
  return [
    {
      id: 'project-1',
      type: 'project',
      title: 'Portfolio Template (This Site!)',
      description: 'Production-ready developer portfolio with Twitter-inspired design, zero dependencies, and Lighthouse 98+ scores.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
      link: 'https://github.com/brucechimoyo/portfolio',
      author: 'Bruce Takura Chimoyo',
      avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      tags: ['Portfolio', 'Vanilla JS', 'Performance'],
      featured: true,
      content: 'This portfolio template showcases modern web development practices with a focus on performance and accessibility. Built without any framework dependencies, it achieves Lighthouse scores of 98+ through careful optimization of CSS, JavaScript, and images. The design is inspired by social media platforms but adapted for developer portfolios.',
      technologies: ['HTML5', 'CSS3', 'Vanilla JavaScript', 'ES6 Modules', 'Intersection Observer API', 'CSS Grid', 'Flexbox'],
      features: [
        'Responsive design that works on all devices',
        'Dark/light theme toggle with system preference detection',
        'Smooth scroll animations and transitions',
        'Lazy loading for images and content',
        'Keyboard navigation support',
        'Progressive enhancement approach',
        'Zero external dependencies'
      ]
    },
    {
      id: 'project-2',
      type: 'project',
      title: 'Performance Monitoring Dashboard',
      description: 'Real-time Web Vitals monitoring dashboard with historical trends, alerts, and team collaboration features. Built with Vue.js and WebGL visualizations.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      link: 'https://github.com/brucechimoyo/perf-dashboard',
      author: 'Bruce Takura Chimoyo',
      avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      tags: ['Vue.js', 'Performance', 'Dashboard'],
      featured: true,
      content: 'A comprehensive performance monitoring solution that tracks Core Web Vitals across multiple websites. Features real-time data visualization using WebGL for smooth 60fps animations, automated alerting system, and team collaboration tools. The dashboard helps developers identify performance bottlenecks and track improvements over time.',
      technologies: ['Vue.js 3', 'WebGL', 'Chart.js', 'Node.js', 'Express', 'MongoDB', 'Socket.io'],
      features: [
        'Real-time Web Vitals tracking (CLS, FID, LCP)',
        'Interactive WebGL charts and graphs',
        'Automated performance alerts',
        'Team collaboration and commenting',
        'Historical trend analysis',
        'Custom dashboards and reports',
        'API for integrating with CI/CD pipelines'
      ]
    },
    {
      id: 'project-3',
      type: 'project',
      title: 'Accessible Component Library',
      description: 'Comprehensive React component library with 40+ components, full keyboard navigation, screen reader support, and Storybook documentation.',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=600&h=400&fit=crop',
      link: 'https://github.com/brucechimoyo/accessible-components',
      author: 'Bruce Takura Chimoyo',
      avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      tags: ['React', 'Accessibility', 'Components'],
      featured: true,
      content: 'A production-ready component library built with accessibility as the primary concern. Every component follows WCAG 2.1 AA guidelines with comprehensive keyboard navigation, screen reader support, and high contrast mode compatibility. Includes 40+ components from basic form elements to complex data visualization components.',
      technologies: ['React 18', 'TypeScript', 'Storybook', 'Jest', 'React Testing Library', 'CSS Modules', 'Framer Motion'],
      features: [
        'WCAG 2.1 AA compliant components',
        'Full keyboard navigation support',
        'Screen reader compatibility',
        'High contrast mode support',
        'Focus management and trapping',
        'Comprehensive Storybook documentation',
        'TypeScript definitions included',
        'Theme customization system'
      ]
    },
    {
      id: 'project-4',
      type: 'project',
      title: 'Image Optimization CLI Tool',
      description: 'Command-line tool for batch image optimization with automatic format conversion (WebP, AVIF), responsive image generation, and metadata stripping.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
      link: 'https://github.com/brucechimoyo/image-optimizer',
      author: 'Bruce Takura Chimoyo',
      avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
      createdAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
      tags: ['CLI', 'Performance', 'Images'],
      featured: false,
      content: 'A powerful command-line tool for optimizing images at scale. Automatically converts images to modern formats like WebP and AVIF, generates responsive image sets, and strips unnecessary metadata. Integrates with build pipelines and can process thousands of images efficiently.',
      technologies: ['Node.js', 'Sharp', 'Commander.js', 'Chalk', 'Ora', 'Glob'],
      features: [
        'Batch processing of multiple images',
        'Automatic format conversion (WebP, AVIF, JPEG, PNG)',
        'Responsive image generation',
        'Metadata stripping and optimization',
        'Lossless and lossy compression options',
        'Progress indicators and verbose logging',
        'Configurable quality settings',
        'Integration with CI/CD pipelines'
      ]
    },
    {
      id: 'project-5',
      type: 'project',
      title: 'CSS-in-JS Performance Analyzer',
      description: 'Tool to measure and optimize CSS-in-JS library performance. Analyzes bundle size, runtime overhead, and provides optimization recommendations.',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
      link: 'https://github.com/brucechimoyo/css-in-js-analyzer',
      author: 'Bruce Takura Chimoyo',
      avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      tags: ['CSS', 'Performance', 'Tools'],
      featured: false,
      content: 'A specialized tool for analyzing and optimizing CSS-in-JS library performance. Measures bundle size impact, runtime overhead, and provides actionable recommendations for improving performance. Supports popular libraries like styled-components, emotion, and CSS modules.',
      technologies: ['Node.js', 'Webpack Bundle Analyzer', 'Puppeteer', 'Lighthouse', 'Express', 'React'],
      features: [
        'Bundle size analysis and comparison',
        'Runtime performance benchmarking',
        'Automated optimization recommendations',
        'Support for multiple CSS-in-JS libraries',
        'Integration with build tools',
        'Performance regression detection',
        'Interactive web interface for results'
      ]
    },
    {
      id: 'project-6',
      type: 'project',
      title: 'Web Vitals Monitoring Library',
      description: 'Lightweight library for capturing and reporting Core Web Vitals data with advanced segmentation and custom event tracking capabilities.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f70e504c0?w=600&h=400&fit=crop',
      link: 'https://github.com/brucechimoyo/web-vitals-lib',
      author: 'Bruce Takura Chimoyo',
      avatar: 'https://i.pravatar.cc/150?u=brucechimoyo',
      createdAt: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000),
      tags: ['JavaScript', 'Performance', 'Analytics'],
      featured: false,
      content: 'A lightweight, zero-dependency library for capturing and reporting Core Web Vitals metrics. Provides advanced segmentation capabilities, custom event tracking, and seamless integration with analytics platforms. Helps developers monitor and improve user experience metrics.',
      technologies: ['JavaScript', 'Performance Observer API', 'Beacon API', 'Service Worker', 'IndexedDB'],
      features: [
        'Core Web Vitals tracking (CLS, FID, LCP, FCP, TTFB)',
        'Advanced user segmentation',
        'Custom event tracking',
        'Offline data persistence',
        'Integration with Google Analytics',
        'Real-time alerting system',
        'Privacy-focused data collection',
        'Minimal bundle size impact'
      ]
    }
  ];
}

export function getMockTestimonials() {
  return [
    {
      id: 'testimonial-1',
      quote: 'Bruce delivered an exceptional redesign of our platform. The performance improvements were immediately noticeable - our Lighthouse score jumped from 62 to 96.',
      author: 'Sarah Chen',
      role: 'VP Product, TechCorp',
      company: 'TechCorp'
    },
    {
      id: 'testimonial-2',
      quote: 'Working with Bruce on our accessibility audit was transformative. He not only fixed critical issues but also educated our team on best practices.',
      author: 'Michael Roberts',
      role: 'CTO, AccessFirst',
      company: 'AccessFirst'
    },
    {
      id: 'testimonial-3',
      quote: 'The component library Bruce built has become the foundation of our design system. The documentation and attention to detail are unmatched.',
      author: 'Emma Williams',
      role: 'Design Lead, CreativeStudio',
      company: 'CreativeStudio'
    },
    {
      id: 'testimonial-4',
      quote: 'Bruce is a rare combination of deep technical knowledge and excellent communication. He explained complex performance optimizations clearly to non-technical stakeholders.',
      author: 'David Johnson',
      role: 'Product Manager, ScaleUp Inc',
      company: 'ScaleUp Inc'
    }
  ];
}

export function getMockCaseStudies() {
  return [
    {
      id: 'case-1',
      title: 'E-commerce Platform Redesign - 97 Lighthouse Score',
      client: 'FastCart',
      challenge: 'The platform had a Lighthouse score of 48, causing high bounce rates and lost revenue.',
      solution: 'Implemented critical CSS inlining, lazy image loading with IntersectionObserver, code splitting, and optimized third-party scripts.',
      results: [
        'Lighthouse score: 48 → 97',
        'Page load time: 4.2s → 1.1s',
        'Conversion rate increase: +23%',
        'Bounce rate decrease: -31%'
      ]
    },
    {
      id: 'case-2',
      title: 'Accessible Component Library - WCAG AA Compliant',
      client: 'DesignHub',
      challenge: 'Needed a comprehensive component library that maintained accessibility standards across 40+ components.',
      solution: 'Built a modular component system with semantic HTML, ARIA labels, keyboard navigation, and screen reader testing.',
      results: [
        '40+ accessible components',
        'Zero accessibility violations',
        'Reduced development time: 40%',
        'Team adoption rate: 98%'
      ]
    },
    {
      id: 'case-3',
      title: 'Dashboard Modernization - Zero Dependencies',
      client: 'AnalyticsPro',
      challenge: 'Legacy dashboard with heavy dependencies and slow performance.',
      solution: 'Migrated to vanilla JavaScript with ES modules, modern CSS Grid, and WebGL visualizations.',
      results: [
        'Bundle size reduction: 72%',
        'Real-time updates: 45ms latency',
        'Zero external dependencies',
        'Mobile performance improved: 35%'
      ]
    }
  ];
}

export function getMockTimeline() {
  return [
    {
      id: 'timeline-1',
      date: '2024 - Present',
      title: 'Frontend Architect',
      organization: 'TechCorp',
      description: 'Leading performance optimization initiatives and mentoring junior engineers on modern web standards.'
    },
    {
      id: 'timeline-2',
      date: '2022 - 2023',
      title: 'Senior Engineer',
      organization: 'DesignHub',
      description: 'Built and maintained design system, improved accessibility compliance to WCAG AAA.'
    },
    {
      id: 'timeline-3',
      date: '2020 - 2022',
      title: 'Full-Stack Developer',
      organization: 'ScaleUp Inc',
      description: 'Architected scalable system handling 10M+ requests/month, achieved 98+ Lighthouse scores.'
    },
    {
      id: 'timeline-4',
      date: '2019 - 2020',
      title: 'Junior Developer',
      organization: 'WebAgency',
      description: 'Started professional web development career building client websites and web applications.'
    }
  ];
}

export function getMockSkillsDetailed() {
  return {
    frontend: {
      category: 'Frontend',
      skills: ['React', 'Vue.js', 'TypeScript', 'Next.js', 'Svelte'],
      proficiency: 'Expert'
    },
    css: {
      category: 'Styling & Design',
      skills: ['CSS Grid', 'Flexbox', 'CSS Animations', 'Tailwind CSS', 'SCSS', 'CSS Variables'],
      proficiency: 'Expert'
    },
    performance: {
      category: 'Performance',
      skills: ['Lighthouse', 'Web Vitals', 'Lazy Loading', 'Code Splitting', 'Caching Strategies'],
      proficiency: 'Expert'
    },
    accessibility: {
      category: 'Accessibility',
      skills: ['WCAG 2.1', 'ARIA', 'Keyboard Navigation', 'Screen Reader Testing', 'Semantic HTML'],
      proficiency: 'Advanced'
    },
    tools: {
      category: 'Tools & DevOps',
      skills: ['Git', 'Docker', 'CI/CD', 'Webpack', 'Vite', 'GitHub Actions'],
      proficiency: 'Advanced'
    }
  };
}

export function getMockCertifications() {
  return [
    {
      id: 'cert-1',
      title: 'Google Certified Professional - Web Developer',
      issuer: 'Google',
      date: '2024',
      credentialId: 'GCP-WD-2024-001',
      credentialUrl: 'https://google.com/verify',
      skills: ['Web Performance', 'Core Web Vitals', 'SEO'],
      icon: '🏆'
    },
    {
      id: 'cert-2',
      title: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      date: '2023',
      credentialId: 'AWS-CSA-2023-456',
      credentialUrl: 'https://aws.amazon.com/verify',
      skills: ['Cloud Architecture', 'Scalability', 'DevOps'],
      icon: '☁️'
    },
    {
      id: 'cert-3',
      title: 'Accessibility Specialist - IAAP CPRE',
      issuer: 'International Association of Accessibility Professionals',
      date: '2023',
      credentialId: 'IAAP-CPRE-2023-789',
      credentialUrl: 'https://iaap.org/verify',
      skills: ['WCAG 2.1', 'Accessibility Auditing', 'A11y'],
      icon: '♿'
    },
    {
      id: 'cert-4',
      title: 'Advanced React & Performance',
      issuer: 'Frontend Masters',
      date: '2022',
      credentialId: 'FM-REACT-2022-321',
      credentialUrl: 'https://frontendmasters.com/verify',
      skills: ['React.js', 'Performance Optimization', 'Modern JavaScript'],
      icon: '⚛️'
    },
    {
      id: 'cert-5',
      title: 'Complete Web Development Bootcamp',
      issuer: 'Udemy',
      date: '2022',
      credentialId: 'UDEMY-WEB-2022-654',
      credentialUrl: 'https://udemy.com/verify',
      skills: ['Full-Stack Development', 'Node.js', 'MongoDB'],
      icon: '📚'
    },
    {
      id: 'cert-6',
      title: 'Docker & Kubernetes Certification',
      issuer: 'Linux Academy',
      date: '2021',
      credentialId: 'LA-DOCKER-2021-987',
      credentialUrl: 'https://linuxacademy.com/verify',
      skills: ['Docker', 'Kubernetes', 'Container Orchestration'],
      icon: '🐳'
    }
  ];
}
