import { take, filter, switchMap } from 'rxjs/operators'
import { race } from 'rxjs'
import { Action } from '~/reducers/types'
import { ActionsObservable, ofType } from 'redux-observable'

import { translate } from '~/i18next.config'
import { SettingsActions } from '~/reducers/settings/settings.reducer'


const t = translate('other')

function getChildProcessStatusName(processStatus) {
  const nameMap = {
    'RUNNING' : t(`Running`),
    'STARTING' : t(`Starting`),
    'RESTARTING' : t(`Restarting`),
    'FAILED' : t(`Failed`),
    'STOPPING' : t(`Stopping`),
    'MURDER FAILED' : t(`Murder failed`),
    'NOT RUNNING' : t(`Not running`)
  }
  return nameMap[processStatus] || t(`Unknown`)
}

function getChildProcessObservable({processName, onSuccess, onFailure, action$}) {
  const observable = race(
    action$.pipe(
      ofType(SettingsActions.childProcessStarted),
      filter(action => action.payload.processName === processName),
      take(1),
      switchMap(() => onSuccess)
    ),
    action$.pipe(
      ofType(SettingsActions.childProcessFailed),
      filter(action => action.payload.processName === processName),
      take(1),
      switchMap(() => onFailure)
    )
  )

  return observable
}

export {
  getChildProcessStatusName,
  getChildProcessObservable,
}
