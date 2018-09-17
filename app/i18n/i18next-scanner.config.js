const fs = require('fs')
const chalk = require('chalk')

module.exports = {
    options: {
        debug: true,
        func: {
            list: ['i18next.t', 'i18n.t', 't'],
            extensions: ['.js', '.jsx']
        },
        trans: {
            extensions: ['.js', '.jsx'],
            fallbackKey: (ns, value) => value
        },
        lngs: ['en','eo', 'ko'],
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
        defaultValue: '__STRING_NOT_TRANSLATED__',
        resource: {
            loadPath: 'i18n/{{lng}}/{{ns}}.json',
            savePath: 'i18n/{{lng}}/{{ns}}.json'
        },
        nsSeparator: false,
        keySeparator: false,
        interpolation: {
            prefix: '{{',
            suffix: '}}'
        }
    },
    transform: function customTransform(file, enc, done) {
        const { parser } = this
        const content = fs.readFileSync(file.path, enc)
        let count = 0

        parser.parseFuncFromString(content, { list: ['i18next._', 'i18next.__'] }, (key, options) => {
            parser.set(key, Object.assign({}, options, {
                nsSeparator: false,
                keySeparator: false
            }))
            count += 1
        })

        if (count > 0) {
            console.log(`i18next-scanner: count=${chalk.cyan(count)}, file=${chalk.yellow(JSON.stringify(file.relative))}`)
        }

        done()
    }
}
