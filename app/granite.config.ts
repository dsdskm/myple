import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'myple',
  brand: {
    displayName: '마이플', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: "https://firebasestorage.googleapis.com/v0/b/myple-15ea9.firebasestorage.app/o/app_icon.png?alt=media&token=f954135d-5050-4199-ad27-4389899e2e18",
    bridgeColorMode: 'basic',

  },
  navigationBar: {
    withBackButton: true,
  },
  web: {
    host: '192.168.0.21', // 내 PC의 IP,
    port: 3000,
    commands: {
      dev: 'react-scripts start',
      build: 'react-scripts build',
    }
  },
  permissions: [
    {
      name: "camera",
      access: "access",
    },
    {
      name: "photos",
      access: "read",
    },
    {
      name: "geolocation",
      access: "access"
    }
  ],
  outdir: 'build'
});
