# Real Google OAuth Implementation Guide

## 🎯 Complete Setup for Real Google Accounts

### Step 1: Google Cloud Console Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create/Select Project**: 
   - Click "Select a project" → "New Project"
   - Name: "Cointoss OAuth" → Create
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search "Google+ API" → Enable
4. **Create OAuth 2.0 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "Cointoss Web Client"
   - Authorized origins: 
     - `http://localhost:8080`
     - `http://localhost:3000`
     - `https://yourdomain.com` (when you deploy)
   - Click "Create"
5. **Copy Client ID**: Save the Client ID (looks like: `123456789-abc123.apps.googleusercontent.com`)

### Step 2: Update Your Code

Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Client ID in both files:

#### In `src/pages/Login.js` (around line 17):
```javascript
client_id: 'your-actual-client-id-here.apps.googleusercontent.com'
```

#### In `src/pages/SignUp.js` (around line 18):
```javascript
client_id: 'your-actual-client-id-here.apps.googleusercontent.com'
```

### Step 3: Replace Demo Code with Real OAuth

Replace the demo `handleGoogleSignInClick` function with real OAuth code:

```javascript
const handleGoogleSignInClick = () => {
  if (window.google) {
    window.google.accounts.id.prompt();
  } else {
    alert('Google Sign-In is not available. Please refresh the page and try again.');
  }
};
```

### Step 4: Test Real Google OAuth

1. Start your server: `npm start`
2. Go to `/login` or `/signup`
3. Click "Continue with Google"
4. **Real Google popup** should appear
5. Sign in with your actual Google account
6. You'll be redirected to home page with real user data

## 🔒 Security Notes

- **Never expose Client Secret** in frontend code
- **Always verify tokens** on backend in production
- **Use HTTPS** in production
- **Set proper CORS** policies

## 🚀 Production Deployment

When deploying to production:
1. Add your production domain to authorized origins
2. Update the Client ID if needed
3. Ensure HTTPS is enabled
4. Set up backend token verification











