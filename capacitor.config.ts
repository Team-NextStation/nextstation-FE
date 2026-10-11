import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'nextstation.app',
  appName: '환승여행',
  webDir: 'dist',
  ios: {
    zoomEnabled: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
