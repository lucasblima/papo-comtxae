# Frontend Troubleshooting Guide

This guide helps troubleshoot common issues encountered when working with the frontend codebase.

## Build Issues

### Missing tailwindcss-animate Module

**Error:**
```
Cannot find module 'tailwindcss-animate'
Require stack:
- C:\Users\...\tailwind.config.js
```

**Solutions:**

**Option 1: Use the Tailwind Configuration Fix Script (Recommended)**

We've created a script that automatically fixes Tailwind configuration issues:

```bash
# From the project root:
node scripts/core/fix-tailwind-config.js
```

This script will:
- Detect and fix conflicts between multiple Tailwind configuration files
- Add the missing tailwindcss-animate plugin
- Create backups of your configuration files
- Fix common content path issues

**Option 2: Use the Dependency Installation Script**

```bash
# From the project root:
node scripts/core/install-dependencies.js
```

**Option 3: Manual Resolution**

1. Install the missing package:
   ```bash
   cd src/frontend
   npm install tailwindcss-animate --save
   ```

2. Verify the package is added to your `package.json`

3. If you still experience issues, check for conflicting Tailwind configuration files:
   - Look for both `tailwind.config.js` and `tailwind.config.ts` in the frontend directory
   - If both exist, you may need to use just one (preferably the .js version)

## Module Resolution Issues

### Import Path Errors

**Error:**
```
Error: Cannot find module '@/components/...' or its corresponding type declarations.
```

**Solution:**
1. Update import paths to use relative paths instead of alias paths:
   - Change `import { Component } from '@/components/Component'`
   - To `import { Component } from '../components/Component'`

2. Clear the Next.js cache:
   ```bash
   cd src/frontend
   rm -rf .next
   ```

### Next.js Cache Issues

If you're experiencing unusual behavior after configuration changes:

```bash
cd src/frontend
rm -rf .next
npm run dev
```

## Configuration Issues 

### Multiple Tailwind Config Files

Having both `tailwind.config.js` and `tailwind.config.ts` can cause conflicts.

**Solution:**
Use our automatic fix script:
```bash
node scripts/core/fix-tailwind-config.js
```

Or manually:
1. Keep only one configuration file (preferably the .js version)
2. Rename or remove the other file
3. Make sure your plugins and content paths are correctly configured

### PostCSS Configuration Issues

**Error:**
```
Error: Tailwind CSS requires PostCSS 8+
```

**Solution:**
1. Check your PostCSS configuration in `postcss.config.js`
2. Make sure it's compatible with your Tailwind version
3. If needed, install the compatibility build:
   ```bash
   npm uninstall tailwindcss postcss autoprefixer
   npm install tailwindcss@latest postcss@latest autoprefixer@latest
   ```

## Style and CSS Issues

### Tailwind Classes Not Working

**Possible causes:**
1. Incorrect content paths in tailwind.config.js
2. PostCSS configuration issues
3. Tailwind CSS not imported properly

**Solution:**
1. Check your Tailwind configuration's content paths:
   ```js
   content: [
     './pages/**/*.{js,ts,jsx,tsx,mdx}',
     './components/**/*.{js,ts,jsx,tsx,mdx}',
     './app/**/*.{js,ts,jsx,tsx,mdx}',
     './src/**/*.{js,ts,jsx,tsx,mdx}',
   ],
   ```

2. Make sure Tailwind is imported in your global CSS file:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. Rebuild your CSS:
   ```bash
   cd src/frontend
   npm run dev
   ```

4. If all else fails, try our configuration fix script:
   ```bash
   node scripts/core/fix-tailwind-config.js
   ```

## Environment Variables

### Missing Environment Variables

**Error:**
```
Error: Missing environment variable: NEXT_PUBLIC_API_URL
```

**Solution:**
1. Check that your `.env.local` file exists in the frontend directory
2. Ensure it contains all required variables
3. Restart the development server

## Package Manager Issues

### Dependency Conflicts

If you're experiencing dependency conflicts or version incompatibilities:

1. Clear npm cache:
   ```bash
   npm cache clean --force
   ```

2. Delete node_modules and reinstall:
   ```bash
   cd src/frontend
   rm -rf node_modules
   rm package-lock.json
   npm install
   ```

3. For persistent issues, try using our installation script:
   ```bash
   node scripts/core/install-dependencies.js
   ```

## Browser Issues

### Hot Reload Not Working

If changes aren't reflected in the browser:

1. Hard refresh the page (Ctrl+F5)
2. Check the console for errors
3. Restart the development server
4. Clear browser cache

## Getting More Help

If you're still experiencing issues after trying these solutions, please:

1. Search existing GitHub issues
2. Check the project documentation
3. Contact the development team with:
   - Error messages and stack traces
   - Steps to reproduce the issue
   - Your environment details (OS, Node version, browser) 