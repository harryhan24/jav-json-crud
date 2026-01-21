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

echo -e "${YELLOW}=== JSON CRUD Docker Build Script ===${NC}"
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

echo -e "${YELLOW}Building images...${NC}"

# 백엔드 빌드
echo -e "${GREEN}[1/4] Building server image...${NC}"
docker buildx build --platform linux/amd64 \
    -t json-crud-server:${NEW_VERSION} \
    -t json-crud-server:latest \
    --load \
    -f ./server/Dockerfile \
    ./server

if [ $? -ne 0 ]; then
    echo -e "${RED}Server build failed!${NC}"
    exit 1
fi

# 프론트엔드 빌드
echo -e "${GREEN}[2/4] Building client image...${NC}"
docker buildx build --platform linux/amd64 \
    -t json-crud-client:${NEW_VERSION} \
    -t json-crud-client:latest \
    --load \
    -f ./client/Dockerfile \
    ./client

if [ $? -ne 0 ]; then
    echo -e "${RED}Client build failed!${NC}"
    exit 1
fi

# Docker 이미지 저장
echo -e "${GREEN}[3/4] Saving images...${NC}"
docker save -o "./output/json-crud-server-${NEW_VERSION}.tar" "json-crud-server:${NEW_VERSION}"
docker save -o "./output/json-crud-client-${NEW_VERSION}.tar" "json-crud-client:${NEW_VERSION}"

if [ $? -ne 0 ]; then
    echo -e "${RED}Image save failed!${NC}"
    exit 1
fi

# 버전 파일 업데이트
echo "${NEW_VERSION}" > "$VERSION_FILE"

echo -e "${GREEN}[4/4] Build completed!${NC}"
echo ""
echo -e "${YELLOW}=== Build Summary ===${NC}"
echo -e "Version: ${GREEN}${NEW_VERSION}${NC}"
echo -e "Server image: ${GREEN}./output/json-crud-server-${NEW_VERSION}.tar${NC}"
echo -e "Client image: ${GREEN}./output/json-crud-client-${NEW_VERSION}.tar${NC}"
echo ""

# SCP 옵션
REMOTE_HOST="nas.home"
REMOTE_PATH="/volume1/docker/theme-crud"

read -p "Upload to NAS (nas.home:${REMOTE_PATH})? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Uploading to ${REMOTE_HOST}:${REMOTE_PATH}${NC}"

    # 디렉토리가 없으면 생성
    ssh "${REMOTE_HOST}" "mkdir -p ${REMOTE_PATH}"

    # 파일 업로드 (SSH를 통한 직접 전송 - 시놀로지 호환성 최고)
    echo "Uploading server image..."
    cat "./output/json-crud-server-${NEW_VERSION}.tar" | ssh "${REMOTE_HOST}" "cat > ${REMOTE_PATH}/json-crud-server-${NEW_VERSION}.tar"

    echo "Uploading client image..."
    cat "./output/json-crud-client-${NEW_VERSION}.tar" | ssh "${REMOTE_HOST}" "cat > ${REMOTE_PATH}/json-crud-client-${NEW_VERSION}.tar"

    echo "Uploading docker-compose..."
    cat "./docker-compose.prod.yml" | ssh "${REMOTE_HOST}" "cat > ${REMOTE_PATH}/docker-compose.prod.yml"

    echo "Uploading deploy script..."
    cat "./synology-deploy.sh" | ssh "${REMOTE_HOST}" "cat > ${REMOTE_PATH}/synology-deploy.sh"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Upload completed!${NC}"
        echo ""
        echo -e "${YELLOW}=== Next Steps on Synology ===${NC}"
        echo "Run the following command to deploy:"
        echo ""
        echo "  ssh ${REMOTE_HOST} 'cd ${REMOTE_PATH} && chmod +x synology-deploy.sh && ./synology-deploy.sh ${NEW_VERSION}'"
        echo ""
        read -p "Deploy now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${GREEN}Deploying on NAS...${NC}"
            ssh "${REMOTE_HOST}" "cd ${REMOTE_PATH} && chmod +x synology-deploy.sh && ./synology-deploy.sh ${NEW_VERSION}"
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}Deployment completed!${NC}"
                echo "Access the application at:"
                echo "  http://192.168.24.100:3000"
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
