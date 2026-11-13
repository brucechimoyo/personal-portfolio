/* App — renders the home sections, detail pages, and a tiny hash router. */

import { loadContent, safeUrl, socialLabel } from './content.js';

const SITE_NAME = 'Bruce Takura Chimoyo';
const HOME_TITLE = document.title;

const homeView = document.getElementById('home-view');
const detailView = document.getElementById('detail-view');

/* ==========================================================================
   Helpers
   ========================================================================== */

const esc = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const slot = (name) => homeView.querySelector(`[data-slot="${name}"]`);

function fill(name, markup, busy = false) {
  const el = slot(name);
  if (!el) return;
  el.innerHTML = markup;
  el.toggleAttribute('aria-busy', busy);
}

function formatDate(value, opts = { month: 'short', year: 'numeric' }) {
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Intl.DateTimeFormat('en-GB', opts).format(time) : String(value || '');
}

const sentence = (text) => {
  const t = String(text || '').trim();
  return t && !/[.!?]$/.test(t) ? `${t}.` : t;
};

const ARROW_RIGHT =
  '<svg class="i entry-go" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

const tagList = (items) => `<ul class="tags">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;

/** One ruled ledger row: mono date | name + description | arrow */
const entryRow = ({ href, date, name, desc }) => `
  <li>
    <a class="entry" href="${href}">
      <span class="entry-date">${esc(date)}</span>
      <span>
        <span class="entry-name">${esc(name)}</span>
        ${desc ? `<span class="entry-desc">${esc(desc)}</span>` : ''}
      </span>
      ${ARROW_RIGHT}
    </a>
  </li>`;

/* ==========================================================================
   Home
   ========================================================================== */

const SLOTS = ['projects', 'experience', 'skills', 'articles'];

function renderPlaceholders() {
  const ghosts = (n) => Array.from({ length: n }, () => '<li class="ghost" aria-hidden="true"></li>').join('');
  fill('projects', ghosts(1), true);
  fill('experience', ghosts(3), true);
  fill('skills', `<ul>${ghosts(3)}</ul>`, true);
  fill('articles', ghosts(1), true);
}

function renderHome(data) {
  fill(
    'projects',
    data.projects
      .map((p) =>
        entryRow({ href: `#project/${encodeURIComponent(p.id)}`, date: p.year ?? '', name: p.title, desc: sentence(p.summary) })
      )
      .join('') || '<li class="notice">Projects are on their way.</li>'
  );

  fill(
    'experience',
    data.experience
      .map((e) =>
        entryRow({ href: `#experience/${encodeURIComponent(e.id)}`, date: e.range, name: e.role, desc: e.organization })
      )
      .join('') || '<li class="notice">Experience coming soon.</li>'
  );

  if (data.skills.length) {
    fill(
      'skills',
      `<dl class="stack">${data.skills
        .map((s) => `<div><dt>${esc(s.area.replace(/\s*(?:&\s*)?Development$/i, ''))}</dt><dd>${esc(s.skills.join(' · '))}</dd></div>`)
        .join('')}</dl>`
    );
  } else {
    document.getElementById('toolkit')?.setAttribute('hidden', '');
  }

  fill(
    'articles',
    data.articles
      .map((a) =>
        entryRow({ href: `#article/${encodeURIComponent(a.id)}`, date: formatDate(a.date), name: a.title, desc: a.summary })
      )
      .join('') || '<li class="notice">First article coming soon.</li>'
  );

  // Contact — replace the static fallback only when the CMS gives us usable links
  if (data.socials.length) {
    fill(
      'socials',
      data.socials
        .map((s) => {
          const external = !s.url.startsWith('mailto:');
          return `<li><a href="${esc(s.url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(socialLabel(s.name))}</a></li>`;
        })
        .join('')
    );
    const cta = document.querySelector('[data-primary-contact]');
    if (cta) cta.href = data.socials[0].url;
  }

  // "Currently…" line in the hero
  const now = data.experience.find((e) => e.current);
  const roleLine = document.getElementById('current-role');
  if (now && roleLine) {
    const s = now.summary.trim().replace(/[.!?]$/, '');
    const tail = s ? `, ${s.charAt(0).toLowerCase()}${s.slice(1)}` : '';
    roleLine.innerHTML = `Currently a <strong>${esc(now.role)}</strong> at <strong>${esc(now.organization)}</strong>${esc(tail)}.`;
  }
}

