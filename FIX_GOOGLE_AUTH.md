# Fix "Access Blocked" Error for Gmail

The "Access blocked" error means Google doesn't recognize the redirect URL or your email isn't authorized for testing.

## Step 1: Update Redirect URI
1. Go to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Click the **pencil icon** next to your OAuth 2.0 Client ID.
3. Under **"Authorized redirect URIs"**, add this **EXACT** URL:
   ```
   http://localhost:4000/api/gmail/callback
   ```
4. Click **Save**.

## Step 2: Add Test User (Crucial!)
1. Go to [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent).
2. Look at **"Publishing Status"**. If it says **"Testing"**:
   - Scroll down to the **"Test users"** section.
   - Click **"+ ADD USERS"**.
   - Enter your Gmail address (e.g., `yourname@gmail.com`).
   - Click **Save**.

## Step 3: Retry
1. Go back to your app at http://localhost:5173.
2. Refresh the page.
3. Click **"Connect Gmail"** again.
