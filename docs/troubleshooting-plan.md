# Comprehensive Troubleshooting Plan

## Step 1: Verify the Basics

1. **Check which Next.js server is running**
   ```bash
   # List all running Node.js processes to see if multiple servers are running
   Get-Process node
   
   # Check what's using port 3000
   netstat -ano | findstr :3000
   ```

2. **Verify you're accessing the correct URL**
   - Make sure you're accessing `http://localhost:3000` and not another port
   - Check if you're opening from a bookmark that might point to a different deployment

3. **Hard refresh your browser**
   - Windows/Linux: `Ctrl+F5`
   - Mac: `Cmd+Shift+R`
   - Or open dev tools (F12) → Network tab → check "Disable cache"

## Step 2: Project Structure Check

1. **Verify the directory structure** (folder locations matter in Next.js):
   - For Pages Router: Changes should be in `src/frontend/pages/`
   - For App Router: Changes should be in `src/frontend/app/`

2. **Check if you're editing the right files**:
   ```bash
   # Go to your frontend directory
   cd /c/Users/lucas/repos/papo-comtxae/src/frontend
   
   # Check if you're using Pages Router or App Router
   if (Test-Path "app") { echo "Using App Router" } else { echo "Using Pages Router" }
   
   # List main directories to confirm structure
   ls
   ```

## Step 3: Next.js Configuration Check

1. **Review your Next.js config file**:
   ```bash
   cat src/frontend/next.config.js
   ```
   Check for any custom configurations that might affect:
   - Output directory
   - Asset prefixes
   - Rewrites/redirects

2. **Check package.json for correct scripts**:
   ```bash
   cat src/frontend/package.json
   ```
   Confirm that `npm run dev` is properly configured

## Step 4: Development Environment Test

1. **Create a simple test file** that should definitely show changes:
   ```jsx
   // In src/frontend/pages/test-page.js or src/frontend/app/test-page/page.js
   export default function TestPage() {
     return (
       <div style={{padding: "40px", textAlign: "center"}}>
         <h1>Test Page - Current time: {new Date().toLocaleTimeString()}</h1>
         <p>If you can see this page with the current time, Next.js is working!</p>
       </div>
     );
   }
   ```

2. **Access the test page** at `http://localhost:3000/test-page`
   - If this shows up, Next.js is working and the issue is elsewhere
   - If not, the problem is with the Next.js server itself

## Step 5: Server Restart with Clean State

1. **Stop all running processes**:
   ```bash
   # Windows
   taskkill /f /im node.exe
   
   # Kill any other potentially related processes
   taskkill /f /im npm.exe
   ```

2. **Clear the Next.js build cache**:
   ```bash
   # Remove .next folder
   cd /c/Users/lucas/repos/papo-comtxae/src/frontend
   rm -rf .next
   ```

3. **Reinstall dependencies**:
   ```bash
   npm install
   # or 
   yarn
   ```

4. **Start with a fresh environment**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Step 6: Check Integration Between Frontend and Backend

1. **Verify API connectivity**:
   ```bash
   # Use PowerShell to check if backend is responding
   Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get
   ```

2. **Check environment variables**:
   - Ensure your `.env` file has the correct `NEXT_PUBLIC_API_URL` pointing to where your backend is running
   - Verify that frontend is actually using these env vars in API calls

## Step 7: Inspecting Network and Console

1. **Open browser's developer tools** (F12)
   - Check the Console tab for any errors
   - Check the Network tab for failed requests
   - Look for 404s or other error responses

2. **Check if any resources are loading**:
   - Look at what JS and CSS files are being loaded
   - See if the loaded files match what you expect from your project

## Step 8: Project-Specific Checks

1. **Check if you're using a UI framework**:
   - If using component libraries like MUI, Tailwind, etc., ensure they're properly installed
   - Check if there are stylesheet imports missing

2. **Check state management**:
   - If using Redux, Context API, etc., verify if state changes are being properly applied
   - Look for potential initialization issues

## Step 9: Check for Code Conflicts

1. **Review your Git history**:
   ```bash
   cd /c/Users/lucas/repos/papo-comtxae
   git log --oneline -10
   ```

2. **Check for uncommitted changes**:
   ```bash
   git status
   ```

3. **Review recent changes**:
   ```bash
   git diff
   ```

## Conclusion

If following these steps doesn't identify the issue, try creating a completely new Next.js project in a different location and gradually port your components over to see at which point the problem occurs.

## Diagnostic Commands Reference

```bash
# Check running Node processes
Get-Process | Where-Object {$_.ProcessName -eq "node"}

# Check what's using port 3000
netstat -ano | findstr :3000

# Kill process by ID
taskkill /F /PID <process_id>

# Check the backend health
Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get

# Run Next.js in debug mode
$env:DEBUG='*'; npm run dev
```
