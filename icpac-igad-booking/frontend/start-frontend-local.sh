#!/bin/bash

# ========================================
# Start Frontend Development Server Locally
# ========================================

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📱 Starting React Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed. Installing..."
    npm install
fi

# Start development server
echo "Starting frontend on http://localhost:3000"
npm start
