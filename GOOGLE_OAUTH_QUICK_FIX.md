# Google OAuth Login Error - Quick Fix

## 🔴 The Problem
```
Access blocked: Authorization Error
Error 401: invalid_client
The OAuth client was not found.
```

This error means your Google OAuth credentials aren't set up in Google Cloud Console.

---

## ✅ Quick Fix (5 Steps)

### Step 1: Create Google Cloud Project
- Go to https://console.cloud.google.com/
- Create a new project named "Smart Campus Operations Hub"

### Step 2: Enable Google+ API
- Search for "Google+ API" in the console
- Click **Enable**

### Step 3: Create OAuth Credentials
- Go to **Credentials** (left sidebar)
- Click **Create Credentials** → **OAuth client ID**
- Choose **Web application**
- Name it: `Smart Campus Web Client`

### Step 4: Configure OAuth Settings
**Add these Authorized JavaScript Origins:**
```
http://localhost:5173
http://localhost:3000
http://localhost:8080
```

**Add these Authorized Redirect URIs:**
```
http://localhost:5173/dashboard
http://localhost:5173/
http://localhost:3000/
http://localhost:8080/api/auth/google
```

### Step 5: Update Configuration
Copy your **Client ID** and:

**In `frontend/.env`:**
```
VITE_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE
```

**In `backend/src/main/resources/application.properties`:**
```properties
app.google.client-id=YOUR_CLIENT_ID_HERE
```

---

## 🚀 Test It

1. Restart both services:
```bash
# Backend
cd backend && mvn spring-boot:run

# Frontend (new terminal)
cd frontend && npm run dev
```

2. Open `http://localhost:5173`
3. Click "Sign in with Google"
4. Sign in with your Google account

---

## 📚 Detailed Guide
See **GOOGLE_OAUTH_SETUP_GUIDE.md** for step-by-step instructions with screenshots.

---

## ❓ Still Not Working?

### Check These:
- [ ] Did you copy the Client ID correctly?
- [ ] Is `.env` in the frontend root directory (not src)?
- [ ] Did you restart both frontend and backend after changes?
- [ ] Are all redirect URIs exactly as shown above?
- [ ] Are you using localhost:5173 or localhost:3000? Make sure it matches your .env and Google Console settings.

### Common Issues:
| Error | Fix |
|-------|-----|
| "Invalid request" | Client ID is wrong - double-check it |
| "redirect_uri mismatch" | Add the exact redirect URI to Google Console |
| "Google button not showing" | Check console for JS errors (F12) |
| "CORS error" | Backend CORS is configured - ensure it's running on 8080 |

---

## 💡 Pro Tips
- Never commit `.env` file to git (it's in .gitignore)
- Client ID can be shared; Client Secret must not be shared
- For production, create a separate OAuth credential set with production domains
- Test with your own Google account first

---

✨ **That's it!** Your Google Sign-in should now work.
