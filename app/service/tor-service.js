// @flow

/**
 * ES6 singleton
 */
let instance = null;

const { exec } = require('child_process');

const ps = require('ps-node');

const startTorString = 'tor-proxy';
const torLog = ' &> tor.log';

function getOS() {
  if (process.platform === 'darwin') {
    return 'macos';
  }
  return 'windows';
}

function getPid(proc, cb) {
  // A simple pid lookup
  let process;

  ps.lookup(
    {
      command: proc
    },
    (err, resultList) => {
      if (err) {
        throw new Error(err);
      }

      [process] = resultList;

      if (process) {
        cb(process.pid);
        console.log(
          'PID: %s, COMMAND: %s, ARGUMENTS: %s',
          process.pid,
          process.command,
          process.arguments
        );
      } else {
        cb(0);
        console.log('No such process found!');
      }
    }
  );
}

/**
 * @export
 * @class TorService
 */
export class TorService {
  /**
   * Creates an instance of TorService.
   * @memberof TorService
   */
  constructor() {
    if (!instance) {
      instance = this;
    }

    return instance;
  }

  /**
   * @memberof TorService
   * @returns {Promise<any>}
   */
  isTorProcessPresent() {
    return new Promise((resolve, reject) => {
      try {
        getPid('tor-proxy', pid => {
          resolve(Boolean(pid));
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * @memberof TorService
   * @returns {Promise<any>}
   */
  start() {
    return this.isTorProcessPresent().then(present => {
      if (!present) {
        console.log(`./bin/'${getOS()}/${startTorString}`);

        exec(
          `./bin/'${getOS()}/${startTorString}${torLog}`,
          (err, stdout, stderr) => {
            if (err) {
              // Node couldn't execute the command
              console.log(err);
              console.log(`stdout: ${stdout}`);
              console.log(`stderr: ${stderr}`);
              return;
            }

            // The *entire* stdout and stderr (buffered)
            console.log(`Tor Started Successfully`);
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
          }
        );
      }

      console.log('Tor is already running');
      return null;
    });
  }

  /**
   * @memberof TorService
   */
  stop() {}
}
