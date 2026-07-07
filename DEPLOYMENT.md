# Deployment Guide - Phoenix Vapers

Complete step-by-step guide for deploying Frontend (Vercel) and Backend (Render).

---

## 🎯 BACKEND DEPLOYMENT (Render)

### Step 1: Prepare the Repository

1. Make sure backend code is in the `server/` directory
2. Backend has its own `package.json` with build and start scripts
3. Ensure `.env` is not committed (add to `.gitignore`)

### Step 2: Create Render Service

1. Go to [https://render.com](https://render.com)
2. Sign in with GitHub account
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository (`phoenixvapers`)
5. Select the repository and authenticate

### Step 3: Configure Build Settings

**Basic Settings:**
- **Name:** `phoenix-vapers-api`
- **Environment:** Node
- **Region:** Frankfurt (EU-Central) or Singapore (closer to users)
- **Branch:** `main`
- **Root Directory:** `server` ⚠️ (Important!)
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### Step 4: Add Environment Variables

Click **"Advanced"** and add these environment variables:

```
NODE_ENV=production
PORT=4000
WEB_ORIGIN=https://your-frontend-domain.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/phoenix?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your-secure-random-string-32-chars
JWT_REFRESH_SECRET=your-secure-random-string-32-chars
STRIPE_SECRET_KEY=sk_live_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

**Important Security Notes:**
- Generate secure secrets using: `openssl rand -base64 32`
- Get MongoDB connection string from MongoDB Atlas
- Get Stripe keys from Stripe Dashboard
- Use environment-specific keys (production vs development)

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for build to complete (5-10 minutes)
3. Check logs for any errors
4. Once deployed, you'll get a URL like: `https://phoenix-vapers-api.onrender.com`

### Step 6: Verify Backend

Test your API:
```bash
curl https://phoenix-vapers-api.onrender.com/api/health
```

---

## 🚀 FRONTEND DEPLOYMENT (Vercel)

### Step 1: Prepare Next.js App

1. Ensure root `app/` directory is the Next.js app
2. Configure `next.config.js` if needed
3. Update `.env.local` with correct API URL

### Step 2: Create Vercel Project

1. Go to [https://vercel.com](https://vercel.com)
2. Sign in with GitHub account
3. Click **"Add New"** → **"Project"**
4. Select your GitHub repository
5. Vercel auto-detects it's a Next.js project

### Step 3: Configure Build Settings

**Framework Preset:** Next.js (should auto-detect)

**Build & Output Settings:**
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

**Root Directory:** Leave empty (root of repo)

### Step 4: Add Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_API_URL=https://phoenix-vapers-api.onrender.com/api
```

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to browser.

### Step 5: Deploy

1. Click **"Deploy"**
2. Vercel builds and deploys automatically
3. You'll get a URL like: `https://phoenix-vapers.vercel.app`
4. All pushes to `main` branch auto-deploy

### Step 6: Configure Custom Domain (Optional)

1. In Vercel, go to **Settings** → **Domains**
2. Add your domain: `phoenixvapers.com`
3. Update DNS records as shown in Vercel dashboard
4. Wait for SSL certificate (usually instant)

---

## 🔄 ENVIRONMENT SETUP

### Required Environment Variables

**Backend (.env in server/ directory):**
```
NODE_ENV=production
PORT=4000
WEB_ORIGIN=https://your-frontend-domain.vercel.app
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/phoenix
JWT_ACCESS_SECRET=your-32-char-random-string
JWT_REFRESH_SECRET=your-32-char-random-string
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Frontend (.env.local in root/):**
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com/api
```

### Generate Secure Secrets

```bash
# Generate 32-character random string
openssl rand -base64 32

# Or use Node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📦 MONGODB SETUP

### Create Atlas Database

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a cluster (Free tier available)
4. Create a database user with username/password
5. Whitelist Render's IP (0.0.0.0/0 for simplicity, or specific IPs)
6. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

### Connect from Render

1. Render provides outbound IP access
2. Whitelist `0.0.0.0/0` in MongoDB Atlas for public access
3. Use connection string in `MONGODB_URI` environment variable

---

## 💳 STRIPE SETUP

### Get API Keys

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **API Keys**
3. Copy **Secret Key** (sk_live_xxxxx)
4. Copy **Publishable Key** (pk_live_xxxxx)

### Get Webhook Secret

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. URL: `https://your-backend.onrender.com/api/payments/webhook`
4. Select events: `charge.succeeded`, `charge.failed`
5. Copy signing secret (whsec_xxxxx)

### Add to Environment

Add these to Render environment variables:
```
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## ✅ VERIFICATION CHECKLIST

### Backend (Render)

- [ ] Build succeeds without errors
- [ ] App starts and logs listening on port
- [ ] Health check endpoint responds: `GET /api/health`
- [ ] Database connection works
- [ ] CORS headers allow frontend origin
- [ ] Logs visible in Render dashboard

### Frontend (Vercel)

- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] API calls work with correct backend URL
- [ ] Dark mode toggle works
- [ ] All pages load properly
- [ ] Admin login redirects to `/admin/login`

### Integration

- [ ] Frontend can reach backend API
- [ ] Authentication flow works (login/logout)
- [ ] Cart operations function
- [ ] Admin console accessible with credentials
- [ ] No CORS errors in browser console

---

## 🔧 TROUBLESHOOTING

### Backend Won't Start

**Error: "No open ports detected"**
- ✅ Fixed: Updated `main.ts` to listen on `0.0.0.0`
- Verify in Render logs: "listening on port 4000"

**Error: "Connection refused"**
- Check MongoDB URI is correct
- Verify Render IP is whitelisted in MongoDB Atlas
- Check connection string format: `mongodb+srv://user:pass@host/db`

**Error: "CORS error"**
- Verify `WEB_ORIGIN` matches Vercel domain exactly
- Check it's set in Render environment variables
- Clear browser cache

### Frontend Won't Build

**Error: "Cannot find module"**
- Run `npm install` locally
- Check imports use correct paths
- Verify `.env.local` has `NEXT_PUBLIC_API_URL`

**Error: "API calls 404"**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify backend is running and listening
- Test API directly: `curl https://backend-url/api/health`

### Database Issues

**Error: "MongoError: connect ECONNREFUSED"**
- Verify MongoDB URI is correct
- Check Render IP is whitelisted (set to 0.0.0.0/0)
- Ensure database exists in MongoDB Atlas

---

## 🚀 DEPLOYMENT WORKFLOW

### For Updates

1. **Make changes locally**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

2. **Automatic deployment happens:**
   - Render rebuilds backend (watch logs)
   - Vercel rebuilds frontend (watch deployments)
   - Takes 5-10 minutes total

3. **Verify in production**
   - Check Render logs for errors
   - Visit frontend URL
   - Test critical features

### Rollback

If something breaks:
1. In Render: Click previous deployment
2. In Vercel: Go to "Deployments", select previous, click "Promote to Production"

---

## 📝 Environment Variables Summary

### Backend (Render)
```
NODE_ENV                    → production
PORT                        → 4000
WEB_ORIGIN                  → https://phoenixvapers.vercel.app
MONGODB_URI                 → mongodb+srv://...
JWT_ACCESS_SECRET           → 32-char random
JWT_REFRESH_SECRET          → 32-char random
STRIPE_SECRET_KEY           → sk_live_...
STRIPE_WEBHOOK_SECRET       → whsec_...
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL         → https://phoenix-vapers-api.onrender.com/api
```

---

## 🎯 QUICK START DEPLOYMENT

**Fastest path to production:**

1. Create MongoDB Atlas cluster
2. Generate JWT secrets: `openssl rand -base64 32`
3. Set up Stripe account and get keys
4. Create Render Web Service (root dir: `server`)
5. Add all environment variables to Render
6. Deploy (5-10 min build time)
7. Create Vercel project (auto-detects Next.js)
8. Add `NEXT_PUBLIC_API_URL` environment variable
9. Deploy (2-3 min build time)
10. Done! ✅

**Total time: ~20 minutes for both deployments**

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **MongoDB Atlas:** https://docs.atlas.mongodb.com
- **NestJS Deployment:** https://docs.nestjs.com/deployment

