// @flow
import * as fs from 'fs'
import path from 'path'
import { app, remote } from 'electron'
import config from 'electron-settings'
import crypto from 'crypto'

import { translate } from '../i18next.config'
import { OSService } from './os-service'


const t = translate('service')
const os = new OSService()

const quickHashesConfigKey = 'resistanceParameters.quickHashes'
const paramsFolderName = 'ResistanceParams'

// const sproutUrl = `https://d3idekp8vvpxdr.cloudfront.net`
// const sproutFiles = [
//   { name: 'sprout-proving.key', checksum: "8bc20a7f013b2b58970cddd2e7ea028975c88ae7ceb9259a5344a16bc2c0eef7" },
//   { name: 'sprout-verifying.key', checksum: "4bd498dae0aacfd8e98dc306338d017d9c08dd0918ead18172bd0aec2fc5df82" }
// ]

// Shorter files for testing purposes
const sproutUrl = 'https://www.sample-videos.com/video/mp4/480'
const sproutFiles = [
  { name: 'big_buck_bunny_480p_5mb.mp4', checksum: "287d49daf0fa4c0a12aa31404fd408b1156669084496c8031c0e1a4ce18c5247" },
  { name: 'big_buck_bunny_480p_1mb.mp4', checksum: "6b83d01a1bddbb6481001d8bb644bd4eb376922a4cf363fda9c14826534e17b3" }
]

/**
 * ES6 singleton
 */
let instance = null

/**
 * @export
 * @class FetchParametersService
 */
export class FetchParametersService {
  currentWindow = null
  totalBytes: number
	completedBytes: number
  downloadItems: set
  actions: object

	/**
	 * Creates an instance of FetchParametersService.
	 * @memberof FetchParametersService
	 */
	constructor() {
    if (!instance) {
      instance = this
    }

		return instance
	}

  getResistanceParamsFolder(): string {
    return path.join(app.getPath('appData'), paramsFolderName)
  }

	/**
   * Returns true if Resistance parameters are present.
   * The use case when the sprout files exist but there's no corresponding quick hash record
   * the checksums verification and quick hash generation has to be triggered separately
   * by the checkPresenceWithoutQuickHashes() function.
   * The reason for that is to avoid locking the main process during SHA-256 checksums calculation.
   * Called from the main process.
   *
	 * @memberof FetchParametersService
	 * @returns {boolean}
	 */
  async checkPresenceWithQuickHashes() {
    const resistanceParamsFolder = this.getResistanceParamsFolder()

    if (!fs.existsSync(resistanceParamsFolder)) {
      return false
    }

    const quickHashes = config.get(quickHashesConfigKey, {})

    const verifySproutFile = async fileName => {
      if (!quickHashes[fileName]) {
        return false
      }

      const quickHash = await this::calculateQuickHash(fileName)
      if (quickHash !== quickHashes[fileName]) {
        return false
      }

      return true
    }

    return this::verifySproutFiles(verifySproutFile)
  }

	/**
   * In case the quick hashes are not present, calculates SHA-256 for the sprout files and generates quick hashes.
   * This operation takes about few seconds and should be initiated by the the renderer process.
   *
	 * @memberof FetchParametersService
	 * @returns {boolean}
	 */
  async checkPresenceWithoutQuickHashes() {
    const quickHashes = config.get(quickHashesConfigKey, {})

    const verifySproutFile = async fileName => {
      if (quickHashes[fileName]) {
        return true
      }

      await this::verifyChecksum(fileName, sproutFiles[index].checksum)
      await this::saveQuickFileHash(fileName)
    }

    return this::verifySproutFiles(verifySproutFile)
  }

	/**
   * Downloads Resistance parameters
   *
	 * @memberof FetchParametersService
	 * @returns {boolean}
	 */
  async fetch() {
    this.currentWindow = remote.getCurrentWindow()
    this.totalBytes = 0
		this.completedBytes = 0
    this.downloadItems = new Set()
    this.actions = require('../reducers/fetch-parameters/fetch-parameters.reducer').FetchParametersActions

    const resistanceParamsFolder = this.getResistanceParamsFolder()

    // TODO: fix me
    if (!fs.existsSync(resistanceParamsFolder)) {
      fs.mkdirSync(resistanceParamsFolder)
    }

    const downloadPromises = sproutFiles.map(sproutFile => this::downloadSproutKey(sproutFile.name))
    await Promise.all(downloadPromises)

    // All the sprout keys downloaded, calculating checksums and quick hashes
    os.dispatchAction(this.actions.status(t(`Calculating checksums...`)))

    for (let index = 0; index < sproutFiles.length; index += 1) {
      const fileName = sproutFiles[index].name
      const filePath = path.join(resistanceParamsFolder, fileName)

      // TODO: fix me
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      /* eslint-disable no-await-in-loop */
      await this::verifyChecksum(fileName, sproutFiles[index].checksum)
      await this::saveQuickFileHash(fileName)
      /* eslint-enable no-await-in-loop */
    }

  }

}

