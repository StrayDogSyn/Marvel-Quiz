# 🚀 Deployment Guide - Marvel Quiz

This guide provides step-by-step instructions for deploying the Marvel Quiz application to various platforms.

## Table of Contents

- [Deploy to Vercel (Recommended)](#deploy-to-vercel-recommended)
- [Deploy to Netlify](#deploy-to-netlify)
- [Deploy to GitHub Pages](#deploy-to-github-pages)
- [Deploy to Custom Server](#deploy-to-custom-server)

---

## Deploy to Vercel (Recommended)

Vercel provides the best experience for deploying this application with zero configuration needed.

### Prerequisites

- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (free tier available)

### Steps

1. **Fork the Repository**
   - Visit [github.com/StrayDogSyn/Marvel-Quiz](https://github.com/StrayDogSyn/Marvel-Quiz)
   - Click "Fork" in the top right corner
   - Wait for the fork to complete

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" or "Log In" (you can use your GitHub account)
   - Once logged in, click "New Project"

3. **Import Your Repository**
   - Click "Import Git Repository"
   - Find your forked `Marvel-Quiz` repository
   - Click "Import"

4. **Configure Project (Optional)**
   - **Project Name:** Choose a unique name (e.g., `marvel-quiz-yourname`)
   - **Framework Preset:** None (it's a static site)
   - **Root Directory:** `.` (leave as default)
   - **Build Command:** Leave empty
   - **Output Directory:** `.` (leave as default)
   - **Environment Variables:** None needed (Marvel API keys are public-facing)

5. **Deploy**
   - Click "Deploy"
   - Wait 30-60 seconds for deployment to complete
   - Your site will be live at `https://your-project-name.vercel.app`

6. **Custom Domain (Optional)**
   - In your Vercel dashboard, go to Settings → Domains
   - Add your custom domain
   - Follow Vercel's instructions to configure DNS

### Automatic Deployments

Once connected, Vercel automatically:
- ✅ Deploys every push to your main branch
- ✅ Creates preview deployments for pull requests
- ✅ Provides deployment notifications
- ✅ Rolls back if needed

### Vercel CLI Deployment (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project directory
cd Marvel-Quiz

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## Deploy to Netlify

### Via Netlify Dashboard

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login
   - Click "New site from Git"

2. **Configure Build**
   - Select your Git provider (GitHub)
   - Choose `Marvel-Quiz` repository
   - **Build command:** Leave empty
   - **Publish directory:** `.`

3. **Deploy**
   - Click "Deploy site"
   - Wait for deployment
   - Access your site at `https://random-name.netlify.app`

### Via Drag & Drop

1. Build locally (optional, since it's a static site):
   ```bash
   # Nothing to build, just ensure all files are present
   ```

2. Drag the entire project folder to [app.netlify.com/drop](https://app.netlify.com/drop)

### Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to project
cd Marvel-Quiz

# Login
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

---

## Deploy to GitHub Pages

### Using GitHub Actions (Automated)

1. **Ensure GitHub Actions Workflow Exists**
   - Check `.github/workflows/deploy.yml` exists in your repository
   - This workflow is already configured for automatic deployment

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Under "Source", select "Deploy from a branch"
   - Choose `gh-pages` branch
   - Click "Save"

3. **Deploy**
   - Push any changes to `main` branch
   - GitHub Actions will automatically deploy
   - Site will be live at `https://yourusername.github.io/Marvel-Quiz`

### Manual Deployment

```bash
# Install gh-pages package
npm install -g gh-pages

# Deploy to GitHub Pages
gh-pages -d .
```

---

## Deploy to Custom Server

### Requirements

- Web server (Apache, Nginx, or any static file server)
- SSH access to server
- Domain name (optional)

### Using Apache

1. **Upload Files**
   ```bash
   # Using SCP
   scp -r Marvel-Quiz/* user@your-server.com:/var/www/html/marvel-quiz/
   
   # Or using SFTP/FTP client like FileZilla
   ```

2. **Configure Apache (if needed)**
   ```apache
   <VirtualHost *:80>
       ServerName marvel-quiz.yourdomain.com
       DocumentRoot /var/www/html/marvel-quiz
       
       <Directory /var/www/html/marvel-quiz>
           Options Indexes FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
       
       # Enable HTTPS redirect
       RewriteEngine On
       RewriteCond %{HTTPS} off
       RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   </VirtualHost>
   ```

3. **Enable HTTPS with Let's Encrypt**
   ```bash
   sudo certbot --apache -d marvel-quiz.yourdomain.com
   ```

### Using Nginx

1. **Upload Files**
   ```bash
   scp -r Marvel-Quiz/* user@your-server.com:/var/www/marvel-quiz/
   ```

2. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name marvel-quiz.yourdomain.com;
       root /var/www/marvel-quiz;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Security headers
       add_header X-Frame-Options "DENY";
       add_header X-Content-Type-Options "nosniff";
       add_header X-XSS-Protection "1; mode=block";
   }
   ```

3. **Enable HTTPS**
   ```bash
   sudo certbot --nginx -d marvel-quiz.yourdomain.com
   ```

### Using Docker

1. **Create Dockerfile**
   ```dockerfile
   FROM nginx:alpine
   COPY . /usr/share/nginx/html
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and Run**
   ```bash
   docker build -t marvel-quiz .
   docker run -d -p 80:80 marvel-quiz
   ```

---

## Post-Deployment Checklist

After deploying, verify:

- ✅ Site loads correctly at deployment URL
- ✅ Quiz starts without errors
- ✅ Marvel API requests work (check browser console)
- ✅ All images load properly
- ✅ Quiz functions through completion
- ✅ Results screen displays correctly
- ✅ Mobile responsiveness works
- ✅ HTTPS is enabled (for production)

---

## Troubleshooting

### Marvel API Not Working

**Problem:** Quiz shows "Something went wrong" error

**Solutions:**
- Check browser console for CORS errors
- Verify Marvel API keys are correct in `script.js`
- Ensure you're not hitting rate limits (3000 requests/day for free tier)
- Test API directly: `https://gateway.marvel.com/v1/public/characters?apikey=YOUR_KEY`

### 404 Errors on Refresh

**Problem:** Page refresh shows 404 error (mainly on SPAs, shouldn't happen here)

**Solution:**
- For Vercel/Netlify: Should work automatically with provided config
- For custom servers: Configure server to always serve `index.html`

### Images Not Loading

**Problem:** Character images don't display

**Solutions:**
- Check if Marvel API is returning valid image URLs
- Verify HTTPS is enabled (mixed content issues)
- Check browser console for blocked requests

### Deployment Failed

**Problem:** Vercel/Netlify deployment fails

**Solutions:**
- Check deployment logs for specific errors
- Ensure `vercel.json` or `netlify.toml` exists
- Verify all files are committed to Git
- Check repository permissions

---

## Performance Optimization

After deployment, consider these optimizations:

1. **Enable Caching**
   - Static assets cached automatically on Vercel/Netlify
   - For custom servers, configure cache headers

2. **Add CDN**
   - Vercel/Netlify include CDN by default
   - For custom servers, consider Cloudflare

3. **Monitor Performance**
   - Use Lighthouse in Chrome DevTools
   - Check Core Web Vitals
   - Monitor API response times

4. **Analytics (Optional)**
   - Add Google Analytics
   - Use Vercel Analytics
   - Implement custom tracking

---

## Support

Having deployment issues?

- 📧 **Open an Issue:** [github.com/StrayDogSyn/Marvel-Quiz/issues](https://github.com/StrayDogSyn/Marvel-Quiz/issues)
- 📖 **Read the Docs:** [Marvel API Documentation](https://developer.marvel.com/docs)
- 💬 **Community Help:** Check GitHub Discussions

---

## License

This project is open source under the MIT License. Marvel characters and data are © Marvel Entertainment LLC.
