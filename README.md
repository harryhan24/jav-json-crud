# JSON CRUD 웹 애플리케이션

JSON 파일 기반의 데이터베이스에서 테마와 항목을 Create, Read, Update, Delete 할 수 있는 웹 애플리케이션입니다.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **프론트엔드**: React 19 + TypeScript
- **백엔드**: Next.js API Routes
- **데이터베이스**: JSON 파일 (파일 시스템)
- **UI 라이브러리**: DnD Kit (드래그 앤 드롭)

## 프로젝트 구조

```
json-crud/
├── client/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API Routes (백엔드)
│   │   ├── page.tsx        # 메인 페이지
│   │   ├── layout.tsx      # 레이아웃
│   │   └── styles.css      # 글로벌 스타일
│   ├── lib/                # 유틸리티 함수
│   │   ├── db.ts          # 데이터베이스 함수
│   │   ├── api.ts         # API 클라이언트
│   │   └── types.ts       # TypeScript 타입
│   ├── data/              # JSON 데이터 파일 (기본)
│   │   ├── theme.json
│   │   ├── actors.json
│   │   ├── tags.json
│   │   └── meta.json
│   └── Dockerfile         # Docker 이미지 빌드 파일
├── docker-compose.yml     # Docker Compose 설정
└── data/                  # 외부 데이터 디렉토리 (선택적)
```

## 기능

### 파일 타입 관리
- ✅ 4가지 파일 타입 지원 (Theme, Actors, Tags, Meta)
- ✅ 파일 타입별 독립적인 데이터 관리
- ✅ 메타데이터 편집 (이름, 설명)

### 테마 관리
- ✅ 테마 목록 조회
- ✅ 새 테마 생성
- ✅ 테마 이름 변경 (더블클릭)
- ✅ 드래그 앤 드롭으로 테마 순서 변경
- ❌ 테마 삭제 (의도적으로 비활성화)

### 항목 관리
- ✅ 테마별 항목 조회
- ✅ 여러 항목 일괄 추가 (멀티라인 텍스트 지원)
- ✅ 개별 항목 삭제
- ✅ 중복 항목 자동 제거
- ✅ 대소문자 옵션 (allowOnlyUpperCase)

## 설치 및 실행

### Docker로 실행하기 (권장)

#### 필요 조건
- Docker
- Docker Compose

#### 실행 방법

1. 데이터 디렉토리 준비 (선택적):
```bash
# 프로젝트 루트에 data 디렉토리 생성
mkdir -p data

# 또는 시스템의 다른 위치 사용 (예: /data)
# docker-compose.yml에서 볼륨 경로 수정 필요
```

2. Docker Compose로 빌드 및 실행:
```bash
docker-compose up --build
```

3. 애플리케이션 접속:
- 웹 애플리케이션: http://localhost:3000
- API 엔드포인트: http://localhost:3000/api/*

4. 종료:
```bash
docker-compose down
```

#### 백그라운드 실행
```bash
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 종료
docker-compose down
```

#### 데이터 디렉토리 설정

Docker Compose는 환경변수를 통해 데이터 디렉토리를 설정할 수 있습니다:

**옵션 1: 프로젝트 내 data 폴더 사용 (기본)**
```yaml
# docker-compose.yml
volumes:
  - ./data:/data
```

**옵션 2: 시스템의 다른 경로 사용**
```yaml
# docker-compose.yml
volumes:
  - /your/custom/path:/data
```

**옵션 3: Docker 볼륨 사용**
```yaml
# docker-compose.yml (주석 해제)
volumes:
  - json-crud-data:/data

volumes:
  json-crud-data:
    driver: local
```

### 프로덕션 배포

#### Docker 이미지 빌드

```bash
# 클라이언트 디렉토리에서
cd client
docker build -t json-crud-app:latest .
```

#### 커스텀 데이터 디렉토리로 실행

```bash
docker run -d \
  --name json-crud-app \
  -p 3000:3000 \
  -e DATA_DIR=/data \
  -v /your/data/path:/data \
  json-crud-app:latest
```

#### 환경변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `DATA_DIR` | JSON 데이터 파일이 저장될 디렉토리 | `{프로젝트}/data` |
| `NODE_ENV` | Node.js 환경 | `production` |
| `PORT` | 서버 포트 (Next.js 기본값) | `3000` |

### 로컬 개발 환경에서 실행하기

#### 1. 의존성 설치

```bash
cd client
npm install
```

#### 2. 환경변수 설정 (선택적)

`.env.local` 파일 생성:

