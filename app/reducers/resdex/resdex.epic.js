// @flow
import { merge } from 'rxjs'
import { map } from 'rxjs/operators'
import { ofType } from 'redux-observable'

import { ResDexRpcService } from '~/service/resdex/rpc'
import { ResDexActions } from '~/reducers/resdex/resdex.reducer'

const rpc = new ResDexRpcService()

const login  = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(ResDexActions.login),
  map(action => {
    const loginForm = state$.value.roundedForm.resDexLogin
    return ResDexActions.empty()
  })
)


export const ResDexEpic = (action$, state$) => merge(
  login(action$, state$),
)