function renderHomeError() {
  const message = `<p class="notice">Couldn’t load this right now. <button type="button" data-retry>Try again</button></p>`;
  for (const name of SLOTS) fill(name, name === 'skills' ? message : `<li>${message}</li>`);
}

/* ==========================================================================
   Rich text (Contentful) → HTML
   ========================================================================== */

function richText(node, assets) {
  if (!node) return '';
  const kids = () => (node.content || []).map((n) => richText(n, assets)).join('');

  switch (node.nodeType) {
    case 'document':
      return tidyBlocks(node.content || [], assets);
    case 'paragraph': {
      const inner = kids().replace(/^(?:\s|<br>)+|(?:\s|<br>)+$/g, '');
      return inner ? `<p>${inner}</p>` : '';
    }
    case 'heading-1':
    case 'heading-2':
      return `<h2>${kids()}</h2>`;
    case 'heading-3':
      return `<h3>${kids()}</h3>`;
    case 'heading-4':
    case 'heading-5':
    case 'heading-6':
      return `<h4>${kids()}</h4>`;
    case 'unordered-list':
      return `<ul>${kids()}</ul>`;
    case 'ordered-list':
      return `<ol>${kids()}</ol>`;
    case 'list-item':
      return `<li>${kids()}</li>`;
    case 'blockquote':
      return `<blockquote>${kids()}</blockquote>`;
    case 'hr':
      return '<hr>';
    case 'embedded-asset-block': {
      const asset = assets[node.data?.target?.sys?.id];
      if (!asset) return '';
      const size = asset.width && asset.height ? ` width="${asset.width}" height="${asset.height}"` : '';
      return `<figure><img src="${esc(asset.url)}" alt="${esc(asset.title)}"${size} loading="lazy" decoding="async">${
        asset.title ? `<figcaption>${esc(asset.title)}</figcaption>` : ''
      }</figure>`;
    }
    case 'hyperlink': {
      const href = safeUrl(node.data?.uri);
      return href ? `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${kids()}</a>` : kids();
    }
    case 'text': {
      let text = esc(node.value).replace(/\n/g, '<br>');
      for (const mark of node.marks || []) {
        const tag = { bold: 'strong', italic: 'em', underline: 'u', code: 'code' }[mark.type];
        if (tag) text = `<${tag}>${text}</${tag}>`;
      }
      return text;
    }
    default:
      return kids();
  }
}

/**
 * The CMS content writes lists as one paragraph per line ("→ Item", "- Item") and
 * sub-headings as short standalone lines ("🎨 Dynamic Theming System").
 * Turn those into real <ul>/<h3> so long write-ups stay scannable.
 */
const BULLET = /^\s*(?:→|->|[-–—•*])\s+/;
const plain = (n) => (n.value ?? (n.content || []).map(plain).join('')).trim();

function stripBullet(paragraph) {
  const content = structuredClone(paragraph.content || []);
  const first = content.find((n) => n.nodeType === 'text' && n.value.trim());
  if (first) first.value = first.value.replace(/^\s+/, '').replace(BULLET, '');
  return content;
}

function tidyBlocks(blocks, assets) {
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const text = block.nodeType === 'paragraph' ? plain(block) : '';

    if (text && BULLET.test(text)) {
      const items = [];
      while (i < blocks.length && blocks[i].nodeType === 'paragraph' && (BULLET.test(plain(blocks[i])) || !plain(blocks[i]))) {
        if (plain(blocks[i])) items.push(`<li>${stripBullet(blocks[i]).map((n) => richText(n, assets)).join('').trim()}</li>`);
        i++;
      }
      i--;
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    const next = blocks.slice(i + 1).find((b) => b.nodeType !== 'paragraph' || plain(b));
    const looksLikeHeading = text && text.length <= 60 && !/[.!?:,]$/.test(text);
    if (looksLikeHeading && next?.nodeType === 'paragraph' && BULLET.test(plain(next))) {
      out.push(`<h3>${esc(text)}</h3>`);
      continue;
    }

    out.push(richText(block, assets));
  }
  return out.join('');
}

