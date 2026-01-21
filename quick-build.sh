#!/bin/bash

# Quick build script without prompts
# Usage: ./quick-build.sh [optional-version]

VERSION_FILE="./version.txt"
mkdir -p ./output

# 버전 설정
if [ -n "$1" ]; then
    VERSION=$1
else
    if [ -f "$VERSION_FILE" ]; then
        CURRENT_VERSION=$(cat "$VERSION_FILE")
    else
        CURRENT_VERSION=0
    fi
    VERSION=$((CURRENT_VERSION + 1))
fi

echo "Building version ${VERSION}..."

# 백엔드 빌드
echo "[1/3] Building server..."
docker buildx build --platform linux/amd64 \
    -t json-crud-server:${VERSION} \
    --load \
    -f ./server/Dockerfile \
    ./server || exit 1

# 프론트엔드 빌드
echo "[2/3] Building client..."
docker buildx build --platform linux/amd64 \
    -t json-crud-client:${VERSION} \
    --load \
    -f ./client/Dockerfile \
    ./client || exit 1

# 이미지 저장
echo "[3/3] Saving images..."
docker save -o "./output/json-crud-server-${VERSION}.tar" "json-crud-server:${VERSION}"
docker save -o "./output/json-crud-client-${VERSION}.tar" "json-crud-client:${VERSION}"

# 버전 업데이트
echo "${VERSION}" > "$VERSION_FILE"

echo "✓ Build completed!"
echo "  Server: ./output/json-crud-server-${VERSION}.tar"
echo "  Client: ./output/json-crud-client-${VERSION}.tar"
