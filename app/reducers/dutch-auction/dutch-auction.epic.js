// @flow
import { map, switchMap, catchError } from 'rxjs/operators'
import { merge, from, of } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'
import config from 'electron-settings'
import log from 'electron-log'

import { translate } from '~/i18next.config'
import { DutchAuctionActions } from './dutch-auction.reducer'
import { RpcService } from '~/service/rpc-service'
import { DutchAuctionService } from '~/service/dutch-auction-service'
import { AddressBookService } from '~/service/address-book-service'

const t = translate('resdex')
const rpc = new RpcService()
const addressBook = new AddressBookService()
const dutchAuction = new DutchAuctionService()

const getAuctionStatus = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(DutchAuctionActions.getAuctionStatus),
  switchMap(() => {
    const observable = from(dutchAuction.getAuctionStatus()).pipe(
      switchMap(status => of(DutchAuctionActions.gotAuctionStatus(status))),
      catchError(err => {
        log.error(`Can't get auction status`, err)
        toastr.error(t(`Error getting auction status, check the log for details`))
        return of(DutchAuctionActions.getAuctionStatusFailed())
      })
    )

    return observable
  })
)

const getUserStatus = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(DutchAuctionActions.getUserStatus),
  switchMap(() => {
    const { status: auctionStatus } = state$.value.dutchAuction.status

    if (!['active', 'finished'].includes(auctionStatus) || !dutchAuction.hasCredentials()) {
      return of(DutchAuctionActions.getUserStatusFailed())
    }

    const observable = from(dutchAuction.getUserStatus()).pipe(
      switchMap(status => of(DutchAuctionActions.gotUserStatus(status))),
      catchError(err => {
        log.error(`Can't get user status`, err)
        toastr.error(t(`Error getting user status, check the log for details`))
        return of(DutchAuctionActions.getUserStatusFailed())
      })
    )

    return observable
  })
)
const generateResAddress = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(DutchAuctionActions.generateResAddress),
  switchMap(() => rpc.createNewAddress(false)),
  map(address => {
    config.set('dutchAuction.resAddress', address)
    addressBook.addAddress({
      name: t(`Dutch Auction Payout`),
      address,
    })
    return DutchAuctionActions.generateResAddressSucceeded(address)
  }),
  catchError(err => {
    log.error(`Can't create Dutch Auction payout address`, err)
    toastr.error(`Unable to create the payout address, check the log for details`)
    return of(DutchAuctionActions.generateResAddressFailed())
  }),
)

const register = (action$: ActionsObservable<any>, state$) => action$.pipe(
	ofType(DutchAuctionActions.register),
  switchMap(() => {
    const { kyc } = state$.value
    const { resAddress } = state$.value.dutchAuction

    const observable = from(dutchAuction.register({ ...kyc, resAddress }))
      .pipe(
        switchMap(credentials => {
          log.debug(`Got credentials:`, credentials)

          const { userId, accessToken } = credentials

          config.set('dutchAuction.credentials', {
            userId,
            accessToken,
          })

          dutchAuction.setCredentials(userId, accessToken)

          return of(
            DutchAuctionActions.updateCredentials(credentials),
            // Update user status immediately
            DutchAuctionActions.getUserStatus()
          )
        }),
        catchError(err => {
          log.error(`Can't register for the Dutch auction`, err, err.response, JSON.stringify(err))

          const { response } = err
          let message

          switch (response && response.state) {
            case 'D':
              toastr.error(t(`Your identity verification application was denied, please apply again.`))
              return of(DutchAuctionActions.submitKycData({tid: null}))
            case 'R':
              message = t(`Your identity verification application is under review, please try again later.`)
              break
            default:
              message = t(`Can't register for the auction, check the log for details`)
              break
          }

          toastr.error(message)
          return of(DutchAuctionActions.registrationFinished())
        })
      )

    return observable
  })
)

export const DutchAuctionEpic = (action$, state$) => merge(
	getAuctionStatus(action$, state$),
  getUserStatus(action$, state$),
  generateResAddress(action$, state$),
  register(action$, state$),
)
