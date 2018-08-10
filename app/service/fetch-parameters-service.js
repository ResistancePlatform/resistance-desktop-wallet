// @flow
import * as fs from 'fs';
import path from 'path'

import { app, dialog } from 'electron'
import { download } from 'electron-dl'

import { OSService } from './os-service'

const crypto = require('crypto');
const config = require('electron-settings')
const ProgressBar = require('electron-progressbar');

// Set the customized 'electron-settings' path
const osService = new OSService()
config.setPath(osService.getAppSettingFile())

const quickHashesConfigKey = 'resistanceParameters.quickHashes'
const paramsFolderName = 'ResistanceParams'

const sproutUrl = `https://z.cash/downloads`
const sproutFiles = [
  { name: 'sprout-proving.key', checksum: "8bc20a7f013b2b58970cddd2e7ea028975c88ae7ceb9259a5344a16bc2c0eef7" },
  { name: 'sprout-verifying.key', checksum: "4bd498dae0aacfd8e98dc306338d017d9c08dd0918ead18172bd0aec2fc5df82" }
]

// Shorter files for testing purposes
// const sproutUrl = 'https://www.sample-videos.com/video/mp4/480'
// const sproutFiles = [
//   { name: 'big_buck_bunny_480p_5mb.mp4', checksum: "287d49daf0fa4c0a12aa31404fd408b1156669084496c8031c0e1a4ce18c5247" },
//   { name: 'big_buck_bunny_480p_1mb.mp4', checksum: "6b83d01a1bddbb6481001d8bb644bd4eb376922a4cf363fda9c14826534e17b3" }
// ]

/**
 * ES6 singleton
 */
let instance = null

/**
 * @export
 * @class FetchParametersService
 */
export class FetchParametersService {
  parentWindow = null
  progressBar = null

	/**
	 * Creates an instance of FetchParametersService.
	 * @memberof FetchParametersService
	 */
	constructor() {
		if (!instance) { instance = this }
		return instance
	}

	/**
   * Returns true if Resistance parameters are present.
   * If sprout files exist but there's no corresponding quick hash record the checksum verification will be initiated,
   * followed by quick hash generation.
   *
	 * @memberof FetchParametersService
	 * @returns {boolean}
	 */
  async checkPresence() {
    const resistanceParamsFolder = this.getResistanceParamsFolder()

    if (!fs.existsSync(resistanceParamsFolder)) {
      return false
    }

    const quickHashes = config.get(quickHashesConfigKey, {})

    const verifySproutFile = async (fileName, index) => {
      if (!quickHashes[fileName]) {
        console.log(`Quick hash not found for ${fileName}, calculating SHA256 checksum...`)
        await this.verifyChecksum(fileName, sproutFiles[index].checksum)
        await this.saveQuickFileHash(fileName)
      } else {
        const quickHash = await this.calculateQuickHash(fileName)
        if (quickHash !== quickHashes[fileName]) {
          return false
        }
      }

      return true
    }

    for (let index = 0; index < sproutFiles.length; index++) {
      const fileName = sproutFiles[index].name
      let isVerified = false

      try {
        /* eslint-disable-next-line no-await-in-loop */
        isVerified = await verifySproutFile(fileName, index)
      } catch (err) {
        console.error(`Sprout file ${fileName} verification failed.`, err.toString())
        return false
      }

      if (!isVerified) {
        return false
      }
    }

    return true
  }

	/**
   * Downloads Resistance parameters
   *
	 * @memberof FetchParametersService
	 * @returns {boolean}
	 */
  async fetch(parentWindow) {
    this.parentWindow = parentWindow

    const resistanceParamsFolder = this.getResistanceParamsFolder()
    if (!fs.existsSync(resistanceParamsFolder)) {
      fs.mkdirSync(resistanceParamsFolder)
    }

    for (let index = 0; index < sproutFiles.length; index++) {
      this.progressBar = this.createProgressBar()

      const fileName = sproutFiles[index].name
      const filePath = path.join(resistanceParamsFolder, fileName)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      try {
        /* eslint-disable no-await-in-loop */

        await this.downloadSproutKey(fileName, index)
        this.progressBar.detail = `Calculating checksum for ${fileName}...`
        await this.verifyChecksum(fileName, sproutFiles[index].checksum)
        await this.saveQuickFileHash(fileName)

        /* eslint-enable no-await-in-loop */
      } catch(err) {
        dialog.showErrorBox(`Unable to fetch Resistance parameters`, err.toString())
        app.quit()
        break
      }

      this.progressBar.setCompleted()
      this.progressBar.close()
    }
  }

