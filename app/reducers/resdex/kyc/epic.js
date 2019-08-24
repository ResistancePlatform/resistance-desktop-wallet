// @flow
import { map, switchMap } from 'rxjs/operators'
import { of, from, merge } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import config from 'electron-settings'
import { toastr } from 'react-redux-toastr'
import { routerActions } from 'react-router-redux'

import { translate } from '~/i18next.config'
import { resDexApiFactory } from '~/service/resdex/api'
import { ResDexKycActions } from './reducer'

const t = translate('resdex')

const register = (action$: ActionsObservable<Action>) => action$.pipe(
  ofType(ResDexKycActions.register),
  switchMap(action => {
    const { tid } = action.payload
    const resDexApi = resDexApiFactory('RESDEX')

    const observable = from(resDexApi.kycRegister(tid))
    .pipe(
      switchMap(isRegistered => {
        if (isRegistered) {
          config.set('kyc.isRegistered', true)
          toastr.success(t(`Registration succeeded`))
          return of(ResDexKycActions.registrationSucceeded(), routerActions.push('/resdex'))
        }

        toastr.error(t(`Error submitting verification data to ResDEX, please make sure your Internet connection is good or check the log for details.`))
        return of(ResDexKycActions.registrationFailed())
      })
    )

    return observable
  })
)

const update = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(ResDexKycActions.update),
  map(action => {
    config.set('kyc.tid', action.payload.tid)
    config.set('kyc.email', action.payload.email)
    return ResDexKycActions.empty()
  })
)


export const ResDexKycEpic = (action$, state$) => merge(
  register(action$, state$),
	update(action$, state$),
)
