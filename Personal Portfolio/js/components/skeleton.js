/* Skeleton Components for Loading States */

export function createProfileSkeleton() {
  const container = document.createElement('article');
  container.className = 'profile-header';
  container.innerHTML = `
    <div class="profile-content">
      <img class="profile-avatar skeleton-avatar" style="width: 88px; height: 88px; margin-bottom: var(--spacing-lg);" />
      <h1 class="profile-name skeleton-line" style="width: 50%; height: 28px; margin-bottom: var(--spacing-sm);"></h1>
      <p class="profile-bio skeleton-line" style="width: 70%; height: 16px; margin-bottom: var(--spacing-lg);"></p>
      <div class="profile-stats">
        <div class="profile-stat">
          <span class="profile-stat-value skeleton-line" style="width: 40px; height: 24px; margin-bottom: var(--spacing-xs); display: block;"></span>
          <span class="profile-stat-label skeleton-line" style="width: 60px; height: 14px; display: block;"></span>
        </div>
        <div class="profile-stat">
          <span class="profile-stat-value skeleton-line" style="width: 40px; height: 24px; margin-bottom: var(--spacing-xs); display: block;"></span>
          <span class="profile-stat-label skeleton-line" style="width: 60px; height: 14px; display: block;"></span>
        </div>
        <div class="profile-stat">
          <span class="profile-stat-value skeleton-line" style="width: 40px; height: 24px; margin-bottom: var(--spacing-xs); display: block;"></span>
          <span class="profile-stat-label skeleton-line" style="width: 60px; height: 14px; display: block;"></span>
        </div>
      </div>
      <div class="profile-links">
        <a class="profile-link skeleton-line" style="width: 80px; height: 32px; border-radius: 20px; display: inline-block;"></a>
        <a class="profile-link skeleton-line" style="width: 80px; height: 32px; border-radius: 20px; display: inline-block;"></a>
        <a class="profile-link skeleton-line" style="width: 80px; height: 32px; border-radius: 20px; display: inline-block;"></a>
      </div>
    </div>
  `;
  return container;
}

export function createAboutSectionSkeleton() {
  const container = document.createElement('div');
  container.innerHTML = `
    <div style="width: 100%; max-width: 100%; padding: 0; overflow-x: hidden;">
      <section style="padding: clamp(var(--spacing-md), 4vw, var(--spacing-xl)) clamp(var(--spacing-md), 3vw, var(--spacing-lg)); width: 100%; box-sizing: border-box;">
        <h2 class="skeleton-line" style="width: 25%; height: 32px; margin-bottom: var(--spacing-lg);"></h2>
        <p class="skeleton-line" style="width: 100%; height: 16px; margin-bottom: var(--spacing-sm);"></p>
        <p class="skeleton-line" style="width: 100%; height: 16px; margin-bottom: var(--spacing-sm);"></p>
        <p class="skeleton-line" style="width: 85%; height: 16px; margin-bottom: var(--spacing-sm);"></p>
        <p class="skeleton-line" style="width: 90%; height: 16px; margin-bottom: var(--spacing-lg);"></p>
        
        <h3 class="skeleton-line" style="width: 40%; height: 24px; margin-bottom: var(--spacing-lg);"></h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(clamp(180px, 40vw, 250px), 1fr)); gap: clamp(var(--spacing-md), 3vw, var(--spacing-lg)); margin-bottom: var(--spacing-xl); width: 100%; box-sizing: border-box;">
          ${[1, 2, 3, 4].map(() => `
            <div class="skill-card">
              <h4 class="skeleton-line" style="width: 50%; height: 20px; margin-bottom: var(--spacing-md);"></h4>
              <div class="card-tags" style="margin-bottom: var(--spacing-md);">
                ${[1, 2, 3].map(() => `
                  <span class="tag skeleton-line" style="width: 60px; height: 20px; display: inline-block;"></span>
                `).join('')}
              </div>
              <p class="skeleton-line" style="width: 75%; height: 14px;"></p>
            </div>
          `).join('')}
        </div>

        <h3 class="skeleton-line" style="width: 30%; height: 24px; margin-bottom: var(--spacing-md); margin-top: var(--spacing-xl);"></h3>
        <div class="timeline">
          ${[1, 2, 3, 4].map(() => `
            <div class="timeline-item">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <div class="timeline-date skeleton-line" style="width: 80px; height: 12px; margin-bottom: var(--spacing-xs);"></div>
                <div class="timeline-title skeleton-line" style="width: 60%; height: 18px;"></div>
              </div>
            </div>
          `).join('')}
        </div>

        <h3 class="skeleton-line" style="width: 35%; height: 24px; margin-bottom: var(--spacing-md); margin-top: var(--spacing-lg);"></h3>
        <div class="carousel-container" style="position: relative; overflow: hidden; margin-bottom: var(--spacing-lg); min-height: 120px;">
          <button class="carousel-btn carousel-prev" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); z-index: 20; background: var(--color-bg); border: 2px solid var(--color-text); border-radius: 50%; width: 44px; height: 44px; cursor: pointer; font-size: 22px; display: flex; align-items: center; justify-content: center; color: var(--color-text);">&#8249;</button>
          <button class="carousel-btn carousel-next" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); z-index: 20; background: var(--color-bg); border: 2px solid var(--color-text); border-radius: 50%; width: 44px; height: 44px; cursor: pointer; font-size: 22px; display: flex; align-items: center; justify-content: center; color: var(--color-text);">&#8250;</button>
          <div class="carousel-track">
            ${[1, 2, 3].map(() => `
              <div class="carousel-slide" style="min-width: 100%; padding: var(--spacing-lg); background: var(--color-bg-secondary); border-radius: 12px; border-left: 3px solid var(--color-accent); box-sizing: border-box;">
                <div class="skeleton-line" style="width: 90%; height: 16px; margin-bottom: var(--spacing-sm);"></div>
                <div class="skeleton-line" style="width: 60%; height: 14px; margin-top: var(--spacing-md);"></div>
                <div class="skeleton-line" style="width: 40%; height: 12px; margin-top: var(--spacing-xs);"></div>
              </div>
            `).join('')}
          </div>
          <div class="carousel-dots" style="display: flex; justify-content: center; gap: 10px; margin-top: var(--spacing-md);">
            ${[1, 2, 3].map(i => `<span class="carousel-dot" data-index="${i}" style="width: 10px; height: 10px; border-radius: 50%; background: var(--color-text-tertiary); cursor: pointer;"></span>`).join('')}
          </div>
        </div>
      </section>
    </div>
  `;
  return container;
}

