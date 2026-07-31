// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
//
// cypherSecret/moduleSecrets viven en environment.secrets.ts (gitignored, no se commitea).
// Copiar environment.secrets.example.ts a environment.secrets.ts y completar los valores
// reales antes de compilar. El pipeline de build/deploy debe proveer ese archivo.
import { environmentSecrets } from './environment.secrets';

export const environment = {
  production: false,
  structure:'corredor',
  devTracing: false,
  devAd: false,
  ipProvider: 'http://api.ipify.org/?format=json',
  cypherSecret: environmentSecrets.cypherSecret,
  moduleSecrets: environmentSecrets.moduleSecrets,
  rootPage: '/session/signin',
  rootDomain: 'http://localhost:4200',
  homePage: '/app/desktop',
  
  redirectUri:'http://localhost:4200/login',
  //redirectUri:'https://stg.confianza.pe/login',
  
  googleOAuthClientId: '690217690558-7l16jg0u9r7udt2jjp6tjmtd3mhkgihu.apps.googleusercontent.com',
  
  requestConfigRootURL:'https://stg.confianza.pe/cores2/ant',
  //requestConfigRootURL:'http://localhost:8080/ant',
  
  //devUser:  'nilda.quilla@confianza.pe' // comercial
  //devUser:  'giomara.acevedo@confianza.pe' //operaciones  157
  //devUser: 'flor.garcia@confianza.pe' // asesor
  //devUser:  'pierro.flores@confianza.pe'
  devUser:  'oscar.sanchez@confianza.pe'
  //devUser: 'juan.vasquez@confianza.pe'
 // devUser: 'hermes.chuquillanqui@confianza.pe'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
