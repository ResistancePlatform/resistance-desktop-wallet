// @flow
import { of, merge } from 'rxjs'
import { catchError, map, switchMap } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { AUTH } from '~/constants'
import { RpcService } from '~/service/rpc-service'
import { AuthActions } from './auth.reducer'
import { RoundedFormActions } from '../rounded-form/rounded-form.reducer'

const rpc= new RpcService()

const submitPasswordEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(AuthActions.submitPassword),
  switchMap(() => {
    const loginForm = state$.value.roundedForm.authLogin
    const observable = rpc.sendWalletPassword(loginForm.fields.password, AUTH.sessionTimeoutSeconds).pipe(
      switchMap(() => of(RoundedFormActions.clear('authLogin'), AuthActions.loginSucceeded())),
      catchError(err => of(AuthActions.loginFailed(err.message)))
    )
    return observable
  })
)

const loginFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(AuthActions.loginFailed),
  map(action => {
    toastr.error(`Login failed`, action.payload.errorMessage)
    return AuthActions.empty()
  })
)

export const AuthEpic = (action$, state$) => merge(
  submitPasswordEpic(action$, state$),
  loginFailedEpic(action$, state$)
)