```bash
cd client
cat > .env.local << EOF
# 데이터 디렉토리 (선택적)
# 설정하지 않으면 client/data 사용
DATA_DIR=/data

# 또는 상대 경로
# DATA_DIR=./custom-data
EOF
```

#### 3. 개발 서버 실행

```bash
cd client
npm run dev
```

애플리케이션이 http://localhost:3000 에서 실행됩니다.

#### 4. 프로덕션 빌드

```bash
cd client
npm run build
npm start
```

## API 엔드포인트

모든 API는 `/api` 경로 아래에 있으며, Next.js API Routes로 구현되어 있습니다.

### 데이터 조회

**GET /api/data/:fileType**

파일 전체 데이터를 조회합니다.

- 파라미터: `fileType` = `theme` | `actors` | `tags` | `meta`

**응답 예시:**
```json
{
  "version": 1,
  "themeName": "테마 관리",
  "description": "테마 설명",
  "allowOnlyUpperCase": false,
  "themeList": [
    {
      "theme": "테마 이름",
      "list": ["ABC-1234", "DEF-5678"]
    }
  ]
}
```

### 메타데이터 수정

**PUT /api/data/:fileType/metadata**

파일의 메타데이터를 업데이트합니다.

**요청 본문:**
```json
{
  "themeName": "새 이름",
  "description": "새 설명"
}
```

### 테마 관리

**GET /api/themes?fileType={fileType}**

테마 목록을 조회합니다.

**POST /api/themes?fileType={fileType}**

새 테마를 생성합니다.

**요청 본문:**
```json
{
  "theme": "새 테마 이름"
}
```

**PUT /api/themes/:themeName?fileType={fileType}**

테마 이름을 변경합니다.

**요청 본문:**
```json
{
  "newName": "새 테마 이름"
}
```

**PUT /api/themes/reorder?fileType={fileType}**

테마 순서를 변경합니다.

**요청 본문:**
```json
{
  "themeNames": ["테마1", "테마2", "테마3"]
}
```

### 항목 관리

**POST /api/themes/:themeName/items?fileType={fileType}**

테마에 항목을 추가합니다.

**요청 본문:**
```json
{
  "items": ["ABC-1234", "DEF-5678"]
}
```

**DELETE /api/themes/:themeName/items/:item?fileType={fileType}**

테마에서 항목을 삭제합니다.

## 사용 방법

1. **파일 타입 선택**: 상단의 Theme, Actors, Tags, Meta 버튼으로 파일 타입을 전환합니다.

2. **메타데이터 편집**: 메타데이터 섹션의 "편집" 버튼을 클릭하여 이름과 설명을 수정합니다.

3. **새 테마 만들기**: 입력 필드에 테마 이름을 입력하고 "생성" 버튼을 클릭합니다.

4. **테마 선택**: 왼쪽 테마 목록에서 원하는 테마를 클릭합니다.

5. **테마 이름 변경**: 테마를 더블클릭하여 이름을 수정합니다.

6. **테마 순서 변경**: 테마 목록의 왼쪽 드래그 핸들(⋮⋮)을 드래그하여 순서를 변경합니다.

7. **항목 추가**:
   - 텍스트 영역에 항목을 입력합니다.
   - 여러 항목을 한 번에 추가하려면 줄바꿈으로 구분하여 입력합니다.
   - "추가" 버튼을 클릭합니다.

8. **항목 삭제**: 각 항목 옆의 "삭제" 버튼을 클릭합니다.

## 개발 스크립트

```bash
cd client

# 개발 모드 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 모드 실행
npm start

# 린트 검사
npm run lint
```

## 데이터 형식

각 파일 타입의 JSON 파일 구조:

```json
{
  "version": 1,
  "themeName": "파일 이름",
  "description": "파일 설명",
  "allowOnlyUpperCase": false,
  "themeList": [
    {
      "theme": "테마 이름",
      "list": [
        "ABC-1234",
        "DEF-5678"
      ]
    }
  ]
}
```

**지원 파일:**
- `theme.json` - 테마 관리
- `actors.json` - 배우 관리
- `tags.json` - 태그 관리
- `meta.json` - 메타 정보 관리

## 주의사항

- `allowOnlyUpperCase`가 `true`일 경우 모든 항목이 자동으로 대문자로 변환됩니다.
- 중복된 항목은 자동으로 제거됩니다.
- 테마 삭제 기능은 의도적으로 제공되지 않습니다.
- JSON 파일이 직접 수정되므로 백업을 권장합니다.
- Docker 환경에서는 데이터 볼륨을 반드시 마운트하여 데이터 손실을 방지하세요.

## 라이선스

ISC

## 기여

이슈 및 PR은 언제나 환영합니다!
