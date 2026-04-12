# Netlify Deployment Guide

This guide will help you deploy your portfolio to Netlify.

## Prerequisites

- GitHub account with your portfolio repository
- Netlify account (free tier available)
- Git installed on your machine

## Step 1: Create a Netlify Account

1. Go to [Netlify](https://app.netlify.com/signup)
2. Sign up with GitHub (recommended for easy integration)
3. Authorize Netlify to access your GitHub account
4. Verify your email

## Step 2: Connect Your Repository

### Option A: Deploy from GitHub (Recommended)

1. Log in to [Netlify Dashboard](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** as your Git provider
4. Select your portfolio repository
5. Configure build settings:
   - **Build command**: Leave empty (no build needed)
   - **Publish directory**: `.` (root directory)
6. Click **Deploy site**

### Option B: Manual Deployment

1. Download your portfolio as ZIP
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag and drop your portfolio folder
4. Your site will be deployed instantly

## Step 3: Configure Environment Variables

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add your Contentful credentials (if using CMS):
   ```
   VITE_CONTENTFUL_SPACE_ID = your_space_id
   VITE_CONTENTFUL_ACCESS_TOKEN = your_access_token
   ```
4. Save changes

## Step 4: Set Up Custom Domain

### Using Netlify Subdomain

1. Go to **Site settings** → **Domain management**
2. Click **Edit site name**
3. Enter your desired subdomain (e.g., `yourname`)
4. Your site will be available at `yourname.netlify.app`

### Using Custom Domain

1. Purchase a domain from a registrar (GoDaddy, Namecheap, etc.)
2. Go to **Site settings** → **Domain management**
3. Click **Add custom domain**
4. Enter your domain name
5. Follow Netlify's instructions to update DNS settings
6. Wait for DNS propagation (up to 24 hours)
7. HTTPS certificate will be automatically issued

## Step 5: Enable Continuous Deployment

With GitHub integration, your site automatically deploys when you push to your repository:

```bash
git add .
git commit -m "Update: Your changes"
git push origin main
```

Check deployment status in Netlify Dashboard → **Deploys** tab.

## Step 6: Configure Build Settings

The `netlify.toml` file handles:
- SPA routing (redirects all routes to index.html)
- Cache headers for performance
- Security headers
- Compression settings

No additional configuration needed!

## Step 7: Verify Deployment

1. Visit your Netlify URL (e.g., `yourname.netlify.app`)
2. Test all pages and navigation
3. Check browser console for errors
4. Verify images load correctly
5. Test responsive design
6. Test dark/light mode toggle
7. Test color theme selector

## Netlify Features

### Automatic HTTPS
- SSL certificate automatically issued
- Renewed automatically
- No configuration needed

### Continuous Deployment
- Automatic deploys on Git push
- Preview deploys for pull requests
- Rollback to previous versions

### Performance
- Global CDN
- Automatic image optimization
- Automatic minification
- Gzip compression

### Analytics
- Built-in analytics dashboard
- Track visitor data
- Monitor performance

### Forms
- Netlify Forms for contact forms
- Spam filtering
- Email notifications

## Troubleshooting

### Site not showing up
- Wait 1-2 minutes for initial deployment
- Check **Deploys** tab for build status
- Check build logs for errors

### 404 errors on page refresh
- Verify `netlify.toml` is in root directory
- Check redirect rule: `from = "/*"` → `to = "/index.html"`
- Clear browser cache and try again

### Environment variables not working
- Verify variables are set in Site settings
- Redeploy after adding variables
- Check variable names match your code

### Images not loading
- Use relative paths: `img/hero.jpeg`
- Not absolute paths: `/img/hero.jpeg`
- Check file names match exactly (case-sensitive)

### Slow performance
- Check Netlify Analytics
- Optimize images before uploading
- Enable caching in netlify.toml (already configured)

## Deployment Status

Check deployment status:
1. Go to Netlify Dashboard
2. Click your site
3. Go to **Deploys** tab
4. View build logs and status

## Rollback to Previous Version

1. Go to **Deploys** tab
2. Find the deployment you want to restore
3. Click **...** → **Publish deploy**
4. Your site will revert to that version

## Update Your Site

After deployment, to update your portfolio:

```bash
git add .
git commit -m "Update: Your changes"
git push origin main
```

Netlify will automatically build and deploy your changes!

## Performance Optimization

### Image Optimization
- Netlify automatically optimizes images
- Serves WebP format when supported
- Responsive image sizing

### Caching Strategy
- HTML: 1 hour cache
- CSS/JS: 1 year cache (immutable)
- Images: 1 year cache (immutable)

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: enabled
- Referrer-Policy: strict-origin-when-cross-origin

## Advanced Features

### Netlify Functions
- Serverless functions for backend logic
- Create `functions/` directory
- Write functions in Node.js or other languages

### Netlify Forms
- Add forms to your site
- Spam filtering included
- Email notifications

### Netlify Analytics
- Track visitor data
- Monitor performance
- View traffic sources

### Split Testing
- A/B test different versions
- Compare performance
- Gradual rollouts

## Monitoring

### Build Notifications
1. Go to **Site settings** → **Build & deploy** → **Deploy notifications**
2. Add email notifications for failed builds
3. Get Slack notifications (with Slack integration)

### Performance Monitoring
1. Go to **Analytics** tab
2. View visitor data
3. Monitor page performance
4. Track conversion goals

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Netlify CLI](https://docs.netlify.com/cli/overview/)
- [Netlify Support](https://support.netlify.com)
- [Netlify Community](https://community.netlify.com)

## Comparison: GitHub Pages vs Netlify

| Feature | GitHub Pages | Netlify |
|---------|-------------|---------|
| Hosting | Free | Free (with paid plans) |
| Custom Domain | Yes | Yes |
| HTTPS | Yes | Yes |
| CDN | Yes | Yes (Global) |
| Build Tools | Limited | Full support |
| Environment Variables | No | Yes |
| Forms | No | Yes |
| Functions | No | Yes |
| Analytics | No | Yes |
| Rollback | No | Yes |
| Preview Deploys | No | Yes |

---

**Ready to deploy?** Follow the steps above and your portfolio will be live on Netlify!
