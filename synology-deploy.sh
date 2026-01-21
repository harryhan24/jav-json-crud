#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 버전 인자 확인
if [ -z "$1" ]; then
    echo -e "${RED}Error: Version number required${NC}"
    echo "Usage: $0 <version>"
    echo "Example: $0 1"
    exit 1
fi

VERSION=$1
IMAGE_FILE="json-crud-app-${VERSION}.tar"
CONTAINER_NAME="json-crud-app"

echo -e "${YELLOW}=== JSON CRUD Synology Deployment Script ===${NC}"
echo -e "Version: ${GREEN}${VERSION}${NC}"
echo ""

# 이미지 파일 확인
if [ ! -f "$IMAGE_FILE" ]; then
    echo -e "${RED}Error: Image file not found: ${IMAGE_FILE}${NC}"
    exit 1
fi

# 기존 컨테이너 중지 및 제거
echo -e "${GREEN}[1/5] Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true

# 기존 이미지 제거 (선택적)
echo -e "${GREEN}[2/5] Removing old images...${NC}"
docker rmi json-crud-app:latest 2>/dev/null || true
docker rmi json-crud-app:${VERSION} 2>/dev/null || true

# 새 이미지 로드
echo -e "${GREEN}[3/5] Loading new image...${NC}"
docker load -i "$IMAGE_FILE"

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to load image!${NC}"
    exit 1
fi

# 이미지 태그 확인
echo -e "${GREEN}[4/5] Verifying image...${NC}"
docker images | grep json-crud-app

# Docker Compose로 컨테이너 시작
echo -e "${GREEN}[5/5] Starting containers...${NC}"
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start containers!${NC}"
    exit 1
fi

# 잠시 대기
sleep 3

# 컨테이너 상태 확인
echo ""
echo -e "${YELLOW}=== Container Status ===${NC}"
docker-compose ps

# 로그 확인
echo ""
echo -e "${YELLOW}=== Recent Logs ===${NC}"
docker-compose logs --tail=20

echo ""
echo -e "${GREEN}Deployment completed!${NC}"
echo -e "Application is running at: ${GREEN}http://$(hostname -I | awk '{print $1}'):3000${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View logs:    docker-compose logs -f"
echo "  Restart:      docker-compose restart"
echo "  Stop:         docker-compose down"
echo "  Status:       docker-compose ps"
echo ""
