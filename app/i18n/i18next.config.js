import i18n from 'i18next'
import { reactI18nextModule } from 'react-i18next'
import i18nextBackend from 'i18next-node-fs-backend'

const i18nextOptions = {
  backend:{
    loadPath: './locales/{{lng}}/{{ns}}.json',
    addPath: './locales/{{lng}}/{{ns}}.missing.json',
    jsonIndent: 2,
  },
  interpolation: {
    escapeValue: false
  },
  debug: true,
  saveMissing: true,
  fallbackLng: 'en',
  whitelist: ['en', 'ko', 'eo'],
  keySeparator: false,
  nsSeparator: false,
  ns: [
    'get-started',
    'overview',
    'own-addresses',
    'send-cash',
    'settings',
    'services',
    'validation',
    'menu',
    'other'
  ],
  react: {
    wait: true,
    bindI18n: 'languageChanged loaded',
  }
};

i18n
  .use(i18nextBackend)
  .use(reactI18nextModule)

if (!i18n.isInitialized) {
  i18n.init(i18nextOptions)
}

module.exports = i18n
