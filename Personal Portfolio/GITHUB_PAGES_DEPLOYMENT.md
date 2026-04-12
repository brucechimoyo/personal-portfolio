# GitHub Pages Deployment Guide

This guide will help you deploy your portfolio to GitHub Pages.

## Prerequisites

- GitHub account
- Git installed on your machine
- Your portfolio files ready

## Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **+** icon in the top right and select **New repository**
3. Name your repository: `username.github.io` (replace `username` with your GitHub username)
4. Make it **Public**
5. Click **Create repository**

## Step 2: Initialize Git Locally

Open your terminal/command prompt in your portfolio directory and run:

```bash
git init
git add .
git commit -m "Initial commit: Portfolio website"
git branch -M main
git remote add origin https://github.com/username/username.github.io.git
git push -u origin main
```

Replace `username` with your actual GitHub username.

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (gear icon)
3. Scroll down to **Pages** section
4. Under "Source", select **Deploy from a branch**
5. Select **main** branch and **/ (root)** folder
6. Click **Save**

Your site will be published at: `https://username.github.io`

## Step 4: Configure for Subdirectory (Optional)

If you want to deploy to a subdirectory like `https://username.github.io/portfolio`:

1. Create a repository named `portfolio` (not `username.github.io`)
2. Update your `index.html` to include a base path:

```html
<base href="/portfolio/">
```

3. Update your router to handle the base path in `js/router.js`

## Step 5: Update Environment Variables

1. Create a `.env` file in your root directory (already exists)
2. Add your Contentful credentials if using CMS:

```
VITE_CONTENTFUL_SPACE_ID=your_space_id
VITE_CONTENTFUL_ACCESS_TOKEN=your_access_token
```

3. The `.env` file is in `.gitignore`, so it won't be pushed to GitHub

## Step 6: Custom Domain (Optional)

To use a custom domain:

1. Go to **Settings** > **Pages**
2. Under "Custom domain", enter your domain (e.g., `yourname.com`)
3. Click **Save**
4. Update your domain's DNS settings to point to GitHub Pages:
   - Add an `A` record pointing to `185.199.108.153`
   - Or add a `CNAME` record pointing to `username.github.io`

## Step 7: Verify Deployment

1. Wait 1-2 minutes for GitHub to build and deploy
2. Visit `https://username.github.io` in your browser
3. Your portfolio should be live!

## Troubleshooting

### Site not showing up
- Wait a few minutes for GitHub Pages to build
- Check the **Actions** tab to see build status
- Ensure your repository is public

### 404 errors on page refresh
- This is normal for single-page applications (SPAs)
- Create a `404.html` file in your root with the same content as `index.html`
- GitHub Pages will serve this for missing routes

### Assets not loading
- Check that all file paths are relative (not absolute)
- Verify images and CSS files are in the correct directories
- Check browser console for 404 errors

### Environment variables not working
- GitHub Pages doesn't support `.env` files
- Use mock data or hardcode values for public deployment
- For sensitive data, use GitHub Secrets with Actions

## Updating Your Site

To update your portfolio after deployment:

```bash
git add .
git commit -m "Update: Description of changes"
git push origin main
```

GitHub Pages will automatically rebuild and deploy your changes.

## Performance Tips

1. **Optimize images**: Compress images before uploading
2. **Minify CSS/JS**: Use build tools for production
3. **Enable caching**: GitHub Pages includes cache headers
4. **Use CDN**: Consider using a CDN for assets

## Security

- Keep your `.env` file in `.gitignore`
- Don't commit sensitive credentials
- Use GitHub Secrets for CI/CD workflows
- Enable branch protection rules

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Pages Troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-common-issues-with-github-pages)
- [Custom Domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

---

**Ready to deploy?** Follow the steps above and your portfolio will be live on GitHub Pages!
