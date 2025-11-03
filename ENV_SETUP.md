# Environment Configuration

⚠️ **IMPORTANT NOTICE:** As of October 29, 2025, the Marvel Developer Portal has been permanently shut down. This documentation is preserved for historical reference only. **Marvel API keys can no longer be obtained or used.** See [MARVEL_API_SHUTDOWN.md](MARVEL_API_SHUTDOWN.md) for details.

---

## Historical Setup Instructions (No Longer Applicable)

### 1. Local Development

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Get your Marvel API keys:** ❌ **NO LONGER POSSIBLE**
   - ~~Visit [Marvel Developer Portal](https://developer.marvel.com/)~~ **SHUT DOWN**
   - ~~Sign up or log in~~ **UNAVAILABLE**
   - ~~Go to "My Developer Account"~~ **SERVICE DISCONTINUED**
   - ~~Copy your **Public Key** and **Private Key**~~ **KEYS INVALID**

3. **Update `.env` file:**
   ```env
   MARVEL_PUBLIC_KEY=your_actual_public_key_here
   MARVEL_PRIVATE_KEY=your_actual_private_key_here
   ```

4. **Test locally:**
   ```bash
   npm start
   # or
   vercel dev
   ```

### 2. Vercel Deployment

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project → **Settings** → **Environment Variables**
3. Add two variables:
   - **Name:** `MARVEL_PUBLIC_KEY`
     **Value:** Your public key
   - **Name:** `MARVEL_PRIVATE_KEY`
     **Value:** Your private key
4. Select environment: **Production**, **Preview**, and **Development**
5. Click **Save**
6. Redeploy your project

#### Option B: Via Vercel CLI

```bash
# Set environment variables
vercel env add MARVEL_PUBLIC_KEY
# Enter your public key when prompted

vercel env add MARVEL_PRIVATE_KEY
# Enter your private key when prompted

# Deploy with environment variables
vercel --prod
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MARVEL_PUBLIC_KEY` | ✅ Yes | Your Marvel API public key | `abc123...` |
| `MARVEL_PRIVATE_KEY` | ✅ Yes | Your Marvel API private key | `def456...` |

## Security Notes

### ✅ DO:
- Keep your `.env` file in `.gitignore` (already configured)
- Use different keys for development and production if available
- Rotate your API keys periodically
- Never commit `.env` to version control

### ❌ DON'T:
- Share your `.env` file
- Commit API keys to Git
- Expose private keys in client-side code
- Hard-code sensitive values

## Troubleshooting

### "Marvel API keys not configured" Error

**Problem:** The serverless function can't find the API keys.

**Solution:**
1. Make sure environment variables are set in Vercel Dashboard
2. Redeploy after adding environment variables
3. Check variable names are exactly: `MARVEL_PUBLIC_KEY` and `MARVEL_PRIVATE_KEY`

### "Internal server error" from Marvel API

**Problem:** Marvel API is rejecting requests.

**Solution:**
1. Verify your API keys are correct
2. Check if keys are expired (get new ones from Marvel Developer Portal)
3. Ensure you haven't exceeded the rate limit (3000 calls/day)
4. Test keys directly at [Marvel API Interactive Documentation](https://developer.marvel.com/docs)

### Local development not working

**Problem:** API calls fail when running locally.

**Solution:**
1. Make sure `.env` file exists in project root
2. Check `.env` file has the correct format (no quotes needed)
3. Restart your development server after changing `.env`
4. If using `vercel dev`, it should automatically load `.env`

## File Structure

```
Marvel-Quiz/
├── .env                    # Your actual keys (ignored by Git)
├── .env.example           # Template for environment variables
├── .gitignore             # Ensures .env is not committed
├── api/
│   └── characters.js      # Serverless function using env vars
└── README.md              # Main project documentation
```

## Getting Help

- **Marvel API Issues:** ~~[Marvel Developer Portal](https://developer.marvel.com/)~~ **SHUT DOWN - See [MARVEL_API_SHUTDOWN.md](MARVEL_API_SHUTDOWN.md) for alternatives**
- **Vercel Environment Variables:** [Vercel Docs](https://vercel.com/docs/environment-variables)
- **Project Issues:** [GitHub Issues](https://github.com/StrayDogSyn/Marvel-Quiz/issues)
