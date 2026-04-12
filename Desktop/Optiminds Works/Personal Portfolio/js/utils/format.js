/* Formatting Utilities */

export function formatDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (seconds < 60) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  if (years > 0) return `${years}y ago`;

  return date.toLocaleDateString();
}

export function formatDateFull(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

export function truncateText(text, length = 160) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '…';
}

export function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

export function highlightText(text, highlight) {
  if (!highlight) return text;
  
  const regex = new RegExp(`(${highlight.trim()})`, 'gi');
  return text.replace(regex, '<strong>$1</strong>');
}

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function pluralize(count, word, plural = word + 's') {
  return count === 1 ? word : plural;
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export function getReadingTime(text) {
  const wordsPerMinute = 200;
  const wordCount = (text || '').trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return readingTime === 1 ? '1 min read' : `${readingTime} min read`;
}
