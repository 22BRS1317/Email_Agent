# MongoDB Atlas Setup Guide

## Issue: Connection Timeout

Your MongoDB connection is timing out, which usually means your IP address is not whitelisted in MongoDB Atlas.

## Steps to Fix MongoDB Atlas Connection

### Step 1: Access MongoDB Atlas
1. Go to https://cloud.mongodb.com/
2. Log in with your credentials
3. Select your project (the one containing `cluster0`)

### Step 2: Add Network Access (MOST COMMON ISSUE)
1. In the left sidebar, click **"Network Access"**
2. Click **"Add IP Address"** button
3. You have two options:
   
   **Option A - Allow Current IP (Recommended for development):**
   - Click **"Add Current IP Address"**
   - This will automatically add your current IP
   
   **Option B - Allow All IPs (For testing only, NOT recommended for production):**
   - Click **"Allow Access from Anywhere"**
   - This adds `0.0.0.0/0` which allows all IPs
   - ⚠️ Use this only for testing!

4. Click **"Confirm"**
5. Wait 1-2 minutes for the changes to propagate

### Step 3: Verify Database User
1. In the left sidebar, click **"Database Access"**
2. Check if user `chakrisrivi_db_user` exists
3. If it exists, verify it has permissions:
   - Role: `readWrite` on database `emailagent` OR `Atlas admin`
4. If the user doesn't exist or password is wrong:
   - Click **"Add New Database User"**
   - Username: `chakrisrivi_db_user`
   - Password: `chakrisrivi_db_user` (or set a new password)
   - Database User Privileges: Select **"Read and write to any database"**
   - Click **"Add User"**

### Step 4: Get Fresh Connection String (Optional)
1. Go to **"Database"** in the left sidebar
2. Click **"Connect"** button on your cluster
3. Select **"Connect your application"**
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Make sure the database name is included

### Step 5: Update .env File
If you got a new connection string or changed the password, update your `.env` file:

```bash
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.syoodd6.mongodb.net/emailagent?retryWrites=true&w=majority
```

**Important Notes:**
- If your password contains special characters like `@`, `#`, `$`, etc., you need to URL-encode them
- Common encodings: `@` → `%40`, `#` → `%23`, `$` → `%24`

### Step 6: Restart Backend Server
After making changes in MongoDB Atlas, restart your backend:
1. Stop the backend server (Ctrl+C)
2. Run `npm start` again
3. You should see "MongoDB connected" in the console

## Quick Test
Run this command to test the connection:
```bash
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGO_URI).then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

## Common Errors and Solutions

### Error: "MongooseServerSelectionError: connection timed out"
**Cause:** IP not whitelisted
**Solution:** Follow Step 2 above to add your IP to Network Access

### Error: "Authentication failed"
**Cause:** Wrong username or password
**Solution:** Follow Step 3 to verify/reset database user credentials

### Error: "bad auth : authentication failed"
**Cause:** User doesn't exist or has wrong permissions
**Solution:** Create new database user with proper permissions (Step 3)

## What to Do Next
1. Complete the steps above in MongoDB Atlas
2. Let me know when done, and I'll restart the backend server to test the connection
3. We can then verify MongoDB is working by creating a test user