  getResistanceParamsFolder(): string {
    return path.join(app.getPath('appData'), paramsFolderName)
  }

  createProgressBar(): ProgressBar {
    const progressBar = new ProgressBar({
      indeterminate: false,
      closeOnComplete: false,
      text: `Fetching Resistance parameters...`,
      detail: `This will take awhile, but it's just a one time operation :)`,
      browserWindow: {
        parent: this.parentWindow
      }
    })
    return progressBar
  }

  downloadSproutKey(fileName, index) {
    let totalBytes

    const onProgress = progress => {
      const rate = progress * 100
      const roundedRate = Math.round(rate)
      const totalMb = (totalBytes / 1024 / 1024).toFixed(2)
      const receivedMb = (progress  * totalMb).toFixed(2)
      this.progressBar.value = rate
      this.progressBar.detail = `Downloading ${fileName}, received ${receivedMb}MB out of ${totalMb}MB (${roundedRate}%)...`
    }

    const onStarted = item => {
      totalBytes = item.getTotalBytes()
      this.progressBar.value = 0
      this.progressBar.text = `Fetching Resistance parameters (file ${index + 1} of ${sproutFiles.length})...`
    }

    const downloadPromise = download(this.parentWindow, `${sproutUrl}/${fileName}`, {
      saveAs: false,
      filename: fileName,
      directory: this.getResistanceParamsFolder(),
      onProgress,
      onStarted
    })

    return downloadPromise
  }

	/**
   * Calculates and compares downloaded file checksum
   *
	 * @memberof FetchParametersService
	 * @returns {Promise}
	 */
  verifyChecksum(fileName, checksum) {
    const filePath = path.join(this.getResistanceParamsFolder(), fileName)
    const hash = crypto.createHash('sha256')
    const stream = fs.ReadStream(filePath)

    hash.setEncoding('hex')
    stream.pipe(hash)

    const promise = new Promise((resolve, reject) => {
      stream.on('error', (err) => {
        reject(new Error(`Unable to read from ${fileName}, the error message was: ${err}`))
      })

      stream.on('end', () => {
        hash.end()
        const calculatedChecksum = hash.read()
        if (calculatedChecksum === checksum) {
          resolve()
        } else {
          reject(new Error(`Checksum doesn't match for ${fileName}.`))
        }
      })
    })

    return promise
  }

	/**
   * Saves a downloaded file quick hash to the application config.
   * Later we use the hash to verify Resistance parameters presence.
   *
	 * @memberof FetchParametersService
	 */
  async saveQuickFileHash(fileName: string) {
    const quickHashes = config.get(quickHashesConfigKey, {})
    quickHashes[fileName] = await this.calculateQuickHash(fileName)
    config.set(quickHashesConfigKey, quickHashes)
  }

	/**
   * Creates a downloaded file hash based on its size, creation and modification dates.
   * This is faster than calculating a proper checksum.
   *
	 * @memberof FetchParametersService
	 * @returns {Promise}
	 */
  calculateQuickHash(fileName: string) {
    const filePath = path.join(this.getResistanceParamsFolder(), fileName)

    const calcFromStats = stats => {
      const data = `${fileName};${stats.size};${stats.ctime.toISOString()};${stats.mtime.toISOString()}`
      return crypto.createHash('md5').update(data).digest("hex")
    }

    const promise = new Promise((resolve, reject) => {
      fs.stat(filePath, (err, stats) => {
        if (err) {
          reject(new Error(`Unable to retrieve file info for ${filePath}, the error message was: ${err}`))
        } else {
          resolve(calcFromStats(stats))
        }
      })
    })

    return promise
  }

}
