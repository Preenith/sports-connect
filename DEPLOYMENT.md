# Deployment Guide - Sports Booking App

## Prerequisites
- GitHub account
- MongoDB Atlas account (free)
- Render account (free) or Vercel account (free)

---

## Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Verify email

### 1.2 Create a Cluster
1. Click "Build a Database"
2. Select "M0" (Free) cluster
3. Choose region closest to you (e.g., Mumbai for India)
4. Cluster name: `sports-booking`
5. Click "Create"
6. Wait for cluster to be created (2-5 minutes)

### 1.3 Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Username: `sportsbooking` (or your choice)
4. Password: Generate a strong password (save it!)
5. Database User Privileges: Read and write to any database
6. Click "Create"

### 1.4 Whitelist IP Addresses
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.5 Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Driver: Node.js
5. Version: 4.1 or later
6. Copy the connection string
7. Replace `<password>` with your database user password
8. Save this string for later

**Example connection string:**
```
mongodb+srv://sportsbooking:YOUR_PASSWORD@cluster0.mongodb.net/sports_booking?retryWrites=true&w=majority
```

---

## Step 2: Push Code to GitHub

### 2.1 Initialize Git (if not already)
```bash
git init
git add .
git commit -m "Initial commit"
```

### 2.2 Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `sports-booking`
3. Make it Private (recommended)
4. Click "Create repository"

### 2.3 Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/sports-booking.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend on Render

### 3.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your GitHub

### 3.2 Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `sports-booking-backend`
   - **Region**: Choose closest region
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

### 3.3 Add Environment Variables
Scroll down to "Environment Variables" and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generate a random secret (e.g., `your-secret-key-12345`) |
| `PORT` | `10000` |

### 3.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Copy the backend URL (e.g., `https://sports-booking-backend.onrender.com`)

---

## Step 4: Update Frontend API URL

### 4.1 Update API calls in frontend
You need to update all API calls to use the new backend URL.

**Option A: Use environment variable (recommended)**

Create `frontend/.env` file:
```
VITE_API_URL=https://sports-booking-backend.onrender.com/api
```

Then update frontend code to use `import.meta.env.VITE_API_URL`

**Option B: Hardcode the URL (simpler)**

Replace all `/api/` with your backend URL in frontend JavaScript files.

For now, let's use the simpler approach - I'll help you update the frontend files.

---

## Step 5: Deploy Frontend on Vercel

### 5.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your GitHub

### 5.2 Import Project
1. Click "Add New Project"
2. Select your `sports-booking` repository
3. Configure:
   - **Project Name**: `sports-booking-frontend`
   - **Root Directory**: `frontend`
   - **Framework Preset**: None
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

### 5.3 Add Environment Variables (if using Option A above)
Add `VITE_API_URL` with your backend URL

### 5.4 Deploy
1. Click "Deploy"
2. Wait for deployment (1-2 minutes)
3. Copy the frontend URL

---

## Step 6: Update Backend CORS (Important)

### 6.1 Update CORS in backend
Edit `backend/server.js` to allow your Vercel frontend:

```javascript
app.use(cors({
    origin: ['https://your-frontend.vercel.app', 'http://localhost:3000'],
    credentials: true
}));
```

---

## Step 7: Test Your Deployed App

1. Visit your Vercel frontend URL
2. Try to register/login
3. Browse facilities
4. Make a test booking
5. Check MongoDB Atlas to see data

---

## Alternative: Deploy Everything on Render

If you prefer to host both frontend and backend on Render:

### Backend (as above)
- Follow Step 3

### Frontend on Render
1. Create another Web Service
2. Root Directory: `frontend`
3. Build Command: (leave empty)
4. Start Command: Use a simple static server or configure as SPA (Single Page Application)

---

## Troubleshooting

### Backend won't start
- Check Render logs
- Verify MONGODB_URI is correct
- Ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0

### Frontend can't connect to backend
- Check CORS settings
- Verify API URL is correct
- Check backend is running

### MongoDB connection fails
- Verify password in connection string
- Check IP whitelist
- Ensure cluster is active (not paused)

---

## Cost Summary

| Service | Cost |
|---------|------|
| MongoDB Atlas (M0) | Free |
| Render (Web Service) | Free tier (spins down after inactivity) |
| Vercel | Free |
| **Total** | **$0/month** |

---

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates (automatic on Vercel/Render)
3. Set up monitoring and error tracking
4. Add automated testing
5. Set up CI/CD pipeline
