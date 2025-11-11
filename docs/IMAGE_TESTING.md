# Image Loading - Testing Guide

## Quick Test Checklist

### ✅ Basic Functionality
1. [ ] Start a new quiz
2. [ ] Verify images load for quiz questions
3. [ ] Complete all questions in a quiz
4. [ ] Restart quiz and verify images reload
5. [ ] Test all three difficulty levels (Easy, Medium, Hard)

### ✅ Loading States
1. [ ] Verify loading spinner appears briefly
2. [ ] Verify smooth fade-in animation when image loads
3. [ ] Check that loading text is visible
4. [ ] Confirm loading state disappears after image loads

### ✅ Fallback Behavior
**To test fallbacks, you can:**

#### Option 1: Browser DevTools
1. Open DevTools (F12)
2. Go to Network tab
3. Find an image request
4. Right-click → "Block request URL"
5. Start a new quiz
6. Verify fallback image or placeholder appears

#### Option 2: Offline Mode
1. Start quiz normally
2. Enable offline mode in browser
3. Reload page
4. Verify fallback JSON data is used
5. Check that CDN images still load (cached)

#### Option 3: Slow Network
1. Open DevTools (F12)
2. Network tab → Throttling dropdown
3. Select "Slow 3G" or "Fast 3G"
4. Start quiz
5. Verify timeout handling works
6. Confirm fallbacks activate within 3 seconds

### ✅ Error Handling
1. [ ] Block primary image domain
2. [ ] Verify fallback activates automatically
3. [ ] Check browser console for warnings (not errors)
4. [ ] Confirm quiz remains functional
5. [ ] Verify placeholder appears as last resort

### ✅ Visual Quality
1. [ ] Images are clear and not pixelated
2. [ ] Images fit properly in container
3. [ ] Border radius and shadows applied correctly
4. [ ] Placeholder has Marvel branding
5. [ ] Character names visible in placeholder

### ✅ Performance
1. [ ] Images load within 3 seconds
2. [ ] No indefinite loading states
3. [ ] Quiz doesn't freeze during image load
4. [ ] Smooth transitions between questions
5. [ ] No memory leaks (check in long sessions)

### ✅ Responsive Design
1. [ ] Test on desktop (1920x1080)
2. [ ] Test on tablet (768x1024)
3. [ ] Test on mobile (375x667)
4. [ ] Verify images scale properly
5. [ ] Check touch interactions work

### ✅ Browser Compatibility

#### Chrome/Edge
1. [ ] Images load correctly
2. [ ] Fallbacks work
3. [ ] Animations smooth
4. [ ] Console shows no errors

#### Firefox
1. [ ] Images load correctly
2. [ ] Fallbacks work
3. [ ] Animations smooth
4. [ ] Console shows no errors

#### Safari
1. [ ] Images load correctly
2. [ ] Fallbacks work
3. [ ] Animations smooth
4. [ ] Console shows no errors

### ✅ API Integration

#### SuperHero API Online
1. [ ] Start quiz
2. [ ] Check Network tab for API call
3. [ ] Verify response includes image URLs
4. [ ] Confirm images from API display correctly

#### SuperHero API Offline (Fallback)
1. [ ] Block SuperHero API domain
2. [ ] Start quiz
3. [ ] Verify fallback JSON loads
4. [ ] Check notification shows "Using offline character data"
5. [ ] Confirm CDN images load from jsDelivr

## Expected Results

### ✅ Normal Operation
- **Loading Time:** 0.5-2 seconds per image
- **Fallback Attempts:** 0-2 (most succeed on first try)
- **Console Warnings:** 0 (unless testing failures)
- **User Experience:** Smooth and professional

### ✅ Fallback Scenario
- **Loading Time:** 3-6 seconds (with retries)
- **Fallback Attempts:** 1-3 before placeholder
- **Console Warnings:** 1-3 (expected for failed URLs)
- **User Experience:** Still smooth, placeholder acceptable

### ✅ Offline Mode
- **Loading Time:** Instant (cached)
- **Fallback Attempts:** 0 (uses local data)
- **Console Warnings:** 1 (API unavailable notice)
- **User Experience:** Fully functional

## Debugging Tips

### Images Not Loading?

1. **Check Console**
   ```
   Look for: "Failed to load image: [URL]"
   Expected: 0-2 warnings before success
   ```

2. **Check Network Tab**
   ```
   Filter by: Img
   Status codes: 200 (success), 404 (not found), CORS error
   ```

3. **Verify API Response**
   ```javascript
   // In console:
   fetch('/api/superhero-characters?count=5')
     .then(r => r.json())
     .then(d => console.log(d.data.results[0].thumbnail))
   ```

### Placeholder Always Showing?

1. **Check primary URL format**
   - Should be full HTTPS URL
   - Not empty or null

2. **Check CDN availability**
   ```
   Try in browser:
   https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/sm/620-spider-man.jpg
   ```

3. **Check timeout settings**
   ```javascript
   // In script.js, look for:
   setTimeout(() => { ... }, 3000)
   // Increase to 5000 for slower connections
   ```

### Slow Loading?

1. **Check network throttling**
   - Disable throttling in DevTools

2. **Check CDN status**
   - Visit: https://status.jsdelivr.com/

3. **Clear browser cache**
   - Hard reload: Ctrl+Shift+R (Windows/Linux)
   - Hard reload: Cmd+Shift+R (Mac)

## Performance Benchmarks

### Target Metrics
| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Image Load Time | < 1s | < 3s | > 3s |
| Fallback Activation | < 3s | < 5s | > 5s |
| Total Question Display | < 2s | < 4s | > 4s |
| Memory Usage | < 50MB | < 100MB | > 100MB |

### Measure Performance
```javascript
// In browser console:
performance.mark('image-start');
// ... wait for image to load ...
performance.mark('image-end');
performance.measure('image-load', 'image-start', 'image-end');
console.table(performance.getEntriesByType('measure'));
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Images never load | API token missing | Check SUPERHERO_API_TOKEN env var |
| Placeholder always shows | All URLs failing | Check CDN availability |
| Slow loading | Network throttling | Disable throttling |
| CORS errors | Wikipedia URLs | Already fixed with CDN URLs |
| Timeout too short | Slow connection | Increase timeout in code |

## Success Criteria

### ✅ Must Have
- [x] Images load within 3 seconds
- [x] Fallbacks activate automatically
- [x] Placeholder always displays if all fail
- [x] No blocking errors
- [x] Quiz remains functional

### ✅ Should Have
- [x] Smooth animations
- [x] Professional appearance
- [x] Clear loading states
- [x] Responsive design
- [x] Cross-browser support

### ✅ Nice to Have
- [x] Performance optimizations
- [x] Detailed error logging
- [x] Comprehensive documentation
- [x] Testing guide (this document)

## Reporting Issues

If you find issues, please report with:

1. **Browser & Version:** e.g., Chrome 119
2. **Error Message:** From console
3. **Network Conditions:** Online/Offline/Throttled
4. **Steps to Reproduce:** Detailed steps
5. **Screenshots:** If visual issue
6. **Expected vs Actual:** What should happen vs what did happen

## Next Steps

After testing:
1. ✅ Document any issues found
2. ✅ Verify fixes work as expected
3. ✅ Update CHANGELOG.md with changes
4. ✅ Consider additional enhancements
5. ✅ Deploy to production
