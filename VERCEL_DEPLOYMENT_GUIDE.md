# Vercel Deployment Guide - Biosense Signal Web App

## ✅ Configuration Completed

Your project is now properly configured for Vercel deployment with the Biosense Signal SDK.

## 🔧 What Was Fixed

### 1. **`vercel.json` - Critical Headers Added**

- Added `Cross-Origin-Opener-Policy: same-origin`
- Added `Cross-Origin-Embedder-Policy: require-corp`
- Added `Cross-Origin-Resource-Policy: cross-origin`
- Added WebAssembly MIME type configuration

**Why this matters:** The Biosense Signal SDK uses WebAssembly with SharedArrayBuffer, which requires these security headers to function properly in production. Without them, the SDK will fail to initialize.

### 2. **`package.json` - Build Script Added**

- Added `vercel-build` script that Vercel will automatically detect and run

### 3. **`.gitignore` - Build Directory Excluded**

- Added `dist/` to gitignore (standard practice)
- Added note about keeping the SDK `.tgz` file committed

## 📋 Pre-Deployment Checklist

### ✅ Must Be Committed to Git:

- [ ] `biosensesignal-web-sdk-v5.11.1-1.tgz` (required for build)
- [ ] All configuration files (`vercel.json`, `package.json`, `webpack.config.js`)
- [ ] All source files in `src/`

### ❌ Should NOT Be Committed:

- [ ] `node_modules/` (already in .gitignore)
- [ ] `dist/` (now added to .gitignore)

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect the configuration
5. Click "Deploy"

### Option 3: Deploy via Git Integration

1. Connect your repository to Vercel
2. Push your changes to your main branch
3. Vercel will automatically deploy

## 🧪 Testing After Deployment

After deployment, verify these critical features:

### 1. **Check Security Headers**

Open browser DevTools → Network tab → Check response headers for your deployed URL:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### 2. **Test Camera Access**

- Grant camera permissions
- Verify video feed appears

### 3. **Test SDK Initialization**

- Check browser console for: `Initialized monitor`
- Verify no WebAssembly errors

### 4. **Test Measurement**

- Start a measurement session
- Verify vital signs are calculated

## ⚠️ Common Issues & Solutions

### Issue 1: SDK Fails to Initialize

**Error:** `Failed to compile WebAssembly module`

**Solutions:**

- Verify security headers are present (use browser DevTools)
- Check that `.wasm` files are in the deployed `dist` folder
- Ensure `biosensesignal-web-sdk-v5.11.1-1.tgz` was committed to git

### Issue 2: Camera Access Denied

**Error:** Camera permissions not working

**Solutions:**

- Vercel deployments must use HTTPS (automatic)
- Some browsers require user interaction before camera access
- Check browser camera permissions

### Issue 3: Build Fails on Vercel

**Error:** `Cannot find module '@biosensesignal/web-sdk'`

**Solutions:**

- Ensure `biosensesignal-web-sdk-v5.11.1-1.tgz` is committed to git
- Run `npm install` locally to verify the package installs correctly
- Check Vercel build logs for specific error messages

### Issue 4: Page Shows 404 After Refresh

**Error:** Direct URL navigation returns 404

**Solution:**

- This should be fixed by the `routes` configuration in `vercel.json`
- Verify the routes section exists and is correct

## 🔍 Vercel Build Settings

If you need to manually configure build settings in Vercel dashboard:

| Setting          | Value                                     |
| ---------------- | ----------------------------------------- |
| Framework Preset | Other                                     |
| Build Command    | `npm run build` or `npm run vercel-build` |
| Output Directory | `dist`                                    |
| Install Command  | `npm install`                             |
| Node Version     | 14.x or higher                            |

## 📊 Environment Variables

If your SDK requires a license key at build time, add it in Vercel:

1. Go to Project Settings → Environment Variables
2. Add: `BIOSENSE_LICENSE_KEY` = `your-license-key`
3. Redeploy

## 🔐 Security Considerations

### HTTPS Required

- Camera access requires HTTPS (Vercel provides this automatically)
- WebAssembly SharedArrayBuffer requires HTTPS

### CORS Headers

- All assets must be served with proper CORS headers
- The `Cross-Origin-Resource-Policy: cross-origin` header allows cross-origin resources

## 📝 Maintenance

### Updating the SDK

When you need to update the Biosense Signal SDK:

1. Replace `biosensesignal-web-sdk-v5.11.1-1.tgz` with the new version
2. Update the version in `package.json`:
   ```json
   "@biosensesignal/web-sdk": "file:./biosensesignal-web-sdk-vX.X.X.tgz"
   ```
3. Run `npm install` locally to test
4. Commit the new `.tgz` file
5. Deploy to Vercel

### Monitoring Deployment

- Check Vercel deployment logs for any warnings
- Monitor browser console for runtime errors
- Test on multiple browsers (Chrome, Safari, Firefox, Edge)

## 🎯 Performance Optimization

Consider these optimizations for production:

1. **Code Splitting**: Already configured in webpack
2. **Asset Compression**: Vercel handles this automatically
3. **CDN**: Vercel's Edge Network provides global CDN
4. **Caching**: Static assets are automatically cached

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify all files are committed to git
4. Test the build locally: `npm run build`
5. Contact Biosense Signal support for SDK-specific issues

## ✨ Summary

Your configuration now includes:

- ✅ Proper security headers for WebAssembly
- ✅ Correct build commands
- ✅ SPA routing configuration
- ✅ WebAssembly MIME type support
- ✅ Asset copying from SDK

You're ready to deploy! 🚀
