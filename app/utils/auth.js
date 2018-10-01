import { take, mergeMap } from 'rxjs/operators'
import { of, concat } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'

import { AuthActions } from '~/reducers/auth/auth.reducer'


function getEnsureLoginObservable(reason: string | null, next: Observable, action$: ActionsObservable<Action>) {
  const loginSucceeded: Observable = action$.pipe(
    ofType(AuthActions.loginSucceeded),
    take(1),
    mergeMap(() => next)
  )

  return concat(of(AuthActions.ensureLogin(reason)), loginSucceeded)
}

export {
  getEnsureLoginObservable
}
