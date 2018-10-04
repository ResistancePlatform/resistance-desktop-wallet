// @flow
import { of, from, concat, merge } from 'rxjs'
import { switchMap, catchError } from 'rxjs/operators'
import { ofType } from 'redux-observable'

import { translate } from '~/i18next.config'
import { FetchParametersService } from '~/service/fetch-parameters-service'
import { FetchParametersActions } from '~/reducers/fetch-parameters/fetch-parameters.reducer'


const t = translate('other')
const fetchParameters = new FetchParametersService()

const fetchEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(FetchParametersActions.fetch),
  switchMap(() => {
    const checkPresenceObservable = from(fetchParameters.checkPresenceWithoutQuickHashes()).pipe(
      switchMap(isPresenceConfirmed => {
        if (isPresenceConfirmed) {
          console.error("Presence confirmed LOL")
          return of(FetchParametersActions.downloadComplete())
        }
        console.error("Presence not confirmed")

        return from(fetchParameters.fetch()).pipe(
          switchMap(() => of(FetchParametersActions.downloadComplete())),
          catchError(err => of(FetchParametersActions.downloadFailed(err.message)))
        )

      })
    )

    return concat(
      of(FetchParametersActions.status(t(`Calculating Resistance parameter files checksums`))),
      checkPresenceObservable
    )
  })
)

export const FetchParametersEpic = (action$, state$) => merge(
)
