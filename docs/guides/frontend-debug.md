# Frontend Troubleshooting Guide for Next.js

## Common Issues When Changes Don't Appear

1. **Development Server Not Running**
   - Make sure you're running the Next.js development server
   - Typically: `npm run dev` or `yarn dev`

2. **Hard Browser Cache**
   - Try a hard refresh: `Ctrl+F5` or `Cmd+Shift+R`
   - Or open Chrome DevTools (F12) → Network tab → Disable cache

3. **Incorrect File Path**
   - Verify you're editing the right files that are actually used in the project
   - Check import paths in your components
   - Make sure you're following Next.js's file-based routing structure

4. **Next.js Build Process Issues**
   - Your changes might need a build step: `npm run build` or `yarn build`
   - Some changes to Next.js configuration require restarting the dev server

5. **Missing Frontend Dependencies**
   - Run `npm install` or `yarn` to ensure all dependencies are installed

6. **Environment Variables**
   - Check if your environment variables are properly prefixed with `NEXT_PUBLIC_`
   - Non-prefixed variables won't be available client-side
   - Changes to `.env` files require restarting the dev server

## Quick Diagnostics

Run this command to restart everything (for Next.js frontend):

```bash
# Kill any running Node processes
pkill -f node
# Clear Next.js cache
rm -rf .next/
# Reinstall dependencies
npm install # or yarn
# Start the Next.js dev server
npm run dev # or yarn dev
```

## Next.js Specific Troubleshooting

1. **Routing Issues**
   - Ensure your files are in the correct location in the `pages/` directory (or `app/` directory if using App Router)
   - Check if you're mixing App Router and Pages Router components incorrectly

2. **Server Components vs. Client Components**
   - If using App Router, remember that components are Server Components by default
   - Client-side interactivity requires `'use client'` directive at the top of your file

3. **Next.js Cache**
   - Try clearing the `.next/` directory completely to reset the build cache
   - `rm -rf .next/` followed by restarting the dev server

## Still Not Working?

Create a simple test file to verify basic functionality:
1. Create `test.html` in your public directory
2. Access it directly via browser to bypass the Next.js framework
