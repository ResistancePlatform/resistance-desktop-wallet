// @flow
import path from 'path'
import { remote } from 'electron'
import dir from 'node-dir'
import { createSession } from 'iocane'
import slugify from '@sindresorhus/slugify'
import randomString from 'crypto-random-string'
import writeJsonFile from 'write-json-file'
import loadJsonFile from 'load-json-file'

import { translate } from '~/i18next.config'

const t = translate('resdex')

const iocane = (
  createSession()
    .use('cbc')
    .setDerivationRounds(300000)
)

const portfolioPath = path.join(remote.app.getPath('userData'), 'portfolios')

const fileNameToId = fileName => fileName.replace(/^resdex-portfolio-/, '').replace(/\.json$/, '')
const idToFileName = id => `resdex-portfolio-${id}.json`
const generateId = name => `${slugify(name).slice(0, 40)}-${randomString(6)}`


class IncorrectPasswordError extends Error {
	constructor() {
		super(t(`Incorrect ResDEX password`))
		Error.captureStackTrace(this, IncorrectPasswordError)
	}
}

/**
 * ES6 singleton
 */
let instance = null

/**
 * @export
 * @class ResDexPortfolioService
 */
export class ResDexPortfolioService {
	/**
	 * Creates an instance of ResDexPortfolioService.
   *
	 * @memberof ResDexPortfolioService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

		return instance
	}

  async create({name, seedPhrase, password}) {
    const id = this::generateId(name)
    const filePath = path.join(portfolioPath, idToFileName(id))

    const portfolio = {
      name,
      encryptedSeedPhrase: await iocane.encrypt(seedPhrase, password),
      appVersion: remote.app.getVersion(),
    }

    await writeJsonFile(filePath, portfolio)

    return id
  }

  async getPortfolios(): Portfolio[] {
    let portfolioFiles

    try {
      portfolioFiles = await dir.promiseFiles(portfolioPath)
    } catch (error) {
      if (error.code === 'ENOENT') {
        return []
      }

      throw error
    }

    const extension = '.json'
    portfolioFiles = portfolioFiles.filter(x => x.endsWith(extension))

    const portfolios = await Promise.all(portfolioFiles.map(async filePath => {
      const portfolio = await loadJsonFile(filePath)
      portfolio.fileName  = path.basename(filePath, extension)
      portfolio.id = fileNameToId(portfolio.fileName)

      return portfolio
    }))

    return portfolios.sort((a, b) => a.fileName.localeCompare(b.fileName))
  }

  async decryptSeedPhrase(seedPhrase: string, password: string) {
    try {
      return await iocane.decrypt(seedPhrase, password)
    } catch (error) {
      if (/Authentication failed/.test(error.message)) {
        throw new IncorrectPasswordError()
      }

      throw error
    }
  }

}
