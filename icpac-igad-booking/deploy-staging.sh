#!/bin/bash

# ==============================================
# ICPAC Booking System - Staging Deployment Script
# ==============================================
# This script builds images locally and pushes to Docker Hub
# Then deploys on staging server using .env.staging configuration

set -e  # Exit on error

echo "=========================================="
echo "ICPAC Booking System - Staging Deployment"
echo "=========================================="

# Configuration
DOCKER_USERNAME="hkoros254"
VERSION="staging"
BACKEND_IMAGE="${DOCKER_USERNAME}/icpac-booking-backend:${VERSION}"
FRONTEND_IMAGE="${DOCKER_USERNAME}/icpac-booking-frontend:${VERSION}"

# Step 1: Build Backend Image
echo ""
echo "Step 1: Building Backend Docker Image..."
echo "=========================================="
docker build -t ${BACKEND_IMAGE} \
  --platform linux/amd64 \
  ./icpac-booking-backend

if [ $? -eq 0 ]; then
    echo "✓ Backend image built successfully"
else
    echo "✗ Backend build failed"
    exit 1
fi

# Step 2: Build Frontend Image
echo ""
echo "Step 2: Building Frontend Docker Image..."
echo "=========================================="
# Use staging API URL for frontend build
docker build -t ${FRONTEND_IMAGE} \
  --platform linux/amd64 \
  --build-arg REACT_APP_API_URL=http://197.254.1.10:9041/api \
  ./icpac-booking-frontend

if [ $? -eq 0 ]; then
    echo "✓ Frontend image built successfully"
else
    echo "✗ Frontend build failed"
    exit 1
fi

# Step 3: Push to Docker Hub
echo ""
echo "Step 3: Pushing Images to Docker Hub..."
echo "=========================================="

echo "Logging in to Docker Hub..."
docker login

echo "Pushing backend image..."
docker push ${BACKEND_IMAGE}

echo "Pushing frontend image..."
docker push ${FRONTEND_IMAGE}

if [ $? -eq 0 ]; then
    echo "✓ Images pushed successfully to Docker Hub"
else
    echo "✗ Push to Docker Hub failed"
    exit 1
fi

# Step 4: Display deployment instructions
echo ""
echo "=========================================="
echo "✓ Build and Push Complete!"
echo "=========================================="
echo ""
echo "Images pushed to Docker Hub:"
echo "  - ${BACKEND_IMAGE}"
echo "  - ${FRONTEND_IMAGE}"
echo ""
echo "Next steps for staging deployment:"
echo "=========================================="
echo "1. SSH to staging server (197.254.1.10):"
echo "   ssh hkoros@197.254.1.10"
echo ""
echo "2. Navigate to project directory:"
echo "   cd /path/to/icpac-booking-system"
echo ""
echo "3. Ensure .env.staging is configured with:"
echo "   - CORS_ALLOWED_ORIGINS=http://197.254.1.10:9040,http://197.254.1.10:9041,http://10.10.1.13:9040,http://10.10.1.13:9041"
echo "   - CSRF_TRUSTED_ORIGINS=http://197.254.1.10:9040,http://197.254.1.10:9041,http://10.10.1.13:9040,http://10.10.1.13:9041"
echo "   - REACT_APP_API_URL=http://197.254.1.10:9041/api"
echo "   - FRONTEND_URL=http://197.254.1.10:9040"
echo ""
echo "4. Pull and deploy:"
echo "   docker-compose -f docker-compose.prod.yml --env-file .env.staging pull"
echo "   docker-compose -f docker-compose.prod.yml --env-file .env.staging up -d"
echo ""
echo "5. Check logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "=========================================="
