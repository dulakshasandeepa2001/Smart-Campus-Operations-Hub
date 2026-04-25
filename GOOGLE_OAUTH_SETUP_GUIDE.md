# Google OAuth Setup Guide - Fix Authorization Error

## Problem
You're getting: **"Access blocked: Authorization Error - Error 401: invalid_client"**

This error occurs because the Google OAuth client ID isn't properly configured in Google Cloud Console.

---

## ✅ Solution: Step-by-Step Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the **Project selector** at the top
3. Click **New Project**
4. Enter project name: `Smart Campus Operations Hub`
5. Click **Create** and wait for the project to be created

### Step 2: Enable Google+ API

1. In the Google Cloud Console, search for **"Google+ API"** in the search bar
2. Click on **Google+ API** from results
3. Click **Enable**
4. Wait for the API to be enabled

---

### Step 3: Create OAuth 2.0 Credentials

1. In the left sidebar, click **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. You'll see a warning: "You need to configure the OAuth consent screen first"
   - Click **Configure Consent Screen**

### Step 4: Configure OAuth Consent Screen

1. Choose **External** as the user type
2. Click **Create**
3. Fill in the form:
   - **App name**: `Smart Campus Operations Hub`
   - **User support email**: `sandeepadulaksha93@gmail.com`
   - **Developer contact**: `sandeepadulaksha93@gmail.com`
4. Click **Save and Continue**

**Scopes Page:**
- Click **Add or Remove Scopes**
- Search and select:
  - `email`
  - `profile`
  - `openid`
- Click **Update** and **Save and Continue**

**Test Users Page:**
- Click **Add Users**
- Add your email: `sandeepadulaksha93@gmail.com`
- Click **Save and Continue**

**Review & Submit:**
- Click **Back to Dashboard**

---

### Step 5: Create OAuth 2.0 Client ID

1. Go back to **Credentials** page (from left sidebar)
2. Click **+ Create Credentials** → **OAuth client ID**
3. Select **Web application** as application type
4. Enter name: `Smart Campus Web Client`

**Add Authorized JavaScript Origins:**
- Click **+ Add URI**
- Add these URIs:
  - `http://localhost:5173`
  - `http://localhost:3000`
  - `http://localhost:3001`
  - `http://localhost:8080`
  - Your production domain (e.g., `https://yourdomain.com`)

**Add Authorized Redirect URIs:**
- Click **+ Add URI** under redirect URIs
- Add these URIs:
  - `http://localhost:5173/dashboard`
  - `http://localhost:5173/`
  - `http://localhost:3000/dashboard`
  - `http://localhost:3000/`
  - `http://localhost:8080/api/auth/google`
  - Your production redirect URIs

5. Click **Create**
6. A popup will show your **Client ID** and **Client Secret**
   - **Copy the Client ID** (you'll need this)

---

### Step 6: Update Frontend Configuration

**File:** `frontend/src/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.jsx'
import './App.css'
import './styles/auth.css'

// Use the Client ID from Google Cloud Console
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
```

**Create `.env` file in frontend root:**

```
VITE_GOOGLE_CLIENT_ID=your_client_id_from_google_cloud_here
VITE_API_URL=http://localhost:8080/api
```

### Step 7: Update Backend Configuration

**File:** `backend/src/main/resources/application.properties`

Update the Google client ID (replace with the one from Google Cloud):

```properties
# Google OAuth Configuration
app.google.client-id=YOUR_GOOGLE_CLIENT_ID_FROM_GOOGLE_CLOUD
```

---

### Step 8: Restart Both Services

**Backend:**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Frontend (in a new terminal):**
```bash
cd frontend
npm install  # if not done yet
npm run dev
```

---

## ✅ Test the OAuth Login

1. Open `http://localhost:5173` in your browser
2. Click **"Sign in with Google"** button on login page
3. You should see the Google sign-in popup
4. Sign in with your test email
5. You should be redirected to the dashboard

---

## 🔧 Troubleshooting

### Error: "The OAuth client was not found"
- ✅ Make sure you used the correct Client ID from Google Cloud Console
- ✅ Check that `VITE_GOOGLE_CLIENT_ID` environment variable is set correctly
- ✅ Verify the origins are whitelisted in Google Cloud Console

### Error: "The redirect_uri mismatch"
- ✅ Add the redirect URI to **Authorized Redirect URIs** in Google Cloud Console
- ✅ The redirect URI must match EXACTLY (including protocol and port)
- ✅ After adding, restart your frontend server

### Google Sign-in Button Not Showing
- ✅ Check that `@react-oauth/google` is installed: `npm list @react-oauth/google`
- ✅ Verify the Client ID is not empty
- ✅ Check browser console for errors (F12 → Console tab)

### CORS Error When Sending Token to Backend
- ✅ Backend CORS is already configured for localhost origins
- ✅ Make sure backend is running at `http://localhost:8080`
- ✅ Check that `@Valid @RequestBody` is receiving the token

---

## 📝 Important Notes

1. **Client ID vs Client Secret**:
   - Share Client ID with frontend ✅
   - NEVER share Client Secret in frontend
   - Only use Client Secret on backend if needed

2. **Production Deployment**:
   - Add your production domain to JavaScript Origins
   - Add your production redirect URI to Redirect URIs
   - Use environment variables for different Client IDs (dev vs prod)

3. **Testing**:
   - Use the test email you added to the OAuth Consent Screen
   - Once in production, any Google account can sign in

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [React Google Login Library](https://www.npmjs.com/package/@react-oauth/google)

---

## ✨ Expected Result

After following these steps:
- ✅ Google Sign-in button will appear on login page
- ✅ Clicking it will open Google sign-in popup
- ✅ After signing in, you'll be logged into the app automatically
- ✅ JWT token will be generated and stored
- ✅ You'll be redirected to dashboard

---

## 🎯 Quick Verification Checklist

- [ ] Google Cloud Project created
- [ ] Google+ API enabled
- [ ] OAuth Consent Screen configured
- [ ] OAuth 2.0 Client ID created
- [ ] All redirect URIs added correctly
- [ ] Client ID added to `.env` in frontend
- [ ] Client ID added to `application.properties` in backend
- [ ] Both frontend and backend restarted
- [ ] Google Sign-in button works
- [ ] Can successfully login with Google account
