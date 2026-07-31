// cypherSecret/moduleSecrets viven en environment.secrets.ts (gitignored, no se commitea).
// Copiar environment.secrets.example.ts a environment.secrets.ts y completar los valores
// reales antes de compilar. El pipeline de build/deploy debe proveer ese archivo.
import { environmentSecrets } from './environment.secrets';

export const environment = {
  production: true,
  devTracing: false,
  devAd: false,
  ipProvider: 'https://api.ipify.org/?format=json',
  cypherSecret: environmentSecrets.cypherSecret,
  moduleSecrets: environmentSecrets.moduleSecrets,
  rootPage: '/session/signin',
  rootDomain: 'https://stg.confianza.pe',
  homePage: '/app/desktop',
  redirectUri:'https://stg.confianza.pe/login',
  googleOAuthClientId: '690217690558-7l16jg0u9r7udt2jjp6tjmtd3mhkgihu.apps.googleusercontent.com',
  requestConfigRootURL:'https://stg.confianza.pe/cores2/ant',
  devUser:''
}; 
