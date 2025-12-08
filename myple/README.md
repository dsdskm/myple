# adb
source ~/.bash_profile

# 포트 포워딩
## React Native 개발 서버, Metro 서버 포트 포워딩
adb reverse tcp:8081 tcp:8081 && adb reverse tcp:5173 tcp:5173

# url 체크
granite.config.ts의 web host 주소 확인 필요

# TDS
https://tossmini-docs.toss.im/tds-mobile/start/