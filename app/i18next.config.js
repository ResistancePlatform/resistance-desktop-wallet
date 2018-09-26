import i18n from 'i18next'
import path from 'path'
import { reactI18nextModule } from 'react-i18next'
import i18nextBackend from 'i18next-node-fs-backend'

import { OSService } from './service/os-service'

const availableLanguages = ['en', 'eo', 'ko']

const availableNamespaces = [
  'get-started',
  'overview',
  'own-addresses',
  'address-book',
  'send-cash',
  'settings',
  'resdex',
  'service',
  'validation',
  'menu',
  'other'
]

const isDev = process.env.NODE_ENV === 'development'
const os = new OSService()

const localesPath = path.join(os.getResourcesPath(), 'locales')


const i18nextOptions = {
  backend:{
    loadPath: path.join(localesPath, '{{lng}}', '{{ns}}.json'),
    addPath: path.join(localesPath, '{{lng}}', '{{ns}}.missing.json'),
    jsonIndent: 2,
  },
  interpolation: {
    escapeValue: false
  },
  debug: isDev,
  saveMissing: false,
  fallbackLng: 'en',
  whitelist: availableLanguages,
  keySeparator: false,
  nsSeparator: false,
  ns: availableNamespaces,
  react: {
    wait: true,
    bindI18n: 'languageChanged loaded'
  }
};

i18n
  .use(i18nextBackend)
  .use(reactI18nextModule)

if (!i18n.isInitialized) {
  i18n.init(i18nextOptions)
}

export {
  i18n,
  availableLanguages,
  availableNamespaces
}
