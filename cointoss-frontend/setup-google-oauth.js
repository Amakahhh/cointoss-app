// Google OAuth Setup Helper
// Run this script to get your Google Client ID

console.log(`
🚀 GOOGLE OAUTH SETUP HELPER

Step 1: Go to Google Cloud Console
👉 https://console.cloud.google.com/

Step 2: Create/Select Project
📁 Create new project: "Cointoss OAuth"

Step 3: Enable Google+ API
🔧 APIs & Services → Library → Search "Google+ API" → Enable

Step 4: Create OAuth 2.0 Credentials
🔑 APIs & Services → Credentials → CREATE CREDENTIALS → OAuth 2.0 Client ID
   - Application type: Web application
   - Name: "Cointoss Web Client"
   - Authorized origins: 
     * http://localhost:8080
     * http://localhost:3000
     * https://yourdomain.com (when you deploy)

Step 5: Copy Your Client ID
📋 It looks like: 123456789-abc123def456.apps.googleusercontent.com

Step 6: Update Your Code
✏️  Replace 'YOUR_GOOGLE_CLIENT_ID' in:
   - src/pages/Login.js (line 17)
   - src/pages/SignUp.js (line 18)

Step 7: Test
🎯 Click "Continue with Google" on login/signup pages
   Real Google popup should appear!

Need help? Check: REAL_GOOGLE_OAUTH_SETUP.md
`);

// Example of what your Client ID looks like:
const exampleClientId = '123456789-abcdefghijklmnop.apps.googleusercontent.com';
console.log('Example Client ID format:', exampleClientId);











