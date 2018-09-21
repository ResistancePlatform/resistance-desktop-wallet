import { take, filter, switchMap } from 'rxjs/operators'
import { race } from 'rxjs'
import { Action } from '~/state/reducers/types'
import { ActionsObservable, ofType } from 'redux-observable'

import { SettingsActions } from '~/state/reducers/settings/settings.reducer'

function getStartLocalNodeObservable(onSuccess: Observable, onFailure: Observable, action$: ActionsObservable<Action>) {
  const processName: string = 'NODE'

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
  getStartLocalNodeObservable
}
