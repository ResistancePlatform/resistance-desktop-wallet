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
import * as fs from 'fs';
import { app, BrowserWindow } from 'electron';
import MenuBuilder from './menu';

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
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

const getOsType = () => process.platform === 'darwin' ? `macos` : `windows`;

const checkAndCreateDaemonConfig = () => {
  const osType = getOsType()
  const configFolder = (osType === `macos`) ? `${app.getPath('appData')}/Resistance` : `${app.getPath('appData')}\\Resistance`;
  const configFile = (osType === `macos`) ? `${configFolder}/resistance.conf` : `${configFolder}\\resistance.conf`;
  const fileContent = (osType === `macos`) ? `rpcuser=test123\nrpcpassword=test123` : `rpcuser=test123\r\nrpcpassword=test123`;

  console.log(`\n\nconfigFile: ${configFile}\n\n`)
  console.log(`\n\nfileContent: ${fileContent}\n\n`)

  if (!fs.existsSync(configFile)) {
    fs.mkdirSync(configFolder);
    fs.writeFileSync(configFile, fileContent, { encoding: 'utf-8' });
    console.log(`\nWrite Daemon File Successed>>>\n`);
  }
}

const checkAndCreateWalletAppFolder = () => {
  const osType = getOsType()
  const walletAppFolder = (osType === `macos`) ? `${app.getPath('appData')}/ResistanceWallet` : `${app.getPath('appData')}\\ResistanceWallet`;

  if (!fs.existsSync(walletAppFolder)) {
    fs.mkdirSync(walletAppFolder);
  }
}

checkAndCreateDaemonConfig();
checkAndCreateWalletAppFolder();

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
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    minHeight: 728,
    height: 728,
    minWidth: 1024,
    width: 1024,
    show: false,
    frame: false
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);
  mainWindow.webContents.openDevTools();

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
