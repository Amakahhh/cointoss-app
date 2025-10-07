# Google OAuth Setup Guide

## 🚀 Current Status: DEMO MODE

**✅ Google Sign-In buttons are now working in DEMO MODE!**

The buttons will simulate Google sign-in with mock user data until you set up real OAuth credentials.

### 🎯 How It Works Now:

1. **Click "Continue with Google"** → Shows success alert with mock data
2. **Mock user created** → Stores demo user info in localStorage  
3. **Navigation** → Redirects to home page
4. **Demo users**: 
   - Login: John Doe (john.doe@gmail.com)
   - SignUp: Jane Smith (jane.smith@gmail.com)

### 🔧 To Set Up Real Google OAuth:

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API

### 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Add authorized origins:
   - `http://localhost:8080` (for development)
   - `https://yourdomain.com` (for production)
5. Copy the **Client ID**

### 3. Update Your Code

Replace `YOUR_GOOGLE_CLIENT_ID` in these files:
- `src/pages/Login.js` (line 17)
- `src/pages/SignUp.js` (line 18)

```javascript
client_id: 'your-actual-client-id-here.apps.googleusercontent.com'
```

### 4. Replace Demo Code with Real OAuth

Replace the `handleGoogleSignInClick` function in both files with the real Google OAuth code:

```javascript
const handleGoogleSignInClick = () => {
  if (window.google) {
    window.google.accounts.id.prompt();
  } else {
    alert('Google Sign-In is not available. Please refresh the page and try again.');
  }
};
```

### 5. Backend Integration (Optional)

For production, you should verify the JWT token on your backend:

```javascript
// Backend verification example
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(YOUR_GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: YOUR_GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

### 6. User Data Structure

After successful Google sign-in, user data is stored in localStorage:

```javascript
{
  name: "John Doe",
  email: "john@example.com", 
  picture: "https://lh3.googleusercontent.com/...",
  provider: "google"
}
```

### 7. Security Notes

- **Never expose your Client Secret** in frontend code
- **Always verify tokens** on your backend in production
- **Use HTTPS** in production
- **Set proper CORS** policies

### 8. Troubleshooting

**Issue**: "Google Sign-In is not available"
**Solution**: Make sure the Google script is loaded and client_id is correct

**Issue**: "Invalid client_id"
**Solution**: Double-check your client ID and authorized origins

**Issue**: Popup blocked
**Solution**: Allow popups for your domain in browser settings

---

## ✅ What's Already Implemented

- ✅ Google OAuth script loaded in HTML
- ✅ Functional Google sign-in buttons
- ✅ JWT token decoding
- ✅ User data storage in localStorage
- ✅ Automatic navigation after sign-in
- ✅ Error handling
- ✅ Works on both Login and SignUp pages

Just replace the client ID and you're ready to go! 🎉
