#!/bin/bash

# Synology 서버에서 실행할 배포 스크립트
# Usage: ./synology-deploy.sh <version>

if [ -z "$1" ]; then
    echo "Usage: ./synology-deploy.sh <version>"
    echo "Example: ./synology-deploy.sh 3"
    exit 1
fi

VERSION=$1

echo "=== Deploying JSON CRUD v${VERSION} ==="

# 이미지 로드
echo "[1/4] Loading server image..."
docker load -i "json-crud-server-${VERSION}.tar"

echo "[2/4] Loading client image..."
docker load -i "json-crud-client-${VERSION}.tar"

# 기존 컨테이너 중지 및 제거
echo "[3/4] Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down

# 최신 태그 업데이트
echo "Tagging images as latest..."
docker tag "json-crud-server:${VERSION}" "json-crud-server:latest"
docker tag "json-crud-client:${VERSION}" "json-crud-client:latest"

# 새 컨테이너 시작
echo "[4/4] Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

# 상태 확인
echo ""
echo "=== Deployment Status ==="
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✓ Deployment completed!"
echo "  Server: http://localhost:3001"
echo "  Client: http://localhost:3000"
