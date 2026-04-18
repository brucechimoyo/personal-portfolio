# Quick Start: Deploy to GitHub Pages in 5 Minutes

## Step 1: Create Repository (2 min)

1. Go to [GitHub](https://github.com/new)
2. Repository name: `username.github.io` (replace `username`)
3. Make it **Public**
4. Click **Create repository**

## Step 2: Push Your Code (2 min)

Open terminal in your portfolio directory and run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/username.github.io.git
git push -u origin main
```

Replace `username` with your GitHub username.

## Step 3: Enable GitHub Pages (1 min)

1. Go to repository **Settings**
2. Click **Pages** (left sidebar)
3. Under "Source", select **Deploy from a branch**
4. Select **main** branch and **/ (root)** folder
5. Click **Save**

## Done! 🎉

Your site is live at: `https://username.github.io`

Wait 1-2 minutes for the first deployment to complete.

---

## Troubleshooting

**Site not showing?**
- Wait 2-3 minutes
- Check Actions tab for build status
- Ensure repository is Public

**404 errors on refresh?**
- This is normal for SPAs
- The `404.html` file handles this automatically

**Images not loading?**
- Check file paths are relative: `img/hero.jpeg`
- Not absolute: `/img/hero.jpeg`

---

## Update Your Site

After deployment, to update your portfolio:

```bash
git add .
git commit -m "Update: Your changes here"
git push origin main
```

GitHub Pages will automatically rebuild and deploy!

---

For detailed instructions, see **GITHUB_PAGES_DEPLOYMENT.md**