function getDownloadDoneCallback(state, downloadItem, resolve, reject) {
  const callback = () => {
    this.currentWindow.setProgressBar(-1)
    this.downloadItems.delete(downloadItem)

    switch(state) {
      case 'cancelled':
        reject(new Error(t(`The download of {{fileName}} has been cancelled`, { fileName })))
      break
      case 'interrupted':
        reject(new Error(t(`The download of {{fileName}} was interruped`, { fileName })))
      break
      case 'completed':
        resolve()
      break
      default:
        console.error(`The download of ${fileName} finished with an unknown state ${state}`)
      reject(new Error(t(`The download of {{fileName}} has failed, check the log for details`, { fileName })))
    }
  }

  return callback
}

function getDownloadListener(fileName: string, resolve: func, reject: func) {
  const listener = (e, downloadItem) => {
    this.downloadItems.add(downloadItem)
    this.totalBytes += downloadItem.getTotalBytes()

    const savePath = path.join(this.getResistanceParamsFolder(), fileName)
    downloadItem.setSavePath(savePath)

    downloadItem.on('updated', () => this::downloadUpdatedCallback())

    downloadItem.on('done', (event, state) => (
      this::getDownloadDoneCallback(state, downloadItem, resolve, reject)
    ))
  }

  return listener
}

function downloadUpdatedCallback() {
  const receivedBytes = [...this.downloadItems].reduce((bytesCounter, item) => (
    bytesCounter + item.getReceivedBytes()
  ), this.completedBytes)

  this.currentWindow.setProgressBar(() => receivedBytes / this.totalBytes)
  os.dispatchAction(this.actions.downloadProgress(receivedBytes, this.totalBytes))
}

function downloadSproutKey(fileName) {
  const downloadPromise = new Promise((resolve, reject) => {
    const listener = this::getDownloadListener(fileName, resolve, reject)

    const { webContents } = this.currentWindow

    webContents.session.on('will-download', listener)
    webContents.downloadURL(`${sproutUrl}/${fileName}`)
  })

  return downloadPromise
}

/**
 * Private method. Calculates and compares downloaded file checksum
 *
 * @memberof FetchParametersService
 * @returns {Promise}
 */
function verifyChecksum(fileName, checksum) {
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
 * Private method. Saves a downloaded file quick hash to the application config.
 * Later we use the hash to verify Resistance parameters presence.
 *
 * @memberof FetchParametersService
 */
async function saveQuickFileHash(fileName: string) {
  const quickHashes = config.get(quickHashesConfigKey, {})
  quickHashes[fileName] = await this.calculateQuickHash(fileName)
  config.set(quickHashesConfigKey, quickHashes)
}

/**
 * Private method. Creates a downloaded file hash based on its size, creation and modification dates.
 * This is faster than calculating a proper checksum.
 *
 * @memberof FetchParametersService
 * @returns {Promise}
 */
function calculateQuickHash(fileName: string) {
  const filePath = path.join(this.getResistanceParamsFolder(), fileName)

  const calcFromStats = stats => {
    const data = `${fileName};${stats.size};${stats.ctime.toISOString()};${stats.mtime.toISOString()}`
    return crypto.createHash('sha512').update(data).digest("hex")
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

/**
 * Private method. Iterates sprout files with a verifier async function.
 *
 * @returns boolean
 * @memberof FetchParametersService
 */
async function verifySproutFiles(verifier: (fileName, index) => boolean): boolean {
  for (let index = 0; index < sproutFiles.length; index += 1) {
    const fileName = sproutFiles[index].name
    let isVerified = false

    try {
      /* eslint-disable-next-line no-await-in-loop */
      isVerified = await verifier(fileName, index)
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
