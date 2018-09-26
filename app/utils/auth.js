import * as Joi from 'joi'
import { take, mergeMap } from 'rxjs/operators'
import { of, concat } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'

import { translate } from '~/i18next.config'
import { AuthActions } from '~/reducers/auth/auth.reducer'

const t = translate('auth')

function getEnsureLoginObservable(reason: string | null, next: Observable, action$: ActionsObservable<Action>) {
  const loginSucceeded: Observable = action$.pipe(
    ofType(AuthActions.loginSucceeded),
    take(1),
    mergeMap(() => next)
  )

  return concat(of(AuthActions.ensureLogin(reason)), loginSucceeded)
}

function getPasswordValidationSchema() {
  const schema = (
    Joi.string().required()
    .regex(/^[a-zA-Z0-9]{8,30}$/)
    .error(() => t(`should contain Latin letters, numbers and special characters`))
    .label(t(`Password`))
  )

  return schema
}

export {
  getEnsureLoginObservable,
  getPasswordValidationSchema,
}
