
// @flow
import { switchMap, map, catchError } from 'rxjs/operators'
import { merge, from, of } from 'rxjs'
import { ActionsObservable, ofType } from 'redux-observable'
import { toastr } from 'react-redux-toastr'
import log from 'electron-log'

import { DutchAuctionActions } from './dutch-auction.reducer'
import { DutchAuctionService } from '~/service/dutch-auction-service'

const dutchAuction = new DutchAuctionService()

const getAuctionStatus = (action$: ActionsObservable<any>) => action$.pipe(
	ofType(DutchAuctionActions.getAuctionStatus),
  switchMap(() => from(dutchAuction.getAuctionStatus())),
  map(status => DutchAuctionActions.gotAuctionStatus(status)),
  catchError(err => {
    log.error(`Can't get auction status`, err)
    toastr.error(`Error getting auction status, check the log for details`)
    return of(DutchAuctionActions.empty())
  })
)

export const DutchAuctionEpic = (action$, state$) => merge(
	getAuctionStatus(action$, state$),
)
