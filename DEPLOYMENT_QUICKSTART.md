# 🚀 Quick Deployment Guide

## Immediate Action Required

Your SuperHero API migration is complete and pushed to GitHub. Vercel will automatically deploy, but you need to add the API token to make it work.

## Step 1: Add Environment Variable to Vercel

### Option A: Via Dashboard (Easiest)

1. **Go to:** https://vercel.com/dashboard
2. **Click on:** `marvel-quiz-project`
3. **Navigate to:** Settings (left sidebar) → Environment Variables
4. **Add New Variable:**
   - **Key:** `SUPERHERO_API_TOKEN`
   - **Value:** `c735e0f75afa4d20a27db8a4fc5c9dc5`
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development (select all three)
5. **Click:** Save

### Option B: Via CLI (Alternative)

```bash
# Navigate to project directory
cd "c:\Users\EHunt\Repos\StrayDogSyndicate\Marvel-Quiz"

# Add environment variable
vercel env add SUPERHERO_API_TOKEN
# When prompted, paste: c735e0f75afa4d20a27db8a4fc5c9dc5

# Select environments: Production, Preview, Development (all)
```

## Step 2: Redeploy (Automatic or Manual)

### Automatic (Recommended)
Vercel will automatically redeploy when you added the environment variable. Wait 1-2 minutes.

### Manual (If needed)
1. Go to: https://vercel.com/dashboard
2. Click your project: `marvel-quiz-project`
3. Go to: Deployments tab
4. Find the latest deployment
5. Click the "..." menu → Redeploy

## Step 3: Test Your Live Application

**Your Live URL:** https://marvel-quiz-project-6oa98e1gc-eric-hunter-petross-projects.vercel.app

### What to Test:
1. ✅ Page loads without errors
2. ✅ "Start Quiz" button works
3. ✅ Character images appear
4. ✅ Questions display properly
5. ✅ Quiz completes and shows score

### Expected Behavior:
- **Characters:** Spider-Man, Iron Man, Thor, Captain America, Hulk, etc.
- **Images:** High-quality character images from SuperHero API
- **Questions:** "Who is this character?" with multiple choice answers
- **Score:** Tracks correct/incorrect answers

## Troubleshooting

### If you see "SuperHero API token not configured" error:

1. Double-check the environment variable name is exactly: `SUPERHERO_API_TOKEN`
2. Verify the token value: `c735e0f75afa4d20a27db8a4fc5c9dc5`
3. Make sure you selected all three environments (Production, Preview, Development)
4. Redeploy after adding the variable

### If characters don't load:

1. Open browser console (F12)
2. Check for network errors
3. Verify the API endpoint: `/api/superhero-characters` returns data
4. Test directly: `https://your-app.vercel.app/api/superhero-characters?count=5`

### If images are broken:

- SuperHero API returns complete image URLs
- No additional configuration needed
- Check console for CORS errors (shouldn't happen with serverless function)

## Local Testing (Optional)

Want to test locally first?

```bash
# Navigate to project
cd "c:\Users\EHunt\Repos\StrayDogSyndicate\Marvel-Quiz"

# Your .env file already has the token configured

# Start local Vercel dev server
vercel dev

# Open in browser
# http://localhost:3000
```

## What Changed?

### Backend:
- **Old:** `/api/characters` (Marvel API - defunct)
- **New:** `/api/superhero-characters` (SuperHero API - active)

### Frontend:
- **Version:** 2.1.1 → 3.0.0
- **Endpoint:** Updated to use SuperHero API
- **Cache:** Version parameter updated in index.html

### Configuration:
- **Old Env Vars:** `MARVEL_PUBLIC_KEY`, `MARVEL_PRIVATE_KEY`
- **New Env Var:** `SUPERHERO_API_TOKEN`

## Success Indicators

✅ **Deployment Success:**
- Vercel dashboard shows green checkmark
- Build logs show no errors
- Environment variable appears in Settings

✅ **Application Works:**
- Quiz loads character data
- Images display correctly
- Questions work properly
- Score tracking functions

✅ **API Functional:**
- `/api/superhero-characters` endpoint returns JSON
- No CORS errors
- Character data properly formatted

## Next Steps After Deployment

1. **Test thoroughly** on the live site
2. **Update profile README** links (if needed)
3. **Share your working demo** on your portfolio
4. **Optional:** Customize the character list in `api/superhero-characters.js`

## Character Customization (Optional)

To add/remove characters from the quiz:

1. **Edit:** `api/superhero-characters.js`
2. **Find:** `MARVEL_CHARACTER_IDS` array
3. **Search for character IDs:** https://superheroapi.com/
4. **Add/remove IDs** from the array
5. **Commit and push** to auto-deploy

## Support Resources

- **SuperHero API Docs:** https://superheroapi.com/
- **Migration Guide:** See `SUPERHERO_API_MIGRATION.md`
- **Vercel Docs:** https://vercel.com/docs/environment-variables
- **GitHub Issues:** https://github.com/StrayDogSyn/Marvel-Quiz/issues

---

**Migration Date:** November 2, 2025  
**Status:** ✅ Ready to deploy  
**Time Estimate:** 5 minutes to add env var and test
