# Gmail API Setup Instructions

## Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Gmail API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Gmail API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - User Type: External (for testing) or Internal (for Google Workspace)
     - App name: Email Agent
     - User support email: your email
     - Developer contact: your email
     - Add scopes: `https://www.googleapis.com/auth/gmail.readonly`
     - Save and continue through the steps
   
5. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: Email Agent
   - **Authorized redirect URIs**: 
     - For development: `http://localhost:4000/api/gmail/callback`
     - For production: `https://yourdomain.com/api/gmail/callback`
   - Click "Create"
   - **Copy the Client ID and Client Secret**

## Step 2: Update .env File

1. Open `backend/.env` file
2. Add your credentials:

```env
GOOGLE_CLIENT_ID=paste_your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
```

3. Make sure these match:
   - `GOOGLE_REDIRECT_URI` in .env must match the redirect URI you set in Google Cloud Console
   - `FRONTEND_URL` should be your frontend URL

## Step 3: Test the Connection

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start your frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Log in to your app
4. Click "Connect Gmail" button
5. You should be redirected to Google to authorize
6. After authorization, you'll be redirected back and Gmail will be connected

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure `GOOGLE_REDIRECT_URI` in .env exactly matches what you set in Google Cloud Console
- Check for trailing slashes, http vs https, port numbers

### "access_denied" error
- Make sure you've enabled Gmail API in Google Cloud Console
- Check that the OAuth consent screen is configured

### "invalid_client" error
- Verify your Client ID and Client Secret are correct
- Make sure there are no extra spaces in the .env file

### Gmail emails not loading
- Check that the user has granted the `gmail.readonly` scope
- Verify the access token is stored in the database (check User.tokens array)



