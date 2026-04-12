# GitHub Pages Deployment Checklist

Complete this checklist before deploying your portfolio to GitHub Pages.

## Pre-Deployment Setup

- [ ] Create a GitHub account (if you don't have one)
- [ ] Install Git on your machine
- [ ] Have your portfolio files ready
- [ ] Review the GITHUB_PAGES_DEPLOYMENT.md guide

## Repository Setup

- [ ] Create a new repository named `username.github.io` (replace username)
- [ ] Make the repository **Public**
- [ ] Clone the repository to your local machine
- [ ] Copy all portfolio files to the cloned directory

## File Verification

- [ ] `index.html` exists in root directory
- [ ] `css/` folder contains all CSS files
- [ ] `js/` folder contains all JavaScript files
- [ ] `img/` folder contains all images
- [ ] `.gitignore` file is present
- [ ] `404.html` file is present
- [ ] `package.json` file is present
- [ ] `.github/workflows/deploy.yml` exists

## Configuration

- [ ] Update `package.json` with your GitHub username in repository URL
- [ ] Update `package.json` with your GitHub username in homepage URL
- [ ] Verify `.env` file is in `.gitignore` (don't commit secrets)
- [ ] Check all relative paths in HTML/CSS/JS are correct
- [ ] Verify image paths use relative URLs (e.g., `img/hero.jpeg`)

## Local Testing

- [ ] Run local server: `python -m http.server 8000`
- [ ] Test all pages load correctly
- [ ] Test navigation works
- [ ] Test responsive design on mobile
- [ ] Test dark/light mode toggle
- [ ] Test color theme selector
- [ ] Check browser console for errors
- [ ] Verify all images load
- [ ] Test form submissions (if any)

## Git Setup

- [ ] Initialize git: `git init`
- [ ] Add all files: `git add .`
- [ ] Create initial commit: `git commit -m "Initial commit: Portfolio website"`
- [ ] Rename branch to main: `git branch -M main`
- [ ] Add remote: `git remote add origin https://github.com/username/username.github.io.git`
- [ ] Push to GitHub: `git push -u origin main`

## GitHub Pages Configuration

- [ ] Go to repository Settings
- [ ] Navigate to Pages section
- [ ] Select "Deploy from a branch"
- [ ] Choose **main** branch
- [ ] Choose **/ (root)** folder
- [ ] Click Save
- [ ] Wait 1-2 minutes for deployment

## Post-Deployment Verification

- [ ] Visit `https://username.github.io` in browser
- [ ] Verify site loads correctly
- [ ] Test all navigation links
- [ ] Test responsive design
- [ ] Check browser console for errors
- [ ] Verify images display correctly
- [ ] Test dark/light mode
- [ ] Test color themes
- [ ] Check Lighthouse scores

## Performance & SEO

- [ ] Run Lighthouse audit
- [ ] Verify Performance score > 90
- [ ] Verify Accessibility score > 95
- [ ] Verify Best Practices score > 90
- [ ] Verify SEO score > 90
- [ ] Check Core Web Vitals

## Maintenance

- [ ] Set up branch protection rules (optional)
- [ ] Enable GitHub Pages in repository settings
- [ ] Monitor GitHub Actions for deployment status
- [ ] Keep dependencies updated
- [ ] Regularly test site functionality

## Custom Domain (Optional)

- [ ] Purchase custom domain
- [ ] Update DNS settings
- [ ] Add custom domain in GitHub Pages settings
- [ ] Wait for DNS propagation (up to 24 hours)
- [ ] Verify HTTPS certificate is issued

## Troubleshooting

If deployment fails:

1. Check GitHub Actions tab for error logs
2. Verify all files are committed: `git status`
3. Check file paths are relative, not absolute
4. Ensure `.env` file is in `.gitignore`
5. Verify `404.html` exists in root
6. Check repository is public
7. Wait a few minutes and refresh

## Deployment Complete! 🎉

Your portfolio is now live on GitHub Pages!

- **Live URL**: `https://username.github.io`
- **Repository**: `https://github.com/username/username.github.io`
- **Deployment Status**: Check Actions tab for latest deployment

### Next Steps

1. Share your portfolio URL with others
2. Update your resume with portfolio link
3. Monitor analytics and user feedback
4. Keep content updated
5. Regularly test functionality

---

**Need help?** Refer to GITHUB_PAGES_DEPLOYMENT.md for detailed instructions.
