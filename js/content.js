/* Content layer — one Contentful request, normalised into plain objects. */

const SPACE_ID = 'pud4r27oprf4';
const ACCESS_TOKEN = 'XxZb6GZbJDyeNX06V168hBXbhVW4Q41UbLtEUSe0M84'; // public Content Delivery (read-only) token
const ENDPOINT = `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/master/entries?limit=1000&include=2`;
const TIMEOUT_MS = 8000;

let pending = null;

/** Fetch everything once; concurrent and repeat callers share the same promise. */
export function loadContent() {
  if (!pending) {
    pending = fetchAll().catch((error) => {
      pending = null; // allow a retry
      throw error;
    });
  }
  return pending;
}

async function fetchAll() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Contentful responded ${res.status}`);
    return normalise(await res.json());
  } finally {
    clearTimeout(timer);
  }
}

function normalise(payload) {
  const assets = {};
  for (const asset of payload.includes?.Asset ?? []) {
    const file = asset.fields?.file;
    if (file?.url) {
      assets[asset.sys.id] = {
        url: file.url.startsWith('//') ? `https:${file.url}` : file.url,
        title: asset.fields.title || asset.fields.description || '',
        width: file.details?.image?.width,
        height: file.details?.image?.height,
      };
    }
  }

  const byType = {};
  for (const entry of payload.items ?? []) {
    const type = entry.sys.contentType.sys.id;
    (byType[type] ||= []).push({ id: entry.sys.id, createdAt: entry.sys.createdAt, ...entry.fields });
  }
  const list = (type) => byType[type] ?? [];
  const assetFor = (link) => (link?.sys?.id ? assets[link.sys.id] ?? null : null);

  const projects = list('project')
    .map((p) => ({
      id: p.id,
      title: p.title || 'Untitled project',
      summary: p.headline || '',
      body: p.projectDescription || null,
      features: p.keyFeatures || [],
      technologies: p.technologies || [],
      tags: p.tags || [],
      link: safeUrl(p.liveLink),
      date: p.date || p.createdAt,
      year: yearOf(p.date || p.createdAt),
      image: assetFor(p.projectImage),
    }))
    .sort(byDateDesc);

  const articles = list('article')
    .map((a) => ({
      id: a.id,
      title: a.title || 'Untitled',
      summary: a.headline || '',
      body: a.articleContent || null,
      tags: a.tags || [],
      link: safeUrl(a.articleLink),
      date: a.date || a.createdAt,
      readTime: a.readTime ? String(a.readTime).replace(/\s*read$/i, '') : '',
      image: assetFor(a.article_image),
    }))
    .sort(byDateDesc);

  const experience = list('experience')
    .map((e) => {
      const period = parsePeriod(e.period);
      return {
        id: e.id,
        role: e.position || '',
        organization: e.organization || '',
        summary: e.leadingText || e.leading_text || '',
        responsibilities: mergeFragments(e.responsibilities),
        achievements: mergeFragments(e.achievements),
        impact: mergeFragments(e.impact),
        technologies: e.technologies || [],
        period: e.period || '',
        ...period,
      };
    })
    .sort((a, b) => (b.current - a.current) || (b.startYear - a.startYear) || (b.endYear - a.endYear));

  const skills = list('expertise')
    .map((s) => ({ area: s.specialty || '', skills: s.skills || [] }))
    .filter((s) => s.area && s.skills.length)
    .sort((a, b) => skillRank(a.area) - skillRank(b.area));

  const socials = list('social')
    .map((s) => ({ name: s.platform || '', url: socialUrl(s.platform, s.link) }))
    .filter((s) => s.name && s.url)
    .sort((a, b) => socialRank(a.name) - socialRank(b.name));

  const about = list('aboutMeContent')[0] || null;

  return { projects, articles, experience, skills, socials, about, assets };
}

/* ---------- helpers ---------- */

/**
 * Some CMS list items were split on commas ("Designed and implemented scalable",
 * "resilient software solutions…"). Re-join items that start lower-case onto the previous one.
 */
function mergeFragments(items = []) {
  const out = [];
  for (const raw of items) {
    const item = String(raw || '').trim();
    if (!item) continue;
    if (out.length && /^[a-z]/.test(item)) out[out.length - 1] += `, ${item}`;
    else out.push(item);
  }
  return out;
}

function byDateDesc(a, b) {
  return (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0);
}

export function yearOf(value) {
  const match = String(value || '').match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

/** "January 2024 - Current" → { startYear: 2024, endYear: 9999, current: true, range: "2024 — Now" } */
function parsePeriod(period = '') {
  const [startRaw = '', endRaw = ''] = String(period).split(/\s*[-–—]\s*/);
  const current = /current|present|now|today/i.test(endRaw);
  const startYear = yearOf(startRaw) ?? 0;
  const endYear = current ? 9999 : yearOf(endRaw) ?? startYear;
  let range = '';
  if (startYear) {
    if (current) range = `${startYear} — Now`;
    else if (endYear && endYear !== startYear) range = `${startYear} — ${endYear}`;
    else range = String(startYear);
  }
  return { startYear, endYear, current, range };
}

/** Reject non-http(s) URLs and URLs that are really email addresses (e.g. "https://name@gmail.com"). */
export function safeUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(String(value).trim());
    if (!/^https?:$/.test(url.protocol) || url.username) return '';
    return url.href;
  } catch {
    return '';
  }
}

/**
 * Social links in the CMS are stored as "handle@platform.com".
 * Accept proper URLs as-is and convert the handle form into a profile URL.
 */
function socialUrl(platform = '', raw = '') {
  const value = String(raw).trim();
  if (!value) return '';
  if (/^mailto:/i.test(value)) return value;
  const direct = safeUrl(value);
  if (direct) return direct;

  const handle = value.replace(/^@/, '').split('@')[0].trim();
  if (!handle) return '';
  const key = `${platform} ${value}`.toLowerCase();
  if (key.includes('github')) return `https://github.com/${handle}`;
  if (key.includes('linkedin')) return `https://www.linkedin.com/in/${handle}`;
  if (key.includes('twitter') || /\bx\b/.test(key)) return `https://x.com/${handle}`;
  if (key.includes('medium')) return `https://medium.com/@${handle}`;
  if (/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(value) && key.includes('mail')) return `mailto:${value}`;
  return '';
}

const SOCIAL_ORDER = ['linkedin', 'github', 'medium', 'twitter', 'x'];
function socialRank(name) {
  const i = SOCIAL_ORDER.indexOf(name.toLowerCase());
  return i === -1 ? SOCIAL_ORDER.length : i;
}

const SKILL_ORDER = ['frontend', 'backend', 'performance', 'ui/ux', 'database', 'ci/cd', 'project'];
function skillRank(area) {
  const lower = area.toLowerCase();
  const i = SKILL_ORDER.findIndex((k) => lower.includes(k));
  return i === -1 ? SKILL_ORDER.length : i;
}

export function socialLabel(name) {
  return /^twitter$/i.test(name) ? 'X' : /^github$/i.test(name) ? 'GitHub' : name;
}
