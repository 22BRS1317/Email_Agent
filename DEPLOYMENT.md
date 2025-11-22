# Deployment Guide for Email Agent

This guide will help you deploy the Email Agent application to production using **Render** (for the backend) and **Vercel** (for the frontend).

## Prerequisites

1.  **GitHub Repository:** Ensure your code is pushed to a GitHub repository.
2.  **Render Account:** Sign up at [render.com](https://render.com).
3.  **Vercel Account:** Sign up at [vercel.com](https://vercel.com).
4.  **MongoDB Atlas URI:** You already have this from your local setup.
5.  **Google Cloud Console:** You need your Client ID and Secret.

---

## Part 1: Deploy Backend to Render

1.  **Create a New Web Service:**
    *   Go to your Render Dashboard.
    *   Click **New +** -> **Web Service**.
    *   Connect your GitHub repository.

2.  **Configure Service:**
    *   **Name:** `email-agent-backend` (or similar)
    *   **Region:** Choose the one closest to you.
    *   **Branch:** `master` (or `main`)
    *   **Root Directory:** `backend` (Important!)
    *   **Runtime:** `Node`
    *   **Build Command:** `npm install`
    *   **Start Command:** `npm start`

3.  **Environment Variables:**
    *   Scroll down to the "Environment Variables" section and add the following:
        *   `MONGO_URI`: Your MongoDB Atlas connection string (e.g., `mongodb+srv://...`).
        *   `JWT_SECRET`: A long random string.
        *   `JWT_EXPIRES_IN`: `7d`
        *   `GROQ_API_KEY`: Your Groq API Key.
        *   `GROQ_MODEL`: `llama-3.1-8b-instant`
        *   `GOOGLE_CLIENT_ID`: Your Google Client ID.
        *   `GOOGLE_CLIENT_SECRET`: Your Google Client Secret.
        *   `GOOGLE_REDIRECT_URI`: `https://<YOUR-RENDER-APP-NAME>.onrender.com/api/gmail/callback` (You will update this in Google Cloud Console later).
        *   `FRONTEND_URL`: `https://<YOUR-VERCEL-APP-NAME>.vercel.app` (You will add this after deploying the frontend).

4.  **Deploy:**
    *   Click **Create Web Service**.
    *   Wait for the deployment to finish. You will get a URL like `https://email-agent-backend.onrender.com`.

---

## Part 2: Deploy Frontend to Vercel

1.  **Import Project:**
    *   Go to your Vercel Dashboard.
    *   Click **Add New...** -> **Project**.
    *   Import your GitHub repository.

2.  **Configure Project:**
    *   **Framework Preset:** `Vite`
    *   **Root Directory:** Click "Edit" and select `frontend`.

3.  **Environment Variables:**
    *   Expand the "Environment Variables" section.
    *   Add:
        *   `VITE_API_URL`: The URL of your deployed Render backend (e.g., `https://email-agent-backend.onrender.com/api`). **Note:** Make sure to include `/api` at the end if your backend routes expect it, but based on our setup, the base URL is usually enough. Check `src/api.js`: it appends `/api` if not present, but better to be explicit: `https://email-agent-backend.onrender.com/api`.

4.  **Deploy:**
    *   Click **Deploy**.
    *   Wait for the build to complete. You will get a URL like `https://email-agent-frontend.vercel.app`.

---

## Part 3: Final Configuration

1.  **Update Backend Environment Variable:**
    *   Go back to Render Dashboard -> Environment.
    *   Update `FRONTEND_URL` to your new Vercel URL (e.g., `https://email-agent-frontend.vercel.app`).
    *   Save changes (this will trigger a redeploy).

2.  **Update Google Cloud Console:**
    *   Go to [Google Cloud Console](https://console.cloud.google.com/).
    *   Navigate to **APIs & Services** -> **Credentials**.
    *   Edit your OAuth 2.0 Client ID.
    *   **Authorized JavaScript Origins:** Add your Vercel URL (e.g., `https://email-agent-frontend.vercel.app`).
    *   **Authorized Redirect URIs:** Add your Render Backend Callback URL (e.g., `https://email-agent-backend.onrender.com/api/gmail/callback`).
    *   Save.

3.  **Test:**
    *   Open your Vercel app.
    *   Try to log in/register.
    *   Try to connect Gmail.

---

## Troubleshooting

*   **CORS Errors:** Check if `FRONTEND_URL` in Render matches your Vercel URL exactly (no trailing slash).
*   **Google Auth Error:** Ensure the Redirect URI in Render (`GOOGLE_REDIRECT_URI`) matches exactly what is in Google Cloud Console.
*   **MongoDB Error:** Ensure "Network Access" in MongoDB Atlas allows access from anywhere (`0.0.0.0/0`) since Render IPs change.
