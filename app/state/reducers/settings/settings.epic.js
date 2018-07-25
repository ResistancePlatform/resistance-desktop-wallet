// @flow
import { map, tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { ofType } from 'redux-observable';

import { LoggerService, ConsoleTheme } from '../../../service/logger-service';
import { MinerService } from '../../../service/miner-service';
import { TorService } from '../../../service/tor-service';
import { SettingsActions } from './settings.reducer';

const epicInstanceName = 'SettingsEpics';

const logger = new LoggerService();
const config = require('electron').remote.require('electron-settings');

const minerService = new MinerService();
const torService = new TorService();

const toggleEnableMinerEpic = (action$: ActionsObservable<AppAction>, state$) =>
  action$.pipe(
    ofType(SettingsActions.TOGGLE_ENABLE_MINER),
    tap((action: AppAction) =>
      logger.debug(
        epicInstanceName,
        `toggleEnableMinerEpic`,
        action.type,
        ConsoleTheme.testing
      )
    ),
    tap(() => {
      const settingsState = state$.value.settings;
      config.set('manageDaemon.enableMiner', settingsState.isMinerEnabled);

      if (settingsState.isMinerEnabled) {
        console.log('Starting Miner');
        minerService.start();
      } else {
        minerService.stop();
      }
    }),
    map(() => SettingsActions.empty())
  );

const toggleEnableTorEpic = (action$: ActionsObservable<AppAction>, state$) =>
  action$.pipe(
    ofType(SettingsActions.TOGGLE_ENABLE_TOR),
    tap((action: AppAction) =>
      logger.debug(
        epicInstanceName,
        `toggleEnableTorEpic`,
        action.type,
        ConsoleTheme.testing
      )
    ),
    tap(() => {
      const settingsState = state$.value.settings;
      config.set('manageDaemon.enableTor', settingsState.isTorEnabled);

      if (settingsState.isTorEnabled) {
        console.log('Starting Tor');
        torService.start();
      } else {
        torService.stop();
      }
    }),
    map(() => SettingsActions.empty())
  );

export const SettingsEpics = (action$, state$) =>
  merge(
    toggleEnableMinerEpic(action$, state$),
    toggleEnableTorEpic(action$, state$)
  );
