# Lead Beast - Full Deployment Guide

This guide provides step-by-step instructions to deploy the Lead Beast platform to production.
The architecture consists of:
1. **Database & Auth:** Supabase
2. **Backend Engine:** FastAPI (Python) - Recommended Host: **Render** or **Railway**
3. **Frontend Dashboard:** Next.js - Recommended Host: **Vercel**

---

## 1. Supabase Initialization (Database & Auth)
Before deploying the code, ensure your production database is set up.

1. **Create a Supabase Project:**
   - Go to [Supabase](https://supabase.com/) and create a new project.
   - Save your **Project URL**, **anon key**, and **service_role key**.

2. **Run Migrations / SQL:**
   - Go to the **SQL Editor** in your Supabase dashboard.
   - Copy the contents of `add_bant_and_tech_fields.sql` (and any other schema files you have) and run them to create the required tables (`leads`, `users`, `organizations`, `sales_activity`, etc.).

3. **Configure Authentication:**
   - Go to **Authentication -> Providers** and enable **Google**.
   - Set up your Google OAuth credentials (Client ID and Secret) from the Google Cloud Console.
   - Set the Redirect URI in Google Cloud Console to `https://<YOUR_FRONTEND_DOMAIN>/auth/callback`.

---

## 2. Backend Deployment (FastAPI on Render)

We recommend using **Render.com** for deploying the Python FastAPI backend, as it supports Web Services directly from GitHub.

1. **Push Code to GitHub:**
   - Ensure your latest code is pushed to your GitHub repository (`https://github.com/Souvik6222/LeadBeast.git`).

2. **Create a New Web Service on Render:**
   - Sign in to [Render](https://render.com/).
   - Click **New** -> **Web Service**.
   - Connect your GitHub account and select the `LeadBeast` repository.

3. **Configure the Web Service:**
   - **Name:** `leadbeast-backend`
   - **Root Directory:** Keep empty (or specify `/` if needed).
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Add Environment Variables:**
   Scroll down to the **Environment Variables** section and add:
   - `ENVIRONMENT` = `production`
   - `SUPABASE_URL` = `<Your_Supabase_Project_URL>`
   - `SUPABASE_ANON_KEY` = `<Your_Supabase_Anon_Key>`
   - `SUPABASE_SERVICE_KEY` = `<Your_Supabase_Service_Role_Key>`
   *(Make sure to copy these exactly from your Supabase dashboard > Settings > API)*

5. **Deploy:**
   - Click **Create Web Service**. 
   - Wait for the build and deployment to finish. Once done, Render will give you a URL like `https://leadbeast-backend.onrender.com`. Keep this URL handy.

---

## 3. Frontend Deployment (Next.js on Vercel)

We recommend deploying the Next.js frontend on **Vercel** for the best performance and easiest integration.

1. **Create a New Project on Vercel:**
   - Sign in to [Vercel](https://vercel.com).
   - Click **Add New** -> **Project**.
   - Import the `LeadBeast` repository from your GitHub.

2. **Configure the Project:**
   - **Project Name:** `leadbeast`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click `Edit` and select `frontend` (since the frontend code is in the `./frontend` directory).

3. **Add Environment Variables:**
   Expand the **Environment Variables** dropdown and add the following:
   - `NEXT_PUBLIC_SUPABASE_URL` = `<Your_Supabase_Project_URL>`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `<Your_Supabase_Anon_Key>`
   - `NEXT_PUBLIC_API_URL` = `https://leadbeast-backend.onrender.com/v1` *(The Render URL from Step 2, ensuring you append `/v1`)*

4. **Deploy:**
   - Click **Deploy**. Vercel will build your Next.js application.
   - Once complete, you will get a live Vercel domain (e.g., `https://leadbeast.vercel.app`).

---

## 4. Final Connections

1. **Update Supabase Site URL:**
   - Go to your Supabase Project -> **Authentication** -> **URL Configuration**.
   - Change the **Site URL** to your new Vercel production domain (e.g., `https://leadbeast.vercel.app`).
   - Add `https://leadbeast.vercel.app/auth/callback` to the **Redirect URLs**.

2. **Update Backend CORS Configuration (Optional but recommended):**
   - In `main.py`, under the CORS middleware settings, ensure your `allow_origins` includes your new Vercel domain. (You can wildcard `"*"` for testing, but in production, it's safer to explicitly list `https://leadbeast.vercel.app`).
   - Commit and push to GitHub (Render will auto-deploy the update).

## Troubleshooting 🚨
- **Backend Build Failed on Render:** Double-check your `requirements.txt`. Make sure all dependencies (like `fastapi`, `uvicorn`, `supabase`, `pydantic`, `httpx`, `beautifulsoup4`) are listed.
- **Frontend Fails to call API:** Ensure `NEXT_PUBLIC_API_URL` uses `https://` instead of `http://` and points exactly to your Render app ending in `/v1`.
- **Auth Errors (Missing Profile):** If auth succeeds but the user cannot use the API, make sure your Supabase DB migrations were applied properly, so the application creates the required rows in `users` and `organizations`.