export function createRightbarSkeleton() {
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="rightbar-widget">
      <h3 class="widget-title">Featured Projects</h3>
      <div class="featured-projects-list">
        ${[1, 2, 3].map(() => `
          <a class="featured-project">
            <span class="featured-project-title skeleton-line" style="width: 80%; height: 16px; margin-bottom: var(--spacing-xs); display: block;"></span>
            <span class="featured-project-desc skeleton-line" style="width: 100%; height: 14px; display: block;"></span>
          </a>
        `).join('')}
      </div>
    </div>
    <div class="rightbar-widget">
      <h3 class="widget-title">Popular Tags</h3>
      <div class="card-tags">
        ${[1, 2, 3, 4, 5, 6, 7, 8].map(() => `
          <a class="tag skeleton-line" style="width: 60px; height: 20px; display: inline-block;"></a>
        `).join('')}
      </div>
    </div>
    <div class="rightbar-widget">
      <h3 class="widget-title">Skills</h3>
      <div class="skill-grid">
        ${[1, 2, 3, 4, 5, 6, 7, 8].map(() => `
          <div class="skill-item skeleton-line" style="width: 100%; height: 36px;"></div>
        `).join('')}
      </div>
    </div>
    <div class="rightbar-widget">
      <h3 class="widget-title">Links</h3>
      <ul class="widget-list">
        ${[1, 2, 3, 4].map(() => `
          <li class="widget-item">
            <a class="widget-item-link skeleton-line" style="width: 60%; height: 16px; display: block;"></a>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
  return container;
}

export function createErrorState() {
  const container = document.createElement('div');
  container.className = 'error-state';
  container.innerHTML = `
    <div class="error-state-icon">⚠️</div>
    <h3 class="error-state-title">Oops! Something went wrong</h3>
    <p class="error-state-text">Unable to load content. Please check your connection and try again.</p>
    <button class="error-state-retry" onclick="window.location.reload()">Try Again</button>
  `;
  return container;
}

export function createExperienceDetailSkeleton() {
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="experience-detail-wrapper">
      <div class="experience-detail-hero" style="position: relative; padding: var(--spacing-lg) var(--spacing-md); background: var(--color-bg-secondary); overflow: hidden; border-bottom: 1px solid var(--color-border);">
        <div class="experience-detail-hero-content" style="position: relative; z-index: 1; display: flex; flex-direction: column; gap: var(--spacing-md);">
          <div class="skeleton-line" style="width: 120px; height: 20px; border-radius: 4px; background: var(--color-border);"></div>
          <div class="skeleton-line" style="width: 60%; height: 32px; background: var(--color-border);"></div>
          <div class="skeleton-line" style="width: 40%; height: 18px; background: var(--color-border);"></div>
          <div class="skeleton-line" style="width: 30%; height: 16px; background: var(--color-border);"></div>
        </div>
      </div>

      <div class="experience-detail-body" style="padding: var(--spacing-lg) var(--spacing-md); display: grid; grid-template-columns: 1fr; gap: var(--spacing-xl); width: 100%; max-width: 100%; background-color: var(--color-bg);">
        <div class="experience-detail-main" style="display: flex; flex-direction: column; gap: var(--spacing-lg); width: 100%;">
          <div class="experience-detail-description" style="font-size: var(--font-size-base); color: var(--color-text-secondary); line-height: 1.8; padding: 0; background: transparent; border-radius: 0; border: none;">
            <div class="skeleton-line" style="width: 100%; height: 16px; margin-bottom: var(--spacing-sm);"></div>
            <div class="skeleton-line" style="width: 100%; height: 16px; margin-bottom: var(--spacing-sm);"></div>
            <div class="skeleton-line" style="width: 85%; height: 16px;"></div>
          </div>

          <div class="experience-detail-section" style="background: transparent; border-radius: 0; padding: var(--spacing-md) 0; border: none; width: 100%;">
            <h3 class="experience-detail-section-title" style="font-size: var(--font-size-sm); font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--spacing-sm); display: flex; align-items: center; gap: var(--spacing-sm); padding-bottom: 0; border-bottom: none; text-transform: none; letter-spacing: 0;">
              <span class="skeleton-line" style="width: 120px; height: 16px;"></span>
            </h3>
            <ul class="experience-detail-list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--spacing-xs);">
              ${[1, 2, 3].map(() => `
                <li style="padding: var(--spacing-xs) 0; position: relative; background: transparent; border-radius: 0; font-size: var(--font-size-sm); color: var(--color-text-secondary); transition: all var(--transition-fast); border-left: none; line-height: 1.5;">
                  <div class="skeleton-line" style="width: 90%; height: 14px;"></div>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
  return container;
}

export function createProjectDetailSkeleton() {
  const container = document.createElement('div');
  container.innerHTML = `
    <section style="padding: var(--spacing-lg) var(--spacing-md);">
      <div style="margin-bottom: var(--spacing-lg);">
        <div class="skeleton-line" style="width: 150px; height: 20px;"></div>
      </div>

      <article class="card">
        <div class="card-header">
          <div class="card-avatar skeleton-avatar" style="width: 48px; height: 48px; flex-shrink: 0;"></div>
          <div class="card-meta" style="flex: 1;">
            <div class="card-author skeleton-line" style="width: 100px; height: 16px; margin-bottom: var(--spacing-xs);"></div>
            <div class="card-date skeleton-line" style="width: 80px; height: 14px;"></div>
          </div>
        </div>
        <h1 class="card-title skeleton-line" style="width: 70%; height: 28px; margin-bottom: var(--spacing-md);"></h1>
        <div class="card-image skeleton-line" style="width: 100%; height: 200px; border-radius: 12px; margin-bottom: var(--spacing-md);"></div>
        <p class="card-description skeleton-line" style="width: 100%; height: 16px; margin-bottom: var(--spacing-sm);"></p>
        <p class="card-description skeleton-line" style="width: 100%; height: 16px; margin-bottom: var(--spacing-sm);"></p>
        <p class="card-description skeleton-line" style="width: 85%; height: 16px; margin-bottom: var(--spacing-xl);"></p>

        <div style="margin-bottom: var(--spacing-xl);">
          <h3 class="skeleton-line" style="width: 150px; height: 20px; margin-bottom: var(--spacing-md);"></h3>
          <div style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap;">
            ${[1, 2, 3, 4, 5].map(() => `
              <span class="tag skeleton-line" style="width: 80px; height: 28px; display: inline-block;"></span>
            `).join('')}
          </div>
        </div>

        <div style="margin-bottom: var(--spacing-xl);">
          <h3 class="skeleton-line" style="width: 120px; height: 20px; margin-bottom: var(--spacing-md);"></h3>
          <ul style="padding-left: var(--spacing-lg);">
            ${[1, 2, 3].map(() => `
              <li style="margin-bottom: var(--spacing-sm);">
                <div class="skeleton-line" style="width: 90%; height: 16px;"></div>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="card-footer">
          <div class="card-tags">
            ${[1, 2, 3].map(() => `
              <span class="tag skeleton-line" style="width: 70px; height: 28px; display: inline-block;"></span>
            `).join('')}
          </div>
          <div class="skeleton-line" style="width: 120px; height: 20px;"></div>
        </div>
      </article>
    </section>
  `;
  return container;
}

export function createArticleDetailSkeleton() {
  const container = document.createElement('div');
  container.innerHTML = `
    <section style="padding: var(--spacing-lg) var(--spacing-md);">
      <div style="margin-bottom: var(--spacing-lg);">
        <div class="skeleton-line" style="width: 150px; height: 20px;"></div>
      </div>

      <article class="card">
        <div class="card-header">
          <div class="card-avatar skeleton-avatar" style="width: 48px; height: 48px; flex-shrink: 0;"></div>
          <div class="card-meta" style="flex: 1;">
            <div class="card-author skeleton-line" style="width: 100px; height: 16px; margin-bottom: var(--spacing-xs);"></div>
            <div class="card-date skeleton-line" style="width: 120px; height: 14px;"></div>
          </div>
        </div>
        <h1 class="card-title skeleton-line" style="width: 75%; height: 28px; margin-bottom: var(--spacing-md);"></h1>
        <div class="card-image skeleton-line" style="width: 100%; height: 200px; border-radius: 12px; margin-bottom: var(--spacing-md);"></div>
        <p class="card-description skeleton-line" style="width: 100%; height: 18px; margin-bottom: var(--spacing-sm); font-style: italic;"></p>
        <p class="card-description skeleton-line" style="width: 100%; height: 18px; margin-bottom: var(--spacing-xl); font-style: italic;"></p>

        <div style="margin-bottom: var(--spacing-xl);">
          <div class="skeleton-line" style="width: 100%; height: 16px; margin-bottom: var(--spacing-sm);"></div>
          <div class="skeleton-line" style="width: 100%; height: 16px; margin-bottom: var(--spacing-sm);"></div>
          <div class="skeleton-line" style="width: 100%; height: 16px; margin-bottom: var(--spacing-sm);"></div>
          <div class="skeleton-line" style="width: 100%; height: 16px; margin-bottom: var(--spacing-sm);"></div>
          <div class="skeleton-line" style="width: 85%; height: 16px;"></div>
        </div>

        <div class="card-footer">
          <div class="card-tags">
            ${[1, 2, 3].map(() => `
              <span class="tag skeleton-line" style="width: 70px; height: 28px; display: inline-block;"></span>
            `).join('')}
          </div>
          <div class="skeleton-line" style="width: 130px; height: 20px;"></div>
        </div>
      </article>
    </section>
  `;
  return container;
}

export function renderLoadingSkeletons() {
  const profileContainer = document.querySelector('#profile-header');
  const feedContainer = document.querySelector('#feed-container');
  const rightbarContent = document.querySelector('#rightbar-content');

  if (profileContainer) {
    profileContainer.innerHTML = '';
    profileContainer.appendChild(createProfileSkeleton());
  }

  if (feedContainer) {
    feedContainer.innerHTML = createAboutSectionSkeleton().innerHTML;
  }

  if (rightbarContent) {
    rightbarContent.innerHTML = createRightbarSkeleton().innerHTML;
  }
}

export function showErrorState() {
  const profileContainer = document.querySelector('#profile-header');
  const feedContainer = document.querySelector('#feed-container');
  const rightbarContent = document.querySelector('#rightbar-content');

  if (profileContainer) {
    profileContainer.innerHTML = '';
  }

  if (feedContainer) {
    feedContainer.innerHTML = createErrorState().outerHTML;
  }

  if (rightbarContent) {
    rightbarContent.innerHTML = '';
  }
}