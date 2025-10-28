import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'myple',
  brand: {
    displayName: 'myple', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: ".publc//app_icon.png",
    bridgeColorMode: 'basic',
  },
  web: {
    host: '192.168.0.2', // magok
    port: 3000,
    commands: {
      dev: 'react-scripts start',
      build: 'react-scripts build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
