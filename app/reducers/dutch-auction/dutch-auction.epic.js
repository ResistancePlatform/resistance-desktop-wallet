// @flow
import { map, switchMap, catchError } from 'rxjs/operators'
import { merge, from, of } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'
import config from 'electron-settings'
import log from 'electron-log'

import { translate } from '~/i18next.config'
import { DutchAuctionActions } from './dutch-auction.reducer'
import { LoadingPopupActions } from '~/reducers/loading-popup/loading-popup.reducer'
import { DutchAuctionService } from '~/service/dutch-auction-service'

const t = translate('resdex')
const dutchAuction = new DutchAuctionService()

const getAuctionStatus = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(DutchAuctionActions.getAuctionStatus),
  switchMap(() => {
    const observable = from(dutchAuction.getAuctionStatus()).pipe(
      switchMap(status => of(
        DutchAuctionActions.gotAuctionStatus(status),
        LoadingPopupActions.hide()
      )),
      catchError(err => {
        log.error(`Can't get auction status`, err)
        toastr.error(t(`Error getting auction status, check the log for details`))
        return of(LoadingPopupActions.hide())
      })
    )

    return merge(
      of(LoadingPopupActions.show(t(`Loading auction status`))),
      observable
    )
  })
)

const submitResAddress = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(DutchAuctionActions.submitResAddress),
  map(() => {
      const { resAddress } = state$.value.roundedForm.dutchAuctionResAddress.fields
      config.set('dutchAuction.resAddress', resAddress)
      return DutchAuctionActions.updateResAddress(resAddress)
  })
)

const submitKycData = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(DutchAuctionActions.submitKycData),
  map(action => {
    const { kyc } = action.payload
    config.set('dutchAuction.kyc', kyc)
    return DutchAuctionActions.updateKycData(kyc)
  })
)

const register = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(DutchAuctionActions.register),
  switchMap(() => {
    const { resAddress, kyc } = state$.value.dutchAuction
    const observable = from(dutchAuction.register({ ...kyc, resAddress }))

    observable.pipe(
      switchMap(response => of(
      )),
      catchError(err => {
        log.error(`Can't register for the Dutch auction`, err)
        toastr.error(t(`Can't register for the auction, check the log for details`))
        return of(DutchAuctionActions.registerFinished())
      })
    )

    return observable
  })
)

export const DutchAuctionEpic = (action$, state$) => merge(
	getAuctionStatus(action$, state$),
  submitResAddress(action$, state$),
  submitKycData(action$, state$),
  register(action$, state$),
)
