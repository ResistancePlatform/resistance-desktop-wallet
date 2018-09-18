/* eslint global-require: 0, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import * as fs from 'fs'
import path from 'path'
import { app, BrowserWindow } from 'electron'
import { i18n } from './i18n/i18next.config'
import config from 'electron-settings'

import { OSService } from './service/os-service'
import { ResistanceService } from './service/resistance-service'
import { FetchParametersService } from './service/fetch-parameters-service'
import MenuBuilder from './menu'


const osService = new OSService()
const fetchParamsService = new FetchParametersService()
const resistanceService = new ResistanceService()

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
  const p = path.join(__dirname, '..', 'app', 'node_modules')
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

const checkAndCreateWalletAppFolder = () => {
  const walletAppFolder = path.join(app.getPath('appData'), 'ResistanceWallet')

  if (!fs.existsSync(walletAppFolder)) {
    fs.mkdirSync(walletAppFolder);
  }
}


// Propagate Resistance node config for the RPC service
global.resistanceNodeConfig = resistanceService.checkAndCreateConfig()

checkAndCreateWalletAppFolder()

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  app.on('before-quit', () => {
    console.log(`Killing all child processes...`)
    osService.stopChildProcesses()
    console.log(`Done`)
  })

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions()
  }

  i18n.on('loaded', () => {
    i18n.changeLanguage(config.get('language', 'en'))
    i18n.off('loaded')
  });

  i18n.on('languageChanged', () => {
    // menuFactoryService.buildMenu(app, win, i18n);
    console.log('Not implemented')
  })

  mainWindow = new BrowserWindow({
    minHeight: 728,
    height: 728,
    minWidth: 1024,
    width: 1024,
    show: false,
    frame: false,
    backgroundColor: '#1d2440',
  });

  if (!await fetchParamsService.checkPresence()) {
    await fetchParamsService.fetch(mainWindow)
  }

  mainWindow.loadURL(`file://${__dirname}/app.html`)

  // Uncomment for debugging in prod mode
  // mainWindow.webContents.openDevTools()

  // Showing the window if DOM finished loading and the content has been rendered

  let isReadyToShow = false
  let isDomFinishedLoading = false

  const showMainWindow = () => {
      mainWindow.show()
      mainWindow.focus()
  }

  mainWindow.once('ready-to-show', () => {
    isReadyToShow = true
    if (isDomFinishedLoading) {
      showMainWindow()
    }
  })

  mainWindow.webContents.on('did-finish-load', () => {
    isDomFinishedLoading = true
    if (isReadyToShow) {
      showMainWindow()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
