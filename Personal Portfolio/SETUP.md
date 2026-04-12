# Portfolio Setup & Deployment Guide

## 📋 Local Development Setup

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (Python, Node.js, or similar)
- Optional: Contentful account for CMS integration

### Step 1: Clone or Download
```bash
# If using git
git clone <repository-url>
cd portfolio

# Or just download the files
```

### Step 2: Start Local Server

**Option A: Python (Built-in)**
```bash
# Python 3
python -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000
```

**Option B: Node.js**
```bash
npx http-server
```

**Option C: Live Server (VS Code)**
1. Install the "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### Step 3: Open in Browser
```
http://localhost:8000
```

The portfolio will load with mock data. Use the navigation to explore:
- **Home**: Combined feed of all posts and projects
- **Projects**: Featured projects with links
- **Articles**: Blog posts and articles
- **About**: Personal bio and contact information

### Step 4 (Optional): Connect Contentful

1. Create a Contentful account: https://www.contentful.com
2. Create a new Space
3. Set up Content Models:
   - **Post**: title, description, content, tags, createdAt
   - **Project**: title, description, image, link, tags, featured
   - **Profile**: name, bio, avatar, social, stats, skills

4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

5. Add your credentials to `.env`:
   ```
   VITE_CONTENTFUL_SPACE_ID=your_actual_space_id
   VITE_CONTENTFUL_ACCESS_TOKEN=your_actual_access_token
   ```

6. Reload the browser—content will now load from Contentful

## 🚀 Deployment

### Option 1: Vercel (Recommended)
```bash
# 1. Push code to GitHub
git push origin main

# 2. Visit https://vercel.com
# 3. Import the repository
# 4. Add environment variables in Vercel dashboard
# 5. Deploy (automatic on push)
```

### Option 2: Netlify
```bash
# 1. Push code to GitHub

# 2. Visit https://netlify.com
# 3. Connect GitHub repository
# 4. Build command: (leave blank - static site)
# 5. Publish directory: . (root)
# 6. Add environment variables
# 7. Deploy
```

### Option 3: GitHub Pages
```bash
# 1. Push code to GitHub
git push origin main

# 2. Enable Pages in repository Settings
#    Source: main branch, root directory

# 3. Site will be available at:
#    https://your-username.github.io/portfolio
```

### Option 4: Traditional Hosting
```bash
# 1. Upload files via SFTP/FTP to your hosting provider
# 2. No build step required—files work as-is
# 3. Set up environment variables via .htaccess or similar
```

## 🔒 Security Considerations

### Contentful API Token
- **Never commit** your `.env` file to version control
- Use `.gitignore`:
  ```
  .env
  .env.local
  .env.*.local
  ```
- In production, use environment variables provided by hosting platform

### Content Filtering
- Sanitize any user-generated content
- Escape HTML in posts/descriptions
- Use `textContent` instead of `innerHTML` when possible

## ⚙️ Configuration

### Change Site Branding

Edit in `index.html`:
```html
<h1 class="logo">YOUR_INITIALS</h1>
<title>Your Name - Your Tagline</title>
<meta name="description" content="Your description here">
```

### Update Social Links

Edit `js/api/contentful.js` (mock profile):
```javascript
social: [
  { name: 'GitHub', url: 'https://github.com/yourusername' },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/yourusername' },
  // Add more...
]
```

### Customize Colors

Edit CSS variables in `index.html` `<style>` tag:
```css
:root {
  --color-accent: #1d9bf0; /* Your brand color */
  --color-bg: #ffffff;     /* Background */
  --color-text-primary: #0f1419;
  /* Update all variables as needed */
}
```

### Add Custom Pages

1. Add navigation link in `index.html`:
```html
<li role="none"><a href="#work" class="nav-item" role="menuitem">Work</a></li>
```

2. Add route handler in `js/main.js`:
```javascript
const routes = {
  work: () => showWorkView(),
  // ... other routes
};

function showWorkView() {
  const feedContainer = query('#feed-container');
  feedContainer.innerHTML = `<h2>My Work</h2>...`;
}
```

## 📊 Performance Optimization

### Lighthouse Audit
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Click "Analyze page load"
4. Review suggestions

### Common Optimizations
- Compress images to WebP format
- Minify CSS and JavaScript (optional)
- Use CDN for assets
- Enable compression on server

### Cache Control
Add headers if using Node.js/Express:
```javascript
app.use(express.static('public', {
  maxAge: '1d',
  etag: false
}));
```

## 🐛 Troubleshooting

### Content Not Loading
```javascript
// Open DevTools Console and check:
console.__portfolio.getPosts() // Should show posts
console.__portfolio.getProjects() // Should show projects
```

### Contentful API Errors
1. Check Space ID and Access Token are correct
2. Verify content types exist in Contentful
3. Check browser console for error messages
4. Ensure content is published (not just drafts)

### Theme Not Persisting
- Check localStorage is enabled in browser
- Try clearing cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete)

### Routes Not Working
- Check browser console for errors
- Ensure `js/main.js` is loading (Network tab)
- Verify hash routes with # prefix: `#projects`, `#articles`

### Styling Issues
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)
- Clear cache: Browser settings > Clear browsing data
- Check CSS files are loading (Network tab)

## 📱 Mobile Optimization

### Test Responsive Design
1. Open DevTools
2. Click device toggle (Ctrl+Shift+M or Cmd+Shift+M)
3. Test all screen sizes

### Touch Optimization
- Buttons are minimum 44x44px for touch targets
- Links have proper spacing
- Sidebar collapses on mobile

## 🔍 SEO Checklist

- [ ] Meta description is compelling
- [ ] Open Graph tags added for social sharing
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Structured data (Schema.org) added
- [ ] XML sitemap submitted to search engines

## 📦 Backup & Maintenance

### Regular Backups
```bash
# Backup local files
tar -czf portfolio-backup-$(date +%Y%m%d).tar.gz .

# Or use Git
git tag v1.0 -m "Initial release"
git push origin v1.0
```

### Dependency Updates
No npm packages to update—pure vanilla! 

### Content Updates
- Update posts/projects in Contentful CMS
- Content automatically reflects on site
- No rebuild required

## 💡 Tips & Tricks

### Use Browser DevTools
```javascript
// Quick access to state from console
__portfolio.getPosts()
__portfolio.getProjects()
__portfolio // Full state object
```

### Local Content Testing
1. Update `js/api/contentful.js` mock data
2. Don't use Contentful credentials (delete .env)
3. Site will use mock data automatically

### Performance Testing
- Use Lighthouse (built-in DevTools)
- Test with slow 3G (DevTools Network tab)
- Check Core Web Vitals: https://web.dev

### Dark Mode Testing
- System: Settings > Appearance > Dark mode
- Manual: Click moon icon in sidebar

## 📞 Support

For issues or questions:
1. Check this guide
2. Review code comments in files
3. Check browser console for errors
4. Review Contentful API documentation

---

**Last Updated**: 2024
**Version**: 1.0
**Maintenance**: Active ✓
