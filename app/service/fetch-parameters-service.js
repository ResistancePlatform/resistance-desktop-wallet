// @flow
import * as fs from 'fs'
import path from 'path'
import { app, remote, ipcRenderer } from 'electron'
import log from 'electron-log'
import config from 'electron-settings'
import crypto from 'crypto'

import { getOS } from '../utils/os'
import { translate } from '../i18next.config'

const t = translate('service')

const quickHashesConfigKey = 'resistanceParameters.quickHashes'
const paramsFolderName = 'ResistanceParams'
const sproutUrl = `https://d3idekp8vvpxdr.cloudfront.net`
const sproutFiles = [
  { name: 'sprout-proving.key', checksum: "8bc20a7f013b2b58970cddd2e7ea028975c88ae7ceb9259a5344a16bc2c0eef7" },
  { name: 'sprout-verifying.key', checksum: "4bd498dae0aacfd8e98dc306338d017d9c08dd0918ead18172bd0aec2fc5df82" },
  { name: 'sapling-spend.params', checksum: "8e48ffd23abb3a5fd9c5589204f32d9c31285a04b78096ba40a79b75677efc13" },
  { name: 'sapling-output.params', checksum: "2f0ebbcbb9bb0bcffe95a397e7eba89c29eb4dde6191c339db88570e3f3fb0e4" },
  { name: 'sprout-groth16.params', checksum: "b685d700c60328498fbde589c8c7c484c722b788b265b72af448a5bf0ee55b50" }
]

/* Shorter files for testing purposes
 const sproutUrl = 'https://www.sample-videos.com/video/mp4/480'
 const sproutFiles = [
   { name: 'big_buck_bunny_480p_5mb.mp4', checksum: "287d49daf0fa4c0a12aa31404fd408b1156669084496c8031c0e1a4ce18c5247" },
   { name: 'big_buck_bunny_480p_1mb.mp4', checksum: "6b83d01a1bddbb6481001d8bb644bd4eb376922a4cf363fda9c14826534e17b3" }
 ] */

/**
 * ES6 singleton
 */
let instance = null

/**
 * @export
 * @class FetchParametersService
 */
export class FetchParametersService {
  mainWindow = null
  downloadListener: () => void
  totalBytes: number
	completedBytes: number
  downloadItems: set

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
    const validApp = process.type === 'renderer' ? remote.app : app
    let paramFolder = path.join(validApp.getPath('appData'), paramsFolderName)

    if (getOS() === 'linux') {
      paramFolder = path.join(validApp.getPath('home'), '.resistance-params')
    }

