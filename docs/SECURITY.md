# Security Policy

## Reporting a Vulnerability

We take the security of Marvel Quiz seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

1. **DO NOT** open a public GitHub issue
2. Email the maintainers directly with details
3. Include steps to reproduce the vulnerability
4. Provide your assessment of severity and impact

### What to Include

- Type of vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 1 week
- **Fix Development**: Depends on severity
- **Public Disclosure**: After fix is deployed

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | ✅ Yes            |
| 1.x.x   | ❌ No (deprecated)|

## Known Security Considerations

### API Keys

**Current State**: API keys are included in client-side JavaScript for demo purposes.

**Security Implications**:
- Keys are publicly visible in browser DevTools
- Rate limiting applies to these keys (3000 calls/day)
- No sensitive data exposure (Marvel API is read-only for public keys)

**Recommendations for Production**:
1. Move API calls to a backend proxy server
2. Store keys in environment variables
3. Implement rate limiting on your backend
4. Use server-side caching to reduce API calls

**Example Backend Proxy** (Node.js/Express):

```javascript
// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();

app.get('/api/characters', async (req, res) => {
  const ts = Date.now().toString();
  const hash = crypto
    .createHash('md5')
    .update(ts + process.env.MARVEL_PRIVATE_KEY + process.env.MARVEL_PUBLIC_KEY)
    .digest('hex');

  try {
    const response = await axios.get(
      `https://gateway.marvel.com/v1/public/characters`,
      {
        params: {
          ts,
          apikey: process.env.MARVEL_PUBLIC_KEY,
          hash,
          limit: req.query.limit || 50
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Content Security Policy

Consider implementing CSP headers for production:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
  style-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com 'unsafe-inline';
  img-src 'self' https://i.annihil.us data:;
  connect-src 'self' https://gateway.marvel.com;
  font-src 'self' https://cdnjs.cloudflare.com;
">
```

### HTTPS

Always deploy with HTTPS to ensure:
- Encrypted data transmission
- Protection against man-in-the-middle attacks
- Trust and credibility

### Input Validation

While this application doesn't have user input forms, future features should:
- Validate all user input
- Sanitize data before displaying
- Use parameterized queries if adding a database
- Implement CSRF protection for forms

### Dependencies

Keep dependencies up to date:

```bash
# Check for vulnerabilities in npm packages (if using)
npm audit

# Update to latest secure versions
npm update
```

Current external dependencies:
- Bootstrap 5.3.2 (CDN)
- Font Awesome 6.5.1 (CDN)
- CryptoJS 4.2.0 (CDN)

## Best Practices

### For Contributors

1. **Never commit secrets**: No API keys, passwords, or tokens
2. **Use environment variables**: For any sensitive configuration
3. **Validate external data**: Don't trust API responses blindly
4. **Keep dependencies updated**: Regular security updates
5. **Follow OWASP guidelines**: For web application security

### For Users

1. **Use HTTPS**: When deploying the application
2. **Keep browsers updated**: For latest security patches
3. **Review code**: Before deploying to production
4. **Monitor API usage**: Watch for unusual patterns
5. **Implement rate limiting**: On your backend if deploying publicly

## Security Features

### Current Implementation

✅ HTTPS-ready code  
✅ No server-side vulnerabilities (static site)  
✅ No user authentication (no password storage risks)  
✅ Read-only API access  
✅ No database (no SQL injection risks)  
✅ No file uploads (no malware risks)  
✅ Client-side only (reduced attack surface)  

### Future Enhancements

Consider for production deployments:
- Backend API proxy for key security
- Rate limiting and caching
- Content Security Policy headers
- Subresource Integrity (SRI) for CDN resources
- Regular security audits

## Compliance

This project aims to comply with:
- WCAG 2.1 (Accessibility)
- GDPR (No personal data collection)
- Marvel API Terms of Service

## Contact

For security concerns, please contact the repository maintainers.

**Remember**: Security is a shared responsibility. Stay vigilant! 🔒
