# Quick Start: Deploy to Netlify in 3 Steps

## Step 1: Create Netlify Account (1 min)

1. Go to [Netlify](https://app.netlify.com/signup)
2. Click **Sign up with GitHub**
3. Authorize Netlify
4. Verify your email

## Step 2: Connect Your Repository (1 min)

1. Log in to [Netlify Dashboard](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Select **GitHub**
4. Choose your portfolio repository
5. Click **Deploy site**

That's it! Netlify will automatically deploy your site.

## Step 3: Set Custom Domain (Optional, 1 min)

### Netlify Subdomain
1. Go to **Site settings** → **Domain management**
2. Click **Edit site name**
3. Enter your desired name (e.g., `yourname`)
4. Your site is now at `yourname.netlify.app`

### Custom Domain
1. Purchase a domain
2. Go to **Domain management** → **Add custom domain**
3. Enter your domain
4. Update DNS settings (Netlify will guide you)
5. Wait for DNS propagation

## Done! 🎉

Your site is live at: `https://yourname.netlify.app`

---

## Automatic Updates

Every time you push to GitHub, Netlify automatically deploys:

```bash
git add .
git commit -m "Update: Your changes"
git push origin main
```

Check deployment status in **Deploys** tab.

---

## Key Features

✅ Automatic HTTPS
✅ Global CDN
✅ Continuous deployment
✅ Preview deploys
✅ Rollback support
✅ Environment variables
✅ Analytics included

---

For detailed instructions, see **NETLIFY_DEPLOYMENT.md**