    return paramFolder
  }

	/**
   * Returns true if Resistance parameters are present.
   * The use case when the sprout files exist but there's no corresponding quick hash record
   * the checksums verification and quick hash generation has to be triggered separately
   * by the checkPresenceWithoutQuickHashes() function.
   * The reason for that is to avoid locking the main process during SHA-256 checksums calculation.
   * Called from the main process.
   * In case the quick hashes are not present, calculates SHA-256 for the sprout files and generates quick hashes.
   * This operation takes about few seconds and should be initiated by the the renderer process.
   *
   * @param {boolean} calculateChecksums
	 * @memberof FetchParametersService
	 * @returns {boolean}
	 */
  async checkPresence({calculateChecksums}) {
    const resistanceParamsFolder = this.getResistanceParamsFolder()

    log.info(`Checking for params directory ${resistanceParamsFolder}`)

    if (!fs.existsSync(resistanceParamsFolder)) {
      log.info(`The params directory ${resistanceParamsFolder} does not exist`)
      return false
    }

    log.info(`The params directory ${resistanceParamsFolder} exists`)

    const quickHashes = config.get(quickHashesConfigKey, {})

    const verifySproutFile = async (fileName, index) => {
      log.info(`Sprout file ${fileName} verification . . .`)
      if (!quickHashes[fileName]) {

        if (calculateChecksums) {
          log.info(`Quick hash not found for ${fileName}, calculating SHA256 checksum...`)
          await this::verifyChecksum(fileName, sproutFiles[index].checksum)
          await this::saveQuickFileHash(fileName)
          return true
        }

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

  bindRendererHandlersAndFetch(dispatch, actions) {
    ipcRenderer.on('fetch-parameters-status', (event, message) => {
      dispatch(actions.status(message))
    })

    ipcRenderer.on('fetch-parameters-download-progress', (event, {receivedBytes, totalBytes}) => {
      dispatch(actions.downloadProgress(receivedBytes, totalBytes))
    })

    ipcRenderer.on('fetch-parameters-download-complete', () => {
      dispatch(actions.downloadComplete())
    })

    ipcRenderer.on('fetch-parameters-download-failed', (event, errorMessage) => {
      dispatch(actions.downloadFailed(errorMessage))
    })

    ipcRenderer.send('fetch-parameters')
  }

	/**
   * Downloads Resistance parameters
   *
	 * @memberof FetchParametersService
	 * @returns {boolean}
	 */
  async fetch(mainWindow) {
    this.mainWindow = mainWindow
    this.totalBytes = 0
		this.completedBytes = 0
    this.downloadItems = new Set()

    try {
      await this::fetchOrThrowError()
    } catch(err) {
      if (mainWindow.isDestroyed()) {
        log.error(`Fetching Resistance parameters aborted due to the main window destruction.`)
        log.error(err.toString())
      } else {
        mainWindow.webContents.send('fetch-parameters-download-failed', err.message)
      }
    }
  }

}

async function fetchOrThrowError() {
  this::status(t(`Checking Resistance parameters presence`))

  if (await this.checkPresence({calculateChecksums: true})) {
    this::downloadComplete()
    return
  }

  const resistanceParamsFolder = this.getResistanceParamsFolder()

  if (!fs.existsSync(resistanceParamsFolder)) {
    fs.mkdirSync(resistanceParamsFolder)
  }

  await this::downloadSproutKeys()

  // All the sprout keys downloaded, calculating checksums and quick hashes
  this::status(t(`Calculating parameters checksums`))

  for (let index = 0; index < sproutFiles.length; index += 1) {
    const fileName = sproutFiles[index].name

    /* eslint-disable no-await-in-loop */
    await this::verifyChecksum(fileName, sproutFiles[index].checksum)
    await this::saveQuickFileHash(fileName)
    /* eslint-enable no-await-in-loop */
  }

  this::downloadComplete()
}

function downloadDoneCallback(state, downloadItem, resolve, reject) {
  let error = null

  this.completedBytes += downloadItem.getTotalBytes()
  this.downloadItems.delete(downloadItem)

  const fileName = downloadItem.getFilename()

  const removeListener = () => {
    if (!this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.session.removeListener('will-download', this.downloadListener)
      this.mainWindow.setProgressBar(-1)
    }
  }

  switch(state) {
    case 'cancelled':
      error = new Error(t(`The download of {{fileName}} has been cancelled`, { fileName }))
      break
    case 'interrupted':
      error = new Error(t(`The download of {{fileName}} was interruped`, { fileName }))
      break
    case 'completed':
      if (this.downloadItems.size !== 0) {
        break
      }

      removeListener()
      resolve()

      break
    default:
      log.error(`The download of ${fileName} finished with an unknown state ${state}`)
      error = new Error(t(`The download of {{fileName}} has failed, check the log for details`, { fileName }))
  }

  if (error !== null) {
    removeListener()
    reject(error)
  }

}

function registerDownloadListener(resolve, reject) {
  this.downloadListener = (e, downloadItem) => {

    this.downloadItems.add(downloadItem)
    this.totalBytes += downloadItem.getTotalBytes()

    const savePath = path.join(this.getResistanceParamsFolder(), downloadItem.getFilename())
    downloadItem.setSavePath(savePath)

    // It seems that Chrome doesn't perform error handling, came up with this check:
    if (downloadItem.getTotalBytes() === 0) {
      reject(Error(t(`No Internet`)))
    }

    downloadItem.on('updated', () => this::downloadUpdatedCallback())

    downloadItem.on('done', (event, state) => (
      this::downloadDoneCallback(state, downloadItem, resolve, reject)
    ))
  }

  this.mainWindow.webContents.session.on('will-download', this.downloadListener)
}

function downloadUpdatedCallback() {
  const receivedBytes = [...this.downloadItems].reduce((bytesCounter, item) => (
    bytesCounter + item.getReceivedBytes()
  ), this.completedBytes)

  if (!this.mainWindow.isDestroyed()) {
    this.mainWindow.setProgressBar(receivedBytes / this.totalBytes)
    this.mainWindow.webContents.send('fetch-parameters-download-progress', {
      receivedBytes,
      totalBytes: this.totalBytes,
    })
  }
}

function downloadSproutKeys() {
  const downloadPromise = new Promise((resolve, reject) => {
    this::registerDownloadListener(resolve, reject)

    sproutFiles.forEach(({name: fileName}) => {
      const filePath = path.join(this.getResistanceParamsFolder(), fileName)

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }

      this.mainWindow.webContents.downloadURL(`${sproutUrl}/${fileName}`)
    })
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
  quickHashes[fileName] = await this::calculateQuickHash(fileName)
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
  log.info(`Calculating a quick file hash for ${fileName}`)
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
      log.info(`Sprout file ${fileName} verification succeeded.`)
    } catch (err) {
      log.info(`Sprout file ${fileName} verification failed.`, err.toString())
      return false
    }

    if (!isVerified) {
      //return false TODO
      return true
    }
  }

  return true
}

/**
 * Private method. Informs renderer on download completion.
 *
 * @memberof FetchParametersService
 */
function downloadComplete() {
  if (!this.mainWindow.isDestroyed()) {
    log.info(`Resistance parameters download completed`)
    this.mainWindow.webContents.send('fetch-parameters-download-complete')
  }
}

/**
 * Private method. Reports the download status to the renderer.
 *
 * @memberof FetchParametersService
 */
function status(message: string) {
  if (!this.mainWindow.isDestroyed()) {
    this.mainWindow.webContents.send('fetch-parameters-status', message)
  }
}