/* ==========================================================================
   Detail pages
   ========================================================================== */

const BACK = {
  project: ['work', 'All work'],
  article: ['writing', 'All writing'],
  experience: ['experience', 'All experience'],
};

const backLink = (type) => {
  const [hash, label] = BACK[type];
  return `<a class="back" href="#${hash}" data-back>← ${label}</a>`;
};

const docSection = (title, body) =>
  `<section class="doc-section">${title ? `<h2 class="block-title">${esc(title)}</h2>` : ''}${body}</section>`;

const bulletList = (items) => `<div class="prose"><ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></div>`;

const docHead = ({ kicker, title, lede, meta = [], figure = '' }) => {
  const bits = meta.filter(Boolean);
  return `
  <header class="doc-head">
    <p class="eyebrow">${kicker}</p>
    <h1 class="doc-title">${esc(title)}</h1>
    ${lede ? `<p class="doc-lede">${esc(lede)}</p>` : ''}
    ${bits.length ? `<div class="doc-meta">${bits.join('')}</div>` : ''}
    ${figure}
  </header>`;
};

const figureFor = (image, alt) =>
  image
    ? `<figure class="doc-figure"><img src="${esc(image.url)}" alt="${esc(alt)}"${
        image.width ? ` width="${image.width}" height="${image.height}"` : ''
      } decoding="async"></figure>`
    : '';

function projectPage(p, assets) {
  return {
    title: p.title,
    html: `
      ${backLink('project')}
      <article>
        ${docHead({
          kicker: `Project${p.year ? ` · ${p.year}` : ''}`,
          title: p.title,
          lede: sentence(p.summary),
          meta: [p.link ? `<a href="${esc(p.link)}" target="_blank" rel="noopener noreferrer">Visit live site ↗</a>` : ''],
          figure: figureFor(p.image, p.image?.title || p.title),
        })}
        ${p.body ? docSection('', `<div class="prose">${richText(p.body, assets)}</div>`) : ''}
        ${p.features.length ? docSection('Highlights', bulletList(p.features)) : ''}
        ${p.technologies.length || p.tags.length ? docSection('Built with', tagList(p.technologies.length ? p.technologies : p.tags)) : ''}
      </article>`,
  };
}

function articlePage(a, assets) {
  return {
    title: a.title,
    html: `
      ${backLink('article')}
      <article>
        ${docHead({
          kicker: 'Essay',
          title: a.title,
          lede: a.summary,
          meta: [
            `<span>${esc(formatDate(a.date, { day: 'numeric', month: 'long', year: 'numeric' }))}</span>`,
            a.readTime ? `<span>${esc(a.readTime)} read</span>` : '',
            a.link ? `<a href="${esc(a.link)}" target="_blank" rel="noopener noreferrer">Read the original ↗</a>` : '',
          ],
          figure: figureFor(a.image, ''),
        })}
        ${a.body ? docSection('', `<div class="prose">${richText(a.body, assets)}</div>`) : ''}
        ${a.tags.length ? docSection('Topics', tagList(a.tags)) : ''}
      </article>`,
  };
}

function experiencePage(e) {
  return {
    title: `${e.role} — ${e.organization}`,
    html: `
      ${backLink('experience')}
      <article>
        ${docHead({
          kicker: `Role${e.range ? ` · ${esc(e.range)}` : ''}`,
          title: e.role,
          lede: sentence(e.summary),
          meta: [`<span>${esc(e.organization)}</span>`, e.period ? `<span>${esc(e.period)}</span>` : ''],
        })}
        ${e.responsibilities.length ? docSection('What I did', bulletList(e.responsibilities)) : ''}
        ${e.achievements.length ? docSection('Achievements', bulletList(e.achievements)) : ''}
        ${e.impact.length ? docSection('Impact', bulletList(e.impact)) : ''}
        ${e.technologies.length ? docSection('Stack', tagList(e.technologies)) : ''}
      </article>`,
  };
}

function notFound(type) {
  return {
    title: 'Not found',
    html: `${backLink(type)}${docHead({ kicker: '404', title: 'That page has moved or no longer exists.' })}`,
  };
}

