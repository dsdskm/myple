# 1. Node 기반 이미지
FROM node:18

# 2. 앱 디렉토리 생성
WORKDIR /app

# 3. package.json 복사 후 설치
COPY package*.json ./
RUN npm install --production

# 4. 나머지 앱 복사
COPY . .

# 5. 포트 환경 변수
ENV PORT=8080

# 6. 서버 실행
CMD ["npm", "start"]
