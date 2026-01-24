# 1. 빌드 단계 (Builder Stage)
# ---------------------------
# TypeScript 코드를 JavaScript로 컴파일합니다.
FROM node:18-alpine AS builder

# 작업 디렉터리 설정
WORKDIR /app

# package.json과 package-lock.json을 복사하여 의존성을 먼저 설치합니다.
# 이렇게 하면 소스 코드가 변경되어도 의존성은 캐시된 레이어를 사용하게 됩니다.
COPY package*.json ./

# 개발 의존성을 포함하여 모든 의존성 설치
RUN npm install

# 전체 소스 코드 복사
COPY . .

# TypeScript를 JavaScript로 빌드
# package.json에 "build": "tsc"와 같은 스크립트가 있어야 합니다.
RUN npm run build

# 2. 프로덕션 단계 (Production Stage)
# --------------------------------
# 빌드된 결과물과 프로덕션 의존성만 포함하는 최종 이미지를 생성합니다.
FROM node:18-alpine

# 작업 디렉터리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./
COPY /key ./key

# 프로덕션 의존성만 설치하여 이미지 크기를 줄입니다.
RUN npm install --only=production

# 빌드 단계에서 생성된 JavaScript 파일들을 복사합니다.
# tsconfig.json의 outDir이 'dist'라고 가정합니다.
COPY --from=builder /app/dist ./dist

# 애플리케이션이 3000번 포트를 사용하므로 외부에 노출합니다.
# process.env.PORT 환경 변수가 있으면 해당 포트를 사용합니다.
EXPOSE 3000

# 컨테이너가 시작될 때 실행할 명령어
CMD ["node", "dist/app.js"]