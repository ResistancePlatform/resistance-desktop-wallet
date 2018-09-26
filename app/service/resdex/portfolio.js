// @flow
import path from 'path'
import { app } from 'electron'
import { createSession } from 'iocane'
import slugify from '@sindresorhus/slugify'
import randomString from 'crypto-random-string'
import writeJsonFile from 'write-json-file'


const iocane = (
  createSession()
    .use('cbc')
    .setDerivationRounds(300000)
)

const portfolioPath = path.join(app.getPath('userData'), 'portfolios');
const idToFileName = id => `resdex-portfolio-${id}.json`;
const generateId = name => `${slugify(name).slice(0, 40)}-${randomString(6)}`


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
      appVersion: app.getVersion(),
    }

    await writeJsonFile(filePath, portfolio)

    return id
  }

}

// async function decryptSeedPhrase(seedPhrase, password) {
// 	try {
// 		return await decrypt(seedPhrase, password);
// 	} catch (error) {
// 		if (/Authentication failed/.test(error.message)) {
// 			throw new IncorrectPasswordError()
// 		}
//
// 		throw error
// 	}
// }
