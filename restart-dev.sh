#!/bin/bash

echo "Stopping all Node.js processes..."
pkill -f node || echo "No Node processes found to kill"

echo "Clearing frontend cache..."
rm -rf node_modules/.cache

echo "Restarting backend server..."
cd src/backend
uvicorn main:app --reload &
cd ../..

echo "Reinstalling frontend dependencies..."
npm install || yarn

echo "Starting frontend development server..."
npm run dev || yarn dev

echo "Development environment restarted!"
echo "If you still don't see your changes, try a hard refresh (Ctrl+F5 or Cmd+Shift+R)"
