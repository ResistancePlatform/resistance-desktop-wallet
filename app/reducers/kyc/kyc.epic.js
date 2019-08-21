// @flow
import { map } from 'rxjs/operators'
import { merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import config from 'electron-settings'

import { KycActions } from './kyc.reducer'

const update = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(KycActions.update),
  map(action => {
    config.set('kyc', action.payload)
    return KycActions.empty()
  })
)


export const KycEpic = (action$, state$) => merge(
	update(action$, state$),
)
