// @flow
import { of, from, merge } from 'rxjs'
import { switchMap, map } from 'rxjs/operators'
import { ofType } from 'redux-observable'

import { translate } from '~/i18next.config'
import { FetchParametersService } from '~/service/fetch-parameters-service'
import { FetchParametersActions } from '~/reducers/fetch-parameters/fetch-parameters.reducer'


const t = translate('other')
const fetchParameters = new FetchParametersService()

const fetchEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(FetchParametersActions.fetch),
  switchMap(() => (
    of(
      of(FetchParametersActions.status(t(`Calculating Resistance parameter files checksums`))),
      from(fetchParameters.checkPresenceWithoutQuickHashes()),
    )
  )),
  switchMap(isPresenceConfirmed => {
    if (isPresenceConfirmed) {
      return of(FetchParametersActions.downloadComplete())
    }

    const fetchObservable = from(fetchParameters.fetch()).pipe(
      switchMap(),
      catchError(err => of(FetchParametersActions.downloadFailed(err.message)))
    )

    return fetchObservable
  })
)

export const ResDexEpic = (action$, state$) => merge(
  fetchEpic(action$, state$),
)
