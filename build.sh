#!/bin/bash

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 출력 디렉토리 생성
mkdir -p ./output

# 버전 파일 경로
VERSION_FILE="./version.txt"

# 현재 버전 읽기 (파일이 없으면 1로 시작)
if [ -f "$VERSION_FILE" ]; then
    CURRENT_VERSION=$(cat "$VERSION_FILE")
else
    CURRENT_VERSION=0
fi

# 버전 증가
NEW_VERSION=$((CURRENT_VERSION + 1))

echo -e "${YELLOW}=== JSON CRUD (Next.js) Docker Build Script ===${NC}"
echo -e "${GREEN}Current version: ${CURRENT_VERSION}${NC}"
echo -e "${GREEN}New version: ${NEW_VERSION}${NC}"
echo ""

# 사용자에게 확인
read -p "Continue with version ${NEW_VERSION}? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Build cancelled${NC}"
    exit 1
fi

echo -e "${YELLOW}Building Next.js application image...${NC}"

# Next.js 애플리케이션 빌드 (단일 이미지)
echo -e "${GREEN}[1/3] Building Next.js app image...${NC}"
docker buildx build --platform linux/amd64 \
    --no-cache \
    -t json-crud-app:${NEW_VERSION} \
    -t json-crud-app:latest \
    --load \
    -f ./client/Dockerfile \
    ./client

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed!${NC}"
    exit 1
fi

# Docker 이미지 저장
echo -e "${GREEN}[2/3] Saving image...${NC}"
docker save -o "./output/json-crud-app-${NEW_VERSION}.tar" "json-crud-app:${NEW_VERSION}"

if [ $? -ne 0 ]; then
    echo -e "${RED}Image save failed!${NC}"
    exit 1
fi

# 버전 파일 업데이트
echo "${NEW_VERSION}" > "$VERSION_FILE"

echo -e "${GREEN}[3/3] Build completed!${NC}"
echo ""
echo -e "${YELLOW}=== Build Summary ===${NC}"
echo -e "Version: ${GREEN}${NEW_VERSION}${NC}"
echo -e "App image: ${GREEN}./output/json-crud-app-${NEW_VERSION}.tar${NC}"
echo -e "Image size: ${GREEN}$(du -h ./output/json-crud-app-${NEW_VERSION}.tar | cut -f1)${NC}"
echo ""

# SCP 옵션
REMOTE_HOST="nas.home"
REMOTE_PATH="/volume1/docker/json-crud"

read -p "Upload to NAS (nas.home:${REMOTE_PATH})? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Uploading to ${REMOTE_HOST}:${REMOTE_PATH}${NC}"

    # 디렉토리가 없으면 생성
    ssh "${REMOTE_HOST}" "mkdir -p ${REMOTE_PATH}"

    # 파일 업로드
    echo "Uploading app image..."
    cat "./output/json-crud-app-${NEW_VERSION}.tar" | ssh "${REMOTE_HOST}" "cat > ${REMOTE_PATH}/json-crud-app-${NEW_VERSION}.tar"

    echo "Uploading docker-compose..."
    cat "./docker-compose.prod.yml" | ssh "${REMOTE_HOST}" "cat > ${REMOTE_PATH}/docker-compose.yml"

    echo "Uploading deploy script..."
    cat "./synology-deploy.sh" | ssh "${REMOTE_HOST}" "cat > ${REMOTE_PATH}/synology-deploy.sh && chmod +x ${REMOTE_PATH}/synology-deploy.sh"

    echo "Uploading .env file..."
    if [ -f .env.prod ]; then
        cat "./.env.prod" | ssh "${REMOTE_HOST}" "cat > ${REMOTE_PATH}/.env"
    else
        echo -e "${YELLOW}Warning: .env.prod file not found, skipping...${NC}"
        echo -e "${YELLOW}Creating default .env on NAS...${NC}"
        ssh "${REMOTE_HOST}" "cat > ${REMOTE_PATH}/.env << 'EOF'
# 데이터 디렉토리 경로
DATA_DIR=/volume1/docker/json-crud/data

# Node.js 환경
NODE_ENV=production
EOF"
    fi

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Upload completed!${NC}"
        echo ""
        echo -e "${YELLOW}=== Next Steps on Synology ===${NC}"
        echo "Run the following command to deploy:"
        echo ""
        echo "  ssh ${REMOTE_HOST} 'cd ${REMOTE_PATH} && ./synology-deploy.sh ${NEW_VERSION}'"
        echo ""

        # 자동 배포 옵션
        read -p "Deploy now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}Deploying to Synology...${NC}"
            ssh "${REMOTE_HOST}" "cd ${REMOTE_PATH} && ./synology-deploy.sh ${NEW_VERSION}"

            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Deployment completed!${NC}"
                echo -e "Access the app at: ${GREEN}http://nas.home:3000${NC}"
            else
                echo -e "${RED}Deployment failed!${NC}"
            fi
        fi
    else
        echo -e "${RED}Upload failed!${NC}"
    fi
fi

echo ""
echo -e "${GREEN}Done!${NC}"
