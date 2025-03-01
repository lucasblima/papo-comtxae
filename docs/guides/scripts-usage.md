# Using Project Scripts

## Running the Next.js Restart Script

### On Linux/macOS

To run the `next-restart.sh` script on Linux or macOS:

1. First, make the script executable:
   ```bash
   chmod +x next-restart.sh
   ```

2. Then execute it:
   ```bash
   ./next-restart.sh
   ```

### On Windows with Git Bash (MINGW)

If you're using Git Bash on Windows (MINGW64), you can run the script using:

1. Navigate to the project directory:
   ```bash
   cd /c/Users/lucas/repos/papo-comtxae
   ```

2. Execute the bash script:
   ```bash
   bash next-restart.sh
   ```

### On Windows with Command Prompt or PowerShell

For Windows Command Prompt or PowerShell users, we've provided a batch file equivalent:

```cmd
next-restart.bat
```

To run it:
```cmd
next-restart.bat
```

## Common Issues

- **"Permission denied" errors**: Make sure the script has execute permissions
- **"Command not found" errors**: Ensure you're in the correct directory
- **Process termination issues**: If the script fails to terminate processes, you might need to manually end them using Task Manager

## Additional Scripts

Check the `package.json` file for other available npm scripts:

- `npm run dev` - Start the Next.js development server
- `npm run build` - Build the Next.js application
- `npm run start` - Start the production server
