// Plantilla de src/environments/environment.secrets.ts (archivo real, gitignored).
// Copiar este archivo a environment.secrets.ts y completar con los valores reales
// (pedirlos a quien administre las claves de cifrado) antes de compilar o levantar
// el proyecto localmente. El pipeline de build/deploy debe provisionar
// environment.secrets.ts de la misma forma antes de correr `ng build`.
export const environmentSecrets = {
  cypherSecret: 'REPLACE_WITH_32_CHAR_HEX_SECRET',
  moduleSecrets: {
    session: 'REPLACE_WITH_32_CHAR_HEX_SECRET',
    app: 'REPLACE_WITH_32_CHAR_HEX_SECRET',
    sis: 'REPLACE_WITH_32_CHAR_HEX_SECRET',
    admin: 'REPLACE_WITH_32_CHAR_HEX_SECRET',
    secciones: 'REPLACE_WITH_32_CHAR_HEX_SECRET',
    reporting: 'REPLACE_WITH_32_CHAR_HEX_SECRET',
    rep2: 'REPLACE_WITH_32_CHAR_HEX_SECRET',
  },
};
