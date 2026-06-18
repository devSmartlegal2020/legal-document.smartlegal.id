#!/bin/bash

echo "Starting deployment for smartlegal.id..."

# Go to project directory
cd /home/smartlegal.id/public_html

# Pull latest changes from main branch
git pull origin main

# Install dependencies
npm install

# Build Next.js production bundle
npm run build

# Restart or start PM2 process
pm2 restart legal-docs-smartlegal-id || pm2 start npm --name "legal-docs-smartlegal-id" -- start -- -p 3000

echo "Deployment finished successfully!"