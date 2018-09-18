// @flow
import vfs from 'vinyl-fs'
import scanner from 'i18next-scanner'
import filter from 'gulp-filter'
import * as fs from 'fs'
import { availableLanguages } from '../../app/i18n/i18next.config'

const optionsTemplate = {
  debug: true,
  func: {
    list: ['i18next.t', 'i18n.t', 't'],
    extensions: ['.js', '.jsx']
  },
  trans: {
    // Disable Trans component parsing
    extensions: [],
    fallbackKey: (ns, value) => value
  },
  lngs: availableLanguages,
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
  defaultNs: 'other',
  defaultValue: (language, namespace, key) => key,
  resource: {
    loadPath: './localesa/{{lng}}/{{ns}}.json',
    savePath: 'i18n/{{lng}}/{{ns}}.json'
  },
  nsSeparator: false,
  keySeparator: false,
  interpolation: {
    prefix: '{{',
    suffix: '}}'
  }
}

function getScanner(namespace: string) {
  const options = {
    ...optionsTemplate,
    defaultNs: namespace
  }
  return scanner(options)
}

function transform(file, enc, done) {
  const parser = this.parser;
  const content = fs.readFileSync(file.path, enc);
  let count = 0;

  parser.parseFuncFromString(content, { list: ['i18next._', 'i18next.__'] }, (key, options) => {
    parser.set(key, Object.assign({}, options, {
      nsSeparator: false,
      keySeparator: false
    }));
    ++count;
  });

  if (count > 0) {
    console.log(`i18next-scanner: count=${chalk.cyan(count)}, file=${chalk.yellow(JSON.stringify(file.relative))}`);
  }

  done();
}

const filters = {
  getStarted: filter('**/get-started/*.js', { restore: true }),
  overview: filter('**/overview/*.js', { restore: true }),
}

vfs.src(['./app/**/*.js', '!./app/node_modules/**/*', '!./app/dist/**/*.js', '!./app/i18n/**/*.js'])

  .pipe(filters.getStarted)
  .pipe(getScanner('get-started'))
  .pipe(vfs.dest('./locales/'))
  .pipe(filters.getStarted.restore)

  .pipe(filters.overview)
  .pipe(getScanner('overview'))
  .pipe(vfs.dest('./locales/'))
  .pipe(filters.overview.restore)
