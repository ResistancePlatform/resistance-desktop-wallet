// @flow
import { map, tap } from 'rxjs/operators';
import { merge } from 'rxjs';
import { ofType } from 'redux-observable';

import { LoggerService, ConsoleTheme } from '../../../service/logger-service';
import { TorService } from '../../../service/tor-service';
import { SettingsActions } from './settings.reducer';

const epicInstanceName = 'SettingsEpics';

const logger = new LoggerService();
const config = require('electron').remote.require('electron-settings');

const torService = new TorService();

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
        // torService.start()
      } else {
        torService.stop();
      }
    }),
    map(() => SettingsActions.empty())
  );

export const SettingsEpics = (action$, state$) =>
  merge(toggleEnableTorEpic(action$, state$));
