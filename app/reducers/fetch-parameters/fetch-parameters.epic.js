// @flow
import { remote } from 'electron'
import { Observable, merge } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { translate } from '~/i18next.config'
import { getStore } from '~/store/configureStore'
import { SettingsActions } from '~/reducers/settings/settings.reducer'
import { FetchParametersService } from '~/service/fetch-parameters-service'
import { FetchParametersActions } from './fetch-parameters.reducer'


const t = translate('other')
const fetchParameters = new FetchParametersService()


const fetchEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(FetchParametersActions.fetch),
  map(() => {
    fetchParameters.bindRendererHandlersAndFetch(getStore().dispatch, FetchParametersActions)
    return FetchParametersActions.empty()
  })
)

const downloadCompleteEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(FetchParametersActions.downloadComplete),
  map(() => (
    state$.value.getStarted.isInProgress ? FetchParametersActions.empty() : SettingsActions.kickOffChildProcesses()
  ))
)

const downloadFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(FetchParametersActions.downloadFailed),
  switchMap(() => {
    const title = t(`Resistance parameters download failed`)
    const message = t(`Check your network connection and hit Retry`)

    const confirmObservable = Observable.create(observer => {
      const confirmOptions = {
        okText: t(`Retry`),
        cancelText: t(`Quit app`),
        onOk: () => {
          observer.next(FetchParametersActions.fetch())
          observer.complete()
        },
        onCancel: () => {
          remote.getCurrentWindow().close()
          observer.next(FetchParametersActions.empty())
          observer.complete()
        }
      }

      toastr.confirm(`${title}. ${message}`, confirmOptions)
    })

    return confirmObservable
  })
)

export const FetchParametersEpic = (action$, state$) => merge(
  fetchEpic(action$, state$),
  downloadCompleteEpic(action$, state$),
  downloadFailedEpic(action$, state$),
)
