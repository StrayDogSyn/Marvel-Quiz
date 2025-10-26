# 🚀 Quick Start Guide

Get your Marvel Quiz up and running in 3 minutes!

## Option 1: View Locally (Simplest)

1. **Open the file**
   ```
   Double-click index.html
   ```
   That's it! The quiz will open in your default browser.

## Option 2: Use a Local Server (Recommended)

### Using Python (if installed)
```bash
# Navigate to project directory
cd Marvel-Quiz

# Python 3
python -m http.server 8000

# Open browser to http://localhost:8000
```

### Using Node.js (if installed)
```bash
# Install http-server globally (one time only)
npm install -g http-server

# Start server
http-server -p 8000

# Open browser to http://localhost:8000
```

### Using VS Code
1. Install "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Option 3: Deploy to GitHub Pages

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to Pages section
   - Select "Deploy from a branch"
   - Choose "main" branch
   - Click Save

3. **Access your site**
   - Your quiz will be live at: `https://yourusername.github.io/Marvel-Quiz`
   - The GitHub Action will auto-deploy on future commits

## 🧪 Testing

Before deploying, run the test suite:

1. Open `test.html` in your browser
2. All tests should pass (green)
3. API connection test verifies Marvel API access

## 🔧 Configuration (Optional)

To use your own Marvel API keys:

1. Get free API keys at [developer.marvel.com](https://developer.marvel.com)
2. Open `script.js`
3. Find the CONFIG object (line 13)
4. Replace with your keys:
   ```javascript
   MARVEL_PUBLIC_KEY: 'your_key_here',
   MARVEL_PRIVATE_KEY: 'your_private_key_here',
   ```

## 📱 Test Checklist

Before sharing:
- [ ] Open `index.html` - Welcome screen appears
- [ ] Click "Start Quiz" - Loading screen shows
- [ ] Questions load with images
- [ ] Answer selection works
- [ ] Score updates correctly
- [ ] Results screen displays at end
- [ ] Test on mobile device
- [ ] Test in different browser

## 🐛 Troubleshooting

### Quiz won't load
- **Check internet connection** (needed for Marvel API)
- **Check browser console** (F12) for errors
- **Try different browser**

### API errors
- **Rate limit exceeded**: Marvel API allows 3000 calls/day
- **Network blocked**: Check firewall/antivirus
- **Invalid keys**: Verify your API keys are correct

### Styling issues
- **Clear browser cache**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- **Check CSS loaded**: View source, verify style.css link

## 📚 Next Steps

- Read [README.md](README.md) for full documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Review [SECURITY.md](SECURITY.md) for best practices

## 🎉 You're Ready!

Enjoy testing your Marvel knowledge!

**Questions?** Open an issue on GitHub or check the full README.

---
Made with ❤️ by Stray Dog Syndicate
