# Vercel Deployment Guide

## Step 1: Deploy Backend on Render First

Before deploying frontend to Vercel, you need the backend URL.

1. Follow the Render deployment guide in DEPLOYMENT.md
2. Get your backend URL (e.g., `https://sports-booking-api.onrender.com`)

## Step 2: Update Frontend API URL

Edit `frontend/js/config.js` and replace the backend URL:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://YOUR_BACKEND_URL.onrender.com/api'; // Replace with your actual backend URL
```

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your GitHub

### 3.2 Import Project
1. Click "Add New Project"
2. Select your `sports-booking` repository
3. Configure:
   - **Project Name**: `sports-booking-frontend`
   - **Framework Preset**: Other
   - **Root Directory**: `frontend`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

### 3.3 Deploy
1. Click "Deploy"
2. Wait 1-2 minutes
3. Copy your Vercel URL (e.g., `https://sports-booking-frontend.vercel.app`)

## Step 4: Update Backend CORS

Edit `backend/server.js` and add your Vercel URL to CORS:

```javascript
app.use(cors({
    origin: [
        'https://YOUR_VERCEL_URL.vercel.app',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true
}));
```

Then redeploy the backend on Render.

## Step 5: Test

1. Visit your Vercel URL
2. Test registration/login
3. Browse facilities
4. Make a booking
5. Check MongoDB Atlas for data

## Troubleshooting

### CORS Errors
- Make sure your Vercel URL is in the backend CORS whitelist
- Redeploy backend after updating CORS

### API Calls Failing
- Check browser console for errors
- Verify API_BASE_URL in config.js is correct
- Check backend is running (visit backend URL directly)

### Images Not Loading
- Images need to be hosted separately or use CDN URLs
- Current images use Unsplash URLs which should work fine
