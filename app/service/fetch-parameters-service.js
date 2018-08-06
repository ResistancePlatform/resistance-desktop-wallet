// @flow
import * as fs from 'fs';
import path from 'path'

import { app, dialog } from 'electron'
import { download } from 'electron-dl'

const ProgressBar = require('electron-progressbar');


const paramsFolderName = 'ZcashParams'

const sproutUrl = `https://z.cash/downloads`
const sproutFiles = [
  { name: 'sprout-proving.key', checkSum: "8bc20a7f013b2b58970cddd2e7ea028975c88ae7ceb9259a5344a16bc2c0eef7" },
  { name: 'sprout-verifying.key', checkSum: "4bd498dae0aacfd8e98dc306338d017d9c08dd0918ead18172bd0aec2fc5df82" }
]

// Shorter files for testing purposes
// const sproutUrl = 'https://www.sample-videos.com/audio/mp3'
// const sproutFiles = [
//   { name: 'crowd-cheering.mp3', checkSum: "8bc20a7f013b2b58970cddd2e7ea028975c88ae7ceb9259a5344a16bc2c0eef7" },
//   { name: 'wave.mp3', checkSum: "4bd498dae0aacfd8e98dc306338d017d9c08dd0918ead18172bd0aec2fc5df82" }
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
   * Returns true if Resistance parameters are present
   *
	 * @memberof FetchParametersService
	 * @returns {boolean}
	 */
  checkPresence() {
    const resistanceParamsFolder = this.getResistanceParamsFolder()

    if (!fs.existsSync(resistanceParamsFolder)) {
      return false
    }
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
        await this.createDownloadPromise(fileName, index) // eslint-disable-line no-await-in-loop
      } catch(err) {
        dialog.showErrorBox(`Unable to fetch Resistance parameters`, `Error message: ${err}`)
        app.quit()
      }

      this.progressBar.setCompleted()
    }
  }

  getResistanceParamsFolder(): string {
    return path.join(app.getPath('appData'), paramsFolderName)
  }

  createProgressBar(): ProgressBar {
    const progressBar = new ProgressBar({
      indeterminate: false,

      text: `Fetching Resistance parameters...`,
      detail: `This will take awhile, but it's just a one time operation :)`,
      browserWindow: {
        parent: this.parentWindow
      }
    })
    return progressBar
  }

  createDownloadPromise(fileName, index) {
    let totalBytes

    const onProgress = progress => {
      const rate = Math.round(progress * 100)
      const totalMb = (totalBytes / 1024 / 1024).toFixed(2)
      const receivedMb = (progress  * totalMb).toFixed(2)
      this.progressBar.value = rate
      this.progressBar.detail = `Downloading ${fileName}, received ${receivedMb}MB out of ${totalMb}MB (${rate}%)...`
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
}
