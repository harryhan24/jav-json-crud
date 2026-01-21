# JSON CRUD 웹 애플리케이션

JSON 파일 기반의 데이터베이스에서 테마와 항목을 Create, Read, Update, Delete 할 수 있는 웹 애플리케이션입니다.

## 기술 스택

- **프론트엔드**: React + TypeScript + Vite
- **백엔드**: Node.js + Express + TypeScript
- **데이터베이스**: JSON 파일

## 프로젝트 구조

```
json-crud/
├── client/          # React 프론트엔드
├── server/          # Express 백엔드
└── data/            # JSON 데이터 파일
    └── theme.json
```

## 기능

### 테마 관리
- ✅ 테마 목록 조회
- ✅ 새 테마 생성
- ✅ 드래그 앤 드롭으로 테마 순서 변경
- ❌ 테마 삭제 (의도적으로 비활성화)

### 항목 관리
- ✅ 테마별 항목 조회
- ✅ 여러 항목 일괄 추가 (멀티라인 텍스트 지원)
- ✅ 개별 항목 삭제
- ✅ 항목 형식 검증

### 항목 형식
항목은 다음 패턴 중 하나를 따라야 합니다:
- `ABC-1234` (하이픈 포함)
- `ABC1234` (하이픈 없음)
- `ABC_1234` (언더스코어 포함)

패턴 규칙:
- 2~5자의 대문자 알파벳
- 2~5자의 숫자

## 설치 및 실행

### Docker로 실행하기 (권장)

#### 필요 조건
- Docker
- Docker Compose

#### 실행 방법

1. Docker Compose로 빌드 및 실행:
```bash
docker-compose up --build
```

2. 애플리케이션 접속:
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:3001

3. 종료:
```bash
docker-compose down
```

#### 백그라운드 실행
```bash
docker-compose up -d
```

### 시놀로지(Synology)에 배포하기

#### 1. 빌드 스크립트 실행

**대화형 빌드 (권장):**
```bash
./build.sh
```

**빠른 빌드:**
```bash
./quick-build.sh
```

**특정 버전으로 빌드:**
```bash
./quick-build.sh 5
```

#### 2. 생성된 파일

빌드 후 `output` 디렉토리에 다음 파일들이 생성됩니다:
- `json-crud-server-{version}.tar` - 백엔드 Docker 이미지
- `json-crud-client-{version}.tar` - 프론트엔드 Docker 이미지

#### 3. 시놀로지 서버에 업로드 및 배포

**자동 업로드 및 배포 (권장):**
```bash
./build.sh
# 프롬프트에서 'y'를 선택하여 자동 업로드
# 그 다음 프롬프트에서 'y'를 선택하여 자동 배포
```

**수동 업로드:**
```bash
scp ./output/*.tar nas.home:/volume1/docker/theme-crud/
scp ./docker-compose.prod.yml nas.home:/volume1/docker/theme-crud/
scp ./synology-deploy.sh nas.home:/volume1/docker/theme-crud/
```

**수동 배포:**
```bash
ssh nas.home
cd /volume1/docker/theme-crud
chmod +x synology-deploy.sh
./synology-deploy.sh 3  # 버전 번호 지정
```

#### 4. 접속

배포 완료 후 다음 주소로 접속:
- **프론트엔드**: http://192.168.24.100:3000
- **백엔드 API**: http://192.168.24.100:3001

#### 버전 관리

- 버전은 `version.txt` 파일에 자동으로 저장됩니다
- 빌드할 때마다 자동으로 버전이 증가합니다
- 수동으로 버전을 지정하려면 `quick-build.sh <version>` 사용

### 로컬 개발 환경에서 실행하기

#### 1. 의존성 설치

**서버:**
```bash
cd server
npm install
```

**클라이언트:**
```bash
cd client
npm install
```

#### 2. 서버 실행

```bash
cd server
npm run dev
```

서버가 http://localhost:3001 에서 실행됩니다.

#### 3. 클라이언트 실행

새 터미널에서:

```bash
cd client
npm run dev
```

클라이언트가 http://localhost:3000 에서 실행됩니다.

#### 4. 웹 브라우저에서 접속

http://localhost:3000 으로 접속하여 애플리케이션을 사용할 수 있습니다.

## API 엔드포인트

### GET /api/themes
모든 테마 목록을 조회합니다.

**응답 예시:**
```json
[
  {
    "theme": "테마 이름",
    "list": ["ABC-1234", "DEF-5678"]
  }
]
```

### POST /api/themes
새 테마를 생성합니다.

**요청 본문:**
```json
{
  "theme": "새 테마 이름"
}
```

### POST /api/themes/:themeName/items
특정 테마에 항목을 추가합니다.

**요청 본문:**
```json
{
  "items": ["ABC-1234", "DEF-5678"]
}
```

### DELETE /api/themes/:themeName/items/:item
특정 테마에서 항목을 삭제합니다.

### PUT /api/themes/reorder
테마 목록의 순서를 변경합니다.

**요청 본문:**
```json
{
  "themeNames": ["테마1", "테마2", "테마3"]
}
```

## 사용 방법

1. **새 테마 만들기**: 상단의 입력 필드에 테마 이름을 입력하고 "생성" 버튼을 클릭합니다.

2. **테마 선택**: 왼쪽 테마 목록에서 원하는 테마를 클릭합니다.

3. **테마 순서 변경**: 테마 목록의 왼쪽 햄버거 메뉴(⋮⋮)를 드래그하여 순서를 변경합니다.

4. **항목 추가**:
   - 텍스트 영역에 항목을 입력합니다.
   - 여러 항목을 한 번에 추가하려면 줄바꿈으로 구분하여 입력합니다.
   - "추가" 버튼을 클릭합니다.

5. **항목 삭제**: 각 항목 옆의 "삭제" 버튼을 클릭합니다.

## 개발 스크립트

### 서버
- `npm run dev`: 개발 모드로 서버 실행 (파일 변경 시 자동 재시작)
- `npm run build`: TypeScript 빌드
- `npm start`: 프로덕션 모드로 서버 실행

### 클라이언트
- `npm run dev`: 개발 모드로 클라이언트 실행
- `npm run build`: 프로덕션 빌드
- `npm run preview`: 빌드된 프로덕션 버전 미리보기

## 데이터 형식

`data/theme.json` 파일 구조:

```json
{
  "version": 3,
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

## 주의사항

- 모든 항목은 자동으로 대문자로 변환됩니다.
- 중복된 항목은 자동으로 제거됩니다.
- 테마 삭제 기능은 의도적으로 제공되지 않습니다.
- JSON 파일이 직접 수정되므로 백업을 권장합니다.
