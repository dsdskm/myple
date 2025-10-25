import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'myple',
  brand: {
    displayName: 'myple',
    primaryColor: '#3182F6',
    icon: "./app_icon.png",
    bridgeColorMode: 'basic',
  },
  web: {
    host: '192.168.0.2', // magok
    port: 3000,
    commands: {
      dev: 'next dev --turbopack',
      build: 'next build --turbopack',
    },
  },
  permissions: [],
  outdir: 'dist',
});
