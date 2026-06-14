# Brandavox Production Deployment & Operations Guide

This guide details the step-by-step instructions for deploying and running the **Brandavox** AI-Powered Agency Operating System in a production environment with custom domain binding and database integration.

---

## 1. Environment Variables Configuration

Create a `.env` file in the root of the project with the following parameters:

```env
# -------------------------------------------------------------
# Supabase Configuration (Multi-Tenant Relational Layer)
# -------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# -------------------------------------------------------------
# MySQL Configuration (User & Organization Registry Backend)
# -------------------------------------------------------------
# If active, registrations and logins bypass Supabase auth and write directly to MySQL
MYSQL_HOST=localhost
MYSQL_USER=brandavox_admin
MYSQL_PASSWORD=secure_mysql_password
MYSQL_DATABASE=brandavox_db
MYSQL_PORT=3306

# -------------------------------------------------------------
# AI Core Brain Configuration (LLM Providers)
# -------------------------------------------------------------
# Primary LLM provider key
GEMINI_API_KEY=AIzaSyA...
# Fallback LLM provider key
OPENAI_API_KEY=sk-proj-...

# -------------------------------------------------------------
# Next.js Server Configuration
# -------------------------------------------------------------
PORT=3000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_token_for_cookie_signings
```

---

## 2. Database Schema Configuration

### Option A: Using PostgreSQL / Supabase
1. Link the local configurations to your hosted Supabase project:
   ```bash
   npx supabase link --project-ref your-supabase-project-id
   ```
2. Push the schema migrations (`supabase/migrations/`) directly to the active Postgres database:
   ```bash
   npx supabase db push
   ```
   *Pushes base CRM, campaign tables, RLS policies, and triggers.*

### Option B: Using MySQL Backend
1. Connect to your MySQL server instance.
2. Execute the schema script located at `supabase/mysql_schema.sql` to initialize `users`, `organizations`, and `feature_flags` tables:
   ```bash
   mysql -u brandavox_admin -p -h localhost brandavox_db < supabase/mysql_schema.sql
   ```
   *(Note: The MySQL connector helper at `src/lib/db/mysql.ts` will also automatically initialize these tables on server start if they are missing.)*

---

## 3. Production Build Compilation

Compile the project using the standard **Webpack** engine to ensure clean asset bundling:
```bash
# Purge previous cache
npm run build -- --webpack
```
*(Runs `next build --webpack` behind the scenes.)*

---

## 4. Deploying to a Custom Host

### Option A: Deploying on Vercel (Recommended)
1. Push your codebase to a private Git repository (GitHub, GitLab, Bitbucket).
2. Go to the [Vercel Dashboard](https://vercel.com) and click **Add New > Project**.
3. Import your repository.
4. Expand **Environment Variables** and enter the keys listed in Section 1.
5. In **Framework Preset**, ensure **Next.js** is selected. Under Build Command, set: `next build --webpack`.
6. Click **Deploy**.

### Option B: Self-Hosting on a VPS (Ubuntu, Debian, CentOS)
1. Clone your repository to your server.
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Compile the production bundle:
   ```bash
   next build --webpack
   ```
4. Run the production server using **PM2** process manager to ensure it remains active and automatically restarts:
   ```bash
   npm install -g pm2
   pm2 start npm --name "brandavox-app" -- run start
   ```

---

## 5. Setting Up a Custom Domain Name

### If Using Vercel:
1. Go to your project page on the Vercel Dashboard.
2. Navigate to **Settings > Domains**.
3. Enter your custom domain name (e.g., `app.brandavox.ai` or `brandavox.com`) and click **Add**.
4. Vercel will display the DNS records you need to configure in your Domain Registrar (e.g., Namecheap, GoDaddy, Cloudflare):
   - For a subdomain (e.g., `app.brandavox.ai`), add a **CNAME** record pointing to `cname.vercel-dns.com`.
   - For a root domain (e.g., `brandavox.com`), add an **A** record pointing to `76.76.21.21`.

### If Self-Hosting with Nginx (VPS):
1. Install Nginx and Certbot (for SSL certificates):
   ```bash
   sudo apt update
   sudo apt install nginx certbot python3-certbot-nginx
   ```
2. Create an Nginx server block at `/etc/nginx/sites-available/brandavox`:
   ```nginx
   server {
       listen 80;
       server_name app.brandavox.ai brandavox.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
3. Enable the configuration and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/brandavox /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```
4. Bind an SSL certificate using Let's Encrypt:
   ```bash
   sudo certbot --nginx -d app.brandavox.ai -d brandavox.com
   ```
5. Update your domain registrar with **A** records pointing to your VPS public IP address.