async function renderDetail(type, id) {
  detailView.innerHTML = `${backLink(type)}<div class="doc-head"><ul><li class="ghost"></li><li class="ghost"></li></ul></div>`;
  let data;
  try {
    data = await loadContent();
  } catch {
    detailView.innerHTML = `${backLink(type)}<p class="notice">Couldn’t load this right now. <button type="button" data-retry>Try again</button></p>`;
    return;
  }
  if (currentDetail !== `${type}/${id}`) return; // the user navigated away while loading

  const collections = { project: data.projects, article: data.articles, experience: data.experience };
  const item = collections[type]?.find((x) => x.id === id);
  const page = !item
    ? notFound(type)
    : type === 'project'
      ? projectPage(item, data.assets)
      : type === 'article'
        ? articlePage(item, data.assets)
        : experiencePage(item);

  document.title = `${page.title} — ${SITE_NAME}`;
  detailView.innerHTML = page.html;
  detailView.classList.remove('enter');
  void detailView.offsetWidth; // restart the entrance animation
  detailView.classList.add('enter');
}

/* ==========================================================================
   Router
   ========================================================================== */

const DETAIL_ROUTE = /^(project|article|experience)\/(.+)$/;
const LEGACY = { projects: 'work', articles: 'writing' }; // old URLs from the previous site

let currentDetail = null;
let homeScroll = { hash: '', y: 0 };
let enteredDetailFromHome = false;

function route({ initial = false } = {}) {
  const hash = decodeURIComponent(location.hash.slice(1));
  const match = hash.match(DETAIL_ROUTE);

  if (match) {
    if (!currentDetail) {
      homeScroll = { hash: previousHash, y: window.scrollY };
      enteredDetailFromHome = !initial;
    }
    currentDetail = `${match[1]}/${match[2]}`;
    homeView.hidden = true;
    detailView.hidden = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
    renderDetail(match[1], match[2]);
  } else {
    const wasDetail = Boolean(currentDetail);
    currentDetail = null;
    detailView.hidden = true;
    detailView.innerHTML = '';
    homeView.hidden = false;
    document.title = HOME_TITLE;

    const target = LEGACY[hash.split('/')[0]] ?? hash;
    if (wasDetail && hash === homeScroll.hash) {
      window.scrollTo({ top: homeScroll.y, behavior: 'instant' });
    } else if (wasDetail || initial || target !== hash) {
      scrollToSection(target);
    }
    // else: an ordinary in-page anchor — the browser already scrolled
  }
  previousHash = hash;
}

let previousHash = decodeURIComponent(location.hash.slice(1));

function scrollToSection(id) {
  const el = id && id !== 'top' ? document.getElementById(id) : null;
  if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' });
  else window.scrollTo({ top: 0, behavior: 'instant' });
}

/* ==========================================================================
   Boot
   ========================================================================== */

async function hydrateHome() {
  renderPlaceholders();
  try {
    const data = await loadContent();
    renderHome(data);
    // Content above the target may have changed height — re-align a deep link like #writing.
    const hash = location.hash.slice(1);
    if (!currentDetail && hash && hash !== 'top') scrollToSection(LEGACY[hash] ?? hash);
  } catch (error) {
    console.error('[portfolio] content failed to load:', error);
    renderHomeError();
  }
}

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-retry]')) {
    hydrateHome();
    if (currentDetail) route();
    return;
  }
  // Profile photo viewer: open from the avatar; close on ×, Esc (native) or a click outside the photo.
  const photo = document.getElementById('photo-dialog');
  if (event.target.closest('[data-open-photo]')) {
    photo.showModal();
    return;
  }
  if (photo.open && (event.target === photo || event.target.closest('[data-close-photo]'))) {
    photo.close();
    return;
  }
  if (event.target.closest('[data-to-top]') && !currentDetail) {
    event.preventDefault();
    window.scrollTo({ top: 0 });
    history.replaceState(null, '', location.pathname + location.search);
    return;
  }
  // "Back" returns to exactly where the visitor was, when they came from the home page.
  const back = event.target.closest('[data-back]');
  if (back && enteredDetailFromHome && !event.metaKey && !event.ctrlKey) {
    event.preventDefault();
    history.back();
  }
});

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('hashchange', () => route());

document.getElementById('year').textContent = new Date().getFullYear();
route({ initial: true });
hydrateHome();
