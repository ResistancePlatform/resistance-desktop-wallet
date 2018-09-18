// @flow
import { of, concat, merge } from 'rxjs'
import { catchError, delay, map, switchMap } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'

import { i18n } from '~/i18n/i18next.config'
import { AUTH } from '~/constants/auth'
import { RpcService } from '~/service/rpc-service'
import { AuthActions } from './auth.reducer'
import { RoundedFormActions } from '../rounded-form/rounded-form.reducer'

const t = i18n.getFixedT(null, 'other')
const rpc = new RpcService()

const submitPasswordEpic = (action$: ActionsObservable<Action>, state$) => action$.pipe(
	ofType(AuthActions.submitPassword),
  switchMap(() => {
    const loginForm = state$.value.roundedForm.authLogin

    const observable = rpc.sendWalletPassword(loginForm.fields.password, AUTH.sessionTimeoutSeconds).pipe(
      switchMap(() => {
        const loginAfterTimeout = of(AuthActions.ensureLogin(t(`Your session has expired.`))).pipe(
          delay((AUTH.sessionTimeoutSeconds - 2) * 1000)
        )

        return concat(
          of(AuthActions.loginSucceeded()),
          of(RoundedFormActions.clear('authLogin')),
          loginAfterTimeout,
        )
      }),
      catchError(err => of(AuthActions.loginFailed(err.message)))
    )
    return observable
  })
)

const loginFailedEpic = (action$: ActionsObservable<Action>) => action$.pipe(
	ofType(AuthActions.loginFailed),
  map(action => {
    toastr.error(t(`Login failed`), action.payload.errorMessage)
    return AuthActions.empty()
  })
)

export const AuthEpic = (action$, state$) => merge(
  submitPasswordEpic(action$, state$),
  loginFailedEpic(action$, state$)
)
