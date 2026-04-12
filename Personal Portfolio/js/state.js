/* Simple State Management */

const state = {
  theme: localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  colorAccent: localStorage.getItem('colorAccent') || 'blue',
  currentView: 'home',
  currentFilter: null,
  posts: [],
  projects: [],
  profile: null,
  loading: false,
  loadingHome: false,
  loadingProjects: false,
  loadingArticles: false,
  error: null,
  cache: {}
};

export const THEMES = ['light', 'dark'];
export const COLOR_ACCENTS = ['blue', 'orange', 'green', 'red', 'purple'];

const listeners = new Set();

export function getState() {
  return { ...state };
}

export function setState(updates) {
  Object.assign(state, updates);
  notifyListeners();
}

export function updateState(key, value) {
  state[key] = value;
  notifyListeners();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach(listener => listener(state));
}

export function getTheme() {
  return state.theme;
}

export function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem('theme', theme);
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  notifyListeners();
}

export function toggleTheme() {
  const currentTheme = state.theme;
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

export function getColorAccent() {
  return state.colorAccent;
}

export function setColorAccent(color) {
  if (!COLOR_ACCENTS.includes(color)) return;
  state.colorAccent = color;
  localStorage.setItem('colorAccent', color);
  applyColorAccent(color);
  notifyListeners();
}

export function applyColorAccent(color) {
  const colors = {
    blue: { accent: '#1d9bf0', hover: '#1a8cd8' },
    orange: { accent: '#ff9500', hover: '#e68a00' },
    green: { accent: '#17bf63', hover: '#15a854' },
    red: { accent: '#e74c3c', hover: '#c0392b' },
    purple: { accent: '#9b59b6', hover: '#8e44ad' }
  };
  const selected = colors[color] || colors.blue;
  document.documentElement.style.setProperty('--color-accent', selected.accent);
  document.documentElement.style.setProperty('--color-accent-hover', selected.hover);
}

export function setCurrentView(view) {
  state.currentView = view;
  notifyListeners();
}

export function getCurrentView() {
  return state.currentView;
}

export function setCurrentFilter(filter) {
  state.currentFilter = filter;
  notifyListeners();
}

export function getCurrentFilter() {
  return state.currentFilter;
}

export function setPosts(posts) {
  state.posts = posts;
  notifyListeners();
}

export function getPosts() {
  return state.posts;
}

export function setProjects(projects) {
  state.projects = projects;
  notifyListeners();
}

export function getProjects() {
  return state.projects;
}

export function setProfile(profile) {
  state.profile = profile;
  notifyListeners();
}

export function getProfile() {
  return state.profile;
}

export function setLoading(loading) {
  state.loading = loading;
  notifyListeners();
}

export function isLoading() {
  return state.loading;
}

export function setLoadingHome(loading) {
  state.loadingHome = loading;
  notifyListeners();
}

export function isLoadingHome() {
  return state.loadingHome;
}

export function setLoadingProjects(loading) {
  state.loadingProjects = loading;
  notifyListeners();
}

export function isLoadingProjects() {
  return state.loadingProjects;
}

export function setLoadingArticles(loading) {
  state.loadingArticles = loading;
  notifyListeners();
}

export function isLoadingArticles() {
  return state.loadingArticles;
}

export function setError(error) {
  state.error = error;
  notifyListeners();
}

export function getError() {
  return state.error;
}

export function cacheSet(key, value) {
  state.cache[key] = {
    value,
    timestamp: Date.now()
  };
}

export function cacheGet(key, ttl = 5 * 60 * 1000) {
  const cached = state.cache[key];
  if (!cached) return null;
  if (Date.now() - cached.timestamp > ttl) {
    delete state.cache[key];
    return null;
  }
  return cached.value;
}

export function cacheClear() {
  state.cache = {};
}

export function resetState() {
  Object.assign(state, {
    currentView: 'home',
    currentFilter: null,
    posts: [],
    projects: [],
    profile: null,
    loading: false,
    error: null
  });
  notifyListeners();
}
