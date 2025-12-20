# Deployment Guide - SQL Practice App

## Vercel Deployment (Recommended)

This application is configured for optimal deployment on Vercel.

### Prerequisites

1. GitHub account (already connected to this repository)
2. Vercel account (free tier available at https://vercel.com)
3. Anthropic API key for AI hints feature

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Visit Vercel Dashboard**
   - Go to https://vercel.com/new
   - Sign in with GitHub

2. **Import Repository**
   - Click "Import Project"
   - Select `ratanon97/SQL_Practice` from your GitHub repositories
   - Click "Import"

3. **Configure Project**
   - Framework Preset: `SvelteKit` (auto-detected)
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.svelte-kit/output` (auto-filled)
   - Install Command: `npm install` (auto-filled)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add: `ANTHROPIC_API_KEY` = `your-api-key-here`
   - Important: Get your API key from https://console.anthropic.com

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your site will be live at `https://sql-practice-xxx.vercel.app`

### Option 2: Deploy via CLI (For Developers)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts to link project and set environment variables
```

### Post-Deployment Setup

1. **Set Environment Variable**
   - Go to your project in Vercel Dashboard
   - Settings → Environment Variables
   - Add `ANTHROPIC_API_KEY` with your API key
   - Redeploy for changes to take effect

2. **Configure Custom Domain (Optional)**
   - Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

3. **Enable Analytics (Optional)**
   - Analytics → Enable
   - Monitor traffic and performance

### Environment Variables Required

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | API key for Claude AI hints | Optional* |

*The app works without the API key, but AI hints feature will be disabled.

### Automatic Deployments

Once connected to Vercel:
- **Every push to `main`** triggers automatic production deployment
- **Pull requests** get preview deployments
- **Branch deployments** available for testing

### Build Configuration

The app is configured with:
- ✅ Vercel adapter for optimal performance
- ✅ Security headers (CSP, XSS protection, etc.)
- ✅ Node.js 20.x runtime
- ✅ Code splitting for faster loads
- ✅ Automatic HTTPS
- ✅ Global CDN distribution

### Troubleshooting

**Build fails with "Module not found"**
- Ensure all dependencies in `package.json` are committed
- Check that `node_modules` is in `.gitignore`

**AI hints not working**
- Verify `ANTHROPIC_API_KEY` is set in Vercel dashboard
- Check API key is valid at https://console.anthropic.com
- Redeploy after adding environment variable

**App loads slowly**
- PGlite WASM initialization takes ~2s on first load (normal)
- Subsequent loads are cached and much faster

### Performance Optimizations

Already configured:
- ✅ Static asset caching
- ✅ Image optimization
- ✅ Code splitting
- ✅ Compression (Brotli/gzip)
- ✅ HTTP/2 & HTTP/3 support

### Monitoring

Vercel provides built-in:
- Real-time logs
- Error tracking
- Performance analytics
- Usage metrics

Access via: https://vercel.com/dashboard

---

## Alternative Platforms

### Netlify

```bash
# Install adapter
npm install -D @sveltejs/adapter-netlify

# Update svelte.config.js
import adapter from '@sveltejs/adapter-netlify';
```

### Cloudflare Pages

```bash
# Install adapter
npm install -D @sveltejs/adapter-cloudflare

# Update svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';
```

---

## Local Preview

Test production build locally:

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Open http://localhost:4173
```

---

## Support

- Vercel Docs: https://vercel.com/docs
- SvelteKit Docs: https://svelte.dev/docs/kit
- Issues: https://github.com/ratanon97/SQL_Practice/issues
